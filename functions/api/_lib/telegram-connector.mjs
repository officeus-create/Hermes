import {
  CONNECTOR_CONTRACT_VERSION,
  CONSENT_SCOPES,
  getSource,
  safeJson,
  sha256Hex,
} from "./connector-runtime.mjs";

export const TELEGRAM_CONNECTOR_MANIFEST = Object.freeze({
  provider: "telegram",
  name: "Telegram",
  version: "0.1.0",
  contract_version: CONNECTOR_CONTRACT_VERSION,
  status: "foundation",
  direction: "ingest_first",
  default_mode: "read_only",
  auth_modes: ["bot_webhook", "desktop_export"],
  capabilities: [
    "source_approval",
    "live_webhook_ingest",
    "historical_chat_import",
    "idempotent_message_upsert",
    "private_message_search",
    "provenance_preservation",
  ],
  write_policy: "disabled_until_explicit_confirmation_wall",
  privacy_default: "deny_unknown_sources",
});

export const TELEGRAM_ALLOWED_CONSENT_SCOPES = CONSENT_SCOPES;

export function flattenTelegramText(value) {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.map((part) => {
    if (typeof part === "string") return part;
    if (part && typeof part === "object" && typeof part.text === "string") return part.text;
    return "";
  }).join("");
}

export function telegramAuthorName(author = {}, fallback = "") {
  const full = [author.first_name, author.last_name].filter(Boolean).join(" ").trim();
  return full || String(author.title || author.username || fallback || "").trim();
}

function messageKind(message) {
  if (message.photo) return "photo";
  if (message.video) return "video";
  if (message.document) return "document";
  if (message.voice) return "voice";
  if (message.audio) return "audio";
  if (message.sticker) return "sticker";
  if (message.location) return "location";
  if (message.poll) return "poll";
  return "text";
}

export function normalizeTelegramUpdate(update) {
  if (!update || typeof update !== "object") return null;
  const candidates = [
    ["message", update.message],
    ["edited_message", update.edited_message],
    ["channel_post", update.channel_post],
    ["edited_channel_post", update.edited_channel_post],
  ];
  const found = candidates.find(([, value]) => value && typeof value === "object");
  if (!found) return {
    event_id: `update:${String(update.update_id ?? "unknown")}`,
    event_type: "unsupported_update",
    message: null,
    update_id: update.update_id ?? null,
  };

  const [eventType, message] = found;
  const chatId = String(message.chat?.id ?? "");
  const messageId = String(message.message_id ?? "");
  if (!chatId || !messageId) return null;

  const author = message.from || message.sender_chat || {};
  const authorId = author.id == null ? null : String(author.id);
  const text = String(message.text ?? message.caption ?? "");
  const sentAt = message.date ? new Date(Number(message.date) * 1000).toISOString() : null;
  const editedAt = message.edit_date ? new Date(Number(message.edit_date) * 1000).toISOString() : null;

  return {
    event_id: `update:${String(update.update_id ?? `${chatId}:${messageId}:${eventType}`)}`,
    event_type: eventType,
    update_id: update.update_id ?? null,
    message: {
      chat_id: chatId,
      message_id: messageId,
      author_id: authorId,
      author_name: telegramAuthorName(author),
      text,
      sent_at: sentAt,
      edited_at: editedAt,
      metadata: {
        chat_type: message.chat?.type || null,
        chat_title: message.chat?.title || null,
        username: message.chat?.username || null,
        message_kind: messageKind(message),
        has_caption: Boolean(message.caption),
        forward_origin_present: Boolean(message.forward_origin || message.forward_from || message.forward_from_chat),
      },
    },
  };
}

export function normalizeTelegramExportMessage(chat, message) {
  if (!chat || !message || message.type !== "message" || message.id == null) return null;
  const chatId = String(chat.id ?? chat.name ?? "");
  if (!chatId) return null;
  const messageId = String(message.id);
  return {
    event_id: `export:${chatId}:${messageId}`,
    event_type: "desktop_export",
    message: {
      chat_id: chatId,
      message_id: messageId,
      author_id: message.from_id == null ? null : String(message.from_id),
      author_name: String(message.from || ""),
      text: flattenTelegramText(message.text),
      sent_at: message.date ? new Date(message.date).toISOString() : null,
      edited_at: message.edited ? new Date(message.edited).toISOString() : null,
      metadata: {
        chat_type: chat.type || null,
        chat_title: chat.name || null,
        message_kind: message.media_type || (message.file ? "file" : "text"),
        forward_origin_present: Boolean(message.forwarded_from),
        telegram_export_date_unixtime: message.date_unixtime || null,
      },
    },
    export_author_id: message.from_id == null ? null : String(message.from_id),
  };
}

export function isOwnerAuthoredExportMessage(normalized, ownerTelegramUserId) {
  if (!normalized?.export_author_id || !ownerTelegramUserId) return false;
  const expected = String(ownerTelegramUserId).replace(/^user/i, "");
  const actual = String(normalized.export_author_id).replace(/^user/i, "");
  return actual === expected;
}

export function shouldIngestExportMessage(normalized, connectionConfig = {}, source = {}) {
  const policy = String(connectionConfig.ingestion_policy || "owner_authored_only");
  const consentScope = String(source.consent_scope || "");
  if (policy === "owner_authored_only") {
    return isOwnerAuthoredExportMessage(normalized, connectionConfig.owner_telegram_user_id);
  }
  if (policy !== "approved_sources") return false;
  if (consentScope === "explicit_opt_in") return true;
  if (consentScope === "owner_content") {
    if (String(source.source_type || "") === "channel") return true;
    return isOwnerAuthoredExportMessage(normalized, connectionConfig.owner_telegram_user_id);
  }
  return false;
}

export function shouldIngestLiveMessage(normalized, connectionConfig = {}, source = {}) {
  if (!normalized?.message) return false;
  const consentScope = String(source.consent_scope || "");
  if (consentScope === "explicit_opt_in") return true;
  if (consentScope !== "owner_content") return false;
  const sourceType = String(source.source_type || normalized.message.metadata?.chat_type || "");
  if (sourceType === "channel") return true;
  const expected = String(connectionConfig.owner_telegram_user_id || "").replace(/^user/i, "");
  const actual = String(normalized.message.author_id || "").replace(/^user/i, "");
  return Boolean(expected && actual && expected === actual);
}

function minimizedPayload(normalized) {
  return {
    event_id: normalized.event_id,
    event_type: normalized.event_type,
    message: normalized.message,
  };
}

export async function ingestTelegramNormalizedEvent(db, connection, normalized, {
  source = null,
  receivedAt = new Date().toISOString(),
  retainRawPayload = false,
  rawPayload = null,
} = {}) {
  if (!normalized?.message) return { accepted: false, reason: "no_message" };
  const resolvedSource = source || await getSource(db, connection.id, normalized.message.chat_id);
  if (!resolvedSource || Number(resolvedSource.ingestion_enabled) !== 1) {
    return { accepted: false, reason: "source_not_approved" };
  }
  if (!TELEGRAM_ALLOWED_CONSENT_SCOPES.has(String(resolvedSource.consent_scope || ""))) {
    return { accepted: false, reason: "consent_scope_not_allowed" };
  }

  const storedPayload = retainRawPayload && rawPayload ? rawPayload : minimizedPayload(normalized);
  const payloadJson = JSON.stringify(storedPayload);
  const payloadHash = await sha256Hex(payloadJson);
  const rawEventId = `hc-raw-${crypto.randomUUID()}`;
  const messageId = `hc-msg-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const externalCreatedAt = normalized.message.edited_at || normalized.message.sent_at || null;

  await db.prepare(`
    INSERT OR IGNORE INTO hc_raw_events (
      id,connection_id,provider_event_id,source_id,event_type,payload_json,payload_sha256,
      external_created_at,received_at,processing_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'accepted')
  `).bind(
    rawEventId,
    connection.id,
    normalized.event_id,
    resolvedSource.id,
    normalized.event_type,
    payloadJson,
    payloadHash,
    externalCreatedAt,
    receivedAt,
  ).run();

  const existingRaw = await db.prepare(`
    SELECT id FROM hc_raw_events WHERE connection_id = ? AND provider_event_id = ? LIMIT 1
  `).bind(connection.id, normalized.event_id).first();
  const stableRawEventId = existingRaw?.id || rawEventId;

  await db.prepare(`
    INSERT INTO hc_messages (
      id,connection_id,source_id,external_chat_id,external_message_id,external_author_id,
      author_name,text,sent_at,edited_at,raw_event_id,metadata_json,created_at,updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(connection_id, external_chat_id, external_message_id) DO UPDATE SET
      source_id = excluded.source_id,
      external_author_id = excluded.external_author_id,
      author_name = excluded.author_name,
      text = excluded.text,
      sent_at = COALESCE(excluded.sent_at, hc_messages.sent_at),
      edited_at = excluded.edited_at,
      raw_event_id = excluded.raw_event_id,
      metadata_json = excluded.metadata_json,
      updated_at = excluded.updated_at
  `).bind(
    messageId,
    connection.id,
    resolvedSource.id,
    normalized.message.chat_id,
    normalized.message.message_id,
    normalized.message.author_id,
    normalized.message.author_name,
    normalized.message.text,
    normalized.message.sent_at,
    normalized.message.edited_at,
    stableRawEventId,
    JSON.stringify(normalized.message.metadata || {}),
    now,
    now,
  ).run();

  await db.prepare(`
    UPDATE hc_connections SET state = CASE WHEN state = 'revoked' THEN state ELSE 'active' END, last_sync_at = ?, last_error_code = NULL, updated_at = ? WHERE id = ?
  `).bind(receivedAt, now, connection.id).run();

  return {
    accepted: true,
    source_id: resolvedSource.id,
    external_chat_id: normalized.message.chat_id,
    external_message_id: normalized.message.message_id,
    raw_event_id: stableRawEventId,
  };
}

export async function searchTelegramMessages(db, connectionId, { query = "", limit = 50, before = null } = {}) {
  const boundedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const clauses = ["connection_id = ?"];
  const binds = [connectionId];
  if (String(query || "").trim()) {
    clauses.push("text LIKE ? ESCAPE '\\'");
    const escaped = String(query).replace(/[\\%_]/g, (match) => `\\${match}`);
    binds.push(`%${escaped}%`);
  }
  if (before) {
    clauses.push("COALESCE(sent_at, created_at) < ?");
    binds.push(String(before));
  }
  binds.push(boundedLimit);
  const result = await db.prepare(`
    SELECT id,source_id,external_chat_id,external_message_id,external_author_id,author_name,text,
           sent_at,edited_at,metadata_json,created_at,updated_at
    FROM hc_messages
    WHERE ${clauses.join(" AND ")}
    ORDER BY COALESCE(sent_at, created_at) DESC
    LIMIT ?
  `).bind(...binds).all();
  return (result?.results || []).map((row) => ({ ...row, metadata: safeJson(row.metadata_json) }));
}
