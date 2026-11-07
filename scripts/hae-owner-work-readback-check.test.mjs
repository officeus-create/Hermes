import assert from "node:assert/strict";
import { evaluateHaeOwnerWorkReadback } from "./hae-owner-work-readback-check.mjs";

const sha = "a".repeat(40);
const fingerprint = "sha256:" + "1".repeat(64);

function job(overrides = {}) {
  return {
    job_id: "job:exec-1",
    job_type: "report.catalog.weekly.build",
    project_key: "command-center-owner-work-execution",
    state: "SUCCEEDED",
    attempt_count: 1,
    idempotency_key: "hae:owner-work-exec:item-1:job:plan-1:report.catalog.weekly.build",
    last_error_class: null,
    created_at: "2026-11-07T06:00:00.000Z",
    updated_at: "2026-11-07T06:01:00.000Z",
    completed_at: "2026-11-07T06:01:00.000Z",
    result_present: 1,
    ...overrides,
  };
}

function item(overrides = {}) {
  return {
    id: "item-1",
    workstream: "operations",
    priority: "p1",
    status: "in_progress",
    acceptance_status: "awaiting",
    hae_dispatch_state: "EXECUTION_SUCCEEDED",
    hae_job_id: "job:exec-1",
    hae_plan_job_id: "job:plan-1",
    hae_execution_job_id: "job:exec-1",
    updated_at: "2026-11-07T06:01:00.000Z",
    completed_at: null,
    ...overrides,
  };
}

function evidence(overrides = {}) {
  return {
    target_sha: sha,
    database_binding_fingerprint: fingerprint,
    deployment: {
      evidence_ref: "github-actions://officeus-create/Hermes/runs/1/deployed-worker",
      source_sha: sha,
      deployed_since: "2026-11-07T05:17:00.000Z",
    },
    readback: {
      evidence_ref: "d1://hermes-connect-prototype/hermes_owner_work_items",
      mode: "read_only",
      items_total: 1,
      items_returned: 1,
      items_truncated: false,
      items: [item()],
    },
    jobs: {
      evidence_ref: "d1://hermes-connect-prototype/hermes_automation_jobs",
      mode: "read_only",
      owner_work_jobs_total: 1,
      owner_work_jobs_returned: 1,
      owner_work_jobs_truncated: false,
      state_counts: { SUCCEEDED: 1 },
      owner_work_jobs: [job()],
    },
    requested_job_ids: [],
    requested_jobs: [],
    requested_jobs_not_found: [],
    readback_at: "2026-11-07T12:30:00.000Z",
    autonomous_execution: {
      executed_items: 1,
      proven: true,
      code_attribution: "proven",
    },
    independent_qa: {
      evidence_ref: "github-actions://officeus-create/Hermes/runs/1/owner-work-readback-qa",
      status: "PASS",
      independent_from_executor: true,
      reviewer: "github-actions/hae-owner-work-readback-qa",
    },
    ...overrides,
  };
}

function blockerCodes(result) {
  return result.blockers.map((item) => item.code);
}

// Happy path: one owner-work item executed by the deployed worker.
{
  const result = evaluateHaeOwnerWorkReadback(evidence());
  assert.equal(result.evidence_status, "VALID", JSON.stringify(result.blockers));
  assert.equal(result.execution_status, "PROVEN");
  assert.equal(result.code_attribution, "PROVEN");
  assert.equal(result.summary.executed_items, 1);
  assert.deepEqual(result.summary.executed_item_ids, ["item-1"]);
}

// The verdict must be recomputed, never trusted from the artifact.
{
  const lying = evidence();
  lying.autonomous_execution = { executed_items: 1, proven: true, code_attribution: "proven" };
  lying.jobs.owner_work_jobs = [job({ state: "RUNNING", completed_at: null })];
  lying.jobs.state_counts = { RUNNING: 1 };
  const result = evaluateHaeOwnerWorkReadback(lying);
  assert.equal(result.evidence_status, "INVALID");
  assert.ok(blockerCodes(result).includes("EXECUTED_ITEMS_CLAIM_MISMATCH"));
  assert.ok(blockerCodes(result).includes("EXECUTION_PROOF_CLAIM_MISMATCH"));
  assert.equal(result.execution_status, "NOT_PROVEN");
}

{
  const lying = evidence();
  lying.autonomous_execution = { executed_items: 0, proven: false, code_attribution: "unproven" };
  const result = evaluateHaeOwnerWorkReadback(lying);
  assert.equal(result.evidence_status, "INVALID");
  assert.ok(blockerCodes(result).includes("EXECUTED_ITEMS_CLAIM_MISMATCH"));
}

// A SUCCEEDED owner-work receipt must be complete: completion instant + result payload.
{
  const noCompletion = evidence();
  noCompletion.jobs.owner_work_jobs = [job({ completed_at: null })];
  const result = evaluateHaeOwnerWorkReadback(noCompletion);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_JOB_RECEIPT_WITHOUT_COMPLETION"));
}

{
  const noResult = evidence();
  noResult.jobs.owner_work_jobs = [job({ result_present: 0 })];
  const result = evaluateHaeOwnerWorkReadback(noResult);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_JOB_RECEIPT_MISSING"));
}

// Code attribution must follow the deployed-since lower bound.
{
  const stale = evidence();
  stale.deployment.deployed_since = "2026-11-07T11:00:00.000Z";
  const result = evaluateHaeOwnerWorkReadback(stale);
  assert.equal(result.code_attribution, "UNPROVEN");
  assert.ok(blockerCodes(result).includes("CODE_ATTRIBUTION_CLAIM_MISMATCH"));
}

// Unknown vocabulary must fail closed instead of being silently tolerated.
{
  const unknownState = evidence();
  unknownState.readback.items = [item({ hae_dispatch_state: "TOTALLY_NEW_STATE" })];
  const result = evaluateHaeOwnerWorkReadback(unknownState);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_DISPATCH_STATE_UNKNOWN"));
}

{
  const unknownKey = evidence();
  unknownKey.jobs.owner_work_jobs = [job({ idempotency_key: "hae:something-else:1" })];
  const result = evaluateHaeOwnerWorkReadback(unknownKey);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_JOB_KEY_SCHEME_UNKNOWN"));
}

// The readback must be read-only.
{
  const writable = evidence();
  writable.readback.mode = "read_write";
  writable.jobs.mode = "read_write";
  const result = evaluateHaeOwnerWorkReadback(writable);
  assert.ok(blockerCodes(result).includes("READBACK_MODE_NOT_READ_ONLY"));
  assert.ok(blockerCodes(result).includes("JOBS_MODE_NOT_READ_ONLY"));
}

// Unknown totals must never be coerced to zero.
{
  const unknownTotal = evidence();
  unknownTotal.readback.items_total = null;
  unknownTotal.readback.items_truncated = null;
  const result = evaluateHaeOwnerWorkReadback(unknownTotal);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_ITEMS_TOTAL_INVALID"));
  assert.ok(blockerCodes(result).includes("OWNER_WORK_ITEMS_TRUNCATION_FLAG_MISSING"));
}

// A requested job id must be resolved or explicitly reported as not found.
{
  const missing = evidence();
  missing.requested_job_ids = ["job:never-existed"];
  const result = evaluateHaeOwnerWorkReadback(missing);
  assert.ok(blockerCodes(result).includes("REQUESTED_JOB_UNRESOLVED"));
}

{
  const explicitlyMissing = evidence();
  explicitlyMissing.requested_job_ids = ["job:never-existed"];
  explicitlyMissing.requested_jobs_not_found = ["job:never-existed"];
  const result = evaluateHaeOwnerWorkReadback(explicitlyMissing);
  assert.equal(result.evidence_status, "VALID", JSON.stringify(result.blockers));
}

// Independent QA must be present, passing and independent.
{
  const noQa = evidence();
  noQa.independent_qa = {};
  const result = evaluateHaeOwnerWorkReadback(noQa);
  assert.ok(blockerCodes(result).includes("INDEPENDENT_QA_NOT_PASS"));
  assert.ok(blockerCodes(result).includes("QA_INDEPENDENCE_NOT_ATTESTED"));
}

// The deployed worker must be the reviewed source.
{
  const wrongSha = evidence();
  wrongSha.deployment.source_sha = "b".repeat(40);
  const result = evaluateHaeOwnerWorkReadback(wrongSha);
  assert.ok(blockerCodes(result).includes("DEPLOYMENT_SOURCE_SHA_MISMATCH"));
}

// Counters must describe exactly the returned rows.
{
  const drifted = evidence();
  drifted.jobs.state_counts = { SUCCEEDED: 5 };
  const result = evaluateHaeOwnerWorkReadback(drifted);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_JOB_STATE_COUNTS_MISMATCH"));
}

{
  const drifted = evidence();
  drifted.readback.items_returned = 4;
  const result = evaluateHaeOwnerWorkReadback(drifted);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_ITEMS_COUNT_MISMATCH"));
}

// Nothing may be dated after the readback instant.
{
  const future = evidence();
  future.jobs.owner_work_jobs = [job({ created_at: "2026-11-07T13:00:00.000Z" })];
  const result = evaluateHaeOwnerWorkReadback(future);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_JOB_CREATED_IN_FUTURE"));
}

// A truncated readback must stay internally consistent.
{
  const truncated = evidence();
  truncated.readback.items_total = 40;
  truncated.readback.items_truncated = true;
  truncated.readback.items_returned = 1;
  const result = evaluateHaeOwnerWorkReadback(truncated);
  assert.equal(result.evidence_status, "VALID", JSON.stringify(result.blockers));
}

{
  const truncated = evidence();
  truncated.readback.items_total = 1;
  truncated.readback.items_truncated = true;
  const result = evaluateHaeOwnerWorkReadback(truncated);
  assert.ok(blockerCodes(result).includes("OWNER_WORK_ITEMS_TRUNCATION_INCONSISTENT"));
}

// A missing deployed_since lower bound is a warning, never a silent "proven".
{
  const unknownDeployment = evidence();
  unknownDeployment.deployment.deployed_since = null;
  unknownDeployment.autonomous_execution = { executed_items: 1, proven: true, code_attribution: "unproven" };
  const result = evaluateHaeOwnerWorkReadback(unknownDeployment);
  assert.equal(result.evidence_status, "VALID", JSON.stringify(result.blockers));
  assert.equal(result.code_attribution, "UNPROVEN");
  assert.ok(result.warnings.some((warning) => warning.code === "DEPLOYED_SINCE_UNKNOWN"));
}

console.log("hae-owner-work-readback-check: PASS");
