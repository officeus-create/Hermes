import { jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureConnectorRuntimeSchema,
  getConnection,
  getSource,
  safeJson,
  verifyConnectionSecret,
} from "../../../_lib/connector-runtime.mjs";
import {
  ingestTelegramNormalizedEvent,
  normalizeTelegramUpdate,
  shouldIngestLiveMessage,
} from "../../../_lib/telegram-connector.mjs";

type Env = { DB?: any };

const privateHeaders = { "Cache-Control": "no-store" };

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const connectionId = new URL(request.url).searchParams.get("connection_id") || "";
  if (!connectionId) return jsonResponse(400, { success: false, error: "connection_id_required" }, privateHeaders);

  await ensureConnectorRuntimeSchema(env.DB);
  const connection = await getConnection(env.DB, connectionId);
  if (!connection || connection.provider !== "telegram" || connection.revoked_at || connection.state === "revoked") {
    return jsonResponse(404, { success: false, error: "connection_not_found" }, privateHeaders);
  }

  const providedSecret = request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "";
  if (!(await verifyConnectionSecret(env.DB, connection.id, providedSecret))) {
    return jsonResponse(401, { success: false, error: "invalid_webhook_verifier" }, privateHeaders);
  }

  let update: Record<string, unknown>;
  try {
    update = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }

  const normalized = normalizeTelegramUpdate(update);
  if (!normalized?.message) {
    return jsonResponse(200, { success: true, accepted: false, reason: "unsupported_update" }, privateHeaders);
  }

  const config = safeJson(connection.config_json);
  const source = await getSource(env.DB, connection.id, normalized.message.chat_id);
  if (!source || Number(source.ingestion_enabled) !== 1 || !shouldIngestLiveMessage(normalized, config, source)) {
    return jsonResponse(200, { success: true, accepted: false, reason: "source_not_approved_or_not_owner_direct" }, privateHeaders);
  }

  const result = await ingestTelegramNormalizedEvent(env.DB, connection, normalized, {
    source,
    rawPayload: update as any,
    retainRawPayload: config.retain_raw_events === true,
  });

  // Rejected ambient updates deliberately return HTTP 200 so Telegram does not retry them.
  return jsonResponse(200, { success: true, ...result }, privateHeaders);
}
