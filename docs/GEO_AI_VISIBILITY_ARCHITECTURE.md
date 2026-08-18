# Hermes GEO / AI Visibility Architecture

Status: `IMPLEMENTATION_IN_PREVIEW`  
Visual design baseline: `77c8e549a55b9cd42694821675afd29ac8d7f123`  
Shared design contract: Issue #665  
Measurement source of truth: Issue #206  
Existing AI visibility registry: Issue #150 / `src/data/ai-visibility-scorecard.ts`

## Objective

Hermes GEO must be useful to a person and extractable by Google, ChatGPT, Gemini, AI answer engines, and other systems that consume facts, entities, evidence, relationships, and actions.

The implementation is intentionally split into three layers:

1. **Measurement** — what was observed and what commercial outcome followed.
2. **Answer / evidence contract** — what may be stated, how it is supported, and how entities relate.
3. **Presentation** — how the reviewed contract becomes a premium Hermes experience.

Presentation is preview-gated whenever a visual change is material. The approved design baseline is a visual reference; engineering validation always runs against the current canonical `main`.

## 1. Measurement layer

Implementation:

- `src/data/geo-measurement-layer.ts`;
- `src/data/geo-measurement-adapters.ts`;
- `src/data/geo-measurement-import.ts`;
- `src/data/geo-owner-measurement.ts`.

Standard operating windows:

- 7 days — early movement and breakage detection;
- 28 days — primary operating comparison;
- 90 days — slower authority, citation, and commercial trend.

The scorecard keeps these stages separate:

`AI visibility → search discovery → CTA/intake → delivery → human qualification → opportunity/win`

It separately records:

- real AI observations only; synthetic QA is excluded;
- mention, citation, recommendation and accuracy metrics;
- factual-error rate;
- Google/Bing branded and non-branded discovery;
- CTA → intake → preview → handoff → receiver-confirmed delivery;
- reviewed inquiry → qualified lead → opportunity → won/lost outcome;
- evidence classes and missing-evidence gaps.

Unknown evidence is unknown. It is never converted into a false zero-performance conclusion.

### Exact-window search evidence

Authenticated or owner-provided search evidence is not forced into a 7/28/90 row. A non-standard interval remains an exact checkpoint with its true date range. A 16-day export cannot become a fake 7-day or 28-day baseline.

### Canonical analytics funnel

The analytics adapter reuses the existing production event registry. It does not invent a second GEO event vocabulary.

It distinguishes:

- `journeyPath` — the canonical SEO/GEO owner that started the commercial journey;
- `eventPagePath` — the route where the event actually occurred.

This preserves a real multi-page journey such as owner page → intake workspace → handoff/delivery without assigning the intent owner to a technical form route.

SEO and website-project families remain explicitly incomplete while no receiver-confirmed delivery event is established in the canonical registry. Handoff is never treated as delivery.

### Sanitized measurement import

`src/data/geo-measurement-import.ts` is the boundary before calculations.

It accepts only strict aggregate fields for:

- GSC/Bing exact search checkpoints;
- canonical aggregate analytics events;
- private-safe aggregate commercial outcomes.

It rejects undeclared fields, query-string owner paths, unsupported windows, negative counts, cross-family analytics events, and inconsistent outcome hierarchies.

The repository measurement contract must not carry raw leads, names, emails, phones, companies, MC/USDOT, VINs, rates, messages, account/property/stream IDs, credentials, tokens, cookies, or revenue amounts.

### Canonical owner reconciliation

`src/data/geo-owner-measurement.ts` adds the owner-level chain:

`canonical owner → registered prompts → real AI observations → search → CTA/intake → delivery → qualified outcome`

The owner universe is the union of governed prompt owners and owners present in search/funnel/outcome evidence. A measurement-only owner remains visible with `promptCount: 0`; an AI prompt is never invented because downstream evidence exists.

Each owner/window receives:

- prompt coverage;
- scoped 7/28/90 metrics;
- missing-layer flags for AI visibility, search, funnel, and outcomes;
- integrity gaps;
- reconciliation status: `complete`, `incomplete`, or `inconsistent`.

Examples of integrity gaps include reviewed/qualified outcomes with no receiver-confirmed delivery evidence, or reviewed/qualified counts that exceed the reconciled delivered count.

## 2. AI visibility ownership and review

The existing 48-prompt AI Visibility registry remains the source of truth.

`src/data/geo-prompt-owner-registry.ts` groups every prompt under exactly one canonical owner and preserves direction, language, geography, intent, cadence, expected facts, and prohibited claims.

`src/data/geo-ai-observation-evaluation.ts` classifies a real linked citation as:

- `canonical_owner`;
- `other_hermes_owner`;
- `unmapped_hermes_path`;
- `no_linked_citation`.

This means a correct Hermes mention with the wrong cited owner is visible as an owner-alignment problem instead of disappearing inside a generic citation rate.

The built-route audit verifies generated `dist/` output, including dynamic Astro routes. Governed production owners must actually exist and must not accidentally become `noindex`.

### Manual review scheduler

`src/data/geo-ai-review-plan.ts` turns the 48-prompt registry into a repeatable review process without adding provider automation.

Default reviewed provider set:

- ChatGPT;
- Gemini;
- Copilot;
- Perplexity;
- Google AI Mode.

The caller may supply a different explicit provider set from the existing governed provider enum.

Cadence is operationalized as:

- weekly → 7 days;
- monthly → 28 days.

Each prompt × provider checkpoint becomes:

- `never_observed`;
- `overdue`;
- `due_soon`;
- `current`.

Synthetic observations never reset a real review due date. Future-dated observations and unknown prompt IDs fail validation.

This is a scheduling and evidence-control layer only. It does not log into providers, scrape conversations, publish content, or call provider APIs.

### Sanitized AI observation import

`src/data/geo-ai-observation-import.ts` is the manual ingestion boundary for real reviewed AI observations.

Allowed information is structured only: prompt ID, provider, timestamp, pseudonymous reviewer label, mention/citation flags, site-relative cited path, recommendation state, accuracy states, factual-error flag, public competitor labels, bounded corrective action, and evidence reference.

The importer rejects:

- raw/full provider responses;
- transcripts or conversation fields;
- arbitrary undeclared fields;
- email and obvious phone data;
- person-style reviewer strings instead of opaque labels;
- unknown providers or prompts;
- external cited URLs where the current observation contract requires a Hermes site-relative citation;
- duplicate observation IDs;
- duplicate prompt × provider × timestamp checkpoints.

GitHub remains a structured evidence registry, not a conversation archive.

### Competitive AI visibility

`src/data/geo-ai-competitive-visibility.ts` provides bounded competitive observation metrics:

- Hermes presence rate in the reviewed answer set;
- competitor-inclusion rate;
- normalized unique public competitor labels;
- competitor mention occurrences;
- owner/provider breakdown;
- `entityMentionShare` within the reviewed observation set.

`entityMentionShare` is **not** market share, search SOV, ranking share, traffic share, or business-performance evidence.

Synthetic observations are excluded.

## 3. Four-direction alignment

The current SEO market architecture and GEO share four business directions but remain separate publication/measurement workstreams.

`src/data/geo-direction-alignment.ts` maps:

- GEO `logistics` → SEO `logistics` → `/paths/logistics/`;
- GEO `marketing` → SEO `marketing` → `/paths/marketing/`;
- GEO `academy` → SEO `academy` → `/paths/academy/`;
- GEO `technology` → SEO `it_hermes_connect` → `/paths/technology/`.

The SEO registry remains scoped to Google/Bing market research and publication control. An SEO research candidate cannot silently become a GEO prompt, answer surface, or page.

Existing compliance/market exclusions in the SEO registry remain authoritative for SEO acquisition research and are not overridden by GEO.

## 4. Answer contract

Implementation: `src/data/geo-answer-contract.ts`.

Every answer surface can carry the same human + machine structure:

`SHORT ANSWER → WHY → EVIDENCE → WHAT IT MEANS FOR YOU → HOW TO APPLY → NEXT ACTION`

The surface may also contain:

- claims;
- entities;
- entity relationships;
- evidence references;
- explicit truth labels;
- a short progressive question path;
- personalized outcomes;
- contextual next actions;
- JSON-LD derived from the reviewed contract.

Supported truth labels:

- `verified_fact`;
- `inference`;
- `internal_hermes_data`;
- `demo`;
- `simulated`;
- `not_configured`.

Verified facts, inferences and internal Hermes data require evidence. Demo and Simulated origins must remain visibly labeled.

## 5. Evidence graph

`src/data/geo-evidence-graph.ts` checks that the human answer and machine evidence model remain connected.

It reports:

- which evidence supports visible answer claims;
- evidence used by entities and relationships;
- unused evidence;
- claims that exist in data but are not exposed in the human evidence layer;
- isolated entities;
- public sources missing a reviewed URL;
- public citation URLs supporting visible answer claims.

A release-ready evidence graph rejects unused sources, hidden answer claims, and public-source records without a reviewed URL.

A claim, entity, or relationship cannot reference a missing evidence ID.

## 6. Entity-first architecture

`src/data/geo-public-entity-adapter.ts` reuses the governed `public-entity-registry.ts`. GEO does not create a competing entity registry.

Each entity should make clear:

- who/what it is;
- how it relates to Hermes;
- why it matters to the answer;
- what evidence supports the relationship.

Held entity relationships remain held and are not emitted as approved public GEO relationships.

## 7. Guided Action Loop

The contract supports:

`QUESTION → SELF-RECOGNITION → REALIZATION → UNDERSTANDING → APPLICATION → ACTION → PROGRESS → NEXT STEP`

Guardrails:

- maximum seven questions;
- each question offers 2–5 simple choices;
- every choice produces one realization;
- every choice has exactly one next transition;
- no dead-end questions;
- every personalized outcome has a site-relative next action.

This prevents GEO from turning into a long lead questionnaire.

## 8. Machine-readable output

`buildGeoAnswerSchema()` produces WebPage / Question / Answer semantics with explicit `about` entities.

Boundaries:

- machine-readable data mirrors reviewed human-readable content;
- hidden machine-only claims are not allowed;
- sources, partners, customers, rankings, reviews, metrics, integrations, provider status, and results cannot be invented;
- preview WebPage/Question identity belongs to the preview URL;
- governed production entity IDs and reviewed first-party source URLs remain canonical when appropriate.

The current canonical `llms-full.txt` remains the higher-level evidence-bounded AI context. GEO does not create a parallel LLM-manifest standard.

## 9. Current visual previews

Current preview routes:

- `/demos/geo-answer-surface/` — generic GEO answer architecture Demo;
- `/demos/geo-car-hauling-owner/` — car-hauling production candidate using reviewed first-party Hermes facts.

Both are intentionally:

- `noindex,nofollow,noarchive`;
- excluded from the sitemap;
- visibly Demo/Preview and CEO-approval gated;
- based on Hermes Design OS tokens;
- browser-tested on desktop and 390px;
- isolated from production publication until explicit approval.

The generic demo does not assert a real customer, ranking, metric, integration, live AI result, partner, or external source.

The car-hauling candidate explicitly identifies first-party Hermes service evidence and states that it is not independent third-party performance proof.

Production `/logistics/car-hauling-dispatch/` is not modified by this preview implementation.

## 10. CEO visual approval gate

Issue #665 is binding.

Any material visual GEO change follows:

1. build only in preview;
2. run build/tests/browser QA;
3. provide Vladimir a clickable preview URL;
4. explain the visible/UX change briefly;
5. receive explicit personal approval;
6. only then publish that visual change.

CI success is not visual approval.

Pure measurement/schema/validation work that does not materially change visible output may continue through normal engineering gates.

## 11. Verification

Core GEO contract tests chained from `scripts/ai-visibility-scorecard.test.mjs` now include:

- measurement layer;
- exact-window and analytics adapters;
- sanitized measurement imports;
- owner reconciliation;
- answer contract;
- evidence graph;
- public entity adapter;
- prompt-owner registry;
- four-direction SEO/GEO alignment;
- AI observation evaluation;
- sanitized AI observation import;
- competitive visibility;
- manual AI review scheduler;
- canonical built-owner route audit;
- car-hauling production candidate.

Browser QA includes:

- `tests/geo-answer-surface.spec.ts`;
- `tests/geo-car-hauling-owner.spec.ts`;
- noindex/sitemap exclusion;
- parsed JSON-LD Question/Answer/entity identity checks;
- guided routing;
- 390px horizontal-overflow checks.

Repository acceptance remains current canonical `main` build/test/e2e plus the Hermes SEO Framework P0, four-direction market registry, long/short GEO evidence, commercial-owner internal-link, privacy and other current CI gates.

## 12. Current implementation boundary

Implemented now:

- governed prompt ownership;
- manual review scheduling;
- sanitized AI observation ingestion;
- citation-owner evaluation;
- bounded competitive AI metrics;
- exact search/analytics/outcome ingestion;
- 7/28/90 measurement;
- canonical owner reconciliation;
- answer/entity/evidence contracts;
- evidence graph diagnostics;
- two visual preview patterns.

Still evidence-gated rather than fabricated:

- live current GSC/Bing exports beyond owner-provided/authenticated checkpoints;
- GA4 exact-once production receipt where still unresolved in #206;
- receiver/private qualification evidence not supplied to the layer;
- real provider observation rows not manually reviewed/imported;
- production publication of visual GEO surfaces without CEO approval.

## 13. Next slices

1. connect real sanitized evidence only when authenticated/owner-reviewed inputs actually exist;
2. produce the first complete 7/28 owner scorecard rather than manufacturing missing values;
3. run the AI review queue against real manually reviewed observations;
4. use the car-hauling candidate as the first production visual pattern only after explicit CEO approval;
5. then apply the same governed answer contract to the next highest-value existing canonical owner, not to mass-generated robot pages.
