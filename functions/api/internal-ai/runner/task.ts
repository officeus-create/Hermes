import { jsonResponse } from "../../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, nowIso, publicTask, requireInternalAiRunner } from "../../_lib/internal-ai.mjs";
type Env = { DB?: any; HERMES_INTERNAL_AI_RUNNER_TOKEN?: string };
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = requireInternalAiRunner(request, env); if (auth.response) return auth.response; if (!env.DB) return jsonResponse(503, { success: false, error: "database_not_configured" }); const id = new URL(request.url).searchParams.get("id") || ""; if (!id) return jsonResponse(400, { success: false, error: "task_id_required" });
  await env.DB.prepare("UPDATE hermes_internal_ai_runner_state SET last_seen_at = ? WHERE id = 'internal-ai-mac-runner' AND organization_scope = ?").bind(nowIso(), INTERNAL_AI_ORGANIZATION_SCOPE).run(); const row = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE id = ? AND organization_scope = ?").bind(id, INTERNAL_AI_ORGANIZATION_SCOPE).first(); if (!row) return jsonResponse(404, { success: false, error: "task_not_found" }); return jsonResponse(200, { success: true, task: publicTask(row) });
}
