import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureInternalAiSchema } from "../functions/api/_lib/internal-ai.mjs";
import { onRequestGet as listProcesses, onRequestPost as createProcess } from "../functions/api/internal-command-center/processes.ts";
import { onRequestPatch as mutateProcess } from "../functions/api/internal-command-center/processes/[id].ts";
import { publicHaeAuditSummary, haeAuditAttentionRequired } from "../src/lib/hae-process-control.mjs";

class Statement {
  constructor(statement, args = []) { this.statement = statement; this.args = args; }
  bind(...args) { return new Statement(this.statement, args); }
  async run() { const result = this.statement.run(...this.args); return { meta: { changes: Number(result.changes || 0) } }; }
  async first() { return this.statement.get(...this.args) || null; }
  async all() { return { results: this.statement.all(...this.args) }; }
}

const sqlite = new DatabaseSync(":memory:");
let beforeBatchHook = null;
const DB = {
  prepare: (sql) => new Statement(sqlite.prepare(sql)),
  batch: async (statements) => {
    if (beforeBatchHook) {
      const hook = beforeBatchHook;
      beforeBatchHook = null;
      hook();
    }
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
assert.deepEqual(result.body.system_processes, []);
assert.equal(result.body.attention_required_count, 0);

sqlite.exec(`CREATE TABLE hermes_automation_jobs (
  job_id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  business_lane TEXT NOT NULL,
  project_key TEXT,
  state TEXT NOT NULL,
  result_json TEXT,
  last_error_class TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
)`);
const systemReceipt = JSON.stringify({
  capability: "website.route.audit",
  observed_at: now,
  role_contract: { role_id: "hermes-website-auditor", plugin_version: "0.1.1" },
  result: {
    http_error_count: 1,
    canonical_defect_count: 0,
    redirect_drift_count: 0,
    http_error_urls: ["PRIVATE_RAW_SHOULD_NOT_LEAK"],
  },
});
sqlite.prepare("INSERT INTO hermes_automation_jobs VALUES (?,?,?,?,?,?,?,?,?)").run(
  "job-system-website",
  "website.route.audit",
  "website",
  "hae-plugin-role-runtime",
  "SUCCEEDED",
  systemReceipt,
  null,
  now,
  now,
);
result = await payload(await listProcesses({ request: request("/api/internal-command-center/processes"), env: { DB } }));
assert.equal(result.status, 200);
assert.equal(result.body.system_processes.length, 1);
assert.equal(result.body.system_processes[0].managed_by, "system");
assert.equal(result.body.system_processes[0].attention_required, true);
assert.equal(result.body.system_processes[0].audit_summary.http_error_count, 1);
assert.equal(result.body.attention_required_count, 1);
assert.doesNotMatch(JSON.stringify(result.body), /PRIVATE_RAW_SHOULD_NOT_LEAK/);

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
sqlite.prepare("INSERT INTO hermes_automation_jobs VALUES (?,?,?,?,?,?,?,?,?)").run(
  "job-owner-gap",
  "ai.gateway.readiness.audit",
  "automation",
  "hae-process:" + processId,
  "SUCCEEDED",
  JSON.stringify({
    capability: "ai.gateway.readiness.audit",
    observed_at: now,
    result: { source_status: "ACCESS_GAP", coverage_complete: false, access_gap: true },
  }),
  null,
  now,
  now,
);
sqlite.prepare("UPDATE hermes_automation_processes SET last_job_id=? WHERE process_id=?").run("job-owner-gap", processId);
result = await payload(await listProcesses({ request: request("/api/internal-command-center/processes"), env: { DB } }));
assert.equal(result.body.processes[0].attention_required, true);
assert.equal(result.body.processes[0].audit_summary.source_status, "ACCESS_GAP");
assert.equal(result.body.attention_required_count, 2);

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

// Race regression 1: a Worker claims a lease after the owner pre-read but before DB.batch.
// The owner pause must fail and preserve the newly claimed lease/status.
result = await payload(await mutateProcess({
  request: request(`/api/internal-command-center/processes/${processId}`, "PATCH", { action: "activate" }),
  env: { DB },
  params: { id: processId },
}));
assert.equal(result.status, 200);
const liveLease = new Date(Date.now() + 120000).toISOString();
const pausedEventsBeforeRace = Number(sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_automation_process_events WHERE process_id=? AND event_type='process.paused'").get(processId).n);
beforeBatchHook = () => sqlite.prepare("UPDATE hermes_automation_processes SET lease_until=? WHERE process_id=?").run(liveLease, processId);
result = await payload(await mutateProcess({
  request: request(`/api/internal-command-center/processes/${processId}`, "PATCH", { action: "pause" }),
  env: { DB },
  params: { id: processId },
}));
assert.equal(result.status, 409);
assert.equal(result.body.error, "process_state_conflict");
let raceRow = sqlite.prepare("SELECT status,lease_until FROM hermes_automation_processes WHERE process_id=?").get(processId);
assert.equal(raceRow.status, "active");
assert.equal(raceRow.lease_until, liveLease);
assert.equal(Number(sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_automation_process_events WHERE process_id=? AND event_type='process.paused'").get(processId).n), pausedEventsBeforeRace);

// Race regression 2: status changes after the run_next_tick pre-read.
// Rejected mutation must not emit a phantom process.run_requested event.
sqlite.prepare("UPDATE hermes_automation_processes SET lease_until=NULL,status='active' WHERE process_id=?").run(processId);
const runEventsBeforeRace = Number(sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_automation_process_events WHERE process_id=? AND event_type='process.run_requested'").get(processId).n);
beforeBatchHook = () => sqlite.prepare("UPDATE hermes_automation_processes SET status='paused' WHERE process_id=?").run(processId);
result = await payload(await mutateProcess({
  request: request(`/api/internal-command-center/processes/${processId}`, "PATCH", { action: "run_next_tick" }),
  env: { DB },
  params: { id: processId },
}));
assert.equal(result.status, 409);
assert.equal(result.body.error, "process_state_conflict");
assert.equal(Number(sqlite.prepare("SELECT COUNT(*) AS n FROM hermes_automation_process_events WHERE process_id=? AND event_type='process.run_requested'").get(processId).n), runEventsBeforeRace);

const events = sqlite.prepare("SELECT event_type,actor_specialist_id FROM hermes_automation_process_events WHERE process_id=? ORDER BY created_at,event_type").all(processId);
assert.deepEqual(new Set(events.map((event) => event.event_type)), new Set([
  "process.created",
  "process.activated",
  "process.run_requested",
  "process.paused",
]));
assert(events.every((event) => event.actor_specialist_id === "owner"));

const blockedSummary = publicHaeAuditSummary(JSON.stringify({
  capability: "hae.self.improvement.audit",
  result: { blocked_finding_count: 1, routing_blocked_reason: "FINDING_BLOCKED" },
}), "hae.self.improvement.audit");
assert.equal(blockedSummary.blocked_finding_count, 1);
assert.equal(blockedSummary.routing_blocked_reason, "FINDING_BLOCKED");
assert.equal(haeAuditAttentionRequired({ last_job_state: "SUCCEEDED" }, blockedSummary), true);

const anonymous = await listProcesses({ request: new Request("https://example.test/api/internal-command-center/processes"), env: { DB } });
assert.equal(anonymous.status, 401);
sqlite.close();
console.log("Hermes Command Center autonomous process controls: owner-gated create/activate/pause + audit PASS");
