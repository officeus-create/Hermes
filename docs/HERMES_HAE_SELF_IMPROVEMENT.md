# HAE self-improvement lane

Status: SOURCE IMPLEMENTATION / STACKED DRAFT
Reviewed: 2026-10-26

## Goal

Use the canonical Hermes Automation Engine to improve HAE itself before expanding autonomous execution to the wider Hermes portfolio.

The v1 loop is:

`existing HAE Cron -> complete in-memory HAE contract snapshot -> hae.self.improvement.audit -> prioritized HAE-SELF WORK_ID -> hae.self.repair.packet -> HOLD_REPAIR -> independent QA/release gates`.

No second scheduler, database, queue, orchestrator or model gateway is introduced.

## What runs automatically

Every six hours the existing HAE Cron builds a bounded snapshot of the loaded role contracts. It can verify internal contract invariants and the freshness of the last authenticated Plugin Creator readback, but it must not infer external plugin-version drift by comparing two values derived from the same compiled registry.

The scheduled self-audit checks at minimum:

- duplicate role-contract job types;
- permission-class drift away from READ_ONLY;
- non-zero semantic budgets in the free-first runtime;
- whether the compiled plugin-registry evidence has gone stale.

Actual `PLUGIN_VERSION_DRIFT` requires a separately refreshed, authenticated external finding. Until such evidence is present, HAE reports freshness honestly instead of claiming that current Plugin Creator versions were re-read.

A verified OPEN defect may route only when writer state is independently verified and clear. The internal Cron cannot observe GitHub writer ownership, so its own findings carry unverified writer state and cannot create a repair packet by themselves.

When complete evidence plus verified-clear writer state is supplied, the audit emits a stable `HAE-SELF:<finding_id>` work id and `HOLD_REPAIR`.

The generic job executor creates at most one `hae.self.repair.packet` per stable `HAE-SELF:WORK_ID`. An already frozen packet is reused across role-contract upgrades when WORK_ID, finding and artifact still match; a changed logical finding fails closed. The packet freezes:

- WORK_ID;
- finding id;
- artifact key;
- current Hermes Automatic Engineer plugin version;
- current Hermes QA/Evidence Auditor plugin version;
- required exact-head verification gates.

## Deliberate safety boundary

Self-improvement v1 does not:

- edit repository files automatically;
- create or merge a PR automatically;
- deploy production;
- publish/send provider content;
- spend paid model tokens;
- route from partial portfolio coverage.

A partial external portfolio snapshot may be audited but cannot produce routing candidates.

The self-repair packet is a durable handoff point for a later DRAFT_ONLY code-proposal capability. That next capability must remain zero-cost-first and independently reviewed before any GitHub write authority is enabled.

## Plugin version truth

Runtime contracts use one compiled plugin version registry sourced from authenticated private Plugin Creator readback. That registry is a dated source snapshot, not a live Plugin Creator connection. HAE checks its freshness; it does not compare contracts back to the same registry and call that independent drift detection.

Current self-improvement owners:

- hermes-automatic-engineer v0.1.26;
- hermes-agent-coordinator v0.1.71;
- hermes-qa-evidence-auditor v0.1.8;
- hermes-knowledge-curator v0.1.81;
- hermes-technology-developer v0.1.56.

Domain runtime versions used by current zero-token contracts are bound from the same registry rather than repeated manually.

## Acceptance for this slice

1. HAE Contract exact-head CI passes.
2. Partial work-portfolio coverage produces zero routing candidates.
3. Complete verified self-audit selects the highest-priority repair candidate only when writer state is independently verified and clear.
4. Scheduled self-audit contract has `max_cost_usd=0`.
5. A verified-clear self-audit candidate creates one idempotent self-repair packet, deduped by stable WORK_ID across repeated audits and reused across contract upgrades.
6. Repair packet stays `HOLD_REPAIR` and reports no source change / merge / deploy.
7. Capability policy remains default DENY and READ_ONLY for this slice.
8. Runtime exposes authenticated plugin registry truth and explicit self-improvement safety flags.

## Stack boundary

This slice is cleanly replayed directly on the accepted #2051 line. Promotion still requires exact-head CI and independent review. SOURCE/CI success is not DEPLOYED or LIVE verification.

## Independent release verification

A repair packet is not release evidence.

The next bounded READ_ONLY capability is `hae.self.release.verify`, but this source slice deliberately implements it as a **dormant fail-closed gate**.

The public job payload is enforced by a strict allowlist and may provide only:
- a stable `HAE-SELF:*` WORK_ID;
- one bounded artifact key;
- a persisted repair job reference.

Any fourth or unexpected field is rejected, including future names that were not anticipated by an earlier denylist. The dormant self-release job is also excluded from capability-graph routing, so a caller cannot turn its expected `BLOCKED` result into graph-level `ACCEPTED` by choosing a permissive KPI assertion.

It may not self-assert a verifier verdict, verification job id, repair owner, base/head SHA, diff digest, changed paths, CI results, trust level, backlog, source-change state, rollback state or any string claiming that evidence is authenticated.

Therefore `HOLD_RELEASE` is intentionally unreachable in this slice. Normal runtime execution returns `BLOCKED / AUTHENTICATED_RELEASE_EVIDENCE_UNAVAILABLE`, never automatic merge or deploy.

Activation is deferred until the post-runtime dependencies can provide real evidence:
- #2067 authenticated GitHub/CI event sensor;
- #2068 DRAFT_ONLY repair executor with a persisted D1 repair receipt;
- a separate D1-backed QA verifier receipt bound to WORK_ID/artifact/base/head/diff/role/version/verdict/criteria;
- authenticated GitHub base/head/diff/complete changed paths and workflow-run/job identifiers;
- rollback proof tied to the repaired change itself: the revert must be proven as the inverse/restoration of the exact patch, not merely a different green SHA;
- authenticated D1 P0/P1/P2 backlog readback.

Only when those adapters exist should the gate gain a reachable `HOLD_RELEASE` path. This is fail-closed readiness, not a claim of LIVE self-release.

Stopping condition remains a future acceptance rule: after authenticated activation, self-improvement may pause and return to the business queue only when the current item is at `HOLD_RELEASE` and there are no open P0/P1 self-tasks. Remaining non-blocking P2 improvements must not monopolize the engine.

SOURCE/CI success for this slice proves only that the dormant gate fails closed. It does not prove authenticated verifier execution, rollback equivalence, deployment or LIVE runtime behavior.


## Authenticated plugin registry refresh — 2026-10-26

The compiled registry below was refreshed from authenticated Plugin Creator readback after T4 was verified. Runtime-role versions are: Automatic Engineer 0.1.26; Agent Coordinator 0.1.71; Technology Developer 0.1.56; QA Evidence Auditor 0.1.8; Knowledge Curator 0.1.81; Marketing Growth 0.1.7; Search Growth 0.1.8; Academy 0.1.12; Dispatch OS 0.1.21.

This refresh is source evidence only. A private plugin release is not a deployed HAE capability; jobs still freeze role/plugin/contract/SHA identities at enqueue time and must pass the existing exact-head/runtime gates.
