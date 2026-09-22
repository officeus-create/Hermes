import assert from "node:assert/strict";
import fs from "node:fs";
import {
  HR_BRIDGE_EVENT_TYPES,
  HR_OUTCOME_MARKERS,
  HR_READINESS_DECISIONS,
  HR_READINESS_LEVELS,
  cleanCapabilityCode,
  readinessLevelFromEvidence,
} from "../functions/api/_lib/hr-readiness.mjs";

assert.deepEqual(HR_READINESS_LEVELS, [
  "HOLD",
  "OBSERVE",
  "PRACTICE",
  "SUPERVISED_LIVE",
  "INDEPENDENT_BOUNDED_WORK",
]);
assert.deepEqual(HR_READINESS_DECISIONS, ["READY_FOR_TEAM", "MORE_PRACTICE", "HOLD"]);
assert.deepEqual(HR_OUTCOME_MARKERS, [
  "FIRST_LIVE_TASK",
  "RETAINED_7D",
  "RETAINED_30D",
  "RETAINED_90D",
  "KPI_OUTCOME",
]);

const enrolled = (overrides = {}) => ({
  enrollment_state: "enrolled",
  completed_lessons: 0,
  progression_state: "in_progress",
  evidence: { submitted: 0, changes_requested: 0, accepted: 0 },
  ...overrides,
});

assert.equal(readinessLevelFromEvidence(null, 0, 0), "HOLD");
assert.equal(readinessLevelFromEvidence({ enrollment_state: "applied" }, 0, 0), "HOLD");
assert.equal(readinessLevelFromEvidence(enrolled(), 0, 0), "OBSERVE");
assert.equal(readinessLevelFromEvidence(enrolled({ completed_lessons: 1 }), 1, 0), "PRACTICE");
assert.equal(readinessLevelFromEvidence(enrolled({ evidence: { submitted: 0, changes_requested: 0, accepted: 1 } }), 1, 0), "SUPERVISED_LIVE");
assert.equal(readinessLevelFromEvidence(enrolled(), 0, 1), "SUPERVISED_LIVE");
assert.equal(readinessLevelFromEvidence(enrolled({ progression_state: "completed" }), 0, 1), "INDEPENDENT_BOUNDED_WORK");
assert.equal(readinessLevelFromEvidence(enrolled({ progression_state: "completed" }), 1, 1), "SUPERVISED_LIVE");

assert.equal(cleanCapabilityCode("Evaluation: Supervised live roleplay / call"), "evaluation:-supervised-live-roleplay-call");
assert.equal(cleanCapabilityCode("<script>"), "script");

for (const eventName of [
  "hr_academy_offered",
  "hr_academy_accepted",
  "academy_enrollment_created",
  "academy_evidence_submitted",
  "academy_capability_gap_resolved",
  "academy_supervised_live_started",
  "academy_readiness_packet_ready",
  "hr_readiness_decision_recorded",
  "hr_team_handoff_completed",
  "hr_first_live_task",
  "hr_retained_7d",
  "hr_retained_30d",
  "hr_retained_90d",
  "hr_kpi_outcome_recorded",
]) {
  assert.ok(HR_BRIDGE_EVENT_TYPES.includes(eventName), `missing bridge event: ${eventName}`);
}

const lib = fs.readFileSync(new URL("../functions/api/_lib/hr-readiness.mjs", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../functions/api/hr/reviewer/readiness.ts", import.meta.url), "utf8");

for (const table of [
  "hr_capability_gaps",
  "hr_readiness_packets",
  "hr_readiness_decisions",
  "hr_team_handoffs",
  "hr_performance_outcomes",
  "hr_bridge_events",
]) {
  assert.match(lib, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}

assert.match(lib, /UNIQUE\(candidate_id, code\)/);
assert.match(lib, /idempotency_key TEXT NOT NULL UNIQUE/);
assert.match(lib, /decision === "READY_FOR_TEAM"/);
assert.match(lib, /capability_gaps_open/);
assert.match(lib, /readiness_evidence_required/);
assert.match(lib, /ready_for_team_decision_required/);
assert.match(lib, /completed_handoff_required/);
assert.match(lib, /getAcademyProgressionSummary/);
assert.match(lib, /accepted_evidence_count/);
assert.match(lib, /supervised_practice_count/);

assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /getHrReviewerAccess/);
assert.match(api, /sameOriginMutation/);
assert.match(api, /Cache-Control": "no-store"/);
assert.match(api, /readiness_control_fields_not_editable_here/);
assert.match(api, /auto_hire/);
assert.match(api, /auto_reject/);
assert.match(api, /live_access_granted/);
assert.doesNotMatch(api, /AUTO_HIRE|AUTO_REJECT|grantLiveAccess|employment_decision/);

for (const action of [
  "sync_evaluation_gaps",
  "resolve_gap",
  "record_supervised_practice",
  "prepare_readiness_packet",
  "decide_readiness",
  "complete_team_handoff",
  "record_outcome",
]) {
  assert.match(api, new RegExp(`action === "${action}"`));
}

console.log("Hermes Connect HR readiness bridge contract: PASS");
