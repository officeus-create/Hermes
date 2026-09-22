import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { decideInternalAiTask, ensureInternalAiSchema, publicTask } from "../functions/api/_lib/internal-ai.mjs";
import { onRequestPost as claimTask } from "../functions/api/internal-ai/runner/claim.ts";
import { onRequestPost as completeTask } from "../functions/api/internal-ai/runner/complete.ts";

class D1Statement {
  constructor(owner, sql, statement) {
    this.owner = owner;
    this.sql = sql;
    this.statement = statement;
    this.values = [];
  }
  bind(...values) {
    this.values = values;
    return this;
  }
  async run() {
    const result = this.statement.run(...this.values);
    return { meta: { changes: Number(result.changes || 0) } };
  }
  async first() {
    const result = this.statement.get(...this.values) || null;
    if (this.owner.afterFirst) await this.owner.afterFirst({ sql: this.sql, values: this.values, result });
    return result;
  }
  async all() {
    return { results: this.statement.all(...this.values) };
  }
}

class D1Database {
  constructor() {
    this.database = new DatabaseSync(":memory:");
    this.afterFirst = null;
  }
  prepare(sql) {
    return new D1Statement(this, sql, this.database.prepare(sql));
  }
}

const DB = new D1Database();
const TOKEN = "synthetic-runner-token-with-more-than-32-characters";
const env = { DB, HERMES_INTERNAL_AI_RUNNER_TOKEN: TOKEN };
const runnerRequest = (path, payload) => new Request(`https://example.test${path}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const responseJson = async (response) => ({ status: response.status, body: await response.json() });
const row = (id) => DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = 'hermes_internal'").bind(id).first();
const insertTask = async ({ id, status, gate = null, grantedAt = null, runnerId = null }) => {
  await DB.prepare(`INSERT INTO hermes_internal_ai_tasks
    (id, organization_scope, agent_role, prompt, status, created_by, created_at, updated_at, approval_gate, approval_granted_at, runner_id)
    VALUES (?, 'hermes_internal', 'software_engineer', ?, ?, 'owner-1', ?, ?, ?, ?, ?)`)
    .bind(id, `Repository-only task ${id}`, status, "2026-09-22T00:00:00.000Z", "2026-09-22T00:00:00.000Z", gate, grantedAt, runnerId).run();
};

await ensureInternalAiSchema(DB);
await insertTask({ id: "hcai_approval", status: "running", runnerId: "internal-ai-mac-runner" });

let result = await responseJson(await completeTask({
  request: runnerRequest("/api/internal-ai/runner/complete", { task_id: "hcai_approval", status: "needs_approval" }),
  env,
}));
assert.equal(result.status, 400);
assert.equal(result.body.error, "approval_gate_required");
assert.equal((await row("hcai_approval")).status, "running", "missing gate must leave the task fail-closed in running reconciliation");

result = await responseJson(await completeTask({
  request: runnerRequest("/api/internal-ai/runner/complete", {
    task_id: "hcai_approval",
    status: "needs_approval",
    approval_gate: "merge_deploy",
    branch: "internal-ai/hcai_approval",
    output_summary: "Prepared repository evidence and stopped before merge.",
  }),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.task.status, "needs_approval");
assert.equal(result.body.task.approval_state, "awaiting_approval");
assert.equal(result.body.task.approval_gate, "merge_deploy");

const reloaded = publicTask(await row("hcai_approval"));
assert.equal(reloaded.approval_state, "awaiting_approval", "approval gate must survive a fresh database read");
assert.equal(reloaded.approval_granted_at, null);

result = await responseJson(await claimTask({
  request: runnerRequest("/api/internal-ai/runner/claim", { repo_sha: "abc123", runtime_version: "synthetic" }),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.task, null, "a task awaiting approval must never be claimable");

let decision = await decideInternalAiTask(DB, {
  taskId: "hcai_approval",
  action: "approve",
  requestedGate: "billing_permissions",
  ownerId: "owner-1",
  now: "2026-09-22T00:01:00.000Z",
});
assert.equal(decision.status, 409);
assert.equal(decision.body.error, "approval_gate_mismatch");
assert.equal((await row("hcai_approval")).status, "needs_approval");

decision = await decideInternalAiTask(DB, {
  taskId: "hcai_approval",
  action: "approve",
  requestedGate: "merge_deploy",
  ownerId: "owner-1",
  now: "2026-09-22T00:02:00.000Z",
});
assert.equal(decision.status, 200);
assert.equal(decision.body.state, "approved");
assert.equal(decision.body.task.status, "queued");
assert.equal(decision.body.task.approval_state, "approved");
assert.equal(decision.body.task.approval_attempt, 1);

decision = await decideInternalAiTask(DB, {
  taskId: "hcai_approval",
  action: "approve",
  requestedGate: "merge_deploy",
  ownerId: "owner-1",
  now: "2026-09-22T00:03:00.000Z",
});
assert.equal(decision.status, 200);
assert.equal(decision.body.state, "already_approved");
assert.equal(decision.body.task.approval_attempt, 1, "approval replay must not enqueue or count twice");

result = await responseJson(await claimTask({
  request: runnerRequest("/api/internal-ai/runner/claim", { repo_sha: "abc123", runtime_version: "synthetic" }),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.task.status, "running");
assert.equal(result.body.task.approval_gate, "merge_deploy");
assert.equal(result.body.task.approval_state, "approved");
assert.ok(result.body.task.approval_granted_at, "runner continuation must receive the persisted approval receipt");

decision = await decideInternalAiTask(DB, {
  taskId: "hcai_approval",
  action: "approve",
  requestedGate: "merge_deploy",
  ownerId: "owner-1",
});
assert.equal(decision.body.state, "already_approved", "replay while the approved continuation is running must remain idempotent");

result = await responseJson(await completeTask({
  request: runnerRequest("/api/internal-ai/runner/complete", { task_id: "hcai_approval", status: "completed", output_summary: "Repository-only proof complete." }),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.task.status, "completed");
assert.equal(result.body.task.approval_gate, "merge_deploy", "terminal audit must preserve the gate that was approved");
assert.equal(result.body.task.approval_state, "approved");

await insertTask({ id: "hcai_cancel", status: "needs_approval", gate: "external_communication" });
decision = await decideInternalAiTask(DB, { taskId: "hcai_cancel", action: "cancel", ownerId: "owner-1" });
assert.equal(decision.status, 200);
assert.equal(decision.body.state, "cancelled");
assert.equal(decision.body.task.cancel_requested, true);
decision = await decideInternalAiTask(DB, { taskId: "hcai_cancel", action: "cancel", ownerId: "owner-1" });
assert.equal(decision.status, 200);
assert.equal(decision.body.state, "already_cancelled", "cancel replay must be idempotent");

await insertTask({ id: "hcai_cancel_claim_race", status: "queued" });
let interleavedClaim = null;
DB.afterFirst = async ({ sql, values, result: selected }) => {
  if (!sql.includes("SELECT * FROM hermes_internal_ai_tasks WHERE id = ?") || values[0] !== "hcai_cancel_claim_race" || selected?.status !== "queued") return;
  DB.afterFirst = null;
  interleavedClaim = await responseJson(await claimTask({
    request: runnerRequest("/api/internal-ai/runner/claim", { repo_sha: "race123", runtime_version: "synthetic-race" }),
    env,
  }));
};
decision = await decideInternalAiTask(DB, {
  taskId: "hcai_cancel_claim_race",
  action: "cancel",
  ownerId: "owner-1",
  now: "2026-09-22T00:04:00.000Z",
});
assert.equal(interleavedClaim?.status, 200, "runner claim must occur between the cancel read and update");
assert.equal(interleavedClaim?.body.task.status, "running");
assert.equal(decision.status, 200);
assert.equal(decision.body.state, "cancel_requested", "cancel must target the current running state after a concurrent claim");
assert.equal(decision.body.task.status, "running");
assert.equal(decision.body.task.cancel_requested, true, "success must never report a running task without its cancellation flag");

decision = await decideInternalAiTask(DB, { taskId: "hcai_cancel_claim_race", action: "cancel", ownerId: "owner-1" });
assert.equal(decision.status, 200);
assert.equal(decision.body.state, "already_cancel_requested", "running cancel replay must not create a second transition");
assert.equal(decision.body.task.cancel_requested, true);
let raceEvents = await DB.prepare("SELECT event_type, message FROM hermes_internal_ai_events WHERE task_id = ? ORDER BY id").bind("hcai_cancel_claim_race").all();
assert.deepEqual(raceEvents.results.map((event) => event.event_type), ["cancel_requested"]);

result = await responseJson(await completeTask({
  request: runnerRequest("/api/internal-ai/runner/complete", { task_id: "hcai_cancel_claim_race", status: "cancelled", output_summary: "Synthetic race task observed cancellation." }),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.task.status, "cancelled");
decision = await decideInternalAiTask(DB, { taskId: "hcai_cancel_claim_race", action: "cancel", ownerId: "owner-1" });
assert.equal(decision.status, 200);
assert.equal(decision.body.state, "already_cancelled", "terminal cancel replay must remain idempotent");
raceEvents = await DB.prepare("SELECT event_type FROM hermes_internal_ai_events WHERE task_id = ? ORDER BY id").bind("hcai_cancel_claim_race").all();
assert.deepEqual(raceEvents.results.map((event) => event.event_type), ["cancel_requested"], "cancel replay must not duplicate audit events");

await insertTask({ id: "hcai_invalid", status: "queued", gate: "merge_deploy" });
result = await responseJson(await claimTask({
  request: runnerRequest("/api/internal-ai/runner/claim", { repo_sha: "abc123", runtime_version: "synthetic" }),
  env,
}));
assert.equal(result.status, 409);
assert.equal(result.body.error, "invalid_approval_continuation", "a queued gate without a persisted owner receipt must fail closed");
assert.equal((await row("hcai_invalid")).status, "queued");

const approvalEvents = await DB.prepare("SELECT event_type, message FROM hermes_internal_ai_events WHERE task_id = ? ORDER BY id").bind("hcai_approval").all();
assert.deepEqual(approvalEvents.results.map((event) => event.event_type), ["approval_granted"]);
assert.match(approvalEvents.results[0].message, /only the merge_deploy gate/);

console.log("Hermes Internal AI approval state integration: PASS");
