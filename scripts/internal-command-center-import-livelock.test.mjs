// Regression tests for the Command Center backlog-import livelock.
//
// Production incident follow-up (2026-11-07): the private Command Center still
// flapped between 200 and 503 on cold isolates after the per-request bootstrap was
// removed. The cause is in the two canonical backlog seeders: the import key is
// written only AFTER every row has landed, so a Worker killed by the platform CPU
// limit in the middle of the import leaves no key behind. Every later request then
// replays the whole import (54 + 132 rows), burns the same CPU budget and is killed
// again. The failure is self-sustaining and never resolves by waiting.
//
// Fix: the presence of the imported rows is a stronger and cheaper evidence of a
// completed import than the key row alone. One COUNT statement closes the loop and
// writes the missing key, so a cold isolate costs four statements instead of ~208.
import assert from "node:assert/strict";
import {
  COMMAND_CENTER_HISTORY_BACKLOG,
  seedHistoricalCommandCenterBacklog,
} from "../functions/api/_lib/command-center-history-backlog.mjs";
import {
  FOUR_MONTH_REVENUE_BACKLOG,
  seedFourMonthRevenueBacklog,
} from "../functions/api/_lib/command-center-four-month-revenue-backlog.mjs";

/**
 * Minimal D1 stub that counts the statements the seeders actually issue.
 * @param {{ importKeyPresent?: boolean, importedRows?: number }} state
 */
function makeDb(state = {}) {
  const importKeyPresent = state.importKeyPresent === true;
  const importedRows = Number(state.importedRows || 0);
  const counts = { workItemInserts: 0, importKeyInserts: 0, counts: 0 };
  const db = {
    prepare(sql) {
      const text = String(sql);
      const statement = {
        bind() { return statement; },
        async run() {
          if (/INSERT OR IGNORE INTO hermes_owner_work_items/i.test(text)) counts.workItemInserts += 1;
          else if (/INSERT OR IGNORE INTO hermes_command_center_imports/i.test(text)) counts.importKeyInserts += 1;
          return { success: true, meta: { changes: 1 } };
        },
        async first() {
          if (/SELECT import_key FROM hermes_command_center_imports/i.test(text)) {
            return importKeyPresent ? { import_key: "present" } : null;
          }
          if (/SELECT COUNT\(\*\) AS n FROM hermes_owner_work_items/i.test(text)) {
            counts.counts += 1;
            return { n: importedRows };
          }
          return null;
        },
        async all() { return { results: [] }; },
      };
      return statement;
    },
  };
  return { db, counts };
}

// --- the livelock: key missing, rows already imported ------------------------
{
  const { db, counts } = makeDb({ importKeyPresent: false, importedRows: COMMAND_CENTER_HISTORY_BACKLOG.length });
  await seedHistoricalCommandCenterBacklog(db);
  assert.equal(counts.workItemInserts, 0, "an already imported backlog must not be replayed row by row");
  assert.equal(counts.importKeyInserts, 1, "the missing import key must be written so the next request is cheap");
  assert.equal(counts.counts, 1, "the guard must cost exactly one count statement");
}
{
  const { db, counts } = makeDb({ importKeyPresent: false, importedRows: FOUR_MONTH_REVENUE_BACKLOG.length });
  await seedFourMonthRevenueBacklog(db);
  assert.equal(counts.workItemInserts, 0, "an already imported revenue backlog must not be replayed row by row");
  assert.equal(counts.importKeyInserts, 1, "the missing import key must be written so the next request is cheap");
  assert.equal(counts.counts, 1, "the guard must cost exactly one count statement");
}

// --- the steady state: the import key is present ------------------------------
{
  const { db, counts } = makeDb({ importKeyPresent: true, importedRows: COMMAND_CENTER_HISTORY_BACKLOG.length });
  await seedHistoricalCommandCenterBacklog(db);
  assert.equal(counts.workItemInserts, 0);
  assert.equal(counts.importKeyInserts, 0);
  assert.equal(counts.counts, 0, "a present import key must short-circuit before the count guard");
}

// --- an incomplete import must still complete ---------------------------------
{
  const { db, counts } = makeDb({ importKeyPresent: false, importedRows: 10 });
  await seedHistoricalCommandCenterBacklog(db);
  assert.equal(
    counts.workItemInserts,
    COMMAND_CENTER_HISTORY_BACKLOG.length,
    "a partially applied import must still be completed instead of silently skipped",
  );
  assert.equal(counts.importKeyInserts, 1);
}
{
  const { db, counts } = makeDb({ importKeyPresent: false, importedRows: 3 });
  await seedFourMonthRevenueBacklog(db);
  assert.equal(
    counts.workItemInserts,
    FOUR_MONTH_REVENUE_BACKLOG.length,
    "a partially applied revenue import must still be completed instead of silently skipped",
  );
  assert.equal(counts.importKeyInserts, 1);
}

// --- the backlog contents stay canonical ---------------------------------------
assert.equal(COMMAND_CENTER_HISTORY_BACKLOG.length, 54, "the historical backlog size is a canonical input");
assert.equal(FOUR_MONTH_REVENUE_BACKLOG.length, 132, "the four-month revenue backlog size is a canonical input");
assert.ok(
  COMMAND_CENTER_HISTORY_BACKLOG.every((item) => /^hcwi_hist_/.test(item.id)),
  "the history backlog ids stay in their canonical namespace",
);
assert.ok(
  FOUR_MONTH_REVENUE_BACKLOG.every((item) => /^hcwi_rev4m_/.test(item.id)),
  "the revenue backlog ids stay in their canonical namespace",
);

console.log("internal-command-center-import-livelock: PASS");
