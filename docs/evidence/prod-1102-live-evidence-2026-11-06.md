# Live Cloudflare 1102 evidence — production Command Center (2026-11-06)

Observed by the Инструменты (tooling/evidence) lane, read-only, inside the owner's
signed-in browser session. No cookies, tokens or passwords were read or exported.

## Observation A — list route OK, per-item route 1102, same second

| Route | Result | Observed at (UTC) | Duration |
|---|---|---|---|
| `GET /api/internal-command-center/work-items` | **200** (full backlog JSON, `success: true`) | 2026-11-06 21:50:30Z | 78 ms (first attempt 503, immediate retry 200) |
| `GET /api/internal-command-center/access` | 200 | 2026-11-06 21:50:30Z | 902 ms |
| `GET /api/internal-command-center/processes` | 200 | 2026-11-06 21:50:30Z | 771 ms |
| `GET /api/internal-command-center/reports` | 200 | 2026-11-06 21:50:30Z | 599 ms |
| `GET /api/internal-command-center/owner-intelligence` | 200 | 2026-11-06 21:50:30Z | 747 ms |
| `GET /api/internal-command-center/social-acquisition` | 200 | 2026-11-06 21:50:30Z | 545 ms |
| `GET /api/internal-command-center/execution-map` | 200 | 2026-11-06 21:50:30Z | 1608 ms |
| `GET /api/internal-command-center/projects` | 200 | 2026-11-06 21:50:32Z | 842 ms |
| `GET /api/internal-command-center/work-items/hcwi_hist_20261105_037` | **1102** | 2026-11-06 21:51:19Z | — |

Error page body (verbatim):

```
Error 1102 Ray ID: a56751a08c495ab6-VIE • 2026-11-06 21:51:19 UTC
Worker exceeded resource limits
```

## Why this is the decisive measurement

Only two of the nine private routes touch the Command Center schema bootstrap
(`ensureCommandCenterSchema` + `reconcileWorkItems`): the work-item list and the
per-item readback. The seven other private routes answered 200 in the same second and
do not bootstrap. The two that do bootstrap are exactly the two that flap.

The flapping is **isolate-scoped**, not request-scoped: the list route answered 200 on a
warm isolate in 78 ms while the per-item route, 49 seconds later, landed on a cold
isolate and was killed by the Workers CPU limit (1102). Every other private route was
200 throughout.

This is the production signature of the per-request bootstrap: the cost is paid once per
isolate, so a request is cheap or fatal depending on which isolate serves it. The
release in flight (`fix/command-center-request-cost-20261106`, head `688e8a77`) moves the
bootstrap behind a per-isolate `ensureOnce` guard and replaces the reconcile writes
with an existence probe, so the warm request costs 2 statements instead of 22.

## Consequence for the owner's request

Until that release is deployed, the per-item receipt readback (`GET
/api/internal-command-center/work-items/{id}` → `plugin_execution`) is not reliably
reachable, and neither is the dispatch PATCH. That is the concrete blocker for
"покажи первый настоящий D1 receipt в Command Center" and for taking the next WORK_ID.
It is an availability problem, not a receipt-correctness problem: the receipt logic in
`command-center-hae-bridge.mjs` was verified independently against the real production
D1 rows (`hcwi_hist_20261105_045` → `job:83651a18-102e-4cc6-bce1-eeaffeefd652`,
`hcwi_hist_20261105_022` → `job:decc3ebb-e237-4e37-8fb9-03a248d367a9`).

## Live production values read from the same session (2026-11-06 21:50Z)

`GET /api/internal-command-center/work-items` → `success: true`, backlog present.
Verified inside the returned payload:

- `hcwi_hist_20261105_045` (sales · p0 · ProgressoPro): `hae_job_id` =
  `job:83651a18-102e-4cc6-bce1-eeaffeefd652`, `hae_execution_job_id` = null,
  `hae_dispatch_state` = `NEEDS_CAPABILITY`, `hae_dispatch_result.disposition` =
  `NEEDS_CAPABILITY`, rationale "Local DeepSeek output did not safely select an
  allowlisted HAE capability".
- `plugin_route` on that item: `policy_version=command-center-route-v1`,
  `state=PLUGIN_SELECTED_NOT_EXECUTED`, `source_class=PRIVATE_PLUGIN_CREATOR_READBACK`,
  `registry_observed_at=2026-11-05T18:22:10.814Z`,
  `owner=hermes-agent-coordinator@0.1.102`,
  `helpers=[hermes-qa-evidence-auditor@0.1.28]`.

## Status labels

- 1102 with Ray ID: RUNTIME_VERIFIED (observed live in the owner's production session).
- List route 200 with real `job:` ids: RUNTIME_VERIFIED.
- Root cause attribution to the per-request bootstrap: CODE_READ + MEASURED (bench),
  corroborated by the isolate-scoped flapping pattern above.
