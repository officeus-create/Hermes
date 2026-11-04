import { socialReplyPreflight } from "./social-reply-preflight.mjs";

const clean=(value,max=500)=>String(value??"").trim().slice(0,max);
const numericId=(value)=>{
  const id=clean(value,160);
  return /^[0-9]{6,40}$/.test(id)?id:null;
};

export function validateSocialReplyPrepareInput(input){
  const lane=clean(input?.business_lane,64).toUpperCase();
  const platform=clean(input?.platform,32).toLowerCase();
  const replyToId=numericId(input?.reply_to_id);
  const rootPostId=numericId(input?.root_post_id);
  const text=clean(input?.text,1000);
  const requestedBy=clean(input?.requested_by,160);
  const approvalClass=clean(input?.approval_class,64).toUpperCase();
  const source=clean(input?.source,80).toLowerCase();

  if(!["HERMES_LOGISTICS","PROGRESSOPRO"].includes(lane)) throw new Error("social_business_lane_invalid");
  if(platform!=="threads") throw new Error("social_reply_platform_not_allowed");
  if(!replyToId) throw new Error("social_reply_target_invalid");
  if(!rootPostId) throw new Error("social_reply_root_invalid");
  if(!text||new TextEncoder().encode(text).byteLength>500) throw new Error("social_reply_text_invalid");
  if(!requestedBy) throw new Error("social_reply_requested_by_required");
  if(approvalClass!=="OWNER_APPROVED") throw new Error("social_reply_owner_approval_required");
  if(source!=="threads_owned_reply") throw new Error("social_reply_source_not_allowed");

  return {
    platform:"threads",
    business_lane:lane,
    reply_to_id:replyToId,
    root_post_id:rootPostId,
    text,
    requested_by:requestedBy,
    approval_class:"OWNER_APPROVED",
    source:"threads_owned_reply",
    text_fingerprint:clean(input?.text_fingerprint,200)||null,
  };
}

export async function runSocialReplyPrepare(env,input,{nowMs=Date.now(),fetchImpl=fetch}={}){
  const normalized=validateSocialReplyPrepareInput(input);
  const preflight=await socialReplyPreflight(env,normalized,{nowMs,fetchImpl});
  if(!preflight.ok){
    const error=new Error(preflight.error_class||"social_reply_preflight_failed");
    error.details=preflight;
    throw error;
  }
  if(preflight.provider_write_performed!==false||preflight.safe_to_submit_job!==true){
    throw new Error("social_reply_preflight_not_safe");
  }
  return {
    capability:"social.reply.prepare",
    permission_class:"DRAFT_ONLY",
    observed_at:new Date(nowMs).toISOString(),
    external_write:false,
    provider_write_performed:false,
    draft_status:"PREPARED_FOR_EXPLICIT_WRITE_GATE",
    business_lane:normalized.business_lane,
    account_key:preflight.account_key,
    provider_account_id:preflight.account_id,
    provider_username:preflight.username,
    credential_source:preflight.credential_source,
    reply_to_id:normalized.reply_to_id,
    root_post_id:normalized.root_post_id,
    text_bytes:preflight.text_bytes,
    requested_by:normalized.requested_by,
    approval_class:normalized.approval_class,
    source:normalized.source,
    text_fingerprint:normalized.text_fingerprint,
    provider_readback_verified:true,
    next_action:"explicit_social_reply_write_capability_review",
  };
}
