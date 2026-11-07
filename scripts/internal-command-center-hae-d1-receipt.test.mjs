import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readCommandCenterHaeExecution } from "../functions/api/_lib/command-center-hae-bridge.mjs";
import { haeJobKind, ownerWorkExecutionIdempotencyKey, readHaeJobFromD1, verifyCommandCenterOwnerWorkReceipt } from "../functions/api/_lib/command-center-hae-d1-receipt.mjs";
import { roleContractForJobType, roleContractSha256 } from "../workers/automation-engine/src/role-contracts.mjs";

const JOB_TYPE = "hae.self.improvement.audit";
const EXECUTION_JOB_ID = "job:22222222-2222-4222-8222-222222222222";
const PLAN_JOB_ID = "job:33333333-3333-4333-8333-333333333333";
const PLAN_ONLY_JOB_ID = "job:44444444-4444-4444-8444-444444444444";

const contract = roleContractForJobType(JOB_TYPE);
assert.ok(contract, "the autonomous capability must have a canonical role contract");
assert.equal(contract.permission_class, "READ_ONLY");
assert.equal(contract.semantic_required, false);
const contractSha = await roleContractSha256(contract);

const workItem = {
  id: "hcwi_owner_work_001",
  organization_scope: "hermes_internal",
  linked_task_id: "hcai_test_001",
  hae_job_id: EXECUTION_JOB_ID,
  hae_plan_job_id: PLAN_JOB_ID,
  hae_execution_job_id: EXECUTION_JOB_ID,
};

const idempotencyKey = ownerWorkExecutionIdempotencyKey({
  workItemId: workItem.id,
  planJobId: PLAN_JOB_ID,
  jobType: JOB_TYPE,
});
assert.equal(idempotencyKey, `hae:owner-work-exec:${workItem.id}:${PLAN_JOB_ID}:${JOB_TYPE}`);

const contractIdentity = {
  role_id: contract.role_id,
  plugin_version: contract.plugin_version,
  contract_version: contract.contract_version,
  sha256: contractSha,
};
const executionJob = {
  job_id: EXECUTION_JOB_ID,
  job_type: JOB_TYPE,
  business_lane: contract.business_lane,
  account_key: "hermes_logistics",
  project_key: "command-center-owner-work-execution",
  idempotency_key: idempotencyKey,
  policy_version: "command-center-hae-autonomous-v1",
  state: "SUCCEEDED",
  payload_json: JSON.stringify({ owner_work_id: workItem.id, owner_plan_job_id: PLAN_JOB_ID, tasks: [] }),
  result_json: JSON.stringify({
    capability: JOB_TYPE,
    external_write: false,
    role_contract: contractIdentity,
    result: {},
  }),
};
const successEvent = { job_id: EXECUTION_JOB_ID, event_type: "job.succeeded", to_state: "SUCCEEDED" };

// Minimal D1 stub: answers only the two canonical HAE read queries.
function d1Stub({ jobs = [], events = [] } = {}) {
  return {
    prepare(sql) {
      const text = String(sql);
      const isEvents = text.includes("hermes_automation_job_events");
      return {
        bind(...args) {
          return {
            async first() {
              if (isEvents) return null;
              return jobs.find(job => job.job_id === args[0]) || null;
            },
            async all() {
              if (!isEvents) return { results: [] };
              return { results: events.filter(event => event.job_id === args[0]) };
            },
          };
        },
      };
    },
  };
}

const oldFetch = globalThis.fetch;
globalThis.fetch = async () => {
  throw new Error("the canonical D1 readback must not need an outbound HAE call");
};
try {
  // 1) A finished autonomous execution is verifiable straight from the shared D1.
  {
    const env = { DB: d1Stub({ jobs: [executionJob], events: [successEvent] }) };
    const readback = await readCommandCenterHaeExecution(env, workItem, null);
    assert.equal(readback.receipt_verified, true, "an autonomous receipt must verify from the canonical D1");
    assert.equal(readback.state, "PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED");
    assert.equal(readback.readback_source, "HAE_CANONICAL_D1");
    assert.equal(readback.capability, JOB_TYPE);
    assert.equal(readback.role_id, contract.role_id);
    assert.equal(readback.plugin_version, contract.plugin_version);
    assert.equal(readback.contract_sha, contractSha);
    assert.equal(readback.external_write, false);
    assert.equal(readback.independent_qa_verified, false, "a D1 readback is not independent QA");
    assert.equal(readback.identity_scheme, "owner_work", "the receipt must name which identity scheme bound it");
  }

  // 2) Every binding is recomputed from the owner work item, so each tamper must
  //    fail closed instead of degrading into a soft warning.
  const holds = [
    ["idempotency key", { ...executionJob, idempotency_key: "unrelated-job" }, "IDEMPOTENCY_BINDING_MISMATCH"],
    ["work item binding", { ...executionJob, payload_json: JSON.stringify({ owner_work_id: "hcwi_other", owner_plan_job_id: PLAN_JOB_ID }) }, "SOURCE_PAYLOAD_BINDING_MISMATCH"],
    ["plan job binding", { ...executionJob, payload_json: JSON.stringify({ owner_work_id: workItem.id, owner_plan_job_id: "job:99999999-9999-4999-8999-999999999999" }) }, "SOURCE_PAYLOAD_BINDING_MISMATCH"],
    ["provider write", { ...executionJob, result_json: JSON.stringify({ capability: JOB_TYPE, external_write: false, provider_write_performed: true, role_contract: contractIdentity }) }, "RECEIPT_COST_OR_PROVIDER_WRITE_UNVERIFIED"],
    ["semantic masquerade", { ...executionJob, result_json: JSON.stringify({ capability: JOB_TYPE, external_write: false, semantic_execution: { cost_usd: 0 }, role_contract: contractIdentity }) }, "RECEIPT_COST_OR_PROVIDER_WRITE_UNVERIFIED"],
    ["role contract attestation", { ...executionJob, result_json: JSON.stringify({ capability: JOB_TYPE, external_write: false, role_contract: { ...contractIdentity, sha256: "0".repeat(64) } }) }, "RECEIPT_ROLE_CONTRACT_MISMATCH"],
    ["capability mismatch", { ...executionJob, result_json: JSON.stringify({ capability: "other.capability", external_write: false, role_contract: contractIdentity }) }, "RECEIPT_COST_OR_PROVIDER_WRITE_UNVERIFIED"],
    ["foreign project key", { ...executionJob, project_key: "command-center-plugin-route" }, "CANONICAL_JOB_IDENTITY_MISMATCH"],
    ["foreign policy", { ...executionJob, policy_version: "some-other-policy" }, "CANONICAL_JOB_IDENTITY_MISMATCH"],
  ];
  for (const [name, job, expectedReason] of holds) {
    const verdict = await verifyCommandCenterOwnerWorkReceipt({ workItem, haeJob: job, jobEvents: [successEvent] });
    assert.equal(verdict.receipt_verified, false, name + " must fail closed");
    assert.equal(verdict.reason, expectedReason, name + " must report a typed reason");
  }

  // 3) A semantic capability must never be accepted as an autonomous receipt.
  {
    const semanticJob = { ...executionJob, job_type: "search.defect.prioritize" };
    const verdict = await verifyCommandCenterOwnerWorkReceipt({
      workItem,
      haeJob: { ...semanticJob, idempotency_key: ownerWorkExecutionIdempotencyKey({ workItemId: workItem.id, planJobId: PLAN_JOB_ID, jobType: "search.defect.prioritize" }) },
      jobEvents: [successEvent],
    });
    assert.equal(verdict.receipt_verified, false, "a semantic capability must not pass the autonomous receipt gate");
    assert.equal(verdict.reason, "ROLE_CONTRACT_NOT_ELIGIBLE");
  }

  // 4) The durable success event is required exactly once.
  for (const events of [[], [successEvent, successEvent]]) {
    const verdict = await verifyCommandCenterOwnerWorkReceipt({ workItem, haeJob: executionJob, jobEvents: events });
    assert.equal(verdict.receipt_verified, false, "a missing or duplicated durable event must fail closed");
    assert.equal(verdict.reason, "DURABLE_SUCCESS_EVENT_UNVERIFIED");
  }

  // 5) A failed execution is reported, never as a verified receipt.
  // 4b) The revenue cycle clears the plan and execution columns and keeps only
  //     the job id. The binding that survives is recomputed from the work item
  //     id inside the engine-written key and cross-checked against the payload.
  {
    const revenueItem = { ...workItem, hae_plan_job_id: null, hae_execution_job_id: null };
    const verdict = await verifyCommandCenterOwnerWorkReceipt({ workItem: revenueItem, haeJob: executionJob, jobEvents: [successEvent] });
    assert.equal(verdict.receipt_verified, true, "a cleared revenue-cycle binding must still verify from the work item id");
    assert.equal(verdict.hae_job_id, EXECUTION_JOB_ID);

    const foreignKey = await verifyCommandCenterOwnerWorkReceipt({
      workItem: revenueItem,
      haeJob: { ...executionJob, idempotency_key: `hae:owner-work-exec:hcwi_other:${PLAN_JOB_ID}:${JOB_TYPE}` },
      jobEvents: [successEvent],
    });
    assert.equal(foreignKey.receipt_verified, false, "a key bound to another work item must fail closed");
    assert.equal(foreignKey.reason, "IDEMPOTENCY_BINDING_MISMATCH");

    const foreignPlan = await verifyCommandCenterOwnerWorkReceipt({
      workItem: revenueItem,
      haeJob: { ...executionJob, payload_json: JSON.stringify({ owner_work_id: workItem.id, owner_plan_job_id: "job:00000000-0000-4000-8000-000000000000" }) },
      jobEvents: [successEvent],
    });
    assert.equal(foreignPlan.receipt_verified, false, "a key that disagrees with the payload must fail closed");
    assert.equal(foreignPlan.reason, "SOURCE_PAYLOAD_BINDING_MISMATCH");
  }
  {
    const failedJob = { ...executionJob, state: "FAILED", last_error_class: "owner_work_execution_failed" };
    const env = { DB: d1Stub({ jobs: [failedJob], events: [] }) };
    const readback = await readCommandCenterHaeExecution(env, workItem, null);
    assert.equal(readback.receipt_verified, false);
    assert.equal(readback.job_state, "FAILED");
    assert.equal(readback.reason, "NO_SUCCEEDED_HAE_JOB");
  }

  // 6) The plan job is reported as a plan state, not as a business receipt.
  {
    const planJob = {
      job_id: PLAN_ONLY_JOB_ID,
      job_type: "work.item.plan",
      business_lane: "automation",
      account_key: "hermes_logistics",
      project_key: "command-center-owner-work",
      idempotency_key: `hae:owner-work-plan:${workItem.id}:v1`,
      policy_version: "command-center-hae-autonomous-v1",
      state: "WAITING_FREE_AI",
      payload_json: JSON.stringify({ owner_work_id: workItem.id }),
      result_json: null,
    };
    const env = { DB: d1Stub({ jobs: [planJob], events: [] }) };
    const readback = await readCommandCenterHaeExecution(env, { ...workItem, hae_job_id: PLAN_ONLY_JOB_ID, hae_execution_job_id: null }, null);
    assert.equal(readback.receipt_verified, false, "a plan job is not a business receipt");
    assert.equal(readback.source_verification_state, "PLAN_STATE_REPORTED");
    assert.equal(readback.job_state, "WAITING_FREE_AI");
    assert.equal(readback.reason, null);
  }

  // 7) A failed plan explains itself instead of surfacing as an opaque transport error.
  {
    const planJob = {
      job_id: PLAN_ONLY_JOB_ID,
      job_type: "work.item.plan",
      business_lane: "automation",
      account_key: "hermes_logistics",
      project_key: "command-center-owner-work",
      idempotency_key: `hae:owner-work-plan:${workItem.id}:v1`,
      policy_version: "command-center-hae-autonomous-v1",
      state: "FAILED",
      last_error_class: "owner_work_plan_failed",
      payload_json: JSON.stringify({ owner_work_id: workItem.id }),
      result_json: null,
    };
    const env = { DB: d1Stub({ jobs: [planJob], events: [] }) };
    const readback = await readCommandCenterHaeExecution(env, { ...workItem, hae_job_id: PLAN_ONLY_JOB_ID, hae_execution_job_id: null }, null);
    assert.equal(readback.reason, "owner_work_plan_failed");
    assert.equal(readback.receipt_verified, false);
  }

  // 8) A missing row falls back to the authenticated HAE readback instead of
  //    inventing a receipt.
  {
    const env = { DB: d1Stub({ jobs: [], events: [] }) };
    const readback = await readCommandCenterHaeExecution(env, workItem, null);
    assert.equal(readback.receipt_verified, false, "a missing D1 row must not claim a receipt");
    assert.equal(readback.state, "PLUGIN_EXECUTION_UNAVAILABLE");
  }

  // 9) A read of a missing row returns null so the caller can fall back.
  assert.equal(await readHaeJobFromD1(d1Stub({ jobs: [] }), EXECUTION_JOB_ID), null);
  assert.equal(await readHaeJobFromD1(null, EXECUTION_JOB_ID), null);
  assert.equal(await readHaeJobFromD1({}, EXECUTION_JOB_ID), null);

  // 10) The lane of a job is derived from the project key HAE itself writes.
  assert.equal(haeJobKind(executionJob), "owner_work_execution");
  assert.equal(haeJobKind({ project_key: "command-center-plugin-route" }), "plugin_route");
  assert.equal(haeJobKind({ project_key: "command-center-owner-work" }), "owner_work_plan");
  assert.equal(haeJobKind({ project_key: "something-else" }), "unknown");
  assert.equal(haeJobKind(null), "unknown");
} finally {
  globalThis.fetch = oldFetch;
}

// 11) A transport failure must name its cause: an identity gate in front of HAE
//     answers with a redirect, and a bearer token alone cannot satisfy it.
{
  const { selectWorkItemPluginRoute } = await import("../functions/api/_lib/internal-command-center.mjs");
  const { submitCommandCenterHaeExecution } = await import("../functions/api/_lib/command-center-hae-bridge.mjs");
  const dispatchItem = {
    id: "hcwi_dispatch_001",
    workstream: "sales",
    priority: "p1",
    status: "ready",
    updated_at: "2026-11-07T00:00:00.000Z",
    title: "Dispatch title",
    details: "Dispatch details",
  };
  const dispatchRoute = selectWorkItemPluginRoute(dispatchItem);
  const dispatchEnv = { HERMES_AUTOMATION_BASE_URL: "https://hae.example", HERMES_AUTOMATION_TOKEN: "read-only-test-token-1234567890" };

  globalThis.fetch = async () => new Response("", {
    status: 302,
    headers: {
      location: "https://twilight-credit-2fd4.cloudflareaccess.com/cdn-cgi/access/login/hae.example",
      "www-authenticate": "Cloudflare-Access resource_metadata=\"https://hae.example/.well-known/cloudflare-access-protected-resource/v1/capabilities\"",
    },
  });
  const accessRedirect = await submitCommandCenterHaeExecution(dispatchEnv, dispatchItem, dispatchRoute, "hcai_dispatch_001");
  assert.equal(accessRedirect.ok, false, "a redirect must never report a successful submission");
  assert.equal(accessRedirect.reason, "command_center_hae_bridge_access_redirect", "an identity-gate redirect must be named, not reported as an opaque rejection");

  globalThis.fetch = async () => new Response("", { status: 302, headers: { location: "https://elsewhere.example/moved" } });
  const plainRedirect = await submitCommandCenterHaeExecution(dispatchEnv, dispatchItem, dispatchRoute, "hcai_dispatch_001");
  assert.equal(plainRedirect.reason, "command_center_hae_bridge_redirect_blocked");

  const unconfigured = await submitCommandCenterHaeExecution({}, dispatchItem, dispatchRoute, "hcai_dispatch_001");
  assert.equal(unconfigured.reason, "command_center_hae_bridge_not_configured");
  assert.equal(unconfigured.status, 503);

  // The HAE worker publishes no public control-plane route: every /v1/jobs path
  // on the only published host answers 404. That must not be reported as a
  // rejected submission or as a missing job.
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, error: "not_found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  const notPublished = await submitCommandCenterHaeExecution(dispatchEnv, dispatchItem, dispatchRoute, "hcai_dispatch_001");
  assert.equal(notPublished.ok, false);
  assert.equal(notPublished.reason, "command_center_hae_control_plane_not_published");
}

// The readback must stay read-only: the Command Center never becomes a second
// writer or scheduler for HAE jobs.
const d1Source = await readFile(new URL("../functions/api/_lib/command-center-hae-d1-receipt.mjs", import.meta.url), "utf8");
const bridgeSource = await readFile(new URL("../functions/api/_lib/command-center-hae-bridge.mjs", import.meta.url), "utf8");
assert.doesNotMatch(d1Source, /\b(INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i, "the D1 readback must never write a job");
assert.match(bridgeSource, /readHaeJobFromD1/);
assert.match(bridgeSource, /verifyCommandCenterOwnerWorkReceipt/);
assert.match(bridgeSource, /readHaeJob\(env,jobId\)/, "the authenticated HAE readback must stay as the fallback");

// The owner surface must show what the API already returns: the canonical job
// id, the dispatch state and the plan disposition.
const uiSource = await readFile(new URL("../src/pages/services/hermes-connect/internal/command-center/index.astro", import.meta.url), "utf8");
assert.match(uiSource, /item\.hae_dispatch_state/, "the card must show the HAE dispatch state");
assert.match(uiSource, /item\.hae_dispatch_result/, "the card must show the plan disposition");
assert.match(uiSource, /item\.hae_execution_job_id/, "the card must show the canonical execution job id");
assert.match(uiSource, /String\(item\.job_id\|\|"—"\)/, "the HAE event timeline must show the canonical job id");

console.log("Command Center canonical D1 HAE readback: PASS");
