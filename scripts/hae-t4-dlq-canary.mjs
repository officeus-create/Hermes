// Owner-gated T4 diagnostic. No network calls or provider writes live in this module.
// The release workflow alone owns the single direct DLQ Queue injection.
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const SHA = /^[0-9a-f]{40}$/;
const CANARY = /^hae\.t4\.canary\.[1-9][0-9]{0,17}\.[1-9][0-9]{0,4}$/;

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

export function parseT4OwnerCommand(value) {
  if (typeof value !== "string") fail("t4_command_invalid");
  const matched = /^HAE_T4_DLQ_CANARY ([0-9a-f]{40})$/.exec(value.trim());
  if (!matched) fail("t4_command_invalid");
  return matched[1];
}

export function buildT4CanaryBody(runId, attempt) {
  const type = `hae.t4.canary.${runId}.${attempt}`;
  if (!CANARY.test(type) || type.length > 80) fail("t4_canary_identity_invalid");
  return { body: { type } };
}

export function d1Rows(response) {
  if (response?.success !== true || !Array.isArray(response?.result) ||
      response.result.length !== 1 || response.result[0]?.success === false ||
      !Array.isArray(response.result[0]?.results)) {
    fail("t4_d1_response_invalid");
  }
  return response.result[0].results;
}

export function validateT4Heartbeat(response, sourceSha, now = Date.now()) {
  if (!SHA.test(sourceSha)) fail("t4_source_sha_invalid");
  const rows = d1Rows(response);
  if (rows.length !== 1) fail("t4_heartbeat_missing_or_ambiguous");
  const row = rows[0];
  if (row?.source_sha !== sourceSha || row?.automation_mode !== "dry_run" ||
      row?.publication_config !== "disabled" || Number(row?.publication_enabled) !== 0 ||
      row?.trigger_type !== "cron") fail("t4_heartbeat_runtime_mismatch");
  const observedMs = Date.parse(row?.observed_at || "");
  if (!Number.isFinite(now) || !Number.isFinite(observedMs) ||
      observedMs > now + 60_000 || now - observedMs > 150 * 60_000) {
    fail("t4_heartbeat_stale_or_future");
  }
  return { source_sha: sourceSha, status: "PASS" };
}

// Match the two canonical Cloudflare Email receipt modes. Actual provider
// Message-IDs may contain '.', '+', '@' and ':'; reject URLs, controls,
// whitespace, and unbounded or unknown receipt shapes.
export function validT4EmailReceipt(value, expectedItemId = null, providerMessageId = null) {
  if (typeof value !== "string" || value.length > 240) return false;
  if (expectedItemId !== null && !/^dlq:[a-f0-9]{32}$/.test(expectedItemId)) return false;
  const accepted = /^cloudflare-email:\/\/accepted\/(dlq:[a-f0-9]{32})$/.exec(value);
  if (accepted) return expectedItemId === null || accepted[1] === expectedItemId;
  const message = /^cloudflare-email:\/\/message\/([A-Za-z0-9._@:+-]{8,180})$/.exec(value);
  return Boolean(message && providerMessageId === message[1]);
}

export function validateT4Receipt(response, expectedMessageType) {
  if (!CANARY.test(expectedMessageType)) fail("t4_canary_identity_invalid");
  const rows = d1Rows(response);
  if (rows.length === 0) return { status: "PENDING" };
  if (rows.length !== 1) fail("t4_duplicate_d1_items");
  const row = rows[0];
  if (row?.message_type !== expectedMessageType || !/^dlq:[a-zA-Z0-9_-]+$/.test(String(row?.dlq_item_id || ""))) {
    fail("t4_receipt_identity_mismatch");
  }
  if (row?.disposition !== "QUARANTINE" || row?.reason !== "idempotency_key_missing" ||
      row?.action_status !== "QUARANTINED" || Number(row?.redrive_count) !== 0) {
    fail("t4_receipt_policy_mismatch");
  }
  if (row?.alert_status === "PENDING_OWNER_ALERT" ||
      row?.alert_status === "ALERT_SENDING") {
    if (Number(row.alert_attempt_count) > 1) fail("t4_multiple_alert_attempts");
    return { status: "PENDING" };
  }
  if (row?.alert_status !== "DELIVERED") fail("t4_alert_ambiguous_or_failed");
  if (Number(row?.alert_attempt_count) !== 1 ||
      row?.alert_channel !== "cloudflare_email" ||
      !validT4EmailReceipt(row?.alert_receipt_ref, row?.dlq_item_id, row?.alert_provider_message_id)) {
    fail("t4_alert_receipt_invalid");
  }
  return {
    status: "PASS",
    dlq_item_id: row.dlq_item_id,
    message_type: row.message_type,
    alert_attempt_count: 1,
    disposition: "QUARANTINE",
    alert_channel: "cloudflare_email",
  };
}

function readJson(path) {
  try { return JSON.parse(fs.readFileSync(path, "utf8")); }
  catch { fail("t4_readback_file_invalid"); }
}

export function main(argv = process.argv.slice(2)) {
  const [operation, ...args] = argv;
  if (operation === "command" && args.length === 1) {
    process.stdout.write(parseT4OwnerCommand(args[0]) + "\n");
    return;
  }
  if (operation === "body" && args.length === 2) {
    process.stdout.write(JSON.stringify(buildT4CanaryBody(args[0], args[1])) + "\n");
    return;
  }
  if (operation === "heartbeat" && args.length === 2) {
    process.stdout.write(validateT4Heartbeat(readJson(args[0]), args[1]).status + "\n");
    return;
  }
  if (operation === "receipt" && args.length === 2) {
    const result = validateT4Receipt(readJson(args[0]), args[1]);
    process.stdout.write(JSON.stringify(result) + "\n");
    return;
  }
  fail("t4_operation_invalid");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); }
  catch (error) {
    console.error(error?.code || "t4_validation_failed");
    process.exitCode = 1;
  }
}
