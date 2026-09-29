import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureThreadsBrandConnectorSchema,
  normalizeThreadsBrand,
  readThreadsMedia,
  readThreadsMediaInsights,
  usableThreadsAccessToken,
} from "../../../_lib/threads-brand-connector.mjs";

type Env = {
  DB?: any;
  THREADS_BRAND_APP_ID?: string;
  THREADS_BRAND_APP_SECRET?: string;
  THREADS_BRAND_REDIRECT_URI?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
  THREADS_BRAND_SCOPES?: string;
};

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const clean = (value: unknown, max = 240) => String(value ?? "").trim().slice(0, max);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);

  const url = new URL(request.url);
  const brand = normalizeThreadsBrand(url.searchParams.get("brand"));
  if (!brand) return jsonResponse(400, { success: false, error: "threads_brand_not_allowed" }, headers);
  const mediaId = clean(url.searchParams.get("media_id"), 160);

  await ensureThreadsBrandConnectorSchema(env.DB);
  if (!mediaId) {
    const rows = await env.DB.prepare(`SELECT brand_key,object_type,idempotency_key,status,provider_media_id,permalink,
      provider_timestamp,metrics_json,metrics_updated_at,created_at,updated_at,last_error_class
      FROM hermes_social_threads_publications
      WHERE brand_key=? ORDER BY created_at DESC LIMIT 20`).bind(brand).all();
    return jsonResponse(200, {
      success: true,
      brand,
      publications: (rows?.results || []).map((row: any) => ({
        ...row,
        metrics: row.metrics_json ? JSON.parse(String(row.metrics_json)) : null,
        metrics_json: undefined,
      })),
    }, headers);
  }

  const row = await env.DB.prepare(`SELECT id,provider_media_id FROM hermes_social_threads_publications
    WHERE brand_key=? AND provider_media_id=? LIMIT 1`).bind(brand, mediaId).first();
  if (!row) return jsonResponse(404, { success: false, error: "publication_not_found" }, headers);

  const token = await usableThreadsAccessToken(env.DB, env, brand);
  if (!token.ok) return jsonResponse(409, { success: false, error: token.error_class }, headers);

  const media = await readThreadsMedia(token.access_token, mediaId);
  const insights = await readThreadsMediaInsights(token.access_token, mediaId);
  const metrics = insights.ok ? insights.metrics : null;
  const now = new Date().toISOString();

  if (media.ok || insights.ok) {
    await env.DB.prepare(`UPDATE hermes_social_threads_publications
      SET permalink=COALESCE(?,permalink),provider_timestamp=COALESCE(?,provider_timestamp),
          metrics_json=?,metrics_updated_at=?,last_error_class=?,updated_at=? WHERE id=?`)
      .bind(
        media.ok ? media.media.permalink || null : null,
        media.ok ? media.media.timestamp || null : null,
        metrics ? JSON.stringify(metrics) : null,
        metrics ? now : null,
        insights.ok ? null : insights.error_class,
        now,
        row.id,
      ).run();
  }

  return jsonResponse(200, {
    success: true,
    brand,
    media: media.ok ? media.media : null,
    metrics,
    media_readback: media.ok ? "verified" : media.error_class,
    insights_readback: insights.ok ? "verified" : insights.error_class,
  }, headers);
}
