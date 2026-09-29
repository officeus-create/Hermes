import { getAuthenticatedSpecialist, jsonResponse } from "../../../_lib/session.mjs";
import { sameOriginMutation } from "../../../_lib/load-board-market-posts.mjs";
import {
  businessSocialAuthorizationUrl,
  businessSocialProviderConfigured,
  createBusinessSocialOAuthState,
  normalizeBusinessSocialProvider,
  resolveOwnedSocialBusiness,
  upsertBusinessSocialCredential,
} from "../../../_lib/business-social.mjs";

type Env = {
  DB?: any;
  HERMES_SOCIAL_TOKEN_KEY?: string;
  HERMES_META_APP_ID?: string;
  HERMES_META_APP_SECRET?: string;
  HERMES_META_OAUTH_REDIRECT_URI?: string;
  HERMES_META_GRAPH_VERSION?: string;
  THREADS_BRAND_APP_ID?: string;
  THREADS_BRAND_APP_SECRET?: string;
  THREADS_BRAND_REDIRECT_URI?: string;
  THREADS_BRAND_TOKEN_KEY?: string;
  THREADS_BRAND_SCOPES?: string;
};

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, headers);
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, headers);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, headers); }

  const provider = normalizeBusinessSocialProvider(body.provider);
  if (!provider) return jsonResponse(400, { success: false, error: "social_provider_invalid" }, headers);
  const vertical = String(body.vertical || "");
  const business = await resolveOwnedSocialBusiness(env.DB, specialist.id, vertical);
  if (!business) return jsonResponse(409, { success: false, error: "business_profile_required" }, headers);
  if (!businessSocialProviderConfigured(env, provider)) {
    await upsertBusinessSocialCredential(env.DB, env, {
      business,
      ownerId: specialist.id,
      provider,
      state: "configuration_required",
      lastError: "provider_runtime_not_configured",
    });
    return jsonResponse(503, { success: false, error: "provider_runtime_not_configured", provider }, headers);
  }

  const state = await createBusinessSocialOAuthState(env.DB, {
    business,
    ownerId: specialist.id,
    provider,
  });
  const authorizationUrl = businessSocialAuthorizationUrl(env, provider, state);
  if (!authorizationUrl) return jsonResponse(503, { success: false, error: "provider_runtime_not_configured" }, headers);
  await upsertBusinessSocialCredential(env.DB, env, {
    business,
    ownerId: specialist.id,
    provider,
    state: "ready_for_owner_auth",
    lastError: null,
  });
  return jsonResponse(200, { success: true, provider, authorization_url: authorizationUrl }, headers);
}
