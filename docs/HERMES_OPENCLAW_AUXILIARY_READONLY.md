# Hermes OpenClaw auxiliary read-only pilot

Status: SOURCE-ONLY. No host, production agent, connected Telegram, provider key, HAE access token or 24/7 runtime is installed.

Canonical owner: Hermes Technology Developer; HAE owner #1018; previous FreeLLMAPI integration #1938.

The existing Hermes One Brain / Agent Coordinator owns tasks and evidence. Cloudflare HAE Queue+D1 owns durable job state, scheduling, retries, idempotency and provider-side effects. OpenClaw is optional as a **private CEO interactive client**, not a parallel scheduler, CRM or automation authority.

Proof stage: scripts/hermes-hae-public-capabilities.mjs only performs authenticated-by-configuration but credential-FREE GET /v1/capabilities on the exact approved HTTPS hostname. The endpoint is PUBLIC in the existing HAE worker. The script does NOT call the private /v1/health or POST /v1/jobs, does not accept arbitrary URLs or expose the powerful HERMES_AUTOMATION_TOKEN. Capability response cannot prove full operational health or production customer outcomes.

On a stable private host only, configure the following via approved local configuration:
HERMES_HAE_CAPABILITIES_ENABLED=true
HERMES_HAE_CAPABILITIES_URL=https://YOUR_VERIFIED_HAE_HOST/v1/capabilities
HERMES_HAE_ALLOWED_HOST=YOUR_VERIFIED_HAE_HOST

Read-only tool command: node scripts/hermes-hae-public-capabilities.mjs.
No real hostname is hardcoded. User and existing HAE owner must verify official destination through authenticated Cloudflare evidence. Default is OFF.

OpenClaw future host checklist: approved always-on Linux/Windows VM or service account (non-root), bound to loopback, gateway authentication and Telegram owner-only pairing; no external listening, no personal Chrome profile or AI-owned secret reading. Disable agent recurring heartbeat and OpenClaw cron at pilot start because HAE already schedules business tasks. No email, dispatcher messaging, social or paid API requests. Scope OpenClaw tool allowlist to the exact read-only command. Do not give its runtime the HAE private write-capable bearer. Use a separate least-privilege HAE read token only if HAE owner introduces a distinct read-only auth capability with QA.

Real completion requires 24h stable host, confirmed private gateway health, one verified authorized owner interaction and traceable HAE result; synthetic CI does not satisfy those claims.

Official docs: https://docs.openclaw.ai/gateway and https://docs.openclaw.ai/heartbeat .
