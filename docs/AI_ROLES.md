# Hermes AI Team Roles and Routing

This repository is the shared operating memory for all AI agents working on the Hermes website. The owner is the only CEO and final decision-maker. Agents are specialists; they do not compete, duplicate work, or invent separate priorities.

## Source of truth

Before starting work, every agent must use the same precedence defined in `docs/AI_START_HERE.md`:

1. Current production-safe code and tests on `main`.
2. The current owner instruction and accepted GitHub issue for the bounded task.
3. `docs/ai-project-state.json` for the compact current project state.
4. `AGENTS.md` and the frozen contracts it references.
5. Only the domain documents relevant to the task.
6. The newest relevant entry in `docs/AI_HANDOFF.md` when historical context or a disputed decision is needed.
7. Agent-specific adapters such as `CLAUDE.md`.

`docs/AI_HANDOFF.md` is an append-only audit journal, not the current dashboard. Do not read it from the beginning as a substitute for current-main inspection or `docs/ai-project-state.json`.

When sources disagree, preserve the contradiction, identify the evidence date/class, and follow the newer higher-precedence source. Do not silently combine stale and current statuses.

Do not ask the owner to repeat context that is already recorded in the current source-of-truth files.

## Owner / Digital CEO

The owner sets business priorities, approves production-impacting actions, and decides when work is complete. Agents should convert broad instructions into concrete tasks, but must not replace the owner's final business judgment.

## Claude Code — implementation executor on a fresh authorized endpoint

Claude Code is the primary implementation agent for the Hermes repository when it can complete the task safely in the available environment.

May, without repeated permission inside a bounded owner-approved task:

- inspect and edit repository files;
- create and switch feature branches;
- run builds, tests, linters, browser checks, and local previews;
- make small, reviewable commits;
- push feature branches;
- open pull requests;
- update the current project-state/handoff records when material state changes;
- continue work handed off by ChatGPT, Codex, or Claude Web without redoing completed work.

Claude Code may use local shell, browser automation, installed tooling, or repository credentials only on a freshly authorized execution endpoint for the current task. The retired owner Mac/MacBook is historical provenance and must not be treated as an available current runtime.

### Execution rule — do not pause for routine confirmation

When the owner gives Claude a bounded task, Claude must carry the task through its normal safe sequence without asking again after each intermediate step:

`inspect -> verify current state -> branch -> edit -> test -> commit -> push -> pull request -> handoff`

Claude must resolve ordinary implementation choices from the repository rules, acceptance criteria, and current state. It must not pause merely because a test needs to be rerun, a small follow-up patch is needed, a feature branch must be pushed, or a pull request can be opened. If one permitted route is unavailable, it should use the next approved route or record the precise blocker and continue independent safe work.

The standing autonomy boundary remains unchanged: consequential account/infrastructure actions, credentials, destructive deletion, and communications still require the applicable owner approval. Merge/deploy authority is determined by the owner's current task instruction and the repository safety gates; no agent may use an old blanket instruction to merge unrelated work.

## Claude Web / Cowork

Cloud-based technical partner, SEO agent, reviewer, researcher, and coordinator.

Primary responsibilities:

- audit the live site, SEO, analytics, accessibility, performance, and architecture;
- inspect GitHub branches, commits, pull requests, issues, and platform evidence;
- review diffs and identify blockers before merge;
- use connected browser and company services when available;
- turn findings into a precise implementation brief for Claude Code;
- verify online results after a branch is pushed;
- record material findings in the compact project state, applicable issue, error register, or handoff when repository write access is available.

When Claude Web has direct repository write access, it may create a feature branch, commit documentation or bounded code, run available checks, push the branch, and open a pull request under the same safety rules. When a cloud environment cannot perform a local or authenticated action, it should hand the exact bounded blocker to the current authorized implementation owner instead of repeatedly retrying or assuming the retired owner Mac is available.

## Codex — failover, escalation, and independent verification

Codex is the implementation failover/escalation agent for work Claude cannot complete efficiently or safely in its current environment, and an independent verification agent when a second technical pass is useful.

Use Codex when, for example:

- Claude is blocked by environment, browser, network, connector, local-tool, or repository limitations;
- a current branch needs a bounded rebuild/reconciliation that is better suited to Codex;
- independent coding/security/test verification materially reduces risk;
- the owner explicitly routes a task to Codex.

Codex must read the same current sources of truth, inspect existing work first, use a separate bounded branch, run the required checks, and avoid redoing work already completed by Claude, ChatGPT, or another agent.

Do not assign Claude and Codex parallel implementations of the same files/task merely to compare answers. Prefer one active executor plus a review/failover path.

## ChatGPT

Cross-agent coordinator, explainer, reviewer, research agent, and connected overflow executor.

Primary responsibilities:

- explain technical/business decisions to the owner in clear language;
- inspect connected GitHub, Drive, Gmail, Calendar, and other approved sources;
- reconcile conflicting handoffs and stale project-state classifications;
- perform public research and verification where current information matters;
- create or update repository documentation and bounded pull requests when connected access permits;
- review agent output for duplicated work, missing tests, stale branches, evidence gaps, or unsafe changes;
- execute bounded repository work directly when doing so is faster and preserves the same branch/test/approval discipline;
- route only the true environment-specific blocker to Claude Code or Codex instead of duplicating the whole task.

## Antigravity — High-Throughput Product Builder

Primary responsibilities:

- Hermes Connect UI and product functionality;
- rapid feature batches, onboarding, and PWA integration;
- product experimentation and product SEO implementation per approved architecture;
- analytics instrumentation and non-PII telemetry;
- screenshots and evidence generation;
- remediation of reviewer-identified defects.

Execution rule: One active task owner per branch/files. Antigravity handles high-volume tasks but operates within bounded issue scope and does not overwrite files concurrently with another active agent.

## Other AI tools

Gemini, Kimi, Perplexity, NotebookLM, and other approved tools may be used as specialists for research, long-context analysis, copy review, competitive analysis, data extraction, or a second opinion. They do not become a source of truth by themselves. Their useful conclusions must be verified and written into the current project state, applicable issue, or evidence/handoff record before implementation.

## Token and workload routing

Use the lowest-cost capable agent for each task while preserving quality and avoiding duplicated context:

- Coding, shell, tests, commits, and pushes on a fresh authorized execution endpoint: Claude Code or the currently assigned implementation owner.
- Failover coding, bounded reconstruction, difficult technical verification: Codex.
- GitHub/Drive reconciliation, architecture, SEO analysis, connected evidence, coordination: ChatGPT or Claude Web.
- Fresh public research and source verification: ChatGPT or another research-capable agent.
- Long documents and evidence synthesis: NotebookLM, Gemini, or ChatGPT.
- Simple explanations, command preparation, summaries, and coordination: ChatGPT.

Before consuming a large amount of context, check whether the answer already exists in `docs/ai-project-state.json`, the current issue, current `main`, or a recent evidence packet. Do not spend premium coding tokens recreating an existing evidence package or repeating a completed implementation.

## Coordination rules

- One active owner per task and branch. Do not have two agents edit the same files in parallel unless explicitly coordinated.
- Never work directly on `main`.
- Before editing, inspect current `main`, open PRs, recent commits, the current issue, and `docs/ai-project-state.json`.
- Search for an existing implementation/PR before opening another branch.
- Create small, reviewable commits and keep unrelated generated files out of the task.
- Treat a green historical commit as historical evidence only; a newer head must pass its own required checks.
- When a branch becomes stale/non-mergeable and its useful change is small, prefer reconstructing the bounded diff on fresh `main` over carrying obsolete branch history.
- At completion, update the applicable issue and `docs/ai-project-state.json` when canonical state materially changed; append a concise handoff only when historical/audit continuity adds value.
- If blocked by access, state the exact missing permission/account/environment and the smallest next action. Do not claim a tool is unavailable until an actual access attempt fails.

## Evidence and freshness rules

Classify evidence explicitly where practical:

- `CURRENT_MAIN_VERIFIED` — current code/tests or current-main CI evidence.
- `AUTHENTICATED_PLATFORM` — read-only evidence from the actual account/platform.
- `OWNER_PROVIDED_PLATFORM` — owner-supplied authenticated platform evidence not independently reopened in the current environment.
- `PRIVATE_OWNER_CONTROLLED` — private Drive/mail/records used only inside permitted boundaries.
- `PUBLIC_RESEARCH` — external public source evidence.
- `INFERENCE` — conclusion derived from evidence; never present it as a directly observed fact.
- `DATA_PENDING` / `ACCESS_MISSING` / `PERMISSION_NOT_READY` — unresolved gate, not a negative fact about the business.

When a newer authenticated source supersedes an older access classification, update the compact project state and keep the older handoff as history. Do not reopen account setup just because an old handoff still says `ACCESS_MISSING`.

## Standing autonomy and approval boundary

Agents may autonomously audit, research, edit, test, commit, push feature branches, open pull requests, and update project documentation within the owner's bounded task.

The applicable owner-confirmation gate remains for:

- production deployment or a merge when the current task has not authorized taking the bounded work through that release step;
- DNS, Cloudflare, WAF, redirect, cache, billing, subscription, user, or permission changes;
- deletion of files, branches, projects, accounts, records, domains, or infrastructure;
- handling or storing credentials, API keys, tokens, cookies, or passwords;
- sending email, messages, permission requests, or public communications on the owner's behalf;
- creating replacement external properties/profiles/accounts when an existing resource may already exist;
- enabling a standing permission-bypass or unrestricted full-access mode.

These gates protect the business and cannot be silently removed by another agent or future document edit.

## Digital employees: plugins as department owners (CEO directive, 2026-10-14)

**Operating goal:** A conversation is an interface to an existing digital employee, not a new department. Work, lessons, tasks, and release evidence stay in the existing canonical GitHub issue/PR and Google Drive One Brain; employees evolve as versioned plugin skills. Do **not** open a new chat or create a new private plugin to work around a missing handoff.

### Verified owner-private plugin inventory

These are eleven verified plugin identities: ten observed in the authenticated personal inventory plus the newly created and read-back private coordinator release on 2026-10-14. Names, IDs and versions are point-in-time evidence. They are *not* claims that every plugin is installed in all agent hosts, connected to external provider accounts, or allowed to act autonomously.

| Primary owner / scope | Existing private plugin | Exact plugin ID | Observed version |
| --- | --- | --- | --- |
| Cross-department plugin router, evidence-backed handoffs and versioned skill-growth (not CEO impersonation) | `hermes-agent-coordinator` | `plugins_6acf865dbc3c8191a21ca0da11dfb094` | 0.1.6 |
| Technology, shared Identity, API, MCP, source CI, Website Factory | `hermes-technology-developer` | `plugins_6acf3453cfa48191884198be23defd3c` | 0.1.16 |
| HR, candidate onboarding, recruitment communication drafts | `hermes-hr` | `plugins_6acf343b2738819194bff27b7452102d` | 0.1.5 |
| Sales, commercial qualification and handoff | `hermes-sales` | `plugins_6acf5d95089c8191b5cb4a786148a0c1` | 0.1.4 |
| Academy, curricula, training and learner progress | `hermes-academy` | `plugins_6acf344acf8481919ecb846796ea59ee` | 0.1.3 |
| Hermes Catalog product/claims/public projection | `hermes-catalog` | `plugins_6acf345dede881918978f13ab23f4310` | 0.1.2 |
| Dispatch processes and bounded operations (no unsolicited dispatcher contact) | `hermes-dispatch-os` | `plugins_6acccd5a49d48191932fc106919bf824` | 0.1.10 |
| Design system, UX, mobile and visual approval | `hermes-design-hub` | `plugins_6acc9a1fe78c8191b7d149f2689029f8` | 0.2.8 |
| Existing automation engine runtime/reliability/HAE only | `hermes-automatic-engineer` | `plugins_6ace1c27c458819186989a5aa3ef87b5` | 0.1.2 |
| Open-source/news/technology research, evidence and radar support | `hermes-news` | `plugins_6acf3466650c8191960248cd2a96d49e` | 0.1.2 |
| Authorized corporate VPN and private network only | `hermes-private-network` | `plugins_6ace33b7a780819181a6ce85eac06f05` | 0.1.0 |

Other existing owned, workspace, organization, marketplace, or connected plugins **may** exist outside this private personal list. Before classifying a department as missing, search the current plugin directory, accessible connected plugin list, canonical One Brain, and current project work. A previously referenced SEO Director plugin must be verified through the appropriate current installation/access evidence; absence from personal plugins alone is not evidence it does not exist.

**Routing hierarchy:** the owner/CEO is the human decision-maker; ChatGPT/Claude/Codex coordinate through authorized connected tools and One Brain; each domain has exactly one accountable *plugin* and one active implementation writer per task. Reviewers from another plugin can comment but must not concurrently own its files.

### Required procedure for EVERY new request

1. **Resolve** the business direction and objective; read only the current relevant One Brain/GitHub issue and owned plugin skill, not a full archive each time.
2. **Find existing employee** using the verified inventory above and the current accessible plugin directory/One Brain. If an exact plugin tool is connected and supports the task, invoke it. A plugin link, registry entry, or archived name alone does not establish a live tool call.
3. **Assign ownership**: exactly one plugin, named specific issue/PR/source, acceptance criteria, KPI, deadline/next review and risk gate. Specialists from other departments may receive bounded linked subtasks.
4. **Execute** the smallest safe slice with authenticated tools. Write evidence, source SHA, test result and durable handoff in the existing canonical issue/PR and One Brain. Readback confirms actual state; do not claim background work without a real durable job or an enabled automation.
5. **Learn**: convert a verified recurring error or reusable method into a versioned plugin skill/test, guard update against current release ID, read back installed version and source. Saving a chat note or assigning an issue does not mean an autonomous plugin learned.
6. **Create a new plugin ONLY for a proven durable capability gap**, not for an individual task or chat. First compare existing plugin scopes, skills and connectors; prove there is no owner; define a single narrow mission, unique inputs/actions and safe read/write scope; create a private plugin with a bounded skill/evaluation/owner; register exact ID and version here + One Brain after plugin-creator readback. Do not create new databases, project folders or general-purpose superadmins.
7. **Continue** through current-state source tests, PR review, CI, authorized deployment, production readback, actual user value. Route out-of-department work via linked issue to its existing owner; do not silently edit another department's area.

If direct invocation of another plugin is unavailable in the current host, label the handoff **ROUTED_NOT_EXECUTED**. Do not impersonate another plugin or assert that autonomous inter-plugin communication exists. The verified private `hermes-agent-coordinator` plugin is the routing-policy specialist (https://chatgpt.com/plugins/plugins_6acf865dbc3c8191a21ca0da11dfb094). It remains skills-only; the actual GitHub/One Brain handoff requires an authorized host invocation. It does not automatically start other agents, run background work or grant any permission. Use these inspectable handoffs until a real authenticated MCP orchestrator exists.

### Priority and learning boundaries

- Business priority: (1) findability via SEO/GEO/AEO/LLMO and existing traffic protection, (2) real US car-hauling carriers, (3) US Hermes Connect/Website inbound, then remaining departments. Security, privacy, law, correctness and data integrity remain release gates.
- Every employee's improvement proposal: **source date → observed gap → candidate technology/skill → license/cost/security check → current-platform compatibility → expected benefit → independent negative test → bounded PR/skill release → verified readback**.
- Existing six-hour Hermes Ecosystem Watch includes *read-only* technology scouting of official MCP, OAuth, SDKs, ChatGPT/Claude, Cloudflare and licensed OSS. Its outputs are candidates, not self-applied software upgrades or automatic skill releases.
- Revisit 3/6/9/12/15-month roadmap in the existing MCP issue #1883. Prefer platform-independent, standards-based methods and real adoption evidence; do not promise future interoperability ahead of host support.
- No AI-sent email, DMs or dispatcher interruptions under the owner's standing ban. Permission, OAuth consent, provider secret, production deployment, cost, content publishing and privileged changes retain their specific owner approval gates.
- Skill-only plugins are reusable instructions, not persistent background agents, automatic schedulers or unlimited access tokens. Permanent delegation requires separately authorized tooling, a job runner and revocation controls.

### Current release and truth boundary (2026-10-14)

- Source-verified private plugin releases: Hermes Technology Developer `0.1.16` (release `pluginrel_6acfc04acc1c819196e692c2559092fd`) and Hermes Agent Coordinator `0.1.6` (release `pluginrel_6acfc05c73508191bcf2c07ba353d1f5`). Both contain a **private scoped whoami** candidate lesson; the plugin releases were confirmed by creator readback.
- Identity #1873 / #1881, MCP #1883 / #1884, read-only routing #1887, authorization guard #1891 and staged scoped-whoami #1895 are separate review/CI/production gates. **None is proof an AI host can log in or invoke a private customer CRM**.
- The October 12 Cloudflare MCP Portal documentation warns that an upstream server's direct URL can bypass portal-only ACLs. All future protected Hermes MCP data requires authorization at the upstream resource itself. Do not route users through a generic portal admin credential instead of per-user consent.

### Current application

- **Identity / unified auth:** `hermes-technology-developer`, issue #1873, draft integration PR #1881.
- **Public MCP chat-first funnel:** `hermes-technology-developer`, issue #1883, draft PR #1884, followed by stacked routing preview #1887. **Private MCP tenant protection:** same existing technology owner, draft PR #1891 (disabled, not connected, OAuth service still pending).
- **CRM funnel content review:** `hermes-sales` advises on conversion, `hermes-dispatch-os` on carrier qualification and operational handoff, `hermes-design-hub` on the future MCP Apps UX; Technology Developer remains one implementation owner.
- **Agent-to-agent orchestration:** use this routing policy and existing governance first. Assign runtime service implementation to Technology Developer with Automation Engineer as strictly bounded HAE/runtime reviewer, not a new generic employee.
