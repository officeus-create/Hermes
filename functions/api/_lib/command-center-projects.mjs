const DONE_STATES = new Set(["done", "accepted"]);

const milestone = (id, label, state, evidence = null) => Object.freeze({ id, label, state, evidence });

const projects = Object.freeze([
  {
    id: "hermes-command-center",
    title: "Hermes Business Command Center",
    department: "technology",
    purpose: "One owner workspace for projects, CRM work, HAE processes, AI execution and evidence.",
    owner_role: "hermes-technology-developer",
    agent_role: "Hermes Technology Developer",
    plugin_roles: ["hermes-agent-coordinator", "hermes-qa-evidence-auditor"],
    parent_id: null,
    dependency_ids: [],
    related_ids: ["hae-runtime", "ai-operations", "plugin-workforce", "one-brain"],
    started_at: "2026-10-26T00:00:00.000Z",
    target_at: null,
    blockers: ["Independent review, owner-authorized merge/deploy and production readback remain."],
    evidence_level: "EXACT_HEAD_CI_GREEN",
    links: [{ label: "PR #2107", href: "https://github.com/officeus-create/Hermes/pull/2107" }],
    milestones: [
      milestone("owner-backlog", "Owner backlog and D1 capture", "done", "PR #2107"),
      milestone("acceptance", "Owner acceptance and rework boundary", "done", "PR #2107"),
      milestone("hae-processes", "Owner-managed HAE 24/7 processes", "done", "a19466b6"),
      milestone("local-agents", "Local AI Agents link and cloud fallback", "done", "211bf13d"),
      milestone("atomic-transitions", "Atomic work transitions and regressions", "done", "d8fbcd7f"),
      milestone("exact-head-ci", "Exact-head CI", "done", "d8fbcd7f"),
      milestone("independent-review", "Independent approving review", "planned"),
      milestone("release", "Protected merge and deploy", "planned"),
      milestone("production-readback", "Authenticated production owner readback", "planned"),
    ],
  },
  {
    id: "ai-operations",
    title: "Hermes AI Operations",
    department: "technology",
    purpose: "Show executor health, current work, Team View and plugin capability without creating a second runtime.",
    owner_role: "hermes-agent-coordinator",
    agent_role: "Hermes Agent Coordinator",
    plugin_roles: ["hermes-technology-developer", "hermes-access-identity-governor"],
    parent_id: "hermes-command-center",
    dependency_ids: ["hermes-command-center"],
    related_ids: ["mac-ai", "windows-ai", "plugin-workforce"],
    started_at: "2026-10-27T00:00:00.000Z",
    target_at: null,
    blockers: ["PR #2125 and PR #2159 overlap and require one canonical writer before release."],
    evidence_level: "SOURCE_CONFLICT",
    links: [
      { label: "PR #2125", href: "https://github.com/officeus-create/Hermes/pull/2125" },
      { label: "PR #2159", href: "https://github.com/officeus-create/Hermes/pull/2159" },
    ],
    milestones: [
      milestone("architecture", "AI architecture view", "done", "PR #2125 / #2159"),
      milestone("telemetry", "Mac runner telemetry", "done", "PR #2125"),
      milestone("team-view", "Scrubbed Team View", "done", "PR #2159"),
      milestone("plugin-registry", "Canonical plugin registry projection", "done", "PR #2159"),
      milestone("canonicalize", "Choose one canonical implementation", "blocked"),
      milestone("exact-head-ci", "Canonical exact-head CI", "planned"),
      milestone("production", "Role-scoped production readback", "planned"),
    ],
  },
  {
    id: "hae-runtime",
    title: "Hermes Automation Engine",
    department: "operations",
    purpose: "The single durable execution control plane for scheduled work, queues, retries and evidence.",
    owner_role: "hermes-automatic-engineer",
    agent_role: "Hermes Automatic Engineer",
    plugin_roles: ["hermes-qa-evidence-auditor", "hermes-agent-coordinator"],
    parent_id: null,
    dependency_ids: [],
    related_ids: ["self-learning", "free-ai", "hermes-command-center"],
    started_at: "2026-10-21T00:00:00.000Z",
    target_at: null,
    blockers: [],
    evidence_level: "PARTIAL_LIVE_VERIFIED",
    links: [{ label: "Issue #2033", href: "https://github.com/officeus-create/Hermes/issues/2033" }],
    milestones: [
      milestone("worker", "Worker, D1, Queue and Cron", "done", "#2033"),
      milestone("recovery", "Idempotency, retries and recovery", "done", "#2033"),
      milestone("ci-intake", "Live GitHub/CI defect intake", "done", "#2090"),
      milestone("repair-packet", "Stable HAE-SELF work and repair packet", "done", "#2090"),
      milestone("process-control", "Owner process control", "done", "a19466b6"),
      milestone("repeatable-proof", "Repeated production autonomous acceptance", "active"),
    ],
  },
  {
    id: "self-learning",
    title: "HAE self-learning loop",
    department: "technology",
    purpose: "Turn accepted repairs into reviewed lessons that improve the next real execution.",
    owner_role: "hermes-knowledge-curator",
    agent_role: "Hermes Knowledge Curator",
    plugin_roles: ["hermes-automatic-engineer", "hermes-qa-evidence-auditor"],
    parent_id: "hae-runtime",
    dependency_ids: ["hae-runtime", "free-ai"],
    related_ids: ["one-brain", "plugin-workforce"],
    started_at: "2026-10-26T00:00:00.000Z",
    target_at: null,
    blockers: ["Verified free semantic capacity and a live accepted repair are still required."],
    evidence_level: "PARTIAL_SOURCE_AND_RUNTIME",
    links: [{ label: "Issue #2069", href: "https://github.com/officeus-create/Hermes/issues/2069" }],
    milestones: [
      milestone("self-tasking", "Autonomous defect to WORK_ID", "done", "#2090"),
      milestone("bounded-patch", "Bounded PATCH_ONLY executor", "done", "#2130"),
      milestone("independent-qa", "Independent QA source lane", "done", "#2138"),
      milestone("semantic-repair", "Live free semantic repair", "blocked"),
      milestone("lesson", "Durable reviewed lesson", "planned"),
      milestone("reuse", "Next runtime job proves lesson reuse", "planned"),
    ],
  },
  {
    id: "free-ai",
    title: "Verified free AI capacity",
    department: "technology",
    purpose: "Provide semantic execution without an automatic paid fallback.",
    owner_role: "hermes-access-identity-governor",
    agent_role: "Hermes Access & Identity Governor",
    plugin_roles: ["hermes-automatic-engineer", "hermes-finance-accounting"],
    parent_id: "hae-runtime",
    dependency_ids: ["hae-runtime"],
    related_ids: ["self-learning", "mac-ai", "windows-ai"],
    started_at: "2026-10-27T00:00:00.000Z",
    target_at: null,
    blockers: ["Authenticated provider-plan readback is required before activation."],
    evidence_level: "WAITING_FREE_AI",
    links: [{ label: "PR #2137", href: "https://github.com/officeus-create/Hermes/pull/2137" }],
    milestones: [
      milestone("policy", "$0 fail-closed policy", "done", "#2123"),
      milestone("negative-qa", "Unknown-plan negative QA", "done", "#2137"),
      milestone("provider-readback", "Authenticated free-plan readback", "blocked"),
      milestone("activation", "Bounded free inference activation", "planned"),
    ],
  },
  {
    id: "plugin-workforce",
    title: "Hermes plugin workforce",
    department: "operations",
    purpose: "Route work through versioned specialist capabilities instead of creating another general agent.",
    owner_role: "hermes-agent-coordinator",
    agent_role: "Hermes Agent Coordinator",
    plugin_roles: ["hermes-knowledge-curator", "hermes-qa-evidence-auditor"],
    parent_id: null,
    dependency_ids: ["hae-runtime"],
    related_ids: ["one-brain", "ai-operations"],
    started_at: "2026-10-21T00:00:00.000Z",
    target_at: null,
    blockers: [],
    evidence_level: "REGISTERED_CAPABILITIES",
    links: [],
    milestones: [
      milestone("registry", "Private plugin registry", "done", "28 registered plugins"),
      milestone("versions", "Versioned skills and evals", "done"),
      milestone("runtime-roles", "HAE role contracts", "done"),
      milestone("activity", "Per-plugin live task and KPI readback", "active"),
    ],
  },
  {
    id: "one-brain",
    title: "One Brain knowledge governance",
    department: "operations",
    purpose: "Keep one reviewed source of company decisions, evidence and reusable lessons.",
    owner_role: "hermes-knowledge-curator",
    agent_role: "Hermes Knowledge Curator",
    plugin_roles: ["hermes-agent-coordinator", "hermes-qa-evidence-auditor"],
    parent_id: null,
    dependency_ids: [],
    related_ids: ["self-learning", "plugin-workforce"],
    started_at: "2026-10-21T00:00:00.000Z",
    target_at: null,
    blockers: ["Automatic promotion remains intentionally owner/reviewer gated."],
    evidence_level: "CANONICAL_DOCUMENTS",
    links: [],
    milestones: [
      milestone("control-loop", "Control Loop", "done"),
      milestone("ledger", "Execution and Ideas Ledger", "done"),
      milestone("reviewed-lessons", "Reviewed lesson promotion", "active"),
      milestone("runtime-consumption", "Runtime consumption proof", "planned"),
    ],
  },
  {
    id: "mac-ai",
    title: "Hermes AI on Mac",
    department: "technology",
    purpose: "Local zero-cost semantic capacity and AI operator cockpit for the current device.",
    owner_role: "hermes-technology-developer",
    agent_role: "Hermes AI local runner",
    plugin_roles: ["hermes-private-network", "hermes-security-engineering"],
    parent_id: "ai-operations",
    dependency_ids: ["hae-runtime"],
    related_ids: ["free-ai", "windows-ai"],
    started_at: "2026-10-25T00:00:00.000Z",
    target_at: null,
    blockers: ["Availability depends on the current device and power; cloud HAE must remain independent."],
    evidence_level: "LOCAL_VERIFIED",
    links: [],
    milestones: [
      milestone("cockpit", "Local AI Cockpit", "done", "HTTP 200 local readback"),
      milestone("model", "Local model inference", "done"),
      milestone("power", "Power-aware pause", "done"),
      milestone("hae-consumption", "Durable HAE execution consumption", "active"),
    ],
  },
  {
    id: "windows-ai",
    title: "Hermes AI on Windows",
    department: "technology",
    purpose: "Add a persistent execution host without creating a second HAE.",
    owner_role: "hermes-technology-developer",
    agent_role: "Hermes AI Windows runner",
    plugin_roles: ["hermes-private-network", "hermes-security-engineering"],
    parent_id: "ai-operations",
    dependency_ids: ["hae-runtime"],
    related_ids: ["mac-ai", "free-ai"],
    started_at: "2026-10-28T00:00:00.000Z",
    target_at: null,
    blockers: ["Accepted Windows runtime receipt has not been produced."],
    evidence_level: "PACKAGE_VERIFIED_NOT_LIVE",
    links: [],
    milestones: [
      milestone("package", "Portable migration package", "done"),
      milestone("bootstrap", "Windows bootstrap and watchdog", "done"),
      milestone("receipt", "Accepted Windows runtime receipt", "blocked"),
      milestone("hae-work", "Consume and return one HAE job", "planned"),
    ],
  },
  {
    id: "investor-intelligence",
    title: "Hermes Investor Intelligence",
    department: "finance",
    purpose: "Maintain investor readiness only when a material finance, legal or owner trigger exists.",
    owner_role: "hermes-investor-relations",
    agent_role: "Hermes Investor Relations",
    plugin_roles: ["hermes-finance-accounting", "hermes-compliance-operations"],
    parent_id: null,
    dependency_ids: ["one-brain"],
    related_ids: ["hermes-command-center"],
    started_at: "2026-10-24T00:00:00.000Z",
    target_at: null,
    blockers: ["EVENT_TRIGGER_ONLY: no continuous polling without new finance/legal evidence."],
    evidence_level: "HOLD_EVENT_TRIGGER_ONLY",
    links: [{ label: "PR #2055", href: "https://github.com/officeus-create/Hermes/pull/2055" }],
    milestones: [
      milestone("workstream", "Canonical investor workstream", "done", "W-20261024-103"),
      milestone("trigger-policy", "Event-trigger-only policy", "done"),
      milestone("fresh-evidence", "Fresh finance/legal evidence", "blocked"),
      milestone("release", "Approved investor surface", "planned"),
    ],
  },
]);

function progressFor(project) {
  const total = project.milestones.length;
  const completed = project.milestones.filter((item) => DONE_STATES.has(item.state)).length;
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : null };
}

function statusFor(project, progress) {
  if (progress.total > 0 && progress.completed === progress.total) return "done";
  if (project.milestones.some((item) => item.state === "blocked")) return "blocked";
  if (project.milestones.some((item) => item.state === "active")) return "in_progress";
  return progress.completed ? "partial" : "planned";
}

export function commandCenterProjectPortfolio() {
  return projects.map((project) => {
    const progress = progressFor(project);
    return Object.freeze({
      ...project,
      status: statusFor(project, progress),
      progress,
      eta: null,
      eta_label: "UNKNOWN",
      eta_basis: "No deterministic completion history is available yet.",
    });
  });
}

export function validateCommandCenterProjects(portfolio = commandCenterProjectPortfolio()) {
  const ids = new Set(portfolio.map((project) => project.id));
  const errors = [];
  if (ids.size !== portfolio.length) errors.push("duplicate_project_id");
  for (const project of portfolio) {
    if (!project.title || !project.purpose || !project.department || !project.owner_role) errors.push(`${project.id}:required_field_missing`);
    if (!project.milestones.length) errors.push(`${project.id}:milestones_missing`);
    if (project.parent_id && !ids.has(project.parent_id)) errors.push(`${project.id}:parent_missing`);
    for (const dependency of project.dependency_ids) if (!ids.has(dependency)) errors.push(`${project.id}:dependency_missing:${dependency}`);
    for (const related of project.related_ids) if (!ids.has(related)) errors.push(`${project.id}:related_missing:${related}`);
    if (project.eta !== null || project.eta_label !== "UNKNOWN") errors.push(`${project.id}:unproven_eta`);
  }
  return errors;
}

