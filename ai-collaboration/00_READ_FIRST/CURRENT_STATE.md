# Hermes AI Ecosystem — Current State

Last updated: 2026-09-01
Evidence checkpoint: `officeus-create/Hermes` canonical `main` = `809b1807c2f1e5f5fcb9d6cbb09827fec394b7ac`
Freshness class: `CURRENT_GITHUB_SNAPSHOT_WITH_LABELLED_EXTERNAL_GATES`

## Purpose

This is a compact bridge, not timeless truth. Before any repository mutation, fetch fresh `main`, enumerate all open PRs, identify the active writer, and inspect exact-head evidence for the slice being changed.

## Source precedence

1. Latest explicit owner decision.
2. Fresh authenticated production/platform evidence.
3. Current GitHub `main`, open PRs, exact heads, checks/reviews and active issues.
4. Canonical AI Master Operating Board / One Brain.
5. Current department/task brief.
6. Historical documents, handoffs and chat.

## Governance

- Hermes Operating Stack (HOS) + Hermes Universal Evidence Gate (HUEG) are canonical.
- Core rule: `ONE TASK / ONE ARTIFACT / ONE ACTIVE WRITER — MANY REVIEWERS`.
- `MERGED != LIVE_VERIFIED`; green CI does not override owner/security/legal/writer-lock gates.
- `main` branch protection remains disabled and repository rulesets remain absent at the last fresh repository-admin read; issue #938 is the owner/admin platform-enforcement gate.
- One Brain Drive ACL classification remains `LAST_VERIFIED_FIX_REQUIRED / CURRENT_RECHECK_ACCESS_GAP` under issue #431 until an authenticated permission surface proves remediation.

## Current owner routing override — 2026-09-01

This ChatGPT thread is **NON-AI HERMES CONNECT** execution only.

- Do not implement, mutate, merge or continue Hermes Connect AI / AI Connect product work here.
- Hermes Connect AI work is routed to the separate owner chat `AI Hermes Connect`.
- PRs #882, #885, #886 and #887 are `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT`.
- PR #877 is an older AI-cabinet decision donor and is also `OUT_OF_SCOPE_THIS_THREAD`.
- PR #910 is mixed scope: shared account architecture is useful, but because it includes Internal AI portfolio behavior, this thread must not merge or alter it without an explicit non-AI split or handoff from `AI Hermes Connect`.

This thread owns bounded non-AI Repair Shop/STO cleanup plus One Brain/governance reconciliation that does not change Hermes Connect AI product behavior.

## Repair Shop execution completed in this checkpoint

Three previously prepared non-overlapping Repair Shop PRs were merged after verifying their exact heads were mergeable and had successful build-and-test plus Cloudflare preview evidence:

- #936 `fix(connect): apply Repair Shop registration feedback` → merged as `b37382a6a4c5fceda19e779f5dd1453329eb374e`.
  - Covers real user feedback: failed submit handling, preserved form data, helper copy, `Service city / state` clarity, next-step explanation, optional-field clarity, equipment touch targets, EN/RU/UK/ES/IT/FR.
- #934 `feat(connect): restore contextual Repair Shop owner navigation` → merged as `21316deeaa80ee183ec82a940dc0049e2bb92e81`.
  - Adds one localized Dashboard / Availability / Customers / Repair Shops navigation context with 390px coverage.
- #930 `fix(connect): replay Pearl Design OS on private Repair Shop workspaces` → merged as `809b1807c2f1e5f5fcb9d6cbb09827fec394b7ac`.
  - Presentation-only Pearl/Obsidian/Repair-blue convergence; operational APIs remain unchanged.

The three PR file sets were checked before merge and did not overlap each other. Post-merge exact-main checks/deployment are the current promotion gate.

## Fresh open PR inventory

Freshly reconciled after #936/#934/#930 merged. Re-enumerate before later decisions.

| PR | Exact head / branch | Current classification in this thread |
| --- | --- | --- |
| #937 | `governance/learning-enforcement-hardening-2026-09-01` | `CURRENT_WRITER`; this machine-state refresh; exact-head CI must rerun after this update |
| #935 | `d977bcb6...` / Academy public learner handoff | `BLOCKED_CI`; build-and-test failure, Cloudflare preview success; Academy owner lane |
| #926 | `ad2ee607...` / London closeout | `STALE_BASE / OLD_HEAD_CI_SUCCESS`; London lane, not this Repair Shop slice |
| #910 | `5299d35c...` / unified account switcher | `MIXED_SCOPE / ROUTE_AI_DECISION`; old-head CI success; do not mutate here because it includes Internal AI behavior |
| #887 | `574bd57a...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #886 | `a46e8eae...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #885 | `a9c6995d...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #882 | `18d07649...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #877 | `d99fe15a...` | `STALE_AI_DECISION_DONOR / OUT_OF_SCOPE_THIS_THREAD` |
| #871 | `319040d1...` | `STALE_SOURCE_ONLY_CORPORATE_AUDIT`; contains historical architecture evidence, not current state |

Open PR enumeration tools can omit older open PRs depending on search ordering/result windows; therefore an exhaustive state review must explicitly reconcile known older open items such as #871/#877 rather than trusting a remembered top-N list.

## Current main evidence

Canonical main after the Repair Shop merge wave: `809b1807c2f1e5f5fcb9d6cbb09827fec394b7ac`.

At the moment this file was rewritten, exact-main `build-and-test`, `verify` and Cloudflare Pages checks were observed **in progress**. Therefore the Repair Shop merge wave is `MERGED / POST_MERGE_VERIFICATION_PENDING`, not `LIVE_VERIFIED` yet.

## Immediate next actions

1. Wait for exact-main checks/deployment on `809b1807...`; if any required check fails, diagnose only that evidence-proven regression.
2. After green exact-main deployment, verify the public Repair Shop registration truth and the merged registration/navigation/design behavior on production.
3. Keep Hermes Connect AI PRs and decisions untouched in this thread; hand them to `AI Hermes Connect`.
4. Reconcile PR #937 to the final post-merge state and merge it only after its own exact-head checks are green and the two machine-state files remain non-conflicting with current main.
5. Do not create new Repair Shop features until current registration/production tails are closed or real-user feedback proves a new gap.

## Operating rule

A stale current-state file is itself a bridge defect. Fresh GitHub/platform evidence supersedes this snapshot as soon as material state changes.