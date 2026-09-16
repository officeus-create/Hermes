import { getAuthenticatedSpecialist, jsonResponse } from "../../../_lib/session.mjs";
import {
  ensureConnectorRuntimeSchema,
  getOwnedConnection,
  getSource,
  recordAudit,
  safeJson,
} from "../../../_lib/connector-runtime.mjs";
import {
  ingestTelegramNormalizedEvent,
  normalizeTelegramExportMessage,
  shouldIngestExportMessage,
} from "../../../_lib/telegram-connector.mjs";

type Env = { DB?: any };

type TelegramExportChat = {
  id?: string | number;
  name?: string;
  type?: string;
  messages?: Array<Record<string, unknown>>;
};

type ImportPayload = {
  connection_id?: string;
  chat?: TelegramExportChat;
};

const privateHeaders = { "Cache-Control": "no-store" };
const MAX_MESSAGES_PER_IMPORT = 200;

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }, privateHeaders);
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return jsonResponse(401, { success: false, error: "not_authenticated" }, privateHeaders);

  let payload: ImportPayload;
  try {
    payload = (await request.json()) as ImportPayload;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" }, privateHeaders);
  }

  const connectionId = String(payload.connection_id || "").trim();
  const chat = payload.chat;
  const chatId = String(chat?.id ?? chat?.name ?? "").trim();
  if (!connectionId || !chat || !chatId || !Array.isArray(chat.messages)) {
    return jsonResponse(400, { success: false, error: "connection_and_export_chat_required" }, privateHeaders);
  }
  if (chat.messages.length > MAX_MESSAGES_PER_IMPORT) {
    return jsonResponse(413, {
      success: false,
      error: "import_chunk_too_large",
      max_messages: MAX_MESSAGES_PER_IMPORT,
      hint: "Split the Telegram Desktop export chat into smaller authenticated chunks.",
    }, privateHeaders);
  }

  await ensureConnectorRuntimeSchema(env.DB);
  const connection = await getOwnedConnection(env.DB, connectionId, specialist.id);
  if (!connection || connection.provider !== "telegram") {
    return jsonResponse(404, { success: false, error: "connection_not_found" }, privateHeaders);
  }
  const source = await getSource(env.DB, connection.id, chatId);
  if (!source || Number(source.ingestion_enabled) !== 1) {
    return jsonResponse(403, { success: false, error: "source_not_approved" }, privateHeaders);
  }

  const config = safeJson(connection.config_json);
  if (config.ingestion_policy !== "owner_authored_only" || !config.owner_telegram_user_id) {
    return jsonResponse(409, { success: false, error: "owner_authored_policy_required" }, privateHeaders);
  }

  let accepted = 0;
  let ignored = 0;
  let invalid = 0;
  for (const rawMessage of chat.messages) {
    const normalized = normalizeTelegramExportMessage(chat, rawMessage);
    if (!normalized) {
      invalid += 1;
      continue;
    }
    if (!shouldIngestExportMessage(normalized, config, source)) {
      ignored += 1;
      continue;
    }
    const result = await ingestTelegramNormalizedEvent(env.DB, connection, normalized, {
      source,
      rawPayload: rawMessage as any,
      retainRawPayload: config.retain_raw_events === true,
    });
    if (result.accepted) accepted += 1;
    else ignored += 1;
  }

  await recordAudit(env.DB, {
    connectionId: connection.id,
    actorSpecialistId: specialist.id,
    action: "telegram_historical_import",
    outcome: "success",
    details: { chat_id: chatId, accepted, ignored, invalid, submitted: chat.messages.length },
  });

  return jsonResponse(200, {
    success: true,
    chat_id: chatId,
    submitted: chat.messages.length,
    accepted,
    ignored,
    invalid,
    policy: "owner_authored_only",
  }, privateHeaders);
}
