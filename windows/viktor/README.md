# VIKTOR Windows HAE node — versioned source mirror

This directory captures the source of the existing Windows VIKTOR node, audited on November 6, 2026. It does not create a new agent, scheduled task, cron, paid provider, or paid AI process.

## Source and runtime boundaries

- hermes_hae_windows_node.py — outbound-only HAE windows-node-v1 client. Uses locally available Ollama and a signed Ed25519 node identity. The private key is never stored in GitHub. The node processes only an HAE-authorized READ_ONLY, zero-dollar semantic lease.
- hermes_hae_windows_node_loop.py — local polling and bounded/redacted event history. It is not a canonical D1 receipt.
- hae_node_signer.mjs — signs the canonical node request using the local private key or an approved secret environment path. It never exports the private key.
- test_node_regressions.py — offline positive/negative tests using synthetic requests, mocked HAE/Ollama calls and ephemeral Ed25519 test keys. It performs no production HTTP or customer writes.

## Root causes addressed

The live Windows Watchdog configured OLLAMA_HOST=127.0.0.1:11434, while the HAE client expected an HTTP loopback URL. Source now canonicalizes only exact localhost aliases. Non-loopback/bind-all/proxy URLs remain denied.

Malformed model JSON for work.item.plan is downgraded to the pre-existing NEEDS_CAPABILITY planning disposition; all other job types remain fail-closed. A LEASE_REPLAY with less than 180 seconds remaining does not invoke the model. On HTTP 409, the client preserves only a bounded server machine code, never a raw error response.

The runtime writes viktor_live/hae_node_runtime_receipt.json (latest-only) plus a rotating, allowlisted viktor_live/hae_node_history.jsonl (1 MiB rotation). Both are local advisory logs, not authoritative D1 evidence; no prompts, result bodies, secrets or customer content should enter the history.

The selected revenue work item W-20261019-015 had a signed preflight, an active lease replay, local ValueError, a completion HTTP 409 near lease expiration and later NO_ELIGIBLE_WORK. None proves job.succeeded, full autonomous execution or real earned revenue. Owner-authenticated HAE D1 job/event readback and independent QA remain pending; see Hermes GitHub issue #2033.

## Test, release and rollback

With Python 3.11+ and Node.js 22+:

    python3 windows/viktor/test_node_regressions.py

Review sources and compare with current Windows deployed hashes before host rollout. Keep local Windows backups and all keys outside this repo. Never commit C:\Hermes\Secrets, .env, user credentials, personal data, or production runtime evidence.

Current pull request is source-only. Approval and protected merge do not deploy the Windows host. Required: independent exact-head QA, protected merge, signed readback, one bounded authorized D1 job + durable success event, measured zero-dollar cost, and proof of safe unattended operation before marking production accepted. Do not change Windows principal privileges, model, cadence, or create duplicate scheduled tasks to obtain a green test.
