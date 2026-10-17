# Hermes internal FreeLLMAPI pilot — ISSUE #1938

**Status: CODED / no Docker deployment / no provider key / no live AI calls.**

Owner: existing Technology Developer. Hermes Agent Coordinator / One Brain owns routing. Not a new central orchestrator, public API, production model replacement, scheduler, CRM, credential service or plugin-connection change.

## Verified source and caveats
- https://github.com/tashfeenahmed/freellmapi (MIT); install docs: https://github.com/tashfeenahmed/freellmapi/blob/main/docs/en/install/01-install.md
- Upstream explicitly calls this single-user, personal experiments only, no production SLA. Summed billions of free tokens are theoretical advertising, NOT guaranteed capacity. Check each free provider's terms, data processing, caps, no multi-account/resale.
- Current advertised models are auto, auto:fast, auto:smart. Use localhost /v1 endpoint and one encrypted persistent SQLite store. Signed changing model catalog is not stable SLA.
- Connected MacBookPro was reachable on October 17, 2026 but had no Docker. An always-on US host was not available in connected device inventory. No installation was performed; do not use unreviewed curl-pipe-bash.

## Actual components
- scripts/hermes-free-llm-pilot.mjs: **default off**, explicit caller department/purpose/data classification, loopback-only http://127.0.0.1:3001/v1, short timeout, one non-streamed completion capped at 640 output tokens, read-only usage-token metadata, no automatic retries, no paid fallback, output labeled INTERNAL_DRAFT_ONLY.
- scripts/hermes-free-llm-pilot.test.mjs: seven synthetic local tests. They do **not** call a provider and do not prove Docker runtime.
- infra/freellmapi/docker-compose.yml: requires manually vetted official GHCR sha256 digest and host-secret encryption key, localhost-only port, persistent volume, /api/ping health.
- infra/freellmapi/.gitignore keeps .env/SQLite/keys out of Git.

## Opt-in on vetted always-on Docker host
1. Review exact upstream release/digest/security. Create private infra/freellmapi/.env containing real FREELLMAPI_IMAGE_DIGEST and ENCRYPTION_KEY generated once using openssl rand -hex 32. chmod 600. Back up volume and key. Never store secrets in repo/Drive/chat.
2. Verify docker compose -f infra/freellmapi/docker-compose.yml --env-file infra/freellmapi/.env config, then run up -d on the **approved host only**, verify /api/ping and that no LAN/public connection to port 3001 exists. Never use HOST_BIND=0.0.0.0, external tunnel or public Cloudflare hostname.
3. Locally initialize dashboard at http://127.0.0.1:3001, add one ToS-approved free-tier provider key, disable paid overages if offered. Keep unified key in host-local secret store, not client JS or shared plugin skill.
4. For *internal Node 20+ runner on that same machine*, set HERMES_FREE_LLM_ENABLED=true, HERMES_FREE_LLM_BASE_URL=http://127.0.0.1:3001/v1, HERMES_FREE_LLM_API_KEY=(secret). Run node --test scripts/hermes-free-llm-pilot.test.mjs, then one explicitly approved PUBLIC/SYNTHETIC prompt; capture x-routed-via, measured latency, quota and result quality. Rollback: unset ENABLED, stop container.
5. The adapter only validates a caller's **declared** data class; it is not a PII/secret detector. Human/host review must confirm sanitization. Do not pass customer data, CVs, real loads, internal emails, protected code, finance or passwords.

## Department adoption matrix (all require separate verified host integration)
- Sales / Carriers: public-only mock scripts; **not** real leads, MC/driver contacts, dispatcher notifications, outgoing email.
- Marketing / SEO / News: public research outlines, unpublished copy; **not** private client analytics or posts.
- HR / Academy: fictional dialogues, synthetic training; **not** real candidate records or hiring judgments.
- Design / Technology: non-sensitive public UI wording or example code; **not** credentials or protected operational source.
- Hermes Connect / Catalog: fictional examples; **not** live multi-tenant CRM/company data.
- Logistics / Dispatch: simulated SOP exercises; **not** real load and operation records or current dispatcher contact.
- Finance: fictional budget tables; **not** actual invoices or account data.
- Coordinator / Automatic Engineer / Network: public outlines and synthetic QA; **not** remote tool execution, HAE/publishing, auth, VPN or credential changes.

Cloud-hosted ChatGPT, private ChatGPT plugins and Cloudflare Workers cannot access somebody else's localhost. This pilot does **not** give them a replacement LLM. Wider integration would need a separately designed authenticated multi-agent service approved for business data; do not fake it by exposing this single-user proxy.

## Independent verification\n\nThe dedicated `.github/workflows/hermes-free-llm-pilot.yml` runs synthetic tests, a real localhost TCP request against a fixture without external AI calls, and Docker Compose syntax/security assertions using FAKE keys. It also builds the **exact pinned** public FreeLLMAPI upstream commit on an ephemeral GitHub runner with no Hermes secrets, then checks local `/api/ping`. This is not an installation or provider API-key test. Treat only observed completed CI jobs as passed. The currently connected MacBookPro is not the chosen 24/7 production host.\n\n## Gates / evidence ladder
SOURCE_VERIFIED → CODED → SYNTHETIC_TEST_PASS → APPROVED_HOST → PRIVATE_DEPLOYED → PROVIDER_CONFIGURED → PUBLIC_PROMPT_SMOKE → VERIFIED_INTERNAL_USE.

No external messages, deployments, purchased upgrades, secrets, public services or changes to Hermes provider/HAE runtime under this PR. Keep existing business prioritization and independent QA.
