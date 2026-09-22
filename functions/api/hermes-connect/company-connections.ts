import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import { ensureHermesCompanyProfilesSchema } from "../_lib/hermes-company-profiles.mjs";
import { getOwnedHermesCompany, sameOriginMutation } from "../_lib/load-board-market-posts.mjs";
import {
  cleanConnectionText,
  listCompanyConnections,
  upsertCompanyConnection,
} from "../_lib/company-connections.mjs";
import { recordDealerActivity } from "../_lib/dealer-crm.mjs";

type Env = {
  DB?: any;
  HERMES_META_APP_ID?: string;
  HERMES_META_OAUTH_REDIRECT_URI?: string;
};

const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };
const SOCIAL_PROVIDERS = new Set(["facebook", "instagram", "threads"]);
const PROVIDERS = ["website", "facebook", "instagram", "threads"];

function defaultConnection(provider: string, metaConfigured: boolean) {
  if (provider === "website") {
    return {
      provider,
      state: "not_configured",
      mode: "none",
      source_url: null,
      external_account_ref: null,
      last_verified_at: null,
      last_error: null,
      metadata: null,
    };
  }
  return {
    provider,
    state: metaConfigured ? "ready_for_owner_auth" : "configuration_required",
    mode: "none",
    source_url: null,
    external_account_ref: null,
    last_verified_at: null,
    last_error: null,
    metadata: { oauth_required: true, platform: "meta" },
  };
}

function withDefaults(rows: any[], metaConfigured: boolean) {
  const byProvider = new Map(rows.map((row) => [String(row.provider), row]));
  return PROVIDERS.map((provider) => byProvider.get(provider) || defaultConnection(provider, metaConfigured));
}

async function ownedDealer(request: Request, env: Env) {
  if (!env.DB) return { error: jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { error: jsonResponse(401, { success: false, error: "authentication_required" }, privateHeaders) };
  await ensureHermesCompanyProfilesSchema(env.DB);
  const company = await getOwnedHermesCompany(env.DB, specialist.id);
  if (!company) return { error: jsonResponse(403, { success: false, error: "registered_company_required" }, privateHeaders) };
  if (String(company.company_type) !== "dealer") {
    return { error: jsonResponse(403, { success: false, error: "dealer_company_required" }, privateHeaders) };
  }
  return { specialist, company };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const context = await ownedDealer(request, env);
  if (context.error) return context.error;
  const metaConfigured = Boolean(
    cleanConnectionText(env.HERMES_META_APP_ID, 160)
    && cleanConnectionText(env.HERMES_META_OAUTH_REDIRECT_URI, 500),
  );
  const rows = await listCompanyConnections(env.DB, context.company.id);
  return jsonResponse(200, {
    success: true,
    company: { id: context.company.id, name: context.company.company_name, type: context.company.company_type },
    meta_oauth_configured: metaConfigured,
    connections: withDefaults(rows, metaConfigured),
  }, privateHeaders);
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "same_origin_required" }, privateHeaders);
  const context = await ownedDealer(request, env);
  if (context.error) return context.error;

  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders); }

  const provider = cleanConnectionText(body.provider, 48).toLowerCase();
  const action = cleanConnectionText(body.action, 48).toLowerCase() || "prepare";
  if (!SOCIAL_PROVIDERS.has(provider)) {
    return jsonResponse(400, { success: false, error: "social_provider_invalid" }, privateHeaders);
  }
  if (action !== "prepare") {
    return jsonResponse(400, { success: false, error: "unsupported_connection_action" }, privateHeaders);
  }

  const metaConfigured = Boolean(
    cleanConnectionText(env.HERMES_META_APP_ID, 160)
    && cleanConnectionText(env.HERMES_META_OAUTH_REDIRECT_URI, 500),
  );
  const row = await upsertCompanyConnection(env.DB, {
    companyId: context.company.id,
    provider,
    state: metaConfigured ? "ready_for_owner_auth" : "configuration_required",
    mode: "none",
    metadata: {
      oauth_required: true,
      platform: "meta",
      owner_authorization_required: true,
      auto_publish_enabled: false,
      dm_automation_enabled: false,
    },
  });
  await recordDealerActivity(env.DB, {
    companyId: context.company.id,
    actorId: context.specialist.id,
    eventType: "social_connection_prepared",
    entityType: "connection",
    entityId: String(row?.id || provider),
    summary: metaConfigured
      ? provider + " connector prepared for owner OAuth; no connected claim or autonomous publishing enabled."
      : provider + " connector remains configuration-required; no connected claim or autonomous publishing enabled.",
  });

  return jsonResponse(200, {
    success: true,
    connection: row,
    oauth: {
      configured: metaConfigured,
      authorization_required: true,
      authorization_url: null,
      note: metaConfigured
        ? "Meta application configuration is present. The owner OAuth exchange must be completed before this provider can become connected."
        : "Meta application configuration is not present in this runtime. The connector remains configuration-required.",
    },
  }, privateHeaders);
}
