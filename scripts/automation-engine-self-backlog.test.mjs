import assert from "node:assert/strict";
import { planHaeSelfBacklog, HAE_SELF_BACKLOG_PLAN_LIMITS } from
  "../workers/automation-engine/src/hae-self-backlog.mjs";

const t = "2026-10-26T01:00:00Z";
const base = {
  source_ref: "github://officeus-create/Hermes/issues/2070",
  category: "TEST_GAP", severity: "P1", status: "OPEN",
  verified: true, writer_active: false, writer_state_verified: true, observed_at: t,
};
const finding = (id, artifact, options = {}) => ({
  ...base, finding_id: id, artifact_key: artifact, ...options,
});
const sample = [
  finding("a", "src/A.mjs", { severity: "P0" }),
  finding("b", "src/B.mjs", { depends_on: ["fixed"] }),
  finding("c", "src/A.mjs", { severity: "P1" }),
  finding("d", "src/D.mjs", { severity: "P2" }),
  finding("fixed", "src/C.mjs", { status: "FIXED" }),
  finding("unverified", "src/E.mjs", { verified: false }),
];
const snapshot = (findings, complete = true) => ({
  observed_at: t, coverage_complete: complete, findings,
});
const plan = planHaeSelfBacklog(snapshot(sample));
assert.equal(plan.coverage_status, "COMPLETE");
assert.deepEqual(plan.proposals.map((x) => x.finding_id), ["a", "b"]);
assert.equal(plan.proposed_count, 2);
assert.equal(plan.ready_work_ids.length, 2);
assert.equal(plan.automatic_job_submission_allowed, false);
assert.equal(plan.paid_ai_cost_usd, 0);
assert.equal(plan.automatic_merge_performed, false);
assert.equal(plan.automatic_deploy_performed, false);
assert.ok(plan.blocked.some((x) => x.finding_id === "c" && x.reason === "ARTIFACT_RESERVED_IN_PLAN"));
assert.ok(plan.blocked.some((x) => x.finding_id === "d" && x.reason === "LOW_PRIORITY_HELD"));
assert.deepEqual(planHaeSelfBacklog(snapshot(sample)), plan, "same snapshot -> stable plan");
assert.deepEqual(planHaeSelfBacklog(snapshot([...sample, sample[0]])).proposals, plan.proposals,
  "identical duplicate must not create another work item");
const conflict = planHaeSelfBacklog(snapshot([...sample, { ...sample[0], severity: "P1" }]));
assert.equal(conflict.duplicate_conflict_count, 1);
assert.ok(!conflict.proposals.some((x) => x.finding_id === "a"));
assert.equal(planHaeSelfBacklog(snapshot(sample, false)).proposed_count, 0);
assert.equal(planHaeSelfBacklog(snapshot(sample, false)).next_action, "HOLD_PARTIAL_COVERAGE");
assert.equal(planHaeSelfBacklog(snapshot([
  finding("blocked-dep", "src/G.mjs", { depends_on: ["not-found"] }),
  finding("free", "src/H.mjs"),
])).proposed_count, 1, "unmet dependency must not block independent artifact");
assert.equal(planHaeSelfBacklog(snapshot([
  finding("active", "src/J.mjs", { writer_active: true }),
  finding("conflicting", "src/J.mjs"),
  finding("independent", "src/K.mjs"),
])).proposals.map((x) => x.finding_id).join(","), "independent");
assert.equal(planHaeSelfBacklog(snapshot([
  finding("active-one", "src/J.mjs", { writer_active: true }),
  finding("active-two", "src/K.mjs", { writer_active: true }),
  finding("ready", "src/L.mjs"),
])).ready_work_ids.length, 0, "active writer slots must cap new concurrent execution");
assert.equal(planHaeSelfBacklog(snapshot([
  finding("active-one", "src/J.mjs", { writer_active: true }),
  finding("active-two", "src/J.mjs", { writer_active: true }),
  finding("ready", "src/L.mjs"),
])).ready_work_ids.length, 0, "two active writers on one artifact still consume both writer slots");
assert.equal(planHaeSelfBacklog(snapshot([
  finding("unverified", "src/J.mjs", { writer_state_verified: false }),
])).proposed_count, 0);
const many = Array.from({ length: 15 }, (_, i) => finding("many-" + i, "src/" + i + ".mjs"));
const capped = planHaeSelfBacklog(snapshot(many));
assert.equal(capped.proposed_count, 10);
assert.equal(capped.ready_work_ids.length, 2);
assert.equal(capped.blocked.filter((x) => x.reason === "BATCH_CAPACITY").length, 5);
assert.equal(HAE_SELF_BACKLOG_PLAN_LIMITS.max_proposals, 10);
assert.throws(() => planHaeSelfBacklog(snapshot([
  finding("p", "src/P.mjs", { body: "private email contents" }),
])), /hae_backlog_unclassified_field/);
assert.throws(() => planHaeSelfBacklog(snapshot([
  finding("p", "src/P.mjs", { depends_on: "not-an-array" }),
])), /hae_backlog_dependencies_invalid/);
assert.throws(() => planHaeSelfBacklog(snapshot([
  finding("p", "src/P.mjs", { depends_on: ["p"] }),
])), /hae_backlog_dependency_duplicate_or_self/);
console.log("HAE bounded self-backlog source planner: PASS");
