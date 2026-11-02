# Hermes AI / VIKTOR Windows source snapshot — 2026-11-02

Purpose: off-host recovery snapshot for the Windows VIKTOR runtime on `YuraValentyuk`.

## Included
- core worker/server/watchdog;
- policy engine and evidence factory;
- task executor;
- outbound HAE Windows node client;
- local dashboard;
- current operations manifest;
- S4U unattended bootstrap + rollback scripts.

## Explicitly excluded
- tokens, API keys, passwords, cookies, private keys;
- logs, status files, task receipts, model files;
- provider credentials;
- user/customer data.

A pre-copy secret-pattern scan returned no hits for the selected source files. Readback compared the nine primary source/config files after upload and found 9/9 exact string matches between Windows and this branch.

## Current truth state
- Local VIKTOR is live and session-guarded.
- Existing Scheduled Task uses `InteractiveToken`; this is not unattended 24/7.
- Current remote session cannot register an S4U task: Task Scheduler returned `Access is denied`.
- `ENABLE_VIKTOR_UNATTENDED_S4U.ps1` is prepared but must run from an elevated administrator PowerShell. It stores no plaintext Windows password.
- The bootstrap keeps the existing InteractiveToken watchdog until the S4U local canary succeeds. Rollback re-enables the legacy task.
- Reboot/logout acceptance is still required after S4U configuration before claiming `UNATTENDED_24_7_VERIFIED`.
- HAE Windows node client is present but disabled; API/token are intentionally not configured until reviewed release and canary.
- Production/provider writes remain disabled.

## Restore outline
1. Restore the files under `tools/viktor-windows/` to `C:\Hermes\Viktor\`.
2. Recreate the Python environment and local Ollama model separately; model binaries are not stored in this branch.
3. Verify `python -m py_compile` for the Python sources.
4. Start the existing session-guarded watchdog first.
5. Verify localhost dashboard/API and runtime receipt.
6. Configure unattended S4U only from an elevated administrator session and run the local canary.
7. Do not enable HAE node execution until the reviewed server contract is deployed and a scoped token is provisioned.
