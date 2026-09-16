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
  TELEGRAM_ALLOWED_CONSENT_SCOPES,
  TELEGRAM_CONNECTOR_MANIFEST,
  flattenTelegramText,
  isOwnerAuthoredExportMessage,
  normalizeTelegramExportMessage,
  normalizeTelegramUpdate,
  shouldIngestExportMessage,
  shouldIngestLiveMessage,
} from "../functions/api/_lib/telegram-connector.mjs";

function assert(condition, message) { if (!condition) throw new Error(message); }

assert(CONNECTOR_CONTRACT_VERSION === "1.0", "Connector contract version must remain explicit.");
assert(validateConnectorManifest(TELEGRAM_CONNECTOR_MANIFEST).provider === "telegram", "Telegram manifest must satisfy shared runtime contract.");
assert(TELEGRAM_CONNECTOR_MANIFEST.default_mode === "read_only", "Telegram must default to read-only.");
assert(TELEGRAM_CONNECTOR_MANIFEST.privacy_default === "owner_authored_only", "Telegram v0.1 must remain owner-authored only.");
assert(TELEGRAM_ALLOWED_CONSENT_SCOPES.size === 1 && TELEGRAM_ALLOWED_CONSENT_SCOPES.has("owner_content"), "Telegram v0.1 must not accept ambient third-party corpus scopes.");

const sanitized = sanitizeConnectionConfig({
  ingestion_policy: "owner_authored_only",
  bot_token: "must-not-survive",
  webhookSecret: "must-not-survive",
  nested: { api_key: "must-not-survive", safe_label: "ok" },
});
assert(!("bot_token" in sanitized) && !("webhookSecret" in sanitized), "Secrets must not survive connector config sanitization.");
assert(sanitized.nested.safe_label === "ok" && !("api_key" in sanitized.nested), "Secret stripping must recurse without removing safe data.");

const hashA = await sha256Hex("hermes-secret-test-value");
assert(hashA.length === 64 && secureEqualHex(hashA, await sha256Hex("hermes-secret-test-value")), "Webhook verifier hashing must be stable SHA-256 hex.");
assert(!secureEqualHex(hashA, await sha256Hex("different")), "Webhook verifier comparison must reject different secrets.");
assert(flattenTelegramText(["Hello ", { type: "bold", text: "Hermes" }]) === "Hello Hermes", "Desktop rich text must flatten deterministically.");

const privateOwnerUpdate = normalizeTelegramUpdate({
  update_id: 42,
  message: {
    message_id: 11,
    date: 1_700_000_000,
    chat: { id: 12345, type: "private" },
    from: { id: 12345, first_name: "Owner" },
    text: "Decision: ship connector runtime.",
  },
});
assert(shouldIngestLiveMessage(privateOwnerUpdate, { owner_telegram_user_id: "12345" }, { consent_scope: "owner_content" }), "Direct owner-to-bot message must be accepted after source approval.");

const channelUpdate = normalizeTelegramUpdate({
  update_id: 43,
  channel_post: {
    message_id: 12,
    date: 1_700_000_000,
    chat: { id: -100123, type: "channel", title: "Hermes Updates" },
    sender_chat: { id: -100123, title: "Hermes Updates" },
    text: "Ambient channel corpus",
  },
});
assert(!shouldIngestLiveMessage(channelUpdate, { owner_telegram_user_id: "12345" }, { consent_scope: "owner_content" }), "Ambient channel posts must be rejected in Telegram v0.1.");

const exportChat = { id: 777, name: "Work group", type: "private_group" };
const ownerExport = normalizeTelegramExportMessage(exportChat, {
  id: 9, type: "message", date: "2026-09-16T00:00:00", from: "Owner", from_id: "user12345",
  text: ["Task: ", { type: "bold", text: "finish Telegram connector" }],
});
const otherExport = normalizeTelegramExportMessage(exportChat, {
  id: 10, type: "message", date: "2026-09-16T00:01:00", from: "Other", from_id: "user999",
  text: "Other participant content",
});
assert(ownerExport?.message?.text === "Task: finish Telegram connector", "Desktop export message text must normalize.");
assert(isOwnerAuthoredExportMessage(ownerExport, "12345"), "Configured owner message must be recognized.");
assert(shouldIngestExportMessage(ownerExport, { owner_telegram_user_id: "12345" }, { consent_scope: "owner_content" }), "Owner-authored historical content may be imported from an approved source.");
assert(!shouldIngestExportMessage(otherExport, { owner_telegram_user_id: "12345" }, { consent_scope: "owner_content" }), "Other participant historical content must be rejected.");
assert(!shouldIngestExportMessage(ownerExport, { owner_telegram_user_id: "12345" }, { consent_scope: "explicit_opt_in" }), "Telegram v0.1 must not silently widen to another consent scope.");

const root = new URL("../", import.meta.url).pathname;
const runtimeSource = await readFile(join(root, "functions", "api", "_lib", "connector-runtime.mjs"), "utf8");
const purgeSource = await readFile(join(root, "functions", "api", "_lib", "telegram-connector-purge.mjs"), "utf8");
const webhookSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "webhook.ts"), "utf8");
const connectionSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "connection.ts"), "utf8");
const sourceRoute = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "sources.ts"), "utf8");
const importSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "historical-import.ts"), "utf8");
const messagesSource = await readFile(join(root, "functions", "api", "hermes-connect", "connectors", "telegram", "messages.ts"), "utf8");

for (const table of ["hc_connections","hc_connection_verifiers","hc_sources","hc_raw_events","hc_messages","hc_sync_runs","hc_checkpoints","hc_knowledge_items","hc_audit_events","hc_dead_letters"]) {
  assert(runtimeSource.includes(table), `Connector runtime schema must include ${table}.`);
}
assert(webhookSource.includes("X-Telegram-Bot-Api-Secret-Token"), "Webhook must verify Telegram secret-token header.");
assert(!webhookSource.includes("TELEGRAM_BOT_TOKEN"), "Inbound webhook must not depend on plaintext bot token.");
assert(connectionSource.includes("mode: \"read_only\""), "Connection creation must remain read-only.");
assert(connectionSource.includes("telegram_v0_1_owner_authored_only"), "Connection API must reject broader Telegram ingestion policies.");
assert(connectionSource.indexOf("invalid_webhook_secret_format") < connectionSource.indexOf("createConnection(env.DB"), "Invalid verifier must fail before persistence.");
assert(connectionSource.includes("purgeTelegramConnectionData"), "Revocation must purge Telegram-derived content.");
for (const table of ["hc_messages", "hc_raw_events", "hc_sources", "hc_connection_verifiers", "hc_knowledge_items"]) {
  assert(purgeSource.includes(`DELETE FROM ${table}`), `Purge must delete ${table} data.`);
}
assert(sourceRoute.includes("telegram_v0_1_owner_content_only"), "Source API must not accept broader Telegram content scope.");
assert(importSource.includes("MAX_MESSAGES_PER_IMPORT = 200"), "Historical import must remain bounded.");
assert(messagesSource.includes("getAuthenticatedSpecialist"), "Private search must require Hermes authentication.");

console.log("Hermes Connector Runtime contract passed: Telegram v0.1 is read-only, owner-authored only, direct-message live, historical-import bounded, secret-minimized, purgeable, and privately searchable.");
