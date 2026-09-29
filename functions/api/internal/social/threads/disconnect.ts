import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureThreadsBrandConnectorSchema,
  normalizeThreadsBrand,
} from "../../../_lib/threads-brand-connector.mjs";

type Env = { DB?: any };

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

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
  if (!brand) return jsonResponse(400, { success: false, error: "threads_brand_not_allowed" }, headers);
  if (body.confirm !== true) {
    return jsonResponse(400, { success: false, error: "explicit_disconnect_confirmation_required" }, headers);
  }

  await ensureThreadsBrandConnectorSchema(env.DB);
  const existing = await env.DB.prepare(
    "SELECT username,threads_user_id FROM hermes_social_threads_connections WHERE brand_key=? LIMIT 1"
  ).bind(brand).first();

  if (existing) {
    await env.DB.prepare("DELETE FROM hermes_social_threads_connections WHERE brand_key=?").bind(brand).run();
  }

  return jsonResponse(200, {
    success: true,
    brand,
    disconnected: Boolean(existing),
    provider_access_revoked: false,
    note: "The encrypted Hermes-side token record was removed. Revoke provider authorization separately in Meta/Threads when full provider revocation is required.",
  }, headers);
}
