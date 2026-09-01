# Hermes AI Ecosystem — Current State

Last updated: 2026-09-01
Evidence checkpoint: `officeus-create/Hermes` canonical `main` = `809b1807c2f1e5f5fcb9d6cbb09827fec394b7ac`
Freshness class: `CURRENT_GITHUB_AND_PRODUCTION_SNAPSHOT_WITH_LABELLED_EXTERNAL_GATES`

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

The three PR file sets were checked before merge and did not overlap each other.

## Fresh production evidence on exact current main

Canonical main `809b1807c2f1e5f5fcb9d6cbb09827fec394b7ac` has now passed its post-merge evidence gates:

- repository `build-and-test` = SUCCESS;
- repository `verify` = SUCCESS;
- Cloudflare Pages deployment/check = SUCCESS;
- `Repair Shop real booking production smoke` run `33492286932` = SUCCESS on this exact main, proving the controlled production customer→owner booking loop;
- `Verify Hermes Connect Russian on command` run `33492528227` = SUCCESS on this exact main;
- the published Russian browser report at 2026-09-01T09:31:29Z classified production as `LIVE_HERMES_CONNECT_RUSSIAN_COMPLETE` using real Chromium against the public custom domain, including Russian Repair Shops landing, owner authentication, Founding Shop plan and public-booking surfaces.

This is strong evidence for current production reachability/localization and the controlled booking loop. It is not blanket proof of every possible concurrency, tenant-isolation, cache/PWA or real-human friction scenario.

## Fresh open PR inventory

Re-enumerate before later decisions.

| PR | Exact head / branch | Current classification in this thread |
| --- | --- | --- |
| #937 | old superseded governance branch | `SUPERSEDED_BY_FRESH_CURRENT_MAIN_REPLAY`; close after replacement PR is opened |
| #935 | `d977bcb6...` / Academy public learner handoff | `BLOCKED_CI`; Academy owner lane |
| #926 | `ad2ee607...` / London closeout | `STALE_BASE / OLD_HEAD_CI_SUCCESS`; London lane |
| #910 | `5299d35c...` / unified account switcher | `MIXED_SCOPE / ROUTE_AI_DECISION`; do not mutate here because it includes Internal AI behavior |
| #887 | `574bd57a...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #886 | `a46e8eae...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #885 | `a9c6995d...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #882 | `18d07649...` | `OUT_OF_SCOPE_THIS_THREAD / ROUTED_AI_HERMES_CONNECT` |
| #877 | `d99fe15a...` | `STALE_AI_DECISION_DONOR / OUT_OF_SCOPE_THIS_THREAD` |
| #871 | `319040d1...` | `STALE_SOURCE_ONLY_CORPORATE_AUDIT`; historical evidence, not current state |

Open PR enumeration tools can omit older open PRs depending on search ordering/result windows; therefore an exhaustive state review must explicitly reconcile known older open items such as #871/#877 rather than trusting a remembered top-N list.

## Remaining non-AI evidence tails

- Dedicated production parallel-capacity/concurrency verification exists in `.github/workflows/repair-capacity-production-smoke.yml`, but this merge wave did not change its trigger paths and therefore did not generate a fresh exact-current-main capacity run. Do not promote concurrency from absence of failure; request a fresh bounded capacity verification when capacity/double-booking is the decision being made.
- Cross-tenant isolation remains a runtime adversarial verification target even though the current owner APIs are coded to scope by authenticated owner identity.
- Real-human registration friction should continue to be measured from actual pilot users; synthetic/browser success is not a substitute for user feedback.

## Immediate next actions

1. Merge this fresh-current-main governance replay only after its exact-head CI is green.
2. Keep Hermes Connect AI PRs and decisions untouched in this thread; route them to `AI Hermes Connect`.
3. No new Repair Shop feature expansion unless fresh user/audit evidence proves a concrete defect.
4. Give Gemini the current main SHA and exact production run IDs so its next pass verifies rather than repeats stale findings.

## Operating rule

A stale current-state file is itself a bridge defect. Fresh GitHub/platform evidence supersedes this snapshot as soon as material state changes.