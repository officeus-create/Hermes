import { jsonResponse } from "../../_lib/session.mjs";
import {
  academyBusinessDeliveryErrors,
  getAcademyBusinessDeliveryContext,
  normalizeAcademyBusinessDelivery,
  safeAcademyBusinessDelivery,
  validateAcademyBusinessDeliveryScope,
} from "../../_lib/academy-business-delivery.mjs";

type Env={DB?:any};
const privateHeaders={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};

const sameOriginMutation=(request:Request)=>
  request.headers.get("Sec-Fetch-Site")!=="cross-site" &&
  (!request.headers.get("Origin")||request.headers.get("Origin")===new URL(request.url).origin);

const parseBody=async(request:Request)=>{
  try{return await request.json() as Record<string,unknown>;}
  catch{return null;}
};

const errorResponse=(error:{status:number;code:string})=>
  jsonResponse(error.status,{success:false,error:error.code},privateHeaders);

async function readDelivery(db:any,id:string,ownerId:string,companyId:string){
  return db.prepare(`
    SELECT d.*, p.name AS program_name,
           c.name AS cohort_name, c.code AS cohort_code,
           x.specialist_id AS participant_specialist_id
    FROM hermes_academy_business_delivery_refs d
    JOIN hermes_academy_business_programs p
      ON p.id=d.program_id AND p.company_id=d.company_id AND p.owner_specialist_id=d.owner_specialist_id
    LEFT JOIN hermes_academy_business_cohorts c
      ON c.id=d.cohort_id AND c.program_id=d.program_id AND c.company_id=d.company_id AND c.owner_specialist_id=d.owner_specialist_id
    LEFT JOIN hermes_academy_business_participants x
      ON x.id=d.participant_id AND x.company_id=d.company_id AND x.owner_specialist_id=d.owner_specialist_id
    WHERE d.id=? AND d.owner_specialist_id=? AND d.company_id=?
    LIMIT 1
  `).bind(id,ownerId,companyId).first();
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const ctx=await getAcademyBusinessDeliveryContext(request,env);
  if(ctx.error)return errorResponse(ctx.error);
  const ownerId=String(ctx.specialist.id);
  const companyId=String(ctx.company.id);
  const includeArchived=new URL(request.url).searchParams.get("include_archived")==="1";
  const result=await env.DB.prepare(`
    SELECT d.*, p.name AS program_name,
           c.name AS cohort_name, c.code AS cohort_code,
           x.specialist_id AS participant_specialist_id
    FROM hermes_academy_business_delivery_refs d
    JOIN hermes_academy_business_programs p
      ON p.id=d.program_id AND p.company_id=d.company_id AND p.owner_specialist_id=d.owner_specialist_id
    LEFT JOIN hermes_academy_business_cohorts c
      ON c.id=d.cohort_id AND c.program_id=d.program_id AND c.company_id=d.company_id AND c.owner_specialist_id=d.owner_specialist_id
    LEFT JOIN hermes_academy_business_participants x
      ON x.id=d.participant_id AND x.company_id=d.company_id AND x.owner_specialist_id=d.owner_specialist_id
    WHERE d.owner_specialist_id=? AND d.company_id=?
      ${includeArchived?"":"AND d.archived_at IS NULL"}
    ORDER BY d.updated_at DESC
    LIMIT 2000
  `).bind(ownerId,companyId).all();
  return jsonResponse(200,{
    success:true,
    deliveryReferences:(result?.results||[]).map(safeAcademyBusinessDelivery),
    storageBoundary:"external_references_only",
    sharedLearnerReviewerMutation:false,
  },privateHeaders);
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},privateHeaders);
  const ctx=await getAcademyBusinessDeliveryContext(request,env);
  if(ctx.error)return errorResponse(ctx.error);
  const body=await parseBody(request);
  if(!body)return jsonResponse(400,{success:false,error:"invalid_json"},privateHeaders);

  const action=String(body.action||"");
  const ownerId=String(ctx.specialist.id);
  const companyId=String(ctx.company.id);
  const now=new Date().toISOString();

  if(action==="create_delivery_ref"){
    const value=normalizeAcademyBusinessDelivery(body);
    const errors=academyBusinessDeliveryErrors(value);
    if(errors.length)return jsonResponse(400,{success:false,errors},privateHeaders);
    const scope=await validateAcademyBusinessDeliveryScope(env.DB,companyId,ownerId,value);
    if(scope.error)return jsonResponse(409,{success:false,error:scope.error},privateHeaders);
    const id=`academy-business-delivery-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_academy_business_delivery_refs (
        id,owner_specialist_id,company_id,program_id,cohort_id,participant_id,kind,title,
        reference_url,schedule_text,source_ref,observed_at,notes,archived_at,created_at,updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,?)
    `).bind(
      id,ownerId,companyId,value.programId,value.cohortId||null,value.participantId||null,
      value.kind,value.title,value.referenceUrl||null,value.scheduleText||null,value.sourceRef,
      value.observedAt,value.notes||null,now,now
    ).run();
    return jsonResponse(201,{success:true,deliveryReference:safeAcademyBusinessDelivery(await readDelivery(env.DB,id,ownerId,companyId))},privateHeaders);
  }

  if(action==="update_delivery_ref"){
    const id=String(body.id||"").trim();
    const existing=await readDelivery(env.DB,id,ownerId,companyId);
    if(!existing||existing.archived_at)return jsonResponse(404,{success:false,error:"delivery_reference_not_found"},privateHeaders);
    const value=normalizeAcademyBusinessDelivery(body,existing);
    const errors=academyBusinessDeliveryErrors(value);
    if(errors.length)return jsonResponse(400,{success:false,errors},privateHeaders);
    const scope=await validateAcademyBusinessDeliveryScope(env.DB,companyId,ownerId,value);
    if(scope.error)return jsonResponse(409,{success:false,error:scope.error},privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_delivery_refs SET
        program_id=?,cohort_id=?,participant_id=?,kind=?,title=?,reference_url=?,schedule_text=?,
        source_ref=?,observed_at=?,notes=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(
      value.programId,value.cohortId||null,value.participantId||null,value.kind,value.title,
      value.referenceUrl||null,value.scheduleText||null,value.sourceRef,value.observedAt,
      value.notes||null,now,id,ownerId,companyId
    ).run();
    return jsonResponse(200,{success:true,deliveryReference:safeAcademyBusinessDelivery(await readDelivery(env.DB,id,ownerId,companyId))},privateHeaders);
  }

  if(action==="archive_delivery_ref"){
    const id=String(body.id||"").trim();
    const existing=await readDelivery(env.DB,id,ownerId,companyId);
    if(!existing||existing.archived_at)return jsonResponse(404,{success:false,error:"delivery_reference_not_found"},privateHeaders);
    await env.DB.prepare(`
      UPDATE hermes_academy_business_delivery_refs
      SET archived_at=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(now,now,id,ownerId,companyId).run();
    return jsonResponse(200,{success:true,deliveryReference:safeAcademyBusinessDelivery(await readDelivery(env.DB,id,ownerId,companyId))},privateHeaders);
  }

  return jsonResponse(400,{success:false,error:"unknown_action"},privateHeaders);
}
