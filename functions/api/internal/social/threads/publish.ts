import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureThreadsBrandConnectorSchema,
  normalizeThreadsBrand,
  publishThreadsText,
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

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

const enabled = (value: unknown) => /^(1|true|yes|on)$/i.test(String(value || "").trim());

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOrigin(request)) return jsonResponse(403, { success: false, error: "invalid_origin" }, headers);
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, headers); }

  const brand = normalizeThreadsBrand(body.brand);
  if (!brand) return jsonResponse(400, { success: false, error: "threads_brand_not_allowed" }, headers);
  if (!threadsBrandPublishEnabled(env, brand)) {
    return jsonResponse(403, { success: false, error: "brand_publish_not_enabled" }, headers);
  }
  if (brand !== "office_test") {
    if (!enabled(env.THREADS_SECONDARY_BRAND_PUBLISH_ENABLED)) {
      return jsonResponse(403, { success: false, error: "secondary_brand_publish_not_enabled" }, headers);
    }
    await ensureThreadsBrandConnectorSchema(env.DB);
    const officeCanary = await env.DB.prepare(`SELECT provider_media_id,permalink FROM hermes_social_threads_publications
      WHERE brand_key='office_test' AND status='published' AND provider_media_id IS NOT NULL AND permalink IS NOT NULL
      ORDER BY updated_at DESC LIMIT 1`).first();
    if (!officeCanary) {
      return jsonResponse(403, { success: false, error: "office_canary_required_before_secondary_publish" }, headers);
    }
  }

  const validated = validateThreadsText(body.text);
  if (!validated.ok) return jsonResponse(400, { success: false, error: validated.error, utf8_bytes: validated.bytes }, headers);
  const idempotencyKey = validThreadsIdempotencyKey(
    body.idempotency_key || request.headers.get("Idempotency-Key"),
  );
  if (!idempotencyKey) return jsonResponse(400, { success: false, error: "valid_idempotency_key_required" }, headers);

  await ensureThreadsBrandConnectorSchema(env.DB);
  const prior = await env.DB.prepare(`SELECT id,status,provider_media_id,permalink,provider_timestamp,last_error_class
    FROM hermes_social_threads_publications WHERE idempotency_key=? LIMIT 1`).bind(idempotencyKey).first();
  if (prior) {
    const status = String(prior.status || "");
    if (status === "published" || status === "published_readback_pending") {
      return jsonResponse(200, {
        success: true,
        duplicate: true,
        outcome: status,
        media_id: prior.provider_media_id || null,
        permalink: prior.permalink || null,
        provider_timestamp: prior.provider_timestamp || null,
      }, headers);
    }
    return jsonResponse(409, {
      success: false,
      error: "idempotency_key_already_used",
      prior_status: status,
      retry_allowed: false,
    }, headers);
  }

  const token: any = await usableThreadsAccessToken(env.DB, env, brand);
  if (!token.ok) return jsonResponse(409, { success: false, error: token.error_class }, headers);

  const fingerprint = await threadsTextFingerprint(validated.text);
  const now = new Date().toISOString();
  const id = `threads-pub-${crypto.randomUUID()}`;
  const reservation = await env.DB.prepare(`INSERT OR IGNORE INTO hermes_social_threads_publications
    (id,brand_key,object_type,idempotency_key,text_fingerprint,status,provider_media_id,permalink,
     provider_timestamp,metrics_json,metrics_updated_at,requested_by,created_at,updated_at,last_error_class)
    VALUES (?,?,'AUTHORED_POST',?,?,'publishing',NULL,NULL,NULL,NULL,NULL,?,?,?,NULL)`)
    .bind(id, brand, idempotencyKey, fingerprint, String(owner.specialist.id), now, now).run();
  const reservedByThisRequest = Number(reservation?.meta?.changes || 0) === 1;
  if (!reservedByThisRequest) {
    const raced = await env.DB.prepare(`SELECT id,status,provider_media_id,permalink,provider_timestamp,last_error_class
      FROM hermes_social_threads_publications WHERE idempotency_key=? LIMIT 1`).bind(idempotencyKey).first();
    if (raced && ["published","published_readback_pending","publishing"].includes(String(raced.status || ""))) {
      return jsonResponse(200, {
        success:true,
        duplicate:true,
        outcome:String(raced.status || ""),
        media_id:raced.provider_media_id || null,
        permalink:raced.permalink || null,
        provider_timestamp:raced.provider_timestamp || null,
        retry_allowed:false,
      }, headers);
    }
    return jsonResponse(409, {
      success:false,
      error:"idempotency_key_already_used",
      prior_status:raced?.status || "unknown",
      retry_allowed:false,
    }, headers);
  }

  const published: any = await publishThreadsText(
    token.access_token,
    String(token.connection.threads_user_id || ""),
    validated.text,
  );
  if (!published.ok) {
    const nextStatus = published.error_class === "provider_outcome_unknown" ? "unknown_outcome" : "provider_rejected";
    await env.DB.prepare(`UPDATE hermes_social_threads_publications
      SET status=?,last_error_class=?,updated_at=? WHERE id=?`)
      .bind(nextStatus, published.error_class, new Date().toISOString(), id).run();
    return jsonResponse(
      nextStatus === "unknown_outcome" ? 502 : 422,
      {
        success: false,
        error: published.error_class,
        outcome: nextStatus,
        retry_allowed: false,
        idempotency_key: idempotencyKey,
      },
      headers,
    );
  }

  await env.DB.prepare(`UPDATE hermes_social_threads_publications
    SET provider_media_id=?,status='published_readback_pending',updated_at=? WHERE id=?`)
    .bind(published.media_id, new Date().toISOString(), id).run();

  const readback: any = await readThreadsMedia(token.access_token, published.media_id);
  if (!readback.ok) {
    await env.DB.prepare(`UPDATE hermes_social_threads_publications
      SET last_error_class=?,updated_at=? WHERE id=?`)
      .bind(readback.error_class, new Date().toISOString(), id).run();
    return jsonResponse(202, {
      success: true,
      outcome: "published_readback_pending",
      media_id: published.media_id,
      idempotency_key: idempotencyKey,
      retry_allowed: false,
    }, headers);
  }

  await env.DB.prepare(`UPDATE hermes_social_threads_publications
    SET status='published',permalink=?,provider_timestamp=?,last_error_class=NULL,updated_at=? WHERE id=?`)
    .bind(readback.media.permalink || null, readback.media.timestamp || null, new Date().toISOString(), id).run();

  return jsonResponse(201, {
    success: true,
    outcome: "published",
    object_type: "AUTHORED_POST",
    brand,
    media_id: published.media_id,
    permalink: readback.media.permalink || null,
    provider_timestamp: readback.media.timestamp || null,
    username: readback.media.username || null,
    utf8_bytes: validated.bytes,
    idempotency_key: idempotencyKey,
  }, headers);
}
