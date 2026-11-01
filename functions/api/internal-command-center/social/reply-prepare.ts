import { jsonResponse } from "../../_lib/session.mjs";
import { requireInternalOwner } from "../../_lib/internal-ai.mjs";

type Env={
  HERMES_AUTOMATION_BASE_URL?:string;
  HERMES_AUTOMATION_TOKEN?:string;
  [key:string]:any;
};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"};
const LANES=new Set(["HERMES_LOGISTICS","PROGRESSOPRO"]);
const clean=(value:unknown,max=1000)=>String(value??"").replace(/[<>\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
const numericId=(value:unknown)=>{const id=clean(value,80);return /^[0-9]{6,40}$/.test(id)?id:null};

function sameOrigin(request:Request){
  const origin=request.headers.get("Origin");
  if(!origin)return true;
  try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}
}
function automationConfig(env:Env){
  const rawBase=clean(env.HERMES_AUTOMATION_BASE_URL,1200);
  const token=String(env.HERMES_AUTOMATION_TOKEN||"").trim();
  if(!rawBase||token.length<20||token.length>4096)return null;
  try{
    const base=new URL(rawBase);
    if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash)return null;
    return{base,token};
  }catch{return null}
}
async function digest24(value:string){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,"0")).join("").slice(0,24);
}
async function submitHae(env:Env,body:Record<string,unknown>){
  const config=automationConfig(env);
  if(!config)return{ok:false,status:503,payload:{error:"hae_social_reply_prepare_not_configured"}};
  const endpoint=new URL("/v1/jobs",config.base);
  try{
    const response=await fetch(endpoint.toString(),{
      method:"POST",redirect:"error",
      headers:{Authorization:"Bearer "+config.token,Accept:"application/json","Content-Type":"application/json"},
      body:JSON.stringify(body),
    });
    const payload:any=await response.json().catch(()=>({}));
    return{ok:response.ok,status:response.status,payload};
  }catch{
    return{ok:false,status:502,payload:{error:"hae_social_reply_prepare_unavailable"}};
  }
}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
  if(!sameOrigin(request))return jsonResponse(403,{success:false,error:"invalid_origin",provider_write_performed:false},headers);
  const owner=await requireInternalOwner(request,env);
  if(owner.response)return owner.response;

  let body:any;
  try{body=await request.json()}catch{return jsonResponse(400,{success:false,error:"invalid_json",provider_write_performed:false},headers)}

  const lane=clean(body?.business_lane,64).toUpperCase();
  const replyToId=numericId(body?.reply_to_id);
  const rootPostId=numericId(body?.root_post_id);
  const text=clean(body?.text,1000);
  const textBytes=new TextEncoder().encode(text).byteLength;
  if(!LANES.has(lane))return jsonResponse(400,{success:false,error:"social_business_lane_invalid",provider_write_performed:false},headers);
  if(!replyToId)return jsonResponse(400,{success:false,error:"social_reply_target_invalid",provider_write_performed:false},headers);
  if(!rootPostId)return jsonResponse(400,{success:false,error:"social_reply_root_invalid",provider_write_performed:false},headers);
  if(!text||textBytes>500)return jsonResponse(400,{success:false,error:"social_reply_text_invalid",provider_write_performed:false},headers);

  const fingerprint=await digest24(replyToId+"\n"+rootPostId+"\n"+text);
  const accountKey=lane==="HERMES_LOGISTICS"?"hermes_logistics":"progressopro";
  const idempotencyKey="hae:social:reply:prepare:"+lane.toLowerCase()+":"+replyToId+":"+fingerprint;
  const result=await submitHae(env,{
    job_type:"social.reply.prepare",
    business_lane:lane,
    account_key:accountKey,
    project_key:"command-center-social-inbox",
    priority:80,
    max_attempts:1,
    idempotency_key:idempotencyKey,
    policy_version:"social-inbound-v1",
    payload:{
      platform:"threads",
      business_lane:lane,
      reply_to_id:replyToId,
      root_post_id:rootPostId,
      text,
      requested_by:String(owner.specialist.id),
      approval_class:"OWNER_APPROVED",
      source:"threads_owned_reply",
      text_fingerprint:"sha256:"+fingerprint,
    },
  });

  if(!result.ok){
    return jsonResponse(result.status,{
      success:false,error:String(result.payload?.error||"hae_social_reply_prepare_rejected"),
      blocked:true,retry_allowed:false,provider_write_performed:false,
    },headers);
  }

  return jsonResponse(202,{
    success:true,outcome:"reply_draft_queued_to_hae",published:false,
    provider_write_performed:false,business_lane:lane,reply_to_id:replyToId,root_post_id:rootPostId,
    idempotency_key:idempotencyKey,hae_job_id:result.payload?.job?.job_id||null,
    hae_state:result.payload?.job?.state||null,duplicate:Boolean(result.payload?.duplicate),
    next_action:"review_prepared_draft_before_any_future_external_write_capability",
  },headers);
}
