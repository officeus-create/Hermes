import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureThreadsBrandConnectorSchema,
  normalizeThreadsBrand,
  publicThreadsConnection,
  threadsBrandExpectedUsername,
} from "../../../_lib/threads-brand-connector.mjs";

type Env = {
  DB?: any;
  THREADS_OFFICE_TEST_PUBLISH_ENABLED?: string;
  THREADS_PROGRESSOPRO_PUBLISH_ENABLED?: string;
  THREADS_BUSINESS_ACADEMY_PUBLISH_ENABLED?: string;
};

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const clean = (value: unknown, max = 240) => String(value ?? "").trim().slice(0, max);

function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOrigin(request)) return jsonResponse(403, { success: false, error: "invalid_origin" }, headers);
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, headers); }

  const brand = normalizeThreadsBrand(body.brand);
  const confirmedUsername = clean(body.username, 160).replace(/^@/, "");
  if (!brand) return jsonResponse(400, { success: false, error: "threads_brand_not_allowed" }, headers);
  if (body.confirm !== true || !confirmedUsername) {
    return jsonResponse(400, { success: false, error: "explicit_identity_confirmation_required" }, headers);
  }

  await ensureThreadsBrandConnectorSchema(env.DB);
  const row = await env.DB.prepare(`SELECT * FROM hermes_social_threads_connections WHERE brand_key=? LIMIT 1`).bind(brand).first();
  if (!row) return jsonResponse(404, { success: false, error: "threads_connection_not_found" }, headers);
  if (confirmedUsername.toLowerCase() !== String(row.username || "").toLowerCase()) {
    return jsonResponse(409, {
      success: false,
      error: "username_confirmation_mismatch",
      connected_username: String(row.username || ""),
    }, headers);
  }

  const expectedUsername = threadsBrandExpectedUsername(brand, env);
  if (expectedUsername && confirmedUsername.toLowerCase() !== expectedUsername.toLowerCase()) {
    return jsonResponse(409, {
      success: false,
      error: "canonical_brand_username_mismatch",
      expected_username: expectedUsername,
      connected_username: String(row.username || ""),
    }, headers);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE hermes_social_threads_connections
    SET identity_verified=1,state='connected_verified',verified_by=?,verified_at=?,updated_at=?,last_error_class=NULL
    WHERE brand_key=?`).bind(String(owner.specialist.id), now, now, brand).run();

  const verified = await env.DB.prepare(`SELECT brand_key,state,threads_user_id,username,display_name,biography,
    profile_picture_url,token_expires_at,granted_scope,identity_verified,verified_at,updated_at,last_error_class
    FROM hermes_social_threads_connections WHERE brand_key=? LIMIT 1`).bind(brand).first();

  return jsonResponse(200, {
    success: true,
    connection: publicThreadsConnection(verified, env),
  }, headers);
}
