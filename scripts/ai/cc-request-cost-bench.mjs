#!/usr/bin/env node
/**
 * Request-cost measurement for the private Command Center read path.
 *
 * Why: on 2026-11-06 the private Command Center returned Cloudflare 1102
 * ("Worker exceeded resource limits") on every authenticated route while the
 * public site stayed healthy. The owning session is fixing the hot path; this
 * harness produces an independent, portable number for the acceptance
 * criterion: how many D1 statements a single authenticated request costs.
 *
 * What it measures (real repository functions, not re-implementations):
 *   - ensureCommandCenterSchema()  (functions/api/_lib/internal-command-center.mjs)
 *   - ensureInternalAiSchema()     (functions/api/_lib/internal-ai.mjs)
 *   - reconcileWorkItems()         (functions/api/_lib/internal-command-center.mjs)
 *   - the two backlog seeders, through ensureCommandCenterSchema()
 *
 * How: a D1-shaped shim over node:sqlite that counts every prepared statement
 * and classifies it (DDL / DML / SELECT). The D1 backend is a local SQLite
 * emulator, so wall-clock numbers are indicative only; the statement counts are
 * the portable, decision-relevant metric.
 *
 * Usage: node scripts/ai/cc-request-cost-bench.mjs [--out <file.json>]
 */

import { DatabaseSync } from "node:sqlite";
import { writeFileSync } from "node:fs";
import { ensureCommandCenterSchema, reconcileWorkItems } from "../../functions/api/_lib/internal-command-center.mjs";
import { ensureInternalAiSchema } from "../../functions/api/_lib/internal-ai.mjs";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;

class D1Statement {
  constructor(sql, statement, counter) {
    this.sql = sql;
    this.statement = statement;
    this.counter = counter;
    this.values = [];
  }
  bind(...values) {
    this.values = values;
    return this;
  }
  async run(...values) {
    const params = values.length ? values : this.values;
    this.counter.record(this.sql);
    const result = this.statement.run(...params);
    return { meta: { changes: Number(result.changes || 0) } };
  }
  async first(...values) {
    const params = values.length ? values : this.values;
    this.counter.record(this.sql);
    return this.statement.get(...params) || null;
  }
  async all(...values) {
    const params = values.length ? values : this.values;
    this.counter.record(this.sql);
    return { results: this.statement.all(...params) };
  }
}

class StatementCounter {
  constructor() {
    this.total = 0;
    this.ddl = 0;
    this.dml = 0;
    this.select = 0;
    this.other = 0;
    this.samples = [];
  }
  record(sql) {
    this.total += 1;
    const head = String(sql).trim().split(/\s+/)[0].toUpperCase();
    if (["CREATE", "ALTER", "DROP", "PRAGMA"].includes(head)) this.ddl += 1;
    else if (["INSERT", "UPDATE", "DELETE", "REPLACE"].includes(head)) this.dml += 1;
    else if (["SELECT", "WITH"].includes(head)) this.select += 1;
    else this.other += 1;
    if (this.samples.length < 12) this.samples.push(String(sql).replace(/\s+/g, " ").slice(0, 120));
  }
}

class D1Database {
  constructor() {
    this.database = new DatabaseSync(":memory:");
    this.counter = new StatementCounter();
  }
  prepare(sql) {
    return new D1Statement(sql, this.database.prepare(sql), this.counter);
  }
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

const now = () => Number(process.hrtime.bigint()) / 1e6;

async function measure(label, db, fn) {
  const before = { ...db.counter };
  const started = now();
  let error = null;
  try {
    await fn();
  } catch (caught) {
    error = String(caught?.message || caught);
  }
  const elapsed = now() - started;
  return {
    label,
    error,
    elapsed_ms: Number(elapsed.toFixed(3)),
    statements: db.counter.total - before.total,
    ddl: db.counter.ddl - before.ddl,
    dml: db.counter.dml - before.dml,
    select: db.counter.select - before.select,
  };
}

const db = new D1Database();
const evidence = {
  generated_at: new Date().toISOString(),
  source: "scripts/ai/cc-request-cost-bench.mjs",
  note: "D1 is emulated with node:sqlite; wall-clock is indicative only, statement counts are portable.",
  phases: [],
};

evidence.phases.push(await measure("cold_ensure_command_center_schema", db, () => ensureCommandCenterSchema(db)));
evidence.phases.push(await measure("cold_ensure_internal_ai_schema", db, () => ensureInternalAiSchema(db)));

const workItemCount = await db.prepare("SELECT COUNT(*) AS count FROM hermes_owner_work_items").first();
const taskCount = await db.prepare("SELECT COUNT(*) AS count FROM hermes_internal_ai_tasks").first();
evidence.backlog = {
  work_items: Number(workItemCount?.count || 0),
  internal_ai_tasks: Number(taskCount?.count || 0),
};

evidence.phases.push(await measure("warm_ensure_command_center_schema", db, () => ensureCommandCenterSchema(db)));
evidence.phases.push(await measure("warm_ensure_internal_ai_schema", db, () => ensureInternalAiSchema(db)));
evidence.phases.push(await measure("warm_reconcile_work_items", db, () => reconcileWorkItems(db)));

const warmRequest = evidence.phases.filter((phase) => phase.label.startsWith("warm_"));
evidence.summary = {
  warm_request_statements: warmRequest.reduce((sum, phase) => sum + phase.statements, 0),
  warm_request_ddl: warmRequest.reduce((sum, phase) => sum + phase.ddl, 0),
  warm_request_dml: warmRequest.reduce((sum, phase) => sum + phase.dml, 0),
  cold_bootstrap_statements: evidence.phases
    .filter((phase) => phase.label.startsWith("cold_"))
    .reduce((sum, phase) => sum + phase.statements, 0),
  statement_samples: db.counter.samples,
};

evidence.acceptance = {
  warm_request_statements_before: evidence.summary.warm_request_statements,
  warm_request_statements_target: "<= 10 (schema bootstrap cached per isolate, reconcile writes behind an existence probe)",
  cold_bootstrap_statements: evidence.summary.cold_bootstrap_statements,
  cold_bootstrap_note: "A cold isolate still pays the bootstrap once; if it does not fit the Workers CPU limit, the first request per isolate keeps failing with 1102.",
};

process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
if (outPath) {
  writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
  process.stdout.write(`evidence_written=${outPath}\n`);
}
