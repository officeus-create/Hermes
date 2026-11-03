import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  ensureInternalAiSchema,
  INTERNAL_AI_MAC_RUNNER_ID,
  INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID,
  publicRunnerState,
} from "../functions/api/_lib/internal-ai.mjs";
import { onRequestPost as claimTask } from "../functions/api/internal-ai/runner/claim.ts";
import { onRequestPost as eventTask } from "../functions/api/internal-ai/runner/event.ts";
import { onRequestPost as completeTask } from "../functions/api/internal-ai/runner/complete.ts";

class D1Statement {
  constructor(owner, sql, statement) { this.owner = owner; this.sql = sql; this.statement = statement; this.values = []; }
  bind(...values) { this.values = values; return this; }
  async run() { const result = this.statement.run(...this.values); return { meta: { changes: Number(result.changes || 0) } }; }
  async first() { return this.statement.get(...this.values) || null; }
  async all() { return { results: this.statement.all(...this.values) }; }
}
class D1Database {
  constructor() { this.database = new DatabaseSync(":memory:"); }
  prepare(sql) { return new D1Statement(this, sql, this.database.prepare(sql)); }
}

const DB = new D1Database();
const MAC_TOKEN = "synthetic-mac-runner-token-with-more-than-32-characters";
const WINDOWS_TOKEN = "synthetic-windows-runner-token-with-more-than-32-characters";
const env = {
  DB,
  HERMES_INTERNAL_AI_RUNNER_TOKEN: MAC_TOKEN,
  HERMES_INTERNAL_AI_WINDOWS_RUNNER_TOKEN: WINDOWS_TOKEN,
};
const post = (path, payload, token = MAC_TOKEN) => new Request(`https://example.test${path}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const responseJson = async (response) => ({ status: response.status, body: await response.json() });

await ensureInternalAiSchema(DB);

let result = await responseJson(await claimTask({
  request: post("/api/internal-ai/runner/claim", {
    runner_id: INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID,
    accept_tasks: false,
    runtime_version: "viktor-local-test",
    executor_type: "windows",
    display_name: "VIKTOR Windows",
    current_task: "Read-only local QA",
    phase: "ANALYZING",
    last_result: "PASS",
    blocker: "HAE adapter not released",
  }, WINDOWS_TOKEN),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.heartbeat_only, true);
assert.equal(result.body.runner_id, INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID);
assert.equal(result.body.task, null);

result = await responseJson(await claimTask({
  request: post("/api/internal-ai/runner/claim", {
    runner_id: INTERNAL_AI_MAC_RUNNER_ID,
    accept_tasks: false,
  }, WINDOWS_TOKEN),
  env,
}));
assert.equal(result.status, 403);
assert.equal(result.body.error, "runner_identity_mismatch");

result = await responseJson(await claimTask({
  request: post("/api/internal-ai/runner/claim", {
    runner_id: INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID,
    accept_tasks: false,
  }, MAC_TOKEN),
  env,
}));
assert.equal(result.status, 403);
assert.equal(result.body.error, "runner_identity_mismatch");

let windowsState = await DB.prepare("SELECT * FROM hermes_internal_ai_runner_state WHERE id = ?").bind(INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID).first();
assert.ok(windowsState);
assert.equal(windowsState.accept_tasks, 0);
assert.equal(windowsState.executor_type, "windows");
assert.equal(windowsState.display_name, "VIKTOR Windows");
assert.equal(publicRunnerState(windowsState).online, true);

result = await responseJson(await claimTask({
  request: post("/api/internal-ai/runner/claim", {
    runner_id: "internal-ai-untrusted-runner",
    accept_tasks: false,
  }, WINDOWS_TOKEN),
  env,
}));
assert.equal(result.status, 400);
assert.equal(result.body.error, "invalid_runner_id");

const now = "2026-11-02T00:00:00.000Z";
await DB.prepare(`INSERT INTO hermes_internal_ai_tasks
  (id, organization_scope, agent_role, prompt, status, created_by, created_at, updated_at)
  VALUES ('hcai_multi_runner', 'hermes_internal', 'software_engineer', 'Repository-only test task', 'queued', 'owner-1', ?, ?)`)
  .bind(now, now).run();

result = await responseJson(await claimTask({
  request: post("/api/internal-ai/runner/claim", {
    runner_id: INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID,
    accept_tasks: true,
    runtime_version: "viktor-local-test",
  }, WINDOWS_TOKEN),
  env,
}));
assert.equal(result.status, 409);
assert.equal(result.body.error, "windows_viktor_task_claim_not_enabled");
let queued = await DB.prepare("SELECT status, runner_id FROM hermes_internal_ai_tasks WHERE id = 'hcai_multi_runner'").first();
assert.equal(queued.status, "queued");
assert.equal(queued.runner_id, null);

result = await responseJson(await claimTask({
  request: post("/api/internal-ai/runner/claim", {
    repo_sha: "abc123",
    runtime_version: "synthetic-mac",
  }),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.task.status, "running");
assert.equal(result.body.task.runner_id, INTERNAL_AI_MAC_RUNNER_ID);

result = await responseJson(await eventTask({
  request: post("/api/internal-ai/runner/event", {
    runner_id: INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID,
    task_id: "hcai_multi_runner",
    event_type: "output",
    message: "Windows must not write events for a Mac-owned task.",
  }, WINDOWS_TOKEN),
  env,
}));
assert.equal(result.status, 409);
assert.equal(result.body.error, "task_not_running_for_runner");

result = await responseJson(await completeTask({
  request: post("/api/internal-ai/runner/complete", {
    runner_id: INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID,
    task_id: "hcai_multi_runner",
    status: "completed",
    branch: "internal-ai/hcai_multi_runner",
    output_summary: "Unauthorized cross-runner completion.",
  }, WINDOWS_TOKEN),
  env,
}));
assert.equal(result.status, 409);
assert.equal(result.body.error, "task_owned_by_another_runner");

result = await responseJson(await completeTask({
  request: post("/api/internal-ai/runner/complete", {
    runner_id: INTERNAL_AI_MAC_RUNNER_ID,
    task_id: "hcai_multi_runner",
    status: "completed",
    branch: "internal-ai/hcai_multi_runner",
    output_summary: "Authorized synthetic Mac completion.",
  }),
  env,
}));
assert.equal(result.status, 200);
assert.equal(result.body.task.status, "completed");
assert.equal(result.body.task.runner_id, INTERNAL_AI_MAC_RUNNER_ID);

console.log("Hermes Internal AI multi-runner visibility: PASS");
