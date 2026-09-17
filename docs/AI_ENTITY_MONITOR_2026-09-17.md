# HERMES SEARCH & AI VISIBILITY — AI ENTITY MONITOR

Status: IMPLEMENTED BASELINE / NO AUTONOMOUS EXTERNAL MUTATION
Date: 2026-09-17
Owner lane: SEO / GEO / Search, with Hermes Technology for runtime infrastructure

## Objective

Turn external AI/search descriptions of Hermes into an evidence-backed control loop:

`DISCOVER → VERIFY → CORRECT → MEASURE`

This module does not create more SEO pages by default. It strengthens one entity by comparing external descriptions against canonical company truth and routing only the specific correction that is needed.

## Canonical identity owner

Primary identity pages:

- `https://hermeslogisticsus.com/company-information/`
- `https://hermeslogisticsus.com/about/`
- canonical site root: `https://hermeslogisticsus.com/`

Hermes Logistics LLC is the U.S. logistics business identified on the site for logistics-related services and communications. Marketing, Academy, and Technology directions on the same site do not automatically mean every engagement is contracted through Hermes Logistics LLC.

## First real observation

Evidence: owner-provided Google Search screenshot from 2026-09-16 for the Russian query `гермес лоджистикс ллс`.

Observed:

- Google AI Overview recognizes Hermes Logistics LLC as a U.S. logistics company.
- The official Hermes site is visible in the generated result.
- `staff.am` is visibly used as a third-party source in the AI summary.
- The result page also shows similarly named Ukraine legal entities, creating entity ambiguity.
- The summary includes recruiting / Eastern Europe framing that can be influenced by historical third-party recruitment material.

This is one observation only. It is not a ranking guarantee and does not prove stable behavior for every user, device, geography, language, or future query.

Structured evidence lives in `data/seo/ai-entity-monitor-2026-09-17.json`.

## Correction queue

### Staff.am

State: `CORRECT_OWNED_PROFILE`.

Action is permitted only through authenticated owner/claimable profile access. Correct stale or unsupported company wording against current approved company facts. Do not treat the profile as earned editorial authority and do not invent scale, office, employment, client, or service claims.

### Hermes-owned pages

Do not create duplicate identity pages. Keep `/company-information/` and `/about/` as the canonical entity owners, and reinforce them through consistent internal linking, Organization/WebSite/entity schema, public profiles, and reviewed external citations.

## Measurement surfaces

Track these separately:

1. Google AI Overview
2. Google AI Mode
3. ChatGPT
4. Gemini
5. Microsoft Copilot
6. Perplexity

Do not collapse them into one opaque score. A mention, linked citation, recommendation, entity accuracy, service understanding, geography accuracy, and factual error are separate signals.

## KPIs

- brand query entity accuracy
- own-domain presence rate
- own-domain linked citation rate
- stale third-party source count
- entity conflict count
- service-understanding accuracy
- geography accuracy
- language consistency
- Google generative-AI impressions when Search Console evidence is available

## Google Search Console state

Google documents a Search generative AI control and a generative AI performance report for AI Overviews / AI Mode. The current GSC Wizard connector could not provide Hermes data during this implementation because its subscription is inactive. Therefore no fresh generative-AI impression number is claimed here.

Next evidence gate: obtain the Search Console generative-AI report from an authorized working source, then store only dated aggregate/page-level metrics required for the KPI. Missing data remains `UNKNOWN`, never zero.

## Product path

This monitor is the internal foundation for a future Hermes Connect / ProgressoPro client audit:

`website + business profiles + brand name → entity understanding → source map → fact conflicts → corrective actions → repeated measurement`

For Repair Shops, the future sales entry point is a free bounded audit of how search/AI systems understand the shop. Upsell is permitted only from verified gaps: Website → Local SEO → Reviews → Social → AI Visibility → Hermes Connect workflow. No fabricated AI mention counts or competitor comparisons.

## Privacy / evidence rule

Never store private conversations, cookies, tokens, account identifiers, personal search history, emails, phone numbers, or unrelated prompts. Screenshots are evidence intake; the public repository stores only sanitized structured observations and references.
