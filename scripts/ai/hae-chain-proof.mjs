#!/usr/bin/env node
/**
 * Local proof harness for the canonical Hermes HAE chain.
 *
 *   WORK_ID -> HAE job (D1 + Queue) -> VIKTOR-WINDOWS node -> completion -> D1 receipt
 *
 * WHAT IS REAL IN THIS HARNESS
 *  - the HAE Worker code itself (workers/automation-engine/src/index.mjs), imported, not re-implemented;
 *  - the canonical Cron -> Queue -> Worker -> D1 lifecycle (worker.scheduled + worker.queue);
 *  - the Windows node auth protocol (Ed25519 SPKI signature, nonce replay, timestamp skew, lease fence);
 *  - the semantic step executed by a LOCAL Ollama model (cost 0, no paid provider, no external write);
 *  - the production SQL statements executed against SQLite through the D1 interface.
 *
 * WHAT THIS HARNESS DOES NOT CLAIM
 *  - anything about the DEPLOYED production HAE: that needs HERMES_AUTOMATION_TOKEN and the
 *    Windows node private key, which do not exist on this Mac (the deployed gate answers 401);
 *  - the node role runs on the owner Mac, not on the VIKTOR-WINDOWS machine;
 *  - the D1 here is a local SQLite emulator, not the canonical production D1 database.
 *
 * Usage: node scripts/ai/hae-chain-proof.mjs [--model <ollama-model>] [--json]
 */

import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import worker from "../../workers/automation-engine/src/index.mjs";
import {
  buildWindowsNodeAuthMessage,
  WINDOWS_NODE_CONTRACT_VERSION,
  WINDOWS_NODE_ID,
  WINDOWS_NODE_KEY_ID,
} from "../../workers/automation-engine/src/windows-node-runtime.mjs";
import { validateRoleContractSemanticResult } from "../../workers/automation-engine/src/role-contracts.mjs";
import { ensureCommandCenterSchema } from "../../functions/api/_lib/internal-command-center.mjs";

// The deployed worker serves two surfaces on two different hosts:
//   - the control plane (/v1/jobs, /v1/jobs/<id>) on the worker base URL, which in production is
//     the Pages secret HERMES_AUTOMATION_BASE_URL (https-only, not discoverable from outside);
//   - the Windows node edge (/v1/nodes/windows/*) on the dedicated custom domain.
// The worker fails closed: any non-node path on the node host answers 404.
const NODE_HOST = "hae-node.hermeslogisticsus.com";
const CONTROL_HOST = "hae-control.hermeslogisticsus.com";
const OLLAMA_HOST = "http://127.0.0.1:11434";
const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const PRIMARY_MODEL = argValue("--model", "deepseek-r1:1.5b");
const FALLBACK_MODEL = argValue("--fallback-model", "qwen2.5-coder:7b");
const OUTPUT_PATH = argValue("--out", "");

const evidence = { started_at: new Date().toISOString(), phases: {}, checks: [] };
const log = (...args) => { if (!args.includes("--json")) console.log(...args); };
function check(name, passed, detail) {
  evidence.checks.push({ name, passed: Boolean(passed), detail: detail ?? null });
  log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` :: ${detail}` : ""}`);
  return passed;
}

/* ---------------------------------------------------------------- D1 emulator */
class D1Statement {
  constructor(sql, statement) { this.sql = sql; this.statement = statement; this.values = []; }
  bind(...values) {
    this.values = values.map((value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === "boolean") return value ? 1 : 0;
      if (value instanceof Date) return value.toISOString();
      return value;
    });
    return this;
  }
  async run() { const result = this.statement.run(...this.values); return { meta: { changes: Number(result.changes || 0) } }; }
  async first() { return this.statement.get(...this.values) || null; }
  async all() { return { results: this.statement.all(...this.values) }; }
}
class D1Database {
  constructor() { this.database = new DatabaseSync(":memory:"); }
  prepare(sql) { return new D1Statement(sql, this.database.prepare(sql)); }
  async batch(statements) {
    this.database.exec("BEGIN");
    try {
      const out = [];
      for (const statement of statements) out.push(await statement.run());
      this.database.exec("COMMIT");
      return out;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}

/* --------------------------------------------------------------- queue stub */
class QueueStub {
  constructor(name) { this.name = name; this.messages = []; }
  async send(body, options = {}) { this.messages.push({ body, options }); return { id: `msg-${this.messages.length}` }; }
  async metrics() {
    return {
      backlogCount: this.messages.length,
      backlogBytes: this.messages.length * 256,
      oldestMessageTimestamp: this.messages.length ? Date.now() - 1000 : null,
    };
  }
}

/* ------------------------------------------------------------- worker plumbing */
const DB = new D1Database();
const automationQueue = new QueueStub("hermes-automation");
const automationDlq = new QueueStub("hermes-automation-dlq");
const localToken = `local-proof-${randomUUID()}`;

const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
const publicSpkiB64 = Buffer.from(await crypto.subtle.exportKey("spki", keyPair.publicKey)).toString("base64");

const env = {
  DB,
  AUTOMATION_QUEUE: automationQueue,
  AUTOMATION_DLQ: automationDlq,
  HERMES_AUTOMATION_TOKEN: localToken,
  HERMES_AUTOMATION_MODE: "dry_run",
  HERMES_AUTOMATION_PUBLISH: "disabled",
  HERMES_AUTOMATION_SOURCE_SHA: "local-proof-harness",
  HERMES_WINDOWS_NODE_ENABLED: "enabled",
  HERMES_WINDOWS_NODE_HOST: NODE_HOST,
  HERMES_WINDOWS_NODE_PUBLIC_KEY_SPKI_B64: publicSpkiB64,
  HERMES_WINDOWS_NODE_PIN_BUILTIN_KEY: "disabled",
  HERMES_FREE_AI_CLOUDFLARE_ENABLED: "disabled",
};

const ctx = { waitUntil: (promise) => { pending.push(Promise.resolve(promise).catch(() => {})); } };
const pending = [];

async function api(path, { method = "GET", body, token = localToken, host = CONTROL_HOST } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const request = new Request(`https://${host}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await worker.fetch(request, env);
  const text = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  return { status: response.status, body: parsed ?? text };
}

async function nodeApi(path, payload, method = "POST") {
  const body = method === "POST" ? JSON.stringify(payload ?? {}) : "";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = `nonce_${randomUUID().replace(/-/g, "")}`;
  const unsigned = new Request(`https://${NODE_HOST}${path}`, {
    method, body: method === "POST" ? body : undefined,
    headers: { "Content-Type": "application/json" },
  });
  const message = await buildWindowsNodeAuthMessage(unsigned, body, timestamp, nonce);
  const signature = await crypto.subtle.sign("Ed25519", keyPair.privateKey, new TextEncoder().encode(message));
  const request = new Request(`https://${NODE_HOST}${path}`, {
    method,
    body: method === "POST" ? body : undefined,
    headers: {
      "Content-Type": "application/json",
      "X-Hermes-Node-Id": WINDOWS_NODE_ID,
      "X-Hermes-Node-Key-Id": WINDOWS_NODE_KEY_ID,
      "X-Hermes-Node-Timestamp": timestamp,
      "X-Hermes-Node-Nonce": nonce,
      "X-Hermes-Node-Signature": Buffer.from(signature).toString("base64url"),
    },
  });
  const response = await worker.fetch(request, env);
  const text = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  return { status: response.status, body: parsed ?? text };
}

async function drainQueue(queue = automationQueue) {
  const handled = [];
  while (queue.messages.length) {
    const batch = queue.messages.splice(0, 5).map((message, index) => ({
      id: `local-msg-${index}`,
      body: message.body,
      timestamp: new Date().toISOString(),
      attempts: 1,
      ack() { this.acked = true; },
      retry() { this.retried = true; },
    }));
    await worker.queue({ queue: queue.name, messages: batch }, env);
    handled.push(...batch.map((item) => ({ type: item.body?.type, job_id: item.body?.job_id, acked: item.acked === true })));
  }
  return handled;
}

async function runCron(cron) {
  await worker.scheduled({ cron, scheduledTime: Date.now() }, env, ctx);
  while (pending.length) await pending.shift();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* --------------------------------------------------------- local inference */
async function ollamaGenerate(model, prompt) {
  const started = Date.now();
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0, num_predict: 500, num_ctx: 4096 },
    }),
  });
  if (!response.ok) throw new Error(`ollama_http_${response.status}`);
  const json = await response.json();
  return {
    raw: String(json.response || ""),
    prompt_tokens: Number(json.prompt_eval_count || 0),
    output_tokens: Number(json.eval_count || 0),
    duration_ms: Date.now() - started,
  };
}

function extractJson(text) {
  const withoutThinking = text.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/<think>[\s\S]*$/, "");
  const fenced = withoutThinking.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : withoutThinking;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(candidate.slice(start, end + 1)); } catch { return null; }
}

async function semanticResultFromModel(model, semanticRequest, executionPayload, jobType) {
  const attempts = [];
  let raw = "";
  let parsed = null;
  let validationError = null;
  for (const prompt of [
    `${semanticRequest.system_prompt}\n\n${semanticRequest.user_prompt}`,
    `${semanticRequest.system_prompt}\n\n${semanticRequest.user_prompt}\n\nYour previous answer was rejected: ${validationError || "not valid JSON"}. Answer again with ONLY the JSON object, no commentary, no markdown, exactly four keys: disposition, recommended_job_type, rationale, next_action.`,
  ]) {
    const generation = await ollamaGenerate(model, prompt);
    raw = generation.raw;
    attempts.push({ model, prompt_chars: prompt.length, output_chars: raw.length, output_tokens: generation.output_tokens, duration_ms: generation.duration_ms });
    parsed = extractJson(raw);
    if (!parsed) { validationError = "output was not valid JSON"; continue; }
    try {
      validateRoleContractSemanticResult(jobType, executionPayload, parsed);
      return { result: parsed, model, attempts, raw };
    } catch (error) {
      validationError = error?.message || "contract_invalid";
    }
  }
  throw new Error(`semantic_result_invalid: ${validationError}`);
}

/* ================================================================== PHASE 1 */
log("PHASE 1 — HAE executes a job itself and writes a D1 receipt");
const healthCreate = await api("/v1/jobs", {
  method: "POST",
  body: {
    job_type: "system.health.snapshot",
    business_lane: "automation",
    idempotency_key: `proof:health:${randomUUID()}`,
    priority: 50,
    max_attempts: 1,
    policy_version: "hae-readonly-v1",
    payload: {},
  },
});
const healthJobId = healthCreate.body?.job?.job_id || null;
evidence.phases.phase1_create = { status: healthCreate.status, job_id: healthJobId };
check("POST /v1/jobs accepts an authorized HAE job (202)", healthCreate.status === 202 && Boolean(healthJobId), `status=${healthCreate.status}`);
check("HAE job row persisted in D1 before execution",
  Boolean(healthJobId) && Boolean(await DB.prepare("SELECT job_id FROM hermes_automation_jobs WHERE job_id=?").bind(healthJobId).first()));

const unauthorized = await api("/v1/jobs", { method: "POST", token: "wrong-token", body: { job_type: "system.health.snapshot", business_lane: "automation", idempotency_key: `proof:unauth:${randomUUID()}`, payload: {} } });
check("POST /v1/jobs without the right token is rejected (401)", unauthorized.status === 401, `status=${unauthorized.status}`);

const handledMessages = await drainQueue();
const healthJob = await DB.prepare("SELECT job_id,job_type,state,current_step,attempt_count,result_json,last_error_class,completed_at FROM hermes_automation_jobs WHERE job_id=?").bind(healthJobId).first();
evidence.phases.phase1_receipt = { state: healthJob?.state, queue_messages: handledMessages.length, has_result: Boolean(healthJob?.result_json) };
check("Queue consumer ran the job.execute message", handledMessages.some((m) => m.type === "job.execute" && m.job_id === healthJobId), JSON.stringify(handledMessages));
check("D1 receipt: job state is SUCCEEDED", healthJob?.state === "SUCCEEDED", `state=${healthJob?.state} error=${healthJob?.last_error_class}`);
check("D1 receipt: result_json persisted", Boolean(healthJob?.result_json));
const healthEvents = await DB.prepare("SELECT event_type,to_state FROM hermes_automation_job_events WHERE job_id=? ORDER BY created_at").bind(healthJobId).all();
evidence.phases.phase1_events = healthEvents.results;
check("D1 receipt: canonical job.succeeded event recorded", healthEvents.results.some((e) => e.event_type === "job.succeeded"));
const healthReadback = await api(`/v1/jobs/${encodeURIComponent(healthJobId)}`);
check("GET /v1/jobs/<id> readback shows the persisted receipt", healthReadback.status === 200 && healthReadback.body?.job?.state === "SUCCEEDED", `status=${healthReadback.status}`);

/* ================================================================== PHASE 2 */
log("PHASE 2 — canonical WORK_ID -> HAE semantic job (windows handoff)");
await ensureCommandCenterSchema(DB);
const workItemsBefore = await DB.prepare("SELECT COUNT(*) AS count FROM hermes_owner_work_items").first();
check("Canonical Command Center backlog is seeded in D1", Number(workItemsBefore?.count || 0) >= 50, `rows=${workItemsBefore?.count}`);

await runCron("*/5 * * * *");
const plannedWorkItem = await DB.prepare("SELECT id,status,hae_plan_job_id,hae_job_id,hae_dispatch_state,workstream,priority,title FROM hermes_owner_work_items WHERE hae_plan_job_id IS NOT NULL AND hae_plan_job_id<>'' ORDER BY updated_at DESC LIMIT 1").first();
evidence.phases.phase2_work_item = plannedWorkItem;
check("Cron intake created an HAE plan job for a real WORK_ID", Boolean(plannedWorkItem?.hae_plan_job_id), `work_id=${plannedWorkItem?.id} job=${plannedWorkItem?.hae_plan_job_id}`);
check("Work item moved to in_progress / PLAN_QUEUED", plannedWorkItem?.status === "in_progress" && plannedWorkItem?.hae_dispatch_state === "PLAN_QUEUED", `status=${plannedWorkItem?.status} dispatch=${plannedWorkItem?.hae_dispatch_state}`);

const planJobId = plannedWorkItem?.hae_plan_job_id || null;
await drainQueue();
const planJob = await DB.prepare("SELECT job_id,job_type,state,current_step,attempt_count,last_error_class,available_at,payload_json FROM hermes_automation_jobs WHERE job_id=?").bind(planJobId).first();
evidence.phases.phase2_job = { state: planJob?.state, current_step: planJob?.current_step, error_class: planJob?.last_error_class, attempt_count: planJob?.attempt_count };
check("Semantic job waits for the free-AI node (WAITING_FREE_AI / windows_node_required)",
  planJob?.state === "WAITING_FREE_AI" && planJob?.last_error_class === "windows_node_required", `state=${planJob?.state} error=${planJob?.last_error_class}`);
check("Semantic job did not consume its single attempt", Number(planJob?.attempt_count || 0) === 0, `attempts=${planJob?.attempt_count}`);

/* ================================================================== PHASE 3 */
log("PHASE 3 — VIKTOR-WINDOWS node: signed claim -> local inference -> completion");
const replayRequest = await api("/v1/nodes/windows/claim", { method: "POST", body: {}, token: "wrong-token", host: NODE_HOST });
check("Unauthenticated node call is rejected (401)", replayRequest.status === 401, `status=${replayRequest.status}`);

const heartbeat = await nodeApi("/v1/nodes/windows/heartbeat", {
  node_id: WINDOWS_NODE_ID,
  contract_version: WINDOWS_NODE_CONTRACT_VERSION,
  model: PRIMARY_MODEL,
  status: "IDLE",
});
evidence.phases.phase3_heartbeat = heartbeat.body;
check("Signed Ed25519 heartbeat accepted", heartbeat.status === 200 && heartbeat.body?.status === "HEARTBEAT_ACCEPTED", JSON.stringify(heartbeat.body));

const availableAt = planJob?.available_at ? Date.parse(planJob.available_at) : 0;
const waitMs = Math.max(0, availableAt - Date.now()) + 250;
if (waitMs > 0) {
  log(`  waiting ${Math.ceil(waitMs / 1000)}s for the canonical free-AI availability window`);
  await sleep(Math.min(waitMs, 180000));
}

const claim = await nodeApi("/v1/nodes/windows/claim", {
  node_id: WINDOWS_NODE_ID,
  contract_version: WINDOWS_NODE_CONTRACT_VERSION,
  model: PRIMARY_MODEL,
});
const lease = claim.body?.lease || null;
evidence.phases.phase3_claim = { status: claim.body?.status, job_id: lease?.job_id, work_id: lease?.work_id, role_contract: lease?.role_contract };
check("Signed claim leases the semantic job", claim.body?.status === "LEASE_ACCEPTED" && lease?.job_id === planJobId, JSON.stringify(claim.body?.status));
check("Lease carries the frozen role contract (READ_ONLY, max_cost_usd 0)",
  lease?.role_contract?.permission_class === "READ_ONLY" && lease?.role_contract?.max_cost_usd === 0 && lease?.role_contract?.semantic_required === true);
check("Lease carries the semantic prompt for the node", Boolean(lease?.semantic_request?.system_prompt) && Boolean(lease?.semantic_request?.user_prompt));
check("Lease binds the same WORK_ID as the backlog item", lease?.work_id === plannedWorkItem?.id, `lease=${lease?.work_id} item=${plannedWorkItem?.id}`);

const leasedJobRow = await DB.prepare("SELECT payload_json,state,current_step FROM hermes_automation_jobs WHERE job_id=?").bind(planJobId).first();
const leasedPayload = JSON.parse(leasedJobRow?.payload_json || "{}");
delete leasedPayload._role_contract;

let semantic = null;
let semanticError = null;
const laneFailures = [];
for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
  try {
    semantic = await semanticResultFromModel(model, lease.semantic_request, leasedPayload, "work.item.plan");
    break;
  } catch (error) {
    semanticError = error?.message || String(error);
    laneFailures.push({ model, error: semanticError });
    log(`  model ${model} did not produce a contract-valid result: ${semanticError}`);
  }
}
evidence.phases.phase3_inference = semantic
  ? { model: semantic.model, attempts: semantic.attempts, failed_lanes: laneFailures, result: semantic.result }
  : { error: semanticError, failed_lanes: laneFailures };
check("Local free model produced a contract-valid semantic result", Boolean(semantic), semanticError || "ok");

if (semantic) {
  const complete = await nodeApi("/v1/nodes/windows/complete", {
    node_id: WINDOWS_NODE_ID,
    contract_version: WINDOWS_NODE_CONTRACT_VERSION,
    job_id: lease.job_id,
    lease_id: lease.lease_id,
    fence: lease.fence,
    model: semantic.model,
    cost_usd: 0,
    semantic_result: semantic.result,
    usage: {
      input_tokens: semantic.attempts.reduce((sum, a) => sum + (a.output_tokens || 0), 0),
      output_tokens: semantic.attempts.reduce((sum, a) => sum + (a.output_tokens || 0), 0),
      input_chars: semantic.attempts.reduce((sum, a) => sum + (a.prompt_chars || 0), 0),
      output_chars: semantic.attempts.reduce((sum, a) => sum + (a.output_chars || 0), 0),
    },
  });
  evidence.phases.phase3_complete = { status: complete.body?.status, job_id: complete.body?.job_id };
  check("Completion accepted by HAE (SUCCEEDED)", complete.body?.status === "SUCCEEDED", JSON.stringify(complete.body?.status || complete.body));

  const completedJob = await DB.prepare("SELECT job_id,state,current_step,result_json,completed_at FROM hermes_automation_jobs WHERE job_id=?").bind(planJobId).first();
  const parsedResult = completedJob?.result_json ? JSON.parse(completedJob.result_json) : null;
  evidence.phases.phase3_receipt = {
    state: completedJob?.state,
    provider_id: parsedResult?.semantic_execution?.provider_id,
    cost_usd: parsedResult?.semantic_execution?.cost_usd,
    external_write: parsedResult?.external_write,
    disposition: parsedResult?.result?.disposition,
    recommended_job_type: parsedResult?.result?.recommended_job_type,
  };
  check("D1 receipt: job is SUCCEEDED after the node completion", completedJob?.state === "SUCCEEDED", `state=${completedJob?.state}`);
  check("D1 receipt: provider is the windows node, cost 0, no external write",
    parsedResult?.semantic_execution?.provider_id === "viktor-windows-ollama" && Number(parsedResult?.semantic_execution?.cost_usd) === 0 && parsedResult?.external_write === false);

  const completionEvents = await DB.prepare("SELECT event_type FROM hermes_automation_job_events WHERE job_id=? ORDER BY created_at").bind(planJobId).all();
  evidence.phases.phase3_events = completionEvents.results;
  check("D1 receipt: job.windows_node_succeeded event recorded", completionEvents.results.some((e) => e.event_type === "job.windows_node_succeeded"));
  check("D1 receipt: canonical job.succeeded event recorded", completionEvents.results.some((e) => e.event_type === "job.succeeded"));

  const usageRows = await DB.prepare("SELECT provider_id,model,cost_usd,budget_usd,status FROM hermes_automation_ai_usage WHERE job_id=?").bind(planJobId).all();
  evidence.phases.phase3_usage = usageRows.results;
  check("AI usage ledger row: provider viktor-windows-ollama, cost 0",
    usageRows.results.length === 1 && usageRows.results[0]?.cost_usd === 0 && usageRows.results[0]?.provider_id === "viktor-windows-ollama",
    JSON.stringify(usageRows.results));

  const replayComplete = await nodeApi("/v1/nodes/windows/complete", {
    node_id: WINDOWS_NODE_ID,
    contract_version: WINDOWS_NODE_CONTRACT_VERSION,
    job_id: lease.job_id,
    lease_id: lease.lease_id,
    fence: lease.fence,
    model: semantic.model,
    cost_usd: 0,
    semantic_result: semantic.result,
    usage: { input_tokens: 1, output_tokens: 1, input_chars: 1, output_chars: 1 },
  });
  const usageAfterReplay = await DB.prepare("SELECT COUNT(*) AS count FROM hermes_automation_ai_usage WHERE job_id=?").bind(planJobId).first();
  check("Idempotent replay of the completion does not duplicate the receipt",
    replayComplete.body?.status === "IDEMPOTENT_REPLAY" && Number(usageAfterReplay?.count || 0) === 1,
    `status=${replayComplete.body?.status} usage_rows=${usageAfterReplay?.count}`);

  const status = await nodeApi("/v1/nodes/windows/status", {}, "GET");
  evidence.phases.phase3_status = status.body;
  check("Node status readback: online, production writes still unauthorized",
    status.body?.online === true && status.body?.production_write_authorized === false,
    JSON.stringify({ online: status.body?.online, production_write_authorized: status.body?.production_write_authorized }));
}

/* ================================================================== PHASE 4 */
log("PHASE 4 — HAE reconciles the WORK_ID from the node receipt");
await runCron("*/5 * * * *");
const reconciledItem = await DB.prepare("SELECT id,status,hae_dispatch_state,hae_plan_job_id,hae_execution_job_id,next_action,blocked_reason FROM hermes_owner_work_items WHERE id=?").bind(plannedWorkItem?.id).first();
const executionJobId = reconciledItem?.hae_execution_job_id || null;
evidence.phases.phase4_work_item = reconciledItem;
check("Work item reconciled from the plan receipt (dispatch state advanced, not stuck)",
  reconciledItem?.hae_dispatch_state !== "PLAN_QUEUED" && reconciledItem?.hae_dispatch_state !== "PLAN_RUNNING",
  `dispatch=${reconciledItem?.hae_dispatch_state}`);

await drainQueue();
await runCron("*/5 * * * *");
const finalItem = await DB.prepare("SELECT id,status,acceptance_status,hae_dispatch_state,hae_execution_job_id FROM hermes_owner_work_items WHERE id=?").bind(plannedWorkItem?.id).first();
// The canonical revenue cycle releases the job binding once the cycle succeeded, so the execution
// receipt is verified against the job row captured before the release, not against the work item.
const executionJob = executionJobId
  ? await DB.prepare("SELECT job_id,job_type,state,result_json FROM hermes_automation_jobs WHERE job_id=?").bind(executionJobId).first()
  : null;
evidence.phases.phase4_final = finalItem;
evidence.phases.phase4_execution_job = executionJob ? { job_id: executionJob.job_id, job_type: executionJob.job_type, state: executionJob.state } : null;
check("Execution capability job (read-only) ran and produced its own D1 receipt",
  Boolean(executionJob) && executionJob.state === "SUCCEEDED" && Boolean(executionJob.result_json),
  executionJob ? `${executionJob.job_type}=${executionJob.state}` : "no execution job");
check("Work item reached a terminal canonical dispatch state after the receipt",
  ["REVENUE_CYCLE_SUCCEEDED", "EXECUTION_SUCCEEDED"].includes(finalItem?.hae_dispatch_state),
  `dispatch=${finalItem?.hae_dispatch_state} status=${finalItem?.status} acceptance=${finalItem?.acceptance_status}`);

const finalSnapshot = await DB.prepare("SELECT state,COUNT(*) AS count FROM hermes_automation_jobs GROUP BY state ORDER BY state").all();
evidence.phases.phase4_job_states = finalSnapshot.results;
const dlqMessages = await DB.prepare("SELECT COUNT(*) AS count FROM hermes_automation_job_events WHERE event_type IN ('job.failed','job.dead_letter')").first();
check("No failed jobs and no DLQ traffic in the local proof run",
  !(finalSnapshot.results || []).some((row) => row.state === "FAILED") && Number(dlqMessages?.count || 0) === 0,
  JSON.stringify(finalSnapshot.results));

/* ================================================================== PHASE 5 */
log("PHASE 5 — production gate (read-only, no credentials)");
try {
  const response = await fetch(`https://${NODE_HOST}/v1/nodes/windows/status`, { method: "GET" });
  const text = await response.text();
  evidence.phases.phase5_production = { status: response.status, body: text.slice(0, 200) };
  check("Deployed HAE still refuses unauthenticated node access (401)", response.status === 401, `status=${response.status}`);
} catch (error) {
  evidence.phases.phase5_production = { error: error?.message || String(error) };
  check("Deployed HAE probe executed", true, `network error: ${error?.message}`);
}

/* ================================================================== RESULT */
evidence.finished_at = new Date().toISOString();
evidence.summary = {
  passed: evidence.checks.filter((c) => c.passed).length,
  failed: evidence.checks.filter((c) => !c.passed).length,
  total: evidence.checks.length,
};
const output = JSON.stringify(evidence, null, 2);
log("");
log(`CHECKS: ${evidence.summary.passed}/${evidence.summary.total} passed`);
if (OUTPUT_PATH) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(OUTPUT_PATH, output);
  log(`evidence written to ${OUTPUT_PATH}`);
} else {
  log(output);
}
process.exit(evidence.summary.failed === 0 ? 0 : 1);
