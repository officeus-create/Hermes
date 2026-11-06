# VIKTOR Windows → Hermes Automation Engine (HAE)

Canonical source for the authorized Windows VIKTOR-WINDOWS outbound-only node. Imported from the existing local deployment on **2026-11-06** to prevent loss of fixes during redeploy or machine replacement. **This directory does not deploy anything.**

## Files

- hermes_hae_windows_node.py — signed/explicitly authorized HAE request client, localhost-only Ollama, READ_ONLY work-plan semantic adapter, lease fencing and guarded completion.
- hermes_hae_windows_node_loop.py — existing polling loop. Local allowlisted history is bounded and rotated; canonical job/event evidence must still be read from HAE D1.
- test_runtime.py — offline, cross-platform tests; no model calls, no network, no credentials.

## Release and runtime rules

1. Do not check private signing keys, bearer tokens, working-machine receipts, or raw model prompts into GitHub. HAE node private key remains outside the repository.
2. HERMES_HAE_WINDOWS_NODE_ENABLED is a fail-closed opt-in. Never bypass its gate.
3. Ollama is local and free: allow only http://127.0.0.1:11434 or http://localhost:11434. Bare Ollama server-style equivalents normalize only for those two values.
4. A replay lease with less than 180 seconds remaining is not worth a new model call. Never infer job.succeeded from a local NO_ELIGIBLE_WORK, a successful heartbeat or HTTP 200 preflight.
5. Malformed work.item.plan JSON is downgraded to the existing NEEDS_CAPABILITY review disposition only; other job types fail closed.
6. Do not introduce another background scheduler, ChatGPT/Codex automated execution, paid-model fallback or new high-privilege service. The existing Windows Watchdog is the scheduler. Its current Interactive principal remains a separate unattended-service gate.
7. Source review, contract CI, independent reviewer approval, protected merge, explicit Windows deployment and rollback are distinct gates. Neither copying these files into the repository nor passing unit tests proves the runtime is using the merged files.
8. Financial mission W-20261019-015: revenue is $0 until a real payment is recorded. READ_ONLY planning is not revenue or 150 completed SEO tasks.

## Validation

Run: python3 scripts/windows/viktor-hae/test_runtime.py

The six tests use only local fixtures and temporary files. In CI they are included in the existing HAE Contract workflow; no new scheduled workflow.

## Deployment/rollback (after approval only)

Compare hashes with the Windows host. Back up installed .py files in the same secure local directory, stage only reviewed source files, run py_compile and offline tests, verify no live active lease, and roll through the existing Watchdog. Keep old source backups until signed HAE status and real owner-authenticated D1 job/events have been QA-verified.

Evidence: officeus-create/Hermes issue #2033, comments 6687078466 and 6687228362. Release acceptance requires independent review and canonical D1 job.succeeded readback.
