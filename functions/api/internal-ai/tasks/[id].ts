import { jsonResponse } from "../../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso, publicTask, requireInternalOwner } from "../../_lib/internal-ai.mjs";
type Env = { DB?: any }; type Context = { request: Request; env: Env; params: { id?: string } };
const sameOriginMutation = (request: Request) => request.headers.get("Sec-Fetch-Site") !== "cross-site" && (!request.headers.get("Origin") || request.headers.get("Origin") === new URL(request.url).origin);
const getTask = (db: any, id: string) => db.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ?").bind(id, INTERNAL_AI_ORGANIZATION_SCOPE).first();
export async function onRequestGet({ request, env, params }: Context) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response; const id = params.id || ""; const row = await getTask(env.DB, id);
  if (!row) return jsonResponse(404, { success: false, error: "task_not_found" });
  const events = await env.DB.prepare("SELECT id, event_type, message, created_at FROM hermes_internal_ai_events WHERE task_id = ? AND organization_scope = ? ORDER BY id ASC LIMIT 200").bind(id, INTERNAL_AI_ORGANIZATION_SCOPE).all();
  return jsonResponse(200, { success: true, task: publicTask(row), events: events.results || [] });
}
export async function onRequestPatch({ request, env, params }: Context) {
  if (!sameOriginMutation(request)) return jsonResponse(403, { success: false, error: "csrf_origin_mismatch" });
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response; let payload: any; try { payload = await request.json(); } catch { return jsonResponse(400, { success: false, error: "invalid_json" }); }
  if (payload?.action !== "cancel") return jsonResponse(400, { success: false, error: "unsupported_action" }); const row = await getTask(env.DB, params.id || "");
  if (!row) return jsonResponse(404, { success: false, error: "task_not_found" }); if (["completed", "failed", "cancelled"].includes(row.status)) return jsonResponse(409, { success: false, error: "task_already_terminal", task: publicTask(row) });
  const now = nowIso();
  if (["queued", "needs_approval"].includes(row.status)) await env.DB.prepare("UPDATE hermes_internal_ai_tasks SET status = 'cancelled', cancel_requested = 1, completed_at = ?, updated_at = ? WHERE id = ? AND organization_scope = ?").bind(now, now, row.id, INTERNAL_AI_ORGANIZATION_SCOPE).run();
  else await env.DB.prepare("UPDATE hermes_internal_ai_tasks SET cancel_requested = 1, updated_at = ? WHERE id = ? AND organization_scope = ?").bind(now, row.id, INTERNAL_AI_ORGANIZATION_SCOPE).run();
  return jsonResponse(200, { success: true, task: publicTask(await getTask(env.DB, row.id)) });
}
