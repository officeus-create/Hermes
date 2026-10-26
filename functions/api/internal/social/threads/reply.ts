import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureThreadsBrandConnectorSchema,
  normalizeThreadsBrand,
  publishThreadsReply,
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

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOrigin(request)) return jsonResponse(403,{success:false,error:"invalid_origin"},headers);
  const owner=await requireInternalOwner(request,env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503,{success:false,error:"database_not_configured"},headers);

  let body:Record<string,unknown>;
  try { body=await request.json() as Record<string,unknown>; }
  catch { return jsonResponse(400,{success:false,error:"invalid_json"},headers); }

  const brand=normalizeThreadsBrand(body.brand);
  if (!brand) return jsonResponse(400,{success:false,error:"threads_brand_not_allowed"},headers);
  if (!threadsBrandPublishEnabled(env,brand)) return jsonResponse(403,{success:false,error:"brand_publish_not_enabled"},headers);
  if (brand !== "office_test" && !enabled(env.THREADS_SECONDARY_BRAND_PUBLISH_ENABLED)) {
    return jsonResponse(403,{success:false,error:"secondary_brand_publish_not_enabled"},headers);
  }

  const replyToId=validMediaId(body.reply_to_id);
  if (!replyToId) return jsonResponse(400,{success:false,error:"valid_reply_to_id_required"},headers);
  const validated=validateThreadsText(body.text);
  if (!validated.ok) return jsonResponse(400,{success:false,error:validated.error,utf8_bytes:validated.bytes},headers);
  const idempotencyKey=validThreadsIdempotencyKey(body.idempotency_key || request.headers.get("Idempotency-Key"));
  if (!idempotencyKey) return jsonResponse(400,{success:false,error:"valid_idempotency_key_required"},headers);

  await ensureThreadsBrandConnectorSchema(env.DB);
  if (brand !== "office_test") {
    const officeCanary=await env.DB.prepare(`SELECT provider_media_id,permalink FROM hermes_social_threads_publications
      WHERE brand_key='office_test' AND status='published' AND provider_media_id IS NOT NULL AND permalink IS NOT NULL
      ORDER BY updated_at DESC LIMIT 1`).first();
    if (!officeCanary) return jsonResponse(403,{success:false,error:"office_canary_required_before_secondary_publish"},headers);
  }

  const prior=await env.DB.prepare(`SELECT id,status,provider_media_id,permalink,provider_timestamp,last_error_class
    FROM hermes_social_threads_publications WHERE idempotency_key=? LIMIT 1`).bind(idempotencyKey).first();
  if (prior) {
    const status=String(prior.status || "");
    if (status === "published" || status === "published_readback_pending") {
      return jsonResponse(200,{success:true,duplicate:true,outcome:status,media_id:prior.provider_media_id || null,
        permalink:prior.permalink || null,provider_timestamp:prior.provider_timestamp || null,retry_allowed:false},headers);
    }
    return jsonResponse(409,{success:false,error:"idempotency_key_already_used",prior_status:status,retry_allowed:false},headers);
  }

  const token:any=await usableThreadsAccessToken(env.DB,env,brand);
  if (!token.ok) return jsonResponse(409,{success:false,error:token.error_class},headers);
  const scopes=scopeSet(token.connection);
  if (!scopes.has("threads_content_publish") || !scopes.has("threads_read_replies") || !scopes.has("threads_manage_replies")) {
    return jsonResponse(403,{success:false,error:"threads_reply_permissions_required"},headers);
  }

  const target:any=await readThreadsMedia(token.access_token,replyToId);
  if (!target.ok) return jsonResponse(409,{success:false,error:"reply_target_readback_failed",provider_error:target.error_class},headers);
  if (!target.media.is_reply) return jsonResponse(409,{success:false,error:"reply_target_must_be_inbound_reply"},headers);

  const ownUsername=String(token.connection.username || "").replace(/^@/,"").toLowerCase();
  const targetUsername=String(target.media.username || "").replace(/^@/,"").toLowerCase();
  if (!ownUsername || targetUsername === ownUsername) {
    return jsonResponse(409,{success:false,error:"self_reply_not_allowed"},headers);
  }

  const rootId=validMediaId(target.media.root_post?.id || target.media.replied_to?.id);
  if (!rootId) return jsonResponse(409,{success:false,error:"owned_root_not_proven"},headers);
  const root:any=await readThreadsMedia(token.access_token,rootId);
  if (!root.ok) return jsonResponse(409,{success:false,error:"owned_root_readback_failed",provider_error:root.error_class},headers);
  const rootUsername=String(root.media.username || "").replace(/^@/,"").toLowerCase();
  if (root.media.is_reply || rootUsername !== ownUsername) {
    return jsonResponse(403,{success:false,error:"reply_target_not_under_owned_root"},headers);
  }

  const fingerprint=await threadsTextFingerprint(`${replyToId}\n${validated.text}`);
  const now=new Date().toISOString();
  const id=`threads-reply-${crypto.randomUUID()}`;
  const reservation=await env.DB.prepare(`INSERT OR IGNORE INTO hermes_social_threads_publications
    (id,brand_key,object_type,idempotency_key,text_fingerprint,status,provider_media_id,permalink,
     provider_timestamp,metrics_json,metrics_updated_at,requested_by,created_at,updated_at,last_error_class)
    VALUES (?,?,'REPLY',?,?,'publishing',NULL,NULL,NULL,NULL,NULL,?,?,?,NULL)`)
    .bind(id,brand,idempotencyKey,fingerprint,String(owner.specialist.id),now,now).run();
  if (Number(reservation?.meta?.changes || 0) !== 1) {
    return jsonResponse(409,{success:false,error:"idempotency_reservation_race",retry_allowed:false},headers);
  }

  const published:any=await publishThreadsReply(token.access_token,String(token.connection.threads_user_id || ""),
    validated.text,replyToId);
  if (!published.ok) {
    const nextStatus=published.error_class === "provider_outcome_unknown" ? "unknown_outcome" : "provider_rejected";
    await env.DB.prepare(`UPDATE hermes_social_threads_publications SET status=?,last_error_class=?,updated_at=? WHERE id=?`)
      .bind(nextStatus,published.error_class,new Date().toISOString(),id).run();
    return jsonResponse(nextStatus === "unknown_outcome" ? 502 : 422,
      {success:false,error:published.error_class,outcome:nextStatus,retry_allowed:false,idempotency_key:idempotencyKey},headers);
  }

  await env.DB.prepare(`UPDATE hermes_social_threads_publications
    SET provider_media_id=?,status='published_readback_pending',updated_at=? WHERE id=?`)
    .bind(published.media_id,new Date().toISOString(),id).run();

  const readback:any=await readThreadsMedia(token.access_token,published.media_id);
  if (!readback.ok) {
    await env.DB.prepare(`UPDATE hermes_social_threads_publications SET last_error_class=?,updated_at=? WHERE id=?`)
      .bind(readback.error_class,new Date().toISOString(),id).run();
    return jsonResponse(202,{success:true,outcome:"published_readback_pending",media_id:published.media_id,
      reply_to_id:replyToId,idempotency_key:idempotencyKey,retry_allowed:false},headers);
  }
  const actualParent=String(readback.media.replied_to?.id || "");
  if (!readback.media.is_reply || actualParent !== replyToId) {
    await env.DB.prepare(`UPDATE hermes_social_threads_publications
      SET status='readback_mismatch',last_error_class='reply_parent_mismatch',updated_at=? WHERE id=?`)
      .bind(new Date().toISOString(),id).run();
    return jsonResponse(502,{success:false,error:"reply_parent_mismatch",media_id:published.media_id,retry_allowed:false},headers);
  }

  await env.DB.prepare(`UPDATE hermes_social_threads_publications
    SET status='published',permalink=?,provider_timestamp=?,last_error_class=NULL,updated_at=? WHERE id=?`)
    .bind(readback.media.permalink || null,readback.media.timestamp || null,new Date().toISOString(),id).run();

  return jsonResponse(201,{success:true,outcome:"published",object_type:"REPLY",brand,media_id:published.media_id,
    reply_to_id:replyToId,root_post_id:rootId,permalink:readback.media.permalink || null,
    provider_timestamp:readback.media.timestamp || null,username:readback.media.username || null,
    utf8_bytes:validated.bytes,idempotency_key:idempotencyKey},headers);
}
