import { getAuthenticatedSpecialist, jsonResponse } from "../../_lib/session.mjs";
import {
  CONNECTOR_CONTRACT_VERSION,
  ensureConnectorRuntimeSchema,
  listConnectionsForOwner,
  validateConnectorManifest,
} from "../../_lib/connector-runtime.mjs";
import { TELEGRAM_CONNECTOR_MANIFEST } from "../../_lib/telegram-connector.mjs";

type Env = { DB?: any };

const privateHeaders = { "Cache-Control": "no-store" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  await ensureConnectorRuntimeSchema(env.DB);
  const manifest = validateConnectorManifest(TELEGRAM_CONNECTOR_MANIFEST);
  const connections = await listConnectionsForOwner(env.DB, specialist.id);

  return jsonResponse(200, {
    success: true,
    connector_contract_version: CONNECTOR_CONTRACT_VERSION,
    providers: [manifest],
    connections,
    rules: {
      default_write_policy: "read_only",
      external_writes_require_confirmation_wall: true,
      secrets_in_connection_config: false,
      unknown_sources_ingested: false,
    },
  }, privateHeaders);
}
