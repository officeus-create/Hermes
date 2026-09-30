import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  listBusinessSocialConnections,
  resolveOwnedSocialBusiness,
} from "../../_lib/business-social.mjs";

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

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "authentication_required" }, headers);
  const vertical = new URL(request.url).searchParams.get("vertical") || "";
  const business = await resolveOwnedSocialBusiness(env.DB, specialist.id, vertical);
  if (!business) return jsonResponse(409, { success: false, error: "business_profile_required" }, headers);
  const connections = await listBusinessSocialConnections(env.DB, env, business);
  return jsonResponse(200, {
    success: true,
    business: {
      name: business.business_name,
      vertical: business.vertical_key,
      city: business.city,
      state: business.state,
    },
    connections,
    scheduling: {
      mode: "existing_publisher_only",
      note: "This CRM surface publishes owner-approved posts now. Recurring scheduling remains in the canonical Hermes Social Publisher.",
    },
  }, headers);
}
