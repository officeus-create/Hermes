# Hermes Automation Engine — Post-Gate Hardening Contract

Date: 2026-10-23  
Status: SOURCE IMPLEMENTED / RUNTIME GATE STILL BLOCKED  
Owner runtime: existing Cloudflare-native Hermes Automation Engine  
Canonical runtime state: D1  
Transport: Cloudflare Queue  
Current reliability PR: #1872

## Purpose

This document records the implementation boundary for the reliability and scale work identified during the 2026-10-23 Grok / DeepSeek / DQIII8 / Cronos review.

It does **not** create a second scheduler, database, queue authority, workflow engine, plugin memory, or control plane.

The canonical execution path remains:

`event/thin Cron -> D1 reservation/state -> Cloudflare Queue -> HAE Worker capability -> system/provider readback -> durable receipt/events -> health`

Queue is transport. D1 is authoritative operational state.

## Current P0 — unchanged

PR #1872 remains the reliability gate. Source/CI evidence is not runtime evidence.

Current bounded acceptance sequence:

1. provide the dedicated scoped Cloudflare release credential through the approved GitHub production environment;
2. rerun `HAE_VERIFY <exact-current-main-sha>`;
3. verify private health, deployed SHA, mode, publication-disabled gate, Queue, DLQ, D1 and cron heartbeat;
4. submit exactly one current allowlisted read-only generic job;
5. read the durable D1 job/event receipt;
6. replay the same logical request with the same idempotency key;
7. prove no second side effect / duplicate execution;
8. independent QA;
9. only then decide READY -> MERGE -> DEPLOY through the protected release path.

Provider publication remains separately gated and OFF during this sequence.

## Implemented source primitive: capability policy

`workers/automation-engine/capability-policy.json` is a machine-readable projection of the current generic executor allowlist.

It introduces four permission classes:

- `READ_ONLY` — no external write;
- `DRAFT_ONLY` — internal draft artifact only; never send/publish/notify;
- `EXTERNAL_WRITE` — provider/system write, owner-gated;
- `DESTRUCTIVE` — destructive mutation, explicit per-action owner gate.

The default decision is DENY. Today every enabled generic capability is READ_ONLY.

The manifest is not a second authority. The runtime allowlist in code remains the execution gate; the contract test fails if the manifest and exact current allowlist drift.

## DQIII8 patterns — ADAPT, do not transplant

Useful patterns:

- provider circuit breaker and bounded retry;
- cost-first semantic routing;
- deterministic APPROVE / DENY / ESCALATE governance;
- learned fast-path for repeated classifications.

Do not port DQIII8's JSON/SQLite runtime literally. Do not add another Worker solely as a permission proxy. Governance belongs in the HAE capability contract and executor.

KV must not become an exact execution lock or canonical budget authority. Exact concurrency-sensitive state stays in D1 transactions or, only when a measured need exists, a narrowly scoped Durable Object.

## Cronos patterns — REUSE for ingestion/evidence

Useful patterns:

- stable natural-id/content-hash dedup keys;
- append-only evidence;
- integrity validation before promotion;
- deterministic output and silent no-op on unchanged input;
- source fault isolation.

Do not use Git/GitHub as live HAE operational state.

## Cloudflare Workflows boundary

Cloudflare Workflows is an optional HAE sub-primitive, not a replacement control plane.

Use the existing Queue path by default.

A Workflow becomes justified only when one capability has a measured need for durable multi-step waiting/checkpointing that is materially simpler and safer than D1 + Queue recovery, for example:

- wait hours/days for an external event;
- multi-stage saga with explicit checkpoints;
- resumable human-approval wait.

Even then:

- HAE remains the owner;
- D1 keeps Hermes evidence/state needed beyond Workflow provider retention;
- the Workflow cannot create a second scheduler registry;
- its instance ID and checkpoints must be linked to the canonical HAE job/event receipt.

## Versioned D1 migrations

Current V1 schema bootstrap uses additive idempotent `ensureSchema` helpers. Do not rewrite that while #1872 is open.

Before the first post-gate schema-changing capability:

1. snapshot the exact deployed schema after runtime verification;
2. introduce numbered D1 migrations for forward schema evolution;
3. keep migration state under the canonical existing D1;
4. prohibit creation of a second HAE database;
5. test forward migration from the verified baseline;
6. keep rollback/restore as a separate owner-gated operation.

No destructive migration is authorized by this document.

## DLQ inspect / quarantine / re-drive

DLQ > 0 is evidence requiring classification, not an instruction to replay blindly.

For each DLQ item:

1. inspect sanitized type/id/error class;
2. correlate with authoritative D1 state;
3. classify `SAFE_REDRIVE`, `READBACK_ONLY`, `QUARANTINE`, or `OWNER_ACTION`;
4. for any consequential external-write job, never re-drive the write if the provider outcome is unknown;
5. re-drive only through the canonical queue and preserve the original logical idempotency key;
6. append a durable event recording the decision and result.

Automatic blanket DLQ re-drive is prohibited.

## SLO / incident contract

Initial source-level incident conditions:

- cron freshness: no current heartbeat across more than two expected schedule intervals -> incident;
- DLQ backlog > 0 -> warning requiring classification;
- Queue oldest-message age beyond the capability's documented recovery window -> incident;
- generic job stuck beyond its lease/recovery boundary -> incident;
- `unknown_outcome_unresolved` or `readback_unverified` > 0 -> incident;
- source SHA / mode / publication gate discontinuity between expected release and heartbeat -> incident;
- missing metrics remain UNKNOWN, never zero/healthy.

Exact alert transport is not enabled here.

## Reconciliation

For a terminal external state where the provider offers a safe read API, add a bounded reconciliation capability:

`D1 terminal receipt -> provider/system readback -> compare -> drift event`

Rules:

- reconciliation is read-only by default;
- drift never triggers automatic republish/resend;
- provider absence or mismatch becomes evidence for operator review;
- no provider token or private payload is written to logs/health/events.

The current read-only reliability gate does not require a live provider reconciliation write.

## Retention and privacy gate

Current generic jobs are technical/read-only. Future email, CRM, candidate, carrier or customer capabilities may introduce PII.

Before enabling any capability that can persist PII, its policy must define:

- data classification;
- minimum stored fields;
- lawful/consent basis where applicable;
- retention class and deletion path;
- access boundary;
- analytics-safe projection;
- log/event redaction;
- whether raw payload storage is prohibited.

No capability may infer that immutable event history means indefinite retention of PII.

No automated purge is introduced until an approved retention policy exists.

## Disaster recovery

D1 Time Travel / restore is the preferred first-line recovery mechanism for canonical D1.

A restore is a destructive/production operation and remains owner-gated.

Before scale, maintain a runbook that records:

- exact database identity;
- target restore timestamp/bookmark;
- expected source/deploy SHA;
- pre-restore evidence capture;
- restore verification;
- post-restore Queue/DLQ reconciliation;
- no duplicate external-write replay.

Longer-term export/backup is added only when business retention requirements exceed provider recovery windows.

## Provider health and semantic AI cost controls

After the read-only reliability gate, and only for capabilities that actually call external AI/providers:

- bounded retries for transient failures;
- immediate fail/next-provider behavior for auth/config failures;
- provider circuit breaker/cooldown;
- rate-limit evidence;
- cost ledger;
- budget reservation/settlement when concurrent spend can race;
- no silent paid escalation;
- deterministic/local/rule path first.

Routine HAE ticks must continue to work with all model endpoints unavailable.

## Master-memory drift control

The memory stack is intentionally split:

- One Brain = canonical business/current coordination;
- GitHub = code, PR, CI and source evidence;
- Cloudflare HAE/D1/Queue = runtime truth;
- Hermes Automatic Engineer plugin = instructions, methods and validated durable lessons.

Plugin installed/updated is not runtime proof.

The Automatic Engineer should run a bounded state-freshness audit before material HAE work and report contradictions instead of merging them silently.

## Promotion order after P0

1. reliability gate / runtime receipt;
2. versioned schema/migration baseline;
3. capability-policy enforcement in executor;
4. DLQ operator/re-drive tooling;
5. SLO/incident projection;
6. reconciliation for the first real provider capability;
7. retention/privacy gate before PII capabilities;
8. provider circuit breaker/budget controls only where needed;
9. one department capability at a time.

A0-A39 remain backlog until each item passes implementation + policy + CI + runtime evidence.

## Non-goals

- no new n8n/Temporal/VPS control plane;
- no GitHub Actions scheduler as HAE authority;
- no second D1;
- no autonomous email send;
- no current-dispatch outreach;
- no provider/social write activation;
- no secret storage;
- no merge/deploy authorization.

## Evidence state

Today this package is SOURCE-level hardening only.

The current P0 runtime status remains:

`SOURCE/MERGED core + current #1872 CI evidence + historical dry-run + runtime ACCESS_GAP; NOT LIVE_VERIFIED`.
