import { roleContractForJobType, roleContractSha256 } from "../../../workers/automation-engine/src/role-contracts.mjs";

// The HAE worker and the Command Center Pages project are bound to ONE canonical
// D1: the HAE release workflow builds the worker config from the Pages
// production DB id. A finished HAE job and its durable events are therefore
// readable by the Command Center directly, without the outbound Pages -> HAE
// HTTP hop.
//
// This module only READS. It never enqueues, retries, schedules or writes a
// job: HAE stays the only scheduler, writer and control plane. The readback
// exists so a completed execution stays verifiable - and a failed one stays
// explainable - even when the outbound transport is unavailable.

export const HAE_PLUGIN_ROUTE_PROJECT_KEY = "command-center-plugin-route";
export const HAE_OWNER_WORK_PLAN_PROJECT_KEY = "command-center-owner-work";
export const HAE_OWNER_WORK_EXECUTION_PROJECT_KEY = "command-center-owner-work-execution";
export const HAE_OWNER_WORK_DISPATCH_POLICY = "command-center-hae-autonomous-v1";

const NONEMPTY = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{2,239}$/;

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}
function parseObject(raw) {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    return value && !Array.isArray(value) && typeof value === "object" ? value : null;
  } catch { return null; }
}
function hold(reason, extra = {}) {
  return Object.freeze({
    state: "PLUGIN_EXECUTION_UNAVAILABLE",
    reason,
    source_only: true,
    provider_write_performed: false,
    helper_execution_verified: false,
    receipt_verified: false,
    ...extra,
  });
}

// Which HAE lane produced this job. The project key is written by HAE itself,
// never by the browser.
export function haeJobKind(job) {
  const projectKey = clean(job?.project_key, 120);
  if (projectKey === HAE_PLUGIN_ROUTE_PROJECT_KEY) return "plugin_route";
  if (projectKey === HAE_OWNER_WORK_EXECUTION_PROJECT_KEY) return "owner_work_execution";
  if (projectKey === HAE_OWNER_WORK_PLAN_PROJECT_KEY) return "owner_work_plan";
  return "unknown";
}

// The owner-work runtime derives the execution idempotency key from the work
// item id, the plan job id and the selected capability. All three are
// server-side owner-work fields, so the key is recomputable from the work item
// row alone and cannot be supplied by a browser.
export function ownerWorkExecutionIdempotencyKey({ workItemId, planJobId, jobType } = {}) {
  const id = clean(workItemId, 120);
  const plan = clean(planJobId, 180);
  const type = clean(jobType, 120);
  if (!id || !plan || !type) return null;
  return `hae:owner-work-exec:${id}:${plan}:${type}`;
}

// Read one HAE job and its durable events straight from the canonical D1.
// Returns null when the row is absent or the table is not bound, so the caller
// can fall back to the authenticated HAE readback.
export async function readHaeJobFromD1(db, jobId) {
  const id = clean(jobId, 180);
  if (!id || !db || typeof db.prepare !== "function") return null;
  let job = null;
  try {
    job = await db.prepare(
      "SELECT job_id,job_type,business_lane,account_key,project_key,priority,state,current_step,available_at,attempt_count,max_attempts,idempotency_key,policy_version,payload_json,result_json,last_error_class,created_at,updated_at,completed_at FROM hermes_automation_jobs WHERE job_id=? LIMIT 1"
    ).bind(id).first();
  } catch { return null; }
  if (!job) return null;
  let events = [];
  try {
    const rows = await db.prepare(
      "SELECT event_id,job_id,event_type,from_state,to_state,step,evidence_ref,provider_ref,error_class,created_at FROM hermes_automation_job_events WHERE job_id=? ORDER BY created_at ASC LIMIT 100"
    ).bind(id).all();
    events = rows?.results || [];
  } catch { events = []; }
  return { job, events };
}

/**
 * Verify an autonomously executed owner-work receipt from canonical D1 rows.
 *
 * A receipt is a historical claim about a job that already ran. It is accepted
 * only when every binding is recomputed from the owner work item row and the
 * canonical role contract - never from browser-supplied fields.
 *
 * @param {{workItem?:any, haeJob?:any, jobEvents?:any[]}} input
 * @returns {Promise<any>}
 */
export async function verifyCommandCenterOwnerWorkReceipt({ workItem, haeJob, jobEvents } = {}) {
  const workItemId = clean(workItem?.id, 160);
  const executionJobId = clean(workItem?.hae_execution_job_id, 180);
  const planJobId = clean(workItem?.hae_plan_job_id, 180);
  const fallbackJobId = clean(workItem?.hae_job_id, 180);
  if (!workItemId) return hold("OWNER_WORK_ITEM_UNVERIFIED");
  // The revenue cycle clears the plan and execution columns and keeps only the
  // job id, so the binding that survives must be recomputed from the work item
  // id inside the engine-written idempotency key.
  const boundJobId = executionJobId || fallbackJobId;
  if (!boundJobId) return hold("OWNER_WORK_ITEM_UNVERIFIED");
  if (!haeJob || clean(haeJob.job_id, 180) !== boundJobId) {
    return hold("CANONICAL_JOB_BINDING_UNVERIFIED", { hae_job_id: boundJobId });
  }
  const jobType = clean(haeJob.job_type, 120);
  if (!jobType || !NONEMPTY.test(jobType)) return hold("CANONICAL_JOB_IDENTITY_MISMATCH");
  const contract = roleContractForJobType(jobType);
  if (!contract) return hold("ROLE_CONTRACT_NOT_CANONICAL");
  // The owner-work runtime only dispatches bounded read-only, deterministic
  // capabilities. Verify that here instead of trusting the dispatch decision.
  if (contract.permission_class !== "READ_ONLY" || contract.semantic_required) {
    return hold("ROLE_CONTRACT_NOT_ELIGIBLE");
  }
  if (clean(haeJob.business_lane, 120) !== clean(contract.business_lane, 120) ||
      clean(haeJob.account_key, 120) !== "hermes_logistics" ||
      clean(haeJob.project_key, 120) !== HAE_OWNER_WORK_EXECUTION_PROJECT_KEY ||
      clean(haeJob.policy_version, 120) !== HAE_OWNER_WORK_DISPATCH_POLICY) {
    return hold("CANONICAL_JOB_IDENTITY_MISMATCH");
  }
  const payload = parseObject(haeJob.payload_json);
  if (!payload) return hold("RECEIPT_MISSING_OR_INVALID");
  if (clean(payload.owner_work_id, 160) !== workItemId) {
    return hold("SOURCE_PAYLOAD_BINDING_MISMATCH");
  }
  const jobKey = clean(haeJob.idempotency_key, 240);
  if (executionJobId) {
    const expectedKey = ownerWorkExecutionIdempotencyKey({ workItemId, planJobId, jobType });
    if (!expectedKey || jobKey !== expectedKey) return hold("IDEMPOTENCY_BINDING_MISMATCH");
    if (clean(payload.owner_plan_job_id, 180) !== planJobId) {
      return hold("SOURCE_PAYLOAD_BINDING_MISMATCH");
    }
  } else {
    // The work item id is the segment of the engine-written key that the Command
    // Center can still recompute; the plan job segment is cross-checked against
    // the independently written payload instead of being taken on trust.
    const prefix = `hae:owner-work-exec:${clean(workItemId, 120)}:`;
    if (!jobKey.startsWith(prefix) || !jobKey.endsWith(`:${jobType}`)) {
      return hold("IDEMPOTENCY_BINDING_MISMATCH");
    }
    const planSegment = jobKey.slice(prefix.length, jobKey.length - jobType.length - 1);
    if (!planSegment || clean(payload.owner_plan_job_id, 180) !== planSegment) {
      return hold("SOURCE_PAYLOAD_BINDING_MISMATCH");
    }
  }
  const jobState = clean(haeJob.state, 40).toUpperCase();
  if (jobState !== "SUCCEEDED") {
    return hold("NO_SUCCEEDED_HAE_JOB", { hae_job_id: boundJobId, job_state: jobState });
  }
  const receipt = parseObject(haeJob.result_json);
  if (!receipt) return hold("RECEIPT_MISSING_OR_INVALID");
  const contractSha = await roleContractSha256(contract);
  const expected = {
    role_id: contract.role_id,
    plugin_version: contract.plugin_version,
    contract_version: contract.contract_version,
    sha256: contractSha,
  };
  if (Object.entries(expected).some(([key, value]) => receipt?.role_contract?.[key] !== value)) {
    return hold("RECEIPT_ROLE_CONTRACT_MISMATCH");
  }
  // A D1 SUCCEEDED state cannot waive the no-provider-write / no-paid-inference
  // requirement, and a deterministic capability must not masquerade as a
  // semantic execution.
  if (receipt.capability !== jobType ||
      receipt.external_write !== false ||
      receipt.provider_write_performed === true ||
      receipt.result?.provider_write_performed === true ||
      receipt.semantic_execution != null) {
    return hold("RECEIPT_COST_OR_PROVIDER_WRITE_UNVERIFIED");
  }
  const successEvents = (Array.isArray(jobEvents) ? jobEvents : []).filter(event =>
    clean(event?.job_id, 180) === boundJobId &&
    clean(event?.event_type, 80) === "job.succeeded" &&
    clean(event?.to_state, 40).toUpperCase() === "SUCCEEDED");
  if (successEvents.length !== 1) return hold("DURABLE_SUCCESS_EVENT_UNVERIFIED");
  return Object.freeze({
    state: "MATCHED_SOURCE_ONLY",
    reason: "AUTHENTICATED_RUNTIME_AND_INDEPENDENT_QA_STILL_REQUIRED",
    source_only: true,
    provider_write_performed: false,
    helper_execution_verified: false,
    receipt_verified: true,
    hae_job_id: boundJobId,
    job_type: jobType,
    capability: jobType,
    role_id: contract.role_id,
    plugin_version: contract.plugin_version,
    contract_sha256: contractSha,
    external_write: false,
    readback_source: "HAE_CANONICAL_D1",
  });
}
