# HAE chain proof — WORK_ID → HAE job → VIKTOR-WINDOWS → completion → D1 receipt

Status: **RUNTIME_VERIFIED in production** (HAE runtime leg, 2026-11-06) and **RUNTIME_VERIFIED locally** for the
full chain including the VIKTOR-WINDOWS semantic node (2026-11-06).
Harness: `scripts/ai/hae-chain-proof.mjs` (reproducible, offline except the local Ollama inference).

## Production proof (closed)

The repository already owns the canonical production proof operation, so no new mechanism was created:
`.github/workflows/automation-engine-release.yml`, operation `runtime_readonly_proof` (read-only by construction —
the deploy steps are gated to the other operations).

Run: <https://github.com/officeus-create/Hermes/actions/runs/42289080275> · target SHA `c74bc7835` (current main).

```
HAE runtime read-only proof PASS job=job:ac64c6a3-2781-44a2-a562-482e92fe5781 attempts=1 duplicate_receipts=1 queue=0 dlq=0
```

Facts proven in production (independent QA job passed and attested the package):

| Fact | Value |
|---|---|
| Deployed worker source | `source_sha = c74bc7835…` = current `main` |
| Runtime mode | `automation_mode = dry_run`, `publication_enabled = false` |
| Real production job | `job:ac64c6a3-2781-44a2-a562-482e92fe5781`, `system.health.snapshot`, `READ_ONLY`, `SUCCEEDED` |
| Production D1 | `d1://hermes-connect-prototype/hermes_automation_jobs/job:ac64c6a3-…` |
| Attempts / external write | `attempt_count = 1`, `external_write = false` |
| Idempotent replay | `duplicate_execution_count = 0`, `duplicate_suppressed_receipt_count = 1`, no second side effect |
| Transport | queue `hermes-automation` backlog `0`, DLQ `hermes-automation-dlq` backlog `0` |

Artifact: `docs/evidence/hae-runtime-proof-production-2026-11-06.json` (executor + independently attested QA package).

Two production signals worth the owner's attention, taken from the same read-only snapshot:

- **The VIKTOR-WINDOWS node is live in production**: `job.windows_node_leased = 81`, `job.windows_node_succeeded = 13`,
  `job.windows_node_lease_expired = 68`, `job.waiting_free_ai = 153`. The node claims jobs; many leases expire
  before completion, so node completion is the bottleneck, not job creation.
- **`cron.role_contract_submit_failed = 52` and `job.failed = 2`** while `job.succeeded = 535`. The runtime is healthy
  overall, but the role-contract cron path is failing repeatedly and needs a separate fix.

Still open in production: a work-item receipt **displayed in the Command Center UI** requires the owner session
(`hermes_session`); the API answers `401 not_authenticated` without it. The runtime proof above therefore proves the
HAE/D1/Queue leg end to end, while the Command Center display leg is verified in the repository's own bridge contract
(`functions/api/_lib/command-center-hae-bridge.mjs`) and locally, not yet in a live owner session.

## What this proves

The canonical Hermes chain is executable end to end with the **real HAE worker code**:

```
WORK_ID (canonical Command Center backlog)
   → Cron (*/5) intake: enqueueNextOwnerWorkPlan
   → HAE job work.item.plan (D1 hermes_automation_jobs + Queue hermes-automation)
   → worker.scheduled / worker.queue (real production code path)
   → job parked in WAITING_FREE_AI / windows_node_required (no paid provider)
   → VIKTOR-WINDOWS node: signed Ed25519 claim (lease + fence + frozen role contract)
   → local free inference (Ollama, cost_usd = 0, external_write = false)
   → POST /v1/nodes/windows/complete
   → D1 receipt: job.succeeded + job.windows_node_succeeded + hermes_automation_ai_usage
   → reconcileOwnerWorkRuntime: work item advances (EXECUTION_QUEUED → terminal state)
   → read-only execution capability job runs and writes its own receipt
```

## What is real in the harness

| Layer | Reality |
|---|---|
| Worker | `workers/automation-engine/src/index.mjs` — imported, not re-implemented |
| Cron / Queue / D1 | `worker.scheduled(...)` and `worker.queue(...)` invoked for real; production SQL executed against SQLite through the D1 interface |
| Node auth | Ed25519 SPKI signature, `X-Hermes-Node-*` headers, nonce replay rejection, timestamp skew window, lease fence, replay idempotency |
| Semantic step | Local Ollama model, real prompt from the lease, contract-validated by `validateRoleContractSemanticResult` |
| Backlog | Canonical `hermes_owner_work_items` seeded by `ensureCommandCenterSchema` — 186 rows, including the four-month revenue backlog |

## What this does NOT prove

- **The local harness says nothing about production** on its own — it runs the real worker code against a local
  SQLite D1 and a local Ollama model. The production leg above is a separate CI proof.
- **A Command Center receipt visible to the owner in the UI still needs an owner session.** The production API
  (`GET /api/internal-command-center/work-items`) answers `401 not_authenticated` without the `hermes_session` cookie,
  so no work-item receipt could be read back into the private workspace from this Mac.
- The local harness played the node role on the owner Mac, not on the VIKTOR-WINDOWS machine. (In production the real
  node is already active — see the production signals above.)
- The local D1 is an SQLite emulator, not the canonical production `hermes-connect-prototype` database.
- The production control-plane base URL is the Pages secret `HERMES_AUTOMATION_BASE_URL`
  (`functions/api/_lib/command-center-hae-bridge.mjs`); it is not publicly discoverable, so the harness
  uses a stand-in control host while the node edge keeps the real custom domain.
- The deployed node edge still refuses unauthenticated access
  (`GET https://hae-node.hermeslogisticsus.com/v1/nodes/windows/status` → `401 windows_node_auth_required`) —
  the correct fail-closed gate, not a bypass.

## Measured result

Run: `node scripts/ai/hae-chain-proof.mjs --out /tmp/hae-chain-proof.json` — **33/33 checks passed**.

Work item exercised: `hcwi_rev4m_w_20261019_015` — *"[REVENUE] Reconcile and finish the 150-task SEO/GEO program"*
(workstream `marketing`, priority `p0`, from the four-month revenue backlog).

### Phase 1 — HAE executes a job itself and writes a receipt

- `POST /v1/jobs` (`system.health.snapshot`) → `202`, job row persisted in D1 before execution.
- Wrong bearer → `401`.
- Queue consumer ran the `job.execute` message → job `SUCCEEDED`, `result_json` persisted,
  canonical `job.succeeded` event written.
- `GET /v1/jobs/<id>` readback returns the persisted receipt.

### Phase 2 — canonical WORK_ID → HAE semantic job

- Cron intake reserved a real backlog item, created job `work.item.plan`, and moved the work item to
  `in_progress / PLAN_QUEUED`.
- The semantic job is parked as `WAITING_FREE_AI` with `last_error_class = windows_node_required`;
  the single allowed attempt is **not** consumed (`attempt_count = 0`).

### Phase 3 — VIKTOR-WINDOWS node

- Unauthenticated node call → `401`; signed Ed25519 heartbeat → `HEARTBEAT_ACCEPTED`
  (`production_write_authorized: false`).
- Signed claim → `LEASE_ACCEPTED` with the frozen role contract
  (`permission_class READ_ONLY`, `semantic_required true`, `max_cost_usd 0`) and the semantic prompt;
  the lease `work_id` equals the backlog item id.
- Semantic result produced by a **local free model** and validated by the runtime itself.
- `POST /v1/nodes/windows/complete` → `SUCCEEDED`; D1 receipt holds
  `provider_id = viktor-windows-ollama`, `cost_usd = 0`, `external_write = false`,
  events `job.windows_node_succeeded` + `job.succeeded`, and one AI-usage row at cost 0.
- Replaying the same completion → `IDEMPOTENT_REPLAY`, usage rows stay at 1.
- Node status readback: `online: true`, `production_write_authorized: false`.

### Phase 4 — the WORK_ID closes the loop

- Reconcile moved the work item to `EXECUTION_QUEUED` and created the read-only execution job.
- That execution job ran and wrote its own D1 receipt.
- Final dispatch state is terminal (`REVENUE_CYCLE_SUCCEEDED` for a revenue-active item — the canonical
  revenue cycle intentionally releases the job binding so the cycle can repeat).
- No failed jobs and no DLQ traffic in the run.

### Phase 5 — production gate

- `GET https://hae-node.hermeslogisticsus.com/v1/nodes/windows/status` → `401`. Deployed edge stays closed.

## Lane measurement (this run)

| Lane | Outcome |
|---|---|
| `deepseek-r1:1.5b` (canonical VIKTOR model, pulled locally) | **failed** — reasoning-model noise, output was not parseable JSON after both attempts |
| `qwen2.5-coder:7b` (fallback lane) | **passed** — contract-valid JSON in ~65 s |

Operational consequence: the DeepSeek lane needs a JSON-constrained decoding path (grammar/format flag) or a
repair prompt before it can be trusted as the canonical VIKTOR-WINDOWS semantic node. Until then the
working local node lane is `qwen2.5-coder:7b`, still $0 and still read-only.

## Reproduce

```bash
cd /Users/a1/Documents/Hermes-worktrees/mavis-runtime-connections-20261106
node scripts/ai/hae-chain-proof.mjs --out /tmp/hae-chain-proof.json
```

Requirements: Node 24 (`node:sqlite`), Ollama with `qwen2.5-coder:7b` (and optionally `deepseek-r1:1.5b`).
The harness never touches production credentials, never writes outside its in-memory D1, and performs no
external write — the only network call besides the local Ollama is the read-only 401 probe of the deployed edge.

## What the owner still has to decide or do

1. **Command Center display leg** — to see a work-item receipt inside the private workspace, an owner session is
   required (`hermes_session`); the API answers `401 not_authenticated` without it. The production receipt itself
   already exists in D1 (`job:ac64c6a3-2781-44a2-a562-482e92fe5781`).
2. **Node completion bottleneck** — production shows 81 leases but only 13 completions and 68 expired leases.
   The node claims work it does not finish; that gap, not job creation, is what limits throughput.
3. **`cron.role_contract_submit_failed = 52`** — the scheduled role-contract path fails repeatedly in production
   and needs a separate, reviewed fix.
4. **Owner-gated credentials for local parity** — `HERMES_AUTOMATION_TOKEN` and the VIKTOR-WINDOWS Ed25519
   **private** key exist only in Cloudflare secrets and on the node device. The public key is already versioned in
   the worker (`workers/automation-engine/src/windows-node-runtime.mjs`, `WINDOWS_NODE_PUBLIC_KEY_SPKI_B64`).
