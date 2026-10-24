import assert from "node:assert/strict";
import {
  CAPABILITY_GRAPH_LIMITS,
  deriveGraphState,
  derivePendingNodeTransitions,
  evaluateKpiAssertions,
  normalizeCapabilityGraphInput,
} from "../workers/automation-engine/src/capability-graph.mjs";

const allowed = [
  "search.snapshot.evaluate",
  "marketing.content.dedupe.audit",
  "logistics.source.freshness.audit",
  "search.defect.prioritize",
];

const graph = await normalizeCapabilityGraphInput({
  idempotency_key: "graph:test:1",
  goal: "Audit Search and Marketing independently, then prioritize verified Search defects.",
  nodes: [
    {
      node_id: "search-audit",
      job_type: "search.snapshot.evaluate",
      payload: { pages: [] },
      kpi_assertions: [{ path: "result.evaluated_count", operator: "gte", expected: 0 }],
    },
    {
      node_id: "marketing-audit",
      job_type: "marketing.content.dedupe.audit",
      payload: { items: [] },
      kpi_assertions: [{ path: "result.duplicate_content_groups", operator: "gte", expected: 0 }],
    },
    {
      node_id: "search-priority",
      job_type: "search.defect.prioritize",
      depends_on: ["search-audit"],
      payload: {
        defects: [{ defect_type: "http_error", url: "https://hermeslogisticsus.com/load-board/" }],
        parent_job_id: "synthetic",
      },
      kpi_assertions: [{ path: "result.prioritized_defect_count", operator: "gte", expected: 0 }],
    },
  ],
}, allowed);

assert.equal(graph.routing_mode, "DAG");
assert.equal(graph.nodes.length, 3);
assert.match(graph.graph_sha256, /^[0-9a-f]{64}$/);
assert.equal(graph.nodes.every((node) => node.permission_class === "READ_ONLY"), true);
assert.equal(graph.nodes.every((node) => node.budget_usd === 0), true);

const direct = await normalizeCapabilityGraphInput({
  idempotency_key: "graph:test:direct",
  goal: "Run one bounded Search snapshot.",
  nodes: [{
    node_id: "only",
    job_type: "search.snapshot.evaluate",
    payload: { pages: [] },
    kpi_assertions: [{ path: "result.evaluated_count", operator: "eq", expected: 0 }],
  }],
}, allowed);
assert.equal(direct.routing_mode, "DIRECT", "Simple work must short-circuit to one capability node");

const initial = derivePendingNodeTransitions([
  { node_id: "a", state: "PENDING", depends_on: [] },
  { node_id: "b", state: "PENDING", depends_on: [] },
  { node_id: "c", state: "PENDING", depends_on: ["a"] },
]);
assert.deepEqual(
  initial.map((item) => [item.node_id, item.state]).sort(),
  [["a", "READY"], ["b", "READY"]],
  "Independent roots must become ready together while dependent work waits",
);

const afterFailure = derivePendingNodeTransitions([
  { node_id: "a", state: "FAILED", depends_on: [] },
  { node_id: "b", state: "ACCEPTED", depends_on: [] },
  { node_id: "c", state: "PENDING", depends_on: ["a"] },
  { node_id: "d", state: "PENDING", depends_on: ["b"] },
]);
assert.deepEqual(
  afterFailure.map((item) => [item.node_id, item.state, item.error_class]).sort(),
  [
    ["c", "BLOCKED", "dependency_not_accepted"],
    ["d", "READY", null],
  ],
  "Failed dependency must block only descendants; independent branch continues",
);

const kpis = evaluateKpiAssertions({
  result: {
    count: 2,
    defects: [],
    complete: true,
    label: "ok",
  },
}, [
  { path: "result.count", operator: "gte", expected: 2 },
  { path: "result.defects", operator: "zero" },
  { path: "result.complete", operator: "truthy" },
  { path: "result.label", operator: "nonempty" },
]);
assert.equal(kpis.every((item) => item.passed), true);

assert.equal(deriveGraphState([
  { state: "ACCEPTED" },
  { state: "ACCEPTED" },
]), "ACCEPTED");
assert.equal(deriveGraphState([
  { state: "ACCEPTED" },
  { state: "REPAIR" },
]), "NEEDS_REPAIR");
assert.equal(deriveGraphState([
  { state: "FAILED" },
  { state: "BLOCKED" },
]), "FAILED");
assert.equal(deriveGraphState([
  { state: "ACCEPTED" },
  { state: "DISPATCHED" },
]), "ACTIVE");

await assert.rejects(
  () => normalizeCapabilityGraphInput({
    idempotency_key: "cycle",
    goal: "cycle",
    nodes: [
      { node_id: "a", job_type: "search.snapshot.evaluate", depends_on: ["b"], payload: { pages: [] }, kpi_assertions: [{ path: "result.evaluated_count", operator: "gte", expected: 0 }] },
      { node_id: "b", job_type: "search.snapshot.evaluate", depends_on: ["a"], payload: { pages: [] }, kpi_assertions: [{ path: "result.evaluated_count", operator: "gte", expected: 0 }] },
    ],
  }, allowed),
  /graph_cycle_detected/,
);

await assert.rejects(
  () => normalizeCapabilityGraphInput({
    idempotency_key: "bad-job",
    goal: "bad job",
    nodes: [{ node_id: "x", job_type: "unknown.write", payload: {}, kpi_assertions: [{ path: "x", operator: "truthy" }] }],
  }, allowed),
  /graph_job_type_not_allowed/,
);

await assert.rejects(
  () => normalizeCapabilityGraphInput({
    idempotency_key: "approval",
    goal: "approval not in v1",
    nodes: [{
      node_id: "x",
      job_type: "search.snapshot.evaluate",
      approval_required: true,
      payload: { pages: [] },
      kpi_assertions: [{ path: "result.evaluated_count", operator: "gte", expected: 0 }],
    }],
  }, allowed),
  /graph_approval_not_supported_v1/,
);

assert.equal(CAPABILITY_GRAPH_LIMITS.max_nodes, 16);
assert.equal(CAPABILITY_GRAPH_LIMITS.permission_class, "READ_ONLY");

console.log("HAE capability graph PASS: direct short-circuit + bounded DAG + dependency isolation + KPI verification");
