import { requireInternalOwner } from "../../../_lib/internal-ai.mjs";
import { jsonResponse } from "../../../_lib/session.mjs";
import {
  listThreadsConnections,
  threadsBrandRuntimeConfig,
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
};

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env);
  if (owner.response) return owner.response;
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, headers);

  return jsonResponse(200, {
    success: true,
    provider: "threads",
    architecture_owner: "github_issue_1018_growth_bridge",
    runtime_configured: Boolean(threadsBrandRuntimeConfig(env)),
    hermes_logistics_provider: "windsor_only",
    hermes_logistics_custom_connector_allowed: false,
    connections: await listThreadsConnections(env.DB, env),
  }, headers);
}
