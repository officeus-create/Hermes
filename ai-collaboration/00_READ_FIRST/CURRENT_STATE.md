# Hermes AI Ecosystem — Current State

Last updated: 2026-09-01
Evidence checkpoint: `officeus-create/Hermes` canonical `main` = `9a976da558e9441cd743744430eb4899393b8cbe`
Freshness class: `CURRENT_GITHUB_SNAPSHOT_WITH_LABELLED_EXTERNAL_GATES`

## Purpose

This file is a compact current-state bridge for AI workers. It is a snapshot, not timeless truth. For repository work, every agent must fetch fresh `main`, all open pull requests, exact current heads and relevant exact-head checks before acting. Historical chat, old PR green checks and older copies of this file never override fresh GitHub/platform evidence.

## Source precedence

1. Latest explicit owner decision.
2. Fresh authenticated production/platform evidence.
3. Current GitHub `main`, open PRs, exact-head checks/reviews and active issues.
4. Canonical AI Master Operating Board / One Brain.
5. Current department/task brief.
6. Historical documents, handoffs and chat.

## Governance now

- Hermes Operating Stack (HOS) + Hermes Universal Evidence Gate (HUEG) are canonical.
- Active sync skill: `SKILL_HERMES_AGENT_SYNC` v2.0.0 in One Brain.
- Core rule: `ONE TASK / ONE ARTIFACT / ONE ACTIVE WRITER — MANY REVIEWERS`.
- Green CI does not cancel `HOLD`, `REVIEW_ONLY`, `PRIMARY_WRITER`, owner/security/legal/compliance gates.
- `MERGED != LIVE_VERIFIED`; `HTTP 200 != working system`; `SEO implemented != search outcome`; narrative is not evidence.
- Before a material shared mutation: fresh sync, active-writer check, exact last-proven state and required evidence must be known.

## Platform enforcement gap

Fresh GitHub branch metadata on 2026-09-01 shows:

- `main` protected: **false**;
- required branch status-check enforcement: **off**;
- repository rulesets: **none**.

Classification: `GOVERNANCE_CANONICAL / PLATFORM_ENFORCEMENT_PARTIAL`.

HOS/HUEG therefore remains mandatory operating policy, but GitHub does not yet physically prevent a manual/direct bypass. Enabling the intended `main` PR/check/review protections is an owner/admin platform action unless a write-capable repository-administration surface is available.

## Fresh open pull-request set

This list was rebuilt from GitHub on 2026-09-01. Do not reuse it as current truth on a later run; re-enumerate all open PRs first.

| PR | Branch | Exact head | Base relationship at checkpoint | Exact-head Website checks | Snapshot classification |
| --- | --- | --- | --- | --- | --- |
| #936 | `docs/hermes-connect-security-response-2026-09-01` | `f41cd0e11a84e5fa7d2a2d6e475b257dbdebc37f` | targets current `main` | SUCCESS | `REVIEW_REQUIRED`; docs/security lane |
| #935 | `feat/academy-public-learner-handoff` | `d977bcb6a4c479fd6ec69f8769411e53984b5d72` | targets current `main` | FAILURE | `BLOCKED_CI`; Academy owner lane |
| #934 | `feat/repair-owner-context-nav-fresh` | `cb5dde5ca4ac31222acc176da3308263d678d722` | targets current `main` | SUCCESS | `CI_READY_ONLY`; Connect owner/review gates still apply |
| #930 | `fix/repair-private-pearl-shell-fresh-2026-08-31` | `b6ea689175d96a782530f71fd3421e3c83963f32` | targets current `main` | SUCCESS | `CI_READY_ONLY`; Connect owner/review gates still apply |
| #926 | `fix/london-postlaunch-gaps` | `ad2ee607789c0bd234c0f1d9eb656222bb663d67` | targets current `main` | FAILURE | `BLOCKED_CI`; London owner lane |
| #910 | `feat/shared-account-portfolio-main` | `5299d35caf212dd15f4af6bc5f4a5ff19b24b4ab` | targets current `main` | SUCCESS | `CI_READY_ONLY`; Connect owner/review gates still apply |
| #887 | `feat/ai-connect-activity-history` | `574bd57aa2a09732842943811df1120e92b41520` | stacked on #886 | FAILURE | `BLOCKED_CI / STACK_RECONCILE` |
| #886 | `feat/ai-connect-projects-list` | `a46e8eae89c6633466e5dca4b3bbad4da2c7a6f4` | stacked on #885 | FAILURE | `BLOCKED_CI / STACK_RECONCILE` |
| #885 | `feat/ai-connect-cabinet-ux-ru` | `a9c6995dbc08209f9549fc3f481d40b171ef58f1` | stacked on #882 | FAILURE | `BLOCKED_CI / STACK_RECONCILE` |
| #882 | `feat/ai-connect-project-main` | `18d07649e0f9da54680c2848cb9c431ff39c5bf0` | targets current `main` | SUCCESS | `STACK_BASE_CI_READY`; downstream heads still require their own evidence |

A Website-check result is only one HUEG input. Before merge/promotion, re-read reviews, governance comments, locks, owner approvals and exact base/current-main relationship on the then-current head.

## Current-main production/evidence observations

Exact-main check evidence inspected for `9a976da...` includes mixed verifier outcomes. At this checkpoint:

- Russian Repair Shop Production Verifier: SUCCESS;
- Hermes Connect Repair Shop Real Booking Production Smoke: FAILURE;
- Hermes Connect Beauty Bangkok International Production Smoke: FAILURE;
- Production Lighthouse Evidence: FAILURE;
- Cloudflare Pages check was observed in progress during one fresh read.

These are verifier-specific states, not permission to declare the whole website either healthy or broken. The owning product/performance lanes must diagnose exact current failures. Historical failed SHAs are irrelevant when superseded by a green exact head; current-head failures remain actionable until fixed, superseded or correctly reclassified.

## Learning and monitor hardening

The 2026-09-01 orchestration audit produced durable One Brain lessons for:

1. condition-watch noise from `mergeable`/ahead-behind metadata without next-step change;
2. repository writes before a writer-lock release / sync proof;
3. narrative audits without durable run-to-run state snapshots;
4. governance policy without physical platform enforcement;
5. stale machine-state files after material merges.

The Hermes CI / HUEG condition-watch now requires a successful-run `STATE_SNAPSHOT` and compares `PROMOTION_STATE + NEXT_STEP_CLASS`. Volatile mergeability/ahead-behind/routine-head changes are suppressed when they do not change readiness or the next action.

## One Brain state

Google Drive remains the durable business/knowledge memory; GitHub remains technical truth for code, PRs, tests and repository evidence. The One Brain learning loop and Agent Sync V2 require `RECALL LESSONS -> EXECUTE -> EVIDENCE -> RETRO -> LEARN -> PERSIST -> HANDOFF` for material work.

Current Drive permission metadata available to this agent reports effective ACL as not exposed/`access_not_verified`. Therefore the old permission-security concern is neither assumed fixed nor repeated as a current proven `anyone=writer` fact. Classification is `SECURITY_PERMISSION_STATE_UNVERIFIED` until an authenticated owner/admin permission surface proves the effective ACL.

## Current execution rules

- Never start from a remembered PR list or SHA.
- Never repair another active writer's product lane from a governance/audit lane merely because a failure is visible.
- Never close stacked/superseded PRs until replacement/current-main coverage is physically proven.
- Prefer a clean bounded replay from current `main` over dragging unrelated branch history when a branch is stale/conflicted.
- Persist reusable errors/lessons in One Brain; do not leave them only in chat.
- Refresh `docs/ai-project-state.json` and this file after material state changes, or explicitly classify them stale.

## Immediate next actions by owner

- Academy lane: diagnose/fix #935 exact-head Website failure; obtain new exact-head evidence.
- London lane: diagnose/fix #926 exact-head Website failure; obtain new exact-head evidence.
- AI Connect lane: reconcile #882 -> #885 -> #886 -> #887 stack from the current canonical base; do not trust historical greens on failing downstream heads.
- Repair Shop/Connect lane: investigate current-main Repair Booking production-smoke failure without parallel rewrites.
- Performance lane: investigate current-main Lighthouse evidence failure before making a performance claim.
- Governance/admin: enable physical `main` protection/ruleset when an authorized admin surface is available.
- One Brain owner/admin: verify effective Drive permissions and remediate only from authenticated ACL evidence.

## Operating rule

A stale current-state file is itself a bridge defect. If this checkpoint is older than the task's material repository/platform changes, refresh first and classify the old snapshot as historical evidence.
