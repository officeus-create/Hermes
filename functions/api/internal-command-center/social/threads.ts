import { jsonResponse } from "../../_lib/session.mjs";
import { requireInternalOwner } from "../../_lib/internal-ai.mjs";
import { resolveThreadsTransportForLane } from "../../../../workers/automation-engine/src/social-credential-bridge.mjs";
import { socialInboxPolicyDecision } from "../../../../shared/social/social-inbox-policy.mjs";
import { safeThreadsPermalink } from "../../../../shared/social/meta-threads-provider.mjs";

type Env={DB?:any;[key:string]:any};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"};
const LANES=new Set(["HERMES_LOGISTICS","PROGRESSOPRO"]);
const MODES=new Set(["mentions","search","replies","conversation"]);
const clean=(value:unknown,max=2000)=>String(value??"").replace(/[<>\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
const numericId=(value:unknown)=>{const id=clean(value,80);return /^[0-9]{6,40}$/.test(id)?id:null};

function requiredScopes(mode:string){
  if(mode==="mentions")return["threads_basic","threads_manage_mentions"];
  if(mode==="search")return["threads_basic","threads_keyword_search"];
  return["threads_basic","threads_read_replies"];
}
function publicRow(row:any,lane:string,mode:string){
  const source=mode==="search"?"keyword_search":mode==="mentions"?"mention":"owned_reply";
  const policy=socialInboxPolicyDecision({
    business_lane:lane,
    source,
    classification:"UNKNOWN",
  });
  return{
    id:clean(row?.id,160),
    text:clean(row?.text,2500),
    username:clean(row?.username,160)||null,
    permalink:safeThreadsPermalink(row?.permalink),
    timestamp:clean(row?.timestamp,100)||null,
    media_type:clean(row?.media_type,80)||null,
    is_reply:Boolean(row?.is_reply),
    is_quote_post:Boolean(row?.is_quote_post),
    replied_to_id:clean(row?.replied_to?.id,160)||null,
    root_post_id:clean(row?.root_post?.id,160)||null,
    inbox_candidate:{
      business_lane:lane,
      source,
      classification:"UNKNOWN",
      decision:policy.decision,
      reason:policy.reason,
      reply_authorized:false,
      stage:"PRE_VIKTOR",
    },
  };
}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
  const owner=await requireInternalOwner(request,env);
  if(owner.response)return owner.response;

  const url=new URL(request.url);
  const lane=clean(url.searchParams.get("lane"),64).toUpperCase();
  const mode=clean(url.searchParams.get("mode"),32).toLowerCase();
  if(!LANES.has(lane)||!MODES.has(mode)){
    return jsonResponse(400,{success:false,error:"social_lane_and_threads_mode_required",provider_write_performed:false},headers);
  }

  const needed=requiredScopes(mode);
  const resolved:any=await resolveThreadsTransportForLane(env,lane);
  if(!resolved?.ok){
    return jsonResponse(409,{success:false,error:resolved?.error_class||"threads_transport_not_ready",provider_write_performed:false},headers);
  }
  if(!Array.isArray(resolved.grantedScopes)){
    return jsonResponse(409,{
      success:false,error:"threads_scope_evidence_unknown",required_scopes:needed,
      provider_write_performed:false,next_action:"record_exact_account_granted_scopes_before_inbound_read",
    },headers);
  }
  const granted=new Set(resolved.grantedScopes);
  const missing=needed.filter(scope=>!granted.has(scope));
  if(missing.length){
    return jsonResponse(403,{
      success:false,error:"threads_provider_scope_required",missing_scopes:missing,
      provider_write_performed:false,next_action:"reconnect_exact_account_with_required_meta_scopes",
    },headers);
  }

  const identity=await resolved.transport.verifyIdentity();
  if(!identity.ok){
    return jsonResponse(409,{success:false,error:identity.error_class||"threads_identity_not_verified",provider_write_performed:false},headers);
  }

  const limit=Math.max(1,Math.min(50,Number(url.searchParams.get("limit")||20)));
  let result:any;
  if(mode==="mentions"){
    result=await resolved.transport.listMentions({limit,maxPages:2});
  }else if(mode==="search"){
    const q=clean(url.searchParams.get("q"),180);
    if(q.length<2)return jsonResponse(400,{success:false,error:"threads_query_too_short",provider_write_performed:false},headers);
    result=await resolved.transport.searchPublic(q,{searchType:url.searchParams.get("search_type")==="TOP"?"TOP":"RECENT",limit});
  }else{
    const threadId=numericId(url.searchParams.get("thread_id"));
    if(!threadId)return jsonResponse(400,{success:false,error:"valid_thread_id_required",provider_write_performed:false},headers);
    result=mode==="replies"
      ?await resolved.transport.listReplies(threadId,{limit,maxPages:2})
      :await resolved.transport.listConversation(threadId,{limit,maxPages:3});
  }

  if(!result?.ok){
    const status=result?.error_class==="meta_threads_rate_limited"?429:
      result?.error_class==="meta_threads_auth_rejected"?403:502;
    return jsonResponse(status,{
      success:false,error:result?.error_class||"threads_read_failed",
      provider_status:result?.provider_status??null,provider_write_performed:false,
    },headers);
  }

  return jsonResponse(200,{
    success:true,
    lane,
    account_key:resolved.accountKey,
    account_id:resolved.accountId,
    username:resolved.username,
    mode,
    rows:(result.rows||[]).slice(0,limit).map((row:any)=>publicRow(row,lane,mode)),
    complete:result.complete===true,
    ranked_results:Boolean(result.ranked_results),
    coverage_note:mode==="search"
      ?"Meta keyword search is ranked and not an exhaustive public archive."
      :"Bounded provider read; complete=false means more provider history may exist.",
    provider:"meta_threads_official",
    provider_write_performed:false,
    reply_write_enabled:false,
    inbox_policy_stage:"PRE_VIKTOR",
    observed_at:new Date().toISOString(),
  },headers);
}
