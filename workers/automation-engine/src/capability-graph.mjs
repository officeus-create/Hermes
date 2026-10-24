const MAX_GRAPH_NODES = 16;
const MAX_DEPENDENCIES = 8;
const MAX_KPI_ASSERTIONS = 8;
const MAX_NODE_PAYLOAD_BYTES = 16384;

const NODE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/;
const KPI_OPERATORS = new Set(["eq", "gte", "lte", "zero", "nonzero", "truthy", "falsey", "nonempty"]);
const TERMINAL_NODE_STATES = new Set(["ACCEPTED", "REPAIR", "FAILED", "BLOCKED"]);
const BAD_DEPENDENCY_STATES = new Set(["REPAIR", "FAILED", "BLOCKED"]);

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableObject(value[key])]));
  }
  return value;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

function jsonBytes(value) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

function normalizeAssertion(assertion) {
  if (!assertion || typeof assertion !== "object") throw new Error("graph_kpi_assertion_invalid");
  const path = clean(assertion.path, 160);
  const operator = clean(assertion.operator, 40);
  if (!path || !/^[A-Za-z0-9_.-]+$/.test(path)) throw new Error("graph_kpi_path_invalid");
  if (!KPI_OPERATORS.has(operator)) throw new Error("graph_kpi_operator_invalid");
  const normalized = { path, operator };
  if (["eq", "gte", "lte"].includes(operator)) {
    const expected = assertion.expected;
    if (!["string", "number", "boolean"].includes(typeof expected) || !Number.isFinite(expected) && typeof expected === "number") {
      throw new Error("graph_kpi_expected_invalid");
    }
    normalized.expected = expected;
  }
  return normalized;
}

function normalizeNode(node, allowedJobTypes) {
  if (!node || typeof node !== "object") throw new Error("graph_node_invalid");
  const nodeId = clean(node.node_id, 80);
  const jobType = clean(node.job_type, 120);
  if (!NODE_ID_RE.test(nodeId)) throw new Error("graph_node_id_invalid");
  if (!allowedJobTypes.has(jobType)) throw new Error("graph_job_type_not_allowed");
  const dependencies = Array.isArray(node.depends_on) ? node.depends_on.map((value) => clean(value, 80)) : [];
  if (dependencies.length > MAX_DEPENDENCIES) throw new Error("graph_dependencies_too_many");
  if (new Set(dependencies).size !== dependencies.length) throw new Error("graph_dependencies_duplicate");
  if (dependencies.some((value) => !NODE_ID_RE.test(value) || value === nodeId)) throw new Error("graph_dependency_invalid");

  const payload = node.payload ?? {};
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("graph_node_payload_invalid");
  if (jsonBytes(payload) > MAX_NODE_PAYLOAD_BYTES) throw new Error("graph_node_payload_too_large");

  const assertions = Array.isArray(node.kpi_assertions) ? node.kpi_assertions.map(normalizeAssertion) : [];
  if (assertions.length < 1) throw new Error("graph_kpi_assertions_required");
  if (assertions.length > MAX_KPI_ASSERTIONS) throw new Error("graph_kpi_assertions_too_many");

  const approvalRequired = node.approval_required === true;
  if (approvalRequired) throw new Error("graph_approval_not_supported_v1");

  return {
    node_id: nodeId,
    job_type: jobType,
    role_owner: clean(node.role_owner, 160) || null,
    depends_on: dependencies,
    payload,
    kpi_assertions: assertions,
    permission_class: "READ_ONLY",
    approval_required: false,
    budget_usd: 0,
  };
}

function assertAcyclic(nodes) {
  const indegree = new Map(nodes.map((node) => [node.node_id, node.depends_on.length]));
  const children = new Map(nodes.map((node) => [node.node_id, []]));
  for (const node of nodes) {
    for (const dep of node.depends_on) children.get(dep).push(node.node_id);
  }
  const queue = [...nodes.filter((node) => node.depends_on.length === 0).map((node) => node.node_id)].sort();
  let visited = 0;
  while (queue.length) {
    const id = queue.shift();
    visited += 1;
    for (const child of children.get(id) || []) {
      indegree.set(child, indegree.get(child) - 1);
      if (indegree.get(child) === 0) {
        queue.push(child);
        queue.sort();
      }
    }
  }
  if (visited !== nodes.length) throw new Error("graph_cycle_detected");
}

export async function normalizeCapabilityGraphInput(input = {}, allowedJobTypeValues = []) {
  const allowedJobTypes = new Set(allowedJobTypeValues);
  const idempotencyKey = clean(input.idempotency_key, 240);
  const goal = clean(input.goal, 1000);
  if (!idempotencyKey) throw new Error("graph_idempotency_key_required");
  if (!goal) throw new Error("graph_goal_required");
  if (!Array.isArray(input.nodes) || input.nodes.length < 1) throw new Error("graph_nodes_required");
  if (input.nodes.length > MAX_GRAPH_NODES) throw new Error("graph_nodes_too_many");

  const nodes = input.nodes.map((node) => normalizeNode(node, allowedJobTypes));
  const ids = new Set(nodes.map((node) => node.node_id));
  if (ids.size !== nodes.length) throw new Error("graph_node_id_duplicate");
  for (const node of nodes) {
    if (node.depends_on.some((dep) => !ids.has(dep))) throw new Error("graph_dependency_missing");
  }
  assertAcyclic(nodes);

  const canonical = stableObject({
    goal,
    nodes,
  });
  const graphSha256 = await sha256Hex(JSON.stringify(canonical));
  return {
    idempotency_key: idempotencyKey,
    goal,
    graph_sha256: graphSha256,
    routing_mode: nodes.length === 1 ? "DIRECT" : "DAG",
    nodes,
  };
}

function valueAtPath(value, path) {
  let current = value;
  for (const part of String(path || "").split(".")) {
    if (!part) continue;
    if (current == null || typeof current !== "object" || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

export function evaluateKpiAssertions(result, assertions = []) {
  return assertions.map((assertion) => {
    const actual = valueAtPath(result, assertion.path);
    let passed = false;
    if (assertion.operator === "eq") passed = Object.is(actual, assertion.expected);
    else if (assertion.operator === "gte") passed = typeof actual === "number" && actual >= Number(assertion.expected);
    else if (assertion.operator === "lte") passed = typeof actual === "number" && actual <= Number(assertion.expected);
    else if (assertion.operator === "zero") passed = Number(actual) === 0;
    else if (assertion.operator === "nonzero") passed = Number.isFinite(Number(actual)) && Number(actual) !== 0;
    else if (assertion.operator === "truthy") passed = Boolean(actual);
    else if (assertion.operator === "falsey") passed = !actual;
    else if (assertion.operator === "nonempty") {
      passed = typeof actual === "string" ? actual.length > 0 : Array.isArray(actual) ? actual.length > 0 : actual && typeof actual === "object" ? Object.keys(actual).length > 0 : false;
    }
    return {
      path: assertion.path,
      operator: assertion.operator,
      expected: "expected" in assertion ? assertion.expected : undefined,
      actual,
      passed,
    };
  });
}

export function deriveGraphState(nodes = []) {
  if (nodes.length && nodes.every((node) => node.state === "ACCEPTED")) return "ACCEPTED";
  if (nodes.length && nodes.every((node) => TERMINAL_NODE_STATES.has(node.state))) {
    if (nodes.some((node) => node.state === "REPAIR")) return "NEEDS_REPAIR";
    return "FAILED";
  }
  return "ACTIVE";
}

export function derivePendingNodeTransitions(nodes = []) {
  const byId = new Map(nodes.map((node) => [node.node_id, node]));
  const transitions = [];
  for (const node of nodes) {
    if (node.state !== "PENDING") continue;
    const dependencies = node.depends_on || [];
    if (!dependencies.length) {
      transitions.push({ node_id: node.node_id, state: "READY", error_class: null });
      continue;
    }
    const states = dependencies.map((id) => byId.get(id)?.state || "MISSING");
    if (states.some((state) => BAD_DEPENDENCY_STATES.has(state) || state === "MISSING")) {
      transitions.push({ node_id: node.node_id, state: "BLOCKED", error_class: "dependency_not_accepted" });
      continue;
    }
    if (states.every((state) => state === "ACCEPTED")) {
      transitions.push({ node_id: node.node_id, state: "READY", error_class: null });
    }
  }
  return transitions;
}

export async function ensureCapabilityGraphSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_task_graphs (
      graph_id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      goal TEXT NOT NULL,
      graph_sha256 TEXT NOT NULL,
      routing_mode TEXT NOT NULL,
      state TEXT NOT NULL,
      node_count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )
  `).run();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_automation_task_nodes (
      graph_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      job_type TEXT NOT NULL,
      role_owner TEXT,
      state TEXT NOT NULL,
      job_id TEXT UNIQUE,
      depends_json TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      kpi_json TEXT NOT NULL,
      completion_json TEXT,
      error_class TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(graph_id,node_id),
      FOREIGN KEY(graph_id) REFERENCES hermes_automation_task_graphs(graph_id)
    )
  `).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_graphs_state_updated ON hermes_automation_task_graphs(state,updated_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_hae_graph_nodes_state ON hermes_automation_task_nodes(graph_id,state,updated_at)").run();
}

async function readNodes(db, graphId) {
  const rows = await db.prepare(`
    SELECT graph_id,node_id,job_type,role_owner,state,job_id,depends_json,payload_json,kpi_json,
           completion_json,error_class,created_at,updated_at
    FROM hermes_automation_task_nodes
    WHERE graph_id=?
    ORDER BY node_id
  `).bind(graphId).all();
  return (rows?.results || []).map((row) => ({
    ...row,
    depends_on: JSON.parse(String(row.depends_json || "[]")),
    payload: JSON.parse(String(row.payload_json || "{}")),
    kpi_assertions: JSON.parse(String(row.kpi_json || "[]")),
    completion: row.completion_json ? JSON.parse(String(row.completion_json)) : null,
  }));
}

async function updateGraphSummary(db, graphId) {
  const nodes = await readNodes(db, graphId);
  const state = deriveGraphState(nodes);
  const now = new Date().toISOString();
  await db.prepare(`
    UPDATE hermes_automation_task_graphs
    SET state=?,updated_at=?,completed_at=CASE WHEN ?='ACTIVE' THEN NULL ELSE COALESCE(completed_at,?) END
    WHERE graph_id=?
  `).bind(state, now, state, now, graphId).run();
  return { state, nodes };
}

export async function createCapabilityGraph(env, input, allowedJobTypes) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureCapabilityGraphSchema(env.DB);
  const normalized = await normalizeCapabilityGraphInput(input, allowedJobTypes);
  const existing = await env.DB.prepare(
    "SELECT graph_id,graph_sha256,state,routing_mode FROM hermes_automation_task_graphs WHERE idempotency_key=? LIMIT 1"
  ).bind(normalized.idempotency_key).first();
  if (existing) {
    if (String(existing.graph_sha256) !== normalized.graph_sha256) throw new Error("graph_idempotency_conflict");
    return { created: false, duplicate: true, graph_id: existing.graph_id, state: existing.state, routing_mode: existing.routing_mode };
  }

  const graphId = `graph:${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const statements = [
    env.DB.prepare(`
      INSERT INTO hermes_automation_task_graphs
        (graph_id,idempotency_key,goal,graph_sha256,routing_mode,state,node_count,created_at,updated_at)
      VALUES (?,?,?,?,?,'ACTIVE',?,?,?)
    `).bind(graphId, normalized.idempotency_key, normalized.goal, normalized.graph_sha256, normalized.routing_mode, normalized.nodes.length, now, now),
  ];
  for (const node of normalized.nodes) {
    statements.push(env.DB.prepare(`
      INSERT INTO hermes_automation_task_nodes
        (graph_id,node_id,job_type,role_owner,state,depends_json,payload_json,kpi_json,created_at,updated_at)
      VALUES (?,?,?,?, 'PENDING', ?,?,?,?,?)
    `).bind(
      graphId,
      node.node_id,
      node.job_type,
      node.role_owner,
      JSON.stringify(node.depends_on),
      JSON.stringify(node.payload),
      JSON.stringify(node.kpi_assertions),
      now,
      now,
    ));
  }
  await env.DB.batch(statements);
  await advanceCapabilityGraph(env, graphId);
  return { created: true, duplicate: false, graph_id: graphId, state: "ACTIVE", routing_mode: normalized.routing_mode, graph_sha256: normalized.graph_sha256 };
}

export async function advanceCapabilityGraph(env, graphId) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureCapabilityGraphSchema(env.DB);
  const nodes = await readNodes(env.DB, graphId);
  const transitions = derivePendingNodeTransitions(nodes);
  const now = new Date().toISOString();
  if (transitions.length) {
    await env.DB.batch(transitions.map((transition) => env.DB.prepare(
      "UPDATE hermes_automation_task_nodes SET state=?,error_class=?,updated_at=? WHERE graph_id=? AND node_id=? AND state='PENDING'"
    ).bind(transition.state, transition.error_class, now, graphId, transition.node_id)));
  }
  return updateGraphSummary(env.DB, graphId);
}

export async function readyCapabilityGraphNodes(env, graphId) {
  await advanceCapabilityGraph(env, graphId);
  const nodes = await readNodes(env.DB, graphId);
  return nodes.filter((node) => node.state === "READY");
}

export async function bindCapabilityGraphNodeJob(env, graphId, nodeId, jobId) {
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    "UPDATE hermes_automation_task_nodes SET state='DISPATCHED',job_id=?,error_class=NULL,updated_at=? WHERE graph_id=? AND node_id=? AND state='READY'"
  ).bind(jobId, now, graphId, nodeId).run();
  if (Number(result?.meta?.changes || 0) !== 1) throw new Error("graph_node_bind_conflict");
}

export async function markCapabilityGraphNodeDispatchFailure(env, graphId, nodeId, errorClass) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    "UPDATE hermes_automation_task_nodes SET state='FAILED',error_class=?,updated_at=? WHERE graph_id=? AND node_id=? AND state='READY'"
  ).bind(clean(errorClass, 160) || "graph_node_dispatch_failed", now, graphId, nodeId).run();
  await advanceCapabilityGraph(env, graphId);
}

function completionEvidence(result, jobId) {
  const refs = [`job:${jobId}`];
  const role = result?.role_contract;
  if (role?.sha256) refs.push(`role-contract:${String(role.sha256)}`);
  return refs;
}

export async function settleCapabilityGraphNodeForJob(env, {
  job_id,
  job_state,
  result = null,
  error_class = null,
}) {
  if (!env?.DB) return null;
  await ensureCapabilityGraphSchema(env.DB);
  const row = await env.DB.prepare(`
    SELECT graph_id,node_id,job_type,state,kpi_json
    FROM hermes_automation_task_nodes
    WHERE job_id=?
    LIMIT 1
  `).bind(job_id).first();
  if (!row) return null;
  const graphId = String(row.graph_id);
  const nodeId = String(row.node_id);
  const now = new Date().toISOString();

  if (job_state === "WAITING_FREE_AI") {
    await env.DB.prepare(
      "UPDATE hermes_automation_task_nodes SET state='WAITING_FREE_AI',error_class=?,updated_at=? WHERE graph_id=? AND node_id=?"
    ).bind(clean(error_class, 160) || "free_ai_unavailable", now, graphId, nodeId).run();
    await updateGraphSummary(env.DB, graphId);
    return { graph_id: graphId, node_id: nodeId, state: "WAITING_FREE_AI" };
  }

  if (job_state === "FAILED") {
    const completion = {
      status: "FAILED",
      job_id,
      job_type: row.job_type,
      output_ref: null,
      evidence_refs: [`job:${job_id}`],
      kpi_results: [],
      cost_receipt: null,
      error_class: clean(error_class, 160) || "job_failed",
      next_action: "repair_or_replan",
    };
    await env.DB.prepare(
      "UPDATE hermes_automation_task_nodes SET state='FAILED',completion_json=?,error_class=?,updated_at=? WHERE graph_id=? AND node_id=?"
    ).bind(JSON.stringify(completion), completion.error_class, now, graphId, nodeId).run();
    await advanceCapabilityGraph(env, graphId);
    return { graph_id: graphId, node_id: nodeId, state: "FAILED", completion };
  }

  if (job_state !== "SUCCEEDED") return { graph_id: graphId, node_id: nodeId, state: row.state };

  const assertions = JSON.parse(String(row.kpi_json || "[]"));
  const kpiResults = evaluateKpiAssertions(result, assertions);
  const accepted = kpiResults.length > 0 && kpiResults.every((item) => item.passed === true);
  const state = accepted ? "ACCEPTED" : "REPAIR";
  const completion = {
    status: state,
    job_id,
    job_type: row.job_type,
    output_ref: `job:${job_id}:result`,
    evidence_refs: completionEvidence(result, job_id),
    kpi_results: kpiResults,
    cost_receipt: result?.semantic_execution?.usage_id || null,
    error_class: accepted ? null : "kpi_verification_failed",
    next_action: accepted ? null : "repair_same_capability_then_reverify",
  };
  await env.DB.prepare(
    "UPDATE hermes_automation_task_nodes SET state=?,completion_json=?,error_class=?,updated_at=? WHERE graph_id=? AND node_id=?"
  ).bind(state, JSON.stringify(completion), completion.error_class, now, graphId, nodeId).run();
  await advanceCapabilityGraph(env, graphId);
  return { graph_id: graphId, node_id: nodeId, state, completion };
}

export async function getCapabilityGraph(env, graphId) {
  if (!env?.DB) throw new Error("database_not_configured");
  await ensureCapabilityGraphSchema(env.DB);
  const graph = await env.DB.prepare(`
    SELECT graph_id,idempotency_key,goal,graph_sha256,routing_mode,state,node_count,created_at,updated_at,completed_at
    FROM hermes_automation_task_graphs WHERE graph_id=? LIMIT 1
  `).bind(graphId).first();
  if (!graph) return null;
  return { graph, nodes: await readNodes(env.DB, graphId) };
}

export async function listActiveCapabilityGraphIds(env, limit = 20) {
  await ensureCapabilityGraphSchema(env.DB);
  const rows = await env.DB.prepare(
    "SELECT graph_id FROM hermes_automation_task_graphs WHERE state='ACTIVE' ORDER BY updated_at ASC LIMIT ?"
  ).bind(Math.max(1, Math.min(50, Number(limit) || 20))).all();
  return (rows?.results || []).map((row) => String(row.graph_id || "")).filter(Boolean);
}

export async function listCapabilityGraphJobBindings(env, graphId) {
  await ensureCapabilityGraphSchema(env.DB);
  const rows = await env.DB.prepare(`
    SELECT n.graph_id,n.node_id,n.state,n.job_id,j.state AS job_state,j.result_json,j.last_error_class
    FROM hermes_automation_task_nodes n
    LEFT JOIN hermes_automation_jobs j ON j.job_id=n.job_id
    WHERE n.graph_id=? AND n.job_id IS NOT NULL
  `).bind(graphId).all();
  return rows?.results || [];
}

export const CAPABILITY_GRAPH_LIMITS = Object.freeze({
  max_nodes: MAX_GRAPH_NODES,
  max_dependencies: MAX_DEPENDENCIES,
  max_kpi_assertions: MAX_KPI_ASSERTIONS,
  max_payload_bytes: MAX_NODE_PAYLOAD_BYTES,
  permission_class: "READ_ONLY",
});
