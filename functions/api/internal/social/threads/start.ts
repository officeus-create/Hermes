import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  createThreadsOAuthState,
  normalizeThreadsBrand,
  threadsAuthorizationUrl,
  threadsBrandRuntimeConfig,
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
  if (!threadsBrandRuntimeConfig(env)) {
    return jsonResponse(503, { success: false, error: "threads_brand_runtime_not_configured" }, headers);
  }

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, headers); }

  const brand = normalizeThreadsBrand(body.brand);
  if (!brand) return jsonResponse(400, { success: false, error: "threads_brand_not_allowed" }, headers);

  const state = await createThreadsOAuthState(env.DB, { brand, ownerId: owner.specialist.id });
  const authorizationUrl = threadsAuthorizationUrl(env, state);
  if (!authorizationUrl) return jsonResponse(503, { success: false, error: "threads_brand_runtime_not_configured" }, headers);

  return jsonResponse(200, {
    success: true,
    brand,
    authorization_url: authorizationUrl,
    note: "Owner OAuth is required. No account is treated as verified until profile readback is explicitly confirmed.",
  }, headers);
}
