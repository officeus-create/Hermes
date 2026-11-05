import assert from "node:assert/strict";
import {
  WORK_PORTFOLIO_LIMITS,
  normalizeWorkPortfolioSnapshot,
  reconcileWorkPortfolioSnapshot,
} from "../workers/automation-engine/src/work-portfolio.mjs";

const input = {
  source_kind: "ONE_BRAIN",
  snapshot_id: "one-brain:2026-10-24T18:00Z",
  observed_at: "2026-10-24T18:00:00.000Z",
  coverage_complete: false,
  tasks: [
    { work_id: "W-1", source_ref: "drive://task/W-1", status: "DONE", priority: 80, updated_at: "2026-10-24T16:00:00Z", permission_class: "READ_ONLY", capability_job_type: "search.snapshot.evaluate", dependencies: [] },
    { work_id: "W-2", source_ref: "drive://task/W-2", status: "TODO", priority: 90, updated_at: "2026-10-24T17:00:00Z", permission_class: "READ_ONLY", capability_job_type: "search.snapshot.evaluate", dependencies: ["W-1"] },
    { work_id: "W-3", source_ref: "drive://task/W-3", status: "TODO", priority: 70, updated_at: "2026-10-01T17:00:00Z", permission_class: "EXTERNAL_WRITE", capability_job_type: "search.snapshot.evaluate", writer_key: "artifact:shared", dependencies: [] },
    { work_id: "W-4", source_ref: "drive://task/W-4", status: "TODO", priority: 60, updated_at: "2026-10-24T17:00:00Z", permission_class: "READ_ONLY", capability_job_type: "marketing.content.dedupe.audit", writer_key: "artifact:shared", dependencies: [] },
    { work_id: "W-5", source_ref: "drive://task/W-5", status: "BLOCKED", priority: 50, updated_at: "2026-10-24T17:00:00Z", permission_class: "UNKNOWN", dependencies: ["W-missing"] },
    { work_id: "W-6", source_ref: "drive://task/W-6", status: "UNKNOWN", priority: 40, updated_at: "2026-10-24T17:00:00Z", permission_class: "READ_ONLY", dependencies: [] },
  ],
};

const normalized = normalizeWorkPortfolioSnapshot(input);
assert.equal(normalized.source_kind, "ONE_BRAIN");
assert.equal(normalized.tasks.length, 6);

const routeContracts = [
  { job_type:"search.snapshot.evaluate", role_id:"hermes-search-growth", plugin_version:"0.1.16", permission_class:"READ_ONLY", semantic_required:false, runtime_config:{max_cost_usd:0} },
  { job_type:"marketing.content.dedupe.audit", role_id:"hermes-marketing-growth", plugin_version:"0.1.17", permission_class:"READ_ONLY", semantic_required:false, runtime_config:{max_cost_usd:0} },
];

const result = reconcileWorkPortfolioSnapshot(input, [
  "search.snapshot.evaluate",
  "marketing.content.dedupe.audit",
], routeContracts);
assert.equal(result.coverage_status, "PARTIAL");
assert.equal(result.unfinished_count, 5);
assert.deepEqual(result.ready_work_ids, ["W-2"]);
assert.deepEqual(result.routing_candidate_work_ids, []);
assert.equal(result.routing_candidate_count, 0);
assert.equal(result.routing_blocked_reason, "PARTIAL_COVERAGE");
assert.equal(result.blocked_count, 3);
assert.equal(result.writer_conflict_count, 2);
assert.equal(result.stale_count, 1);
assert.equal(result.unknown_count, 1);
assert.equal(result.unresolved_dependency_count, 1);
assert.equal(result.automatic_execution_performed, false);
assert.equal(result.raw_chat_history_persisted, false);

const completeResult = reconcileWorkPortfolioSnapshot({ ...input, coverage_complete: true }, [
  "search.snapshot.evaluate",
  "marketing.content.dedupe.audit",
], routeContracts);
assert.deepEqual(completeResult.routing_candidate_work_ids, ["W-2"]);
assert.equal(completeResult.routing_blocked_reason, null);
const w2Route=completeResult.routing_decisions.find((item)=>item.work_id==="W-2");
assert.deepEqual(w2Route,{
  work_id:"W-2",
  route_decision:"CANDIDATE",
  route_reason:"MATCHED_READ_ONLY_ROLE",
  capability_job_type:"search.snapshot.evaluate",
  selected_role_id:"hermes-search-growth",
  selected_plugin_version:"0.1.16",
  execution_permission:"READ_ONLY_CANDIDATE_ONLY",
  semantic_required:false,
  model_cost_usd:0,
  evidence_id:"HAE-ROUTE:one-brain:2026-10-24T18:00Z:W-2",
});
const w3Route=completeResult.routing_decisions.find((item)=>item.work_id==="W-3");
assert.equal(w3Route.route_decision,"OMIT");
assert.equal(w3Route.route_reason,"WRITER_CONFLICT");
assert.equal(w3Route.execution_permission,"NONE");
const partialW2=result.routing_decisions.find((item)=>item.work_id==="W-2");
assert.equal(partialW2.route_decision,"HOLD");
assert.equal(partialW2.route_reason,"PARTIAL_COVERAGE");
assert.equal(result.automatic_execution_performed,false);

assert.throws(
  () => normalizeWorkPortfolioSnapshot({ ...input, source_kind: "CHATGPT_ALL" }),
  /work_source_kind_invalid/,
  "Complete ChatGPT-account harvesting must be impossible",
);
assert.throws(
  () => normalizeWorkPortfolioSnapshot({ ...input, tasks: [{ ...input.tasks[0], title: "raw task title" }] }),
  /work_task_field_not_allowed/,
  "Raw chat/task content fields must fail closed",
);
assert.throws(
  () => normalizeWorkPortfolioSnapshot({ ...input, tasks: [{ ...input.tasks[0], source_ref: "https://chatgpt.com/raw-chat" }] }),
  /work_source_ref_invalid/,
);
assert.throws(
  () => normalizeWorkPortfolioSnapshot({ ...input, tasks: [{ ...input.tasks[0], permission_class: "ADMIN" }] }),
  /work_permission_class_invalid/,
);
assert.throws(
  () => normalizeWorkPortfolioSnapshot({ ...input, tasks: [{ ...input.tasks[0], priority: true }] }),
  /work_priority_invalid/,
);
assert.equal(WORK_PORTFOLIO_LIMITS.max_tasks, 500);
assert.deepEqual(WORK_PORTFOLIO_LIMITS.allowed_sources, ["ONE_BRAIN", "GITHUB", "CHATGPT_SELECTED"]);

console.log("HAE work portfolio PASS: minimized authorized snapshots; no raw ChatGPT history or automatic execution");
