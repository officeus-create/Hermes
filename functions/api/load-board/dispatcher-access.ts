import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { specialistHasInternalOwnerCapability } from "../_lib/load-board-market-posts.mjs";
import {
  ensureLoadBoardInternalAccessSchema,
  internalLoadBoardCapability,
} from "../_lib/load-board-internal-access.mjs";
import { workspaceSameOrigin, safeWorkspaceText } from "../_lib/carrier-dispatch-workspace.mjs";
import { isValidEmail } from "../../../src/legacy-prototype/auth.mjs";

type Context={request:Request;env:{DB?:any}};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","Vary":"Cookie"};
const reply=(status:number,data:Record<string,unknown>)=>jsonResponse(status,data,headers);

async function requireOwner(context:Context){
  if(!context.env.DB)return {error:reply(503,{success:false,error:"database_not_configured"})};
  const specialist=await getAuthenticatedSpecialist(context.request,context.env.DB);
  if(!specialist)return {error:reply(401,{success:false,error:"authentication_required"})};
  if(!(await specialistHasInternalOwnerCapability(context.env.DB,specialist.id)))
    return {error:reply(403,{success:false,error:"internal_owner_access_required"})};
  await ensureLoadBoardInternalAccessSchema(context.env.DB);
  return {specialist};
}

export async function onRequestGet(context:Context){
  const auth=await requireOwner(context);if(auth.error)return auth.error;
  const rows=await context.env.DB.prepare(`
    SELECT d.specialist_id,s.email,s.name,d.status,d.identity_verified,d.reviewed_at,d.note
    FROM hermes_load_board_internal_dispatchers d
    JOIN specialists s ON s.id=d.specialist_id
    ORDER BY d.reviewed_at DESC LIMIT 100
  `).all();
  return reply(200,{success:true,dispatchers:(rows.results||[]).map((r:any)=>({
    specialistId:r.specialist_id,email:r.email,name:r.name,status:r.status,
    identityVerified:Number(r.identity_verified)===1,reviewedAt:r.reviewed_at,note:r.note||null,
  }))});
}

export async function onRequestPost(context:Context){
  if(!workspaceSameOrigin(context.request))return reply(403,{success:false,error:"same_origin_required"});
  const auth=await requireOwner(context);if(auth.error)return auth.error;
  let body:Record<string,unknown>;
  try{body=await context.request.json() as Record<string,unknown>;}
  catch{return reply(400,{success:false,error:"invalid_json"});}
  const email=String(body.email||"").trim().toLowerCase().slice(0,160);
  const action=String(body.action||"");
  if(!isValidEmail(email)||!["grant","revoke"].includes(action))
    return reply(400,{success:false,error:"email_or_action_invalid"});
  if(action==="grant"&&body.identityVerified!==true)
    return reply(409,{success:false,error:"dispatcher_identity_verification_required"});
  const target=await context.env.DB.prepare(
    "SELECT id,email,name FROM specialists WHERE email=? LIMIT 1"
  ).bind(email).first() as {id:string,email:string,name?:string}|null;
  if(!target)return reply(404,{success:false,error:"account_not_registered"});
  const existing=await internalLoadBoardCapability(context.env.DB,target.id);
  if(existing.owner)return reply(409,{success:false,error:"owner_does_not_need_dispatcher_entitlement"});
  const status=action==="grant"?"active":"revoked";
  const now=new Date().toISOString();
  const note=safeWorkspaceText(body.note,240)||null;
  await context.env.DB.prepare(`
    INSERT INTO hermes_load_board_internal_dispatchers
      (specialist_id,status,identity_verified,granted_by_specialist_id,reviewed_at,note)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(specialist_id) DO UPDATE SET
      status=excluded.status,
      identity_verified=excluded.identity_verified,
      granted_by_specialist_id=excluded.granted_by_specialist_id,
      reviewed_at=excluded.reviewed_at,
      note=excluded.note
  `).bind(target.id,status,action==="grant"?1:0,auth.specialist.id,now,note).run();
  return reply(200,{
    success:true,email,status,permission:"HERMES_INTERNAL_DISPATCHER",
    internalOwnerGranted:false,carrierEntitlementGranted:false,
    emailsSent:false,dispatcherNotificationsSent:false,externalContactsPerformed:false,
  });
}
