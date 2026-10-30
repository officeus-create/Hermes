# Hermes Unlazy Completion Standard — Codex, HAE, Hermes AI and private plugins

**Decision:** owner request 2026-10-29. **Origin:** https://github.com/Leonxlnx/unlazy (MIT). **Implementation class:** original adaptation of methodology, not a verified installation of the upstream runnable scripts or hooks.

## Scope and exclusions
Applies to existing Hermes Agent Coordinator, Hermes private plugin execution, Codex tasks, HAE work contracts and Hermes AI/VIKTOR when those systems explicitly load or integrate this policy. **Do not install the skill in Claude or change Claude settings/hooks.** This document by itself does not prove that an agent runtime has loaded it. Do not create a second scheduler, second brain, task registry, or independent writer. Existing One Brain is authoritative, Agent Coordinator routes, HAE executes, specialist plugins propose/verify, and QA independently accepts.

## Method (required on nontrivial work)
1. Reconstruct **current** goal and truth from explicit owner request, canonical One Brain record, GitHub exact ref/PR/CI and authenticated systems.
2. Define `macro_goal` and each independently necessary deliverable before announcing progress. List explicit dependencies, file paths and one accountable writer.
3. Maintain acceptance gates: `gate_id | task_id | requirement | oracle/verification | expected evidence | actual evidence pointer | owner | state | exact SHA/environment | date`.
4. Decompose coherent deliverables; only run truly independent leaves in parallel if file/credential/production ownership does not overlap.
5. Require child completion **and** parent/integration regression evidence. `CODED != MERGED != DEPLOYED != LIVE != BUSINESS_VERIFIED`.
6. Report completion percentages **only** for a defined denominator and checked gates; report `UNKNOWN` when evidence is missing.
7. On blocker, record `blocked_by | owner | requested access/action | last verified artifact | next nonconflicting leaf`. Continue safe independent work rather than duplicating the system.
8. Reopen any `DONE` gate when the acceptance contract or upstream source materially changes; do not rewrite requirements to make counters green.

## Safety
The upstream `gate-check.mjs` may execute arbitrary approved shell checks; none is installed by this standard. Do not automatically run a third-party `CHECK:`, copy hooks, or use Claude Stop hooks. Pin source version and review security/commands before any separate executable installation. Existing access, release, QA, regulatory and owner gates remain higher priority.

## Completion evidence
Every material report states `GOAL | WRITER | BRANCH/SHA | REQUIRED GATES PASS/TOTAL | ARTIFACT/URL | TEST/QA | DEPLOY/LIVE | GAPS | NEXT ACTION`. A saved instruction is `POLICY_PUBLISHED`, not `RUNTIME_ENFORCED`. A CI pass is not a customer or revenue result.

## Rollout
- Private Hermes plugins: install the shared `unlazy-completion-discipline` skill in each relevant plugin and verify its published release.
- Codex: load `.codex/skills/unlazy/SKILL.md` from the checked-out repository or install separately in the authorized Codex user skills directory.
- HAE/Command Center: wire the ledger fields into the existing canonical task/release structures **only after** the execution owner inspects the current schema and accepts a bounded PR; documentation alone is not a runtime migration.
- VIKTOR/Hermes AI: add as a prompt/skill routing reference to the existing agent, never assert live activation without local/cloud process evidence.
- Google One Brain: owner-approved control document records canonical method, source, rollout receipts and open blockers. No second brain.

Owner: Hermes Agent Coordinator for routing, Hermes Automatic Engineer for HAE execution, QA Evidence Auditor for independent acceptance. No Claude-specific installation.
