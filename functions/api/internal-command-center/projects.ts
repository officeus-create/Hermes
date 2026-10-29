import { jsonResponse } from "../_lib/session.mjs";
import { requireInternalOwner } from "../_lib/internal-ai.mjs";
import { ensureCommandCenterSchema, reconcileWorkItems } from "../_lib/internal-command-center.mjs";
import { commandCenterProjectPortfolio, validateCommandCenterProjects } from "../_lib/command-center-projects.mjs";
import { ensureOwnerProjectSchema, normalizeOwnerProjectFields, publicOwnerProject, OWNER_PROJECT_SCOPE } from "../_lib/command-center-owner-projects.mjs";

type Env = { DB?: any };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const sameOriginMutation = (request:Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site" && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);
const parseOffset=(request:Request)=>{
  const text=new URL(request.url).searchParams.get("offset")||"0";
  return /^\d{1,6}$/.test(text)&&Number(text)<=100000?Number(text):null;
};

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  const canonical = commandCenterProjectPortfolio();
  if (validateCommandCenterProjects(canonical).length) return jsonResponse(503, { success:false,error:"project_registry_invalid" },headers);
  await ensureOwnerProjectSchema(env.DB);
  await ensureCommandCenterSchema(env.DB);
  await reconcileWorkItems(env.DB);
  const offset=parseOffset(request);
  if(offset===null)return jsonResponse(400,{success:false,error:"invalid_offset"},headers);
  const result=await env.DB.prepare("SELECT * FROM hermes_owner_projects WHERE organization_scope=? ORDER BY created_at DESC,id DESC LIMIT 101 OFFSET ?").bind(OWNER_PROJECT_SCOPE,offset).all();
  const rows=result.results||[];
  const summaryRows=await env.DB.prepare(`SELECT project_id, COUNT(*) AS total,
    SUM(CASE WHEN status NOT IN ('done','cancelled') THEN 1 ELSE 0 END) AS open,
    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
    SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked
    FROM hermes_owner_work_items WHERE organization_scope=? AND project_id IS NOT NULL GROUP BY project_id`)
    .bind(OWNER_PROJECT_SCOPE).all();
  const summaries=new Map((summaryRows.results||[]).map((row:any)=>[String(row.project_id),{
    total:Number(row.total||0),open:Number(row.open||0),done:Number(row.done||0),blocked:Number(row.blocked||0),
  }]));
  const summaryFor=(id:string)=>summaries.get(id)||{total:0,open:0,done:0,blocked:0};
  return jsonResponse(200, {
    success:true,
    registry_owner:"hermes-business-command-center",
    source_class:"CANONICAL_SNAPSHOT_PLUS_OWNER_D1",
    checked_at:"2026-10-28T15:30:00+02:00",
    progress_method:"completed milestones divided by total declared milestones; owner-created projects use UNKNOWN",
    work_items_method:"live owner D1 status counts; separate from project milestone progress",
    eta_policy:"ETA is UNKNOWN until deterministic or historical duration evidence exists.",
    projects:[...(offset===0?canonical.map(project=>({...project,work_items_summary:summaryFor(project.id)})):[]),
      ...rows.slice(0,100).map((row:any)=>({...publicOwnerProject(row),work_items_summary:summaryFor(String(row.id))}))],
    next_offset:rows.length>100?offset+100:null,
  },headers);
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"csrf_origin_mismatch"},headers);
  const owner=await requireInternalOwner(request,env);if(owner.response)return owner.response;
  await ensureOwnerProjectSchema(env.DB);
  let payload:any;try{payload=await request.json()}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers)}
  const fields=normalizeOwnerProjectFields(payload);
  if(!fields)return jsonResponse(400,{success:false,error:"invalid_project_fields"},headers);
  const now=new Date().toISOString();
  const id="hcpr_"+crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO hermes_owner_projects (id,organization_scope,title,department,purpose,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,'planned',?,?,?)`)
    .bind(id,OWNER_PROJECT_SCOPE,fields.title,fields.department,fields.purpose,String(owner.specialist.id),now,now).run();
  const row=await env.DB.prepare("SELECT * FROM hermes_owner_projects WHERE id=? AND organization_scope=?").bind(id,OWNER_PROJECT_SCOPE).first();
  return jsonResponse(201,{success:true,project:publicOwnerProject(row)},headers);
}
