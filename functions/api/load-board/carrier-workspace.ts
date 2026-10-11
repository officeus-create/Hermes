import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  authorizedCarrier,carrierSafeLoad,cleanWorkspaceId,eligibleLoad,
  ensureCarrierDispatchWorkspaceSchema,privateWorkspaceHeaders,
  safeWorkspaceText,verifiedAssignment,workspaceSameOrigin,
} from "../_lib/carrier-dispatch-workspace.mjs";

type Context={request:Request;env:{DB?:any}};
const respond=(status:number,payload:Record<string,unknown>)=>jsonResponse(status,payload,privateWorkspaceHeaders);

async function session(context:Context) {
  if (!context.env.DB) return {error:respond(503,{success:false,error:"database_not_configured"})};
  const specialist=await getAuthenticatedSpecialist(context.request,context.env.DB);
  if (!specialist) return {error:respond(401,{success:false,error:"authentication_required"})};
  await ensureCarrierDispatchWorkspaceSchema(context.env.DB);
  const company=await authorizedCarrier(context.env.DB,specialist);
  if (!company) return {error:respond(403,{success:false,error:"verified_carrier_access_required"})};
  return {specialist,company};
}
export async function onRequestGet(context:Context) {
  const auth=await session(context);if(auth.error)return auth.error;
  const {company}=auth;const db=context.env.DB;
  const now=new Date().toISOString();
  const rows=await db.prepare(`
    SELECT r.id,r.origin_city,r.origin_state,r.destination_city,r.destination_state,
      r.equipment,r.vehicle_count,r.pickup_window,r.rate_amount,r.rate_currency,
      r.distance_miles,r.observed_at,r.expires_at,r.visibility
    FROM hermes_load_records r JOIN hermes_load_sources s ON s.id=r.source_id
    WHERE r.status='active' AND r.record_type='load' AND r.expires_at>?
      AND r.visibility IN ('public','carrier_only')
      AND s.status='active' AND s.read_enabled=1
      AND s.redistribution_permission IN ('public','carrier_only')
    ORDER BY r.observed_at DESC LIMIT 150
  `).bind(now).all();
  const interests=await db.prepare(`
    SELECT id,load_record_id,status,carrier_message,status_note,created_at,updated_at
    FROM hermes_carrier_dispatch_interests WHERE carrier_company_id=?
    ORDER BY updated_at DESC LIMIT 100
  `).bind(company.id).all();
  const saved=await db.prepare(`
    SELECT load_record_id FROM hermes_carrier_saved_loads WHERE company_id=?
    ORDER BY saved_at DESC LIMIT 200
  `).bind(company.id).all();
  return respond(200,{success:true,company:{name:company.company_name,type:company.company_type},
    dispatcher:await verifiedAssignment(db,company.id),
    loads:(rows.results||[]).map(carrierSafeLoad),
    interests:(interests.results||[]).map((row:any)=>({
      id:row.id,loadId:row.load_record_id,status:row.status,message:row.carrier_message||null,
      statusNote:row.status_note||null,createdAt:row.created_at,updatedAt:row.updated_at,
    })),
    savedLoadIds:(saved.results||[]).map((row:any)=>row.load_record_id),
    bookingAvailable:false,publicSourceContactsExposed:false,
  });
}
export async function onRequestPost(context:Context) {
  if(!workspaceSameOrigin(context.request))return respond(403,{success:false,error:"same_origin_required"});
  const auth=await session(context);if(auth.error)return auth.error;
  const {company,specialist}=auth;const db=context.env.DB;
  let body:Record<string,unknown>;
  try{body=await context.request.json() as Record<string,unknown>;}
  catch{return respond(400,{success:false,error:"invalid_json"});}
  const action=String(body.action||"");
  const id=cleanWorkspaceId(body.loadId);
  if(!id)return respond(400,{success:false,error:"load_id_required"});
  if(!["save","unsave","interest"].includes(action))return respond(400,{success:false,error:"action_invalid"});
  const now=new Date().toISOString();
  if(action==="unsave"){
    await db.prepare("DELETE FROM hermes_carrier_saved_loads WHERE company_id=? AND load_record_id=?").bind(company.id,id).run();
    return respond(200,{success:true,saved:false});
  }
  const load=await eligibleLoad(db,id,now);
  if(!load)return respond(404,{success:false,error:"load_not_available"});
  if(action==="save"){
    await db.prepare(`
      INSERT OR IGNORE INTO hermes_carrier_saved_loads
      (company_id,load_record_id,saved_by_specialist_id,saved_at) VALUES(?,?,?,?)
    `).bind(company.id,id,specialist.id,now).run();
    return respond(200,{success:true,saved:true});
  }
  const dispatcher=await verifiedAssignment(db,company.id);
  if(!dispatcher)return respond(409,{success:false,error:"assigned_dispatcher_required"});
  const message=safeWorkspaceText(body.message,300);
  const requestId=`cdri_${crypto.randomUUID()}`;
  await db.prepare(`
    INSERT OR IGNORE INTO hermes_carrier_dispatch_interests
    (id,carrier_company_id,load_record_id,requested_by_specialist_id,
    dispatcher_specialist_id,carrier_message,status,created_at,updated_at)
    VALUES(?,?,?,?,?,?,'requested',?,?)
  `).bind(requestId,company.id,id,specialist.id,dispatcher.dispatcherId,message||null,now,now).run();
  const saved=await db.prepare(`
    SELECT id,status,dispatcher_specialist_id,created_at,updated_at
    FROM hermes_carrier_dispatch_interests
    WHERE carrier_company_id=? AND load_record_id=? LIMIT 1
  `).bind(company.id,id).first();
  return respond(202,{
    success:true,request:{id:saved.id,loadId:id,status:saved.status,createdAt:saved.created_at,updatedAt:saved.updated_at},
    queuedForDispatcher:true,humanSeen:false,bookingCreated:false,externalPartyContacted:false,
    note:"The request is in the assigned dispatcher's internal queue. This is not a booking.",
  });
}
