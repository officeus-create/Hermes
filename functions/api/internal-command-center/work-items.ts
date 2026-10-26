import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import {
  COMMAND_CENTER_SCOPE, ensureCommandCenterSchema, newWorkItemId, normalizePriority, normalizeWorkItemDetails,
  normalizeWorkItemSource, normalizeWorkItemTitle, normalizeWorkstream, publicWorkItem, reconcileWorkItems, commandCenterNow,
} from "../_lib/internal-command-center.mjs";
type Env = { DB?: any };
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};
const sameOriginMutation=(request:Request)=>request.headers.get("Sec-Fetch-Site")!=="cross-site"&&(!request.headers.get("Origin")||request.headers.get("Origin")===new URL(request.url).origin);

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const owner=await requireInternalOwner(request,env); if(owner.response)return owner.response;
  await ensureCommandCenterSchema(env.DB); await reconcileWorkItems(env.DB);
  const result=await env.DB.prepare(`SELECT w.*, t.status AS linked_task_status, t.updated_at AS linked_task_updated_at,
    t.pr_url AS linked_task_pr_url, t.output_summary AS linked_task_output_summary
    FROM hermes_owner_work_items w
    LEFT JOIN hermes_internal_ai_tasks t ON t.id = w.linked_task_id AND t.organization_scope = w.organization_scope
    WHERE w.organization_scope = ?
    ORDER BY CASE w.status WHEN 'in_progress' THEN 0 WHEN 'ready' THEN 1 WHEN 'planned' THEN 2 WHEN 'blocked' THEN 3 WHEN 'done' THEN 4 ELSE 5 END,
      CASE w.priority WHEN 'p0' THEN 0 WHEN 'p1' THEN 1 WHEN 'p2' THEN 2 ELSE 3 END, w.created_at DESC LIMIT 100`).bind(COMMAND_CENTER_SCOPE).all();
  return jsonResponse(200,{success:true,work_items:(result.results||[]).map(publicWorkItem)},headers);
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"csrf_origin_mismatch"},headers);
  const owner=await requireInternalOwner(request,env); if(owner.response)return owner.response;
  await ensureCommandCenterSchema(env.DB);
  let payload:any; try{payload=await request.json()}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers)}
  const workstream=normalizeWorkstream(payload?.workstream), priority=normalizePriority(payload?.priority||"p2");
  const title=normalizeWorkItemTitle(payload?.title), details=normalizeWorkItemDetails(payload?.details);
  const source=normalizeWorkItemSource(payload?.source);
  if(!workstream)return jsonResponse(400,{success:false,error:"invalid_workstream"},headers);
  if(!priority)return jsonResponse(400,{success:false,error:"invalid_priority"},headers);
  if(!title)return jsonResponse(400,{success:false,error:"invalid_title"},headers);
  if(!details)return jsonResponse(400,{success:false,error:"invalid_details"},headers);
  const id=newWorkItemId(), now=commandCenterNow();
  await env.DB.prepare(`INSERT INTO hermes_owner_work_items
    (id,organization_scope,workstream,priority,title,details,source,status,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,'planned',?,?,?)`).bind(id,COMMAND_CENTER_SCOPE,workstream,priority,title,details,source,String(owner.specialist.id),now,now).run();
  const row=await env.DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id = ? AND organization_scope = ?").bind(id,COMMAND_CENTER_SCOPE).first();
  return jsonResponse(201,{success:true,work_item:publicWorkItem(row)},headers);
}