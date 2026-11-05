const DONE_STATES = new Set(["done", "accepted"]);

export const PROJECT_PORTFOLIO_SNAPSHOT_OBSERVED_AT = "2026-11-04T13:19:00.000Z";
export const PROJECT_PORTFOLIO_COVERAGE_STATE = "PARTIAL_DECLARED_REGISTRY";
export const PROJECT_PORTFOLIO_COVERAGE_NOTE = "Declared Command Center project families plus owner-created D1 projects; not a complete One Brain or company-wide project inventory.";

const milestone = (id, label, state, evidence = null) => Object.freeze({ id, label, state, evidence });

const projects = Object.freeze([
  {
    id: "hermes-command-center",
    title: "Hermes Business Command Center",
    department: "technology",
    purpose: "One owner workspace for projects, CRM work, HAE processes, AI execution and evidence.",
    owner_role: "hermes-technology-developer",
    agent_role: "Hermes Technology Developer",
    plugin_roles: ["hermes-agent-coordinator", "hermes-connect-operator", "hermes-qa-evidence-auditor"],
    parent_id: null,
    dependency_ids: [],
    related_ids: ["hae-runtime", "ai-operations", "plugin-workforce", "one-brain"],
    started_at: "2026-10-26T00:00:00.000Z",
    target_at: null,
    blockers: ["Canonical admin-first release line is #2270 → #2236 → #2294 → #2295 → #2296. Each stage still requires terminal exact-head CI, independent current-head approval, protected release and stage-specific runtime readback. #2137 free-AI and auditor source adapters remain separate bounded activation lines; none may be inferred from source CI."],
    evidence_level: "SOURCE_RELEASE_CANDIDATE_REVIEW_PENDING",
    links: [
      { label: "Roadmap #2106", href: "https://github.com/officeus-create/Hermes/issues/2106" },
      { label: "Release candidate #2236", href: "https://github.com/officeus-create/Hermes/pull/2236" },
      { label: "Recovered backlog #2294", href: "https://github.com/officeus-create/Hermes/pull/2294" },
      { label: "Plugin receipt bridge #2295", href: "https://github.com/officeus-create/Hermes/pull/2295" },
      { label: "VIKTOR node #2296", href: "https://github.com/officeus-create/Hermes/pull/2296" },
    ],
    milestones: [
      milestone("owner-backlog", "Owner backlog and D1 capture", "done", "PR #2107"),
      milestone("acceptance", "Owner acceptance and rework boundary", "done", "PR #2107"),
      milestone("hae-processes", "Owner-managed HAE 24/7 processes", "done", "a19466b6"),
      milestone("local-agents", "Local AI Agents link and cloud fallback", "done", "211bf13d"),
      milestone("atomic-transitions", "Atomic work transitions and regressions", "done", "d8fbcd7f"),
      milestone("public-showcase", "Public masked showcase", "done", "PR #2236 source · simulation explicitly not live data"),
      milestone("team-view", "Sanitized employee Team View", "done", "PR #2236 source · owner-granted read-only access"),
      milestone("client-view", "Tenant-isolated real Client View", "active", "Issue #2223 · source in #2236; independent security review + two-tenant production proof pending"),
      milestone("crm-router", "Existing Hermes Connect CRM/workspace router", "done", "PR #2236 source · no second CRM"),
      milestone("social-read-model", "Social Acquisition read-only view", "done", "PR #2236 source · publishing/replies separately gated"),
      milestone("reports-surface", "Owner-only HAE reports surface", "done", "PR #2236 source · runtime scheduled receipts pending"),
      milestone("knowledge-investor", "One Brain + event-triggered Investor views", "done", "PR #2236 source · no automatic knowledge promotion"),
      milestone("access-admin", "Owner/Team access administration", "done", "PR #2236 source · audit trail preserved"),
      milestone("execution-evidence", "Executions / evidence read models", "done", "PR #2236 source · LIVE/BUSINESS remain separate evidence"),
      milestone("exact-head-ci", "Exact-head CI on final release head", "active", "PR #2236 · fresh head required after current reconciliation"),
      milestone("source-merge", "Unified Command Center source merged", "done", "PR #2198"),
      milestone("runtime-registry", "Current plugin/auditor runtime registry", "active", "PR #2270 · independent review/release pending"),
      milestone("adapter-gap-detector", "Detect missing HAE source adapters", "active", "PR #2268 · exact-head CI green; independent review/release pending"),
      milestone("github-auditor-source", "GitHub auditor trusted workflow source", "active", "PR #2272 · stacked on #2270; rebase/review after parent"),
      milestone("website-auditor-source", "Website auditor trusted probe source", "active", "PR #2273 · stacked on #2270; rebase/review after parent"),
      milestone("cloudflare-auditor-source", "Cloudflare auditor canonical source adapter", "active", "PR #2281 · current head 478754978b693914b5ce310cd4da82e0387354a0 · 3/3 exact-head workflows SUCCESS · independent review pending"),
      milestone("drive-auditor-source", "Drive auditor canonical source adapter", "active", "PR #2282 · current head e2be1f9c13311d6f7e7c62a1d2fa495d2b258e82 · 5/5 exact-head workflows SUCCESS · independent review pending"),
      milestone("audit-attention", "Owner-visible bounded audit attention", "active", "PR #2271 · source green; release/readback pending"),
      milestone("receipt-verifier", "Canonical HAE plugin receipt verifier", "done", "PR #2295 source retains the verifier semantics on current ancestry"),
      milestone("plugin-hae-bridge", "Selected plugin → canonical HAE receipt bridge", "active", "PR #2295 · clean stacked source; exact-head CI/review and production receipt readback pending"),
      milestone("viktor-canary", "VIKTOR Windows READ_ONLY HAE canary", "blocked", "PR #2296 · clean stacked source; independent review/protected release pending; signed runtime remains fail-closed until hae-node.hermeslogisticsus.com custom-domain DNS is released"),
      milestone("free-ai", "Verified free semantic capacity", "blocked", "PR #2137 · provider plan readback / protected release pending"),
      milestone("independent-review", "Independent production/access QA", "active", "Reviewer progressopro requested; no independent approval yet"),
      milestone("deployment", "Exact-SHA protected production deployment", "planned"),
      milestone("production-readback", "Authenticated production owner readback + HAE receipt", "planned"),
      milestone("final-independent-qa", "Independent runtime QA after deployment", "planned"),
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
    blockers: ["PR #2236 is the single current AI Operations/Command Center release candidate; fresh exact-head CI, independent review, protected release and authenticated production readback remain."],
    evidence_level: "SOURCE_RELEASE_CANDIDATE_REVIEW_PENDING",
    links: [{ label: "PR #2236", href: "https://github.com/officeus-create/Hermes/pull/2236" }],
    milestones: [
      milestone("architecture", "AI architecture view", "done", "PR #2236"),
      milestone("telemetry", "Bounded local executor telemetry", "done", "PR #2236"),
      milestone("team-view", "Scrubbed Team View", "done", "PR #2236"),
      milestone("plugin-registry", "Canonical plugin registry projection", "done", "PR #2236"),
      milestone("canonicalize", "One canonical implementation", "done", "Former #2159 stack reconciled into #2236; old parents are provenance only"),
      milestone("exact-head-ci", "Canonical exact-head CI", "active", "PR #2236 · rerun required after current reconciliation"),
      milestone("independent-qa", "Independent QA", "active", "Reviewer progressopro requested; no independent approval yet"),
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
    blockers: ["Current-main natural Cloudflare cron read-only runtime is LIVE_VERIFIED on main 8fbc0e942a1d9c43a7758feaf3e0f188eba170f9; remaining gates are protected release acceptance for new capabilities and their own durable receipts/independent QA."],
    evidence_level: "CURRENT_MAIN_RUNTIME_READONLY_PROOF_ACCEPTED_RELEASE_PENDING",
    links: [{ label: "Issue #2033", href: "https://github.com/officeus-create/Hermes/issues/2033" }],
    milestones: [
      milestone("worker", "Worker, D1, Queue and Cron", "done", "#2033"),
      milestone("recovery", "Idempotency, retries and recovery", "done", "#2033"),
      milestone("ci-intake", "Live GitHub/CI defect intake", "done", "#2090"),
      milestone("repair-packet", "Stable HAE-SELF work and repair packet", "done", "#2090"),
      milestone("process-control", "Owner process control", "done", "a19466b6"),
      milestone("runtime-readonly-proof", "Current-main HAE read-only runtime proof + independent QA", "done", "Natural cron GitHub Actions run 41933813016 · job:d434bdbb-a66f-435b-a651-dc4482ab740e · SUCCEEDED attempt=1 · replay suppressed · Queue=0 · DLQ=0 · independent QA PASS"),
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
    blockers: ["PR #2137 current head 4f9f2bd5fb5971a3713752768364e57c658a43f1 has 4/4 observed exact-head workflows SUCCESS; independent review/protected release and authenticated Workers plan readback remain before any activation."],
    evidence_level: "SOURCE_CI_GREEN_PLAN_UNKNOWN",
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
    blockers: ["Plugin routing/selection exists and #2295 now carries the bounded canonical HAE receipt bridge, but selected/registered remains not executed until protected release plus an authenticated HAE job/D1 receipt readback. Reviewed lesson → role-contract/plugin promotion remains gated by #2102."],
    evidence_level: "REGISTERED_ROUTING_SOURCE_EXECUTION_BRIDGE_RELEASE_GATED",
    links: [
      { label: "Execution bridge #2220", href: "https://github.com/officeus-create/Hermes/issues/2220" },
      { label: "Reviewed promotion #2102", href: "https://github.com/officeus-create/Hermes/issues/2102" },
    ],
    milestones: [
      milestone("registry", "Private plugin registry", "done", "28 registered plugins"),
      milestone("versions", "Versioned skills and evals", "done"),
      milestone("runtime-roles", "HAE role contracts", "done"),
      milestone("route-selection", "Versioned plugin route stored with owner work", "done", "PLUGIN_SELECTED_NOT_EXECUTED until a canonical receipt exists"),
      milestone("execution-receipt-bridge", "WORK_ID → existing HAE role contract → Queue/Worker → D1 plugin receipt", "active", "PR #2295 · source prepared; protected release + authenticated receipt proof pending"),
      milestone("activity", "Per-plugin live task and KPI readback", "active", "Command Center source shows registry/route/receipt states; LIVE invocation KPIs still require production HAE receipts"),
      milestone("reviewed-promotion", "Accepted lesson → reviewed role-contract/plugin promotion", "planned", "Issue #2102"),
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
    title: "Hermes AI on Mac fallback",
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
    blockers: ["Mac remains fallback/reference. Current host liveness belongs to the live runner-status endpoint, not this project snapshot; no durable HAE execution receipt proves Mac as a current executor."],
    evidence_level: "FALLBACK_RUNTIME_SOURCE_PRESENT_HAE_EXECUTION_UNVERIFIED",
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
    purpose: "Operate the assigned primary local Hermes AI executor and cockpit without creating a second HAE, and prove sustained unattended continuity.",
    owner_role: "hermes-technology-developer",
    agent_role: "Hermes AI Windows runner",
    plugin_roles: ["hermes-private-network", "hermes-security-engineering"],
    parent_id: "ai-operations",
    dependency_ids: ["hae-runtime"],
    related_ids: ["mac-ai", "free-ai"],
    started_at: "2026-10-28T00:00:00.000Z",
    target_at: null,
    blockers: ["Windows remains the assigned primary local executor, but current host/session liveness is dynamic and must come from live runtime readback. No canonical HAE WORK_ID → lease → execution → D1 receipt exists; heartbeat or an interactive session is insufficient."],
    evidence_level: "PRIMARY_ASSIGNED_HAE_EXECUTION_UNVERIFIED",
    links: [],
    milestones: [
      milestone("package", "Portable migration package", "done"),
      milestone("bootstrap", "Windows bootstrap and watchdog", "done"),
      milestone("cockpit-ui", "Hermes AI cockpit controls, Hermes branding and Command Center/HAE synchronization", "blocked", "Current interactive host state is dynamic; no durable HAE acceptance"),
      milestone("receipt", "Accepted Windows runtime receipt", "blocked"),
      milestone("hae-work", "Consume and return one canonical HAE job", "planned"),
      milestone("continuity-90d", "90-day unattended continuity with durable runtime receipts", "blocked", "Continuity requires durable unattended receipts; heartbeat/session liveness alone is insufficient"),
    ],
  },
  {
    id: "deepseek-specialist",
    title: "DeepSeek specialist lane",
    department: "technology",
    purpose: "Track DeepSeek local semantic/coding capability as a bounded subordinate specialist under HAE and Hermes AI, never as a second coordinator or production control plane.",
    owner_role: "hermes-automatic-engineer",
    agent_role: "DeepSeek specialist",
    plugin_roles: ["hermes-agent-coordinator", "hermes-security-engineering", "hermes-qa-evidence-auditor"],
    parent_id: "ai-operations",
    dependency_ids: ["hae-runtime", "free-ai"],
    related_ids: ["windows-ai", "mac-ai", "plugin-workforce"],
    started_at: "2026-11-02T00:00:00.000Z",
    target_at: null,
    blockers: [
      "Local DeepSeek scheduled read-only audit is running and verified on Windows; separate issue #2266 remains PREPARED / NOT RUNNING for dsh-superagent autonomous coding: isolated OS/container/VM, scoped GitHub bot identity, reviewed source/dependencies and one isolated Ticket→PR→CI→independent-review smoke are still required before activation.",
      "DeepSeek output must remain schema/validator bounded and cannot directly merge, deploy, publish, write production providers or become a second HAE."
    ],
    evidence_level: "LOCAL_SCHEDULED_READONLY_VERIFIED_SANDBOX_GATED",
    links: [{ label: "DeepSeek sandbox #2266", href: "https://github.com/officeus-create/Hermes/issues/2266" }],
    milestones: [
      milestone("local-specialist", "DeepSeek local specialist evidence retained", "done", "Windows scheduled read-only audit verified 2026-11-05: Task Scheduler LastTaskResult=0; deepseek-r1:1.5b MODEL_OUTPUT_ACCEPTED; 2476 files scanned; findings=[]; production writes=0"),
      milestone("sandbox-boundary", "Dedicated sandbox / OS isolation", "blocked", "Issue #2266"),
      milestone("scoped-identity", "Scoped GitHub bot and credential boundary", "blocked", "Issue #2266"),
      milestone("source-review", "Pinned source + dependency/security review", "planned"),
      milestone("isolated-smoke", "One isolated Ticket → PR → CI → independent review", "planned"),
      milestone("hae-receipt", "Canonical HAE WORK_ID / job receipt", "planned"),
      milestone("command-center-readback", "Command Center worker lifecycle/readback", "planned"),
    ],
  },
  {
    id: "command-center-operations-feed",
    title: "Command Center operations feed",
    department: "operations",
    purpose: "Deliver bounded recurring internal reports and inbox triage into the existing owner Command Center without creating another scheduler, inbox brain or notification system.",
    owner_role: "hermes-automatic-engineer",
    agent_role: "Hermes Automation Engine",
    plugin_roles: ["hermes-agent-coordinator", "hermes-qa-evidence-auditor"],
    parent_id: "hermes-command-center",
    dependency_ids: ["hae-runtime"],
    related_ids: ["one-brain", "plugin-workforce"],
    started_at: "2026-11-01T00:00:00.000Z",
    target_at: null,
    blockers: [
      "Catalog Friday/Monday and HR-tech Monday sources are preserved in #2236 but still need protected deploy plus real cron→D1→owner UI receipts.",
      "Officeus Gmail auto-triage #2279 is PENDING_ENGINEERING and must preserve real leads, finance/security alerts and zero auto-send/delete boundaries."
    ],
    evidence_level: "SOURCE_PARTIAL_RUNTIME_RECEIPTS_PENDING",
    links: [
      { label: "Catalog report #2209", href: "https://github.com/officeus-create/Hermes/issues/2209" },
      { label: "HR-tech radar #2211", href: "https://github.com/officeus-create/Hermes/issues/2211" },
      { label: "Gmail triage #2279", href: "https://github.com/officeus-create/Hermes/issues/2279" },
    ],
    milestones: [
      milestone("catalog-source", "Friday Catalog report + Monday owner notice source", "done", "#2209 · source preserved in #2236"),
      milestone("catalog-runtime", "Real Friday/Monday D1 → Command Center receipts", "blocked", "#2209 · deploy/runtime proof pending"),
      milestone("hr-radar-source", "Monday 10:00 HR-tech zero-token radar source", "done", "#2211 · source preserved in #2236"),
      milestone("hr-radar-runtime", "Real HR-tech cron → D1 → owner receipt with zero-token counters", "blocked", "#2211 · deploy/runtime proof pending"),
      milestone("mail-triage", "Officeus Gmail deterministic triage → Command Center", "planned", "#2279 · PENDING_ENGINEERING; no auto-send/delete"),
      milestone("feed-qa", "Independent operations-feed readback", "planned"),
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

