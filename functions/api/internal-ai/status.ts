import { jsonResponse } from "../_lib/session.mjs";
import { INTERNAL_AI_ORGANIZATION_SCOPE, INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID, publicRunnerState, publicTask, requireInternalOwner } from "../_lib/internal-ai.mjs";
type Env = { DB?: any };
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  const runnerResult = await env.DB.prepare("SELECT * FROM hermes_internal_ai_runner_state WHERE organization_scope = ? ORDER BY last_seen_at DESC").bind(INTERNAL_AI_ORGANIZATION_SCOPE).all();
  const active = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? AND status IN ('queued','running','needs_approval') ORDER BY created_at ASC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  const latest = await env.DB.prepare("SELECT * FROM hermes_internal_ai_tasks WHERE organization_scope = ? ORDER BY created_at DESC LIMIT 1").bind(INTERNAL_AI_ORGANIZATION_SCOPE).first();
  const runners = (runnerResult.results || []).map((row: any) => publicRunnerState(row)).filter(Boolean);
  const activeRunner = active?.runner_id ? runners.find((runner: any) => runner.id === active.runner_id) : null;
  const taskCapableRunner = activeRunner || runners.find((runner: any) => runner.online && runner.accept_tasks) || null;
  const visibleRunner = taskCapableRunner || runners.find((runner: any) => runner.online) || runners[0] || null;
  const primaryExecutor = taskCapableRunner?.id === INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID ? "windows" : taskCapableRunner ? "mac" : "unknown";
  return jsonResponse(200, {
    success: true,
    runtime: {
      online: Boolean(visibleRunner?.online),
      last_seen_at: visibleRunner?.last_seen_at || null,
      repo_sha: visibleRunner?.repo_sha || null,
      runtime_version: visibleRunner?.runtime_version || null,
      primary_executor: primaryExecutor,
      primary_executor_verified: Boolean(taskCapableRunner?.online && taskCapableRunner?.accept_tasks),
      task_executor_ready: Boolean(taskCapableRunner?.online && taskCapableRunner?.accept_tasks),
      runner_id: visibleRunner?.id || null,
      executor_type: visibleRunner?.executor_type || (visibleRunner?.id === INTERNAL_AI_WINDOWS_VIKTOR_RUNNER_ID ? "windows" : visibleRunner ? "mac" : "unknown"),
      display_name: visibleRunner?.display_name || null,
      current_task: visibleRunner?.current_task || null,
      phase: visibleRunner?.phase || null,
      last_result: visibleRunner?.last_result || null,
      blocker: visibleRunner?.blocker || null,
      accept_tasks: Boolean(visibleRunner?.accept_tasks),
      runners,
      remote_browser_to_codex: "UNVERIFIED",
    },
    active_task: publicTask(active),
    latest_task: publicTask(latest),
  });
}
