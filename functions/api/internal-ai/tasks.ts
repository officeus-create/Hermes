import { jsonResponse } from "../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, newTaskId, normalizePrompt, nowIso, publicTask, requireInternalOwner } from "../_lib/internal-ai.mjs";
type Env = { DB?: any };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site" && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  const result = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? ORDER BY created_at DESC LIMIT 30").bind(INTERNAL_AI_ORGANIZATION_SCOPE).all();
  return jsonResponse(200, { success: true, tasks: (result.results || []).map(publicTask) });
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
