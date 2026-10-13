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

## Fresh open-source benchmark evidence — 2026-10-13

GitHub repository readback on the review date:

| Candidate | Repository | Stars (snapshot) | License finding | Hermes implication |
|---|---|---:|---|---|
| Postiz | `gitroomhq/postiz-app` | 37,106 | AGPL-3.0 | Strong social-product reference, but copying/modifying it inside a network service carries AGPL obligations. Keep as architecture/provider reference or separately compliant service, not a casual code source. |
| Activepieces | `activepieces/activepieces` | 25,026 | Core outside listed enterprise paths is MIT; enterprise directories have separate terms | Good reference for workflow/piece abstractions. Reuse only clearly MIT-covered core patterns/code and keep Hermes state canonical. |
| n8n | `n8n-io/n8n` | 207,167 | Sustainable Use License for non-EE code; EE code separately licensed | Suitable internal benchmark/prototyping candidate, but not a permissive source to absorb wholesale into Hermes. |
| Mixpost | `inovector/mixpost` | 3,806 | MIT | Best permissive social-specific code/reference candidate among this set. |

All four repositories were public and non-archived in the 2026-10-13 readback. Star counts are a dated adoption signal only, not a quality score.

**Benchmark decision so far:** none of these replaces the HAE control plane. Their best value is selective pattern/provider research. Native Hermes/Cloudflare remains the leading runtime hypothesis because it reuses the canonical D1, existing deployment/security model and CRM ownership without introducing another source of truth. Mixpost and MIT-covered Activepieces core are the safest code-level references; Postiz/n8n require stricter license boundaries.

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

## 2026-10-13 durable-execution research delta

### Cloudflare Workflows — ADAPT selectively, not as the default queue for every job

Current official limits/pricing:
- available on Workers Free;
- 3,000 Workflow steps/day on Free;
- 100,000 invocations/day shared with Workers requests;
- 1 GB Workflow state storage;
- completed Workflow state retention is 3 days on Free;
- durable sleep can run up to one year.

Decision:
- keep Cron + Queues + D1 as the default high-volume HAE execution substrate;
- use Cloudflare Workflows later for low-volume, long-lived chains such as approvals, multi-hour waits, or external processes that benefit from durable sleep/waitForEvent;
- persist canonical business/job history in D1, not in short-retention Workflow state.

### DBOS — LEARN, do not install into HAE now

DBOS is MIT-licensed and has strong workflow/step checkpoint and durable-sleep semantics, but its normal architecture requires Postgres. Hermes is already standardized on Cloudflare/D1 for this engine. Replacing D1/Queues with Postgres only to gain DBOS would violate the smallest-runtime rule.

Pattern to reuse:
- named steps;
- checkpointed outcomes;
- durable sleeps;
- resume from the last completed step;
- debounce/coalescing for noisy events.

### Restate — LEARN, do not add another runtime now

Restate provides durable execution and reliable/exactly-once communication semantics, but it requires an additional service/runtime. Its reliability model is valuable as a reference for HAE idempotency, durable state transitions and recovery, not as another control plane for the current pilot.

### Windmill — NO EMBED

Windmill is useful as a workflow/UI reference, but its AGPL/community/commercial embedding terms and self-hosting footprint make it a poor default substrate for embedding HAE into proprietary Hermes Connect. Learn the operator UX/patterns only.

## Additional open-source disposition — 2026-10-13

These projects are useful inputs, but none should become a second Hermes control plane before the HAE core pilot is live:

- **Temporal — LEARN.** MIT-licensed and a strong reference for durable workflow histories/retries, but self-hosting adds a separate service/data plane that Hermes does not need for the current Cloudflare+D1 pilot.
- **Hatchet — LEARN.** Strong background-task/durable-workflow/observability model, but self-hosting is another orchestration platform. Reuse concepts such as concurrency controls, retries and run visibility, not the runtime.
- **Trigger.dev — LEARN.** Self-hosting is supported, but the operator owns infrastructure, updates, security, scaling and reliability. HAE should copy no code merely to gain a UI/runtime that Cloudflare primitives already cover.
- **Inngest — LEARN / NO EMBED SERVER.** SDKs are Apache-2.0, while the server/CLI use SSPL plus delayed Apache publication. Its event/function ergonomics are useful reference material; do not make its server the Hermes canonical engine.
- **Mixpost Lite — LEARN PROVIDER UX.** MIT-licensed and social-first; useful for understanding account/provider abstractions and scheduling UX. Do not install it as a second Hermes scheduler.
- **Postiz — LEARN ONLY.** AGPL-3.0 and a larger Postgres/queue stack. No code copy into proprietary Hermes and no second publisher.
- **RSSHub — LEARN / DO NOT COPY.** AGPL-3.0. Prefer official RSS/Atom feeds and small Hermes-owned normalizers. If a separate RSSHub deployment is ever considered, perform a license/deployment review first.
- **changedetection.io — LEARN CHANGE-DETECTION PATTERNS.** Its API exposes a mature watch model, but the repository also has active licensing/commercial-use clarification. HAE's initial Source Radar should prefer cheap conditional HTTP (ETag/Last-Modified), content hashing and D1 snapshots rather than embedding another service.

Implementation consequence: Source Radar V1 should be a Hermes-owned module on Workers + D1:
`conditional fetch → canonicalize → hash → compare → relevance gate → event`.
Only sources with a real change create downstream work.

## Selection rule

Do not select by feature count.

Select the engine that:
1. passes every hard gate;
2. has the lowest operational complexity;
3. stays at $0 incremental cost for measured Hermes pilot volume;
4. can become a native Hermes Connect Automation module without maintaining two competing control planes.

The default hypothesis is Native Hermes/Cloudflare, but the benchmark must be allowed to disprove that hypothesis.
