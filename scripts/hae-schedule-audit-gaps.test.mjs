import assert from "node:assert/strict";
import { scheduleMigrationGapFindings } from "../workers/automation-engine/src/schedule-audit-gaps.mjs";

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

console.log("hae schedule adapter gap guard PASS");
