import { jsonResponse } from "../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, newTaskId, normalizePrompt, nowIso, publicTask, publicTaskTiming, requireInternalOwner } from "../_lib/internal-ai.mjs";
type Env = { DB?: any };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site" && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  const result = await env.DB.prepare(`SELECT task.*,
    (SELECT event_type FROM hermes_internal_ai_events event WHERE event.organization_scope = task.organization_scope AND event.task_id = task.id ORDER BY event.id DESC LIMIT 1) AS last_event_type,
    (SELECT message FROM hermes_internal_ai_events event WHERE event.organization_scope = task.organization_scope AND event.task_id = task.id ORDER BY event.id DESC LIMIT 1) AS last_event_message,
    (SELECT created_at FROM hermes_internal_ai_events event WHERE event.organization_scope = task.organization_scope AND event.task_id = task.id ORDER BY event.id DESC LIMIT 1) AS last_event_at
    FROM hermes_internal_ai_tasks task WHERE task.organization_scope = ? ORDER BY task.created_at DESC LIMIT 30`).bind(INTERNAL_AI_ORGANIZATION_SCOPE).all();
  const now = Date.now();
  const tasks = (result.results || []).map((row: any) => ({
    ...publicTask(row),
    ...publicTaskTiming(row, now),
    last_event: row.last_event_type ? { type: row.last_event_type, message: row.last_event_message || null, created_at: row.last_event_at || null } : null,
  }));
  return jsonResponse(200, { success: true, tasks, timing_policy: "timestamps_only", progress_policy: "UNKNOWN_without_measured_steps", eta_policy: "UNKNOWN_without_deterministic_history" });
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  let payload: any; try { payload = await request.json(); } catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  const prompt = normalizePrompt(payload?.prompt); if (!prompt) return jsonResponse(400, { success: false, error: "invalid_prompt" });
  const active = await env.DB.prepare("SELECT id FROM hermes_internal_ai_tasks WHERE organization_scope = ? AND status IN ('queued', 'running', 'needs_approval') ORDER BY created_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  if (active) return jsonResponse(409, { success: false, error: "active_task_exists", active_task_id: active.id });
  const id = newTaskId(); const now = nowIso();
  await env.DB.prepare(`INSERT INTO hermes_internal_ai_tasks (id, organization_scope, agent_role, prompt, status, created_by, created_at, updated_at) VALUES (?, ?, 'software_engineer', ?, 'queued', ?, ?, ?)`).bind(id, INTERNAL_AI_ORGANIZATION_SCOPE, prompt, String(owner.specialist.id), now, now).run();
  const row = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ?").bind(id, INTERNAL_AI_ORGANIZATION_SCOPE).first();
  return jsonResponse(201, { success: true, task: publicTask(row) });
}
