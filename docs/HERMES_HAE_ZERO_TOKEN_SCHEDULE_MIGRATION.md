# HAE zero-token schedule migration

Reviewed: 2026-10-24

## Purpose

Replace ChatGPT Scheduled Tasks with the canonical Hermes Automation Engine loop:

`HAE tick or authorized source event -> versioned plugin contract -> D1 job -> Queue -> deterministic worker -> result/evidence receipt`.

The normal loop does not depend on an open ChatGPT conversation and has no automatic paid-model fallback.

## Recovered schedule inventory

The bounded migration registry currently contains 14 observed or owner-requested tasks:

- Dispatch Daily Closeout;
- Hermes Knowledge Mining;
- Hermes Web Technology Radar;
- Hermes AI Gateway readiness;
- Hermes Growth + Error Closure;
- Hermes Ecosystem Watch;
- HAE autonomy checkpoint;
- Hermes Social Publisher;
- Search & AI Visibility weekly review;
- weekly US car-hauling market review;
- weekly One Brain priorities;
- Hermes internet mentions;
- conversational English for work;
- search traffic recovery.

`GET /v1/schedule-migrations` returns their plugin owner, capability graph and activation state. The endpoint requires the existing HAE bearer authorization and exposes no secret values.

## Runtime state

Two new jobs can be built entirely inside HAE and are scheduled once per day by the existing hourly cron:

- `ai.gateway.readiness.audit`;
- `academy.english.practice.build`.

Existing schedules already cover the reusable portions of several legacy tasks:

- `system.health.snapshot` — hourly HAE/runtime checkpoint;
- `search.snapshot.evaluate` — public Search owner checks;
- `marketing.content.dedupe.audit` — content duplicate checks;
- `logistics.source.freshness.audit` — source freshness checks.

External-source tasks are event-driven and fail closed until an authorized plugin adapter submits a bounded snapshot through the existing authenticated `POST /v1/jobs` endpoint. Required snapshots contain metadata only; raw Gmail bodies, complete ChatGPT history, credentials and customer PII are not accepted.

New deterministic contracts are:

- `dispatch.daily.closeout.audit`;
- `knowledge.evidence.audit`;
- `technology.release.radar`;
- `ai.gateway.readiness.audit`;
- `growth.error.closure.audit`;
- `market.car-hauling.snapshot.evaluate`;
- `marketing.mentions.audit`;
- `academy.english.practice.build`.

Every contract is `READ_ONLY`, has `max_cost_usd: 0`, binds plugin/contract identity at enqueue time and writes only HAE job/event receipts.

## Deliberate boundaries

- Social publishing is not activated by this migration. It remains an external-write capability with a separate owner gate, provider authorization, dedupe and readback requirement.
- Knowledge Mining accepts fingerprints and source references, not message bodies.
- Market review reports numeric observations and deltas; it does not invent recommendations when comparable evidence is absent.
- Technology Radar compares verified release metadata; it does not install dependencies.
- Growth/Error Closure identifies evidence-backed closure candidates but does not close issues automatically.
- A successful job proves deterministic runtime execution, not revenue, production deployment or business completion.

## Release acceptance

Before activation on production:

1. merge the dependent HAE stack in order;
2. run full exact-head CI;
3. deploy through the existing protected HAE release path with provider writes still off;
4. read back `/v1/role-contracts` and `/v1/schedule-migrations` from the deployed SHA;
5. observe one scheduled Gateway audit and English lesson receipt;
6. submit one sanitized fixture for each external-source contract and read back its terminal job receipt;
7. keep every source-dependent task `SOURCE_ADAPTER_REQUIRED` until its connector and data-minimization contract are proven.
