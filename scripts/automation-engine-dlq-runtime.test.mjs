import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("../workers/automation-engine/src/index.mjs", import.meta.url), "utf8");
const wrangler = readFileSync(new URL("../workers/automation-engine/wrangler.jsonc.example", import.meta.url), "utf8");

assert.match(worker, /classifyDlqDisposition/, "Runtime DLQ consumer must use the fail-closed classifier");
assert.match(worker, /processDlqMessage/, "Runtime must process DLQ messages separately from the normal queue path");
assert.match(worker, /clean\(batch\?\.queue, 120\) === DLQ_QUEUE_NAME/, "Queue handler must distinguish the canonical DLQ");
assert.match(worker, /dlq\.safe_redrive_requested/, "SAFE_REDRIVE must leave a durable runtime receipt");
assert.match(worker, /dlq\.readback_only_requested/, "READBACK_ONLY must leave a durable runtime receipt");
assert.match(worker, /dlq\.canonical_recovery/, "D1-owned recovery must leave a durable runtime receipt");
assert.match(worker, /dlq\.quarantined/, "Quarantine must leave a durable runtime receipt");
assert.match(worker, /dlq\.owner_action_required/, "Owner-action classification must remain visible in D1 health evidence");
assert.match(worker, /dlq\.consumer_retry/, "DLQ processing failures must be visible instead of silently acked");
assert.match(worker, /last_error_class='dlq_safe_redrive_requested'/, "Read-only job redrive must become a D1 recovery checkpoint");
assert.match(worker, /last_error_class='dlq_readback_recovery_requested'/, "Publication recovery must become a readback checkpoint");
assert.match(worker, /state IN \('QUEUED','RETRY_SCHEDULED'\)/, "Job redrive must only touch proven pre-side-effect states");
assert.match(worker, /status IN \('provider_accepted_readback_pending','unknown_outcome_readback_pending','publishing'\)/, "Publication DLQ handling must remain readback-only");
assert.doesNotMatch(worker, /function processDlqMessage[\s\S]{0,5000}publishThreadsTextViaWindsor/, "DLQ consumer must never directly perform a provider write");

const consumersStart = wrangler.indexOf('"consumers": [');
assert.ok(consumersStart >= 0, "Wrangler must define queue consumers");
const consumers = wrangler.slice(consumersStart);
const dlqStart = consumers.indexOf('"queue": "hermes-automation-dlq"');
assert.ok(dlqStart >= 0, "Canonical DLQ must have a consumer");
const dlqConsumer = consumers.slice(dlqStart, consumers.indexOf("}", dlqStart) + 1);
assert.match(dlqConsumer, /"max_retries": 24/, "DLQ consumer must survive bounded infrastructure outages");
assert.match(dlqConsumer, /"retry_delay": 3600/, "DLQ retry must be cost-aware and avoid hot-looping");
assert.match(dlqConsumer, /"max_concurrency": 1/, "Low-volume DLQ recovery must not fan out unnecessarily");
assert.doesNotMatch(dlqConsumer, /dead_letter_queue/, "DLQ consumer must not recursively dead-letter to another queue");
assert.ok(!wrangler.includes("hermes-automation-dlq-dlq"), "Never create a third recovery queue");

console.log("HAE DLQ runtime contract PASS: classify -> D1 recovery/readback -> durable receipt");
