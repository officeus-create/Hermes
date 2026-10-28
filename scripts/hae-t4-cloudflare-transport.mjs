// ONE-SHOT real Cloudflare DLQ transport proof. Invoked only by owner-gated release workflow.
// Never retry an ambiguous Queue/Email provider handoff.
import fs from "node:fs";
import path from "node:path";
import { parseT4OwnerCommand, buildT4CanaryBody, d1Rows, validateT4Heartbeat, validateT4Receipt } from "./hae-t4-dlq-canary.mjs";

function fail(code) { const error = new Error(code); error.code = code; throw error; }
const validSha = /^[a-f0-9]{40}$/;
const validId = /^[a-f0-9-]{32,36}$/;
const API = "https://api.cloudflare.com/client/v4";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeT4Canary({
  ownerComment,
  runId,
  runAttempt,
  githubToken,
  cloudflareToken,
  expectedGithubSha,
  tempDir,
  githubOutput,
  fetchImpl = fetch,
  sleepImpl = wait,
  now = () => Date.now(),
  repository = "officeus-create/Hermes",
  accountId = JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc", "utf8")).account_id,
  manifest = JSON.parse(fs.readFileSync("workers/automation-engine/migrations/manifest.json", "utf8")),
} = {}) {
  const target = parseT4OwnerCommand(ownerComment);
  if (!validSha.test(target) || target !== expectedGithubSha) fail("t4_checkout_target_mismatch");
  if (String(runAttempt) !== "1") fail("t4_same_run_retry_forbidden");
  if (!githubToken || !cloudflareToken || !validId.test(accountId)) fail("t4_access_preflight_failed");
  if (manifest.baseline_status !== "VERIFIED" ||
      manifest.canonical_database !== "hermes-connect-prototype" ||
      !validSha.test(manifest.baseline_source_sha) ||
      !Array.isArray(manifest.migration_files) || manifest.migration_files.length !== 0) {
    fail("t4_baseline_not_verified");
  }

  async function request(url, options = {}) {
    let response;
    try { response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(12000) }); }
    catch { fail("t4_transport_ambiguous_no_retry"); }
    if (!response.ok) fail("t4_remote_http_rejected");
    let payload;
    try { payload = await response.json(); } catch { fail("t4_remote_json_invalid"); }
    return payload;
  }

  async function exactMain() {
    const response = await request("https://api.github.com/repos/" + repository + "/branches/main", {
      headers: { Authorization: "Bearer " + githubToken, Accept: "application/vnd.github+json" },
    });
    if (response?.commit?.sha !== target) fail("t4_main_moved_fail_closed");
  }

  const cfHeaders = { Authorization: "Bearer " + cloudflareToken, "Content-Type": "application/json" };
  const cfGet = async (url) => {
    const payload = await request(url, { headers: cfHeaders });
    if (payload?.success !== true) fail("t4_cloudflare_lookup_failed");
    return payload;
  };
  const d1Query = async (dbId, sql, params = []) => {
    const payload = await request(API + "/accounts/" + accountId + "/d1/database/" + dbId + "/query", {
      method: "POST", headers: cfHeaders, body: JSON.stringify({ sql, params }),
    });
    d1Rows(payload);
    return payload;
  };
  await exactMain();

  const pages = await cfGet(API + "/accounts/" + accountId + "/pages/projects/hermes");
  const binding = pages.result?.deployment_configs?.production?.d1_databases?.DB;
  // Pages production bindings can include the D1 ID but omit its display name.
  // Resolve that name only through an authenticated exact-ID D1 metadata read.
  // Never guess it from a local fallback or accept a mismatched identity.
  if (!validId.test(binding?.id || "")) fail("t4_canonical_database_binding_id_missing");
  const dbId = binding.id;
  let boundName = binding?.database_name || binding?.name;
  if (!boundName) {
    const detail = await cfGet(API + "/accounts/" + accountId + "/d1/database/" + dbId);
    if (detail?.result?.uuid && detail.result.uuid !== dbId) {
      fail("t4_canonical_database_metadata_id_mismatch");
    }
    boundName = detail?.result?.name || detail?.result?.database_name;
  }
  if (boundName !== manifest.canonical_database) {
    fail("t4_canonical_database_binding_mismatch");
  }

  const queues = await cfGet(API + "/accounts/" + accountId + "/queues");
  if (!Array.isArray(queues.result)) fail("t4_queue_response_invalid");
  const matches = queues.result.filter((q) => q.queue_name === "hermes-automation-dlq" && validId.test(q.queue_id || ""));
  if (matches.length !== 1) fail("t4_dlq_ambiguous_or_missing");

  const heartbeat = await d1Query(
    dbId,
    "SELECT trigger_type,source_sha,automation_mode,publication_config,publication_enabled,observed_at FROM hermes_automation_heartbeats ORDER BY observed_at DESC LIMIT 1",
  );
  validateT4Heartbeat(heartbeat, manifest.baseline_source_sha, now());

  const body = buildT4CanaryBody(runId, runAttempt);
  const type = body.body.type;
  const already = await d1Query(dbId,
    "SELECT dlq_item_id FROM hermes_automation_dlq_items WHERE message_type=? LIMIT 2",
    [type],
  );
  if (d1Rows(already).length !== 0) fail("t4_duplicate_canary_blocked");
  await exactMain();

  // Exactly one Queue write: unknown type, no idempotency key and no provider side effect.
  // This routes through the EXISTING DLQ consumer and deterministically QUARANTINES.
  const accepted = await request(
    API + "/accounts/" + accountId + "/queues/" + matches[0].queue_id + "/messages",
    { method: "POST", headers: cfHeaders, body: JSON.stringify(body) },
  );
  if (accepted?.success !== true) fail("t4_queue_send_unconfirmed_no_retry");

  const readSql = "SELECT dlq_item_id,message_type,disposition,reason,action_status,alert_status,alert_attempt_count,alert_channel,alert_receipt_ref,alert_provider_message_id,redrive_count FROM hermes_automation_dlq_items WHERE message_type=? ORDER BY first_seen_at DESC LIMIT 2";
  for (let i = 0; i < 24; i += 1) {
    const payload = await d1Query(dbId, readSql, [type]);
    const status = validateT4Receipt(payload, type);
    if (status.status === "PASS") {
      await exactMain();
      const receipt = { ...status, source_sha: manifest.baseline_source_sha, main_sha: target, inbox_verified: false };
      if (tempDir && githubOutput) {
        fs.writeFileSync(path.join(tempDir, "t4-d1-transport-receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
        fs.appendFileSync(githubOutput, "dlq_item_id=" + status.dlq_item_id + "\n");
      }
      return receipt;
    }
    if (i !== 23) await sleepImpl(5000);
  }
  fail("t4_delivery_pending_no_retry");
}

if (process.argv[1] && import.meta.url === new URL("file://" + path.resolve(process.argv[1])).href) {
  executeT4Canary({
    ownerComment: process.env.T4_OWNER_COMMENT,
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
    githubToken: process.env.GH_TOKEN,
    cloudflareToken: process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
    expectedGithubSha: process.env.GITHUB_SHA,
    tempDir: process.env.RUNNER_TEMP,
    githubOutput: process.env.GITHUB_OUTPUT,
  }).then((receipt) => {
    console.log("t4_d1_cloudflare_email_transport_PASS dlq_item_id=" + receipt.dlq_item_id);
    console.log("t4_independent_gmail_inbox_readback_REQUIRED");
  }).catch((error) => {
    console.error(error?.code || "t4_execution_failed");
    process.exitCode = 1;
  });
}
