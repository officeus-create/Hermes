import { jsonResponse } from "../../_lib/session.mjs";
import { ensureInternalAiSchema, INTERNAL_AI_ORGANIZATION_SCOPE, newTaskId, normalizePrompt, nowIso, publicTask, requireInternalOwner } from "../../_lib/internal-ai.mjs";
import { ensureCommandCenterSchema, normalizeWorkstream, normalizePriority, normalizeWorkItemTitle, normalizeWorkItemDetails, publicWorkItem, reconcileWorkItems, workItemPrompt } from "../../_lib/internal-command-center.mjs";
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
  if(["done","cancelled"].includes(String(row.status)))return jsonResponse(409,{success:false,error:"work_item_terminal",work_item:publicWorkItem(row)},headers);

  if(action==="edit"){
    // Only unclaimed owner backlog items are editable; never rewrite an AI execution or accepted receipt.
    if(!["planned","ready","blocked"].includes(String(row.status)) || row.linked_task_id)
      return jsonResponse(409,{success:false,error:"work_item_edit_conflict",work_item:publicWorkItem(row)},headers);
    const title=normalizeWorkItemTitle(payload?.title),details=normalizeWorkItemDetails(payload?.details);
    const workstream=normalizeWorkstream(payload?.workstream),priority=normalizePriority(payload?.priority);
    const observedAt=String(payload?.updated_at||"");
    if(!title||!details||!workstream||!priority)return jsonResponse(400,{success:false,error:"invalid_work_item_fields"},headers);
    if(!observedAt||observedAt!==String(row.updated_at||""))
      return jsonResponse(409,{success:false,error:"work_item_changed_reload_first",work_item:publicWorkItem(row)},headers);
    const changed=await env.DB.prepare(`UPDATE hermes_owner_work_items
      SET title=?,details=?,workstream=?,priority=?,updated_at=?
      WHERE id=? AND organization_scope=? AND status IN ('planned','ready','blocked')
      AND linked_task_id IS NULL AND updated_at=?`)
      .bind(title,details,workstream,priority,now,id,INTERNAL_AI_ORGANIZATION_SCOPE,observedAt).run();
    if(!changed?.meta?.changes)return jsonResponse(409,{success:false,error:"work_item_edit_conflict",work_item:publicWorkItem(await getItem(env.DB,id))},headers);
    return jsonResponse(200,{success:true,work_item:publicWorkItem(await getItem(env.DB,id))},headers);
  }

  if(action==="dispatch"){
    if(["done","cancelled"].includes(String(row.status)))return jsonResponse(409,{success:false,error:"work_item_terminal",work_item:publicWorkItem(row)},headers);
    const priorLinkedTaskId=row.linked_task_id?String(row.linked_task_id):null;
    const priorLinkedTaskStatus=String(row.linked_task_status||"");
    const reviewRework=String(row.status)==="blocked"&&priorLinkedTaskStatus==="completed"&&Boolean(String(row.blocked_reason||"").trim());
    if(priorLinkedTaskId && ["queued","running","needs_approval"].includes(priorLinkedTaskStatus))return jsonResponse(409,{success:false,error:"work_item_task_active",work_item:publicWorkItem(row)},headers);
    if(priorLinkedTaskId && !["failed","cancelled"].includes(priorLinkedTaskStatus) && !reviewRework)return jsonResponse(409,{success:false,error:"work_item_linkage_unresolved",work_item:publicWorkItem(row)},headers);
    const prompt=normalizePrompt(workItemPrompt(row)); if(!prompt)return jsonResponse(400,{success:false,error:"work_item_prompt_invalid"},headers);
    const taskId=newTaskId();
    if(typeof env.DB.batch!=="function")return jsonResponse(503,{success:false,error:"atomic_dispatch_unavailable"},headers);
    const insertedStatement=env.DB.prepare(`INSERT INTO hermes_internal_ai_tasks (id,organization_scope,agent_role,prompt,status,created_by,created_at,updated_at)
      SELECT ?,?,'software_engineer',?,'queued',?,?,?
      WHERE NOT EXISTS (
        SELECT 1 FROM hermes_internal_ai_tasks
        WHERE organization_scope=? AND status IN ('queued','running','needs_approval')
      )`).bind(taskId,INTERNAL_AI_ORGANIZATION_SCOPE,prompt,String(owner.specialist.id),now,now,INTERNAL_AI_ORGANIZATION_SCOPE);
    const linkStatement=env.DB.prepare(`UPDATE hermes_owner_work_items SET status='in_progress', linked_task_id=?, acceptance_status='not_required', blocked_reason=NULL, completed_at=NULL, accepted_by=NULL, accepted_at=NULL, updated_at=?
      WHERE id=? AND organization_scope=? AND status IN ('planned','ready','blocked') AND (linked_task_id IS NULL OR linked_task_id=?)
      AND EXISTS (SELECT 1 FROM hermes_internal_ai_tasks WHERE id=? AND organization_scope=? AND status='queued' AND runner_id IS NULL)`)
      .bind(taskId,now,id,INTERNAL_AI_ORGANIZATION_SCOPE,priorLinkedTaskId,taskId,INTERNAL_AI_ORGANIZATION_SCOPE);
    const cleanupStatement=env.DB.prepare(`DELETE FROM hermes_internal_ai_tasks
      WHERE id=? AND organization_scope=? AND status='queued' AND runner_id IS NULL
      AND NOT EXISTS (SELECT 1 FROM hermes_owner_work_items WHERE organization_scope=? AND linked_task_id=?)`)
      .bind(taskId,INTERNAL_AI_ORGANIZATION_SCOPE,INTERNAL_AI_ORGANIZATION_SCOPE,taskId);
    const results=await env.DB.batch([insertedStatement,linkStatement,cleanupStatement]);
    if(!results?.[0]?.meta?.changes){
      const active=await env.DB.prepare("SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope=? AND status IN ('queued','running','needs_approval') ORDER BY created_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
      return jsonResponse(409,{success:false,error:"active_task_exists",active_task_id:active?.id||null,work_item:publicWorkItem(row)},headers);
    }
    if(!results?.[1]?.meta?.changes){
      row=await getItem(env.DB,id);
      return jsonResponse(409,{success:false,error:"work_item_dispatch_link_conflict",work_item:publicWorkItem(row)},headers);
    }
    row=await getItem(env.DB,id);
    const task=await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id=? AND organization_scope=?").bind(taskId,INTERNAL_AI_ORGANIZATION_SCOPE).first();
    return jsonResponse(200,{success:true,state:"dispatched",work_item:publicWorkItem(row),task:publicTask(task)},headers);
  }

  if(action==="ready"){
    if(["done","cancelled","in_progress"].includes(String(row.status)))return jsonResponse(409,{success:false,error:"work_item_state_conflict",work_item:publicWorkItem(row)},headers);
    if(String(row.status)==="blocked"&&String(row.linked_task_status)==="completed")return jsonResponse(409,{success:false,error:"work_item_rework_requires_dispatch",work_item:publicWorkItem(row)},headers);
    const readyResult=await env.DB.prepare(`UPDATE hermes_owner_work_items SET status='ready', blocked_reason=NULL, updated_at=? WHERE id=? AND organization_scope=?
      AND status IN ('planned','ready','blocked') AND NOT (status='blocked' AND linked_task_id IN
        (SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope=? AND status='completed'))`).bind(now,id,INTERNAL_AI_ORGANIZATION_SCOPE,INTERNAL_AI_ORGANIZATION_SCOPE).run();
    if(!readyResult?.meta?.changes)return jsonResponse(409,{success:false,error:"work_item_state_conflict",work_item:publicWorkItem(await getItem(env.DB,id))},headers);
  } else if(action==="block"){
    if(String(row.status)==="in_progress"&&String(row.acceptance_status)!=="awaiting")return jsonResponse(409,{success:false,error:"cancel_linked_ai_task_first",work_item:publicWorkItem(row)},headers);
    const reason=safeReason(payload?.reason); if(!reason)return jsonResponse(400,{success:false,error:"blocked_reason_required"},headers);
    const blockResult=await env.DB.prepare("UPDATE hermes_owner_work_items SET status='blocked', acceptance_status='not_required', blocked_reason=?, completed_at=NULL, accepted_by=NULL, accepted_at=NULL, updated_at=? WHERE id=? AND organization_scope=? AND status NOT IN ('done','cancelled')").bind(reason,now,id,INTERNAL_AI_ORGANIZATION_SCOPE).run();
    if(!blockResult?.meta?.changes)return jsonResponse(409,{success:false,error:"work_item_state_conflict",work_item:publicWorkItem(await getItem(env.DB,id))},headers);
  } else if(action==="accept"){
    if(String(row.status)!=="in_progress"||String(row.acceptance_status)!=="awaiting"||String(row.linked_task_status)!=="completed")return jsonResponse(409,{success:false,error:"work_item_not_awaiting_acceptance",work_item:publicWorkItem(row)},headers);
    const accepted=await env.DB.prepare("UPDATE hermes_owner_work_items SET status='done', acceptance_status='accepted', completed_at=?, accepted_by=?, accepted_at=?, blocked_reason=NULL, updated_at=? WHERE id=? AND organization_scope=? AND status='in_progress' AND acceptance_status='awaiting'").bind(now,String(owner.specialist.id),now,now,id,INTERNAL_AI_ORGANIZATION_SCOPE).run();
    if(!accepted?.meta?.changes)return jsonResponse(409,{success:false,error:"work_item_state_conflict",work_item:publicWorkItem(await getItem(env.DB,id))},headers);
  } else if(action==="complete"){
    if(row.linked_task_id)return jsonResponse(409,{success:false,error:"linked_ai_result_requires_acceptance",work_item:publicWorkItem(row)},headers);
    if(["queued","running","needs_approval"].includes(String(row.linked_task_status||"")))return jsonResponse(409,{success:false,error:"linked_ai_task_active",work_item:publicWorkItem(row)},headers);
    const completed=await env.DB.prepare("UPDATE hermes_owner_work_items SET status='done', acceptance_status='accepted', completed_at=?, accepted_by=?, accepted_at=?, blocked_reason=NULL, updated_at=? WHERE id=? AND organization_scope=? AND status NOT IN ('done','cancelled') AND linked_task_id IS NULL").bind(now,String(owner.specialist.id),now,now,id,INTERNAL_AI_ORGANIZATION_SCOPE).run();
    if(!completed?.meta?.changes)return jsonResponse(409,{success:false,error:"work_item_state_conflict",work_item:publicWorkItem(await getItem(env.DB,id))},headers);
  } else if(action==="cancel"){
    if(["queued","running","needs_approval"].includes(String(row.linked_task_status||"")))return jsonResponse(409,{success:false,error:"cancel_linked_ai_task_first",work_item:publicWorkItem(row)},headers);
    const cancelled=await env.DB.prepare(`UPDATE hermes_owner_work_items SET status='cancelled', acceptance_status='not_required', accepted_by=NULL, accepted_at=NULL, updated_at=?
      WHERE id=? AND organization_scope=? AND status NOT IN ('done','cancelled') AND NOT EXISTS
      (SELECT 1 FROM hermes_internal_ai_tasks WHERE id=hermes_owner_work_items.linked_task_id AND organization_scope=? AND status IN ('queued','running','needs_approval'))`)
      .bind(now,id,INTERNAL_AI_ORGANIZATION_SCOPE,INTERNAL_AI_ORGANIZATION_SCOPE).run();
    if(!cancelled?.meta?.changes)return jsonResponse(409,{success:false,error:"work_item_state_conflict",work_item:publicWorkItem(await getItem(env.DB,id))},headers);
  } else {
    return jsonResponse(400,{success:false,error:"invalid_action"},headers);
  }
  row=await getItem(env.DB,id);
  return jsonResponse(200,{success:true,work_item:publicWorkItem(row)},headers);
}
