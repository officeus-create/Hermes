# Hermes Automation Engine V1

Date: 2026-10-13  
Canonical owner: GitHub issue #1018 Growth Bridge  
Status: **SOURCE PILOT / DRY-RUN BY DEFAULT**

## Objective

Build one durable Hermes-owned automation motor that can later power Social, News, Telegram, CRM jobs and other repetitive workflows without using ChatGPT Scheduled Tasks for the normal execution loop.

V1 starts with one narrow pilot:

`@hermes.logistics → Threads → car-hauling-carrier-only content`

The pilot deliberately uses deterministic templates, D1 state, Cloudflare Queue semantics and provider receipts. It does not call OpenAI for ordinary post generation.

## Why this is a fresh current-main implementation

A historical branch `feat/threads-growth-engine-20260929` contains useful ideas:
- D1 reply/content state;
- Threads reply polling;
- provider insights;
- scheduler hooks;
- bounded safety gates.

It is now hundreds of commits behind current `main` and uses the OpenAI Responses API for each post/reply. It must not be merged wholesale.

Issue #1018 also records a reported Oct-12 local scheduler/controller/queue/RSS implementation that was never found as a pushed branch/PR. Until exact source is recovered, it remains provenance only.

V1 therefore reuses the proven concepts, not the stale branch.

## Runtime model

```
Cloudflare Cron
   ↓
AUTOMATION_QUEUE
   ↓
Hermes Automation Engine consumer
   ↓
D1 reservations / content state / publication state
   ↓
deterministic carrier renderer
   ↓
Windsor Connectors API (Threads write action)
   ↓
delayed Windsor readback → provider post ID + permalink
```

Normal loop:

- no ChatGPT scheduled invocation;
- no OpenAI API call;
- no browser session;
- no manual owner action;
- no repeated reasoning prompt.

## Current pilot policy

The `hermes_logistics` account is carrier-only.

Allowed:
- car-hauler Load Board discovery;
- deadhead / RPM education;
- route planning;
- carrier setup / broker workflow;
- documents / invoicing discipline;
- dispatch support;
- later: verified carrier-market news and Wisconsin Owner-Operator campaign only when the live opportunity is current.

Excluded:
- generic Marketing;
- generic IT;
- Academy;
- repair shops;
- beauty;
- international recruiting;
- unrelated business services.

## Generation

V1 does not use an LLM.

Each theme has compatible sets of:
- hooks;
- practical points;
- questions;
- one verified Hermes deep-link destination.

A stable hash of the Central Time slot chooses a combination. This creates a large deterministic variation space while preserving factual boundaries.

All Threads candidates:
- stay under 500 characters;
- use one Hermes-owned HTTPS destination;
- add UTM attribution;
- remain carrier-focused.

## Scheduling

Cloudflare cron may wake hourly. The worker itself enforces the current Chicago window:

- 06:00 through 01:00 Central Time;
- 02:00–05:59 Central Time is quiet.

The exact cron minute is intentionally offset from the hour to reduce synchronized load.

## Idempotency

Each slot has deterministic keys:

```
content_id       = hermes_logistics:threads:{CT slot}
idempotency_key  = hae:hermes_logistics:threads:{CT slot}
```

D1 reserves:
- run;
- content;
- publication.

Provider call happens once after reservation.

Ambiguous network/provider outcomes become `unknown_outcome` and are **not blindly retried**.

## Live publication gate

The repository example is inert:

```
HERMES_AUTOMATION_MODE=dry_run
HERMES_AUTOMATION_PUBLISH=disabled
```

Live publication requires both switches plus the private Worker secret `WINDSOR_API_KEY`.

Authenticated connector readback on 2026-10-13 confirmed the existing Hermes Logistics Windsor connection:
- Threads account id `28419597014385166`;
- account name `Hermes Logistics (hermes.logistics)`;
- write actions `create_text_post`, `create_image_post`, `create_reply`.

Windsor's public Connectors API documents direct software execution through:

`POST https://connectors.windsor.ai/threads/actions`

with `account`, `action` and `params`. Authentication is currently query-parameter based. Therefore:
- `WINDSOR_API_KEY` is a Worker secret only;
- the constructed provider URL must never be logged or persisted;
- the key never appears in D1, health payloads, GitHub, or browser code.

The documented write-action response is an acceptance/result string, not a guaranteed post-id receipt. HAE therefore does **not** mark the post verified immediately. It records `provider_accepted_readback_pending`, waits past the documented hourly refresh boundary, then reads `post_id,post_text,post_permalink,post_timestamp` from the same Windsor Threads account and matches the exact slot-unique post body.

Readback sequence:

`RESERVE → WINDSOR WRITE ONCE → ACCEPTED_PENDING → DELAY → EXACT BODY READBACK → PUBLISHED_VERIFIED`

If the provider write has an ambiguous network/5xx outcome, HAE records `unknown_outcome` and never republishes blindly.

## Health

`GET /v1/capabilities`
- engine/version;
- pilot account/platform;
- deterministic generation mode;
- whether publication is enabled;
- explicit confirmation that normal runtime does not require a ChatGPT Scheduled Task.

`GET /v1/health` — **private bearer token required**
- ready-content count;
- unknown provider outcomes;
- failed publications;
- pending provider readbacks;
- unverified readbacks;
- last run state.

`POST /v1/tick`
- authenticated manual canary;
- queues a deterministic slot;
- does not bypass dry-run/live gates.

## Free-first rule

Priority order for later content intelligence:

1. deterministic rules/templates;
2. RSS/Atom and official APIs;
3. extraction/summarization without a model where possible;
4. optional local model;
5. Workers AI only within a reviewed free/budget envelope;
6. paid frontier model only with explicit owner budget approval.

The runtime must remain useful when every model endpoint is unavailable.

## Next slices

### V1.1 — provider transport
**SOURCE IMPLEMENTED:** direct Windsor Connectors API transport plus delayed exact-body readback. Remaining proof is runtime configuration + one bounded owner-authorized canary:
`reserve → Windsor create_text_post once → accepted_pending → delayed readback → media ID + permalink`.

### V1.2 — inbound/replies
Add owned-post reply events:
`event → dedupe → deterministic FAQ/safety gate → reply or human review`.

A model is optional, not mandatory.

### V1.3 — source/news ingestion
Add:
- first-party RSS/Atom;
- official APIs;
- approved feed normalizers;
- bounded change detection.

Every source object keeps provenance, freshness, rights state and canonical URL.

### V1.4 — CRM module
Expose Automation Engine inside Hermes Connect:
- jobs;
- schedules;
- queues;
- provider health;
- last successful run;
- DLQ;
- approvals;
- brand/account policy;
- metrics.

### V2 — more destinations
Reuse the same motor for:
- Instagram;
- Facebook;
- Telegram;
- LinkedIn;
- X;
- Website Insights;
- ProgressoPro;
- Academy;
- Hermes Connect customer workspaces.

Each account receives its own strict content policy; account scopes never bleed into each other.

## Acceptance gate for the Threads pilot

A Central Time slot can be created once, rendered without an LLM, stored in D1, queued, sent once through an authorized provider adapter, read back with provider ID/permalink, and shown in health state without any ChatGPT Scheduled Task invocation.

Source/CI success is not production proof. The ChatGPT Social Publisher stays as a temporary bridge until this acceptance gate is proven live, then it should be disabled.
