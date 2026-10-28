import { getAuthenticatedSpecialist, jsonResponse } from "./session.mjs";

export const INTERNAL_AI_ORGANIZATION_SCOPE = "hermes_internal";
const TASK_STATES = new Set(["queued", "running", "completed", "failed", "cancelled", "needs_approval"]);
const APPROVAL_GATES = new Set(["delete_archive", "credentials_secrets", "merge_deploy", "billing_permissions", "external_communication", "legal_commercial", "destructive_database", "material_scope_expansion", "unresolvable_evidence"]);
const MAX_PROMPT_LENGTH = 12000;
const MAX_EVENT_LENGTH = 4000;
const MAX_OUTPUT_LENGTH = 20000;

export async function ensureInternalAiSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_owner_access (
    specialist_id TEXT PRIMARY KEY,
    active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1)),
    capability TEXT NOT NULL DEFAULT 'HERMES_INTERNAL_OWNER' CHECK (capability = 'HERMES_INTERNAL_OWNER'),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_team_view_access (
    specialist_id TEXT PRIMARY KEY,
    active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_team_view_access_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
    actor_specialist_id TEXT NOT NULL,
    target_specialist_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('grant','revoke')),
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_ai_tasks (
    id TEXT PRIMARY KEY,
    organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
    agent_role TEXT NOT NULL DEFAULT 'software_engineer' CHECK (agent_role = 'software_engineer'),
    prompt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','cancelled','needs_approval')),
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    updated_at TEXT NOT NULL,
    repo_sha TEXT,
    branch TEXT,
    pr_url TEXT,
    evidence_class TEXT,
    output_summary TEXT,
    approval_gate TEXT,
    approval_granted_at TEXT,
    approval_granted_by TEXT,
    approval_attempt INTEGER NOT NULL DEFAULT 0,
    cancel_requested INTEGER NOT NULL DEFAULT 0,
    runner_id TEXT
  )`).run();
  const taskColumns = await db.prepare("PRAGMA table_info(hermes_internal_ai_tasks)").all();
  const taskColumnNames = new Set((taskColumns.results || []).map((column) => column.name));
  const optionalTaskColumns = {
    approval_granted_at: "TEXT",
    approval_granted_by: "TEXT",
    approval_attempt: "INTEGER NOT NULL DEFAULT 0",
  };
  for (const [name, definition] of Object.entries(optionalTaskColumns)) {
    if (!taskColumnNames.has(name)) await db.prepare(`ALTER TABLE hermes_internal_ai_tasks ADD COLUMN ${name} ${definition}`).run();
  }
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_internal_ai_tasks_scope_status_created ON hermes_internal_ai_tasks(organization_scope, status, created_at)").run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_ai_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
    task_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_internal_ai_events_scope_task ON hermes_internal_ai_events(organization_scope, task_id, id)").run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_internal_ai_runner_state (
    id TEXT PRIMARY KEY,
    organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
    last_seen_at TEXT NOT NULL,
    repo_sha TEXT,
    runtime_version TEXT,
    telemetry_json TEXT
  )`).run();
  const runnerColumns = await db.prepare("PRAGMA table_info(hermes_internal_ai_runner_state)").all();
  const runnerColumnNames = new Set((runnerColumns.results || []).map((column) => column.name));
  if (!runnerColumnNames.has("telemetry_json")) await db.prepare("ALTER TABLE hermes_internal_ai_runner_state ADD COLUMN telemetry_json TEXT").run();
}

export async function requireInternalOwner(request, env) {
  if (!env.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  await ensureInternalAiSchema(env.DB);
  const access = await env.DB.prepare(`SELECT specialist_id, capability FROM hermes_internal_owner_access WHERE specialist_id = ? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER' LIMIT 1`).bind(specialist.id).first();
  if (!access) return { response: jsonResponse(403, { success: false, error: "hermes_internal_owner_required" }) };
  return { specialist, access };
}

export async function requireInternalAiViewer(request, env) {
  if (!env.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  await ensureInternalAiSchema(env.DB);
  const ownerAccess = await env.DB.prepare("SELECT specialist_id FROM hermes_internal_owner_access WHERE specialist_id = ? AND active = 1 AND capability = 'HERMES_INTERNAL_OWNER' LIMIT 1").bind(specialist.id).first();
  if (ownerAccess) return { specialist, access_level: "owner" };
  const teamAccess = await env.DB.prepare("SELECT specialist_id FROM hermes_internal_team_view_access WHERE specialist_id = ? AND active = 1 LIMIT 1").bind(specialist.id).first();
  if (!teamAccess) return { response: jsonResponse(403, { success: false, error: "hermes_internal_view_required" }) };
  return { specialist, access_level: "team" };
}

function timingSafeEqualText(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) mismatch |= (a[index] || 0) ^ (b[index] || 0);
  return mismatch === 0;
}

export function requireInternalAiRunner(request, env) {
  const expected = String(env.HERMES_INTERNAL_AI_RUNNER_TOKEN || "");
  if (!expected) return { response: jsonResponse(503, { success: false, error: "internal_ai_runner_not_configured" }) };
  const authorization = request.headers.get("Authorization") || "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!supplied || !timingSafeEqualText(supplied, expected)) return { response: jsonResponse(401, { success: false, error: "runner_auth_required" }) };
  return { ok: true };
}

export const nowIso = () => new Date().toISOString();
export const newTaskId = () => `hcai_${crypto.randomUUID()}`;
export function internalAiTaskBranch(taskId) {
  const safe = Array.from(String(taskId || ""), (character) => /[A-Za-z0-9_-]/.test(character) ? character : "-").join("").slice(0, 80);
  return `internal-ai/${safe || "task"}`;
}
export const normalizePrompt = (value) => { const prompt = String(value || "").replace(/\u0000/g, "").trim(); return prompt && prompt.length <= MAX_PROMPT_LENGTH ? prompt : null; };
export function normalizeApprovalGate(value) { const gate = String(value || "").trim(); return APPROVAL_GATES.has(gate) ? gate : null; }
export function sanitizeExecutionText(value, maxLength = MAX_EVENT_LENGTH) {
  return String(value || "").replace(/\u0000/g, "").trim()
    .replace(/\b(sk-[A-Za-z0-9_-]{10,})\b/g, "[REDACTED_TOKEN]")
    .replace(/\b(gh[pousr]_[A-Za-z0-9_]{10,})\b/g, "[REDACTED_TOKEN]")
    .replace(/\b(AIza[A-Za-z0-9_-]{20,})\b/g, "[REDACTED_TOKEN]")
    .replace(/((?:api[_-]?key|authorization|bearer|token|secret|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]")
    .slice(0, Math.max(1, maxLength));
}
function boundedRunnerCount(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 1000000000 ? number : null;
}
export function sanitizeRunnerTelemetry(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const autonomySource = value.autonomy && typeof value.autonomy === "object" && !Array.isArray(value.autonomy) ? value.autonomy : {};
  const autonomy = {
    cooldown_skipped: boundedRunnerCount(autonomySource.cooldown_skipped),
    manifest_scanned: boundedRunnerCount(autonomySource.manifest_scanned),
    external_actions: boundedRunnerCount(autonomySource.external_actions),
    provider_writes: boundedRunnerCount(autonomySource.provider_writes),
  };
  const telemetry = {
    status: sanitizeExecutionText(value.status, 48) || null,
    phase: sanitizeExecutionText(value.phase, 120) || null,
    cycle: boundedRunnerCount(value.cycle),
    current_task: sanitizeExecutionText(value.current_task, 700) || null,
    next_action: sanitizeExecutionText(value.next_action, 900) || null,
    model: sanitizeExecutionText(value.model, 120) || null,
    last_training_phase: sanitizeExecutionText(value.last_training_phase, 120) || null,
    last_training_task: sanitizeExecutionText(value.last_training_task, 700) || null,
    autonomy,
  };
  const hasAutonomy = Object.values(autonomy).some((entry) => entry !== null);
  const hasValue = Object.entries(telemetry).some(([key, entry]) => key !== "autonomy" && entry !== null);
  return hasValue || hasAutonomy ? telemetry : null;
}
export function parseRunnerTelemetry(value) {
  if (!value) return null;
  try {
    return sanitizeRunnerTelemetry(JSON.parse(String(value)));
  } catch {
    return null;
  }
}

export function sanitizeTaskResult(payload = {}) {
  const status = TASK_STATES.has(payload.status) ? payload.status : "failed";
  return {
    status,
    repo_sha: sanitizeExecutionText(payload.repo_sha, 80) || null,
    branch: sanitizeExecutionText(payload.branch, 180) || null,
    pr_url: sanitizeExecutionText(payload.pr_url, 500) || null,
    evidence_class: sanitizeExecutionText(payload.evidence_class, 100) || null,
    output_summary: sanitizeExecutionText(payload.output_summary, MAX_OUTPUT_LENGTH) || null,
    approval_gate: normalizeApprovalGate(payload.approval_gate),
  };
}
export function publicTask(row) {
  if (!row) return null;
  return { id: row.id, organization_scope: row.organization_scope, agent_role: row.agent_role, status: row.status, created_at: row.created_at, started_at: row.started_at, completed_at: row.completed_at, updated_at: row.updated_at, repo_sha: row.repo_sha, branch: row.branch, pr_url: row.pr_url, evidence_class: row.evidence_class, output_summary: row.output_summary, approval_gate: row.approval_gate, approval_state: row.status === "needs_approval" ? "awaiting_approval" : row.approval_granted_at ? "approved" : null, approval_granted_at: row.approval_granted_at || null, approval_attempt: Number(row.approval_attempt || 0), cancel_requested: Boolean(row.cancel_requested) };
}
export function publicTaskTiming(row, now = Date.now()) {
  const started = row?.started_at ? Date.parse(row.started_at) : NaN;
  const completed = row?.completed_at ? Date.parse(row.completed_at) : NaN;
  const validStarted = Number.isFinite(started);
  const validCompleted = Number.isFinite(completed) && validStarted && completed >= started;
  const elapsedEnd = validCompleted ? completed : now;
  const elapsedSeconds = validStarted && Number.isFinite(elapsedEnd) && elapsedEnd >= started ? Math.floor((elapsedEnd - started) / 1000) : null;
  return {
    elapsed_seconds: elapsedSeconds,
    duration_seconds: validCompleted ? elapsedSeconds : null,
    progress_percent: null,
    eta: null,
    eta_label: "UNKNOWN",
  };
}
export function runnerTask(row) {
  const task = publicTask(row);
  return task ? { ...task, prompt: row.prompt } : null;
}

export async function decideInternalAiTask(db, { taskId, action, requestedGate, ownerId, now = nowIso() }) {
  const getTask = () => db.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ?").bind(taskId, INTERNAL_AI_ORGANIZATION_SCOPE).first();
  let row = await getTask();
  if (!row) return { status: 404, body: { success: false, error: "task_not_found" } };

  if (action === "approve") {
    const storedGate = normalizeApprovalGate(row.approval_gate);
    const suppliedGate = normalizeApprovalGate(requestedGate);
    if (!storedGate || suppliedGate !== storedGate) return { status: 409, body: { success: false, error: "approval_gate_mismatch", task: publicTask(row) } };
    if (["queued", "running"].includes(row.status) && row.approval_granted_at) {
      return { status: 200, body: { success: true, state: "already_approved", task: publicTask(row) } };
    }
    if (row.status !== "needs_approval" || row.cancel_requested) {
      return { status: 409, body: { success: false, error: "task_not_awaiting_approval", task: publicTask(row) } };
    }
    const update = await db.prepare(`UPDATE hermes_internal_ai_tasks
      SET status = 'queued', completed_at = NULL, updated_at = ?, approval_granted_at = ?, approval_granted_by = ?, approval_attempt = COALESCE(approval_attempt, 0) + 1
      WHERE id = ? AND organization_scope = ? AND status = 'needs_approval' AND approval_gate = ? AND cancel_requested = 0`)
      .bind(now, now, String(ownerId), taskId, INTERNAL_AI_ORGANIZATION_SCOPE, storedGate).run();
    if (!update?.meta?.changes) {
      row = await getTask();
      if (["queued", "running"].includes(row?.status) && row?.approval_granted_at && normalizeApprovalGate(row?.approval_gate) === storedGate) {
        return { status: 200, body: { success: true, state: "already_approved", task: publicTask(row) } };
      }
      return { status: 409, body: { success: false, error: "approval_state_changed", task: publicTask(row) } };
    }
    await db.prepare("INSERT INTO hermes_internal_ai_events (organization_scope, task_id, event_type, message, created_at) VALUES (?, ?, 'approval_granted', ?, ?)")
      .bind(INTERNAL_AI_ORGANIZATION_SCOPE, taskId, `Owner approved only the ${storedGate} gate for this task.`, now).run();
    row = await getTask();
    return { status: 200, body: { success: true, state: "approved", task: publicTask(row) } };
  }

  if (action === "cancel") {
    if (row.status === "cancelled") return { status: 200, body: { success: true, state: "already_cancelled", task: publicTask(row) } };
    if (["completed", "failed"].includes(row.status)) return { status: 409, body: { success: false, error: "task_already_terminal", task: publicTask(row) } };
    const update = await db.prepare(`UPDATE hermes_internal_ai_tasks
      SET status = CASE WHEN status IN ('queued','needs_approval') THEN 'cancelled' ELSE status END,
          cancel_requested = 1,
          completed_at = CASE WHEN status IN ('queued','needs_approval') THEN ? ELSE completed_at END,
          updated_at = ?
      WHERE id = ? AND organization_scope = ? AND status IN ('queued','needs_approval','running') AND cancel_requested = 0`)
      .bind(now, now, taskId, INTERNAL_AI_ORGANIZATION_SCOPE).run();
    row = await getTask();
    if (!update?.meta?.changes) {
      if (row?.status === "cancelled") return { status: 200, body: { success: true, state: "already_cancelled", task: publicTask(row) } };
      if (row?.status === "running" && row?.cancel_requested) return { status: 200, body: { success: true, state: "already_cancel_requested", task: publicTask(row) } };
      if (["completed", "failed"].includes(row?.status)) return { status: 409, body: { success: false, error: "task_already_terminal", task: publicTask(row) } };
      return { status: 409, body: { success: false, error: "cancellation_state_changed", task: publicTask(row) } };
    }
    const state = row?.status === "cancelled" ? "cancelled" : row?.status === "running" && row?.cancel_requested ? "cancel_requested" : null;
    if (!state) return { status: 409, body: { success: false, error: "cancellation_state_changed", task: publicTask(row) } };
    await db.prepare("INSERT INTO hermes_internal_ai_events (organization_scope, task_id, event_type, message, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(INTERNAL_AI_ORGANIZATION_SCOPE, taskId, state === "cancelled" ? "task_cancelled" : "cancel_requested", state === "cancelled" ? "Owner cancelled the task before runner execution." : "Owner requested cancellation of the running task.", now).run();
    return { status: 200, body: { success: true, state, task: publicTask(row) } };
  }

  return { status: 400, body: { success: false, error: "unsupported_action" } };
}
