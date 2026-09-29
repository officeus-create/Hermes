import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import { sameOriginMutation } from "../../_lib/load-board-market-posts.mjs";
import {
  listBusinessSocialConnections,
  normalizeBusinessSocialProvider,
  resolveOwnedSocialBusiness,
  saveMetaCandidateSelection,
} from "../../_lib/business-social.mjs";

type Env = { DB?: any; HERMES_SOCIAL_TOKEN_KEY?: string; THREADS_BRAND_TOKEN_KEY?: string };
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
  if (provider !== "facebook" && provider !== "instagram") {
    return jsonResponse(400, { success: false, error: "provider_selection_not_supported" }, headers);
  }
  const business = await resolveOwnedSocialBusiness(env.DB, specialist.id, String(body.vertical || ""));
  if (!business) return jsonResponse(409, { success: false, error: "business_profile_required" }, headers);
  const selected = await saveMetaCandidateSelection(env.DB, env, {
    business,
    ownerId: specialist.id,
    provider,
    candidateIndex: body.candidate_index,
  });
  if (!selected.ok) return jsonResponse(409, { success: false, error: selected.error_class }, headers);
  const connections = await listBusinessSocialConnections(env.DB, env, business);
  return jsonResponse(200, { success: true, connections }, headers);
}
