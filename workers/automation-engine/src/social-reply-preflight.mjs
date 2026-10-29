import { normalizeThreadsText } from "../../../shared/social/meta-threads-provider.mjs";
import { resolveThreadsTransportForLane } from "./social-credential-bridge.mjs";

const clean=(value,max=500)=>String(value??"").trim().slice(0,max);
const numericId=(value)=>{
  const id=clean(value,160);
  return /^[0-9]{6,40}$/.test(id)?id:null;
};
const username=(value)=>clean(value,160).replace(/^@/,"").toLowerCase();

export async function socialReplyPreflight(env,input,{nowMs=Date.now(),fetchImpl=fetch}={}){
  const lane=clean(input?.business_lane,64).toUpperCase();
  const replyToId=numericId(input?.reply_to_id);
  const requestedRootId=numericId(input?.root_post_id);
  const text=normalizeThreadsText(input?.text);
  const bytes=new TextEncoder().encode(text).byteLength;

  if(!["HERMES_LOGISTICS","PROGRESSOPRO"].includes(lane)){
    return {ok:false,error_class:"social_business_lane_invalid",provider_write_performed:false};
  }
  if(!replyToId)return {ok:false,error_class:"social_reply_target_invalid",provider_write_performed:false};
  if(!requestedRootId)return {ok:false,error_class:"social_reply_root_invalid",provider_write_performed:false};
  if(!text||bytes>500)return {ok:false,error_class:"social_reply_text_invalid",provider_write_performed:false};

  const resolved=await resolveThreadsTransportForLane(env,lane,{nowMs,fetchImpl});
  if(!resolved.ok){
    return {ok:false,error_class:resolved.error_class,provider_write_performed:false};
  }

  const identity=await resolved.transport.verifyIdentity();
  if(!identity.ok){
    return {ok:false,error_class:identity.error_class,provider_write_performed:false};
  }

  const target=await resolved.transport.readMedia(replyToId);
  if(!target.ok){
    return {ok:false,error_class:"social_reply_target_readback_failed",provider_error_class:target.error_class,provider_write_performed:false};
  }
  if(!target.media?.is_reply){
    return {ok:false,error_class:"social_reply_target_not_inbound_reply",provider_write_performed:false};
  }
  const ownUsername=username(resolved.username);
  const targetUsername=username(target.media?.username);
  if(!ownUsername||targetUsername===ownUsername){
    return {ok:false,error_class:"social_reply_self_reply_not_allowed",provider_write_performed:false};
  }

  const observedRootId=numericId(target.media?.root_post?.id||target.media?.replied_to?.id);
  if(!observedRootId||observedRootId!==requestedRootId){
    return {
      ok:false,
      error_class:"social_reply_root_mismatch",
      observed_root_post_id:observedRootId,
      provider_write_performed:false,
    };
  }

  const root=await resolved.transport.readMedia(requestedRootId);
  if(!root.ok){
    return {ok:false,error_class:"social_reply_root_readback_failed",provider_error_class:root.error_class,provider_write_performed:false};
  }
  const rootUsername=username(root.media?.username);
  if(root.media?.is_reply||rootUsername!==ownUsername){
    return {ok:false,error_class:"social_reply_root_not_owned",provider_write_performed:false};
  }

  return {
    ok:true,
    safe_to_submit_job:true,
    business_lane:lane,
    account_key:resolved.accountKey,
    account_id:resolved.accountId,
    username:resolved.username,
    credential_source:resolved.source,
    reply_to_id:replyToId,
    root_post_id:requestedRootId,
    text_bytes:bytes,
    provider_readback_verified:true,
    provider_write_performed:false,
  };
}
