import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  normalizeThreadsBrand,
  threadsTextFingerprint,
  validThreadsIdempotencyKey,
  validateThreadsText,
} from "../../../_lib/threads-brand-connector.mjs";

type Env = {
  HERMES_AUTOMATION_BASE_URL?: string;
  HERMES_AUTOMATION_TOKEN?: string;
};

const headers = { "Cache-Control":"private, no-store", "X-Robots-Tag":"noindex, nofollow" };

function sameOrigin(request: Request) {
  const origin=request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
function validMediaId(value: unknown) {
  const id=String(value || "").trim();
  return /^[0-9]{6,40}$/.test(id) ? id : null;
}
function automationConfig(env: Env) {
  const rawBase=String(env.HERMES_AUTOMATION_BASE_URL || "").trim();
  const token=String(env.HERMES_AUTOMATION_TOKEN || "").trim();
  if (!rawBase || token.length < 20 || token.length > 4096) return null;
  try {
    const base=new URL(rawBase);
    if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) return null;
    return { base, token };
  } catch {
    return null;
  }
}
async function haeJson(env:Env,path:string,body:Record<string,unknown>) {
  const config=automationConfig(env);
  if (!config) return { ok:false, status:503, payload:{error:"hae_social_reply_handoff_not_configured"} };
  const endpoint=new URL(path,config.base);
  let response:Response;
  try {
    response=await fetch(endpoint.toString(),{
      method:"POST",
      redirect:"error",
      headers:{
        "Authorization":"Bearer "+config.token,
        "Accept":"application/json",
        "Content-Type":"application/json",
      },
      body:JSON.stringify(body),
    });
  } catch {
    return { ok:false, status:502, payload:{error:"hae_social_reply_handoff_unavailable"} };
  }
  const payload:any=await response.json().catch(()=>({}));
  return {ok:response.ok,status:response.status,payload};
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOrigin(request)) return jsonResponse(403,{success:false,error:"invalid_origin",provider_write_performed:false},headers);
  const owner=await requireInternalOwner(request,env);
  if (owner.response) return owner.response;

  let body:Record<string,unknown>;
  try { body=await request.json() as Record<string,unknown>; }
  catch { return jsonResponse(400,{success:false,error:"invalid_json",provider_write_performed:false},headers); }

  const brand=normalizeThreadsBrand(body.brand);
  if (!brand) return jsonResponse(400,{success:false,error:"threads_brand_not_allowed",provider_write_performed:false},headers);
  if (brand === "office_test") {
    return jsonResponse(409,{
      success:false,
      error:"technical_canary_reply_handoff_not_supported",
      provider_write_performed:false,
      next_action:"use_progressopro_owner_lane_after_hae_preflight_is_live",
    },headers);
  }
  const businessLane="PROGRESSOPRO";

  const replyToId=validMediaId(body.reply_to_id);
  const rootPostId=validMediaId(body.root_post_id);
  if (!replyToId) return jsonResponse(400,{success:false,error:"valid_reply_to_id_required",provider_write_performed:false},headers);
  if (!rootPostId) return jsonResponse(400,{success:false,error:"valid_root_post_id_required",provider_write_performed:false},headers);

  const validated=validateThreadsText(body.text);
  if (!validated.ok) return jsonResponse(400,{success:false,error:validated.error,utf8_bytes:validated.bytes,provider_write_performed:false},headers);
  const idempotencyKey=validThreadsIdempotencyKey(body.idempotency_key || request.headers.get("Idempotency-Key"));
  if (!idempotencyKey) return jsonResponse(400,{success:false,error:"valid_idempotency_key_required",provider_write_performed:false},headers);
  const fingerprint=await threadsTextFingerprint(`${replyToId}\n${validated.text}`);

  // HAE owns provider credentials and provider-read proof. This Pages route does
  // not decrypt provider tokens and does not call Meta directly.
  const preflight=await haeJson(env,"/v1/social-reply-preflight",{
    business_lane:businessLane,
    account_key:"progressopro",
    reply_to_id:replyToId,
    root_post_id:rootPostId,
    text:validated.text,
  });
  if (!preflight.ok) {
    return jsonResponse(preflight.status,{
      success:false,
      error:String(preflight.payload?.error || preflight.payload?.error_class || "hae_social_reply_preflight_failed"),
      blocked:true,
      retry_allowed:false,
      provider_write_performed:false,
      preflight_verified:false,
      next_action:"repair_hae_social_reply_preflight_or_credentials",
    },headers);
  }
  if (!preflight.payload?.safe_to_submit_job || preflight.payload?.provider_write_performed !== false) {
    return jsonResponse(409,{
      success:false,error:"hae_social_reply_preflight_not_safe",blocked:true,retry_allowed:false,
      provider_write_performed:false,preflight_verified:false,
    },headers);
  }

  const job=await haeJson(env,"/v1/jobs",{
    job_type:"social.reply.prepare",
    business_lane:businessLane,
    account_key:"progressopro",
    project_key:"threads-social-inbox",
    priority:80,
    max_attempts:1,
    idempotency_key:`hae:social:reply:${idempotencyKey}`,
    policy_version:"social-inbound-v1",
    payload:{
      platform:"threads",
      brand:"progressopro",
      business_lane:businessLane,
      reply_to_id:replyToId,
      root_post_id:rootPostId,
      text:validated.text,
      text_fingerprint:fingerprint,
      requested_by:String(owner.specialist.id),
      approval_class:"OWNER_APPROVED",
      source:"threads_owned_reply",
      preflight_identity:preflight.payload?.username || null,
      preflight_account_id:preflight.payload?.account_id || null,
    },
  });

  if (!job.ok) {
    const haeError=String(job.payload?.error || "");
    return jsonResponse(job.status,{
      success:false,
      error:haeError==="job_type_not_allowed"?"hae_social_reply_prepare_capability_not_ready":"hae_social_reply_prepare_handoff_rejected",
      hae_error:haeError || null,
      blocked:true,
      retry_allowed:false,
      provider_write_performed:false,
      preflight_verified:true,
      idempotency_key:idempotencyKey,
      next_action:haeError==="job_type_not_allowed"
        ? "add_and_independently_approve_social_reply_prepare_capability_in_hae"
        : "repair_hae_private_job_handoff",
    },headers);
  }

  return jsonResponse(202,{
    success:true,
    outcome:"queued_to_hae_prepare",
    published:false,
    prepared:false,
    provider_write_performed:false,
    preflight_verified:true,
    brand:"progressopro",
    business_lane:businessLane,
    reply_to_id:replyToId,
    root_post_id:rootPostId,
    utf8_bytes:validated.bytes,
    idempotency_key:idempotencyKey,
    hae_job_id:job.payload?.job?.job_id || null,
    hae_state:job.payload?.job?.state || null,
    duplicate:Boolean(job.payload?.duplicate),
  },headers);
}
