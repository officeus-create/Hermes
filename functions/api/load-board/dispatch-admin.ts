import {getAuthenticatedSpecialist,jsonResponse} from "../_lib/session.mjs";
import {specialistHasInternalOwnerCapability} from "../_lib/load-board-market-posts.mjs";
import {
  CARRIER_TYPES,cleanWorkspaceId,ensureCarrierDispatchWorkspaceSchema,
  privateWorkspaceHeaders,safeWorkspaceText,workspaceSameOrigin,
} from "../_lib/carrier-dispatch-workspace.mjs";
type Context={request:Request;env:{DB?:any}};
const reply=(status:number,data:Record<string,unknown>)=>jsonResponse(status,data,privateWorkspaceHeaders);
async function owner(context:Context) {
  if(!context.env.DB)return {error:reply(503,{success:false,error:"database_not_configured"})};
  const user=await getAuthenticatedSpecialist(context.request,context.env.DB);
  if(!user)return {error:reply(401,{success:false,error:"authentication_required"})};
  if(!(await specialistHasInternalOwnerCapability(context.env.DB,user.id)))
    return {error:reply(403,{success:false,error:"internal_owner_permission_required"})};
  await ensureCarrierDispatchWorkspaceSchema(context.env.DB);
  return {user};
}
export async function onRequestGet(context:Context){
  const auth=await owner(context);if(auth.error)return auth.error;
  const rows=await context.env.DB.prepare(`
    SELECT c.id,c.company_name,c.company_type,c.state,c.load_board_access,
      e.status AS entitlement,a.status AS assignment_status,
      a.dispatcher_specialist_id,s.name AS dispatcher_name,a.business_phone
    FROM hermes_company_profiles c
    LEFT JOIN hermes_carrier_board_entitlements e ON e.company_id=c.id
    LEFT JOIN hermes_carrier_dispatch_assignments a ON a.carrier_company_id=c.id
    LEFT JOIN specialists s ON s.id=a.dispatcher_specialist_id
    WHERE c.company_type IN ('carrier','owner_operator','fleet')
    ORDER BY c.company_name LIMIT 250
  `).all();
  return reply(200,{success:true,companies:(rows.results||[]).map((c:any)=>({
    id:c.id,name:c.company_name,type:c.company_type,state:c.state,
    loadBoardAccess:Boolean(c.load_board_access),
    entitlement:c.entitlement||"not_approved",
    assignment:c.assignment_status==="active" ? {dispatcherId:c.dispatcher_specialist_id,
      name:c.dispatcher_name,phone:c.business_phone}:null,
  }))});
}
export async function onRequestPost(context:Context){
  if(!workspaceSameOrigin(context.request))return reply(403,{success:false,error:"same_origin_required"});
  const auth=await owner(context);if(auth.error)return auth.error;
  let body:Record<string,unknown>;
  try{body=await context.request.json() as Record<string,unknown>;}
  catch{return reply(400,{success:false,error:"invalid_json"});}
  const action=String(body.action||"");
  const companyId=cleanWorkspaceId(body.companyId);
  if(!companyId||!["grant","revoke","assign","unassign"].includes(action))
    return reply(400,{success:false,error:"invalid_action_or_company"});
  const db=context.env.DB;
  const company=await db.prepare("SELECT id,company_type,load_board_access FROM hermes_company_profiles WHERE id=? LIMIT 1")
    .bind(companyId).first();
  if(!company||!CARRIER_TYPES.has(String(company.company_type)))
    return reply(404,{success:false,error:"carrier_company_not_found"});
  if(action==="grant" && Number(company.load_board_access)!==1)
    return reply(409,{success:false,error:"company_load_board_disabled"});
  const now=new Date().toISOString();
  if(action==="grant"||action==="revoke"){
    await db.prepare(`
      INSERT INTO hermes_carrier_board_entitlements
      (company_id,status,reviewed_by_specialist_id,reviewed_at,note)
      VALUES(?,?,?,?,?)
      ON CONFLICT(company_id) DO UPDATE SET status=excluded.status,
      reviewed_by_specialist_id=excluded.reviewed_by_specialist_id,
      reviewed_at=excluded.reviewed_at,note=excluded.note
    `).bind(companyId,action==="grant"?"active":"revoked",auth.user.id,now,safeWorkspaceText(body.note,200)||null).run();
    if(action==="revoke"){
      // Revocation cuts access immediately. Historical requests remain for audit.
      await db.prepare(`
        UPDATE hermes_carrier_dispatch_assignments SET status='revoked',updated_at=?
        WHERE carrier_company_id=?
      `).bind(now,companyId).run();
    }
    return reply(200,{success:true,action,carrierCompanyId:companyId,outboundPerformed:false});
  }
  if(action==="unassign"){
    await db.prepare("UPDATE hermes_carrier_dispatch_assignments SET status='revoked',updated_at=? WHERE carrier_company_id=?")
      .bind(now,companyId).run();
    return reply(200,{success:true,action,carrierCompanyId:companyId,outboundPerformed:false});
  }
  const entitlement=await db.prepare("SELECT status FROM hermes_carrier_board_entitlements WHERE company_id=?")
    .bind(companyId).first();
  if(entitlement?.status!=="active")return reply(409,{success:false,error:"carrier_approval_required"});
  const dispatcherId=cleanWorkspaceId(body.dispatcherId);
  const phone=safeWorkspaceText(body.businessPhone,32);
  if(!dispatcherId || !/^\+?[0-9\s()\-]{10,30}$/.test(phone) || phone.replace(/\D/g,"").length<10)
    return reply(400,{success:false,error:"verified_dispatcher_and_business_phone_required"});
  const dispatcher=await db.prepare("SELECT id,role,name FROM specialists WHERE id=? LIMIT 1").bind(dispatcherId).first();
  // An internal owner must explicitly verify the identity and business contact before assignment.
  if(!dispatcher||body.identityVerified!==true||body.businessPhoneVerified!==true)
    return reply(400,{success:false,error:"dispatcher_identity_and_phone_verification_required"});
  await db.prepare(`
    INSERT INTO hermes_carrier_dispatch_assignments
    (carrier_company_id,dispatcher_specialist_id,business_phone,status,assigned_by_specialist_id,assigned_at,updated_at)
    VALUES(?,?,?,'active',?,?,?)
    ON CONFLICT(carrier_company_id) DO UPDATE SET
    dispatcher_specialist_id=excluded.dispatcher_specialist_id,
    business_phone=excluded.business_phone,status='active',
    assigned_by_specialist_id=excluded.assigned_by_specialist_id,
    assigned_at=excluded.assigned_at,updated_at=excluded.updated_at
  `).bind(companyId,dispatcherId,phone,auth.user.id,now,now).run();
  await db.prepare(`
    UPDATE hermes_carrier_dispatch_interests
    SET dispatcher_specialist_id=?,updated_at=?
    WHERE carrier_company_id=? AND status IN ('requested','seen','reviewing')
  `).bind(dispatcherId,now,companyId).run();
  return reply(200,{success:true,action,carrierCompanyId:companyId,dispatcherId,
    phoneVerified:true,externallyContacted:false});
}
