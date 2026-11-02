import { roleContractSha256 } from "../../../workers/automation-engine/src/role-contracts.mjs";

// #2220: pure source-side verification for a future authenticated Command Center
// -> canonical HAE Queue/Worker/D1 readback. This module NEVER dispatches, writes
// to D1, authorizes a provider operation or independently attests transport.
// HAE roleContractSha256() stores an unprefixed, lowercase 64-char hex digest.
const HASH = /^[a-f0-9]{64}$/;
const JOB_ID = /^job:[a-f0-9-]{36}$/i;
const NONEMPTY = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{2,239}$/;
const ROUTE_POLICY = "command-center-route-v1";

function hold(reason, extra = {}) {
  return Object.freeze({
    state: "PLUGIN_EXECUTION_UNAVAILABLE",
    reason,
    source_only: true,
    provider_write_performed: false,
    helper_execution_verified: false,
    ...extra,
  });
}
function parseObject(raw) {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    return value && !Array.isArray(value) && typeof value === "object" ? value : null;
  } catch { return null; }
}

// The same logical Command Center attempt must always resolve to the same
// HAE idempotency identity. Include owner scope, existing Internal AI attempt,
// selected role, policy, job contract and exact digest; no browser-provided key.
export async function commandCenterHaeIdempotencyKey({ workItem, route, roleContract, contractSha } = {}) {
  if (workItem?.organization_scope !== "hermes_internal" ||
      !NONEMPTY.test(String(workItem?.id || "")) ||
      !NONEMPTY.test(String(workItem?.linked_task_id || "")) ||
      route?.policy_version !== ROUTE_POLICY ||
      route?.owner?.role_id !== roleContract?.role_id ||
      route?.owner?.plugin_version !== roleContract?.plugin_version ||
      !NONEMPTY.test(String(roleContract?.job_type || "")) ||
      !NONEMPTY.test(String(roleContract?.contract_version || "")) ||
      !HASH.test(String(contractSha || ""))) return null;
  const identity = JSON.stringify([
    "hermes-command-center-hae-v1", workItem.organization_scope,
    workItem.id, workItem.linked_task_id, route.policy_version,
    route.owner.role_id, route.owner.plugin_version,
    roleContract.job_type, roleContract.contract_version, contractSha,
  ]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity));
  const hex = [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
  return "hae:cc:v1:" + hex;
}

// Inputs MUST be retrieved by a separately authenticated owner-only server
// route from the persisted owner item and HAE D1; browser fields are untrusted.
// A MATCHED_SOURCE_ONLY outcome means the rows are structurally consistent,
// not that a live authenticated D1 readback, independent QA or deploy occurred.
export async function verifyCommandCenterHaeReceipt({
  workItem, registryEntries, registryEvidence, binding, haeJob, jobEvents,
  roleContract,
} = {}) {
  if (workItem?.organization_scope !== "hermes_internal" ||
      !NONEMPTY.test(String(workItem?.id || "")) ||
      !NONEMPTY.test(String(workItem?.linked_task_id || ""))) {
    return hold("OWNER_WORK_ITEM_UNVERIFIED");
  }
  const route = parseObject(workItem.plugin_route_json);
  if (route?.policy_version !== ROUTE_POLICY ||
      route?.state !== "PLUGIN_SELECTED_NOT_EXECUTED" ||
      !NONEMPTY.test(String(route?.owner?.role_id || "")) ||
      !/^\d+\.\d+\.\d+$/.test(String(route?.owner?.plugin_version || ""))) {
    return hold("ROUTE_NOT_VERIFIED");
  }
  if (registryEvidence?.fresh !== true || !Array.isArray(registryEntries)) {
    return hold("REGISTRY_SNAPSHOT_UNVERIFIED");
  }
  const registered = registryEntries.filter(e => e?.role_id === route.owner.role_id);
  if (registered.length !== 1 ||
      registered[0].plugin_version !== route.owner.plugin_version) {
    return hold("PLUGIN_ROUTE_VERSION_DRIFT");
  }
  if (route.helpers !== undefined && (!Array.isArray(route.helpers) ||
      route.helpers.some(h => !h?.role_id || !h?.plugin_version ||
        registryEntries.filter(e=>e?.role_id===h.role_id && e.plugin_version===h.plugin_version).length!==1))) {
    return hold("HELPER_ROUTE_VERSION_DRIFT");
  }
  // Binding must be created/read by the owner-only backend, never by browser.
  if (binding?.work_item_id !== workItem.id ||
      binding?.linked_task_id !== workItem.linked_task_id ||
      !JOB_ID.test(String(binding?.hae_job_id || "")) ||
      !NONEMPTY.test(String(binding?.idempotency_key || "")) ||
      !NONEMPTY.test(String(binding?.job_type || ""))) {
    return hold("CANONICAL_JOB_BINDING_UNVERIFIED");
  }
  if (!roleContract ||
      roleContract.job_type !== binding.job_type ||
      roleContract.role_id !== route.owner.role_id ||
      roleContract.plugin_version !== route.owner.plugin_version ||
      roleContract.permission_class !== "READ_ONLY" ||
      !NONEMPTY.test(String(roleContract.contract_version || "")) ||
      !HASH.test(String(binding?.contract_sha256 || ""))) {
    return hold("ROLE_CONTRACT_NOT_ELIGIBLE");
  }
  // Never trust a caller-supplied digest even if payload and result agree.
  const independentlyComputedSha = await roleContractSha256(roleContract);
  if (binding.contract_sha256 !== independentlyComputedSha) {
    return hold("ROLE_CONTRACT_SHA_MISMATCH");
  }
  const canonicalIdempotency = await commandCenterHaeIdempotencyKey({
    workItem, route, roleContract, contractSha: independentlyComputedSha,
  });
  if (!canonicalIdempotency || canonicalIdempotency !== binding.idempotency_key) {
    return hold("IDEMPOTENCY_BINDING_MISMATCH");
  }
  if (!haeJob ||
      haeJob.job_id !== binding.hae_job_id ||
      haeJob.job_type !== binding.job_type ||
      haeJob.idempotency_key !== binding.idempotency_key) {
    return hold("CANONICAL_JOB_IDENTITY_MISMATCH");
  }
  if (haeJob.state !== "SUCCEEDED") {
    return hold("NO_SUCCEEDED_HAE_JOB", {hae_job_id: binding.hae_job_id});
  }
  const payload = parseObject(haeJob.payload_json);
  const receipt = parseObject(haeJob.result_json);
  if (!payload || !receipt) return hold("RECEIPT_MISSING_OR_INVALID");
  const expected = {
    role_id: route.owner.role_id,
    plugin_version: route.owner.plugin_version,
    contract_version: roleContract.contract_version,
    sha256: binding.contract_sha256,
  };
  if (Object.entries(expected).some(([key,value]) =>
    payload?._role_contract?.[key] !== value ||
    receipt?.role_contract?.[key] !== value)) {
    return hold("RECEIPT_ROLE_CONTRACT_MISMATCH");
  }
  if (receipt.capability !== binding.job_type ||
      receipt.external_write !== false ||
      payload?.external_provider_write === true ||
      roleContract?.semantic_required && roleContract.free_ai_policy !== "free_only_wait_if_unavailable") {
    return hold("RECEIPT_PERMISSION_OR_CAPABILITY_MISMATCH");
  }
  const successEvents = Array.isArray(jobEvents) ? jobEvents.filter(event =>
    event?.job_id === binding.hae_job_id &&
    event?.event_type === "job.succeeded" &&
    event?.to_state === "SUCCEEDED") : [];
  if (successEvents.length !== 1) return hold("DURABLE_SUCCESS_EVENT_UNVERIFIED");
  return Object.freeze({
    state: "MATCHED_SOURCE_ONLY",
    reason: "AUTHENTICATED_RUNTIME_AND_INDEPENDENT_QA_STILL_REQUIRED",
    source_only: true,
    provider_write_performed: false,
    helper_execution_verified: false,
    hae_job_id: binding.hae_job_id,
    role_id: route.owner.role_id,
    plugin_version: route.owner.plugin_version,
    contract_sha256: binding.contract_sha256,
  });
}
