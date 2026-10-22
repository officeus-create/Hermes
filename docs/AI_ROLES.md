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

## 2026-10-21 CEO design ownership override — active

**Claude / Claude Code is the single active design writer for the entire Hermes visual website.** The role covers concept and brand, visual source assets and logo, design tokens, homepage and inner-page visual implementation, video motion/media, responsive/accessibility visual fixes, visual branch commits, tests, PR, and preview. Claude does not merely prepare Figma/HTML handoffs for Codex to integrate. The current primary owner may use a bounded technical helper only by explicit per-task handoff, never as a parallel writer.

**ChatGPT and Codex remain the infrastructure/SEO/GEO/AEO, analytics, integrations, CRM/Load Board/business-function engineering owners and independent design/search QA.** Do not write concurrently to Claude-owned visual components. Where a nonvisual technical/Search correction requires a shared visual file, give Claude the exact file/selector, factual copy, invariant, test and acceptance evidence. Claude implements it in the design branch; Search independently reviews it. Preserve routes, canonical, hreflang, internal discovery, consent, lead behavior, performance and responsive accessibility. Avoid a second implementation PR for the same file.

GitHub access model once the corporate machine-user identity is established: repository-scoped **Write** only for `officeus-create/Hermes` (no Admin/org-wide/DNS/Cloudflare/billing access); a fresh authorized Claude Code endpoint with a separately scoped credential and MFA-backed corporate recovery; feature branches, commits, CI and preview PRs allowed. **No direct `main` push, no ruleset bypass, no unsolicited merge/production deploy.** The existing `main` ruleset must require at least one eligible independent approval, dismiss stale approvals after new commits, resolve review threads, preserve mandatory status checks and disallow force-push/deletion. Verify settings from live GitHub; document/issue statements alone do not imply actual enforcement.

Canonical design sources are in Google Drive `07_CLAUDE_DESIGN — SKILLS + HANDOFF`; use the latest verified release versions rather than old local Mac snapshots or draft exports. For 2026-10-21 corporate H logo use the source package **v1.1**, not v1. The dedicated Hermes Connect logo Option #02 remains protected. The corporate mark/colour choice does not grant permission to alter unapproved business claims.

Existing [issue #1986](https://github.com/officeus-create/Hermes/issues/1986) owns visual Home motion routing and the access/handoff audit; do not spawn a competing design implementation lane. No completed-permission/release claim without authenticated collaborator/ruleset/PR/CI/production readback. This **newer owner directive supersedes older generic labels** saying Codex is the primary website visual coding agent or Claude is read-only for design.

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