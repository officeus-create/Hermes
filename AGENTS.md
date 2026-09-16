# Hermes Website Agent Instructions

This file is read by Codex, Cursor, Claude, ChatGPT, and other coding agents working in this repository.

## First read

1. `docs/AI_START_HERE.md`
2. `docs/ai-project-state.json`
3. `docs/ERROR_REGISTER.md`
4. The current issue or bounded mission assigned in the prompt
5. `docs/ECOSYSTEM_COMPOUNDING_STANDARD.md`
6. `docs/DESIGN_INTEGRATION_CONTRACT.md`
7. `docs/PUBLIC_INFORMATION_POLICY.md`
8. Only the domain runbooks needed for the assigned task
9. The newest relevant entries in `docs/AI_HANDOFF.md` when historical continuity is needed

`README.md`, `CLAUDE.md`, `docs/AI_ROLES.md`, `docs/CODEX_WEBSITE_HANDOFF.md`, and numbered `docs/CURSOR_*_MISSION_*.md` are supporting or agent-specific documents. They do not override the current owner instruction, code/tests on `main`, the current project state, or an accepted bounded issue.

Before asking the owner for history, inspect the current branch, recent commits, open PRs, the project-state file, and the error register. Do not repeat work already recorded as complete.

## Completion Architect operating contract

Hermes work is completion-first, revenue-first, and evidence-first. Use this source precedence when facts conflict:

1. the current owner directive;
2. current production or authenticated evidence;
3. current `origin/main`;
4. current GitHub issue, PR, exact SHA, and CI evidence;
5. the canonical Master Board and Source Manifest;
6. the accepted project task brief and department knowledge;
7. the Master Vision / Idea Backlog;
8. historical chats, reports, and handoffs.

An old checkbox or prompt is not an active task. Green CI is not production success.

Do not create a second Master Board, task registry, Source Manifest, architecture, auth system, D1 database, services model, or parallel product. If the canonical control artifact needs improvement, propose or update that artifact. Maintain one execution view over the canonical sources, with one primary owner per surviving task; other workstreams are dependencies or reviewers, not duplicate task owners.

Prioritize in this order: production/security or broken revenue flow; activation, lead capture, booking, contact, search-owner defects, and decision-grade measurement; repeat use, CRM, automation, and conversion; then polish or speculative work. Within a tier prefer the smallest reversible change with the largest evidenced user or business impact.

If an external dependency needs credentials, another department, legal or owner action, or more than five minutes of unavailable specialist work, record a bounded handoff with owner, source, evidence, requested action, and done condition, then continue the next independent ready task. Do not invent work to remain busy.

GEO strategy and research belong to the dedicated ChatGPT GEO workstream. Repository agents implement only bounded GEO technical changes with an exact owner, source, implementation request, and done condition.

### ChatGPT Project recovery loop

ChatGPT Projects are project-specific knowledge sources. Their chats, files, decisions, errors, handoffs, and unfinished work may be newer than GitHub, Drive, or the Mac. Do not assume any one of those systems contains the complete history.

Query a ChatGPT Project only when current context is missing, a source conflict exists, or an active dependency requires that Project's state. Do not run a mass audit of every Project. Do not query a Project again until a material change, new conflict, or new dependency appears.

When Project context is required, produce one targeted `PROJECT_CONTEXT_REQUEST` for that Project with:

```text
TARGET_PROJECT
WHY_NEEDED
WHAT_CODEX_ALREADY_KNOWS
EXACT_MISSING_INFORMATION
RELATED_TASK_IDS
RELATED_GITHUB
RELATED_DRIVE
WHAT_CODEX_NEEDS_BACK
PRIORITY
```

The copy/paste request must ask the Project to distinguish `CURRENT` from `HISTORICAL` and return only surviving work. For each surviving task require: source, latest source, status, business goal, planned and completed work, evidence, remaining work, blocker, dependencies, primary owner, other department, Codex action, Project action, owner action, file/data locations, GitHub/Drive/Mac references, business impact, done condition, and next action. Also require the sections `DONE_VERIFIED`, `ACTIVE`, `BLOCKED`, `WAITING_FOR_OTHER_PROJECT`, `OTHER_PROJECT_SHOULD_KNOW`, `CONFLICTS`, `SUPERSEDED`, `MISSING_FROM_CENTRAL_BRAIN`, and `CODEX_HANDOFF`.

Treat a returned Project report as source material, not as a new backlog. Compare it with current production, `origin/main`, GitHub, the canonical Master Board, Source Manifest, and Drive; remove duplicates and superseded work; resolve conflicts using the source precedence above; add only surviving work to the existing execution view; assign one primary owner; and immediately execute Codex-owned ready tasks.

Route work between Projects with a bounded `CROSS_PROJECT_HANDOFF` containing `FROM_PROJECT`, `TO_PROJECT`, `TASK`, `WHY`, `SOURCE`, `DEPENDENCY`, `EXPECTED_RESULT`, and `DONE_CONDITION`. Do not solve Project B's work inside Project A.

Project responses are asynchronous dependencies only for the tasks that need them. Continue independent ready work, tests, CI, fixes, previews, smoke checks, verification, and canonical writeback while waiting. After reconciliation, record `PROJECT_CONTEXT_LAST_SYNC` with date, Project, source, and result in the existing canonical control artifact; do not create a separate sync registry.

Use `INDEX -> CURRENT STATE -> TARGETED SOURCE -> EXECUTION`. Do not reread the entire history, repeat an unchanged audit, or produce a new large backlog when current evidence is sufficient to act.

A technical change is not `DONE_VERIFIED` merely because code, a PR, a page, a test, or a document exists. Use the evidence chain appropriate to the work:

- technical release: `CODE -> TEST -> EXACT HEAD CI -> PREVIEW/DEPLOY -> SMOKE -> PRODUCTION VERIFY`;
- revenue flow: `DISCOVERY -> CTA -> FORM/BOOKING/CONTACT -> DELIVERY -> HUMAN/CRM RECEIPT -> FOLLOW-UP OR PAYMENT DECISION`;
- SEO: `INDEXABLE OWNER -> TECHNICAL VALIDATION -> SEARCH PLATFORM EVIDENCE -> QUERY/PAGE -> ACTION -> QUALIFIED OUTCOME`.

Substantial changes require an independent review path when warranted. After a material result, update the existing canonical GitHub or shared-memory record with task, owner, status, evidence, SHA/URL, blocker, and next action. Never claim revenue without evidence.

## Project boundary

- The active local checkout is `/Users/progressopro/Hermes` (`~/Hermes`). Older documents may mention `/Users/progressopro/Documents/hermeslogisticus.com`; treat that as a legacy path.
- Work only inside this repository unless the owner explicitly assigns a connected external source.
- Do not read or modify Database Carrier, Digital CEO Bridge, CRM, manager queues, or private company records unless the current task explicitly requires that source and the approved connector is used.
- Do not publish internal AI prompts, routing rules, employee information, revenue targets, or unfinished experiments on the public website.
- Do not deploy, change DNS, push to `main`, send messages, or connect a live external service without the owner's explicit confirmation for that action.
- Do not add secrets or real credentials. Use environment-variable placeholders only.

## Engineering rules

- Preserve the functional contracts in `docs/DESIGN_INTEGRATION_CONTRACT.md`.
- Do not redesign the website during a revenue sprint unless the owner explicitly changes the mission.
- Keep preview mode as the default.
- Make small, reviewable commits and do not overwrite unrelated work.
- Use existing Astro, TypeScript, Lucide, CSS, and Playwright patterns.
- Add tests for every behavior change.
- Never claim completion without current-head command output or a browser test.
- Use one active agent owner per task/branch; do not edit the same files in parallel without a written handoff.
- When a large or obsolete branch has diverged, prefer rebuilding the bounded change from current `main` over carrying unrelated history forward.
- Record discovered, resolved, superseded, and owner-required failures in `docs/ERROR_REGISTER.md`.

## Ecosystem compounding rule

Every bounded change must be evaluated under `docs/ECOSYSTEM_COMPOUNDING_STANDARD.md` for low-cost opportunities to improve search visibility, conversion, expertise, internal linking, durable knowledge, reusable architecture, privacy-safe measurement, future automation, and cross-business product value.

This rule does not authorize uncontrolled scope growth. Implement adjacent value in the same PR only when it remains coherent, low-risk, independently testable, compatible with active branch ownership, and free of unverified claims, privacy exposure, canonical conflict, or live-integration requirements. Record valuable but non-bounded opportunities as follow-up work.

## Agent collaboration and delegation

The owner is the only CEO and final decision-maker. Agents are specialists operating from the same repository memory.

- Codex: primary coding agent when available.
- Claude Code: local Mac execution, shell, code, tests, commits, feature-branch pushes, and PR creation; becomes primary implementation agent when Codex is unavailable.
- Claude Web/Cowork: SEO/live-site audit, architecture and PR review, browser-connected checks, research, and precise implementation briefs; may write when repository access is available.
- ChatGPT: coordination, explanation, public research, connected GitHub/Drive/Gmail work, review, and bounded overflow execution.
- Other approved AI tools: specialist research or second opinions; verified conclusions must be written into the repository before implementation.

Use the lowest-cost capable agent for each task. If a task is context-heavy, delegate bounded sub-tasks through a compact prompt rather than consuming one agent's entire session. Full role and routing rules are in `docs/AI_ROLES.md`.

## Standing autonomy

Agents may, without repeated permission, audit, research, edit files, create feature branches, run checks, commit, push feature branches, open pull requests, and update project documentation/handoffs.

Explicit owner confirmation is still required for merge to `main`, production deployment, DNS/Cloudflare/account/billing/permission changes, deletions, credential handling, messages or public communications, and any standing permission-bypass/full-access mode.

## Hermes autonomy policy

**Default behavior: act, do not ask.** For an assigned bounded Hermes task, investigate independently; inspect current `main` and active ownership; choose the safest reversible implementation; edit only in-scope workspace files; run and retry checks; diagnose failures; create a branch, commit, push a feature branch, open a review-only PR, record evidence, and continue with the remaining in-scope work.

Do not ask the owner to choose between technically equivalent safe options. Evaluate value, risk, effort, reversibility, current ownership, and evidence; make the best decision and record why in the handoff. Do not stop merely because a command fails, a test is flaky, dependencies are missing, context is compacted, or the first approach fails: retry, classify the failure, recover, or choose another safe approach.

Escalate only for:

1. deleting valuable or unrecovered data;
2. irreversible production changes, including merge or deploy;
3. payments, purchases, billing, or permission changes;
4. creating, rotating, exposing, or using credentials or secrets;
5. external communications in the owner's name;
6. legal or commercial commitments;
7. destructive database migrations;
8. material expansion outside the accepted task; or
9. an ambiguity that cannot be resolved from current evidence.

Execution environments may still impose their own sandbox or approval prompts. Do not bypass them with `--dangerously-bypass-approvals-and-sandbox` / `--yolo`, standing full-access modes, or an auto-review flag merely to keep an unattended task moving. Ordinary interactive Hermes Codex work should use `./scripts/ai/codex-hermes` and the narrowest sandbox/approval policy appropriate to the assigned task; do not edit global Codex configuration from a repository task unless the owner explicitly assigns that external configuration change. Browser-queued Internal AI is stricter: its trusted wrapper must fail closed, run inside `workspace-write`, disable approval escalation, clean the inherited environment, and sanitize evidence as defined in `docs/HERMES_CONNECT_AI_INTERNAL_RUNNER.md`. A sandbox denial is a blocker/evidence signal, not permission to widen authority.

### Organizational lessons

After a meaningful resolution, record a durable, evidence-backed lesson in the relevant handoff, error register, or canonical knowledge artifact using:

```text
PROBLEM
ROOT_CAUSE
FAILED_APPROACH
WORKING_APPROACH
EVIDENCE
LESSON
REUSE_RULE
```

This is organizational memory, not a claim that a model was permanently retrained. Return only when the bounded task is done, blocked by a real external gate, or needs an owner decision under the rules above; if safe in-scope work remains, continue it.

## Required verification

Run all of these before handoff, in CI order:

```bash
npm run build
npm test
npm run test:e2e
```

A historical green run does not validate a newer head. Do not merge a red, stale, unexpectedly diverged, or untested PR.

## Handoff format

Append a concise entry to `docs/AI_HANDOFF.md` and report:

- agent and task owner;
- branch, commits, and PR;
- files changed;
- behavior delivered;
- ecosystem compounding scorecard from `docs/ECOSYSTEM_COMPOUNDING_STANDARD.md`;
- tests passed on the current head;
- screenshots when UI changed;
- risks and assumptions;
- what remains incomplete;
- recommended next task and responsible agent.

Update `docs/ai-project-state.json` only when canonical project state materially changes. Update `docs/ERROR_REGISTER.md` whenever an error changes status. Keep `docs/CURSOR_WORK_LOG.md` updated only when a Cursor mission specifically requires it.
