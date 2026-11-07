# Production D1 receipt visibility in Command Center — 2026-11-07

Status: **CODE_READ + RUNTIME_VERIFIED (production reads)**. No merge, no deploy, no D1 write,
no credential change, no public communication in this document.

Scope: this session ("Инструменты") owns measurements, read-only production evidence and
repository-local proof harnesses. Command Center application code, Cloudflare configuration and
production deploys belong to the "Командный центр" session.

---

## 1. What the owner asked for

> "Закрой production proof HAE и покажи первый настоящий D1 receipt в Command Center."

Production proof HAE is closed (`runtime_readonly_proof`, run `42289080275`, PASS + independent QA).
This document records the *receipt visibility* part: what a real production D1 receipt looks like
from the Command Center, and exactly which gate still blocks a per-card **verified** receipt.

---

## 2. Correction to an earlier statement in this session

Earlier in this session the blocker was described as *"Pages prod env lacks `HERMES_AUTOMATION_BASE_URL`
/ `HERMES_AUTOMATION_TOKEN`; set them and the bridge works"*. **That is not sufficient and, with the
current production deployment, it cannot work at all.** The reason is structural, not a missing secret:

| Fact | Source | Production consequence |
|---|---|---|
| The HAE worker has exactly **one** route: `hae-node.hermeslogisticsus.com`; `workers_dev: false`, `preview_urls: false` | `workers/automation-engine/wrangler.jsonc.example` (the release workflow renders the production config from this file) | there is no public control-plane host |
| `HERMES_WINDOWS_NODE_HOST=hae-node.hermeslogisticsus.com` and the fetch handler answers **404 `not_found`** for every path that does not start with `/v1/nodes/windows/` | `workers/automation-engine/src/index.mjs:2712-2715` | `POST /v1/jobs` and `GET /v1/jobs/{id}` are unreachable from outside the worker |
| Live probes: `GET https://hae-node.hermeslogisticsus.com/v1/jobs` → `404 not_found`; `/v1/jobs/job:83651a18-…` → `404 not_found`; `/v1/nodes/windows/status` → `401 windows_node_auth_required` | production probe (read-only, no credentials) | confirmed: the router is alive, the control plane is not published |
| The queue consumer accepts only `github.ci.audit`, `github.ci.patch.propose`, `github.ci.qa.verify`, `job.submit.runtime_proof` (only `job_type=system.health.snapshot`, `project_key=hae-runtime-proof`), `job.execute`, `content.plan`, `publication.readback` | `workers/automation-engine/src/index.mjs:2660-2678`, `937-955` | there is no generic external submission channel either |

Consequence: setting Pages production env variables can only turn the current failure from
`503 command_center_hae_bridge_not_configured` into `502/504 command_center_hae_bridge_unavailable`.
A **bridge-shaped** receipt therefore requires a Cloudflare-owned change (a published control-plane
route/hostname for the engine, or a Pages→engine service binding) — that is owner-gated and is a
Cloudflare/DNS decision, not a code review.

---

## 3. Real production D1 receipts that already exist

### 3.1 Command Center "HAE events — safe event timeline" (visible to the owner today)

Source: `GET /api/internal-command-center/execution-map` → `hae_recent_events`,
`source_state = CONNECTED_CANONICAL_HAE_D1`, rows read from `hermes_automation_job_events` joined to
`hermes_automation_jobs` (`functions/api/internal-command-center/execution-map.ts:53-57`), rendered by
`src/pages/services/hermes-connect/internal/command-center/index.astro:305-319`.

Observed in the owner's session on 2026-11-07 (local time, UTC+2):

```
work.item.plan              job.succeeded              RUNNING → SUCCEEDED   complete        04:33
work.item.plan              job.windows_node_succeeded RUNNING → SUCCEEDED   complete        04:33
work.item.plan              job.windows_node_leased    WAITING_FREE_AI → RUNNING  windows_free_ai  04:31
work.item.plan              job.waiting_free_ai        RUNNING → WAITING_FREE_AI  free_ai      04:30   (error_class windows_node_required)
work.item.plan              job.started                QUEUED → RUNNING      execute         04:30
work.item.plan              job.created                — → QUEUED             dispatch        04:30
system.health.snapshot      job.succeeded              RUNNING → SUCCEEDED   complete        04:17
system.health.snapshot      job.succeeded              RUNNING → SUCCEEDED   complete        03:17
system.health.snapshot      job.succeeded              RUNNING → SUCCEEDED   complete        02:17
search.snapshot.evaluate    job.succeeded              RUNNING → SUCCEEDED   complete        02:18
logistics.source.freshness.audit job.succeeded         RUNNING → SUCCEEDED   complete        02:18
hae.self.improvement.audit  job.succeeded              RUNNING → SUCCEEDED   complete        02:18
```

These are durable `job.succeeded` rows in the canonical production D1
(`hermes-connect-prototype`, the same database the Command Center reads). **This is the first real
D1 receipt visible in the Command Center.**

Two honest limits of that surface:
* the timeline renders job type, event type, state transition, step, error class and timestamp — it
  **does not render `job_id`** (`index.astro:313-318`), although the API payload carries it;
* it is an event stream, not a per-work-item receipt.

### 3.2 Per-work-item engine receipt (present in the API, invisible in the UI)

`GET /api/internal-command-center/work-items` (production, 200) returns for
`hcwi_hist_20261105_045`:

```
plugin_route        : policy command-center-route-v1 · state PLUGIN_SELECTED_NOT_EXECUTED
                      source_class PRIVATE_PLUGIN_CREATOR_READBACK
                      registry_observed_at 2026-11-05T18:22:10.814Z
                      owner hermes-agent-coordinator@0.1.102
                      helpers hermes-qa-evidence-auditor@0.1.28
hae_job_id          : job:83651a18-102e-4cc6-bce1-eeaffeefd652
hae_plan_job_id     : job:83651a18-102e-4cc6-bce1-eeaffeefd652
hae_execution_job_id: null
hae_dispatch_state  : NEEDS_CAPABILITY
hae_dispatch_result : disposition NEEDS_CAPABILITY · recommended_job_type null
                      rationale "Local DeepSeek output did not safely select an allowlisted HAE capability. VIKTOR
                                downgraded the plan: contract follow-up, publish only verified proof and route qualified
                                accounts to contract follow-up."
                      next_action "Connect lead intake to a standardized media-plan deliverable, capture feedback
                                   permission, publish only verified proof and route qualified accounts to contract follow-up."
```

The Command Center card renders **none** of `hae_dispatch_state`, `hae_dispatch_result`,
`hae_plan_job_id`, `hae_execution_job_id` (`index.astro:380-383`): the card only shows
`"Plugin receipt: verifying HAE job…"` when `hae_job_id` is set, and that string is refreshed by a
per-item HTTP readback.

---

## 4. Why the per-card receipt still cannot be shown

### 4.1 The per-item endpoint 1102s on exactly the items that have a job

Read-only production fetch in the owner's session:
`GET /api/internal-command-center/work-items/hcwi_hist_20261105_022` → **Error 1102**
"Worker exceeded resource limits", Ray ID `a5696f3dbe6e24c5-KBP`, `2026-11-07 04:01:03 UTC`.

`022` is the item that owns a HAE job (`job:decc3ebb-e237-4e37-8fb9-03a248d367a9`, recorded earlier in
this session), i.e. the only
kind of item whose readback performs the **outbound** `GET /v1/jobs/{id}` against the configured
control-plane base URL. Items without `hae_job_id` return early
(`command-center-hae-bridge.mjs`, `readCommandCenterHaeExecution`) and read fine; the list endpoint
returns 200.

The deployed bridge already bounds the call with `AbortSignal.timeout(haeBridgeTimeoutMs(env))`
(default 8000 ms, bounds 250–30000, `main:functions/api/_lib/command-center-hae-bridge.mjs`), yet the
1102 persists. So the stall is **not** covered by the fetch timeout (DNS/connect phase or platform CPU
accounting) — bounding the call further does not fix it. The outbound readback has to go away.

### 4.2 The engine read model does not return `payload_json` — the verifier can never pass

`verifyCommandCenterHaeReceipt` requires the job payload:
`command-center-hae-receipt-verifier.mjs:131-133`
(`const payload = parseObject(haeJob.payload_json); const receipt = parseObject(haeJob.result_json);
if (!payload || !receipt) return hold("RECEIPT_MISSING_OR_INVALID")`).

The engine's read model — the one the HTTP bridge consumes — is `getGenericJob`
(`workers/automation-engine/src/index.mjs:1454-1465`):

```sql
SELECT job_id,job_type,business_lane,account_key,project_key,state,current_step,available_at,
       attempt_count,max_attempts,idempotency_key,policy_version,payload_json,result_json,
       last_error_class,created_at,updated_at,completed_at
FROM hermes_automation_jobs WHERE job_id=? LIMIT 1;
```

(`payload_json` is mandatory — see §4.2.)

`payload_json` is **not** in that list, so `parseObject(undefined)` returns `null` and the verdict is
always `RECEIPT_MISSING_OR_INVALID` — **even if a control-plane route existed and the bridge call
succeeded.** The payload itself *is* persisted correctly: `createGenericJob` injects
`_role_contract` into the payload (`index.mjs:739-746`) and stores it in `payload_json`
(`index.mjs:769-782`).

⇒ A D1 readback must select `payload_json` explicitly. That makes the direct-D1 path not merely
cheaper than the HTTP path, but the only path that can currently satisfy the verifier. The HTTP path
would additionally need an engine change (add `payload_json` to `getGenericJob`) plus a HAE deploy.

Governance note: `payload_json` contains work-item text for engine-created jobs. It must be used
server-side for verification only and never rendered into the page.

### 4.3 The two job identity schemes do not match

The engine's own intake creates jobs (`workers/automation-engine/src/owner-work-runtime.mjs`):

| | engine intake (live, proven) | Command Center bridge (designed) |
|---|---|---|
| `project_key` | `command-center-owner-work` / `command-center-owner-work-execution` | `command-center-plugin-route` |
| `policy_version` | `owner-work-dispatch-v1` (`OWNER_WORK_DISPATCH_POLICY`) | `command-center-plugin-bridge-v1` |
| `idempotency_key` | `hae:owner-work-plan:<item>:<version>` / `hae:owner-work-exec:<item>:<planJobId>:<job_type>` | `hae:cc:v1:<sha256(canonical identity)>` |
| payload identity | contract-shaped work portfolio payload + `owner_work_id` / `owner_plan_job_id` | `source_kind=CHATGPT_SELECTED`, `snapshot_id=command-center:<item>:<linked_task>`, `tasks[0].writer_key=internal-ai:<linked_task>`, `source_ref=chatgpt-selected://command-center/<item>` |

The verifier requires the **bridge** scheme end to end:
`command-center-hae-receipt-verifier.mjs:115-127` (`IDEMPOTENCY_BINDING_MISMATCH`,
`CANONICAL_JOB_IDENTITY_MISMATCH`), `:131-145` (`SOURCE_PAYLOAD_BINDING_MISMATCH`), and requires
`binding.linked_task_id === workItem.linked_task_id` (`:87-92`).

Therefore a D1 readback of an **engine-created** job would still be held by the existing verifier —
correctly, because it is a different identity. The receipt must declare which scheme it is; the
existing bridge branch must not be loosened.

---

## 5. The shortest path that needs no owner infrastructure

The Command Center **already binds the same production D1** and already reads HAE tables from it:

* `functions/api/internal-command-center/reports.ts:41-45` → `hermes_automation_jobs`
* `functions/api/internal-command-center/execution-map.ts:53-57` → `hermes_automation_job_events` + `hermes_automation_jobs`
* `functions/api/internal-command-center/owner-intelligence.ts:59-61` → `hermes_automation_jobs`
* `functions/api/internal-command-center/processes.ts:22-33` → `hermes_automation_jobs`

So a receipt readback needs **no new secret, no new hostname, no DNS and no Cloudflare change**: the
engine's own read model is already mirrored in Pages
(`workers/automation-engine/src/index.mjs:1454-1465`, `getGenericJob`):

```sql
SELECT job_id,job_type,business_lane,account_key,project_key,state,current_step,available_at,
       attempt_count,max_attempts,idempotency_key,policy_version,result_json,last_error_class,
       created_at,updated_at,completed_at
FROM hermes_automation_jobs WHERE job_id=? LIMIT 1;

SELECT event_id,job_id,event_type,from_state,to_state,step,evidence_ref,provider_ref,error_class,created_at
FROM hermes_automation_job_events WHERE job_id=? ORDER BY created_at ASC LIMIT 100;
```

Proposed shape (Command Center session owns the code):

1. `readCommandCenterHaeExecution` reads the job + events from `env.DB` first (same SQL as
   `getGenericJob`) instead of calling the unreachable control plane. Keep the HTTP path only as an
   explicit fallback, and map a failure to a reason that names the missing control-plane route
   (`command_center_hae_control_plane_not_published`) instead of a generic 1102/502.
2. Run the **existing** `verifyCommandCenterHaeReceipt` against the D1-sourced job/events for
   bridge-shaped jobs (unchanged branch, unchanged strictness).
3. Add an explicit second branch for engine-shaped jobs, keyed on
   `project_key = command-center-owner-work-execution` and
   `idempotency_key LIKE 'hae:owner-work-exec:%'`, binding to `work_item_id` +
   `payload.owner_work_id` + `payload.owner_plan_job_id` instead of `linked_task_id`. Report
   `identity_scheme: "bridge" | "owner_work"` in `plugin_execution`.
4. Render on the card what the API already returns: `hae_job_id`, `hae_dispatch_state`,
   `hae_dispatch_result.disposition`, `.rationale`, `.next_action`
   (`index.astro:380-383` currently drops them), and render `job_id` in the HAE event timeline
   (`index.astro:313-318`).

Effect: items `022` (execution succeeded), `045` (plan receipt with rationale) and every future
engine-executed item show a real production D1 receipt in the Command Center, and the 1102 on the
per-item endpoint disappears because no outbound call remains.

The alternative — publishing a real control-plane route for the engine and setting the two Pages
secrets — keeps the bridge shape untouched but is a Cloudflare/DNS decision (owner-gated).

---

## 6. Status ledger for this document

| Claim | Status |
|---|---|
| Production proof HAE (runtime read-only proof) | RUNTIME_VERIFIED (closed earlier, run `42289080275`) |
| Real production D1 receipts exist and are visible in Command Center (HAE event timeline) | RUNTIME_VERIFIED (owner session, 2026-11-07) |
| Per-card engine receipt present in API payload (045) | RUNTIME_VERIFIED |
| No public control-plane host for the engine | CODE_READ + live probe (404) |
| Per-item endpoint 1102 on items with `hae_job_id` | RUNTIME_VERIFIED (Ray `a5696f3dbe6e24c5-KBP`) |
| Two incompatible job identity schemes | CODE_READ |
| Engine read model omits `payload_json` → verifier always holds `RECEIPT_MISSING_OR_INVALID` | CODE_READ |
| D1 readback needs no owner infrastructure | CODE_READ (Pages already reads the same D1) |
| Per-card **verified** receipt (`PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED`) | NOT OBSERVED — requires the Command Center code change in §5 (and/or a Cloudflare route) |

No production write, no credential use, no deploy and no merge was performed to produce this evidence.
