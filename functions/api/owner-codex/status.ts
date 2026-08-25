import { jsonResponse } from "../_lib/session.mjs";
import {
  ensureOwnerCodexSchema,
  publicTask,
  requireHermesOwner,
} from "../_lib/owner-codex.mjs";

type Env = {
  DB?: any;
  HERMES_OWNER_SPECIALIST_ID?: string;
  HERMES_OWNER_EMAIL?: string;
};

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireHermesOwner(request, env);
  if (owner.response) return owner.response;
  await ensureOwnerCodexSchema(env.DB);

  const runner = await env.DB.prepare(
    `SELECT id, last_seen_at, repo_sha, runtime_version, model, fallback_route FROM owner_codex_runner_state WHERE id = 'mac-owner-runner'`,
  ).first();
  const active = await env.DB.prepare(
    `SELECT * FROM owner_codex_tasks WHERE status IN ('queued','running') ORDER BY created_at ASC LIMIT 1`,
  ).first();
  const latest = await env.DB.prepare(
    `SELECT * FROM owner_codex_tasks ORDER BY created_at DESC LIMIT 1`,
  ).first();

  const lastSeen = runner?.last_seen_at ? Date.parse(runner.last_seen_at) : 0;
  const online = Boolean(lastSeen && Date.now() - lastSeen <= 90000);

  return jsonResponse(200, {
    success: true,
    runtime: {
      online,
      last_seen_at: runner?.last_seen_at || null,
      repo_sha: runner?.repo_sha || null,
      runtime_version: runner?.runtime_version || null,
      model: runner?.model || null,
      fallback_route: runner?.fallback_route || null,
    },
    active_task: publicTask(active),
    latest_task: publicTask(latest),
  });
}
