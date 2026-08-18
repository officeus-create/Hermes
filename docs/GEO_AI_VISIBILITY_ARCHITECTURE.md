# Hermes GEO / AI Visibility Architecture

Status: `IMPLEMENTATION_IN_PREVIEW`  
Baseline: `77c8e549a55b9cd42694821675afd29ac8d7f123`  
Shared design contract: Issue #665  
Measurement source of truth: Issue #206  
Existing AI visibility registry: Issue #150 / `src/data/ai-visibility-scorecard.ts`

## Objective

Hermes GEO must be understandable to a person and extractable by Google, ChatGPT, Gemini, AI answer engines, and other systems that consume facts, entities, evidence, relationships, and actions.

The implementation therefore has three separate layers:

1. **Measurement** — what was observed and what commercial outcome followed.
2. **Answer contract** — how a useful answer, entities, claims, evidence, truth labels, guided questions, and next actions are represented.
3. **Presentation** — how that contract becomes a premium Hermes page or component.

Presentation is preview-gated whenever the visual change is material.

## 1. GEO Measurement Layer

Implementation: `src/data/geo-measurement-layer.ts`.

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

## 3. Guided Action Loop

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

## 4. Machine-readable output

`buildGeoAnswerSchema()` produces a WebPage/Question/Answer structure with explicit `about` entities.

Important boundary:

- machine-readable data mirrors reviewed human-readable content;
- it does not contain hidden claims that the visitor cannot inspect;
- it does not invent sources, partners, customers, rankings, reviews, metrics, integrations, or live provider state.

## 5. First visual preview

Preview route:

`/demos/geo-answer-surface/`

The route is intentionally:

- `noindex,nofollow,noarchive`;
- excluded from the sitemap by the existing noindex build behavior;
- marked `DEMO · CEO APPROVAL REQUIRED`;
- based on the canonical Hermes Design OS tokens;
- designed for 390px and desktop;
- isolated from Hermes Connect auth/API/D1/business logic.

The preview demonstrates:

- direct short-answer block;
- Connected Thread: Question → Entity → Data → Evidence → Hermes interpretation → Business action;
- layered answer cards;
- entity cards;
- meaningful relationship map;
- source/evidence card;
- progressive two-question guided path;
- personalized outcome and contextual next action;
- machine-readable Question/Answer structure.

It does **not** assert a customer, ranking, metric, integration, live AI result, partner, or external source. Its evidence fixture is labeled Demo.

## 6. CEO visual approval gate

Issue #665 is binding.

Any material visual GEO change follows this sequence:

1. build only in preview;
2. run build/tests/browser QA;
3. provide clickable preview URL;
4. explain the visual/UX change briefly;
5. receive explicit CEO approval;
6. only then merge/publish that visual change.

CI success is not CEO visual approval.

Purely technical measurement/schema/validation work that does not materially change visible output may proceed through normal engineering gates, but this branch keeps the visual preview unmerged until approval.

## 7. Verification

Contract tests:

- `scripts/geo-measurement-layer.test.mjs`;
- `scripts/geo-answer-contract.test.mjs`;
- both are chained from `scripts/ai-visibility-scorecard.test.mjs`.

Browser QA:

- `tests/geo-answer-surface.spec.ts`;
- verifies noindex/sitemap exclusion;
- validates Demo labeling and JSON-LD Question/Answer output;
- checks guided routing;
- checks 390px horizontal overflow.

Repository acceptance remains the existing build/test/e2e pipeline.

## 8. Next implementation slices

After this foundation is technically green:

1. reconcile real GSC/Bing/GA4/private-safe 7d/28d inputs into the Measurement Layer without fabricating unavailable windows;
2. identify the highest-value existing Hermes owner page for the first production GEO answer surface;
3. map its real entities and evidence;
4. build the production candidate in preview using the same answer contract;
5. obtain CEO visual approval;
6. merge only after approval and technical QA;
7. measure AI visibility, search discovery, downstream action, qualification, and outcome as separate evidence stages.