import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ACCOUNT_KEY,
  PLATFORM,
  CARRIER_THEMES,
  buildCarrierThreadsPost,
  buildTrackedUrl,
  publicationEnabled,
} from "../workers/automation-engine/src/index.mjs";
import {
  publishThreadsTextViaWindsor,
  readbackThreadsTextViaWindsor,
  windsorThreadsConfig,
  WINDSOR_THREADS_DEFAULT_ACCOUNT_ID,
} from "../workers/automation-engine/src/windsor-threads.mjs";

assert.equal(ACCOUNT_KEY, "hermes_logistics");
assert.equal(PLATFORM, "threads");
assert.ok(CARRIER_THEMES.length >= 6, "Pilot needs enough carrier themes to avoid a tiny rotation");

for (const theme of CARRIER_THEMES) {
  assert.ok(theme.destination.startsWith("/"), "All destinations must be owned Hermes paths");
  assert.ok(
    theme.destination.includes("load-board") || theme.destination.includes("car-hauling"),
    `Non-car-hauling destination leaked into Hermes Logistics pilot: ${theme.destination}`,
  );
}

for (const slot of [
  "2026-10-13T06",
  "2026-10-13T07",
  "2026-10-13T12",
  "2026-10-13T23",
  "2026-10-14T00",
  "2026-10-14T01",
]) {
  const candidate = buildCarrierThreadsPost(slot);
  assert.equal(candidate.account_key, "hermes_logistics");
  assert.equal(candidate.platform, "threads");
  assert.ok(candidate.body.length <= 500, `Threads post exceeded 500 chars for ${slot}`);
  assert.ok(new TextEncoder().encode(candidate.body).byteLength <= 500, `Threads post exceeded 500 UTF-8 bytes for ${slot}`);
  assert.match(candidate.variant_key, /^[a-z0-9-]+:\d+:\d+:\d+$/, "Candidate must expose a stable semantic variant key");
  assert.match(candidate.body, /https:\/\/hermeslogisticsus\.com\//);
  assert.match(candidate.body, /utm_source=threads/);
  assert.match(candidate.body, /utm_campaign=car_hauler_carrier_growth/);
  assert.ok(!/marketing|academy|repair shop|beauty salon/i.test(candidate.body), "Unrelated business direction leaked into carrier-only account");
}

for (const slot of ["2026-10-13T06", "2026-10-13T07", "2026-10-14T01", "2026-10-20T12"]) {
  const variants = new Set(Array.from({ length: 64 }, (_, index) => buildCarrierThreadsPost(slot, index).variant_key));
  assert.ok(variants.size >= 40, `Variant rotation collapsed unexpectedly for ${slot}: ${variants.size}`);
}

const tracked = new URL(buildTrackedUrl("/load-board/#carrier-access", "TEST Content"));
assert.equal(tracked.hostname, "hermeslogisticsus.com");
assert.equal(tracked.searchParams.get("utm_source"), "threads");
assert.equal(tracked.searchParams.get("utm_medium"), "organic_social");
assert.equal(tracked.hash, "#carrier-access");

assert.equal(publicationEnabled({}), false);
assert.equal(publicationEnabled({ HERMES_AUTOMATION_MODE: "live" }), false);
assert.equal(publicationEnabled({ HERMES_AUTOMATION_PUBLISH: "enabled" }), false);
assert.equal(publicationEnabled({ HERMES_AUTOMATION_MODE: "live", HERMES_AUTOMATION_PUBLISH: "enabled" }), true);

const worker = readFileSync(new URL("../workers/automation-engine/src/index.mjs", import.meta.url), "utf8");
const windsorAdapter = readFileSync(new URL("../workers/automation-engine/src/windsor-threads.mjs", import.meta.url), "utf8");
const wrangler = readFileSync(new URL("../workers/automation-engine/wrangler.jsonc.example", import.meta.url), "utf8");
const releaseWorkflow = readFileSync(new URL("../.github/workflows/automation-engine-release.yml", import.meta.url), "utf8");

assert.ok(worker.includes("AUTOMATION_QUEUE.send"), "Cron must enqueue work instead of doing a heavy task inline");
assert.ok(worker.includes("unknown_outcome"), "Ambiguous provider outcome must be fail-closed");
assert.match(worker, /unknown_outcome_readback_pending/, "Ambiguous provider writes must enter readback-only recovery");
assert.match(worker, /unknown_outcome_unresolved/, "Ambiguous provider writes must terminate for human review if bounded readback cannot resolve them");
assert.match(worker, /provider_outcome_unknown[\s\S]*publication\.readback/, "Unknown provider outcomes must schedule readback rather than a second publish call");
assert.ok(worker.includes("INSERT OR IGNORE"), "Idempotency reservation must be persisted before work");
assert.match(worker, /claimPublicationForProvider/, "Provider writes must require an atomic publication claim");
assert.match(worker, /status=\'publishing\'[\s\S]*status=\'reserved\'/, "Only a definitely pre-provider reservation may advance to a provider call");
assert.match(worker, /attempt_count=attempt_count\+1/, "Actual provider-call claims must increment attempt count atomically");
assert.ok(worker.includes("normal_loop_requires_chatgpt_task: false"), "Capabilities must state that ChatGPT scheduled tasks are not runtime dependencies");
assert.ok(!worker.includes("api.openai.com"), "V1 pilot must not call OpenAI per post");
assert.ok(!worker.includes("chatgpt.com"), "V1 pilot must not depend on ChatGPT web runtime");
assert.match(worker, /provider_accepted_readback_pending/, "Accepted Windsor writes must remain unverified until readback");
assert.match(worker, /url\.pathname === "\/v1\/health"[\s\S]*authorized\(request, env\)/, "Operational health must require the private control token");
assert.doesNotMatch(worker, /provider_account:/, "Public capabilities must not expose the provider account id");
assert.match(worker, /publication\.readback/, "Worker must schedule delayed provider readback");
assert.match(worker, /enqueueDueReadbacks/, "Cron must recover provider-accepted posts whose readback queue message was lost");
assert.match(worker, /readback_enqueue_failed/, "Queue scheduling failure must be persisted without replaying the provider write");
assert.match(worker, /stale_publish_requires_readback/, "Stale publishing state must recover by readback instead of a second provider write");
assert.match(worker, /queue\.metrics\(\)/, "Private health must expose queue backlog when Cloudflare metrics are available");
assert.match(worker, /metricNumberOrNull\(metrics\?\.backlogCount\)/, "Missing Queue backlog metrics must remain UNKNOWN/null instead of silently becoming zero");
assert.match(worker, /metricNumberOrNull\(metrics\?\.backlogBytes\)/, "Missing Queue byte metrics must remain UNKNOWN/null instead of silently becoming zero");
assert.doesNotMatch(worker, /Number\(metrics\?\.backlogCount \|\| 0\)/, "Queue metrics must never coerce UNKNOWN backlog to zero");
assert.match(worker, /AUTOMATION_DLQ/, "Private health must inspect the dead-letter queue separately");
assert.match(worker, /plan_enqueue_failures/, "Private health must surface lost-plan recovery pressure");
assert.match(worker, /hermes_automation_heartbeats/, "Cron wakes must have a durable heartbeat table including quiet-window wakes");
assert.match(worker, /recordCronHeartbeat/, "Scheduled execution must persist a heartbeat before eligibility return");
assert.match(worker, /heartbeat:cron:\$\{scheduledIso\.slice\(0, 13\)\}Z/, "Cron heartbeat identity must use scheduled UTC hour so DST fallback does not collapse two wakes into one");
assert.match(worker, /controller\?\.scheduledTime/, "Cron slot identity must derive from Cloudflare ScheduledController scheduledTime rather than wall-clock execution time");
assert.match(worker, /rawScheduledTime === null[\s\S]*observedAt/, "Missing ScheduledController time must fall back to observed time without coercing null to epoch zero");
assert.match(worker, /execution_lag_ms/, "Heartbeat evidence must preserve cron execution lag separately from scheduled time");
assert.match(worker, /cron\.heartbeat_write_failed/, "Heartbeat telemetry failure must be observable without blocking the current slot");
assert.match(worker, /last_cron_wake/, "Private health must distinguish last cron wake from last updated run");
assert.match(worker, /last_success/, "Private health must expose the last successful HAE run separately");
assert.match(worker, /last_failure/, "Private health must expose the last failed HAE run separately");
assert.match(worker, /source_sha/, "Private health must expose the exact deployed source SHA when release metadata is configured");
assert.match(worker, /automation_mode/, "Private health must expose the current automation mode");
assert.match(worker, /publication_enabled/, "Private health must expose the effective publication gate");
assert.match(worker, /hermes_automation_runtime_events/, "Queue/recovery failures must have a durable sanitized runtime event ledger");
assert.match(worker, /generic_job_events_by_type/, "Private health must expose generic retry/stale-recovery event counts");
assert.doesNotMatch(worker, /ready_content: Number\(ready\?\.count \|\| 0\)/, "Missing D1 health count rows must not be coerced to zero");
assert.match(worker, /ready_content: metricNumberOrNull\(ready\?\.count\)/, "D1 health counts must preserve UNKNOWN/null while retaining real zero");
assert.match(worker, /safeRuntimeErrorClass/, "Runtime error receipts must use a sanitizer rather than persist arbitrary exception text");
assert.match(worker, /\^\[a-z\]\[a-z0-9_\]\{2,79\}\$/, "Runtime error sanitizer must accept only bounded machine-code error classes");
assert.match(worker, /normalizedAttempt === null \? null : Math\.max\(0, Math\.trunc\(normalizedAttempt\)\)/, "Unknown Queue attempt count must remain null instead of becoming zero");
assert.match(worker, /queue\.message_unknown[\s\S]*item\.retry\(\)/, "Unknown Queue messages must fail closed toward retry/DLQ instead of being silently ACKed");
assert.match(worker, /queue\.message_retry/, "Queue handler retries must persist a sanitized durable error receipt");
assert.match(worker, /cron\.recover_readbacks_failed/, "Readback recovery failure must be isolated and observable");
assert.match(worker, /cron\.recover_plan_runs_failed/, "Plan recovery failure must be isolated and observable");
assert.match(worker, /cron\.recover_generic_jobs_failed/, "Generic recovery failure must be isolated and observable");
assert.match(worker, /live_slot_override_forbidden/, "Live manual ticks must not backfill arbitrary slots");
assert.match(worker, /live_outside_publish_window/, "Live manual ticks must respect the Central Time publish window");
assert.match(worker, /expired_live_slot/, "Recovered queue backlog must never publish a stale historical slot");
assert.match(worker, /stale_live_slot_suppressed/, "Stale-slot suppression must be visible in durable run state");
assert.match(worker, /next_readback_at/, "Readback recovery must be durable in D1");
assert.match(worker, /variant_key TEXT NOT NULL/, "Content state must persist semantic variant identity");
assert.match(worker, /UNIQUE\(account_key, platform, slot_key\)/, "Hourly slot uniqueness must be scoped per account/platform for later multi-brand reuse");
assert.match(worker, /run:\$\{ACCOUNT_KEY\}:\$\{PLATFORM\}:\$\{slotKey\}/, "Run identity must include account and platform");
assert.match(worker, /hermes_automation_publications[\s\S]*account_key TEXT NOT NULL[\s\S]*platform TEXT NOT NULL/, "Publication receipts must carry account/platform ownership");
assert.match(worker, /account_key=\? AND platform=\? AND status=\'provider_accepted_readback_pending\'/, "Readback recovery must not consume another account\'s publication state");
assert.match(worker, /created_at>=\?/, "Content planner must suppress recent semantic variants");
assert.match(worker, /variantIndex < 64/, "Planner must search the bounded 64-combination theme space rather than loop without limit");
assert.match(worker, /loadOrCreateCarrierCandidate/, "A retried slot must reuse the exact persisted candidate body");
assert.match(worker, /candidate_persistence_failed/, "Planner must fail closed if the winning D1 candidate cannot be read back");
assert.match(worker, /recoverPendingPlanRuns/, "Lost content-plan queue writes must be recoverable from durable run state");
assert.match(worker, /plan_enqueue_failed/, "Plan enqueue failure must stay explicit and recoverable");
assert.match(worker, /status IN \('queued','plan_enqueue_failed'\)/, "Recovery must not replay completed or provider-side-effect states");
assert.match(worker, /new TextEncoder\(\)\.encode\(body\)\.byteLength/, "Threads limit must be enforced in UTF-8 bytes");
assert.match(worker, /delaySeconds: 4200/, "First Windsor readback must be delayed past the one-hour refresh boundary");
assert.match(windsorAdapter, /connectors\.windsor\.ai/, "Pilot must use the Windsor Connectors API directly");
assert.match(windsorAdapter, /create_text_post/, "Windsor adapter must use the exact Threads text action");
assert.match(windsorAdapter, /refresh_interval.*1h/s, "Readback must use the documented hourly refresh envelope");
assert.ok(!windsorAdapter.includes("console.log"), "Provider URL containing API key must never be logged");
assert.equal(WINDSOR_THREADS_DEFAULT_ACCOUNT_ID, "28419597014385166");
assert.equal(windsorThreadsConfig({}), null);
assert.deepEqual(windsorThreadsConfig({ WINDSOR_API_KEY: "synthetic-key" }), { apiKey: "synthetic-key", accountId: "28419597014385166" });
assert.ok(wrangler.includes('"HERMES_AUTOMATION_MODE": "dry_run"'), "Example config must default to dry-run");
assert.ok(wrangler.includes('"HERMES_AUTOMATION_PUBLISH": "disabled"'), "Example config must default publication off");
assert.ok(wrangler.includes('"HERMES_AUTOMATION_SOURCE_SHA": "INJECT_EXACT_MAIN_SHA_AT_RELEASE"'), "Example config must reserve exact source SHA release metadata");
assert.ok(wrangler.includes('"WINDSOR_THREADS_ACCOUNT_ID": "28419597014385166"'), "Example must pin the verified Hermes Threads account");
assert.ok(wrangler.includes("WINDSOR_API_KEY"), "Windsor secret activation step must be documented");
assert.ok(!wrangler.includes('"WINDSOR_API_KEY":'), "Windsor API key must never be committed as a Wrangler var");
assert.ok(wrangler.includes('"dead_letter_queue": "hermes-automation-dlq"'), "Queue must have a DLQ");
assert.ok(wrangler.includes('"binding": "AUTOMATION_DLQ"'), "DLQ must be bound read-only in practice for health metrics");
assert.ok(wrangler.includes('"workers_dev": false'), "Worker must not expose workers.dev by default");
assert.ok(wrangler.includes('"preview_urls": false'), "Preview URLs must remain disabled by default");
assert.match(releaseWorkflow, /queues\/\$\{QUEUE_ID\}\/messages/, "Dry-run proof must inject a canary through the Cloudflare Queue API");
assert.match(releaseWorkflow, /d1\/database\/\$\{DB_ID\}\/query/, "Dry-run proof must read execution state back from canonical D1");
assert.match(releaseWorkflow, /dry_run_canary=PASS/, "Release must require Queue→Worker→D1 evidence");
assert.match(releaseWorkflow, /Provider writes: disabled/, "Dry-run evidence must state provider writes remain disabled");
assert.doesNotMatch(releaseWorkflow, /WINDSOR_API_KEY/, "Dry-run release workflow must not inject the provider credential");
for (const table of ["hermes_automation_runs", "hermes_automation_content", "hermes_automation_publications", "hermes_automation_jobs", "hermes_automation_job_events"]) {
  assert.ok(worker.includes(table), `Missing additive canonical-D1 runtime table: ${table}`);
}
assert.match(worker, /FOREIGN KEY\(job_id\)/, "Job events must remain attached to a durable job id");
assert.match(worker, /readback_attempt INTEGER NOT NULL DEFAULT 0/, "Provider readback attempts must be durable");
assert.match(worker, /next_readback_at TEXT/, "Provider readback schedule must survive queue loss");
assert.ok(wrangler.includes('"database_name": "hermes-connect-prototype"'), "HAE must reuse the canonical Hermes Connect production D1");
assert.ok(wrangler.includes("DISCOVER_FROM_HERMES_PAGES_PRODUCTION_DB_BINDING"), "Canonical production D1 id must be discovered at release time, not committed");
assert.ok(!wrangler.includes('"database_name": "hermes-automation"'), "HAE must never create a second D1 database");
assert.match(releaseWorkflow, /INJECT_EXACT_MAIN_SHA_AT_RELEASE/, "Release workflow must inject exact source SHA into generated Worker config");
assert.match(releaseWorkflow, /TARGET_SHA: \$\{\{ steps\.request\.outputs\.target_sha \}\}/, "Release config render must receive the owner-verified exact target SHA");
assert.match(releaseWorkflow, /github\.event\.issue\.number == 1018/, "Release command must stay attached to canonical Growth Bridge #1018");
assert.match(releaseWorkflow, /HAE_PROVISION_DRY_RUN/, "Dry-run provisioning must require an explicit owner command");
assert.match(releaseWorkflow, /environment: production/, "Production Worker release must pass through the production environment");
assert.match(releaseWorkflow, /CLOUDFLARE_HAE_RELEASE_TOKEN/, "HAE should prefer one dedicated least-privilege Cloudflare release token");
assert.match(releaseWorkflow, /workers\/lead-email\/wrangler\.production\.jsonc/, "HAE must derive the canonical Cloudflare account id from existing production config");
assert.doesNotMatch(releaseWorkflow, /CLOUDFLARE_PAGES_API_TOKEN/, "HAE release must not require a second Pages-only token");
assert.doesNotMatch(releaseWorkflow, /secrets\.CLOUDFLARE_ACCOUNT_ID|secrets\.CF_ACCOUNT_ID/, "HAE release must not require a duplicate account-id secret");
assert.match(releaseWorkflow, /Authorization: Bearer \$\{CLOUDFLARE_API_TOKEN\}/, "The single release token must cover bounded Cloudflare API reads used by the dry-run proof");
assert.match(releaseWorkflow, /deployment_configs\.production\.d1_databases\.DB\.id/, "Release must discover the canonical Pages D1 binding");
assert.doesNotMatch(releaseWorkflow, /d1\s+create/i, "Release must never create a second D1 database");
assert.match(releaseWorkflow, /queues create/, "Explicit provisioning may create only the two bounded HAE queues");
assert.match(wrangler, /"HERMES_AUTOMATION_MODE": "dry_run"/, "Composed release source must remain dry-run");
assert.match(wrangler, /"HERMES_AUTOMATION_PUBLISH": "disabled"/, "Composed release source must keep provider publication disabled");
assert.doesNotMatch(releaseWorkflow, /HERMES_AUTOMATION_MODE=live|HERMES_AUTOMATION_PUBLISH=enabled/, "Owner-gated dry-run workflow must never promote live publishing");
assert.doesNotMatch(releaseWorkflow, /WINDSOR_API_KEY:\s*\$\{\{\s*secrets\./, "Dry-run release must not require or inject a provider write secret");


assert.match(worker, /READ_ONLY_GENERIC_JOB_TYPES/, "Generic executor must expose a bounded read-only capability registry");
assert.match(worker, /"system\.health\.snapshot"/, "Generic executor must support a safe system health snapshot job");
assert.match(worker, /"history\.coverage\.audit"/, "Generic executor must support a read-only historical coverage audit job");
assert.match(worker, /HISTORICAL_READ_ONLY_JOB_TYPES/, "Historical primitives must bind into the existing generic job registry");
assert.match(worker, /runHistoricalLearningPrimitive/, "Historical primitive execution must reuse the existing generic executor");
assert.match(worker, /\.\.\.HISTORICAL_READ_ONLY_JOB_TYPES/, "Historical jobs must extend the same read-only generic allowlist");
assert.match(worker, /HISTORICAL_READ_ONLY_JOB_TYPES\.includes\(jobType\)[\s\S]*runHistoricalLearningPrimitive\(jobType, payload\)/, "Historical job payloads must be validated before enqueue");
assert.match(worker, /HISTORICAL_READ_ONLY_JOB_TYPES\.includes\(job\.job_type\)[\s\S]*runHistoricalLearningPrimitive\(job\.job_type, payload\)/, "Historical jobs must execute inside the same runReadOnlyGenericCapability path");
assert.doesNotMatch(worker, /READ_ONLY_GENERIC_JOB_TYPES[\s\S]{0,240}"social\.publish"/, "Live social writes must not be allowed through the first generic read-only executor");
assert.match(worker, /type: "job\.execute"/, "Generic jobs must execute through the existing canonical automation queue");
assert.match(worker, /processGenericJob/, "Queue consumer must execute generic durable jobs");
assert.match(worker, /url\.pathname === "\/v1\/jobs"/, "Private API must accept owner-controlled generic jobs");
assert.match(worker, /url\.pathname\.startsWith\("\/v1\/jobs\/"\)/, "Private API must expose durable job readback");
assert.match(worker, /idempotency_key_required/, "Generic job creation must require an explicit idempotency key");
assert.match(worker, /idempotency_key_conflict/, "A reused idempotency key with a changed logical request must fail closed");
assert.match(worker, /genericJobReplayMatches/, "Idempotent replay must compare the persisted logical request, not only the key");
assert.match(worker, /Math\.trunc\(rawPriority\)/, "Generic job priority must persist as a bounded integer");
assert.match(worker, /Math\.trunc\(rawMaxAttempts\)/, "Generic job retry count must persist as a bounded integer");
assert.match(worker, /transitionGenericJobWithEvent/, "Generic state transitions must persist the state and immutable event in one D1 batch");
assert.match(worker, /db\.batch\(\[[\s\S]*conditionalGenericJobEventStatement/, "Generic transition helper must use atomic D1 batch semantics");
assert.match(worker, /state='RUNNING'[\s\S]*state='QUEUED'[\s\S]*state='RETRY_SCHEDULED'/, "Generic execution must atomically claim queued or due retry work");
assert.match(worker, /job\.stale_running_recovered/, "Stale RUNNING recovery must append an immutable transition event");
assert.match(worker, /job\.stale_running_failed/, "Exhausted stale RUNNING jobs must append a terminal transition event");
assert.match(worker, /eventType: "job\.stale_running_recovered"[\s\S]{0,320}expectedAttemptCount: attempts/, "Stale RUNNING recovery must use the atomic state/event transition helper");
assert.match(worker, /eventType: "job\.stale_running_failed"[\s\S]{0,320}expectedAttemptCount: attempts/, "Stale RUNNING terminal failure must use the atomic state/event transition helper");
assert.match(worker, /job\.retry_scheduled/, "Generic failures must persist a retry transition");
assert.match(worker, /Duplicate recovery messages[\s\S]*D1 state transition is the execution lock/, "Generic recovery must rely on the atomic D1 claim rather than a future available_at lease");
assert.match(worker, /generic_jobs_by_state/, "Private health must expose generic job backlog by state");
assert.match(worker, /coverage_runtime_status/, "Historical coverage audit must report runtime coverage status");
assert.match(worker, /complete: false/, "Coverage audit must fail closed until real ingested coverage proves completeness");
assert.match(worker, /Number\.isFinite\(rawPriority\)/, "Generic job numeric inputs must fail to safe defaults instead of persisting NaN");
assert.match(worker, /Number\.isFinite\(rawMaxAttempts\)/, "Generic job retry bounds must reject non-finite input");
assert.match(worker, /decodeURIComponent[\s\S]*job_id_invalid/, "Malformed encoded job IDs must fail closed as a 400-class input error");

const originalFetch = globalThis.fetch;
try {
  let actionBody = null;
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    assert.equal(parsed.hostname, "connectors.windsor.ai");
    assert.equal(parsed.searchParams.get("api_key"), "synthetic-key");
    if (parsed.pathname === "/threads/actions") {
      actionBody = JSON.parse(String(options.body || "{}"));
      return new Response(JSON.stringify({ result: "Accepted" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (parsed.pathname === "/threads") {
      assert.equal(parsed.searchParams.get("select_accounts"), "28419597014385166");
      assert.equal(parsed.searchParams.get("refresh_since"), "3d");
      assert.equal(parsed.searchParams.get("refresh_interval"), "1h");
      return new Response(JSON.stringify([{
        post_id: "post-123",
        post_text: "carrier test body",
        post_permalink: "https://www.threads.com/@hermes.logistics/post/example",
        post_timestamp: "2026-10-13T00:00:00+0000",
      }]), { status: 200, headers: { "content-type": "application/json" } });
    }
    throw new Error("unexpected mock URL");
  };

  const write = await publishThreadsTextViaWindsor({ WINDSOR_API_KEY: "synthetic-key" }, "carrier test body");
  assert.equal(write.ok, true);
  assert.equal(write.accepted, true);
  assert.equal(actionBody.account, "28419597014385166");
  assert.equal(actionBody.action, "create_text_post");
  assert.equal(actionBody.params.text, "carrier test body");

  const multiline = await publishThreadsTextViaWindsor({ WINDSOR_API_KEY: "synthetic-key" }, "Hook\n\nUseful point\n\nQuestion?");
  assert.equal(multiline.ok, true);
  assert.equal(actionBody.params.text, "Hook\n\nUseful point\n\nQuestion?");

  const readback = await readbackThreadsTextViaWindsor({ WINDSOR_API_KEY: "synthetic-key" }, "carrier test body");
  assert.equal(readback.ok, true);
  assert.equal(readback.found, true);
  assert.equal(readback.provider_post_id, "post-123");
  assert.equal(readback.permalink, "https://www.threads.com/@hermes.logistics/post/example");
} finally {
  globalThis.fetch = originalFetch;
}

for (const secretPattern of ["sk-", "ghp_", "AIza", "Bearer eyJ"]) {
  assert.ok(!worker.includes(secretPattern) && !wrangler.includes(secretPattern), `No committed secret-like value: ${secretPattern}`);
}

console.log("Hermes Automation Engine V1 contract: ok");
