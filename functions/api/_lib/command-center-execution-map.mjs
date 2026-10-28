const WORKSTREAM_CAPABILITIES = Object.freeze({
  marketing: Object.freeze(["hermes-agent-coordinator","hermes-marketing-growth","hermes-search-growth"]),
  logistics: Object.freeze(["hermes-agent-coordinator","hermes-dispatch-os"]),
  sales: Object.freeze(["hermes-agent-coordinator"]),
  technology: Object.freeze(["hermes-agent-coordinator","hermes-technology-developer","hermes-automatic-engineer","hermes-qa-evidence-auditor","hermes-knowledge-curator"]),
  academy: Object.freeze(["hermes-agent-coordinator","hermes-academy"]),
  finance: Object.freeze(["hermes-agent-coordinator"]),
  operations: Object.freeze(["hermes-agent-coordinator","hermes-automatic-engineer","hermes-qa-evidence-auditor","hermes-knowledge-curator"]),
});

const terminalTask = new Set(["completed","failed","cancelled"]);

export function eligibleCapabilitiesForWorkstream(workstream, registryEntries = []) {
  const available = new Map((registryEntries || []).map((entry) => [String(entry.role_id || ""), entry]));
  return (WORKSTREAM_CAPABILITIES[String(workstream || "")] || []).map((roleId) => {
    const observed = available.get(roleId);
    return {
      role_id: roleId,
      plugin_version: observed?.plugin_version || null,
      observed_at: observed?.observed_at || null,
      assignment_state: "ELIGIBLE_NOT_ASSIGNED",
    };
  });
}

export function stageChainForWorkItem(item = {}) {
  const linked = Boolean(item.linked_task_id);
  const taskStatus = String(item.linked_task_status || "");
  const accepted = String(item.status) === "done" && String(item.acceptance_status || "") === "accepted";
  const started = linked && (Boolean(item.linked_task_started_at) || ["running","completed","failed","cancelled","needs_approval"].includes(taskStatus));
  const executed = linked && taskStatus === "completed";
  return [
    { stage: "ASSIGNED", state: linked ? "done" : "pending" },
    { stage: "STARTED", state: started ? "done" : linked ? "pending" : "unknown" },
    { stage: "EXECUTED", state: executed ? "done" : terminalTask.has(taskStatus) ? "not_passed" : linked ? "pending" : "unknown" },
    { stage: "QA_PASS", state: "unknown" },
    { stage: "ACCEPTED", state: accepted ? "done" : executed ? "pending" : "unknown" },
    { stage: "LIVE", state: "unknown" },
    { stage: "BUSINESS_RESULT", state: "unknown" },
  ];
}

export function currentStageForWorkItem(item = {}) {
  if (String(item.status) === "done" && String(item.acceptance_status || "") === "accepted") return "ACCEPTED";
  if (String(item.status) === "blocked" || ["failed","cancelled"].includes(String(item.linked_task_status || ""))) return "BLOCKED";
  if (String(item.linked_task_status || "") === "completed") return "EXECUTED";
  if (String(item.linked_task_status || "") === "needs_approval") return "OWNER_GATE";
  if (String(item.linked_task_status || "") === "running") return "STARTED";
  if (String(item.linked_task_status || "") === "queued") return "ASSIGNED";
  if (String(item.status) === "ready") return "READY";
  return "PLANNED";
}

export function nextActionForWorkItem(item = {}) {
  const taskStatus = String(item.linked_task_status || "");
  if (String(item.status) === "done") return "Accepted owner result. LIVE and BUSINESS_RESULT require separate evidence.";
  if (String(item.status) === "blocked") return item.blocked_reason ? `Resolve blocker: ${item.blocked_reason}` : "Resolve the blocker before retrying.";
  if (taskStatus === "needs_approval") return item.linked_task_approval_gate
    ? `Owner decision required for gate: ${item.linked_task_approval_gate}`
    : "Owner approval is required before execution can continue.";
  if (taskStatus === "running") return "Wait for the current execution receipt; do not start a duplicate writer.";
  if (taskStatus === "queued") return "Wait for the existing Hermes AI runner to claim the queued task.";
  if (taskStatus === "completed") return "Review the execution evidence, then Accept result or request rework.";
  if (taskStatus === "failed" || taskStatus === "cancelled") return "Review evidence, correct the blocker and dispatch a new bounded attempt.";
  if (String(item.status) === "ready") return "Dispatch when the single active Internal AI slot is free.";
  return "Review the task, then mark Ready or dispatch it through the existing Internal AI path.";
}

export function executionProjection(item = {}, registryEntries = []) {
  const linked = Boolean(item.linked_task_id);
  const taskRole = linked ? String(item.linked_task_agent_role || "software_engineer") : null;
  return {
    id: String(item.id || ""),
    title: String(item.title || ""),
    workstream: String(item.workstream || ""),
    priority: String(item.priority || ""),
    owner_status: String(item.status || ""),
    acceptance_status: String(item.acceptance_status || "not_required"),
    work_id: linked ? String(item.linked_task_id) : null,
    current_stage: currentStageForWorkItem(item),
    stage_chain: stageChainForWorkItem(item),
    executor: {
      surface: linked ? "INTERNAL_AI" : "UNASSIGNED",
      agent_role: taskRole,
      plugin_role_id: null,
      plugin_version: null,
      assignment_truth: linked ? "LEGACY_INTERNAL_AI_ROLE" : "NOT_ASSIGNED",
    },
    eligible_capabilities: eligibleCapabilitiesForWorkstream(item.workstream, registryEntries),
    evidence: {
      repo_sha: item.linked_task_repo_sha || null,
      branch: item.linked_task_branch || null,
      pr_url: item.linked_task_pr_url || null,
      evidence_class: item.linked_task_evidence_class || null,
      output_summary: item.linked_task_output_summary || null,
      task_updated_at: item.linked_task_updated_at || null,
    },
    approval: {
      gate: item.linked_task_approval_gate || null,
      state: taskRole && String(item.linked_task_status || "") === "needs_approval" ? "AWAITING_OWNER" : null,
    },
    blocker: item.blocked_reason || null,
    next_action: nextActionForWorkItem(item),
    live_state: "UNKNOWN",
    business_result_state: "UNKNOWN",
    updated_at: item.updated_at || item.created_at || null,
  };
}

export function developmentCatalog({ registrySnapshot = {}, registryEvidence = {}, processes = [], runner = {} } = {}) {
  const plugins = (registrySnapshot.entries || []).map((entry) => ({
    kind: "PLUGIN_ROLE",
    id: String(entry.role_id),
    label: String(entry.role_id).replace(/^hermes-/,"").replaceAll("-"," "),
    version: entry.plugin_version || null,
    observed_at: entry.observed_at || null,
    evidence_state: registryEvidence.fresh ? "FRESH_SNAPSHOT" : "STALE_SNAPSHOT",
    source_class: registrySnapshot.source_class || "UNKNOWN",
  }));
  const automation = (processes || []).map((process) => ({
    kind: "HAE_PROCESS",
    id: String(process.id),
    label: process.name,
    role_id: process.role_id,
    job_type: process.job_type,
    status: process.status,
    next_run_at: process.next_run_at || null,
    last_run_at: process.last_run_at || null,
    last_job_state: process.last_job_state || null,
    last_error_class: process.last_error_class || null,
    max_cost_usd: 0,
  }));
  const systems = [{
    kind: "EXECUTOR",
    id: "viktor-mac",
    label: "Hermes AI · VIKTOR · Mac",
    status: runner?.online ? "RUNNING" : "OFFLINE_OR_UNKNOWN",
    last_seen_at: runner?.last_seen_at || null,
    repo_sha: runner?.repo_sha || null,
    runtime_version: runner?.runtime_version || null,
    phase: runner?.operations?.phase || null,
    model: runner?.operations?.model || null,
    current_task: runner?.operations?.current_task || null,
    next_action: runner?.operations?.next_action || null,
  }];
  return { plugins, automation, systems };
}


export function linkHumanWorkDevelopments(humanWork = {}, githubDevelopments = {}) {
  const pulls = Array.isArray(githubDevelopments.pulls) ? githubDevelopments.pulls : [];
  const tasks = Array.isArray(humanWork.tasks) ? humanWork.tasks : [];
  const linkedTasks = tasks.map((task) => {
    const ids = [task.id, task.custom_id].filter(Boolean).map((value) => String(value));
    const developments = pulls.filter((pull) => {
      const workId = String(pull?.passport?.work_id || "");
      return ids.some((id) => {
        const escaped = id.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
        return new RegExp("(^|[^A-Za-z0-9_-])" + escaped + "([^A-Za-z0-9_-]|$)", "i").test(workId) || workId.trim().toLowerCase() === id.toLowerCase();
      });
    }).map((pull) => ({
      number: pull.number || null,
      title: pull.title || null,
      url: pull.url || null,
      agent_family: pull?.passport?.agent_family || "UNKNOWN",
      head_sha: pull.head_sha || null,
      ci_state: pull.ci_state || "UNKNOWN",
      review_state: pull.review_state || "UNKNOWN",
    }));
    return { ...task, developments };
  });
  return { ...humanWork, tasks: linkedTasks };
}
