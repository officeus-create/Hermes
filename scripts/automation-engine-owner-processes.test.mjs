import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import worker from "../workers/automation-engine/src/index.mjs";
import { ensureHaeProcessSchema } from "../src/lib/hae-process-control.mjs";

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
const queueWrites = [];
const env = {
  DB,
  AUTOMATION_QUEUE: { send: async (body, options = {}) => queueWrites.push({ body, options }) },
  HERMES_AUTOMATION_MODE: "dry_run",
  HERMES_AUTOMATION_PUBLISH: "disabled",
  HERMES_AUTOMATION_SOURCE_SHA: "a".repeat(40),
  HERMES_FREE_AI_CLOUDFLARE_ENABLED: "disabled",
  HERMES_FREE_AI_CLOUDFLARE_PLAN_ATTESTED: "unverified",
};

await ensureHaeProcessSchema(DB);
const scheduledAt = "2026-10-28T12:00:00.000Z";
sqlite.prepare(`INSERT INTO hermes_automation_processes
  (process_id,organization_scope,name,job_type,business_lane,workstream,role_id,cadence_hours,timezone,status,max_cost_usd_cents,next_run_at,created_by,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,'active',0,?,?,?,?)`).run(
  "haep_gateway",
  "hermes_internal",
  "Gateway readiness",
  "ai.gateway.readiness.audit",
  "automation",
  "technology",
  "hermes-automatic-engineer",
  6,
  "UTC",
  scheduledAt,
  "owner",
  scheduledAt,
  scheduledAt,
);

await worker.scheduled({ scheduledTime: Date.parse(scheduledAt), cron: "17 * * * *" }, env, {});
let process = sqlite.prepare("SELECT * FROM hermes_automation_processes WHERE process_id='haep_gateway'").get();
assert.equal(process.status, "active");
assert.equal(process.last_error_class, null);
assert.equal(process.last_run_at, scheduledAt);
assert.equal(process.next_run_at, "2026-10-28T18:00:00.000Z");
assert.ok(process.last_job_id);

let jobs = sqlite.prepare("SELECT * FROM hermes_automation_jobs WHERE job_type='ai.gateway.readiness.audit'").all();
assert.equal(jobs.length, 1, "owner-managed capability must replace, not duplicate, the default schedule");
assert.equal(jobs[0].project_key, "hae-process:haep_gateway");
assert.equal(jobs[0].policy_version, "hae-owner-process-v1");
assert.match(jobs[0].payload_json, /"process_id":"haep_gateway"/);
assert.match(jobs[0].payload_json, /"_role_contract"/);
assert(queueWrites.some((write) => write.body?.job_id === process.last_job_id));

let event = sqlite.prepare("SELECT * FROM hermes_automation_process_events WHERE process_id='haep_gateway' AND event_type='process.dispatched'").get();
assert.equal(event.job_id, process.last_job_id);
assert.equal(event.error_class, null);

await worker.scheduled({ scheduledTime: Date.parse(scheduledAt), cron: "17 * * * *" }, env, {});
jobs = sqlite.prepare("SELECT * FROM hermes_automation_jobs WHERE job_type='ai.gateway.readiness.audit'").all();
assert.equal(jobs.length, 1, "the same cron slot must be idempotent");

sqlite.prepare("UPDATE hermes_automation_processes SET status='paused',next_run_at=? WHERE process_id='haep_gateway'")
  .run("2026-10-28T18:00:00.000Z");
await worker.scheduled({ scheduledTime: Date.parse("2026-10-28T18:00:00.000Z"), cron: "17 * * * *" }, env, {});
process = sqlite.prepare("SELECT * FROM hermes_automation_processes WHERE process_id='haep_gateway'").get();
assert.equal(process.status, "paused");
jobs = sqlite.prepare("SELECT * FROM hermes_automation_jobs WHERE project_key='hae-process:haep_gateway'").all();
assert.equal(jobs.length, 1, "paused owner process must not dispatch");

sqlite.close();
console.log("HAE owner process runtime: D1 due claim -> canonical Queue job -> receipt -> pause PASS");
