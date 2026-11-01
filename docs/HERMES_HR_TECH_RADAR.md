# Hermes HR-tech Radar — Command Center / HAE

Canonical owner spec: https://github.com/officeus-create/Hermes/issues/2211.

## Runtime

- Existing Hermes Automation Engine only.
- Monday 10:00 Europe/Kyiv.
- Cron wakeups: 07:00 and 08:00 UTC on Monday; the Europe/Kyiv guard selects exactly one across DST.
- Existing hourly :17 HAE cron may provide one idempotent same-hour recovery opportunity.
- Existing Hermes D1 stores one report key per local Monday.
- Destination: authenticated Hermes Business Command Center only.

## Strict zero-AI contract

Routine report generation, retry, source fetch and owner readback must always keep:

- `llm_calls = 0`
- `ai_input_tokens = 0`
- `ai_output_tokens = 0`
- `paid_ai_cost_usd = 0`

The module contains no model SDK/import and never calls a model endpoint. HTTP/D1/Worker resource use is not described as zero-cost infrastructure; the contract is specifically zero AI inference tokens/cost.

## Sources

Only explicit official HTTPS sources are accepted by the source allowlist.

Current deterministic sources:
- Google Search documentation updates RSS — candidate sourcing / JobPosting/Search changes.
- Meta Threads developer documentation — snapshot/diff only.
- Meta Instagram Platform developer documentation — snapshot/diff only.

A dated RSS item may be `VERIFIED`. An undated page fingerprint change is only `NEEDS_CHECK`. Missing source coverage remains `SOURCE_UNAVAILABLE`.

No marketing article, scraped community source, arbitrary URL or model-written summary becomes evidence.

## Funnel projection

Rules map a verified item to bounded stages:

`SOURCE → CANDIDATE → INTERVIEW → HUMAN_ROUTING → ACADEMY/DIRECT_REVIEW`

The report may recommend a human next step. It never auto-hires, rejects, scores protected traits, or performs consequential candidate routing.

## Acceptance

Source acceptance:
1. Kyiv winter/summer schedule tests pass.
2. Same-Monday replay is idempotent.
3. Unauthenticated API read returns 401.
4. Missing sources fail closed.
5. Model endpoints/imports are forbidden by test.
6. Owner UI displays proof counters and explicit coverage gaps.

LIVE acceptance still requires protected merge, exact-SHA HAE deploy, real Monday D1 receipt and authenticated owner readback.
