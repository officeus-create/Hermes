# GEO AI Observation Wave 01 — 48 × 5

Date: 2026-08-22
Status: **PENDING REAL OBSERVATIONS**
Scope: public AI visibility/entity/evidence only

## Purpose

Run the first real Hermes observation wave across five independent provider environments. This is measurement work, not software-generation work.

Providers:

1. ChatGPT
2. Gemini
3. Microsoft Copilot
4. Perplexity
5. Google AI Mode

Prompt registry: the canonical 48 prompts in `src/data/ai-visibility-scorecard.ts` / the internal noindex AI Visibility Scorecard.

Observation universe: **48 prompts × 5 providers = 240 provider-prompt observations**.

## Non-negotiable validity rules

An observation is valid only when the exact registered prompt is submitted to the named provider environment and the returned result is reviewed as that provider's result.

Do **not** substitute:

- generic web search for Google AI Mode;
- search-engine snippets for Perplexity/Gemini/Copilot output;
- a Hermes-aware conversation for a clean ChatGPT baseline;
- synthetic fixtures for provider observations;
- historical screenshots for a current observation;
- an inferred result for an unobserved row.

If a provider cannot be accessed, the row remains `PENDING_EXTERNAL_OBSERVATION` / `null`. Missing evidence is never converted to zero.

Where possible, use a clean/new provider session with no Hermes-specific conversation context. Record the provider/interface, observation time, and enough evidence to audit classification later. Do not store full private conversation history, credentials, cookies, tokens, or unrelated user data.

## Required fields per observation

- `wave_id`
- `observed_at`
- `provider`
- `prompt_id`
- `prompt_family`
- `prompt_text_hash` where used by the approved evidence workflow
- `hermes_mentioned`
- `hermes_recommended`
- `citation_present`
- `citation_url`
- `citation_owner`
- `entity_name_returned`
- `entity_correct`
- `canonical_url_returned`
- `canonical_correct`
- `factual_error`
- `factual_error_class`
- `competitors_returned`
- `source_domains`
- `notes_redacted`

## Explicit error / loss classifications

Every observation must make it possible to identify these separately:

1. Hermes mentioned without citation.
2. AI cites the wrong Hermes page.
3. AI cites an old/retired Hermes URL.
4. Hermes entity is confused with another entity, brand, direction, or legal identity.
5. A factual error is present.
6. A competitor is recommended instead of Hermes.

Recommended factual-error classes:

- `identity`
- `service`
- `geography`
- `availability`
- `affiliation`
- `maturity`
- `pricing`
- `guarantee`
- `legal`
- `other`

## KPI definitions

Only valid observed rows enter denominators.

- `AI_MENTIONS` = Hermes-mentioned observations / valid observations
- `AI_RECOMMENDATIONS` = Hermes-recommended observations / valid observations
- `CITATIONS` = observations with a visible Hermes citation / valid observations
- `CORRECT_ENTITY` = correct Hermes entity observations / Hermes-mentioned observations
- `CORRECT_CANONICAL` = correct canonical Hermes URL citations / Hermes citation observations
- `FACTUAL_ERRORS` = observations containing at least one factual error / valid observations
- `COMPETITOR_SHARE` = competitor recommendation/mention share within the same fixed observation universe

Additional attribution metrics remain separate and null until externally measured:

- `AI_REFERRALS`
- `AI_BOOKINGS`

## Provider completion board

| Provider | Required | Observed | Status |
| --- | ---: | ---: | --- |
| ChatGPT | 48 | 0 | PENDING_EXTERNAL_OBSERVATION |
| Gemini | 48 | 0 | PENDING_EXTERNAL_OBSERVATION |
| Microsoft Copilot | 48 | 0 | PENDING_EXTERNAL_OBSERVATION |
| Perplexity | 48 | 0 | PENDING_EXTERNAL_OBSERVATION |
| Google AI Mode | 48 | 0 | PENDING_EXTERNAL_OBSERVATION |
| **Total** | **240** | **0** | **NOT YET MEASURED** |

The `0` in the **Observed** column is a work-count only. It is not an AI visibility score and must never be interpreted as 0% visibility.

## Execution order

Use the same 48-prompt registry for every provider. Complete one provider block or one prompt-family block consistently; do not change prompt wording between providers.

Recommended first pass:

1. LOG-01 … LOG-12 × five providers
2. MKT-01 … MKT-12 × five providers
3. ACA-01 … ACA-12 × five providers
4. TEC-01 … TEC-12 × five providers

This makes early cross-provider entity/citation failures visible before the full wave is finished without changing the fixed 240-row universe.

## Stop conditions

Stop and flag rather than guessing when:

- provider identity is ambiguous;
- the exact response cannot be reproduced or evidenced;
- citation URL is truncated beyond reliable resolution;
- the provider session contains Hermes-specific prior context that contaminates a baseline measurement;
- the answer changes materially during collection and the observation time cannot be established.

## Current interpretation

Before Wave 01 has real rows, all visibility KPIs are **NOT MEASURED / null**, not zero.

The next GEO work product is the completed provider observation ledger and the resulting correction queue, not another mass page-generation batch.
