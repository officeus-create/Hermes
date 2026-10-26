import { jsonResponse } from "../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, ensureInternalAiSchema, nowIso, requireInternalOwner } from "../_lib/internal-ai.mjs";
import { ensureCommandCenterSchema } from "../_lib/internal-command-center.mjs";
type Env={DB?:any};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};
const sameOriginMutation=(request:Request)=>request.headers.get("Sec-Fetch-Site")!=="cross-site"&&(!request.headers.get("Origin")||request.headers.get("Origin")===new URL(request.url).origin);
const normalizeEmail=(value:unknown)=>{const v=String(value||"").trim().toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=254?v:null};

export async function onRequestGet({request,env}:{request:Request;env:Env}){
 const owner=await requireInternalOwner(request,env); if(owner.response)return owner.response;
 await ensureCommandCenterSchema(env.DB);
 const result=await env.DB.prepare(`SELECT a.specialist_id,a.active,a.created_at,a.updated_at,s.email,s.name,s.role
   FROM hermes_internal_owner_access a LEFT JOIN specialists s ON s.id=a.specialist_id
   WHERE a.capability='HERMES_INTERNAL_OWNER' ORDER BY a.active DESC, a.updated_at DESC`).all();
 return jsonResponse(200,{success:true,current_specialist_id:String(owner.specialist.id),access:(result.results||[]).map((row:any)=>({
   specialist_id:String(row.specialist_id),active:Number(row.active)===1,email:row.email||null,name:row.name||null,role:row.role||null,created_at:row.created_at||null,updated_at:row.updated_at||null
 }))},headers);
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
 if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"csrf_origin_mismatch"},headers);
 const owner=await requireInternalOwner(request,env); if(owner.response)return owner.response;
 await ensureInternalAiSchema(env.DB); await ensureCommandCenterSchema(env.DB);
 let payload:any;try{payload=await request.json()}catch{return jsonResponse(400,{success:false,error:"invalid_json"},headers)}
 const action=String(payload?.action||"").trim(),email=normalizeEmail(payload?.email);
 if(!["grant","revoke"].includes(action))return jsonResponse(400,{success:false,error:"invalid_action"},headers);
 if(!email)return jsonResponse(400,{success:false,error:"invalid_email"},headers);
 const target=await env.DB.prepare("SELECT id,email,name,role FROM specialists WHERE lower(email)=? LIMIT 1").bind(email).first();
 if(!target)return jsonResponse(404,{success:false,error:"specialist_not_found"},headers);
 const now=nowIso();
 if(action==="revoke"){
   if(String(target.id)===String(owner.specialist.id))return jsonResponse(409,{success:false,error:"cannot_revoke_current_owner"},headers);
   const activeCount=await env.DB.prepare("SELECT COUNT(*) AS c FROM hermes_internal_owner_access WHERE active=1 AND capability='HERMES_INTERNAL_OWNER'").first();
   if(Number(activeCount?.c||0)<=1)return jsonResponse(409,{success:false,error:"cannot_remove_last_owner"},headers);
   await env.DB.prepare("UPDATE hermes_internal_owner_access SET active=0,updated_at=? WHERE specialist_id=? AND capability='HERMES_INTERNAL_OWNER'").bind(now,String(target.id)).run();
 } else {
   await env.DB.prepare(`INSERT INTO hermes_internal_owner_access (specialist_id,active,capability,created_at,updated_at)
     VALUES (?,1,'HERMES_INTERNAL_OWNER',?,?)
     ON CONFLICT(specialist_id) DO UPDATE SET active=1, capability='HERMES_INTERNAL_OWNER', updated_at=excluded.updated_at`).bind(String(target.id),now,now).run();
 }
 await env.DB.prepare("INSERT INTO hermes_internal_owner_access_audit (organization_scope,actor_specialist_id,target_specialist_id,action,created_at) VALUES (?,?,?,?,?)").bind(INTERNAL_AI_ORGANIZATION_SCOPE,String(owner.specialist.id),String(target.id),action,now).run();
 return jsonResponse(200,{success:true,action,target:{specialist_id:String(target.id),email:String(target.email||email),name:target.name||null,role:target.role||null}},headers);
}