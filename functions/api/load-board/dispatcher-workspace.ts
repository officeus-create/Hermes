import {getAuthenticatedSpecialist,jsonResponse} from "../_lib/session.mjs";
import {
  cleanWorkspaceId,ensureCarrierDispatchWorkspaceSchema,isApprovedDispatcher,
  privateWorkspaceHeaders,safeWorkspaceText,workspaceSameOrigin,
} from "../_lib/carrier-dispatch-workspace.mjs";
type Context={request:Request;env:{DB?:any}};
const reply=(status:number,data:Record<string,unknown>)=>jsonResponse(status,data,privateWorkspaceHeaders);
async function identify(context:Context){
  if(!context.env.DB)return {error:reply(503,{success:false,error:"database_not_configured"})};
  const user=await getAuthenticatedSpecialist(context.request,context.env.DB);
  if(!user)return {error:reply(401,{success:false,error:"authentication_required"})};
  if(!(await isApprovedDispatcher(context.env.DB,user)))return {error:reply(403,{success:false,error:"assigned_dispatcher_access_required"})};
  return {user};
}
export async function onRequestGet(context:Context){
  const auth=await identify(context);if(auth.error)return auth.error;
  const db=context.env.DB;
  const assignments=await db.prepare(`
    SELECT a.carrier_company_id,c.company_name,c.state,c.city
    FROM hermes_carrier_dispatch_assignments a
    JOIN hermes_carrier_board_entitlements e ON e.company_id=a.carrier_company_id AND e.status='active'
    JOIN hermes_company_profiles c ON c.id=a.carrier_company_id AND c.load_board_access=1
    WHERE a.dispatcher_specialist_id=? AND a.status='active'
    ORDER BY c.company_name LIMIT 200
  `).bind(auth.user.id).all();
  const requests=await db.prepare(`
    SELECT i.id,i.load_record_id,i.carrier_company_id,c.company_name,i.carrier_message,
      i.status,i.status_note,i.created_at,i.updated_at,
      r.origin_city,r.origin_state,r.destination_city,r.destination_state,
      r.equipment,r.vehicle_count,r.pickup_window,r.rate_amount,r.expires_at,
      r.status AS load_status
    FROM hermes_carrier_dispatch_interests i
    JOIN hermes_carrier_dispatch_assignments a
      ON a.carrier_company_id=i.carrier_company_id
      AND a.dispatcher_specialist_id=? AND a.status='active'
    JOIN hermes_carrier_board_entitlements e
      ON e.company_id=i.carrier_company_id AND e.status='active'
    JOIN hermes_company_profiles c
      ON c.id=i.carrier_company_id AND c.load_board_access=1
    LEFT JOIN hermes_load_records r ON r.id=i.load_record_id
    WHERE i.dispatcher_specialist_id=?
    ORDER BY CASE WHEN i.status IN ('requested','seen','reviewing') THEN 0 ELSE 1 END,
      i.updated_at DESC LIMIT 200
  `).bind(auth.user.id,auth.user.id).all();
  const now=new Date().toISOString();
  const assignmentRows=(assignments.results||[]).map((a:any)=>({
    carrierCompanyId:a.carrier_company_id,name:a.company_name,location:[a.city,a.state].filter(Boolean).join(", "),
  }));
  const requestRows=(requests.results||[]).map((r:any)=>({
    id:r.id,loadId:r.load_record_id,carrierCompanyId:r.carrier_company_id,
    carrierName:r.company_name,status:r.status,
    message:r.carrier_message||null,statusNote:r.status_note||null,
    origin:[r.origin_city,r.origin_state].filter(Boolean).join(", ")||"Under review",
    destination:[r.destination_city,r.destination_state].filter(Boolean).join(", ")||"Under review",
    equipment:r.equipment||null,vehicleCount:r.vehicle_count??null,
    pickupWindow:r.pickup_window||null,offeredRate:r.rate_amount??null,
    loadStillActive:r.load_status==="active"&&r.expires_at>now,
    createdAt:r.created_at,updatedAt:r.updated_at,
  }));
  const count=(status:string)=>requestRows.filter((r:any)=>r.status===status).length;
  const open=requestRows.filter((r:any)=>["requested","seen","reviewing"].includes(r.status));
  const summary={
    assignedCarriers:assignmentRows.length,totalRequests:requestRows.length,openRequests:open.length,
    requested:count("requested"),seen:count("seen"),reviewing:count("reviewing"),
    unavailable:count("unavailable"),declined:count("declined"),
    staleOpen:open.filter((r:any)=>!r.loadStillActive).length,
    activeOpen:open.filter((r:any)=>r.loadStillActive).length,
  };
  return reply(200,{success:true,assignments:assignmentRows,requests:requestRows,summary,
    automaticallyContactedSource:false,bookingCreated:false,
  });
}
export async function onRequestPost(context:Context){
  if(!workspaceSameOrigin(context.request))return reply(403,{success:false,error:"same_origin_required"});
  const auth=await identify(context);if(auth.error)return auth.error;
  let data:Record<string,unknown>;
  try{data=await context.request.json() as Record<string,unknown>;}
  catch{return reply(400,{success:false,error:"invalid_json"});}
  const id=cleanWorkspaceId(data.requestId);
  const status=String(data.status||"");
  if(!id||!["seen","reviewing","unavailable","declined"].includes(status))
    return reply(400,{success:false,error:"invalid_request_transition"});
  const db=context.env.DB;
  const request=await db.prepare(`
    SELECT i.id,i.status FROM hermes_carrier_dispatch_interests i
    JOIN hermes_carrier_dispatch_assignments a
      ON a.carrier_company_id=i.carrier_company_id AND a.status='active'
    WHERE i.id=? AND i.dispatcher_specialist_id=? AND a.dispatcher_specialist_id=? LIMIT 1
  `).bind(id,auth.user.id,auth.user.id).first();
  if(!request)return reply(404,{success:false,error:"request_not_found"});
  const transitions:Record<string,string[]>={
    requested:["seen","reviewing","unavailable","declined"],
    seen:["reviewing","unavailable","declined"],
    reviewing:["unavailable","declined"],
    unavailable:[],declined:[],
  };
  if(request.status!==status && !transitions[String(request.status)]?.includes(status))
    return reply(409,{success:false,error:"invalid_request_transition"});
  const note=safeWorkspaceText(data.note,280);
  const now=new Date().toISOString();
  const result=await db.prepare(`
    UPDATE hermes_carrier_dispatch_interests
    SET status=?,status_note=?,updated_by_specialist_id=?,updated_at=?
    WHERE id=? AND dispatcher_specialist_id=? AND status=?
      AND EXISTS (
        SELECT 1 FROM hermes_carrier_dispatch_assignments a
        JOIN hermes_carrier_board_entitlements e
          ON e.company_id=a.carrier_company_id AND e.status='active'
        JOIN hermes_company_profiles c
          ON c.id=a.carrier_company_id AND c.load_board_access=1
        WHERE a.carrier_company_id=hermes_carrier_dispatch_interests.carrier_company_id
          AND a.dispatcher_specialist_id=? AND a.status='active'
      )
  `).bind(status,note||null,auth.user.id,now,id,auth.user.id,request.status,auth.user.id).run();
  if(Number(result?.meta?.changes||0)!==1) {
    return reply(409,{success:false,error:"request_changed_or_access_revoked",sourceContacted:false,bookingCreated:false});
  }
  return reply(200,{success:true,request:{id,status},sourceContacted:false,bookingCreated:false});
}
