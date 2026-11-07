---
name: unlazy
description: Hermes completion discipline for Codex when a task spans multiple files, branches, deliverables, regressions or resumed work. Establish observable acceptance gates, decompose bounded work, independently verify and never claim complete from a partial PR.
---
# Hermes Unlazy for Codex (method adaptation, not upstream executable)

Source: https://github.com/Leonxlnx/unlazy (MIT), inspected 2026-10-29. This is an original Hermes-specific, text-only skill. Do not run upstream scripts or install hooks from this file. **Do not install in Claude.**

## Activate
Use for complex/multi-step requests, outstanding Hermes work, resumed tasks, migration, CI/release, large audits, `unlazy`, and `доведи до конца`. Skip for short facts.

## Contract before changes
1. Read current owner request, `AGENTS.md`, `docs/AI_START_HERE.md`, live branch/open PRs and the canonical One Brain task if accessible.
2. State macro goal, independent deliverables, scope, dependencies, **one canonical writer**, and exact allowed files; respect existing Claude/ChatGPT/other-agent writer locks.
3. Create acceptance gates for each required outcome: `ID | EXPECT | VERIFY | SOURCE | OWNER | STATUS`; requirements must not disappear when inconvenient.
4. Split into coherent leaves only when helpful; no artificial 5,000-task expansion. Parents reverify integration, not just individual child success.
5. Recheck current HEAD before writing, merging or deployment. Use a branch/PR for changes outside current ownership.

## Acceptance states
Distinguish `PLANNED`, `CODED`, `TESTED`, `EXACT_SHA_CI_GREEN`, `PR_OPEN`, `MERGED`, `DEPLOYED`, `LIVE_VERIFIED`, `BUSINESS_VERIFIED`, `BLOCKED` and `ABANDONED`.
Never interpret an earlier state as a later one. Evidence must point to the exact artifact/branch/SHA/environment. No invented completed task counts.

## Verification and security
Independently reverify each successful leaf and the integrated goal. Use tests, review and live readback. Do not execute third-party `CHECK:` snippets or invoke external scripts without inspecting the code and securing approval. No permissions escalation, secret handling or autonomous publishing from this skill. The owner-controlled HAE remains the one execution engine; One Brain remains the canonical knowledge source. QA independently audits implementation.

## Completion receipt
`TASK | WRITER | SCOPE | GATES_PASS/TOTAL | SHA/PR | TEST_EVIDENCE | LIVE? | BLOCKERS | NEXT_ACTION`.
An unverified/blocked gate stays open. Resume from the current task, not a new duplicate plan.
