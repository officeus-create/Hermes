import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scheduleMigrationGapFindings } from "../workers/automation-engine/src/schedule-audit-gaps.mjs";
import { scheduledReceiptFreshnessFindings } from "../workers/automation-engine/src/scheduled-receipt-guard.mjs";

const observedAt = "2026-11-03T07:00:00.000Z";
const findings = scheduleMigrationGapFindings({
  migrations: [
    { task_key: "ecosystem-watch", activation_state: "SOURCE_ADAPTER_REQUIRED" },
    { task_key: "growth-error-closure", activation_state: "SOURCE_ADAPTER_REQUIRED" },
    { task_key: "ai-gateway-readiness", activation_state: "READY_ZERO_TOKEN" },
  ],
  unsupported_capabilities: ["ecosystem-watch:cloudflare.runtime.audit"],
}, observedAt);

assert.equal(findings.length, 3);
assert.equal(findings[0].finding_id, "schedule-source-adapter-gap:ecosystem-watch");
assert.equal(findings[0].severity, "P0");
assert.equal(findings[0].category, "AUTOMATION_COVERAGE_GAP");
assert.equal(findings[1].severity, "P1");
assert.equal(findings[2].severity, "P0");
assert.equal(findings.some((item) => item.finding_id.includes("ai-gateway-readiness")), false);

assert.throws(() => scheduleMigrationGapFindings(null, observedAt), /schedule_migration_snapshot_invalid/);
assert.throws(() => scheduleMigrationGapFindings({ migrations: [] }, "bad"), /schedule_migration_observed_at_invalid/);

const scheduleSha = "a".repeat(40);
const scheduleContracts = [
  { job_type: "search.snapshot.evaluate", cadence_hours: 6, owner_managed: false },
  { job_type: "ai.gateway.readiness.audit", cadence_hours: 24, owner_managed: false },
  { job_type: "academy.english.practice.build", cadence_hours: 24, owner_managed: true },
];

assert.deepEqual(scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-03T10:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: {},
}), [], "new deployment gets a bounded grace period");

const staleSchedule = scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-03T13:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: {},
});
assert.equal(staleSchedule.length, 1);
assert.equal(staleSchedule[0].finding_id, "scheduled-receipt-stale:search.snapshot.evaluate");
assert.equal(staleSchedule[0].category, "TEST_GAP");
assert.equal(staleSchedule[0].status, "BLOCKED");

assert.deepEqual(scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-03T13:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: { "search.snapshot.evaluate": "2026-11-03T12:00:00Z" },
}), [], "fresh completed receipt clears the SLA alert");

assert.deepEqual(scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-06T00:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: "not-a-sha",
  contracts: scheduleContracts,
  latest_receipts: {},
}), [], "monitor waits for an exact deployed SHA");

const dailyStale = scheduledReceiptFreshnessFindings({
  scheduled_at: "2026-11-05T01:00:00Z",
  deployment_first_observed_at: "2026-11-03T00:00:00Z",
  source_sha: scheduleSha,
  contracts: scheduleContracts,
  latest_receipts: { "search.snapshot.evaluate": "2026-11-05T00:00:00Z" },
});
assert.equal(dailyStale.length, 1);
assert.equal(dailyStale[0].finding_id, "scheduled-receipt-stale:ai.gateway.readiness.audit");
assert.ok(!dailyStale.some((item) => item.finding_id.includes("academy.english.practice.build")), "owner-managed schedules are not double-monitored");

const runtimeSource = readFileSync("workers/automation-engine/src/index.mjs", "utf8");
assert.match(runtimeSource, /MAX\(completed_at\) AS last_completed_at/, "schedule health must use terminal completion time");
assert.match(runtimeSource, /state='SUCCEEDED'[\s\S]*result_json IS NOT NULL[\s\S]*completed_at IS NOT NULL/, "queued or result-less jobs must not count as receipts");
assert.doesNotMatch(runtimeSource, /MAX\(created_at\) AS last_created_at[\s\S]*scheduledReceiptFreshnessFindings/, "created jobs must not satisfy receipt freshness");

console.log("hae schedule adapter + completed-receipt gap guard PASS");
