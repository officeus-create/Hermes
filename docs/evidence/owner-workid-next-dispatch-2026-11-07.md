# Owner work item: next WORK_ID taken, P1 recovered, executor offline — 2026-11-07

Session: «Инструменты» (`mvs_95593c3a442f46c5be03af6aafc05758`), repo `officeus-create/Hermes`.
Production baseline: `origin/main = 732767390476afe20cb8a350acc73a384b65e869` (Pages deploy 7616028629 +
run 42339174267), HAE worker released 2026-11-07T04:36Z (run 42339174675 success).
Owner session: `hermeslogisticsus.com`, signed in as `officeus@hermeslogisticsus.com` (authenticated in the
in-app Browser; the session cookie was never read or exported).

Status labels are explicit: `RUNTIME_VERIFIED` = observed in production; `CODE_READ` = read in the
deployed source at the recorded SHA; `NOT_CAPTURED` = the value could not be captured and is not claimed.

---

## 8.1 The P1 (524) incident is over — RUNTIME_VERIFIED

The authenticated Command Center API was stalling (`524` after 125–145 s since 2026-11-07T04:09 UTC).
Measured again in the live owner session on 2026-11-07T12:06Z via the page's own network log
(`GET`/`fetch`, same session, no cache bypass):

| Route | Status | Duration |
|---|---|---|
| `GET /api/internal-command-center/work-items` | 200 | 397 ms / 847 ms |
| `GET /api/internal-command-center/projects` | 200 | 630 ms / 887 ms |
| `GET /api/internal-ai/status` | 200 | 310 ms / 317 ms |
| `GET /api/internal-command-center/execution-map` | 200 | 1244 ms |
| `GET /api/internal-command-center/processes` | 200 | 593 ms |
| `GET /api/internal-command-center/reports` | 200 | 475 ms |
| `GET /api/internal-command-center/owner-intelligence` | 200 | 546 ms |
| `GET /api/internal-command-center/social-acquisition` | 200 | 489 ms |
| `GET /api/internal-command-center/access` | 200 | 837 ms |
| `GET /api/internal-ai/tasks` | 200 | 427 ms |
| `GET /api/hermes-connect/account` | 200 | 1858 ms / 1894 ms |

No `524`, no failed request in the observed page load. Direct anonymous control on the same host
immediately afterwards still answers `401` in 0.106–0.240 s, so the authenticated path is genuinely
healthy and not merely open to anonymous traffic.

Consequence: the earlier hypothesis (cold-isolate DDL pipeline against a D1 writer lock) is **not**
confirmed and is now unnecessary — the stall did not reproduce for the whole observation window.
Recorded as an open non-finding, not as a root cause.

## 8.2 `execute_plugin` for `hcwi_hist_20261105_037` — click executed, body NOT_CAPTURED

Action performed in the owner session: the card's «Запустить выбранный плагин» button
(`work-items/[id].ts` → `action:"execute_plugin"`).

Observed afterwards (`GET /api/internal-command-center/work-items/hcwi_hist_20261105_037`, authoritative):

```
"status": "in_progress",
"linked_task_id": "hcai_e2961db4-11e7-4968-ba3c-1128a7a91846",
"hae_job_id": null, "hae_plan_job_id": null, "hae_execution_job_id": null,
"hae_dispatch_state": null, "hae_dispatch_result": null,
"updated_at": "2026-11-07T03:11:04.857Z",
"plugin_execution": {"state":"PLUGIN_SELECTED_NOT_EXECUTED","reason":null,"job_id":null,"receipt_verified":false}
```

`updated_at` is unchanged since the earlier dispatch at 03:11:04.857Z ⇒ **the PATCH produced no D1 write**
at all: it failed before `UPDATE hermes_owner_work_items SET hae_job_id=…`.

The PATCH *response body* is `NOT_CAPTURED`: the UI handler shows the failure through
`alert(String(x.d?.plugin_execution?.reason||x.d.error))`; the native Electron dialog blocked the tab
(`BROWSER_SESSION_POISONED` on the follow-up network query) and the provider does not surface dialog
text. The body is therefore not claimed here.

What the code path says (`CODE_READ`, deployed main `732767390`):

1. `execute_plugin` → `submitCommandCenterHaeExecution` → `buildCommandCenterHaeJobRequest`:
   `routePlan()` for `hermes-agent-coordinator v0.1.102` → `ROLE_JOB_MAP` gives
   `work.portfolio.reconcile`; the role contract matches (`READ_ONLY`, not semantic-required) ⇒ plan `ok`.
2. `expectedIdempotencyKey` needs `linked_task_id` — 037 **has** one (`hcai_e2961db4…`), so unlike
   022/045 the key is computable and the failure is *not* local.
3. The next call is `haeJson(env,"/v1/jobs",{method:"POST"})`. Two possible runtime reasons:
   * `HERMES_AUTOMATION_BASE_URL`/`HERMES_AUTOMATION_TOKEN` not set in the production Pages env ⇒
     `{ok:false,status:503,payload:{error:"command_center_hae_bridge_not_configured"}}` ⇒
     top-level `error` = `command_center_hae_bridge_not_configured`;
   * env set but the engine exposes no control plane ⇒ the engine's host guard answers
     `404 {"success":false,"error":"not_found"}` (measured below) ⇒ top-level `error` = `not_found`.
   Both paths return `409` with `plugin_execution.state = "PLUGIN_EXECUTION_UNAVAILABLE"`.
   Which of the two applies was **not** determined: the Pages env vars are not readable from here and
   the bridge reads them only server-side. The owner chose «Только D1-readback» earlier, so no Pages
   secret is set for this purpose.

Measured directly (anonymous, no credential needed — the engine host guard runs before auth):

```
POST https://hae-node.hermeslogisticsus.com/v1/jobs   → 404 {"success":false,"error":"not_found"}  (0.10 s)
GET  https://hae-node.hermeslogisticsus.com/v1/jobs/job:83651a18-102e-4cc6-bce1-eeaffeefd652
                                                          → 404 {"success":false,"error":"not_found"}  (0.13 s)
```

i.e. the engine has **no** public control-plane route for job submission or job readback
(`workers/automation-engine/src/index.mjs` host guard: every path outside `/v1/nodes/windows/*` on that
hostname returns `404`, with no D1 event recorded).

## 8.3 The dispatch slot was blocked by a 9-hour stale task — RUNTIME_VERIFIED

`GET /api/internal-ai/status` (2026-11-07T12:05Z):

```
"runtime": {"online": false, "last_seen_at": "2026-09-18T17:00:11.653Z",
            "repo_sha": "906f4080afa8507ae872d4a8c3fdd731cb5ad216",
            "runtime_version": "codex-cli 0.152.1", "primary_executor": "windows",
            "primary_executor_verified": false, "heartbeat_executor": "mac"},
"active_task": {"id": "hcai_e2961db4-11e7-4968-ba3c-1128a7a91846", "status": "queued",
                "created_at": "2026-11-07T03:11:04.857Z", "started_at": null, "updated_at": "2026-11-07T03:11:04.857Z"}
```

Two independent blockers, both measured:

* the only active Hermes AI task was still `queued` since 03:11Z, and `dispatch` inserts a task only
  `WHERE NOT EXISTS (… status IN ('queued','running','needs_approval'))` ⇒ **every new dispatch was
  guaranteed to fail with `409 active_task_exists`**;
* the executor itself is offline — `runtime.online=false`, last heartbeat 2026-09-18T17:00:11Z. The
  AI Connect page shows the same: «СРЕДА ВЫПОЛНЕНИЯ · Runner: Офлайн · Ожидаем Mac runner».

The stale task was cancelled through the product's own control (AI Connect → «Отменить задачу»):
`PATCH /api/internal-ai/tasks/hcai_e2961db4-11e7-4968-ba3c-1128a7a91846` → **200, 340 ms**.
The task had never started (no branch, no PR, no evidence), the work item and its prompt stay in D1, and
`dispatch` explicitly allows re-dispatch of a `cancelled` task — so this is reversible, not a deletion.

## 8.4 Next WORK_ID taken — RUNTIME_VERIFIED

`hcwi_hist_20261105_004` — P0, operations, project `plugin-workforce`, source
`GitHub PR #2295` «Complete selected plugin → HAE → D1 receipt bridge»
(next_action: «Close exact-head CI, obtain independent review, release the parent chain, then prove one
real WORK_ID→HAE job→D1 receipt→owner readback»).

Action: «Запустить Hermes AI» on that card.

```
PATCH https://hermeslogisticsus.com/api/internal-command-center/work-items/hcwi_hist_20261105_004
      → 200, 332 ms   (network log, same owner session)
```

Resulting state (`GET …/work-items/hcwi_hist_20261105_004`):

```
"status": "in_progress",
"linked_task_id": "hcai_2f3fc9ce-b4e8-44f6-9dfd-71fa768280ea",
"linked_task_status": "queued", "linked_task_started_at": null,
"updated_at": "2026-11-07T12:27:50.778Z",
"plugin_route": {"policy_version":"command-center-route-v1","basis":"workstream:operations",
                 "owner":{"role_id":"hermes-automatic-engineer","plugin_version":"0.1.42"},
                 "helpers":[hermes-agent-coordinator v0.1.102, hermes-qa-evidence-auditor v0.1.28]},
"hae_job_id": null, "hae_plan_job_id": null, "hae_execution_job_id": null,
"plugin_execution": {"state":"PLUGIN_EXECUTION_UNAVAILABLE",
                      "reason":"safe_role_contract_mapping_missing","job_id":null,"receipt_verified":false}
```

`GET /api/internal-ai/status` confirms the new active task
`hcai_2f3fc9ce-b4e8-44f6-9dfd-71fa768280ea` (`queued`, created 12:27:50.778Z, `cancel_requested=false`).

**New blocker found while taking the item (CODE_READ + observed):** `dispatch` auto-selects the plugin
route per workstream, and for `operations` it chose `hermes-automatic-engineer v0.1.42`. The bridge's
`ROLE_JOB_MAP` contains exactly one entry — `hermes-agent-coordinator → work.portfolio.reconcile` — so
for every other selected plugin `routePlan()` fails with `safe_role_contract_mapping_mapping_missing`
before any HAE call. Only items whose route owner is `hermes-agent-coordinator` can ever be submitted,
and even those need a control-plane host that does not exist (§8.2).

## 8.5 The executor cannot be restarted from this machine — owner-gated credential

The local outbound runner is `scripts/ai/hermes-internal-ai-runner.py` (550 lines, repository-local,
part of the «Инструменты» lane). Its contract:

```
HERMES_INTERNAL_AI_API=https://hermeslogisticsus.com
HERMES_INTERNAL_AI_RUNNER_TOKEN=<scoped secret stored locally only>
```

Searched on this Mac: no such variable in the environment; no `.env*` in the repo carrying it
(only `.env.example`, 0 matches); not in `~/HAE/config/hermes-ai-access.env` (contains only
`VIKTOR_CF_ACCESS_*` keys); no Keychain item under `hermes-internal-ai-runner` /
`HERMES_INTERNAL_AI_RUNNER_TOKEN`; no launchd plist for it (`~/Library/LaunchAgents` holds only
`com.hermes.ai.access-bridge`, `com.hermes.ai.tunnel`, `com.hermes.fcc-router`,
`com.hermes.viktor.dashboard`, `com.hermes.viktor.worker`; `com.hermes.fcc-router` currently exits 126).

Server-side the runner endpoints compare the same secret (`requireInternalAiRunner`,
`functions/api/_lib/internal-ai.mjs:262+`), so a working copy must exist in Cloudflare Pages — but I
cannot read it from here, and it must not be pasted into chat. **Restoring the Mac executor therefore
requires an owner action** (provision the scoped token locally / install the launchd job). Owner auth for
the Command Center API itself is cookie-session only (`requireInternalOwner` → `getAuthenticatedSpecialist`),
so there is no token path for direct API capture either.

Consequence, stated plainly: the queued task `hcai_2f3fc9ce…` will not start until the Mac runner is
back. The dispatch is real and recorded; the execution is pending the owner's credential step.

## 8.6 Engine-side gap that remains for every receipt (CODE_READ + observed)

Today's engine plan jobs all end fail-closed at the semantic step. Observed on live rows
(`updated_at 2026-11-07T12:20:16Z`):

* `hcwi_hist_20261105_042` (academy) — plan `job:cbc8fb17-f46c-4ea1-a27d-8b2ca312d890`,
  `hae_execution_job_id=null`, `hae_dispatch_state=NEEDS_CAPABILITY`, rationale «Local DeepSeek output
  did not safely select an allowlisted HAE capability; VIKTOR downgraded the plan fail-closed.»
* `hcwi_hist_20261105_021` (operations) — plan `job:d4d6c8e7-5a59-4692-bb7f-0498b7f49f82`, same
  `NEEDS_CAPABILITY` rationale.
* `hcwi_hist_20261105_045` (sales) — plan `job:83651a18-102e-4cc6-bce1-eeaffeefd652`, `NEEDS_CAPABILITY`.

The one complete cycle in the backlog is `hcwi_hist_20261105_022`: plan `job:3df326bf-8d4c-44e9-a597-9820cd312191`,
execution `job:decc3ebb-e237-4e37-8fb9-03a248d367a9`, `hae_dispatch_state=EXECUTION_SUCCEEDED`,
`hae_dispatch_result.disposition=EXECUTE_EXISTING_CAPABILITY`, `recommended_job_type=search.snapshot.evaluate`.

That succeeded execution still shows `PLUGIN_ROUTE_VERSION_DRIFT / command_center_idempotency_identity_invalid`
on the card, because the deployed bridge (`main`) expects the `hae:cc:v1:<sha>` identity while the engine
produced the `hae:owner-work-exec:<item>:<planJob>:<jobType>` identity. That mismatch is exactly what the
open PR #2313 (`feat/command-center-hae-d1-readback-20261107`, head `5a32c34f9`, CI 13/13 green) replaces
with a D1-first readback in the `owner_work` scheme. Until #2313 is merged and deployed, the per-card
verified receipt cannot turn green — the underlying D1 receipt already exists.

## 8.7 What is left for the owner

| Item | Why it is the owner's | Evidence |
|---|---|---|
| Restore the Mac Hermes AI runner (scoped token + launchd job) | credential provisioning | §8.3, §8.5 |
| Merge + deploy PR #2313 | merge / production deploy are owner-gated | §8.6; CI green; independent gate 36/36 delivered to the Command Center session |
| Decide whether `hermes-automatic-engineer` / `hermes-academy` routes need allowlisted HAE job types | product contract decision | §8.4 |
| Rotate the exposed Drive rclone token | credential rotation | earlier session finding |
