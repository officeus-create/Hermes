const MAX_TASKS = 500;
const MAX_DEPENDENCIES = 20;

const SOURCE_KINDS = new Set(["ONE_BRAIN", "GITHUB", "CHATGPT_SELECTED"]);
const STATUSES = new Set(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "UNKNOWN"]);
const PERMISSION_CLASSES = new Set(["READ_ONLY", "DRAFT_ONLY", "EXTERNAL_WRITE", "DESTRUCTIVE", "UNKNOWN"]);
const SOURCE_REF_RE = /^(?:github:\/\/|drive:\/\/|chatgpt-selected:\/\/)/;
const ALLOWED_TASK_FIELDS = new Set([
  "work_id",
  "source_ref",
  "status",
  "priority",
  "updated_at",
  "permission_class",
  "capability_job_type",
  "writer_key",
  "dependencies",
]);

function clean(value, max = 500) {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function timestamp(value, field) {
  const raw = clean(value, 80);
  const parsed = Date.parse(raw);
  if (!raw || !Number.isFinite(parsed)) throw new Error(`work_${field}_invalid`);
  return new Date(parsed).toISOString();
}

function bounded(values, limit = 100) {
  return values.slice(0, limit);
}

export function normalizeWorkPortfolioSnapshot(input = {}) {
  const sourceKind = clean(input.source_kind, 40).toUpperCase();
  const snapshotId = clean(input.snapshot_id, 200);
  const observedAt = timestamp(input.observed_at, "observed_at");
  if (!SOURCE_KINDS.has(sourceKind)) throw new Error("work_source_kind_invalid");
  if (!snapshotId) throw new Error("work_snapshot_id_required");
  if (typeof input.coverage_complete !== "boolean") throw new Error("work_coverage_complete_required");
  if (!Array.isArray(input.tasks)) throw new Error("work_tasks_array_required");
  if (input.tasks.length > MAX_TASKS) throw new Error("work_tasks_too_large");

  const tasks = input.tasks.map((task) => {
    if (!task || typeof task !== "object" || Array.isArray(task)) throw new Error("work_task_invalid");
    for (const field of Object.keys(task)) {
      if (!ALLOWED_TASK_FIELDS.has(field)) throw new Error("work_task_field_not_allowed");
    }
    const workId = clean(task.work_id, 160);
    const sourceRef = clean(task.source_ref, 500);
    const status = clean(task.status, 40).toUpperCase();
    const permissionClass = clean(task.permission_class, 40).toUpperCase() || "UNKNOWN";
    if (typeof task.priority !== "number") throw new Error("work_priority_invalid");
    const priority = task.priority;
    if (!workId) throw new Error("work_id_required");
    if (!sourceRef || !SOURCE_REF_RE.test(sourceRef)) throw new Error("work_source_ref_invalid");
    if (!STATUSES.has(status)) throw new Error("work_status_invalid");
    if (!PERMISSION_CLASSES.has(permissionClass)) throw new Error("work_permission_class_invalid");
    if (!Number.isInteger(priority) || priority < 0 || priority > 100) throw new Error("work_priority_invalid");
    if (!Array.isArray(task.dependencies ?? [])) throw new Error("work_dependencies_array_required");
    if ((task.dependencies ?? []).length > MAX_DEPENDENCIES) throw new Error("work_dependencies_too_large");
    const dependencies = (task.dependencies ?? []).map((value) => {
      const dependency = clean(value, 160);
      if (!dependency) throw new Error("work_dependency_invalid");
      return dependency;
    });
    return {
      work_id: workId,
      source_ref: sourceRef,
      status,
      priority,
      updated_at: timestamp(task.updated_at, "updated_at"),
      permission_class: permissionClass,
      capability_job_type: clean(task.capability_job_type, 120) || null,
      writer_key: clean(task.writer_key, 160) || null,
      dependencies: [...new Set(dependencies)],
    };
  });

  return {
    source_kind: sourceKind,
    snapshot_id: snapshotId,
    observed_at: observedAt,
    coverage_complete: input.coverage_complete,
    tasks,
  };
}

export function reconcileWorkPortfolioSnapshot(input = {}, allowedReadOnlyJobTypes = []) {
  const snapshot = normalizeWorkPortfolioSnapshot(input);
  const allowed = new Set(allowedReadOnlyJobTypes);
  const observedMs = Date.parse(snapshot.observed_at);
  const staleCutoff = observedMs - 7 * 24 * 60 * 60 * 1000;
  const byId = new Map();
  const duplicates = new Set();

  for (const task of snapshot.tasks) {
    if (byId.has(task.work_id)) duplicates.add(task.work_id);
    else byId.set(task.work_id, task);
  }

  const writerGroups = new Map();
  for (const task of byId.values()) {
    if (!task.writer_key || ["DONE", "BLOCKED"].includes(task.status)) continue;
    if (!writerGroups.has(task.writer_key)) writerGroups.set(task.writer_key, []);
    writerGroups.get(task.writer_key).push(task.work_id);
  }
  const writerConflicts = new Set([...writerGroups.values()].filter((ids) => ids.length > 1).flat());

  const unfinished = [];
  const ready = [];
  const blocked = [];
  const stale = [];
  const unknown = [];
  const unresolvedDependencies = [];
  const routingCandidates = [];

  for (const task of byId.values()) {
    if (task.status !== "DONE") unfinished.push(task.work_id);
    if (task.status === "UNKNOWN") unknown.push(task.work_id);
    if (Date.parse(task.updated_at) < staleCutoff) stale.push(task.work_id);
    const dependencyBlocked = task.dependencies.some((dependency) => byId.get(dependency)?.status !== "DONE");
    if (dependencyBlocked) unresolvedDependencies.push(task.work_id);
    const isBlocked = task.status === "BLOCKED" || dependencyBlocked || writerConflicts.has(task.work_id);
    if (isBlocked) blocked.push(task.work_id);
    const isReady = task.status === "TODO" && !isBlocked && !duplicates.has(task.work_id);
    if (!isReady) continue;
    ready.push(task.work_id);
    if (
      snapshot.coverage_complete
      && task.permission_class === "READ_ONLY"
      && task.capability_job_type
      && allowed.has(task.capability_job_type)
      && task.capability_job_type !== "work.portfolio.reconcile"
    ) {
      routingCandidates.push(task.work_id);
    }
  }

  return {
    source_kind: snapshot.source_kind,
    snapshot_id: snapshot.snapshot_id,
    observed_at: snapshot.observed_at,
    coverage_complete: snapshot.coverage_complete,
    coverage_status: snapshot.coverage_complete ? "COMPLETE" : "PARTIAL",
    evaluated_count: snapshot.tasks.length,
    unique_work_count: byId.size,
    unfinished_count: unfinished.length,
    ready_count: ready.length,
    blocked_count: new Set(blocked).size,
    stale_count: stale.length,
    unknown_count: unknown.length,
    duplicate_work_id_count: duplicates.size,
    writer_conflict_count: writerConflicts.size,
    unresolved_dependency_count: unresolvedDependencies.length,
    routing_candidate_count: routingCandidates.length,
    routing_blocked_reason: snapshot.coverage_complete ? null : "PARTIAL_COVERAGE",
    unfinished_work_ids: bounded(unfinished),
    ready_work_ids: bounded(ready),
    blocked_work_ids: bounded([...new Set(blocked)]),
    stale_work_ids: bounded(stale),
    unknown_work_ids: bounded(unknown),
    duplicate_work_ids: bounded([...duplicates]),
    writer_conflict_work_ids: bounded([...writerConflicts]),
    unresolved_dependency_work_ids: bounded(unresolvedDependencies),
    routing_candidate_work_ids: bounded(routingCandidates),
    automatic_execution_performed: false,
    raw_chat_history_persisted: false,
  };
}

export const WORK_PORTFOLIO_LIMITS = Object.freeze({
  max_tasks: MAX_TASKS,
  max_dependencies: MAX_DEPENDENCIES,
  allowed_sources: Object.freeze([...SOURCE_KINDS]),
});
