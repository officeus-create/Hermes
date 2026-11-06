import { roleContractForJobType, roleContractSha256 } from "../../../workers/automation-engine/src/role-contracts.mjs";

// #2220: pure source-side verification for a future authenticated Command Center
// -> canonical HAE Queue/Worker/D1 readback. This module NEVER dispatches, writes
// to D1, authorizes a provider operation or independently attests transport.
// HAE roleContractSha256() stores an unprefixed, lowercase 64-char hex digest.
const HASH = /^[a-f0-9]{64}$/;
const JOB_ID = /^job:[a-f0-9-]{36}$/i;
const NONEMPTY = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{2,239}$/;
const ROUTE_POLICY = "command-center-route-v1";
// Tolerance for clock skew between the attestation writer and this reader. A route
// attested further in the future than that is fabricated evidence, not skew.
const FUTURE_ATTESTATION_SKEW_MS = 300000;

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
/**
 * @typedef {Object} ReceiptVerificationInput
 * @property {any} [workItem]
 * @property {any[]} [registryEntries]
 * @property {any} [registryEvidence]
 * @property {any} [binding]
 * @property {any} [haeJob]
 * @property {any[]} [jobEvents]
 * @property {any} [roleContract]
 * @property {string} [registryObservedAt]
 * @property {string} [registrySourceClass]
 * @property {string} [nowIso]
 */

/**
 * @param {ReceiptVerificationInput} input
 * @returns {Promise<any>}
 */
export async function verifyCommandCenterHaeReceipt({
  workItem, registryEntries, registryEvidence, binding, haeJob, jobEvents,
  roleContract, registryObservedAt, registrySourceClass,
  nowIso = new Date().toISOString(),
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
  if (!Array.isArray(registryEntries)) {
    return hold("REGISTRY_SNAPSHOT_UNVERIFIED");
  }
  // A receipt is a HISTORICAL claim about a job that already ran. The evidence that the
  // executed plugin version was attested is the attestation PINNED ON THE ROUTE by the
  // server-side routing policy (source_class + registry_observed_at), NOT the wall-clock
  // freshness of the shared registry snapshot. A source timestamp decays by construction
  // every 24h, so a refresh gap would silently destroy durable receipts of work that
  // already succeeded. Inventory liveness stays enforced where it belongs: the
  // plugin-release drift preflight (HOLD_STALE_REGISTERED_REGISTRY) and the HAE
  // self-improvement scheduler (P1 plugin-runtime-registry-evidence-stale).
  const observedAt = String(registryObservedAt || registryEvidence?.observed_at || "");
  const sourceClass = String(registrySourceClass || registryEvidence?.source_class || "");
  const attestedAt = Date.parse(String(route.registry_observed_at || ""));
  const currentObservedAt = Date.parse(observedAt);
  const nowMs = Date.parse(String(nowIso || ""));
  if (!Number.isFinite(attestedAt) || !Number.isFinite(currentObservedAt) ||
      !Number.isFinite(nowMs) || !sourceClass ||
      route.source_class !== sourceClass) {
    return hold("ROUTE_REGISTRY_ATTESTATION_UNVERIFIED");
  }
  // A future-dated attestation is fabricated evidence and must fail closed.
  if (attestedAt > nowMs + FUTURE_ATTESTATION_SKEW_MS) {
    return hold("ROUTE_REGISTRY_ATTESTATION_UNVERIFIED");
  }
  // The pinned version must still be exactly the version the canonical inventory
  // attests for that role. A version bump is a deliberate plugin release: it fails
  // closed loudly (PLUGIN_ROUTE_VERSION_DRIFT) and the item is re-dispatched with a
  // freshly pinned route, rather than silently re-attesting a historical job.
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
  // A caller-supplied contract object is NOT an execution authority. Independently
  // resolve the canonical allowlisted contract from the HAE source registry.
  const canonicalContract = roleContractForJobType(binding.job_type);
  if (!canonicalContract ||
      await roleContractSha256(canonicalContract) !== await roleContractSha256(roleContract)) {
    return hold("ROLE_CONTRACT_NOT_CANONICAL");
  }
  // Never trust a caller-supplied digest even if payload and result agree.
  const independentlyComputedSha = await roleContractSha256(canonicalContract);
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
      haeJob.business_lane !== canonicalContract.business_lane ||
      haeJob.idempotency_key !== binding.idempotency_key) {
    return hold("CANONICAL_JOB_IDENTITY_MISMATCH");
  }
  if (haeJob.state !== "SUCCEEDED") {
    return hold("NO_SUCCEEDED_HAE_JOB", {hae_job_id: binding.hae_job_id});
  }
  const payload = parseObject(haeJob.payload_json);
  const receipt = parseObject(haeJob.result_json);
  if (!payload || !receipt) return hold("RECEIPT_MISSING_OR_INVALID");
  const sourceTasks = Array.isArray(payload.tasks) ? payload.tasks : [];
  const sourceTask = sourceTasks.length === 1 ? sourceTasks[0] : null;
  if (
    payload.source_kind !== "CHATGPT_SELECTED" ||
    payload.snapshot_id !== `command-center:${workItem.id}:${workItem.linked_task_id}` ||
    !sourceTask ||
    sourceTask.work_id !== workItem.id ||
    sourceTask.writer_key !== `internal-ai:${workItem.linked_task_id}` ||
    sourceTask.permission_class !== "READ_ONLY" ||
    sourceTask.source_ref !== `chatgpt-selected://command-center/${workItem.id}`
  ) {
    return hold("SOURCE_PAYLOAD_BINDING_MISMATCH");
  }
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
  // A D1 SUCCEEDED state cannot waive the zero-paid-inference / no-provider-write
  // requirement. Semantic jobs need a canonical zero-cost usage receipt;
  // deterministic jobs must not masquerade as semantic executions.
  const semanticUsage = receipt.semantic_execution;
  if (receipt.provider_write_performed === true ||
      receipt.result?.provider_write_performed === true ||
      (canonicalContract.semantic_required
        ? !semanticUsage || typeof semanticUsage !== "object" ||
          semanticUsage.cost_usd !== 0 || semanticUsage.budget_usd !== 0 ||
          typeof semanticUsage.usage_id !== "string" || !semanticUsage.usage_id.trim()
        : semanticUsage != null)) {
    return hold("RECEIPT_COST_OR_PROVIDER_WRITE_UNVERIFIED");
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
    // The route's plugin version was attested by an inventory observation at the
    // moment the server-side routing policy pinned it.
    route_registry_observed_at: route.registry_observed_at,
    // Live inventory freshness is reported, never used to rewind a completed
    // execution. The HAE self-improvement scheduler raises it as a P1 finding.
    registry_evidence_fresh: registryEvidence?.fresh === true,
  });
}
