# Hermes Automation Engine — Engine Benchmark Plan

Date: 2026-10-13  
Owner: #1018 Growth Bridge  
Goal: choose one durable automation runtime for Hermes that can operate at **$0 incremental cost at current pilot volume** and can later be embedded into Hermes Connect.

## Rule

"Free" means:
- no required paid SaaS subscription for the current pilot;
- no paid LLM required for the normal loop;
- no hidden dependency on ChatGPT Scheduled Tasks;
- no paid automation seat required;
- no paid social scheduler required;
- infrastructure must fit inside already-available or free-tier capacity at measured pilot volume.

It does **not** mean infinite free capacity forever.

## Current provider-cost finding

Authenticated Windsor readback on 2026-10-13 reports the Hermes profile as:

- plan_id: `TRIAL`
- plan_name: `Trial`
- is_paid: `false`

Therefore Windsor is acceptable as a **migration/canary transport**, but it does **not** satisfy the long-term "$0 durable engine" requirement by itself because trial continuity is not production evidence.

The long-term carrier Threads transport target is the official Meta Threads API behind the same HAE adapter boundary. Meta's official Threads Postman workspace confirms programmatic text publishing and replies through OAuth. HAE must benchmark/directly support that route before the final engine is declared free of third-party scheduler/provider dependency.

This changes the provider plan, not the engine architecture:

```
HAE runtime: Cloudflare + canonical Hermes Connect D1 + Queues
pilot transport: Windsor (existing connected account)
target transport: Meta Threads API direct
```

Windsor and direct Meta must never publish concurrently for the same Hermes slot. Migration is a controlled cutover with one active transport at a time.

## Engines to compare

### A. Native Hermes / Cloudflare
Cron + Queues + the existing canonical Hermes Connect D1 + Workers + optional Workflows.

Expected strengths:
- already aligned with Hermes infrastructure;
- durable state under Hermes control;
- easy CRM embedding;
- no extra control plane;
- queue/DLQ/idempotency can be first-class.

Risk:
- more engineering work for platform adapters.

### B. Activepieces self-hosted
Use only as a benchmark/runtime candidate.

Expected strengths:
- many integrations;
- visual workflows;
- fast experimentation.

Risk:
- another source of truth;
- hosting/maintenance;
- connector behavior and license terms must be reviewed before adoption.

### C. n8n self-hosted
Use only as a benchmark/runtime candidate.

Expected strengths:
- mature workflow ecosystem;
- easy webhook/API composition.

Risk:
- another orchestration state store;
- fair-code/license constraints;
- self-hosting is not operationally free if a dedicated server is needed.

### D. Mixpost Lite / social-specialized component
Benchmark only for social scheduling/provider abstractions.

Expected strengths:
- social-first data model;
- Lite codebase has a permissive license at the time of review.

Risk:
- not a general Hermes task engine.

### E. Postiz
Benchmark as an external/self-hosted social publisher.

Expected strengths:
- broad social publishing UX and provider abstractions.

Risk:
- AGPL obligations;
- not the canonical Hermes task engine;
- must not become a second uncontrolled scheduler.

## Common benchmark workload

Every candidate must execute the **same** carrier-only Threads pilot:

1. receive slot event;
2. deduplicate slot;
3. generate post without paid LLM;
4. enforce @hermes.logistics car-hauling policy;
5. reserve idempotency;
6. perform one provider call;
7. read back provider ID/permalink;
8. ingest one owned-post comment;
9. classify deterministic safe reply vs human review;
10. write metrics and final state;
11. surface health;
12. survive one injected provider failure without duplicate publication.

## Scorecard

Score 0–5 for each:

| Criterion | Weight |
|---|---:|
| $0 incremental pilot cost | 15 |
| Durable retries / waits | 10 |
| Idempotency / exactly-once safety | 10 |
| Provider adapter quality | 10 |
| CRM embeddability | 10 |
| Security / secret isolation | 10 |
| Observability / health / DLQ | 10 |
| Portability | 5 |
| License fit | 5 |
| Developer maintenance burden | 5 |
| No-LLM operation | 5 |
| Multi-brand policy isolation | 5 |

Total: 100.

## Hard rejection gates

Reject an engine regardless of score if it requires:
- browser-cookie automation for normal social writes;
- CAPTCHA bypass;
- committing provider secrets;
- blind retry after ambiguous publish;
- paid LLM for ordinary scheduling;
- paid automation subscription for the pilot;
- a second uncontrolled Hermes source of truth;
- public customer/candidate PII in workflow logs;
- license use incompatible with Hermes deployment.

## Cloudflare free-tier budget for the first pilot

Official Cloudflare limits reviewed on 2026-10-13:

- Workers Free: 100,000 requests/day; 5 Cron Triggers/account.
- Queues Free: 10,000 standard operations/day; Free retention is 24 hours.
- D1 Free: 5,000,000 rows read/day; 100,000 rows written/day; 5 GB total storage.
- Queue `delaySeconds` supports up to 24 hours.

Current HAE carrier pilot has 20 eligible publish slots/day.

Worst-case planned queue envelope per slot:
- one content-plan message: write + read + delete ≈ 3 operations;
- up to four readback attempts: 4 × (write + read + delete) ≈ 12 operations.

That is roughly **300 queue operations/day** at the maximum V1 readback plan before recovery/admin traffic, around 3% of the current Queues Free daily allowance.

D1 writes are also expected to remain orders of magnitude below 100,000/day. This is an engineering estimate, not billing proof. The 7-day benchmark must record actual Worker, Queue and D1 metrics.

Free-first acceptance:
- normal pilot stays below 25% of each current free daily limit;
- warning at 25%;
- automatic nonessential-work shedding at 50%;
- no automatic upgrade or paid-resource activation.

References:
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/queues/platform/pricing/
- https://developers.cloudflare.com/queues/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/

## Test sequence

### Test 1 — dry-run
100 scheduled jobs, zero provider writes.

Measure:
- duplicate suppression;
- job latency;
- CPU/runtime;
- state correctness;
- failure recovery.

### Test 2 — provider sandbox/canary
5 owner-approved posts across separated slots.

Measure:
- provider success;
- ID/permalink readback;
- duplicates;
- retries;
- operator intervention.

### Test 3 — inbound
20 synthetic comments + up to 5 real owned-post comments.

Measure:
- dedupe;
- safe deterministic reply accuracy;
- human escalation precision;
- no unsolicited DM.

### Test 4 — 7-day unattended run
Run without owner intervention.

Measure:
- uptime;
- missed slots;
- duplicate posts;
- stale auth;
- queue backlog;
- DLQ;
- incremental cost.

## Selection rule

Do not select by feature count.

Select the engine that:
1. passes every hard gate;
2. has the lowest operational complexity;
3. stays at $0 incremental cost for measured Hermes pilot volume;
4. can become a native Hermes Connect Automation module without maintaining two competing control planes.

The default hypothesis is Native Hermes/Cloudflare, but the benchmark must be allowed to disprove that hypothesis.
