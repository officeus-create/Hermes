import { jsonResponse } from "../../_lib/session.mjs";
import {
  academyBusinessDeliveryRefErrors,academyBusinessParticipantErrors,createAcademyParticipantClaimToken,
  getAcademyBusinessParticipantContext,hashAcademyParticipantClaimToken,
  normalizeAcademyBusinessDeliveryRef,normalizeAcademyBusinessParticipant,readCanonicalProgression,
  safeAcademyBusinessDeliveryRef,safeAcademyBusinessParticipant,validateAcademyBusinessParticipantLinks,
} from "../../_lib/academy-business-participants.mjs";

type Env={DB?:any};
const privateHeaders={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};
const sameOriginMutation=(request:Request)=>request.headers.get("Sec-Fetch-Site")!=="cross-site"&&(!request.headers.get("Origin")||request.headers.get("Origin")===new URL(request.url).origin);
const errorResponse=(error:{status:number;code:string})=>jsonResponse(error.status,{success:false,error:error.code},privateHeaders);
const parseBody=async(request:Request)=>{try{return await request.json() as Record<string,unknown>;}catch{return null;}};

async function readParticipant(db:any,id:string,ownerId:string,companyId:string){
  return db.prepare(`
    SELECT x.*,p.name AS program_name,c.name AS cohort_name
    FROM hermes_academy_business_participants x
    JOIN hermes_academy_business_programs p ON p.id=x.program_id AND p.company_id=x.company_id
    JOIN hermes_academy_business_cohorts c ON c.id=x.cohort_id AND c.company_id=x.company_id
    WHERE x.id=? AND x.owner_specialist_id=? AND x.company_id=? LIMIT 1
  `).bind(id,ownerId,companyId).first();
}
async function readParticipantRows(db:any,ownerId:string,companyId:string,includeArchived=false){
  const result=await db.prepare(`
    SELECT x.*,p.name AS program_name,c.name AS cohort_name
    FROM hermes_academy_business_participants x
    JOIN hermes_academy_business_programs p ON p.id=x.program_id AND p.company_id=x.company_id
    JOIN hermes_academy_business_cohorts c ON c.id=x.cohort_id AND c.company_id=x.company_id
    WHERE x.owner_specialist_id=? AND x.company_id=? ${includeArchived?"":"AND x.archived_at IS NULL"}
    ORDER BY x.updated_at DESC LIMIT 500
  `).bind(ownerId,companyId).all();
  return result?.results||[];
}
async function readDeliveryRows(db:any,ownerId:string,companyId:string,includeArchived=false){
  const result=await db.prepare(`
    SELECT * FROM hermes_academy_business_delivery_refs
    WHERE owner_specialist_id=? AND company_id=? ${includeArchived?"":"AND archived_at IS NULL"}
    ORDER BY updated_at DESC LIMIT 2000
  `).bind(ownerId,companyId).all();
  return result?.results||[];
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const ctx=await getAcademyBusinessParticipantContext(request,env);if(ctx.error)return errorResponse(ctx.error);
  const ownerId=String(ctx.specialist.id),companyId=String(ctx.company.id);
  const url=new URL(request.url),includeArchived=url.searchParams.get("include_archived")==="1";
  const participants=await readParticipantRows(env.DB,ownerId,companyId,includeArchived);
  const delivery=await readDeliveryRows(env.DB,ownerId,companyId,includeArchived);
  const [leadResult,programResult,cohortResult]=await Promise.all([
    env.DB.prepare("SELECT id,contact_name,business_stage FROM hermes_academy_business_leads WHERE owner_specialist_id=? AND company_id=? AND archived_at IS NULL ORDER BY updated_at DESC LIMIT 1000").bind(ownerId,companyId).all(),
    env.DB.prepare("SELECT id,name,status FROM hermes_academy_business_programs WHERE owner_specialist_id=? AND company_id=? AND archived_at IS NULL ORDER BY updated_at DESC LIMIT 500").bind(ownerId,companyId).all(),
    env.DB.prepare("SELECT id,program_id,name,code,status FROM hermes_academy_business_cohorts WHERE owner_specialist_id=? AND company_id=? AND archived_at IS NULL ORDER BY updated_at DESC LIMIT 1000").bind(ownerId,companyId).all(),
  ]);
  const output=[];
  for(const row of participants){
    output.push({...safeAcademyBusinessParticipant(row),canonicalProgression:await readCanonicalProgression(env.DB,row)});
  }
  return jsonResponse(200,{success:true,participants:output,deliveryReferences:delivery.map(safeAcademyBusinessDeliveryRef),references:{
    leads:(leadResult?.results||[]).map((row:any)=>({id:String(row.id),label:row.contact_name||"Lead",stage:row.business_stage||"new"})),
    programs:(programResult?.results||[]).map((row:any)=>({id:String(row.id),label:row.name||"Program",status:row.status||"draft"})),
    cohorts:(cohortResult?.results||[]).map((row:any)=>({id:String(row.id),programId:String(row.program_id),label:row.name||row.code||"Cohort",code:row.code||"",status:row.status||"planned"})),
  },boundary:{
    identityLink:"authenticated_learner_self_claim",emailNameInference:false,duplicatesLearnerSystem:false,
    externalDeliveryMayRemainUnknown:true,completionRequiresEvidence:true,renewalRequiresEvidence:true,
  }},privateHeaders);
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},privateHeaders);
  const ctx=await getAcademyBusinessParticipantContext(request,env);if(ctx.error)return errorResponse(ctx.error);
  const body=await parseBody(request);if(!body)return jsonResponse(400,{success:false,error:"invalid_json"},privateHeaders);
  const action=String(body.action||""),ownerId=String(ctx.specialist.id),companyId=String(ctx.company.id),now=new Date().toISOString();

  if(action==="create_participant"||action==="update_participant"){
    if(action==="create_participant"&&(Object.prototype.hasOwnProperty.call(body,"learnerSpecialistId")||Object.prototype.hasOwnProperty.call(body,"learner_specialist_id"))){
      return jsonResponse(400,{success:false,error:"participant_identity_must_be_self_claimed"},privateHeaders);
    }
    const id=String(body.id||"").trim();
    let existing:any={};
    if(action==="update_participant"){
      if(!id)return jsonResponse(400,{success:false,error:"participant_id_required"},privateHeaders);
      existing=await readParticipant(env.DB,id,ownerId,companyId);
      if(!existing||existing.archived_at)return jsonResponse(404,{success:false,error:"participant_not_found"},privateHeaders);
      const immutablePairs=[
        ["leadId","lead_id"],["programId","program_id"],["cohortId","cohort_id"],
        ["deliveryAdapter","delivery_adapter"],["hermesProgramSlug","hermes_program_slug"],
      ];
      const changed=immutablePairs.some(([bodyKey,rowKey])=>body[bodyKey]!==undefined&&String(body[bodyKey]??"")!==String(existing[rowKey]??""));
      if(changed)return jsonResponse(409,{success:false,error:"participant_link_immutable_archive_and_recreate"},privateHeaders);
    }
    const value=normalizeAcademyBusinessParticipant(body,existing);
    const errors=academyBusinessParticipantErrors(value);if(errors.length)return jsonResponse(400,{success:false,errors},privateHeaders);
    const linkError=await validateAcademyBusinessParticipantLinks(env.DB,value,ownerId,companyId);
    if(linkError)return jsonResponse(400,{success:false,error:linkError},privateHeaders);
    if(action==="create_participant"){
      if(value.state!=="planned"||value.completionState!=="unknown"||value.renewalState!=="unknown"){
        return jsonResponse(400,{success:false,error:"participant_invitation_must_start_unclaimed"},privateHeaders);
      }
      const duplicate=await env.DB.prepare(`
        SELECT id FROM hermes_academy_business_participants
        WHERE company_id=? AND lead_id=? AND program_id=? AND cohort_id=? AND archived_at IS NULL
        LIMIT 1
      `).bind(companyId,value.leadId,value.programId,value.cohortId).first();
      if(duplicate)return jsonResponse(409,{success:false,error:"participant_active_link_exists"},privateHeaders);
      const newId=`academy-business-participant-${crypto.randomUUID()}`;
      const claimToken=createAcademyParticipantClaimToken();
      const claimTokenHash=await hashAcademyParticipantClaimToken(claimToken);
      await env.DB.prepare(`
        INSERT INTO hermes_academy_business_participants (
          id,owner_specialist_id,company_id,lead_id,program_id,cohort_id,learner_specialist_id,claim_token_hash,claimed_at,state,
          delivery_adapter,hermes_program_slug,completion_state,completion_source_ref,completion_observed_at,
          renewal_state,renewal_source_ref,renewal_observed_at,notes,archived_at,created_at,updated_at
        ) VALUES (?,?,?,?,?,?,NULL,?,NULL,?,?,?,?,?,?,?,?,?,?,NULL,?,?)
      `).bind(newId,ownerId,companyId,value.leadId,value.programId,value.cohortId,claimTokenHash,value.state,
        value.deliveryAdapter,value.hermesProgramSlug||null,value.completionState,value.completionSourceRef||null,
        value.completionObservedAt||null,value.renewalState,value.renewalSourceRef||null,value.renewalObservedAt||null,
        value.notes||null,now,now).run();
      return jsonResponse(201,{
        success:true,
        participant:safeAcademyBusinessParticipant(await readParticipant(env.DB,newId,ownerId,companyId)),
        participantClaimToken:claimToken,
        tokenReturnedOnce:true,
        identityLink:"learner_self_claim_required",
      },privateHeaders);
    }
    if(!existing.learner_specialist_id&&(value.state!=="planned"||value.completionState!=="unknown"||value.renewalState!=="unknown")){
      return jsonResponse(409,{success:false,error:"participant_claim_required_before_outcome"},privateHeaders);
    }
    await env.DB.prepare(`
      UPDATE hermes_academy_business_participants SET
        lead_id=?,program_id=?,cohort_id=?,learner_specialist_id=?,state=?,delivery_adapter=?,hermes_program_slug=?,
        completion_state=?,completion_source_ref=?,completion_observed_at=?,renewal_state=?,renewal_source_ref=?,
        renewal_observed_at=?,notes=?,updated_at=?
      WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL
    `).bind(value.leadId,value.programId,value.cohortId,value.learnerSpecialistId,value.state,value.deliveryAdapter,
      value.hermesProgramSlug||null,value.completionState,value.completionSourceRef||null,value.completionObservedAt||null,
      value.renewalState,value.renewalSourceRef||null,value.renewalObservedAt||null,value.notes||null,now,id,ownerId,companyId).run();
    return jsonResponse(200,{success:true,participant:safeAcademyBusinessParticipant(await readParticipant(env.DB,id,ownerId,companyId))},privateHeaders);
  }

  if(action==="create_delivery_reference"){
    const value=normalizeAcademyBusinessDeliveryRef(body),errors=academyBusinessDeliveryRefErrors(value);
    if(errors.length)return jsonResponse(400,{success:false,errors},privateHeaders);
    const participant=await readParticipant(env.DB,value.participantId,ownerId,companyId);
    if(!participant||participant.archived_at)return jsonResponse(404,{success:false,error:"participant_not_found"},privateHeaders);
    if(!participant.learner_specialist_id)return jsonResponse(409,{success:false,error:"participant_claim_required_before_delivery"},privateHeaders);
    const id=`academy-delivery-ref-${crypto.randomUUID()}`;
    await env.DB.prepare(`
      INSERT INTO hermes_academy_business_delivery_refs
      (id,owner_specialist_id,company_id,participant_id,kind,label,source_ref,observed_at,notes,archived_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,NULL,?,?)
    `).bind(id,ownerId,companyId,value.participantId,value.kind,value.label,value.sourceRef,value.observedAt,value.notes||null,now,now).run();
    const row=await env.DB.prepare("SELECT * FROM hermes_academy_business_delivery_refs WHERE id=? AND owner_specialist_id=? AND company_id=? LIMIT 1").bind(id,ownerId,companyId).first();
    return jsonResponse(201,{success:true,deliveryReference:safeAcademyBusinessDeliveryRef(row)},privateHeaders);
  }

  if(action==="archive_participant"){
    const id=String(body.id||"").trim();if(!id)return jsonResponse(400,{success:false,error:"participant_id_required"},privateHeaders);
    const existing=await readParticipant(env.DB,id,ownerId,companyId);if(!existing||existing.archived_at)return jsonResponse(404,{success:false,error:"participant_not_found"},privateHeaders);
    await env.DB.prepare("UPDATE hermes_academy_business_participants SET claim_token_hash=NULL,archived_at=?,updated_at=? WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL").bind(now,now,id,ownerId,companyId).run();
    await env.DB.prepare("UPDATE hermes_academy_business_delivery_refs SET archived_at=COALESCE(archived_at,?),updated_at=? WHERE participant_id=? AND owner_specialist_id=? AND company_id=?").bind(now,now,id,ownerId,companyId).run();
    return jsonResponse(200,{success:true,participant:safeAcademyBusinessParticipant(await readParticipant(env.DB,id,ownerId,companyId))},privateHeaders);
  }

  if(action==="archive_delivery_reference"){
    const id=String(body.id||"").trim();if(!id)return jsonResponse(400,{success:false,error:"delivery_reference_id_required"},privateHeaders);
    const existing=await env.DB.prepare("SELECT * FROM hermes_academy_business_delivery_refs WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL LIMIT 1").bind(id,ownerId,companyId).first();
    if(!existing)return jsonResponse(404,{success:false,error:"delivery_reference_not_found"},privateHeaders);
    await env.DB.prepare("UPDATE hermes_academy_business_delivery_refs SET archived_at=?,updated_at=? WHERE id=? AND owner_specialist_id=? AND company_id=? AND archived_at IS NULL").bind(now,now,id,ownerId,companyId).run();
    const row=await env.DB.prepare("SELECT * FROM hermes_academy_business_delivery_refs WHERE id=? AND owner_specialist_id=? AND company_id=? LIMIT 1").bind(id,ownerId,companyId).first();
    return jsonResponse(200,{success:true,deliveryReference:safeAcademyBusinessDeliveryRef(row)},privateHeaders);
  }
  return jsonResponse(400,{success:false,error:"unknown_action"},privateHeaders);
}
