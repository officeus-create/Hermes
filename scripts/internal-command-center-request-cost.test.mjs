// Regression tests for the private Command Center request-cost guard.
//
// These tests pin the production incident of 2026-11-06: every authenticated owner
// request re-ran the full schema bootstrap (including the canonical backlog
// seeders) plus an unconditional reconcile UPDATE pair, and the private page
// repeated that cost once per card every 15 seconds until Cloudflare returned 1102
// on every private route.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cachedValue,
  ensureOnce,
  resetRequestCostGuard,
  schemaReady,
} from "../functions/api/_lib/request-cost-guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

// --- ensureOnce: one bootstrap per isolate, failures not cached ----------------
{
  resetRequestCostGuard();
  let calls = 0;
  const factory = async () => {
    calls += 1;
    return "schema";
  };
  const results = await Promise.all([
    ensureOnce({}, "work-items", factory),
    ensureOnce({}, "work-items", factory),
    ensureOnce({}, "work-items", factory),
  ]);
  assert.deepEqual(results, ["schema", "schema", "schema"]);
  assert.equal(calls, 1, "the schema bootstrap must run once per isolate, not once per request");
}

{
  resetRequestCostGuard();
  let calls = 0;
  const failing = async () => {
    calls += 1;
    throw new Error("bootstrap_failed");
  };
  await assert.rejects(() => ensureOnce({}, "failing", failing), /bootstrap_failed/);
  await assert.rejects(() => ensureOnce({}, "failing", failing), /bootstrap_failed/);
  assert.equal(calls, 2, "a failed bootstrap must not be cached");
}

// --- cachedValue: bounded window for outbound reads ----------------------------
{
  resetRequestCostGuard();
  let calls = 0;
  const fn = async () => {
    calls += 1;
    return calls;
  };
  assert.equal(await cachedValue("clickup", fn, { ttlMs: 60_000 }), 1);
  assert.equal(await cachedValue("clickup", fn, { ttlMs: 60_000 }), 1);
  assert.equal(calls, 1, "outbound reads must be cached inside the TTL");
}

// --- source guards: the private read path must not bootstrap per request ------
{
  const workItems = read("functions/api/internal-command-center/work-items.ts");
  const workItem = read("functions/api/internal-command-center/work-items/[id].ts");
  const executionMap = read("functions/api/internal-command-center/execution-map.ts");

  for (const [name, source] of [
    ["work-items.ts", workItems],
    ["work-items/[id].ts", workItem],
    ["execution-map.ts", executionMap],
  ]) {
    assert.ok(
      !/await ensureCommandCenterSchema\(env\.DB\)/.test(source),
      `${name} must not bootstrap the Command Center schema on every request`,
    );
    assert.ok(
      !/await ensureHaeProcessSchema\(env\.DB\)/.test(source),
      `${name} must not bootstrap the HAE process schema on every request`,
    );
    assert.ok(
      /ensureCommandCenterSchemaOnce/.test(source),
      `${name} must use the per-isolate schema bootstrap`,
    );
  }

  const internalAi = read("functions/api/_lib/internal-ai.mjs");
  assert.ok(
    !/await ensureInternalAiSchema\(env\.DB\)/.test(internalAi),
    "the owner gate must not re-run the internal AI schema DDL on every request",
  );
  assert.ok(/ensureInternalAiSchemaOnce/.test(internalAi), "the owner gate must use the per-isolate bootstrap");

  const engagement = read("functions/api/_lib/account-engagement.mjs");
  assert.ok(
    !/await ensureAccountEngagementSchema\(db\)/.test(engagement),
    "account engagement must not re-run its schema DDL on every request",
  );
  assert.ok(
    /ensureAccountEngagementSchemaOnce/.test(engagement),
    "account engagement must use the per-isolate bootstrap",
  );

  // Reconcile stays on the read path: the owner must see a completed linked AI task
  // as awaiting acceptance on the next read. It must probe before it writes, so the
  // common case costs two cheap selects and zero writes.
  const commandCenter = read("functions/api/_lib/internal-command-center.mjs");
  const reconcileStart = commandCenter.indexOf("export async function reconcileWorkItems");
  assert.ok(reconcileStart > 0, "reconcileWorkItems must stay exported");
  const reconcileBody = commandCenter.slice(reconcileStart, reconcileStart + 2400);
  assert.ok(
    /SELECT 1 AS hit/.test(reconcileBody),
    "reconcile must probe for rows that actually need a transition before writing",
  );
  assert.ok(
    /if\(awaiting\)/.test(reconcileBody) && /if\(failed\)/.test(reconcileBody),
    "reconcile must only write when a probe found a transition to apply",
  );
  assert.ok(
    !/reconcileWorkItemsThrottled/.test(workItems) && !/reconcileWorkItemsThrottled/.test(workItem),
    "reconcile must not be throttled away: the owner read model must stay fresh",
  );

  // The seeder itself must stay intact: the fix is to stop calling it per request,
  // never to delete the canonical backlog import.
  assert.ok(
    /seedFourMonthRevenueBacklog\(db\)/.test(commandCenter),
    "the canonical four-month backlog seed must stay in the schema bootstrap",
  );
  assert.ok(
    /seedHistoricalCommandCenterBacklog\(db\)/.test(commandCenter),
    "the canonical historical backlog seed must stay in the schema bootstrap",
  );
}

// --- source guards: the private page must not storm the private API ----------
{
  const page = read("src/pages/services/hermes-connect/internal/command-center/index.astro");
  assert.ok(
    !/setInterval\(\(\)=>void loadAll\(\),15000\)/.test(page),
    "the private page must not poll every 15 seconds",
  );
  assert.ok(/document\.hidden/.test(page), "the private page must skip polling while the tab is hidden");
  assert.ok(/IntersectionObserver/.test(page), "plugin receipts must load lazily for visible cards");
}


// --- the read path must not take the write lock of the shared database ---------
// The HAE cron writes the same D1 every five minutes. DDL takes that database's
// write lock, so a cold isolate that re-runs DDL on every request serialises
// against the cron and the request hangs until the platform gives up (production
// incident 2026-11-07: authenticated private routes answered 524 after 125-145s).
{
  const makeSchemaDb = ({ tables = [], indexes = [], columns = {}, keyPresent = true } = {}) => {
    const ddl = [];
    const db = {
      prepare(sql) {
        const text = String(sql);
        const statement = {
          bind() { return statement; },
          async run() {
            if (/^\s*CREATE (TABLE|INDEX)|^\s*ALTER TABLE/i.test(text)) ddl.push(text.trim().slice(0, 60));
            return { success: true, meta: { changes: 0 } };
          },
          async first() {
            if (/FROM sqlite_master WHERE name IN/i.test(text)) {
              const wanted = text.match(/\?/g) || [];
              const found = [...tables, ...indexes].filter(name => wanted.length);
              return { name: found[0] || null };
            }
            if (/FROM sqlite_master WHERE type='table' AND name='hermes_command_center_imports'/i.test(text)) {
              return { name: "hermes_command_center_imports" };
            }
            if (/SELECT import_key FROM hermes_command_center_imports/i.test(text)) {
              return keyPresent ? { import_key: "present" } : null;
            }
            if (/SELECT COUNT\(\*\) AS n FROM hermes_owner_work_items/i.test(text)) return { n: 0 };
            return null;
          },
          async all() {
            if (/FROM sqlite_master WHERE name IN/i.test(text)) {
              const wanted = text.match(/\?/g) || [];
              void wanted;
              return { results: [...tables, ...indexes].map(name => ({ name })) };
            }
            if (/PRAGMA table_info/i.test(text)) {
              const table = text.match(/table_info\((\w+)\)/i)?.[1] || "";
              return { results: (columns[table] || []).map(name => ({ name })) };
            }
            return { results: [] };
          },
        };
        return statement;
      },
    };
    return { db, ddl };
  };

  // schemaReady answers from reads only and is false when anything is missing.
  const ready = await schemaReady(makeSchemaDb({ tables: ["a"], indexes: ["i"], columns: { t: ["c"] } }).db, {
    tables: ["a"],
    indexes: ["i"],
    tableColumns: { t: ["c"] },
  });
  assert.equal(ready, true, "a complete schema must be detected with reads");
  const missingColumn = await schemaReady(makeSchemaDb({ tables: ["a"], indexes: ["i"], columns: { t: ["c"] } }).db, {
    tables: ["a"],
    indexes: ["i"],
    tableColumns: { t: ["c", "d"] },
  });
  assert.equal(missingColumn, false, "a missing column must not be reported as ready");
  const missingTable = await schemaReady(makeSchemaDb({ tables: [], indexes: [], columns: {} }).db, { tables: ["a"] });
  assert.equal(missingTable, false, "a missing table must not be reported as ready");

  // The internal AI schema bootstrap must skip DDL when the schema is present.
  const { ensureInternalAiSchema } = await import("../functions/api/_lib/internal-ai.mjs");
  const internalAiSource = read("functions/api/_lib/internal-ai.mjs");
  const internalAiTables = [
    "hermes_internal_owner_access",
    "hermes_internal_team_view_access",
    "hermes_internal_team_view_access_audit",
    "hermes_internal_ai_tasks",
    "hermes_internal_ai_events",
    "hermes_internal_ai_runner_state",
  ];
  const internalAiIndexes = ["idx_internal_ai_tasks_scope_status_created", "idx_internal_ai_events_scope_task"];
  const internalAiColumns = {
    hermes_internal_ai_tasks: ["approval_granted_at", "approval_granted_by", "approval_attempt"],
    hermes_internal_ai_runner_state: ["telemetry_json"],
  };
  const complete = makeSchemaDb({
    tables: internalAiTables,
    indexes: internalAiIndexes,
    columns: internalAiColumns,
  });
  await ensureInternalAiSchema(complete.db);
  assert.equal(complete.ddl.length, 0, "a present internal AI schema must not run DDL on a cold isolate");

  const incomplete = makeSchemaDb({ tables: internalAiTables.slice(1), indexes: internalAiIndexes, columns: internalAiColumns });
  await ensureInternalAiSchema(incomplete.db);
  assert.ok(incomplete.ddl.length > 0, "an incomplete internal AI schema must still run the DDL");

  // The Command Center schema bootstrap must skip DDL when the schema is present.
  const { ensureCommandCenterSchema } = await import("../functions/api/_lib/internal-command-center.mjs");
  const ccSource = read("functions/api/_lib/internal-command-center.mjs");
  const ccTables = ["hermes_owner_work_items", "hermes_internal_owner_access_audit"];
  const ccIndexes = [
    "idx_owner_work_items_scope_state_priority",
    "idx_owner_work_items_scope_project",
    "idx_owner_work_items_revenue_queue",
  ];
  const ccColumns = {
    hermes_owner_work_items: [
      "acceptance_status", "accepted_by", "accepted_at", "project_id", "plugin_route_json",
      "hae_job_id", "hae_plan_job_id", "hae_execution_job_id", "hae_dispatch_state",
      "hae_dispatch_result_json", "source_kind", "source_label", "source_ref", "next_action",
      "revenue_gate_usd", "revenue_target_usd", "revenue_actual_usd", "revenue_rank",
      "revenue_status", "revenue_source_work_id", "revenue_evidence_ref", "revenue_recorded_at",
    ],
  };
  const ccComplete = makeSchemaDb({ tables: ccTables, indexes: ccIndexes, columns: ccColumns });
  await ensureCommandCenterSchema(ccComplete.db);
  assert.equal(ccComplete.ddl.length, 0, "a present Command Center schema must not run DDL on a cold isolate");

  const ccIncomplete = makeSchemaDb({ tables: ccTables, indexes: ccIndexes.slice(1), columns: ccColumns });
  await ensureCommandCenterSchema(ccIncomplete.db);
  assert.ok(ccIncomplete.ddl.length > 0, "an incomplete Command Center schema must still run the DDL");

  // The readiness lists and the DDL must not drift apart.
  assert.ok(
    /OWNER_WORK_ITEM_COLUMNS\.map\(\(\[name\]\) => name\)/.test(ccSource),
    "the Command Center readiness check must read the same column list the DDL applies",
  );
  assert.ok(/OPTIONAL_TASK_COLUMNS/.test(internalAiSource), "the internal AI readiness check must read the same column list the DDL applies");
  assert.ok(
    /schemaReady\(/.test(internalAiSource) && /schemaReady\(/.test(ccSource),
    "both schema bootstraps must verify with reads before taking the write lock",
  );
}

console.log("internal-command-center-request-cost: PASS");
