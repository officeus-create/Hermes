# Hermes AI / VIKTOR Windows source snapshot

This directory is an **off-host source/recovery snapshot** of the active Windows runtime on `YURAVALENTYUK` as of 2026-11-02.

## Canonical boundary
- Cloudflare HAE / D1 / Queue / Worker / DLQ remains the only canonical durable automation control plane.
- Windows VIKTOR is local/free semantic capacity, not a second scheduler, task database, One Brain, or canonical receipt store.
- Local HTTP/process liveness is not HAE execution acceptance.
- Windows HAE integration remains disabled until reviewed release + scoped credentials + one real READ_ONLY canonical D1 canary.

## Included
Only recovery-critical source/config files selected from the actual Python import graph and runtime entrypoints.

## Explicitly excluded
- `viktor_live/` state, logs and receipts;
- corpora / historical chat data / sealed or nonsealed test fixtures;
- Ollama models;
- .venv and binaries;
- .env files, API tokens, passwords, cookies, credentials and provider sessions;
- same-disk Recovery copies.

A 19-file hardcoded-secret scan returned 0 findings before this snapshot was created.

## Current truth at snapshot
- Windows runtime: LOCAL_LIVE / SESSION_GUARDED.
- Existing minute watchdog principal: InteractiveToken; **not unattended 24/7 proof**.
- AC sleep/hibernate: disabled.
- Local model: qwen2.5:1.5b-instruct.
- HAE node client source: present but disabled; API/token not configured; production writes false.
- Development/nonsealed policy regression: 20/20. Independent generalization is not proven; sealed holdout unavailable.
- Off-host version control is the purpose of this snapshot; runtime deployment remains separate.

## Recovery rule
Restore source only after verifying hashes/diff and current runtime contract. Do not copy secrets into this directory. A restored Windows worker must remain fail-closed on external/provider writes until current HAE/owner gates are re-read.
