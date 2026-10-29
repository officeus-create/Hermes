import { jsonResponse } from "../../_lib/session.mjs";
import { requireInternalOwner } from "../../_lib/internal-ai.mjs";
import { ensureOwnerProjectSchema, normalizeOwnerProjectFields, normalizeOwnerProjectStatus, publicOwnerProject, OWNER_PROJECT_SCOPE } from "../../_lib/command-center-owner-projects.mjs";

type Env={DB?:any};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};
const sameOriginMutation=(request:Request)=>request.headers.get("Sec-Fetch-Site")!=="cross-site"&&(!request.headers.get("Origin")||request.headers.get("Origin")===new URL(request.url).origin);

export async function onRequestPatch({request,env,params}:{request:Request;env:Env;params:any}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"csrf_origin_mismatch"},headers);
  const owner=await requireInternalOwner(request,env);if(owner.response)return owner.response;
  await ensureOwnerProjectSchema(env.DB);
  const id=String(params.id||"");
  if(!/^hcpr_[0-9a-f-]{36}$/i.test(id))return jsonResponse(404,{success:false,error:"project_not_editable"},headers);
  const old=await env.DB.prepare("SELECT * FROM hermes_owner_projects WHERE organization_scope=? AND id=?").bind(OWNER_PROJECT_SCOPE,id).first();
  if(!old)return jsonResponse(404,{success:false,error:"project_not_found"},headers);
  let payload:any;try{payload=await request.json()}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers)}
  const fields=normalizeOwnerProjectFields(payload);
  const status=normalizeOwnerProjectStatus(payload?.status);
  if(!fields||!status)return jsonResponse(400,{success:false,error:"invalid_project_fields"},headers);
  const observed=String(payload?.updated_at||"");
  if(!observed||observed!==String(old.updated_at))return jsonResponse(409,{success:false,error:"project_changed_reload_first"},headers);
  const now=new Date().toISOString();
  const changed=await env.DB.prepare(`UPDATE hermes_owner_projects
    SET title=?,department=?,purpose=?,status=?,updated_at=?
    WHERE id=? AND organization_scope=? AND updated_at=?`)
    .bind(fields.title,fields.department,fields.purpose,status,now,id,OWNER_PROJECT_SCOPE,observed).run();
  if(!changed?.meta?.changes)return jsonResponse(409,{success:false,error:"project_changed_reload_first"},headers);
  const row=await env.DB.prepare("SELECT * FROM hermes_owner_projects WHERE organization_scope=? AND id=?").bind(OWNER_PROJECT_SCOPE,id).first();
  return jsonResponse(200,{success:true,project:publicOwnerProject(row)},headers);
}
