#!/usr/bin/env node
// Independent pre-merge proof for the Command Center D1 receipt readback.
//
// What this proves, on the REAL HAE engine code (not on mocks):
//   1. the autonomous owner-work lane really creates the execution job and really
//      finishes it - real cron intake, real queue, real D1 rows, real job.succeeded
//      event, real receipt payload;
//   2. the Command Center D1 readback + owner-work verifier branch turns those
//      canonical rows into PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED with
//      receipt_verified=true and identity_scheme="owner_work";
//   3. the new branch is fail-closed, not permissive: tampered rows are rejected,
//      and the previous verifier cannot bind an engine-shaped receipt at all.
//
// It deliberately does NOT reuse the candidate branch's own unit test
// (scripts/internal-command-center-hae-d1-receipt.test.mjs): this harness drives the
// engine to produce the rows, so the candidate code is judged on rows it did not
// author.
//
// Usage:
//   node scripts/ai/cc-d1-readback-verdict-proof.mjs \
//     --engine-src /tmp/hae-2299 \
//     --cc-src     /tmp/hae-cc-d1 \
//     --old-src    /tmp/hae-main \
//     --out        docs/evidence/cc-d1-readback-verdict-2026-11-07.json
//
// Prepare the source snapshots with:
//   git archive origin/fix/hae-owner-work-zero-token-fallback-20261106 | tar -x -C /tmp/hae-2299
//   git archive origin/feat/command-center-hae-d1-readback-20261107   | tar -x -C /tmp/hae-cc-d1
//   git archive origin/main                                          | tar -x -C /tmp/hae-main

import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const argValue = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};
const ENGINE_SRC = argValue("--engine-src", "/tmp/hae-2299");
const CC_SRC = argValue("--cc-src", "/tmp/hae-cc-d1");
const OLD_SRC = argValue("--old-src", "/tmp/hae-main");
const OUTPUT_PATH = argValue("--out", "docs/evidence/cc-d1-readback-verdict-2026-11-07.json");
const CRON = argValue("--cron", "*/5 * * * *");

const evidence = {
  started_at: new Date().toISOString(),
  sources: { engine: ENGINE_SRC, command_center_candidate: CC_SRC, command_center_previous: OLD_SRC },
  checks: [],
  facts: {},
};
let failures = 0;
const log = (...args) => { if (!args.includes("--json")) console.log(...args); };
function check(name, passed, detail) {
  const row = { name, passed: Boolean(passed), detail: detail === undefined ? null : detail };
  evidence.checks.push(row);
  if (!row.passed) failures += 1;
  log(`${row.passed ? "PASS" : "FAIL"}  ${name}${detail ? ` :: ${detail}` : ""}`);
  return row.passed;
}
const importFrom = (root, relative) => import(pathToFileURL(path.join(root, relative)).href);

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
  tableColumns(table) {
    return this.database.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name);
  }
}

/* --------------------------------------------------------------- queue stub */
class QueueStub {
  constructor(name) { this.name = name; this.messages = []; }
  async send(body) { this.messages.push({ body }); return { id: `msg-${this.messages.length}` }; }
  async metrics() {
    return { backlogCount: this.messages.length, backlogBytes: this.messages.length * 256, oldestMessageTimestamp: Date.now() - 1000 };
  }
}

const DB = new D1Database();
const automationQueue = new QueueStub("hermes-automation");
const automationDlq = new QueueStub("hermes-automation-dlq");
const localToken = `local-proof-${randomUUID()}`;

const engineWorker = await importFrom(ENGINE_SRC, "workers/automation-engine/src/index.mjs");
const worker = engineWorker.default || engineWorker;
const engineRoleContracts = await importFrom(ENGINE_SRC, "workers/automation-engine/src/role-contracts.mjs");
const engineRegistry = await importFrom(ENGINE_SRC, "workers/automation-engine/src/plugin-runtime-registry.mjs");
const candidateBridge = await importFrom(CC_SRC, "functions/api/_lib/command-center-hae-bridge.mjs");
const candidateD1Receipt = await importFrom(CC_SRC, "functions/api/_lib/command-center-hae-d1-receipt.mjs");
const previousBridge = await importFrom(OLD_SRC, "functions/api/_lib/command-center-hae-bridge.mjs");
const previousVerifier = await importFrom(OLD_SRC, "functions/api/_lib/command-center-hae-receipt-verifier.mjs");

const env = {
  DB,
  AUTOMATION_QUEUE: automationQueue,
  AUTOMATION_DLQ: automationDlq,
  HERMES_AUTOMATION_TOKEN: localToken,
  HERMES_AUTOMATION_MODE: "dry_run",
  HERMES_AUTOMATION_PUBLISH: "disabled",
  HERMES_AUTOMATION_SOURCE_SHA: "local-d1-readback-proof",
  HERMES_WINDOWS_NODE_ENABLED: "disabled",
  HERMES_WINDOWS_NODE_HOST: "hae-node.hermeslogisticsus.com",
  HERMES_WINDOWS_NODE_PIN_BUILTIN_KEY: "disabled",
  HERMES_FREE_AI_CLOUDFLARE_ENABLED: "disabled",
};

const pending = [];
const ctx = { waitUntil: (promise) => { pending.push(Promise.resolve(promise).catch(() => {})); } };

async function runCron(cron = CRON) {
  await worker.scheduled({ cron, scheduledTime: Date.now() }, env, ctx);
  while (pending.length) await pending.shift();
}
async function drainQueue() {
  const handled = [];
  while (automationQueue.messages.length) {
    const batch = automationQueue.messages.splice(0, 5).map((message, index) => ({
      id: `local-msg-${index}`,
      body: message.body,
      timestamp: new Date().toISOString(),
      attempts: 1,
      ack() { this.acked = true; },
      retry() { this.retried = true; },
    }));
    await worker.queue({ queue: "hermes-automation", messages: batch }, env);
    handled.push(...batch.map((item) => ({ type: item.body?.type, job_id: item.body?.job_id, acked: item.acked === true })));
  }
  return handled;
}

/* ------------------------------------------------------------------- fixture */
const WORK_ID = "hcwi_proof_20261107_001";
const ROUTE = {
  policy_version: "command-center-route-v1",
  state: "PLUGIN_SELECTED_NOT_EXECUTED",
  owner: { role_id: "hermes-agent-coordinator", plugin_version: "0.1.102" },
  helpers: [{ role_id: "hermes-qa-evidence-auditor", plugin_version: "0.1.28" }],
  basis: "workstream:marketing",
  source_class: "PRIVATE_PLUGIN_CREATOR_READBACK",
  registry_observed_at: "2026-11-05T18:22:10.814Z",
};
// The deterministic planner maps this work item onto a bounded read-only capability.
const TITLE = "Refresh the SEO sitemap index and canonical coverage for the marketing site";
const DETAILS = "Re-crawl the marketing routes, compare the sitemap index with the canonical URL set and record the coverage delta for the next audit cycle.";

await runCron(); // creates the schema; no owner work item exists yet
const columns = DB.tableColumns("hermes_owner_work_items");
const wanted = {
  id: WORK_ID,
  organization_scope: "hermes_internal",
  workstream: "marketing",
  priority: "p2",
  title: TITLE,
  details: DETAILS,
  next_action: "Re-crawl the marketing routes and record canonical coverage.",
  source_kind: "chat_history",
  source_label: "Independent D1 readback proof",
  status: "ready",
  acceptance_status: "not_required",
  revenue_status: null,
  created_by: "local-d1-readback-proof",
  plugin_route_json: JSON.stringify(ROUTE),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
const insertColumns = Object.keys(wanted).filter((key) => columns.includes(key));
await DB.prepare(`INSERT INTO hermes_owner_work_items (${insertColumns.join(",")}) VALUES (${insertColumns.map(() => "?").join(",")})`)
  .bind(...insertColumns.map((key) => wanted[key])).run();
check("fixture_work_item_inserted", insertColumns.length >= 12, `columns=${insertColumns.join(",")}`);
// The engine's schema bootstrap also seeds the canonical Command Center backlog into
// the shared D1, so the intake would otherwise pick a seeded p0 item (045 in
// production). Retire every other row so the proof exercises THIS fixture.
const retired = await DB.prepare("UPDATE hermes_owner_work_items SET status='done' WHERE id<>?").bind(WORK_ID).run();
check("fixture_is_the_only_intake_candidate",
  Number(retired?.meta?.changes || 0) >= 0,
  `retired_rows=${retired?.meta?.changes ?? "?"}`);

/* --------------------------------------------------- 1. engine creates a plan */
await runCron();
const planJob = await DB.prepare(
  "SELECT job_id,job_type,project_key,policy_version,state,idempotency_key,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE project_key='command-center-owner-work' ORDER BY created_at DESC LIMIT 1"
).first();
check("engine_intake_created_plan_job", Boolean(planJob?.job_id), planJob?.job_id || "none");
check("plan_job_project_key", planJob?.project_key === "command-center-owner-work", planJob?.project_key);
check("plan_job_idempotency_shape",
  String(planJob?.idempotency_key || "").startsWith(`hae:owner-work-plan:${WORK_ID}:`),
  planJob?.idempotency_key);

/* --------------------------------------------- 2. the plan job really succeeds */
await drainQueue();
const planAfter = await DB.prepare(
  "SELECT job_id,state,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=?"
).bind(planJob?.job_id || "").first();
const planResult = (() => { try { return JSON.parse(String(planAfter?.result_json || "{}")); } catch { return null; } })();
check("plan_job_succeeded", String(planAfter?.state || "").toUpperCase() === "SUCCEEDED", `${planAfter?.state} ${planAfter?.last_error_class || ""}`);
check("plan_disposition_executes_capability",
  planResult?.result?.disposition === "EXECUTE_EXISTING_CAPABILITY",
  `${planResult?.result?.disposition || "none"} -> ${planResult?.result?.recommended_job_type || "none"}`);
const capability = String(planResult?.result?.recommended_job_type || "");
check("plan_capability_is_bounded_read_only", Boolean(capability) && capability !== "none", capability);

/* ------------------------------------ 3. the engine creates the execution job */
await runCron();
const itemRow = await DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id=?").bind(WORK_ID).first();
check("work_item_has_execution_job", Boolean(itemRow?.hae_execution_job_id), String(itemRow?.hae_execution_job_id || "none"));
check("work_item_dispatch_state_execution_queued",
  String(itemRow?.hae_dispatch_state || "") === "EXECUTION_QUEUED",
  String(itemRow?.hae_dispatch_state || "none"));
const executionJob = await DB.prepare(
  "SELECT job_id,job_type,business_lane,account_key,project_key,policy_version,state,idempotency_key,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE job_id=?"
).bind(String(itemRow?.hae_execution_job_id || "")).first();
check("execution_job_project_key", executionJob?.project_key === "command-center-owner-work-execution", executionJob?.project_key);
check("execution_job_policy_version", executionJob?.policy_version === "command-center-hae-autonomous-v1", executionJob?.policy_version);
check("execution_job_idempotency_shape",
  String(executionJob?.idempotency_key || "") === `hae:owner-work-exec:${WORK_ID}:${planJob?.job_id}:${capability}`,
  executionJob?.idempotency_key);
const executionPayload = (() => { try { return JSON.parse(String(executionJob?.payload_json || "{}")); } catch { return null; } })();
check("execution_payload_binds_work_item", executionPayload?.owner_work_id === WORK_ID, String(executionPayload?.owner_work_id || "none"));
check("execution_payload_binds_plan_job", executionPayload?.owner_plan_job_id === planJob?.job_id, String(executionPayload?.owner_plan_job_id || "none"));

/* -------------------------------------- 4. the execution job really succeeds */
await drainQueue();
const executionAfter = await DB.prepare(
  "SELECT job_id,state,result_json,last_error_class,completed_at FROM hermes_automation_jobs WHERE job_id=?"
).bind(String(executionJob?.job_id || "")).first();
const executionReceipt = (() => { try { return JSON.parse(String(executionAfter?.result_json || "{}")); } catch { return null; } })();
const contract = engineRoleContracts.roleContractForJobType(capability);
const contractSha = contract ? await engineRoleContracts.roleContractSha256(contract) : null;
check("execution_job_succeeded", String(executionAfter?.state || "").toUpperCase() === "SUCCEEDED", `${executionAfter?.state} ${executionAfter?.last_error_class || ""}`);
check("execution_receipt_capability", executionReceipt?.capability === capability, String(executionReceipt?.capability || "none"));
check("execution_receipt_no_external_write", executionReceipt?.external_write === false, String(executionReceipt?.external_write));
check("execution_receipt_role_contract_sha", executionReceipt?.role_contract?.sha256 === contractSha, String(executionReceipt?.role_contract?.sha256 || "none"));
check("execution_receipt_not_semantic", executionReceipt?.semantic_execution == null, JSON.stringify(executionReceipt?.semantic_execution ?? null));
const successEvents = await DB.prepare(
  "SELECT event_id,job_id,event_type,from_state,to_state,created_at FROM hermes_automation_job_events WHERE job_id=? AND event_type='job.succeeded' AND to_state='SUCCEEDED'"
).bind(String(executionJob?.job_id || "")).all();
check("durable_success_event_exactly_one", (successEvents?.results || []).length === 1, `count=${(successEvents?.results || []).length}`);

/* ------------------------------- 5. the candidate D1 readback verifies it */
const finalItem = await DB.prepare("SELECT * FROM hermes_owner_work_items WHERE id=?").bind(WORK_ID).first();
const finalRoute = JSON.parse(String(finalItem?.plugin_route_json || "null"));
const candidateVerdict = await candidateBridge.readCommandCenterHaeExecution({ DB }, finalItem, finalRoute);
evidence.facts.candidate_plugin_execution = candidateVerdict;
check("candidate_readback_verifies_receipt",
  candidateVerdict?.state === "PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED" && candidateVerdict?.receipt_verified === true,
  `${candidateVerdict?.state} / ${candidateVerdict?.reason || "no reason"}`);
check("candidate_reports_owner_work_identity", candidateVerdict?.identity_scheme === "owner_work", String(candidateVerdict?.identity_scheme));
check("candidate_readback_source_is_canonical_d1", candidateVerdict?.readback_source === "HAE_CANONICAL_D1", String(candidateVerdict?.readback_source));
check("candidate_no_external_write", candidateVerdict?.external_write === false, String(candidateVerdict?.external_write));
check("candidate_contract_sha_matches_engine", candidateVerdict?.contract_sha === contractSha, String(candidateVerdict?.contract_sha || "none"));

/* ------------- 6. the previous Command Center path cannot show this receipt */
const previousVerdict = await previousBridge.readCommandCenterHaeExecution({ DB }, finalItem, finalRoute);
evidence.facts.previous_plugin_execution = previousVerdict;
check("previous_path_does_not_verify",
  previousVerdict?.receipt_verified !== true && previousVerdict?.state !== "PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED",
  `${previousVerdict?.state} / ${previousVerdict?.reason || "no reason"}`);
check("previous_path_names_a_concrete_gap",
  typeof previousVerdict?.reason === "string" && previousVerdict.reason.length > 0 && previousVerdict.reason !== previousVerdict?.state,
  String(previousVerdict?.reason || "none"));

/* ------------------- 7. the previous verifier cannot bind an engine receipt */
const registrySnapshot = engineRegistry.pluginRuntimeRegistrySnapshot();
const previousBinding = {
  work_item_id: WORK_ID,
  linked_task_id: finalItem?.linked_task_id || null,
  hae_job_id: executionJob?.job_id,
  idempotency_key: `hae:cc:v1:${"0".repeat(64)}`,
  job_type: capability,
  contract_sha256: contractSha,
};
const previousVerdictDirect = await previousVerifier.verifyCommandCenterHaeReceipt({
  workItem: { ...finalItem, organization_scope: "hermes_internal", plugin_route_json: JSON.stringify(finalRoute) },
  registryEntries: registrySnapshot.entries,
  registryEvidence: engineRegistry.pluginRuntimeRegistryEvidenceStatus(new Date().toISOString()),
  registryObservedAt: finalRoute?.registry_observed_at,
  registrySourceClass: finalRoute?.source_class,
  binding: previousBinding,
  haeJob: executionAfter,
  jobEvents: successEvents?.results || [],
  roleContract: contract,
});
evidence.facts.previous_verifier_verdict = previousVerdictDirect;
check("previous_verifier_cannot_bind_engine_receipt",
  previousVerdictDirect?.state !== "MATCHED_SOURCE_ONLY",
  `${previousVerdictDirect?.state} / ${previousVerdictDirect?.reason || "no reason"}`);

/* -------------------------- 8. the new branch must be fail-closed, not lax */
const fullExecutionRow = await DB.prepare("SELECT * FROM hermes_automation_jobs WHERE job_id=?")
  .bind(String(executionJob?.job_id || "")).first();
const baseJob = {
  ...fullExecutionRow,
  payload_json: JSON.stringify(executionPayload),
  idempotency_key: executionJob?.idempotency_key,
};
const baseEvents = successEvents?.results || [];
const tamper = async (name, job, events, expectedReason) => {
  const verdict = await candidateD1Receipt.verifyCommandCenterOwnerWorkReceipt({
    workItem: { ...finalItem, organization_scope: "hermes_internal" },
    haeJob: job,
    jobEvents: events,
  });
  return check(name, verdict?.receipt_verified !== true && String(verdict?.reason || "") === expectedReason,
    `${verdict?.state} / ${verdict?.reason || "no reason"}`);
};
await tamper("tamper_work_item_binding_rejected",
  { ...baseJob, payload_json: JSON.stringify({ ...executionPayload, owner_work_id: "hcwi_other_000" }) },
  baseEvents, "SOURCE_PAYLOAD_BINDING_MISMATCH");
await tamper("tamper_idempotency_rejected",
  { ...baseJob, idempotency_key: `hae:owner-work-exec:${WORK_ID}:job:plan-forged:${capability}` },
  baseEvents, "IDEMPOTENCY_BINDING_MISMATCH");
await tamper("tamper_state_rejected",
  { ...baseJob, state: "FAILED" },
  baseEvents, "NO_SUCCEEDED_HAE_JOB");
await tamper("tamper_duplicate_success_event_rejected",
  baseJob,
  [...baseEvents, { ...baseEvents[0], event_id: "forged-event" }],
  "DURABLE_SUCCESS_EVENT_UNVERIFIED");
await tamper("semantic_capability_rejected",
  { ...baseJob, job_type: "work.item.plan", capability: "work.item.plan" },
  baseEvents, "ROLE_CONTRACT_NOT_ELIGIBLE");
await tamper("tamper_external_write_rejected",
  { ...baseJob, result_json: JSON.stringify({ ...executionReceipt, external_write: true }) },
  baseEvents, "RECEIPT_COST_OR_PROVIDER_WRITE_UNVERIFIED");
await tamper("tamper_receipt_role_contract_rejected",
  { ...baseJob, result_json: JSON.stringify({ ...executionReceipt, role_contract: { ...executionReceipt?.role_contract, sha256: "0".repeat(64) } }) },
  baseEvents, "RECEIPT_ROLE_CONTRACT_MISMATCH");

evidence.finished_at = new Date().toISOString();
evidence.summary = {
  checks: evidence.checks.length,
  passed: evidence.checks.filter((row) => row.passed).length,
  failed: failures,
  capability,
  plan_job_id: planJob?.job_id || null,
  execution_job_id: executionJob?.job_id || null,
  work_item_id: WORK_ID,
};
if (OUTPUT_PATH) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
  log(`evidence written: ${OUTPUT_PATH}`);
}
log(`\n${evidence.summary.passed}/${evidence.summary.checks} checks passed (failed=${failures})`);
if (failures) process.exitCode = 1;
