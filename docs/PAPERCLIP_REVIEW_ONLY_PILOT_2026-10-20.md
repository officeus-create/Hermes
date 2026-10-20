# Paperclip — Hermes isolated review-only pilot (20 Oct 2026)

**State: CODED_CANDIDATE_VALIDATOR / NOT_INSTALLED / NOT_CONNECTED / NOT_EXECUTING.** Owner: Hermes Agent Coordinator / One Brain. GitHub is source of task identities; this is not a second Master Board, database, scheduler, CRM, or auth mechanism.

## What works now
- `node --test scripts/paperclip-pilot-candidates.test.mjs` runs four deterministic tests without npm install/network/provider keys.
- `node scripts/paperclip-pilot-candidates.mjs fixtures/paperclip-pilot/synthetic-candidates.json` prints a review-only **Hermes-owned interchange format**, **NOT** a Paperclip-native import schema.
- Requires a human-reviewed PUBLIC/SYNTHETIC task, one canonical GitHub issue/PR URL, one execution owner, a different independent QA owner, explicit approved flag, 1–8 measurable acceptance criteria. Maximum three candidates.
- Output strips unexpected keys and sets `api_writes_enabled=false`, `scheduled_agents_enabled=false`, `outbound_messages_enabled=false`, `estimated_external_cost_usd=0`.
- The `issues/0` URL is a **synthetic fixture identifier**, not a real Hermes issue. Do not dispatch it.

**Safety:** Classifications are declarations, NOT automated PII detection. A human must review title/acceptance and source before use. Never pass real carrier/CRM, personnel, Gmail, contract, financial, access token, or customer data to an external agent. No secrets or permissions/billing changes.

## Paperclip application pilot — gated next step
Official source https://github.com/paperclipai/paperclip and install guide https://github.com/paperclipai/paperclip/blob/master/doc/INSTALLING.md require **Node.js 24.11+**. Hermes main website is Node 22 (Astro). Do not upgrade Hermes, alter the website package, or embed Paperclip in Cloudflare. Validate a reviewed exact upstream release/commit and dependencies on a separate disposable restricted user/container with loopback-only binding; no public dashboard, tunneling, service auto-start, production auth or external agent credentials. Do not pipe an unreviewed install script into a shell. Start with a UI/manual synthetic issue, two agents with separate roles, and a strict zero-external-spend budget. Verify disable/rollback and independently inspect logs/outputs. Keep the Hermes coordinator as sole canonical task owner. A real Paperclip-native API bridge requires separate schema/auth review, approved host and evidence.

## Release gates and proof
1. `CODED` — the candidate validator and tests exist; this does not mean Paperclip is installed.
2. `TESTED` — local tests and exact-head CI pass.
3. `HOST_READY` — dedicated Node 24.11+ environment and network isolation proven, no Hermes secrets.
4. `PAPERCLIP_SANDBOX_RUNNING` — actual upstream UI/CLI verified on approved host with synthetic tasks.
5. `INDEPENDENT_QA` — one executor, independent reviewer, no parallel writing, idempotent task identity.
6. `ADOPTION_DECISION` — demonstrated time saved, no duplicate task record or unexpected spend.

Next action: provision/reuse an approved isolated Node 24.11+ test environment and validate the exact upstream revision. Do not claim step 3–6 without runtime evidence.

Compounding: reusable safe handoff contract for Technology, SEO, Design and QA; no public/SEO route change, sales claim, analytics mutation, or cost implied.

## Actual execution evidence — 20 October 2026

- Node 24.11+ on disposable Ubuntu GitHub Actions: real pinned `paperclipai@2026.720.0` app bound to loopback `http://127.0.0.1:3100`, responded to HTTP. Server-only run: https://github.com/officeus-create/Hermes/actions/runs/39444663902 (success).
- Original startup command `test-drive` was absent in this pinned version; corrected to `onboard --yes`. Version-specific CLI compatibility matters.
- Disposable *local trusted board API*, no credentials or model calls: in run https://github.com/officeus-create/Hermes/actions/runs/39445983292, stdout confirmed `PAPERCLIP_EPHEMERAL_TWO_IDLE_ROLES_ONE_SYNTHETIC_TASK_OK`. An executor and a separate QA agent were created with zero model budget, heartbeat disabled, with one synthetic assigned task. The workflow ended **red solely on temporary directory removal racing with embedded Postgres shutdown**; a best-effort cleanup fix was then committed. Re-run exact head before counting full CI green.
- Source authority: `scripts/paperclip-ephemeral-api-smoke.mjs` now draws its API task from the Hermes allow-listed synthetic candidate fixture, never from customer data or One Brain live board. The disposable company and agents exist *only within the hosted test runner*; no durable orchestrator or Hermes operational task was created.
- Connected remote Windows device has Node 24 but runs Windows 10 Pro 22H2; OS support/security posture, host hardening and reliability are not certified. Do not install a persistent networked Paperclip service there on this evidence. Existing Mac is a verifier/QA host, not a proven 24/7 Paperclip service owner.

**Next action:** verify exact-head API CI green, then provide a dedicated supported/hardened private host. Test a real user-approved non-sensitive issue with executor + QA after native integration/auth schema review. Never claim active LLM workers from this model-free pilot.
