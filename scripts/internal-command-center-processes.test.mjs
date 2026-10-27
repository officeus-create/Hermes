import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureInternalAiSchema } from "../functions/api/_lib/internal-ai.mjs";
import { onRequestGet as listProcesses, onRequestPost as createProcess } from "../functions/api/internal-command-center/processes.ts";
import { onRequestPatch as mutateProcess } from "../functions/api/internal-command-center/processes/[id].ts";

class Statement {
  constructor(statement, args = []) { this.statement = statement; this.args = args; }
  bind(...args) { return new Statement(this.statement, args); }
  async run() { const result = this.statement.run(...this.args); return { meta: { changes: Number(result.changes || 0) } }; }
  async first() { return this.statement.get(...this.args) || null; }
  async all() { return { results: this.statement.all(...this.args) }; }
}

const sqlite = new DatabaseSync(":memory:");
const DB = {
  prepare: (sql) => new Statement(sqlite.prepare(sql)),
  batch: async (statements) => {
    sqlite.exec("BEGIN");
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  },
};

sqlite.exec("CREATE TABLE sessions (token TEXT, specialist_id TEXT, expires_at TEXT); CREATE TABLE specialists (id TEXT, email TEXT, name TEXT, role TEXT, location TEXT, bio TEXT);");
const future = new Date(Date.now() + 3600000).toISOString();
sqlite.prepare("INSERT INTO specialists VALUES (?,?,?,?,?,?)").run("owner", "owner@example.invalid", "Owner", "Owner", "", "");
sqlite.prepare("INSERT INTO sessions VALUES (?,?,?)").run("session-owner", "owner", future);
await ensureInternalAiSchema(DB);
const now = new Date().toISOString();
sqlite.prepare("INSERT INTO hermes_internal_owner_access (specialist_id,active,capability,created_at,updated_at) VALUES (?,?,?,?,?)")
  .run("owner", 1, "HERMES_INTERNAL_OWNER", now, now);

const request = (path, method = "GET", body = null) => new Request(`https://example.test${path}`, {
  method,
  headers: {
    Cookie: "hermes_session=session-owner",
    Origin: "https://example.test",
    "Sec-Fetch-Site": "same-origin",
    ...(body ? { "Content-Type": "application/json" } : {}),
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
const payload = async (response) => ({ status: response.status, body: await response.json() });

let result = await payload(await listProcesses({ request: request("/api/internal-command-center/processes"), env: { DB } }));
assert.equal(result.status, 200);
assert.equal(result.body.processes.length, 0);
assert.equal(result.body.normal_loop_requires_chat, false);
assert.equal(result.body.automatic_paid_ai_cost_usd, 0);

result = await payload(await createProcess({
  request: request("/api/internal-command-center/processes", "POST", {
    name: "Gateway readiness",
    job_type: "ai.gateway.readiness.audit",
    cadence_hours: 6,
  }),
  env: { DB },
}));
assert.equal(result.status, 201);
assert.equal(result.body.process.status, "paused");
assert.equal(result.body.process.max_cost_usd, 0);
const processId = result.body.process.id;

result = await payload(await createProcess({
  request: request("/api/internal-command-center/processes", "POST", {
    job_type: "ai.gateway.readiness.audit",
    cadence_hours: 6,
  }),
  env: { DB },
}));
assert.equal(result.status, 409);
assert.equal(result.body.error, "process_job_type_already_configured");

result = await payload(await createProcess({
  request: request("/api/internal-command-center/processes", "POST", {
    job_type: "search.snapshot.evaluate",
    cadence_hours: 1,
  }),
  env: { DB },
}));
assert.equal(result.status, 400);
assert.equal(result.body.error, "process_cadence_not_allowed");

result = await payload(await mutateProcess({
  request: request(`/api/internal-command-center/processes/${processId}`, "PATCH", { action: "activate" }),
  env: { DB },
  params: { id: processId },
}));
assert.equal(result.status, 200);
assert.equal(result.body.process.status, "active");
assert.ok(result.body.process.next_run_at);

result = await payload(await mutateProcess({
  request: request(`/api/internal-command-center/processes/${processId}`, "PATCH", { action: "run_next_tick" }),
  env: { DB },
  params: { id: processId },
}));
assert.equal(result.status, 200);
assert.equal(result.body.process.status, "active");

result = await payload(await mutateProcess({
  request: request(`/api/internal-command-center/processes/${processId}`, "PATCH", { action: "pause" }),
  env: { DB },
  params: { id: processId },
}));
assert.equal(result.status, 200);
assert.equal(result.body.process.status, "paused");

const events = sqlite.prepare("SELECT event_type,actor_specialist_id FROM hermes_automation_process_events WHERE process_id=? ORDER BY created_at,event_type").all(processId);
assert.deepEqual(new Set(events.map((event) => event.event_type)), new Set([
  "process.created",
  "process.activated",
  "process.run_requested",
  "process.paused",
]));
assert(events.every((event) => event.actor_specialist_id === "owner"));

const anonymous = await listProcesses({ request: new Request("https://example.test/api/internal-command-center/processes"), env: { DB } });
assert.equal(anonymous.status, 401);
sqlite.close();
console.log("Hermes Command Center autonomous process controls: owner-gated create/activate/pause + audit PASS");
