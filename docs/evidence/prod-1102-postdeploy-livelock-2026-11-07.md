# Post-deploy finding: the Command Center 1102 livelock is NOT closed by #2311

Owner: Инструменты (tooling/evidence lane). All facts below are read-only observations
in the owner's signed-in production session plus repository/CI readback. No Command Center
production code was modified by this lane.

## Timeline

| Time (UTC) | Event | Status |
|---|---|---|
| 2026-11-06 21:59:02 | Pages production deploy run `42301103192` started for head `3b703a35` | — |
| 2026-11-06 ~22:02 | deploy run conclusion `success`; `main` = `3b703a35d87845743ad34a1a21082d190cea93ea` | **DEPLOYED** |
| 2026-11-06 21:51:19 | live 1102 on `GET /api/internal-command-center/work-items/{id}`, Ray `a56751a08c495ab6-VIE` (pre-deploy) | RUNTIME_VERIFIED |
| 2026-11-07 03:11 | `PATCH /api/internal-command-center/work-items/hcwi_hist_20261105_037` → **200** (was 503) | RUNTIME_VERIFIED |
| 2026-11-07 03:13:04 | live 1102 again on the same per-item route, Ray `a56928f2cb47ca4e-KBP` (post-deploy) | RUNTIME_VERIFIED |
| 2026-11-07 03:1x | 1102 on `/api/internal-command-center/projects`, `/api/internal-ai/status`, and on the private page render itself | RUNTIME_VERIFIED |

## What the release did fix

- `GET /api/internal-command-center/work-items` (the list) is now reliably 200
  (400-530 ms) instead of alternating 503/200.
- An anonymous request to the private route returns
  `401 {"success":false,"error":"not_authenticated"}` in **0.11 s** — the Worker body really
  executes and the CPU limit is not being hit on that path.
- The dispatch PATCH that used to answer 503 now answers **200**.

## What is still broken: the backlog-import livelock

The live 1102 continues on cold isolates. Root cause, read directly from the deployed source:

`functions/api/_lib/command-center-history-backlog.mjs` and
`functions/api/_lib/command-center-four-month-revenue-backlog.mjs` both write their
`hermes_command_center_imports` key **only after the whole backlog has landed**
(the key INSERT is the last statement of the seeder).

If a cold isolate is killed by the Workers CPU limit in the middle of the import, the key
never appears. The next cold isolate therefore replays the full backlog
(54 + 132 = 186 `INSERT OR IGNORE`), gets killed again, and the key still never appears.
That is a self-sustaining livelock: the only way the key lands is an isolate that survives
the whole import — and every attempt to get there burns CPU first.

**The fix for that loop is a count-guard**: one cheap
`SELECT COUNT(*) ... WHERE created_by='<importer>'` and, if the rows are already there,
write the import key and return instead of replaying 186 inserts.

**That guard is NOT in `main`.** Verified against the merged head:

```
git show 688e8a77:functions/api/_lib/command-center-history-backlog.mjs | grep -c "COUNT(\*) AS n"  → 0
git show origin/main:functions/api/_lib/command-center-history-backlog.mjs | grep -c "COUNT(\*) AS n"  → 0
```

The guard exists only in the follow-up commit `215935a83`
(`fix/command-center-import-livelock-20261107`, PR #2312), which was created after #2311
had already been merged and deployed. Until #2312 is merged and deployed, the production
Command Center keeps flapping 1102 on cold isolates — including on the private page render
and on the per-item receipt readback.

## Consequence for the owner's request

- The dispatch itself now works: `PATCH .../hcwi_hist_20261105_037` → 200, the work item
  moved `blocked → in progress`, a `hermes_internal_ai_tasks` row was created
  (`hcwi_e2961db4-11e7-4968-ba3c-1128a7a91846`, status `queued`), and the server-side plugin
  route was persisted:
  `owner hermes-agent-coordinator@0.1.102`, `helpers [hermes-qa-evidence-auditor@0.1.28]`,
  `policy_version command-center-route-v1`, `basis workstream:finance`,
  `source_class PRIVATE_PLUGIN_CREATOR_READBACK`, `registry_observed_at 2026-11-05T18:22:10.814Z`.
- But **no HAE job was created**: `hae_job_id = null`, `hae_plan_job_id = null`,
  `hae_execution_job_id = null`, and the readback stays
  `plugin_execution = {state: PLUGIN_SELECTED_NOT_EXECUTED, job_id: null, receipt_verified: false}`.
- The UI does not surface that failure: `mutate()` only alerts on a non-2xx PATCH, and the
  card's receipt line is rendered from the *readback*, which without `hae_job_id` always shows
  "not executed". The typed reason from the dispatch response is therefore invisible to the
  owner in the product surface — that is a separate, smaller UX gap worth fixing.
- Verified receipt (`PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED`) therefore remains
  **not yet observed in production**. The code path to it was verified line by line
  (see `prod-request-cost-profile-2026-11-06.md`, "Pre-check" section); what is missing is
  a reachable HAE job and a reachable read path.

## Why the HAE submission failed on 037 (best-supported hypothesis)

`PATCH` answered 200 in 550 ms total. That is too fast for a network call to the HAE
worker, which points at the bridge failing before any request is sent:
`automationConfig(env)` returns `null` when `HERMES_AUTOMATION_BASE_URL` is empty or
`HERMES_AUTOMATION_TOKEN` is shorter than 20 characters, and `haeJson` then returns
`503 {error: "command_center_hae_bridge_not_configured"}` without touching the network.
The Command Center bridge is the only Pages-side caller of the HAE control plane
(`grep HERMES_AUTOMATION functions/api/_lib/*.mjs` → one file), and the Pages production
deploy workflow does not inject those variables — they have to exist as Pages project
secrets/vars. This hypothesis was put to the Command Center session, which owns the
Cloudflare account; the answer is pending.

Alternative hypotheses that were checked and excluded by code reading:
- Route/contract mismatch: excluded — the route owner version is taken from the same
  registry snapshot the contract uses, and the contract for `work.portfolio.reconcile`
  declares `role_id: hermes-agent-coordinator`.
- Idempotency identity not computable: excluded for a fresh dispatch — the dispatch
  persists `linked_task_id` before the submit, and the payload passes every validator in
  `workers/automation-engine/src/work-portfolio.mjs`.

## Status labels

- Merge + deploy of #2311: **DEPLOYED** (main `3b703a35`, Pages run `42301103192` success).
- List-route availability and anonymous 401 readback: **RUNTIME_VERIFIED**.
- Dispatch PATCH 200 on the target WORK_ID: **RUNTIME_VERIFIED**.
- Remaining 1102 on cold isolates: **RUNTIME_VERIFIED** (Ray `a56928f2cb47ca4e-KBP`).
- Livelock root cause (import key written only after the bulk insert; no count-guard in
  main): **CODE_READ + RUNTIME_VERIFIED**.
- Verified plugin receipt in production: **NOT OBSERVED** — blocked by the livelock
  (read path) and by the unanswered HAE-bridge configuration question.
