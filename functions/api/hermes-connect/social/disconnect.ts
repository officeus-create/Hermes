import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import {
  disconnectBusinessSocial,
  listBusinessSocialConnections,
  normalizeBusinessSocialProvider,
  resolveOwnedSocialBusiness,
} from "../../_lib/business-social.mjs";

type Env = { DB?: any };
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
  if (body.confirm !== true) return jsonResponse(400, { success: false, error: "disconnect_confirmation_required" }, headers);
  const business = await resolveOwnedSocialBusiness(env.DB, specialist.id, String(body.vertical || ""));
  if (!business) return jsonResponse(409, { success: false, error: "business_profile_required" }, headers);
  await disconnectBusinessSocial(env.DB, business, provider, specialist.id);
  const connections = await listBusinessSocialConnections(env.DB, env, business);
  return jsonResponse(200, { success: true, connections }, headers);
}
