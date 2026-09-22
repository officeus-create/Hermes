import { jsonResponse } from "../../_lib/session.mjs";
import { decideInternalAiTask, INTERNAL_AI_ORGANIZATION_SCOPE, publicTask, requireInternalOwner } from "../../_lib/internal-ai.mjs";
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
  const decision = await decideInternalAiTask(env.DB, {
    taskId: params.id || "",
    action: payload?.action,
    requestedGate: payload?.approval_gate,
    ownerId: owner.specialist.id,
  });
  return jsonResponse(decision.status, decision.body);
}
