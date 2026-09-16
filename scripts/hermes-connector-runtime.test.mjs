import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  CONNECTOR_CONTRACT_VERSION,
  sanitizeConnectionConfig,
  secureEqualHex,
  sha256Hex,
  validateConnectorManifest,
} from "../functions/api/_lib/connector-runtime.mjs";
import {
  TELEGRAM_CONNECTOR_MANIFEST,
  flattenTelegramText,
  isOwnerAuthoredExportMessage,
  normalizeTelegramExportMessage,
  normalizeTelegramUpdate,
  shouldIngestExportMessage,
  shouldIngestLiveMessage,
} from "../functions/api/_lib/telegram-connector.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(CONNECTOR_CONTRACT_VERSION === "1.0", "Connector contract version must remain explicit.");
assert(validateConnectorManifest(TELEGRAM_CONNECTOR_MANIFEST).provider === "telegram", "Telegram manifest must satisfy the shared runtime contract.");
assert(TELEGRAM_CONNECTOR_MANIFEST.default_mode === "read_only", "Telegram must default to read-only.");
assert(TELEGRAM_CONNECTOR_MANIFEST.write_policy.includes("confirmation_wall"), "Outbound actions must remain confirmation-gated.");

const sanitized = sanitizeConnectionConfig({
  ingestion_policy: "owner_authored_only",
  bot_token: "must-not-survive",
  webhookSecret: "must-not-survive",
  nested: { api_key: "must-not-survive", safe_label: "ok" },
  nested_safe_label: "ok",
});
assert(!("bot_token" in sanitized), "Connector config must remove token-like top-level fields.");
assert(!("webhookSecret" in sanitized), "Connector config must remove secret-like top-level fields.");
assert(sanitized.nested_safe_label === "ok" && sanitized.nested.safe_label === "ok", "Connector config must preserve non-secret configuration.");
assert(!("api_key" in sanitized.nested), "Connector config must recursively remove secret-like fields.");

const hashA = await sha256Hex("hermes-secret-test-value");
const hashB = await sha256Hex("hermes-secret-test-value");
assert(hashA.length === 64 && secureEqualHex(hashA, hashB), "Webhook verifier hashing must be stable SHA-256 hex.");
assert(!secureEqualHex(hashA, await sha256Hex("different")), "Webhook verifier comparison must reject different secrets.");

assert(flattenTelegramText(["Hello ", { type: "bold", text: "Hermes" }]) === "Hello Hermes", "Telegram Desktop rich text must flatten deterministically.");

const normalizedLive = normalizeTelegramUpdate({
  update_id: 42,
  channel_post: {
    message_id: 11,
    date: 1_700_000_000,
    chat: { id: -100123, type: "channel", title: "Hermes Updates" },
    sender_chat: { id: -100123, title: "Hermes Updates" },
    text: "Decision: ship connector runtime.",
  },
});
assert(normalizedLive?.event_id === "update:42", "Telegram update id must become the idempotency key.");
assert(normalizedLive?.message?.chat_id === "-100123", "Telegram chat id must be normalized as text.");
assert(normalizedLive?.message?.text.includes("Decision"), "Telegram text must survive normalization.");

const exportChat = { id: 777, name: "Saved", type: "saved_messages" };
const normalizedExport = normalizeTelegramExportMessage(exportChat, {
  id: 9,
  type: "message",
  date: "2026-09-16T00:00:00",
  from: "Owner",
  from_id: "user12345",
  text: ["Task: ", { type: "bold", text: "finish Telegram connector" }],
});
assert(normalizedExport?.message?.text === "Task: finish Telegram connector", "Desktop export message text must normalize.");
assert(isOwnerAuthoredExportMessage(normalizedExport, "12345"), "Owner-authored export policy must accept the configured owner id.");
assert(shouldIngestExportMessage(normalizedExport, { ingestion_policy: "owner_authored_only", owner_telegram_user_id: "12345" }, { consent_scope: "owner_content", source_type: "saved_messages" }), "Owner-authored policy must ingest owner content.");
assert(!shouldIngestExportMessage(normalizedExport, { ingestion_policy: "owner_authored_only", owner_telegram_user_id: "999" }, { consent_scope: "owner_content", source_type: "saved_messages" }), "Owner-authored policy must reject other authors.");
assert(shouldIngestExportMessage(normalizedExport, { ingestion_policy: "approved_sources" }, { consent_scope: "explicit_opt_in", source_type: "group" }), "Approved-source policy must allow explicitly opted-in source content.");
assert(!shouldIngestExportMessage(normalizedExport, { ingestion_policy: "approved_sources", owner_telegram_user_id: "999" }, { consent_scope: "owner_content", source_type: "group" }), "Owner-content group scope must not silently ingest other authors.");
assert(shouldIngestLiveMessage(normalizedLive, { owner_telegram_user_id: "12345" }, { consent_scope: "owner_content", source_type: "channel" }), "Owner-controlled channel posts may be ingested when the source is explicitly approved as owner content.");

const root = new URL("../", import.meta.url).pathname;
const runtimeSource = await readFile(join(root, "functions", "api", "_lib", "connector-runtime.mjs"), "utf8");
const webhookSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "webhook.ts"), "utf8");
const connectionSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "connection.ts"), "utf8");
const importSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "historical-import.ts"), "utf8");
const messagesSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "messages.ts"), "utf8");

for (const table of [
  "hc_connections",
  "hc_connection_verifiers",
  "hc_sources",
  "hc_raw_events",
  "hc_messages",
  "hc_sync_runs",
  "hc_checkpoints",
  "hc_knowledge_items",
  "hc_audit_events",
  "hc_dead_letters",
]) {
  assert(runtimeSource.includes(table), `Connector runtime schema must include ${table}.`);
}

assert(webhookSource.includes("X-Telegram-Bot-Api-Secret-Token"), "Telegram webhook must verify Telegram's secret-token header.");
assert(webhookSource.includes("source_not_approved") || webhookSource.includes("ingestTelegramNormalizedEvent"), "Telegram webhook must default-deny unknown sources.");
assert(!webhookSource.includes("TELEGRAM_BOT_TOKEN"), "Inbound webhook must not depend on a plaintext bot token.");
assert(connectionSource.includes("mode: \"read_only\""), "Telegram connection creation must remain read-only in v0.1.");
assert(connectionSource.includes("secret_echoed: false"), "Connection response must never echo the webhook verifier.");
assert(connectionSource.indexOf("invalid_webhook_secret_format") < connectionSource.indexOf("createConnection(env.DB"), "Webhook secret format must fail before the connection is persisted.");
assert(importSource.includes("MAX_MESSAGES_PER_IMPORT = 200"), "Historical import must remain bounded per request.");
assert(messagesSource.includes("getAuthenticatedSpecialist"), "Private Telegram message search must require Hermes authentication.");

console.log("Hermes Connector Runtime contract passed: Telegram adapter is read-only, source-approved, idempotent, secret-minimized, historically importable, and privately searchable.");
