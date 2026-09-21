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

## AI trust incident — 2026-09-22

Evidence: owner-provided response from another AI assistant in the SEO/GEO project conversation. The raw conversation remains outside the public repository.

Observed:

- the assistant did not present evidence of fraud, but escalated weak or missing corroboration into a warning that `hermeslogisticsus.com` might be a scam;
- it associated the Hermes name with the unrelated European Hermes/Evri brand;
- it claimed an absence of search results, reviews, or records even though the official Hermes identity pages are publicly discoverable and public third-party company/profile records exist;
- the response then expanded into generic anti-scam warnings that were not evidence specific to Hermes Logistics LLC.

Classification:

- `FALSE_SCAM_CLASSIFICATION`;
- `HERMES_EVRI_BRAND_COLLISION`;
- `EXTERNAL_CORROBORATION_GAP`;
- `INDEPENDENT_ENTITY_AUTHORITY_GAP`.

This incident is not proof of fraud and must never be stored as such. It is a production AI-visibility defect showing that the external entity graph is not yet strong or consistent enough for every assistant to resolve Hermes Logistics LLC reliably.

### Remediation contract

1. Keep one stable machine-readable Logistics identity: `https://hermeslogisticsus.com/#logistics` → **Hermes Logistics LLC**.
2. Keep `/company-information/` and `/about/` as the canonical human-readable identity owners; do not create a duplicate trust/about page.
3. Bind canonical Logistics service ownership to `#logistics` rather than creating anonymous or competing provider identities.
4. Correct or reconcile stale claimable profiles through their existing owner lanes, starting with Staff.am.
5. Audit Google Business Profile, Microsoft Bing business presence, Apple Business/Maps and LinkedIn Company before creating any new listing; claim/correct an existing entity when one exists.
6. Reconcile D&B and other directories only against owner-controlled legal/company evidence; third-party modelled employee/revenue values are not canonical facts.
7. Build legitimate independent authority through relevant profiles, citations, reviews, associations, partner/editorial references and useful resources. No bulk directory blasts, fake reviews, fake offices, PBNs or paid-link schemes.
8. Re-run the governed AI visibility set after propagation. Track false-scam warnings, wrong-company collisions, own-domain citation and independent corroboration as separate metrics.

### Acceptance for this incident

The incident can be downgraded from active only after:

- canonical `#logistics` identity is live and machine-readable on production;
- high-visibility conflicting owned/claimable profiles are corrected or explicitly evidence-gated;
- Tier-1 business-profile presence has been audited and classified without duplicates;
- at least one later comparable provider wave shows improved entity resolution without an unsupported scam classification;
- the before/after evidence is dated and preserved in the existing AI Entity Monitor.

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
