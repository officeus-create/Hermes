# Command Center request-cost profile in PRODUCTION (2026-11-06)

Owner: Инструменты (tooling/evidence lane). Scope: measurement + interpretation only.
No Command Center production code was modified by this lane.

## Why this note exists

`docs/evidence/cc-request-cost-2026-11-06.json` (bench on an EMPTY emulated D1) reports
`cold_bootstrap_statements: 208`. That number is correct for an empty database, but it is
NOT the production cost of a cold isolate, and the earlier summary carried that number into
the incident narrative. This note records the corrected production profile so nobody spends
a second release on an unnecessary "cheap bootstrap" rewrite.

## Production fact that changes the cold number

Both canonical seeders are guarded by an import key and early-exit BEFORE any bulk insert:

- `functions/api/_lib/command-center-history-backlog.mjs`
  `IMPORT_KEY="owner_history_backlog_2026-11-05_v2"`
  → `CREATE TABLE IF NOT EXISTS hermes_command_center_imports` + `SELECT import_key ... LIMIT 1`
  → `if (already) return;` (54 items are inserted only when the key is absent)
- `functions/api/_lib/command-center-four-month-revenue-backlog.mjs`
  `IMPORT_KEY="owner_revenue_backlog_2026-11-06_v5"` → same shape (132 items)

Production D1 already contains the imported backlog (`hcwi_hist_*`, `hcwi_rev4m_*` work items
are live in the owner UI), therefore both import keys are already present.

### Corrected profile

| Phase | Empty D1 (bench) | Production D1 (seeded) |
|---|---|---|
| cold isolate, first request | 198 (CC) + 10 (AI) = **208** | DDL + 2 import-key probes ≈ **25-30** (no bulk insert) |
| warm request, pre-fix (`main` `c74bc7835`) | 22 | 22 |
| warm request, post-fix (branch `fix/command-center-request-cost-20261106`, head `688e8a77`) | **2** (0 DDL, 0 DML, 2 SELECT) | **2** |

### Consequence

- The 1102 incident was **not** caused by a cold isolate paying 208 statements in production.
  It was caused by every private request re-running the bootstrap (22 statements) **plus** the
  private page fanning a receipt readback out per card every 15 s. Post-fix the per-request
  cost drops from 22 to 2 statements (−91 %), which is the actual remedy.
- A cheap-bootstrap rewrite ("seed only when the table is empty") is **not required** for
  production correctness on its own account. It only reduces the one-time cold-isolate cost
  from ~25-30 to ~20 statements.
- The remaining production risk after this release is fan-out volume, not cold start:
  the UI poll interval and the per-card receipt readback are the levers that matter.

## Verified-receipt path (what the owner asked to see)

Owner ask: «покажи первый настоящий D1 receipt в Command Center» + «бери следующий WORK_ID».

After this release is deployed, a **fresh dispatch through the owner UI** is the only path that
can reach `PLUGIN_EXECUTION_SUCCEEDED_RECEIPT_VERIFIED`. Why, from the code:

1. `functions/api/internal-command-center/work-items/[id].ts`, action `dispatch`:
   creates a `hermes_internal_ai_tasks` row and sets `linked_task_id = taskId`,
   `plugin_route_json = selectWorkItemPluginRoute(row)`, `hae_job_id = NULL`;
   then `submitCommandCenterHaeExecution(...)` posts to HAE `/v1/jobs` and persists `hae_job_id`.
   → **A fresh dispatch always has a non-null `linked_task_id`.**
2. `command-center-hae-bridge.mjs` `expectedIdempotencyKey()` requires `linked_task_id`
   (via `commandCenterHaeIdempotencyKey`), so for legacy imported rows with
   `linked_task_id = NULL` the readback stays in
   `PLUGIN_ROUTE_VERSION_DRIFT / command_center_idempotency_identity_invalid`.
   That is the structural explanation for the drift verdict on `hcwi_hist_20261105_022`
   (which does have a real `job:decc3ebb-…` and `EXECUTION_SUCCEEDED`), and it is expected
   behaviour, not a defect in the receipt path.
3. `routePlan()` passes only when `route.owner.plugin_version` equals the version in
   `workers/automation-engine/src/plugin-runtime-registry.mjs`. `selectWorkItemPluginRoute()`
   takes the version from that same registry snapshot, so a route written by the server
   always matches. `ROLE_JOB_MAP` maps `hermes-agent-coordinator → work.portfolio.reconcile`,
   whose role contract is `permission_class: READ_ONLY`, `semantic_required: false`,
   `business_lane: automation` → deterministic, zero-paid, no provider write.
4. The readback compares job identity against the canonical binding
   (`job_type`, `project_key=command-center-plugin-route`, `account_key=hermes_logistics`,
   `policy_version=command-center-plugin-bridge-v1`, `idempotency_key`) and requires exactly
   one `job.succeeded` event. `GET /v1/jobs/{id}` in the HAE worker returns
   `{ job, events }` (`workers/automation-engine/src/index.mjs` `getGenericJob`), so the
   durable success event is available.
5. Registry freshness is no longer a receipt blocker after commit `a25cfc62a`: the evidence
   is the attestation pinned on the route (`source_class` + `registry_observed_at`), and
   inventory liveness stays enforced in the release-drift preflight and the HAE P1
   `plugin-runtime-registry-evidence-stale`. The response now reports
   `registry_evidence_fresh` instead of hiding it.

## Next WORK_ID (canonical selection)

`hcwi_hist_20261105_037` — «Reconcile carrier invoices and payment truth»
(finance · P1 · blocked · no project · created 2026-09-05 · no revenue hold).

Rationale: the bridge can only execute `hermes-agent-coordinator` (`ROLE_JOB_MAP`),
and `ROUTE_OWNERS` assigns it only for `sales` and `finance`. The revenue canon
`hcwi_rev4m_w_20261019_015` is not mappable (route owner `hermes-search-growth` →
`safe_role_contract_mapping_missing`), and the other revenue rows are held by
`REVENUE_SEQUENCE_WAIT: active=W-20261019-015`.

## Pre-check: the dispatch payload passes HAE validation (code read)

Before waiting on a live run, the payload that the Command Center sends for a fresh
dispatch was checked field by field against the HAE validator
(`workers/automation-engine/src/work-portfolio.mjs` → `normalizeWorkPortfolioSnapshot`,
invoked by `validateRoleContractInput` for `work.portfolio.reconcile`):

| HAE requirement | Command Center sends (`buildCommandCenterHaeJobRequest`) | Result |
|---|---|---|
| `source_kind ∈ {ONE_BRAIN, GITHUB, CHATGPT_SELECTED}` | `CHATGPT_SELECTED` | OK |
| `coverage_complete` boolean | `true` | OK |
| `snapshot_id` non-empty | `command-center:<work_item_id>:<linked_task_id>` | OK |
| `observed_at` ISO-8601 | `new Date(observedAt).toISOString()` | OK |
| `tasks[]` ≤ 500 | 1 task | OK |
| task fields ⊆ allowlist | work_id, source_ref, status, priority, updated_at, permission_class, writer_key, dependencies | OK |
| `source_ref` matches `^(github\|drive\|chatgpt-selected)://` | `chatgpt-selected://command-center/<id>` | OK |
| `status ∈ {TODO, IN_PROGRESS, BLOCKED, DONE, UNKNOWN}` | `workStatus()` → same set | OK |
| `priority` integer 0..100 | p0→100, p1→85, p2→60, p3→40 | OK |
| `permission_class ∈ {READ_ONLY, …}` | `READ_ONLY` | OK |
| `business_lane` = contract lane | contract lane `automation` | OK |
| `project_key` free-form | `command-center-plugin-route` | OK (no allowlist in HAE) |

Execution side, same reading:
- HAE stores `_role_contract` into the job payload at enqueue time
  (`workers/automation-engine/src/index.mjs`), and at execution re-verifies it against the
  canonical contract (`role_contract_stale` otherwise) → the stored `payload_json` carries the
  `_role_contract` block the receipt verifier requires.
- The stored `result_json` carries `capability`, `external_write: false` and `role_contract`;
  for a deterministic contract (`semantic_required: false`) no `semantic_execution` is attached,
  which is exactly what the verifier demands.
- Success writes one `job.succeeded` event with `to_state = SUCCEEDED`
  → the verifier's `DURABLE_SUCCESS_EVENT_UNVERIFIED` gate is satisfiable.

Conclusion: for a **fresh dispatch** the full verified path is reachable; the only remaining
gate is availability of the route (the 1102 incident) and the job actually reaching
`SUCCEEDED` in HAE.

## Status of each claim

- Statement counts (bench, empty D1): MEASURED — `docs/evidence/cc-request-cost-2026-11-06.json`.
- Post-fix warm = 2: MEASURED against the branch tree (not merged at the time of writing).
- Production cold isolate ≈ 25-30 statements: DERIVED from the import-key early-exit code
  plus the observed live backlog rows; not directly measured in production (D1 write path
  is owner-only).
- Verified-receipt path: CODE READ, not yet observed end-to-end in production.
