# HAE self-improvement lane

Status: SOURCE IMPLEMENTATION / STACKED DRAFT
Reviewed: 2026-10-25

## Goal

Use the canonical Hermes Automation Engine to improve HAE itself before expanding autonomous execution to the wider Hermes portfolio.

The v1 loop is:

`existing HAE Cron -> complete in-memory HAE contract snapshot -> hae.self.improvement.audit -> prioritized HAE-SELF WORK_ID -> hae.self.repair.packet -> HOLD_REPAIR -> independent QA/release gates`.

No second scheduler, database, queue, orchestrator or model gateway is introduced.

## What runs automatically

Every six hours the existing HAE Cron builds a complete bounded snapshot of the loaded role contracts and verified plugin-runtime registry.

The self-audit checks at minimum:

- duplicate role-contract job types;
- plugin-version drift against the verified runtime registry;
- permission-class drift away from READ_ONLY;
- non-zero semantic budgets in the free-first runtime.

If no verified defect exists, the result is `NO_ACTION`.

If a verified OPEN defect exists and no active writer owns its artifact, the audit emits a stable `HAE-SELF:<finding_id>` work id and `HOLD_REPAIR`.

The generic job executor then creates exactly one idempotent `hae.self.repair.packet` follow-up per stable `HAE-SELF:WORK_ID`, so repeated six-hour audits cannot create duplicate repair work. The packet freezes:

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

Runtime contracts use one compiled plugin version registry sourced from authenticated private Plugin Creator readback.

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
3. Complete verified self-audit selects the highest-priority repair candidate.
4. Scheduled self-audit contract has `max_cost_usd=0`.
5. A self-audit candidate automatically creates one idempotent self-repair packet, deduped by stable WORK_ID across repeated audits.
6. Repair packet stays `HOLD_REPAIR` and reports no source change / merge / deploy.
7. Capability policy remains default DENY and READ_ONLY for this slice.
8. Runtime exposes authenticated plugin registry truth and explicit self-improvement safety flags.

## Stack boundary

This draft is stacked on `codex/hae-task-source-intake`, which is stacked on the old #2061 head.

Do not promote toward main until the clean release ancestry is rebuilt:

`#2059 -> fresh #2060 -> fresh #2061 -> replay Codex intake -> replay self-improvement lane`.

SOURCE/CI success on this stacked draft is not DEPLOYED or LIVE verification.
