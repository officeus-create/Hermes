# HAE self-improvement lane

Status: SOURCE IMPLEMENTATION / STACKED DRAFT
Reviewed: 2026-10-25

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

- hermes-automatic-engineer v0.1.25;
- hermes-agent-coordinator v0.1.68;
- hermes-qa-evidence-auditor v0.1.5;
- hermes-knowledge-curator v0.1.77;
- hermes-technology-developer v0.1.55.

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

The next bounded READ_ONLY capability is `hae.self.release.verify`. It consumes evidence from a separate verification job/context and requires:

- a stable `HAE-SELF:*` WORK_ID;
- exact `patch_sha` and SHA-256 diff digest;
- the complete required exact-head CI set whose head SHA equals the patch SHA;
- current Hermes Automatic Engineer identity for the repair owner;
- current Hermes QA/Evidence Auditor identity for the verifier;
- distinct repair and verification job IDs;
- verifier criteria digest and verdict;
- rollback/revert evidence whose checks are bound to the exact revert SHA whenever a source change has occurred;
- P0/P1/P2 self-backlog counts.

The gate returns only `HOLD_RELEASE`, `REPAIR` or `BLOCKED`. It never authorizes automatic merge or deploy.

`HOLD_RELEASE` cannot be reached from caller JSON alone. The public job payload may name only the WORK_ID, artifact, persisted repair job id and verifier verdict/criteria digest. It may not self-assert verification job id, repair owner, base/head SHA, diff digest, changed paths, CI results, backlog or rollback state.

Those fields must arrive through an internal sealed evidence context built from:
- authenticated D1 readback of a successful `hae.self.repair.execute` receipt;
- authenticated GitHub evidence for the exact repository/base/head/diff/changed-path set;
- GitHub workflow-run and job ids for every required check;
- authenticated D1 backlog counts;
- exact revert SHA and the same required checks bound to that revert SHA.

The repair receipt and GitHub evidence must independently agree on base SHA, patch SHA, diff SHA-256 and the complete changed-path set. A distinct base/head is itself the source-change signal, so rollback evidence cannot be disabled by a caller flag.

Until the post-runtime GitHub/CI sensor and DRAFT_ONLY repair executor can construct this sealed context, normal runtime execution of `hae.self.release.verify` intentionally returns `BLOCKED / VERIFIED_EVIDENCE_CONTEXT_REQUIRED`. This is fail-closed readiness, not a claim of LIVE self-release.

Stopping condition v1 is explicit: self-improvement may pause and return to the business queue only when the current item is at `HOLD_RELEASE` and there are no open P0/P1 self-tasks. Remaining non-blocking P2 improvements do not monopolize the engine.

Structural verification is still not proof that an external human or AI independently reasoned about the patch. Actual verifier execution remains a separate evidence source and contract/schema/provider-write changes keep the human HOLD_RELEASE boundary.
