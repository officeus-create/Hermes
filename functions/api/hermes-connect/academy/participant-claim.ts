import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  ensureAcademyBusinessParticipantSchema,
  hashAcademyParticipantClaimToken,
  safeAcademyBusinessParticipant,
  validateHermesAcademyParticipantClaim,
} from "../../_lib/academy-business-participants.mjs";

type Env={DB?:any};
const privateHeaders={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"};
const sameOriginMutation=(request:Request)=>request.headers.get("Sec-Fetch-Site")!=="cross-site"&&(!request.headers.get("Origin")||request.headers.get("Origin")===new URL(request.url).origin);
const parseBody=async(request:Request)=>{try{return await request.json() as Record<string,unknown>;}catch{return null;}};

async function readParticipant(db:any,id:string){
  return db.prepare(`
    SELECT x.*,p.name AS program_name,c.name AS cohort_name
    FROM hermes_academy_business_participants x
    JOIN hermes_academy_business_programs p ON p.id=x.program_id AND p.company_id=x.company_id
    JOIN hermes_academy_business_cohorts c ON c.id=x.cohort_id AND c.company_id=x.company_id
    WHERE x.id=? LIMIT 1
  `).bind(id).first();
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!env?.DB)return jsonResponse(503,{success:false,error:"database_not_configured"},privateHeaders);
  if(!sameOriginMutation(request))return jsonResponse(403,{success:false,error:"same_origin_required"},privateHeaders);
  const specialist=await getAuthenticatedSpecialist(request,env.DB);
  if(!specialist)return jsonResponse(401,{success:false,error:"authentication_required"},privateHeaders);
  await ensureAcademyBusinessParticipantSchema(env.DB);
  const body=await parseBody(request);if(!body)return jsonResponse(400,{success:false,error:"invalid_json"},privateHeaders);
  const id=String(body.participantId||"").trim(),token=String(body.claimToken||"").trim();
  if(!id)return jsonResponse(400,{success:false,error:"participant_id_required"},privateHeaders);
  if(token.length<48)return jsonResponse(400,{success:false,error:"participant_claim_token_required"},privateHeaders);
  const tokenHash=await hashAcademyParticipantClaimToken(token);
  const row=await env.DB.prepare(`
    SELECT x.*,p.name AS program_name,c.name AS cohort_name
    FROM hermes_academy_business_participants x
    JOIN hermes_academy_business_programs p ON p.id=x.program_id AND p.company_id=x.company_id
    JOIN hermes_academy_business_cohorts c ON c.id=x.cohort_id AND c.company_id=x.company_id
    WHERE x.id=? AND x.claim_token_hash=? AND x.learner_specialist_id IS NULL AND x.archived_at IS NULL
    LIMIT 1
  `).bind(id,tokenHash).first();
  if(!row)return jsonResponse(403,{success:false,error:"participant_claim_token_invalid"},privateHeaders);
  if(row.delivery_adapter==="hermes_academy"){
    const adapterError=await validateHermesAcademyParticipantClaim(env.DB,String(specialist.id),String(row.hermes_program_slug||""));
    if(adapterError)return jsonResponse(409,{success:false,error:adapterError},privateHeaders);
  }
  const now=new Date().toISOString();
  const result=await env.DB.prepare(`
    UPDATE hermes_academy_business_participants
    SET learner_specialist_id=?,claim_token_hash=NULL,claimed_at=?,updated_at=?
    WHERE id=? AND learner_specialist_id IS NULL AND claim_token_hash=?
  `).bind(String(specialist.id),now,now,id,tokenHash).run();
  if(Number(result?.meta?.changes||0)!==1)return jsonResponse(409,{success:false,error:"participant_claim_conflict"},privateHeaders);
  const claimed=await readParticipant(env.DB,id);
  return jsonResponse(200,{
    success:true,
    participant:safeAcademyBusinessParticipant(claimed),
    identityLink:"authenticated_learner_self_claim",
    emailNameInference:false,
  },privateHeaders);
}
