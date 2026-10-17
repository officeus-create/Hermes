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
- scripts/hermes-free-llm-pilot.test.mjs: eight synthetic local tests. They do **not** call a provider and do not prove Docker runtime.
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

## Independent verification

The dedicated `.github/workflows/hermes-free-llm-pilot.yml` runs eight synthetic tests, a real localhost TCP request against a fixture without external AI calls, and Docker Compose syntax/security assertions using FAKE keys. It also builds the **exact pinned** public FreeLLMAPI upstream commit on an ephemeral GitHub runner with no Hermes secrets, then checks local `/api/ping`. This is not an installation or provider API-key test. Treat only observed completed CI jobs as passed. The currently connected MacBookPro is not the chosen 24/7 production host.

## Gates / evidence ladder
SOURCE_VERIFIED → CODED → SYNTHETIC_TEST_PASS → APPROVED_HOST → PRIVATE_DEPLOYED → PROVIDER_CONFIGURED → PUBLIC_PROMPT_SMOKE → VERIFIED_INTERNAL_USE.

No external messages, deployments, purchased upgrades, secrets, public services or changes to Hermes provider/HAE runtime under this PR. Keep existing business prioritization and independent QA.


## Verified Docker-free option, if approved host has Node 20+

On 2026-10-17 a secret-free ephemeral GitHub Actions job built the **pinned upstream commit `369c47128edf92d30abb59d7b7c0e46c43e1ce57`** using `npm ci` and `npm run build -w server` and successfully received `GET http://127.0.0.1:3001/api/ping` from the real compiled Node server. This confirms the **server runtime** does not require Docker. The offline smoke does **not** validate provider credentials, the dashboard UI, persistent data, external model calls, or a permanent service.

A vetted always-on private server with Node 22 and a dedicated restricted OS user may use this option instead of Docker:
1. Verify upstream SHA, licensing/dependencies and network access, then clone/checkout that exact commit. Never install with `curl | bash`.
2. `npm ci --no-audit --no-fund && npm run build` on the private host (full build includes the dashboard). Do not reuse the ephemeral CI test database.
3. Create a private host-local `.env` with a persistent fresh `ENCRYPTION_KEY` (64 lowercase hex), `HOST=127.0.0.1`, `PORT=3001`, `NODE_ENV=production`, and local database storage. File permission `0600`. **Do not paste real values into GitHub, Drive, CI logs or chat.**
4. Start `node server/dist/index.js` under an owner-approved OS supervisor scoped to that private account, **not** a ChatGPT automation, dispatch device, browsing host or customer-facing web worker.
5. Verify `/api/ping` from the same host, no incoming TCP 3001 from LAN/WAN, then dashboard setup and one licensed free-tier provider key supplied locally by the owner. Only a PUBLIC/SYNTHETIC completion can graduate the pilot to PROVIDER_TESTED.
6. Stop with the supervisor and disable `HERMES_FREE_LLM_ENABLED` in any client for rollback. The full ChatGPT/Claude/HAE/CRM workflows remain unaffected.

**Operational limitation:** an ordinary laptop is not proof of a 24/7 server, even if its localhost health check succeeds. A local proxy cannot directly serve independently cloud-hosted Hermes plugins. Promotion requires a separately reviewed authenticated shared service, not an open 0.0.0.0 port.

Current adapter also includes a strict **640 completion-token cap** and returns nullable provider usage counters for later zero-spend/quota evaluation.


## 2026-10-17 full offline end-to-end proof (NOT a real paid/free provider call)

CI workflow [run 39033754314](https://github.com/officeus-create/Hermes/actions/runs/39033754314) passed both jobs and shows the **real** pinned FreeLLMAPI Node server accepting an adapter request, selecting the explicitly configured local mock OpenAI-compatible endpoint, and sending one `POST /v1/chat/completions`. The Hermes adapter received `SYNTHETIC_HERMES_E2E_OK`, `x-routed-via: custom/hermes-synthetic-model`, and synthetic usage of **12 prompt + 5 completion = 17 tokens**. The throwaway admin password, database, encryption key, unified key, mock provider and model existed solely inside a disposable GitHub runner; no provider or customer credentials. All tests finish with process shutdown and local DB deletion. The latest direct MacBookPro adapter tests passed **8/8**, including eligibility for 11 current Hermes plugin owner lanes, but this is not a release of those plugins.

Important distinction: the claim `no automatic paid fallback` applies to the **Hermes adapter's own policy** only. FreeLLMAPI's upstream `auto` router can use **any enabled model/provider**, including a separately configured paid/custom account if present. The real pilot MUST use its **own dedicated, empty, single-user instance**, add only verified free-tier provider credentials with billing/paid-overage disabled, and verify the enabled catalog and provider terms before allowing any real inference. **Do not attach this pilot to a preexisting FreeLLMAPI installation with unknown keys or paid fallback routes.** An apparent zero-cost result from a local mock cannot certify real free-tier cost.

The current connected MacBookPro is online but has none of the usual Groq/Gemini/Cerebras/Mistral/OpenRouter/GitHub/Cloudflare/Cohere credential environment variables set in that Remote Desktop session (only presence was checked, not values); it is not designated an always-on production host. A real compliant free-tier provider request remains `PROVIDER_CREDENTIAL_AND_PRIVATE_HOST_PENDING`. No 11-plugin ChatGPT hosted connection is implied.
