import {requireInternalOwner} from '../_lib/internal-ai.mjs';
import {jsonResponse} from '../_lib/session.mjs';
import {provisionKnbCompany} from '../_lib/client-company-provisioning.mjs';
const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
type Env={DB?:any};
export async function onRequestPost({request,env}:{request:Request;env:Env}) {
  const auth=await requireInternalOwner(request,env);
  if(auth.response)return auth.response;
  if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return jsonResponse(403,{success:false,error:'same_origin_required'},headers);
  if(Number(request.headers.get('Content-Length')||0)>8192)return jsonResponse(413,{success:false,error:'request_too_large'},headers);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>8192)return jsonResponse(413,{success:false,error:'request_too_large'},headers);
  let input;try{input=JSON.parse(raw);}catch{return jsonResponse(400,{success:false,error:'invalid_json'},headers);}
  if(!input||typeof input!=='object'||Array.isArray(input))return jsonResponse(400,{success:false,error:'invalid_company_facts'},headers);
  try{const r=await provisionKnbCompany(env.DB,auth.specialist.id,input);return jsonResponse(r.status,r.body,headers);}
  catch{return jsonResponse(503,{success:false,error:'company_provisioning_unavailable'},headers);}
}
export async function onRequestGet({request,env}:{request:Request;env:Env}) {
  const auth=await requireInternalOwner(request,env);if(auth.response)return auth.response;
  const id=new URL(request.url).searchParams.get('company_id');if(!id||id.length>120)return jsonResponse(400,{success:false,error:'company_id_required'},headers);
  try{const row=await env.DB.prepare('SELECT id,owner_specialist_id,company_name,company_type,city,state,country_code,website,catalog_opt_in,catalog_status,load_board_access FROM hermes_company_profiles WHERE id=?').bind(id).first();
    if(!row)return jsonResponse(404,{success:false,error:'company_not_found'},headers);
    return jsonResponse(200,{success:true,company:row},headers);
  }catch{return jsonResponse(503,{success:false,error:'canonical_company_schema_not_ready'},headers);}
}
