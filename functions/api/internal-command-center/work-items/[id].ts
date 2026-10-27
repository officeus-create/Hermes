import { jsonResponse } from "../../_lib/session.mjs";
import { ensureInternalAiSchema, INTERNAL_AI_ORGANIZATION_SCOPE, newTaskId, normalizePrompt, nowIso, publicTask, requireInternalOwner } from "../../_lib/internal-ai.mjs";
import { ensureCommandCenterSchema, publicWorkItem, reconcileWorkItems, workItemPrompt } from "../../_lib/internal-command-center.mjs";
type Env={DB?:any};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};
const sameOriginMutation=(request:Request)=>request.headers.get("Sec-Fetch-Site")!=="cross-site"&&(!request.headers.get("Origin")||request.headers.get("Origin")===new URL(request.url).origin);
const safeReason=(value:unknown)=>String(value||"").replace(/\u0000/g,"").trim().slice(0,1000);

async function getItem(db:any,id:string){
  return db.prepare(`SELECT w.*, t.status AS linked_task_status, t.updated_at AS linked_task_updated_at,
    t.pr_url AS linked_task_pr_url, t.output_summary AS linked_task_output_summary
    FROM hermes_owner_work_items w LEFT JOIN hermes_internal_ai_tasks t
    ON t.id=w.linked_task_id AND t.organization_scope=w.organization_scope
    WHERE w.id=? AND w.organization_scope='hermes_internal' LIMIT 1`).bind(id).first();
}

export async function onRequestGet({request,env,params}:{request:Request;env:Env;params:any}){
  const owner=await requireInternalOwner(request,env); if(owner.response)return owner.response;
  await ensureCommandCenterSchema(env.DB); await reconcileWorkItems(env.DB);
  const row=await getItem(env.DB,String(params.id||""));
  if(!row)return jsonResponse(404,{success:false,error:"work_item_not_found"},headers);
  return jsonResponse(200,{success:true,work_item:publicWorkItem(row)},headers);
}

export async function onRequestPatch({request,env,params}:{request:Request;env:Env;params:any}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"csrf_origin_mismatch"},headers);
  const owner=await requireInternalOwner(request,env); if(owner.response)return owner.response;
  await ensureInternalAiSchema(env.DB); await ensureCommandCenterSchema(env.DB); await reconcileWorkItems(env.DB);
  const id=String(params.id||""); let row=await getItem(env.DB,id);
  if(!row)return jsonResponse(404,{success:false,error:"work_item_not_found"},headers);
  let payload:any; try{payload=await request.json()}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers)}
  const action=String(payload?.action||"").trim(), now=nowIso();

  if(action==="dispatch"){
    if(["done","cancelled"].includes(String(row.status)))return jsonResponse(409,{success:false,error:"work_item_terminal",work_item:publicWorkItem(row)},headers);
    const priorLinkedTaskId=row.linked_task_id?String(row.linked_task_id):null;
    const priorLinkedTaskStatus=String(row.linked_task_status||"");
    if(priorLinkedTaskId && ["queued","running","needs_approval"].includes(priorLinkedTaskStatus))return jsonResponse(409,{success:false,error:"work_item_task_active",work_item:publicWorkItem(row)},headers);
    if(priorLinkedTaskId && !["failed","cancelled"].includes(priorLinkedTaskStatus))return jsonResponse(409,{success:false,error:"work_item_linkage_unresolved",work_item:publicWorkItem(row)},headers);
    const prompt=normalizePrompt(workItemPrompt(row)); if(!prompt)return jsonResponse(400,{success:false,error:"work_item_prompt_invalid"},headers);
    const taskId=newTaskId();
    const inserted=await env.DB.prepare(`INSERT INTO hermes_internal_ai_tasks (id,organization_scope,agent_role,prompt,status,created_by,created_at,updated_at)
      SELECT ?,?,'software_engineer',?,'queued',?,?,?
      WHERE NOT EXISTS (
        SELECT 1 FROM hermes_internal_ai_tasks
        WHERE organization_scope=? AND status IN ('queued','running','needs_approval')
      )`).bind(taskId,INTERNAL_AI_ORGANIZATION_SCOPE,prompt,String(owner.specialist.id),now,now,INTERNAL_AI_ORGANIZATION_SCOPE).run();
    if(!inserted?.meta?.changes){
      const active=await env.DB.prepare("SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope=? AND status IN ('queued','running','needs_approval') ORDER BY created_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
      return jsonResponse(409,{success:false,error:"active_task_exists",active_task_id:active?.id||null,work_item:publicWorkItem(row)},headers);
    }
    const linked=await env.DB.prepare("UPDATE hermes_owner_work_items SET status='in_progress', linked_task_id=?, blocked_reason=NULL, completed_at=NULL, updated_at=? WHERE id=? AND organization_scope=? AND status IN ('planned','ready','blocked') AND (linked_task_id IS NULL OR linked_task_id=?)").bind(taskId,now,id,INTERNAL_AI_ORGANIZATION_SCOPE,priorLinkedTaskId).run();
    if(!linked?.meta?.changes){
      await env.DB.prepare("DELETE FROM hermes_internal_ai_tasks WHERE id=? AND organization_scope=? AND status='queued' AND runner_id IS NULL").bind(taskId,INTERNAL_AI_ORGANIZATION_SCOPE).run();
      row=await getItem(env.DB,id);
      return jsonResponse(409,{success:false,error:"work_item_dispatch_link_conflict",work_item:publicWorkItem(row)},headers);
    }
    row=await getItem(env.DB,id);
    const task=await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id=? AND organization_scope=?").bind(taskId,INTERNAL_AI_ORGANIZATION_SCOPE).first();
    return jsonResponse(200,{success:true,state:"dispatched",work_item:publicWorkItem(row),task:publicTask(task)},headers);
  }

  if(action==="ready"){
    if(["done","cancelled","in_progress"].includes(String(row.status)))return jsonResponse(409,{success:false,error:"work_item_state_conflict",work_item:publicWorkItem(row)},headers);
    await env.DB.prepare("UPDATE hermes_owner_work_items SET status='ready', blocked_reason=NULL, updated_at=? WHERE id=? AND organization_scope=?").bind(now,id,INTERNAL_AI_ORGANIZATION_SCOPE).run();
  } else if(action==="block"){
    if(String(row.status)==="in_progress")return jsonResponse(409,{success:false,error:"cancel_linked_ai_task_first",work_item:publicWorkItem(row)},headers);
    const reason=safeReason(payload?.reason); if(!reason)return jsonResponse(400,{success:false,error:"blocked_reason_required"},headers);
    await env.DB.prepare("UPDATE hermes_owner_work_items SET status='blocked', blocked_reason=?, updated_at=? WHERE id=? AND organization_scope=?").bind(reason,now,id,INTERNAL_AI_ORGANIZATION_SCOPE).run();
  } else if(action==="complete"){
    if(["queued","running","needs_approval"].includes(String(row.linked_task_status||"")))return jsonResponse(409,{success:false,error:"linked_ai_task_active",work_item:publicWorkItem(row)},headers);
    await env.DB.prepare("UPDATE hermes_owner_work_items SET status='done', completed_at=?, blocked_reason=NULL, updated_at=? WHERE id=? AND organization_scope=?").bind(now,now,id,INTERNAL_AI_ORGANIZATION_SCOPE).run();
  } else if(action==="cancel"){
    if(["queued","running","needs_approval"].includes(String(row.linked_task_status||"")))return jsonResponse(409,{success:false,error:"cancel_linked_ai_task_first",work_item:publicWorkItem(row)},headers);
    await env.DB.prepare("UPDATE hermes_owner_work_items SET status='cancelled', updated_at=? WHERE id=? AND organization_scope=?").bind(now,id,INTERNAL_AI_ORGANIZATION_SCOPE).run();
  } else {
    return jsonResponse(400,{success:false,error:"invalid_action"},headers);
  }
  row=await getItem(env.DB,id);
  return jsonResponse(200,{success:true,work_item:publicWorkItem(row)},headers);
}