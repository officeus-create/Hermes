import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  evaluateHaeRuntimeEvidence,
  HAE_ACCEPTANCE_READ_ONLY_JOB_TYPES,
} from "./hae-runtime-evidence-check.mjs";
import { HISTORICAL_READ_ONLY_JOB_TYPES } from "../workers/automation-engine/src/historical-learning.mjs";

const worker = readFileSync(new URL("../workers/automation-engine/src/index.mjs", import.meta.url), "utf8");
const allowlistBlock = worker.match(/const READ_ONLY_GENERIC_JOB_TYPES = new Set\(\[([\s\S]*?)\]\);/);
assert.ok(allowlistBlock, "Current HAE read-only generic allowlist must remain discoverable for acceptance drift checking.");
assert.match(allowlistBlock[1], /\.\.\.HISTORICAL_READ_ONLY_JOB_TYPES/, "Acceptance drift check expects the historical read-only primitive spread.");
const fixedTypes = [...allowlistBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
const runtimeTypes = [...new Set([...fixedTypes, ...HISTORICAL_READ_ONLY_JOB_TYPES])].sort();
assert.deepEqual(
  [...HAE_ACCEPTANCE_READ_ONLY_JOB_TYPES].sort(),
  runtimeTypes,
  "Runtime evidence checker read-only job types must exactly match the current HAE executor allowlist."
);

const sha = "a".repeat(40);
const good = {
  target_sha: sha,
  deployment: {
    evidence_ref: "cloudflare://workers/hermes-automation-engine/deployments/latest",
    source_sha: sha,
  },
  runtime: {
    automation_mode: "dry_run",
    publication_enabled: false,
  },
  health: {
    evidence_ref: "worker://private-health/receipt-1",
    database: "ok",
    source_sha: sha,
    automation_mode: "dry_run",
    publication_enabled: false,
    queue: { status: "partial_unknown", backlog_count: null },
    dlq: { status: "partial_unknown", backlog_count: null },
    last_cron_wake: {
      scheduled_at: "2026-10-23T16:17:00.000Z",
      source_sha: sha,
      automation_mode: "dry_run",
      publication_enabled: false,
    },
  },
  transport: {
    queue: {
      evidence_ref: "cloudflare://queues/hermes-automation",
      exists: true,
      backlog_count: 0,
    },
    dlq: {
      evidence_ref: "cloudflare://queues/hermes-automation-dlq",
      exists: true,
      backlog_count: 0,
    },
  },
  read_only_job: {
    evidence_ref: "d1://jobs/job-1",
    job_id: "job-1",
    job_type: "system.health.snapshot",
    idempotency_key: "hae:test:read-only:1",
    permission_class: "READ_ONLY",
    state: "SUCCEEDED",
    attempt_count: 1,
    external_write: false,
  },
  replay: {
    evidence_ref: "d1://jobs/job-1/replay",
    idempotency_key: "hae:test:read-only:1",
    same_idempotency_key: true,
    reused_existing_job: true,
    duplicate_execution_count: 0,
    duplicate_suppressed_receipt_count: 1,
    second_external_side_effect: false,
  },
  independent_qa: {
    evidence_ref: "github://issue/1018#qa-1",
    status: "PASS",
    independent_from_executor: true,
    reviewer: "independent-qa",
  },
};

assert.equal(evaluateHaeRuntimeEvidence(good).status, "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW");

// Health may honestly report partial/unknown Queue metrics when separate Cloudflare
// transport readback proves the actual Queue and DLQ state.
assert.equal(good.health.queue.status, "partial_unknown");

const classifiedHistoricalDlq = structuredClone(good);
classifiedHistoricalDlq.transport.dlq = {
  evidence_ref: "cloudflare://queues/hermes-automation-dlq",
  exists: true,
  backlog_count: 2,
  classification_evidence_ref: "d1://runtime-events/dlq-classification-1",
  classified_count: 2,
  unclassified_count: 0,
  current_canary_count: 0,
  blocking_count: 0,
};
assert.equal(
  evaluateHaeRuntimeEvidence(classifiedHistoricalDlq).status,
  "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW",
  "Fully classified unrelated/quarantined historical DLQ items must not falsely fail the current canary gate."
);

for (const mutate of [
  (x) => { x.deployment.source_sha = "b".repeat(40); },
  (x) => { delete x.deployment.evidence_ref; },
  (x) => { x.runtime.publication_enabled = true; },
  (x) => { x.health.source_sha = "b".repeat(40); },
  (x) => { x.health.automation_mode = "live"; },
  (x) => { x.health.publication_enabled = true; },
  (x) => { x.transport.queue.exists = false; },
  (x) => { x.transport.queue.backlog_count = null; },
  (x) => { x.transport.dlq.backlog_count = 1; },
  (x) => {
    x.transport.dlq = {
      evidence_ref: "cloudflare://queues/hermes-automation-dlq",
      exists: true,
      backlog_count: 1,
      classification_evidence_ref: "d1://runtime-events/dlq-classification-2",
      classified_count: 1,
      unclassified_count: 0,
      current_canary_count: 1,
      blocking_count: 1,
    };
  },
  (x) => { x.health.last_cron_wake.source_sha = "b".repeat(40); },
  (x) => { x.health.last_cron_wake.automation_mode = "live"; },
  (x) => { delete x.read_only_job.job_type; },
  (x) => { x.read_only_job.job_type = "system.write.something"; },
  (x) => { x.read_only_job.permission_class = "EXTERNAL_WRITE"; },
  (x) => { delete x.read_only_job.external_write; },
  (x) => { delete x.replay.idempotency_key; },
  (x) => { x.replay.same_idempotency_key = false; },
  (x) => { x.replay.duplicate_execution_count = 1; },
  (x) => { x.read_only_job.attempt_count = 2; },
  (x) => { x.replay.duplicate_suppressed_receipt_count = 0; },
  (x) => { delete x.replay.second_external_side_effect; },
  (x) => { x.replay.second_external_side_effect = true; },
  (x) => { x.independent_qa.independent_from_executor = false; },
]) {
  const candidate = structuredClone(good);
  mutate(candidate);
  assert.equal(evaluateHaeRuntimeEvidence(candidate).status, "BLOCKED");
}

const businessClaim = structuredClone(good);
businessClaim.claimed_state = "BUSINESS_VERIFIED";
const businessResult = evaluateHaeRuntimeEvidence(businessClaim);
assert.equal(businessResult.status, "EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW");
assert.ok(businessResult.warnings.some((item) => item.code === "BUSINESS_VERIFIED_OUT_OF_SCOPE"));

console.log("HAE runtime evidence acceptance tests: PASS");
