import { getAuthenticatedSpecialist, jsonResponse } from "./session.mjs";

const TASK_TYPES = new Set([
  "continue_wave_1",
  "current_priorities",
  "hermes_connect_audit",
  "seo_geo_audit",
  "review_open_prs",
  "custom",
]);

const TASK_STATES = new Set(["queued", "running", "completed", "failed", "cancelled"]);
const MAX_PROMPT_LENGTH = 12000;
const MAX_EVENT_LENGTH = 4000;
const MAX_OUTPUT_LENGTH = 20000;

function configuredOwnerMatch(specialist, env) {
  const configuredId = String(env.HERMES_OWNER_SPECIALIST_ID || "").trim();
  const configuredEmail = String(env.HERMES_OWNER_EMAIL || "").trim().toLowerCase();
  if (!configuredId && !configuredEmail) return false;
  if (configuredId && String(specialist?.id || "") === configuredId) return true;
  if (configuredEmail && String(specialist?.email || "").trim().toLowerCase() === configuredEmail) return true;
  return false;
}

export async function requireHermesOwner(request, env) {
  if (!env.DB) return { response: jsonResponse(503, { success: false, error: "database_not_configured" }) };
  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (!specialist) return { response: jsonResponse(401, { success: false, error: "not_authenticated" }) };
  if (!env.HERMES_OWNER_SPECIALIST_ID && !env.HERMES_OWNER_EMAIL) {
    return { response: jsonResponse(503, { success: false, error: "owner_access_not_configured" }) };
  }
  if (!configuredOwnerMatch(specialist, env)) {
    return { response: jsonResponse(403, { success: false, error: "owner_access_required" }) };
  }
  return { specialist };
}

function timingSafeEqualText(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) mismatch |= (a[index] || 0) ^ (b[index] || 0);
  return mismatch === 0;
}

export function requireRunner(request, env) {
  const expected = String(env.HERMES_CODEX_RUNNER_TOKEN || "");
  if (!expected) return { response: jsonResponse(503, { success: false, error: "runner_not_configured" }) };
  const authorization = request.headers.get("Authorization") || "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!supplied || !timingSafeEqualText(supplied, expected)) {
    return { response: jsonResponse(401, { success: false, error: "runner_auth_required" }) };
  }
  return { ok: true };
}

export async function ensureOwnerCodexSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS owner_codex_tasks (
    id TEXT PRIMARY KEY,
    task_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    updated_at TEXT NOT NULL,
    repo_sha TEXT,
    branch TEXT,
    pr_url TEXT,
    model TEXT,
    fallback_route TEXT,
    evidence_class TEXT,
    output_summary TEXT,
    cancel_requested INTEGER NOT NULL DEFAULT 0,
    runner_id TEXT
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_owner_codex_tasks_status_created ON owner_codex_tasks(status, created_at)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS owner_codex_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_owner_codex_events_task_id ON owner_codex_events(task_id, id)`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS owner_codex_runner_state (
    id TEXT PRIMARY KEY,
    last_seen_at TEXT NOT NULL,
    repo_sha TEXT,
    runtime_version TEXT,
    model TEXT,
    fallback_route TEXT
  )`).run();
}

export function normalizeTaskType(value) {
  const taskType = String(value || "").trim();
  return TASK_TYPES.has(taskType) ? taskType : null;
}

export function normalizePrompt(value) {
  const prompt = String(value || "").trim();
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) return null;
  return prompt;
}

export function sanitizeExecutionText(value, maxLength = MAX_EVENT_LENGTH) {
  let text = String(value || "").replace(/\u0000/g, "").trim();
  text = text
    .replace(/\b(sk-[A-Za-z0-9_-]{10,})\b/g, "[REDACTED_TOKEN]")
    .replace(/\b(gh[pousr]_[A-Za-z0-9_]{10,})\b/g, "[REDACTED_TOKEN]")
    .replace(/\b(AIza[A-Za-z0-9_-]{20,})\b/g, "[REDACTED_TOKEN]")
    .replace(/((?:api[_-]?key|authorization|bearer|token|secret)\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]");
  return text.slice(0, Math.max(1, maxLength));
}

export function sanitizeTaskResult(payload = {}) {
  const status = TASK_STATES.has(payload.status) ? payload.status : "failed";
  return {
    status,
    repo_sha: sanitizeExecutionText(payload.repo_sha, 80) || null,
    branch: sanitizeExecutionText(payload.branch, 180) || null,
    pr_url: sanitizeExecutionText(payload.pr_url, 500) || null,
    model: sanitizeExecutionText(payload.model, 180) || null,
    fallback_route: sanitizeExecutionText(payload.fallback_route, 600) || null,
    evidence_class: sanitizeExecutionText(payload.evidence_class, 100) || null,
    output_summary: sanitizeExecutionText(payload.output_summary, MAX_OUTPUT_LENGTH) || null,
  };
}

export function publicTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    task_type: row.task_type,
    prompt: row.prompt,
    status: row.status,
    created_by: row.created_by,
    created_at: row.created_at,
    started_at: row.started_at,
    completed_at: row.completed_at,
    updated_at: row.updated_at,
    repo_sha: row.repo_sha,
    branch: row.branch,
    pr_url: row.pr_url,
    model: row.model,
    fallback_route: row.fallback_route,
    evidence_class: row.evidence_class,
    output_summary: row.output_summary,
    cancel_requested: Boolean(row.cancel_requested),
  };
}

export function newTaskId() {
  return `hcx_${crypto.randomUUID()}`;
}

export function nowIso() {
  return new Date().toISOString();
}
