# Hermes AI / VIKTOR Windows source snapshot

This directory is an **off-host source/recovery snapshot** of the active Windows runtime on `YURAVALENTYUK` as of 2026-11-02.

## Canonical boundary
- Cloudflare HAE / D1 / Queue / Worker / DLQ remains the only canonical durable automation control plane.
- Windows VIKTOR is local/free semantic capacity, not a second scheduler, task database, One Brain, or canonical receipt store.
- Local HTTP/process liveness is not HAE execution acceptance.
- Windows HAE integration remains disabled until reviewed release + scoped credentials + one real READ_ONLY canonical D1 canary.

## Included
This snapshot contains recovery-critical **source/configuration**, not a full executable machine image:
- Python source selected from the actual local import/dependency graph and runtime entrypoints;
- watchdog + healthcheck PowerShell;
- local dashboard source;
- bounded operations manifest;
- local policy/skill registry;
- private plugin inventory snapshot used by the local read-only capability audit.

The plugin inventory keeps its full-snapshot timestamp at 2026-10-28; only Coordinator / Automatic Engineer / QA Auditor / Knowledge Curator have an exact 2026-11-02 Core-4 refresh.

## Explicitly excluded
- `viktor_live/` state, logs and receipts;
- corpora / historical chat data / sealed or nonsealed test fixtures;
- Ollama models;
- .venv and binaries (rebuild from `requirements-lock.txt`);
- .env files, API tokens, passwords, cookies, credentials and provider sessions;
- same-disk Recovery copies.

Recovery source is secret-scanned before promotion. Re-run the scan after every source delta; an older scan never proves a newer snapshot.

## Rebuild environment
- Python runtime observed on source host: **3.12.10**.
- Python packages: install from `requirements-lock.txt`; this includes `tzdata==2026.6`, required for `ZoneInfo("Europe/Kyiv")` on this Windows host.
- Ollama runtime observed: **0.40.12**.
- Local model observed and watchdog-pinned: **qwen2.5:1.5b-instruct**.
- Use the VIKTOR virtualenv for runtime/task probes. System Python without the locked dependencies is a verifier-environment mismatch and must not be reported as a VIKTOR product failure.
- Model weights and credentials remain excluded from source control.

## Current truth at snapshot
- Windows runtime: LOCAL_LIVE / SESSION_GUARDED.
- Existing minute watchdog principal: InteractiveToken; **not unattended 24/7 proof**.
- AC sleep/hibernate: disabled.
- Local model: qwen2.5:1.5b-instruct.
- HAE node client source: present but disabled; API/token not configured; production writes false.
- Development/nonsealed policy regression: 20/20. Independent generalization is not proven; sealed holdout unavailable.
- Off-host version control is the purpose of this snapshot; runtime deployment remains separate.

## Recovery limits
This directory alone is **not** complete disaster recovery and must not be described as such. It intentionally excludes local model weights, Python virtualenv/binaries, source corpora/test fixtures and mutable runtime receipts/state. Those dependencies must be rebuilt or restored from their authorized canonical sources before the worker can be accepted as recovered.

## Recovery rule
Restore source only after verifying hashes/diff and current runtime contract. Do not copy secrets into this directory. Rebuild dependencies from trusted sources rather than copying unknown binaries. A restored Windows worker must remain fail-closed on external/provider writes until current HAE/owner gates are re-read.


## Unattended bootstrap checkpoint — 2026-11-02
- Current production-local watchdog remains `InteractiveToken` and therefore `SESSION_GUARDED`, not unattended 24/7.
- A bounded S4U registration probe from the connected remote session failed with Windows Task Scheduler `Access is denied` (0x80070005). This is `ADMIN_ELEVATION_GATE`, not a reason to request or persist the Windows password.
- `bootstrap/ENABLE_VIKTOR_UNATTENDED_S4U.ps1` is fail-closed: it requires an Administrator session, creates a separate S4U task, runs a local runtime canary, and disables the legacy InteractiveToken task only after S4U + zero task result + fresh runtime receipt are proven.
- `bootstrap/ROLLBACK_VIKTOR_UNATTENDED_S4U.ps1` removes the S4U task and re-enables the legacy watchdog.
- Even after S4U configuration, `UNATTENDED_24_7_VERIFIED` remains false until logout/reboot startup and at least two post-start heartbeats/receipts are independently read back.
- No plaintext Windows password, provider token, HAE token, model binary, log, receipt or customer data is stored in this snapshot.
