import { jsonResponse } from "../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, publicTask, requireInternalOwner } from "../_lib/internal-ai.mjs";
type Env = { DB?: any };
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  const runner = await env.DB.prepare("SELECT id, last_seen_at, repo_sha, runtime_version FROM hermes_internal_ai_runner_state WHERE id = 'internal-ai-mac-runner' AND organization_scope = ?").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  const active = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? AND status IN ('queued','running','needs_approval') ORDER BY created_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  const latest = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? ORDER BY created_at DESC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  const lastSeen = runner?.last_seen_at ? Date.parse(runner.last_seen_at) : 0;
  return jsonResponse(200, { success: true, runtime: { online: Boolean(lastSeen && Date.now() - lastSeen <= 90000), last_seen_at: runner?.last_seen_at || null, repo_sha: runner?.repo_sha || null, runtime_version: runner?.runtime_version || null, remote_browser_to_codex: "UNVERIFIED" }, active_task: publicTask(active), latest_task: publicTask(latest) });
}
