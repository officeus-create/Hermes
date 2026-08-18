# Hermes GEO / AI Visibility Architecture

Status: `IMPLEMENTATION_IN_PREVIEW`  
Visual design baseline: `77c8e549a55b9cd42694821675afd29ac8d7f123`  
Shared design contract: Issue #665  
Measurement source of truth: Issue #206  
Existing AI visibility registry: Issue #150 / `src/data/ai-visibility-scorecard.ts`

## Objective

Hermes GEO must be understandable to a person and extractable by Google, ChatGPT, Gemini, AI answer engines, and other systems that consume facts, entities, evidence, relationships, and actions.

The implementation therefore has three separate layers:

1. **Measurement** — what was observed and what commercial outcome followed.
2. **Answer contract** — how a useful answer, entities, claims, evidence, truth labels, guided questions, and next actions are represented.
3. **Presentation** — how that contract becomes a premium Hermes page or component.

Presentation is preview-gated whenever the visual change is material. The approved design baseline is a visual reference; engineering and merge validation always run against the current canonical `main`.

## 1. GEO Measurement Layer

Implementation:

- `src/data/geo-measurement-layer.ts`;
- `src/data/geo-measurement-adapters.ts`;
- `src/data/geo-owner-measurement.ts`.

Standard windows:

- 7 days — early movement and breakage detection;
- 28 days — primary operating comparison;
- 90 days — slower authority, citation, and commercial trend.

The scorecard keeps these evidence stages separate:

`AI visibility → search discovery → CTA/intake → delivery → human qualification → opportunity/win`

It separately records:

- real AI observations only; synthetic observations are excluded;
- mention rate;
- linked-citation rate;
- recommendation rate;
- entity accuracy;
- description accuracy;
- factual-error rate;
- Google/Bing branded and non-branded discovery;
- CTA → intake → preview → handoff → receiver-confirmed delivery;
- reviewed inquiry → qualified lead → opportunity → won/lost outcome;
- evidence classes and missing-evidence flags.

Missing data is labeled as missing evidence. It is never converted into a false zero-market-performance conclusion.

### Exact-window adapters

Authenticated or owner-provided search evidence is not forced into a 7/28/90 row. A non-standard interval remains an exact checkpoint with its true number of days. This prevents a 16-day or other partial export from being mislabeled as a 7-day or 28-day baseline.

The analytics adapter uses the existing canonical commercial event registry instead of inventing a second telemetry vocabulary. It distinguishes:

- `journeyPath` — the canonical SEO/GEO owner that started the commercial journey;
- `eventPagePath` — the route where the actual CTA/intake/preview/handoff/delivery event occurred.

This preserves a real multi-page journey without assigning the intent owner to a technical form route.

SEO and website-project families remain explicitly incomplete where a receiver-confirmed delivery event is not established in the canonical registry. Handoff is never silently treated as delivery.

### Canonical owner reconciliation

`src/data/geo-owner-measurement.ts` adds the required owner-level view:

`canonical owner → registered AI prompts → real AI observations → search → CTA/intake → delivery → qualified outcome`

The owner set is the union of governed prompt owners and page owners found in search, funnel, or outcome evidence. A measurement-only owner remains visible with `promptCount: 0`; the system never invents an AI prompt simply because downstream evidence exists.

Each owner/window receives:

- prompt coverage;
- the same 7/28/90 scorecard metrics scoped only to that owner;
- missing-layer flags for AI visibility, search, funnel, and outcomes;
- cross-layer integrity checks;
- reconciliation status: `complete`, `incomplete`, or `inconsistent`.

Examples of integrity gaps include a qualified/reviewed outcome with no receiver-confirmed delivery evidence, or reviewed/qualified counts that exceed the reconciled delivered count. These are surfaced as evidence problems rather than reported as valid conversion rates.

No analytics property IDs, stream IDs, account IDs, recipient details, raw leads, names, emails, phones, companies, MC/USDOT, VINs, routes, rates, messages, tokens, cookies, or user-level exports belong in the repository scorecard.

## 2. GEO Answer Contract

Implementation: `src/data/geo-answer-contract.ts`.

Every answer surface can carry the following human + machine structure:

`SHORT ANSWER → WHY → EVIDENCE → WHAT IT MEANS FOR YOU → HOW TO APPLY → NEXT ACTION`

The same surface may also contain:

- claims;
- entities;
- entity relationships;
- evidence references;
- explicit truth labels;
- a short progressive question path;
- personalized outcomes;
- contextual next actions;
- JSON-LD generated from the reviewed contract.

### Truth labels

Supported labels:

- `verified_fact`;
- `inference`;
- `internal_hermes_data`;
- `demo`;
- `simulated`;
- `not_configured`.

The validator requires evidence for verified facts, inferences, and internal Hermes data. Demo and simulated origins must be visibly labeled as Demo or Simulated.

### Evidence rules

Evidence has a source name, origin, truth label, summary, optional HTTPS URL, and optional checked timestamp.

A claim, entity, or relationship cannot reference a missing evidence ID.

Public citations are emitted into JSON-LD only when the evidence item is explicitly marked `public_source` and has a reviewed HTTPS URL. Demo evidence is not emitted as a public citation.

### Entity-first rules

Each entity must answer:

- who/what is it;
- how it relates to Hermes;
- why it matters to this answer;
- what evidence supports the relationship.

Relationships are explicit edges between registered entities. Decorative network edges without semantic meaning are not part of the contract.

`src/data/geo-public-entity-adapter.ts` reuses the governed public entity registry. Entities on relationship/publication hold are not promoted into GEO as approved schema relationships.

## 3. AI visibility ownership

The existing 48-prompt AI Visibility registry remains the source of truth. `src/data/geo-prompt-owner-registry.ts` groups every prompt under exactly one canonical owner and preserves direction, language, geography, intent, cadence, expected facts, and prohibited claims.

`src/data/geo-ai-observation-evaluation.ts` distinguishes:

- citation to the expected canonical owner;
- citation to another governed Hermes owner;
- citation to an unmapped Hermes path;
- no linked citation.

Synthetic QA observations are excluded from business visibility reporting. A correct Hermes mention with the wrong cited owner is therefore visible as an owner-alignment problem instead of being counted only as a generic citation success.

The built-route audit verifies that governed production owners actually exist in generated `dist/` output and are not accidentally `noindex`. Dynamic Astro routes and physical routes are validated by the same built-site criterion.

## 4. Guided Action Loop

The contract supports:

`QUESTION → SELF-RECOGNITION → REALIZATION → UNDERSTANDING → APPLICATION → ACTION → PROGRESS → NEXT STEP`

Guardrails are enforced in code:

- maximum seven questions in one guided path;
- each question offers only 2–5 choices;
- every choice must produce one realization;
- every choice has exactly one next transition;
- no dead-end question or missing outcome is permitted;
- every personalized outcome has a site-relative next action.

This prevents a GEO answer surface from turning into a 25-question lead form.

## 5. Machine-readable output

`buildGeoAnswerSchema()` produces a WebPage/Question/Answer structure with explicit `about` entities.

Important boundary:

- machine-readable data mirrors reviewed human-readable content;
- it does not contain hidden claims that the visitor cannot inspect;
- it does not invent sources, partners, customers, rankings, reviews, metrics, integrations, or live provider state;
- preview WebPage/Question identity belongs to the preview URL, while governed production entity IDs and reviewed first-party source URLs remain canonical where appropriate.

## 6. Visual previews

Current preview routes:

- `/demos/geo-answer-surface/` — generic GEO answer architecture Demo;
- `/demos/geo-car-hauling-owner/` — car-hauling production candidate built from reviewed first-party Hermes facts.

Both routes are intentionally:

- `noindex,nofollow,noarchive`;
- excluded from the sitemap by the existing noindex build behavior;
- marked as Demo/Preview and CEO approval required;
- based on canonical Hermes Design OS tokens;
- designed for 390px and desktop;
- isolated from production publication until explicit approval.

The previews demonstrate direct answers, Connected Thread, layered application, entity/evidence surfaces, progressive guided choices, personalized outcomes, contextual next actions, and machine-readable Question/Answer relationships.

The generic demo does not assert a customer, ranking, metric, integration, live AI result, partner, or external source. The car-hauling candidate explicitly identifies its evidence as first-party Hermes service evidence and states that it is not independent third-party proof of performance.

## 7. CEO visual approval gate

Issue #665 is binding.

Any material visual GEO change follows this sequence:

1. build only in preview;
2. run build/tests/browser QA;
3. provide clickable preview URL;
4. explain the visual/UX change briefly;
5. receive explicit CEO approval;
6. only then merge/publish that visual change.

CI success is not CEO visual approval.

Purely technical measurement/schema/validation work that does not materially change visible output may proceed through normal engineering gates, but this branch keeps the visual previews unmerged until approval.

## 8. Verification

Contract tests include:

- `scripts/geo-measurement-layer.test.mjs`;
- `scripts/geo-measurement-adapters.test.mjs`;
- `scripts/geo-owner-measurement.test.mjs`;
- `scripts/geo-answer-contract.test.mjs`;
- `scripts/geo-public-entity-adapter.test.mjs`;
- `scripts/geo-prompt-owner-registry.test.mjs`;
- `scripts/geo-ai-observation-evaluation.test.mjs`;
- `scripts/geo-canonical-owner-route-audit.test.mjs`;
- `scripts/geo-car-hauling-answer-candidate.test.mjs`.

These are chained from the existing AI visibility test path used by `npm test`.

Browser QA includes:

- `tests/geo-answer-surface.spec.ts`;
- `tests/geo-car-hauling-owner.spec.ts`;
- noindex/sitemap exclusion;
- truth/evidence labeling;
- parsed JSON-LD Question/Answer and governed IDs;
- guided routing;
- 390px horizontal-overflow checks.

Repository acceptance remains the existing `npm run build` → `npm test` → `npm run test:e2e` pipeline plus the current SEO/GEO framework gates on canonical `main`.

## 9. Next implementation slices

1. feed real sanitized GSC/Bing/GA4/private-safe evidence into exact checkpoints and 7/28/90 owner reconciliation only when those evidence windows actually exist;
2. expand owner-level evidence diagnostics before creating more public answer surfaces;
3. use the car-hauling candidate as the first approved production pattern only after CEO visual approval;
4. then apply the same governed answer contract to the next highest-value existing owner rather than mass-generating pages;
5. measure AI visibility, citation-owner accuracy, search discovery, downstream action, delivery, qualification, and outcome as separate evidence stages.
