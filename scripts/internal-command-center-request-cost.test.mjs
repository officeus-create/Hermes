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

console.log("internal-command-center-request-cost: PASS");
