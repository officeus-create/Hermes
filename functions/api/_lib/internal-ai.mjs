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
    cancel_requested INTEGER NOT NULL DEFAULT 0,
    runner_id TEXT
  )`).run();
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
    runtime_version TEXT
  )`).run();
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
  return { id: row.id, organization_scope: row.organization_scope, agent_role: row.agent_role, prompt: row.prompt, status: row.status, created_at: row.created_at, started_at: row.started_at, completed_at: row.completed_at, updated_at: row.updated_at, repo_sha: row.repo_sha, branch: row.branch, pr_url: row.pr_url, evidence_class: row.evidence_class, output_summary: row.output_summary, approval_gate: row.approval_gate, cancel_requested: Boolean(row.cancel_requested) };
}
