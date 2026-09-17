# CLOUDFLARE AI CONTROL PLANE — HERMES PILOT

Status: CODE READY / NOT DEPLOYED / NO PROVIDER SPEND AUTHORIZED BY THIS CHANGE
Date: 2026-09-17
Owner lane: Hermes Technology

## Goal

Put one governed routing layer between Hermes applications and AI models:

`Hermes Connect / Telegram / Academy / Sales Coach / SEO-GEO → Cloudflare AI Gateway → Workers AI / approved third-party models`

The control plane centralizes routing, observability, fallback, cost review, and security without making one model permanent product truth.

## Implemented repository surface

- `workers/ai-control-plane/src/index.mjs`
- `workers/ai-control-plane/wrangler.jsonc.example`
- `scripts/ai-control-plane-contract.test.mjs`

The Worker is fail-closed until all of the following exist:

- Workers AI binding `AI`
- explicit `AI_GATEWAY_ID`
- private `HERMES_AI_CONTROL_TOKEN` secret
- configured model IDs for the active tiers

No token or provider credential is committed to GitHub.

## Task routing

### Economy tier

- Telegram classification
- RU/UA/EN/ES/IT translation
- carrier-field extraction
- call summary

### Reasoning tier

- negotiation analysis
- Sales Coach reasoning
- SEO/GEO analysis
- AI Entity Monitor analysis

### Conversational tier

- Academy tutor
- Hermes Connect assistant

The model names are environment configuration, not permanent application constants. The example Wrangler file contains current deployment candidates only and must be rechecked against the live Cloudflare catalog before production activation.

Current free-first candidate defaults are:

- economy / conversation: `@cf/zai-org/glm-4.7-flash`
- reasoning / fallback: `@cf/google/gemma-4-26b-a4b-it`

Cloudflare currently marks `@cf/zai-org/glm-5.2` as paid access required, so it was deliberately removed from the default pilot configuration. It can only be considered later after explicit plan/spend approval and measured quality benefit.

## Cost and cache rule

Private/person-specific tasks default to `skipCache: true`.

Only tasks marked both route-cacheable and `public_safe=true` may use a short 300-second gateway cache. This prevents accidental caching of call transcripts, personal coaching, carrier data, or private workflow context.

## Fallback

A primary model failure may retry one configured `AI_MODEL_FALLBACK`. A second failure returns an explicit 502. Do not silently manufacture an answer.

Longer-term provider fallback should be configured through AI Gateway dynamic routing after the primary pilot has clean logs and known cost/quality behavior.

## Observability

Every successful request returns the authorized caller:

- task type
- selected tier
- model used
- whether fallback was used
- AI Gateway log ID
- model result

AI Gateway is expected to provide request, token, latency, error, and cost observability for public-safe/synthetic pilot traffic. Application code should attach only non-PII metadata such as task type and tier.

Privacy rule: AI Gateway stores request/response payloads by default when logs are collected. The Workers AI binding does not currently expose the separate `cf-aig-collect-log-payload: false` control. Therefore this pilot sets `collectLog=false` for every private/high-risk route. Logging requires BOTH an allowlisted public-analysis route (`seo_geo_analysis` or `ai_entity_analysis`) AND `public_safe=true`; a caller flag cannot make Telegram, calls, coaching, carrier, learner or customer workflow prompts loggable. Those private prompts are not persisted to Gateway logs. Metadata-only observability for private workloads is a later gate that requires a supported no-payload logging path; do not weaken this rule to obtain dashboards.

## Security

- Bearer control token required.
- No browser-public unauthenticated route.
- No secrets in repository variables.
- No autonomous external persuasion or publishing is enabled by this Worker.
- Existing Telegram approval, commercial-truth, privacy, and owner gates remain authoritative.
- DLP / Guardrails / gateway authentication should be enabled in Cloudflare before wider production use where applicable.

## Pilot order

1. Deploy the Worker privately with one economy model and one reasoning model.
2. Canary a synthetic / public-safe classification request.
3. Verify Gateway request, latency, token/cost, error and log evidence.
4. Connect Telegram classification only.
5. Add Sales Coach after private-DM evidence and commercial-truth cleanup.
6. Add Hermes Connect assistant.
7. Add SEO/GEO + AI Entity Monitor analysis.
8. Expand to third-party provider fallback only after quality/cost evidence.

Do not migrate all AI workloads at once.

## Free-first constraint

Cloudflare documents AI Gateway core features such as analytics, caching, and rate limiting as available without a separate Gateway fee, while inference/model usage and some platform features may be billable. No paid tier, credit purchase, provider billing, or model spend is authorized by this repository change. Verify the current account plan, free allocation/eligibility, live quota and pricing before activation.
