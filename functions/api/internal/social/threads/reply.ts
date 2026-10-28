import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureThreadsBrandConnectorSchema,
  normalizeThreadsBrand,
  readThreadsMedia,
  threadsBrandPublishEnabled,
  threadsTextFingerprint,
  usableThreadsAccessToken,
  validThreadsIdempotencyKey,
  validateThreadsText,
} from "../../../_lib/threads-brand-connector.mjs";

type Env = {
  DB?: any;
  THREADS_BRAND_APP_ID?: string;
  THREADS_BRAND_APP_SECRET?: string;
  THREADS_BRAND_REDIRECT_URI?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
  THREADS_BRAND_SCOPES?: string;
  THREADS_OFFICE_TEST_PUBLISH_ENABLED?: string;
  THREADS_PROGRESSOPRO_PUBLISH_ENABLED?: string;
  THREADS_BUSINESS_ACADEMY_PUBLISH_ENABLED?: string;
  THREADS_SECONDARY_BRAND_PUBLISH_ENABLED?: string;
  HERMES_AUTOMATION_BASE_URL?: string;
  HERMES_AUTOMATION_TOKEN?: string;
};

const headers = { "Cache-Control":"private, no-store", "X-Robots-Tag":"noindex, nofollow" };
const enabled = (value: unknown) => /^(1|true|yes|on)$/i.test(String(value || "").trim());

function sameOrigin(request: Request) {
  const origin=request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
function validMediaId(value: unknown) {
  const id=String(value || "").trim();
  return /^[0-9]{6,40}$/.test(id) ? id : null;
}
function scopeSet(row: any) {
  return new Set(String(row?.granted_scope || "").split(/[\s,]+/).map(v=>v.trim()).filter(Boolean));
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
async function submitHaeSocialReply(env: Env, body: Record<string,unknown>) {
  const config=automationConfig(env);
  if (!config) return { ok:false, status:503, error:"hae_social_reply_handoff_not_configured" };
  const endpoint=new URL("/v1/jobs",config.base);
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
    return { ok:false, status:502, error:"hae_social_reply_handoff_unavailable" };
  }
  const payload:any=await response.json().catch(()=>({}));
  if (!response.ok) {
    const providerError=String(payload?.error || "");
    if (providerError === "job_type_not_allowed") {
      return { ok:false, status:409, error:"hae_social_reply_capability_not_ready", hae_error:providerError };
    }
    return {
      ok:false,
      status:response.status >= 400 && response.status < 600 ? response.status : 502,
      error:"hae_social_reply_handoff_rejected",
      hae_error:providerError || null,
    };
  }
  return { ok:true, status:response.status, payload };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOrigin(request)) return jsonResponse(403,{success:false,error:"invalid_origin",provider_write_performed:false},headers);
  const owner=await requireInternalOwner(request,env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503,{success:false,error:"database_not_configured",provider_write_performed:false},headers);

  let body:Record<string,unknown>;
  try { body=await request.json() as Record<string,unknown>; }
  catch { return jsonResponse(400,{success:false,error:"invalid_json",provider_write_performed:false},headers); }

  const brand=normalizeThreadsBrand(body.brand);
  if (!brand) return jsonResponse(400,{success:false,error:"threads_brand_not_allowed",provider_write_performed:false},headers);
  if (!threadsBrandPublishEnabled(env,brand)) return jsonResponse(403,{success:false,error:"brand_publish_not_enabled",provider_write_performed:false},headers);
  if (brand !== "office_test" && !enabled(env.THREADS_SECONDARY_BRAND_PUBLISH_ENABLED)) {
    return jsonResponse(403,{success:false,error:"secondary_brand_publish_not_enabled",provider_write_performed:false},headers);
  }

  const replyToId=validMediaId(body.reply_to_id);
  if (!replyToId) return jsonResponse(400,{success:false,error:"valid_reply_to_id_required",provider_write_performed:false},headers);
  const validated=validateThreadsText(body.text);
  if (!validated.ok) return jsonResponse(400,{success:false,error:validated.error,utf8_bytes:validated.bytes,provider_write_performed:false},headers);
  const idempotencyKey=validThreadsIdempotencyKey(body.idempotency_key || request.headers.get("Idempotency-Key"));
  if (!idempotencyKey) return jsonResponse(400,{success:false,error:"valid_idempotency_key_required",provider_write_performed:false},headers);
  const fingerprint=await threadsTextFingerprint(`${replyToId}\n${validated.text}`);

  await ensureThreadsBrandConnectorSchema(env.DB);
  if (brand !== "office_test") {
    const officeCanary=await env.DB.prepare(`SELECT provider_media_id,permalink FROM hermes_social_threads_publications
      WHERE brand_key='office_test' AND object_type='AUTHORED_POST' AND status='published' AND provider_media_id IS NOT NULL AND permalink IS NOT NULL
      ORDER BY updated_at DESC LIMIT 1`).first();
    if (!officeCanary) return jsonResponse(403,{success:false,error:"office_canary_required_before_secondary_publish",provider_write_performed:false},headers);
  }

  const token:any=await usableThreadsAccessToken(env.DB,env,brand);
  if (!token.ok) return jsonResponse(409,{success:false,error:token.error_class,provider_write_performed:false},headers);
  const scopes=scopeSet(token.connection);
  if (!scopes.has("threads_content_publish") || !scopes.has("threads_read_replies") || !scopes.has("threads_manage_replies")) {
    return jsonResponse(403,{success:false,error:"threads_reply_permissions_required",provider_write_performed:false},headers);
  }

  const target:any=await readThreadsMedia(token.access_token,replyToId);
  if (!target.ok) return jsonResponse(409,{success:false,error:"reply_target_readback_failed",provider_error:target.error_class,provider_write_performed:false},headers);
  if (!target.media.is_reply) return jsonResponse(409,{success:false,error:"reply_target_must_be_inbound_reply",provider_write_performed:false},headers);

  const ownUsername=String(token.connection.username || "").replace(/^@/,"").toLowerCase();
  const targetUsername=String(target.media.username || "").replace(/^@/,"").toLowerCase();
  if (!ownUsername || targetUsername === ownUsername) {
    return jsonResponse(409,{success:false,error:"self_reply_not_allowed",provider_write_performed:false},headers);
  }

  const rootId=validMediaId(target.media.root_post?.id || target.media.replied_to?.id);
  if (!rootId) return jsonResponse(409,{success:false,error:"owned_root_not_proven",provider_write_performed:false},headers);
  const root:any=await readThreadsMedia(token.access_token,rootId);
  if (!root.ok) return jsonResponse(409,{success:false,error:"owned_root_readback_failed",provider_error:root.error_class,provider_write_performed:false},headers);
  const rootUsername=String(root.media.username || "").replace(/^@/,"").toLowerCase();
  if (root.media.is_reply || rootUsername !== ownUsername) {
    return jsonResponse(403,{success:false,error:"reply_target_not_under_owned_root",provider_write_performed:false},headers);
  }

  // This endpoint is an owner approval + proof gateway only. It never writes Meta
  // directly. HAE owns every external social action and its durable evidence.
  const businessLane="progressopro";
  const hae=await submitHaeSocialReply(env,{
    job_type:"social.reply",
    business_lane:businessLane,
    account_key:brand,
    project_key:"threads-social-inbox",
    priority:80,
    max_attempts:1,
    idempotency_key:`hae:social:reply:${idempotencyKey}`,
    policy_version:"social-inbound-v1",
    payload:{
      platform:"threads",
      brand,
      business_lane:businessLane,
      reply_to_id:replyToId,
      root_post_id:rootId,
      text:validated.text,
      text_fingerprint:fingerprint,
      requested_by:String(owner.specialist.id),
      approval_class:"OWNER_APPROVED",
      source:"threads_owned_reply",
    },
  });

  if (!hae.ok) {
    return jsonResponse(hae.status,{
      success:false,
      error:hae.error,
      hae_error:hae.hae_error || null,
      blocked:true,
      retry_allowed:false,
      provider_write_performed:false,
      idempotency_key:idempotencyKey,
      next_action:hae.error === "hae_social_reply_capability_not_ready"
        ? "add_and_independently_approve_social_reply_capability_in_hae"
        : "configure_or_repair_hae_private_handoff",
    },headers);
  }

  return jsonResponse(202,{
    success:true,
    outcome:"queued_to_hae",
    published:false,
    provider_write_performed:false,
    brand,
    business_lane:businessLane,
    reply_to_id:replyToId,
    root_post_id:rootId,
    utf8_bytes:validated.bytes,
    idempotency_key:idempotencyKey,
    hae_job_id:hae.payload?.job?.job_id || null,
    hae_state:hae.payload?.job?.state || null,
    duplicate:Boolean(hae.payload?.duplicate),
  },headers);
}
