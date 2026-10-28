import { jsonResponse } from "../_lib/session.mjs";
import { ensureCommandCenterSchema, reconcileWorkItems } from "../_lib/internal-command-center.mjs";
import { developmentCatalog, executionProjection, linkHumanWorkDevelopments } from "../_lib/command-center-execution-map.mjs";
import { readClickUpHumanTasks } from "../_lib/command-center-clickup.mjs";
import { readGithubDevelopments } from "../_lib/command-center-github.mjs";
import { parseRunnerTelemetry, requireInternalOwner } from "../_lib/internal-ai.mjs";
import { ensureHaeProcessSchema, publicHaeProcess } from "../../../src/lib/hae-process-control.mjs";
import { pluginRuntimeRegistryEvidenceStatus, pluginRuntimeRegistrySnapshot } from "../../../workers/automation-engine/src/plugin-runtime-registry.mjs";

type Env = { DB?: any; CLICKUP_API_TOKEN?: string; HERMES_CLICKUP_COMPLETION_LIST_ID?: string; HERMES_GITHUB_READ_TOKEN?: string; GITHUB_READ_TOKEN?: string };
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const owner = await requireInternalOwner(request, env); if (owner.response) return owner.response;
  await ensureCommandCenterSchema(env.DB);
  await ensureHaeProcessSchema(env.DB);
  await reconcileWorkItems(env.DB);

  const work = await env.DB.prepare(`SELECT w.*,
    t.status AS linked_task_status, t.started_at AS linked_task_started_at, t.updated_at AS linked_task_updated_at,
    t.agent_role AS linked_task_agent_role, t.repo_sha AS linked_task_repo_sha, t.branch AS linked_task_branch,
    t.pr_url AS linked_task_pr_url, t.evidence_class AS linked_task_evidence_class,
    t.output_summary AS linked_task_output_summary, t.approval_gate AS linked_task_approval_gate
    FROM hermes_owner_work_items w
    LEFT JOIN hermes_internal_ai_tasks t ON t.id=w.linked_task_id AND t.organization_scope=w.organization_scope
    WHERE w.organization_scope='hermes_internal'
    ORDER BY CASE w.status WHEN 'in_progress' THEN 0 WHEN 'ready' THEN 1 WHEN 'planned' THEN 2 WHEN 'blocked' THEN 3 WHEN 'done' THEN 4 ELSE 5 END,
      CASE w.priority WHEN 'p0' THEN 0 WHEN 'p1' THEN 1 WHEN 'p2' THEN 2 ELSE 3 END,
      w.updated_at DESC LIMIT 100`).all();

  const processRows = await env.DB.prepare(`SELECT p.*, j.state AS last_job_state, j.completed_at AS last_job_completed_at,
    j.last_error_class AS last_job_error_class
    FROM hermes_automation_processes p
    LEFT JOIN hermes_automation_jobs j ON j.job_id=p.last_job_id
    WHERE p.organization_scope='hermes_internal'
    ORDER BY CASE p.status WHEN 'active' THEN 0 WHEN 'blocked' THEN 1 ELSE 2 END, p.updated_at DESC`).all()
    .catch(async () => env.DB.prepare("SELECT * FROM hermes_automation_processes WHERE organization_scope='hermes_internal' ORDER BY updated_at DESC").all());

  const runnerRow = await env.DB.prepare("SELECT id,last_seen_at,repo_sha,runtime_version,telemetry_json FROM hermes_internal_ai_runner_state WHERE id='internal-ai-mac-runner' AND organization_scope='hermes_internal' LIMIT 1").first();
  const lastSeen = runnerRow?.last_seen_at ? Date.parse(String(runnerRow.last_seen_at)) : 0;
  const runner = {
    online: Boolean(lastSeen && Date.now() - lastSeen <= 90000),
    last_seen_at: runnerRow?.last_seen_at || null,
    repo_sha: runnerRow?.repo_sha || null,
    runtime_version: runnerRow?.runtime_version || null,
    operations: parseRunnerTelemetry(runnerRow?.telemetry_json),
  };

  const registrySnapshot = pluginRuntimeRegistrySnapshot();
  const registryEvidence = pluginRuntimeRegistryEvidenceStatus(new Date().toISOString());
  const processes = (processRows.results || []).map(publicHaeProcess);
  const tasks = (work.results || []).map((item) => executionProjection(item, registrySnapshot.entries));
  const developments = developmentCatalog({ registrySnapshot, registryEvidence, processes, runner });
  const [human_work_raw, github_developments] = await Promise.all([readClickUpHumanTasks(env), readGithubDevelopments(env)]);
  const human_work = linkHumanWorkDevelopments(human_work_raw, github_developments);

  return jsonResponse(200, {
    success: true,
    read_model_owner: "hermes-business-command-center",
    source_policy: "AGGREGATE_CANONICAL_OWNERS_NO_SECOND_TASK_DB",
    checked_at: new Date().toISOString(),
    stage_policy: "QA_PASS, LIVE and BUSINESS_RESULT remain UNKNOWN without separate evidence.",
    tasks,
    developments,
    human_work,
    github_developments,
    registry_evidence: registryEvidence,
  }, headers);
}
