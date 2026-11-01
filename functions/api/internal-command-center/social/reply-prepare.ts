import { jsonResponse } from "../../_lib/session.mjs";
import { requireInternalOwner } from "../../_lib/internal-ai.mjs";
import {
  createSocialReplyPrepareIntake,
  normalizeSocialReplyPrepareIntake,
} from "../../../../src/lib/hae-social-reply-intake.mjs";

type Env={DB?:any;[key:string]:any};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"};

function sameOrigin(request:Request){
  const origin=request.headers.get("Origin");
  if(!origin)return true;
  try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}
}
async function digest24(value:string){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,"0")).join("").slice(0,24);
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOrigin(request))return jsonResponse(403,{success:false,error:"invalid_origin",provider_write_performed:false},headers);
  const owner=await requireInternalOwner(request,env);
  if(owner.response)return owner.response;
  if(!env.DB)return jsonResponse(503,{success:false,error:"database_not_configured",provider_write_performed:false},headers);

  let body:any;
  try{body=await request.json()}catch{return jsonResponse(400,{success:false,error:"invalid_json",provider_write_performed:false},headers)}

  let normalized;
  try{
    normalized=normalizeSocialReplyPrepareIntake({...body,requested_by:String(owner.specialist.id)});
  }catch(error:any){
    return jsonResponse(400,{success:false,error:String(error?.message||"social_reply_prepare_invalid"),provider_write_performed:false},headers);
  }

  const fingerprint=await digest24(normalized.reply_to_id+"\n"+normalized.root_post_id+"\n"+normalized.text);
  const idempotencyKey="hae:social:reply:prepare:"+normalized.business_lane.toLowerCase()+":"+normalized.reply_to_id+":"+fingerprint;

  let intake;
  try{
    intake=await createSocialReplyPrepareIntake(env.DB,normalized,{idempotencyKey});
  }catch(error:any){
    return jsonResponse(409,{success:false,error:String(error?.message||"social_reply_intake_failed"),provider_write_performed:false},headers);
  }

  return jsonResponse(202,{
    success:true,
    outcome:"reply_draft_intake_recorded",
    published:false,
    provider_write_performed:false,
    business_lane:intake.business_lane,
    reply_to_id:intake.reply_to_id,
    root_post_id:intake.root_post_id,
    idempotency_key:intake.idempotency_key,
    intake_request_id:intake.request_id,
    intake_state:intake.status,
    hae_job_id:intake.job_id,
    duplicate:intake.duplicate,
    scheduler_owner:"HAE",
    next_action:intake.job_id
      ?"review_prepared_draft_before_any_future_external_write_capability"
      :"hae_cron_claims_intake_and_queues_social_reply_prepare",
  },headers);
}
