# Hermes GEO Measurement Layer

Status: `IMPLEMENTED_MEASUREMENT_ENGINE — EXTERNAL EVIDENCE GATED`  
Implemented: 2026-08-18  
Primary source of truth: Issue #206  
AI visibility source: Issue #150 / `src/data/ai-visibility-scorecard.ts`

## Objective

Measure whether Hermes is being discovered, cited, acted on, qualified, and converted without collapsing unlike evidence into one vanity score.

The layer connects five distinct evidence stages:

`AI/search discovery → canonical page → CTA/intake → delivered inquiry → human-qualified commercial outcome`

It does **not** claim that a repository event was received by GA4, that an IndexNow submission is indexed, that a browser success state is a qualified lead, or that an AI provider mentioned Hermes unless the relevant evidence was actually recorded.

## What Release B adds

Issue #150 already provides the manual AI visibility foundation: 48 reusable prompts plus separate mention, linked-citation, recommendation, entity-accuracy, description-accuracy and factual-error metrics.

This layer adds a typed aggregation contract above that foundation:

- exact 7-day, 28-day and 90-day scorecard windows;
- explicit branded vs non-branded search discovery;
- Google and Bing aggregate inputs;
- commercial funnel aggregation from CTA through receiver-confirmed delivery;
- private-safe lead-quality reconciliation from human review through qualified lead, opportunity and won/lost outcome;
- revenue reconciliation represented as a count of wins whose commercial outcome was reconciled privately, without storing dollar values in repository fixtures;
- evidence-class preservation by stage;
- explicit missing-evidence flags instead of invented zero-performance conclusions;
- exclusion of synthetic AI observations from real visibility metrics.

Implementation: `src/data/geo-measurement-layer.ts`.

## Data contract

### 1. AI visibility

Source: existing `AiVisibilityObservation[]`.

Real observations are filtered by `observedAt` into the requested 7/28/90-day window. Any observation marked `synthetic: true` is excluded from business measurement.

Metrics remain separate:

- observation count;
- brand mention rate;
- linked citation rate;
- recommendation rate;
- correct-entity rate;
- correct-description rate;
- factual-error rate.

Do not blend these into one opaque AI score.

### 2. Search discovery

Each aggregate row contains only:

- `windowDays`;
- `source`: Google or Bing;
- `pagePath`;
- `discoveryType`: `branded` or `non_branded`;
- impressions;
- clicks;
- evidence class.

Branded/non-branded classification must come from a reviewed search-platform query export or another approved evidence workflow. The measurement engine does not infer brand status from referrers, page paths or guessed keywords.

Calculated metrics:

- total impressions/clicks/CTR;
- branded impressions/clicks/CTR;
- non-branded impressions/clicks/CTR.

### 3. Commercial funnel

Aggregate-only fields:

- CTA clicks;
- intake starts;
- preview ready;
- handoff ready;
- receiver-confirmed delivery.

Calculated ratios:

- CTA → intake;
- intake → preview;
- preview → handoff;
- handoff → delivery.

The existing production analytics event registry remains authoritative for event names and privacy-safe parameters. This layer does not install a second GA4/GTM tag and does not create a new property.

### 4. Lead quality and commercial outcome

Private operations provide sanitized aggregate counts only:

- human-reviewed inquiries;
- qualified leads;
- opportunities;
- wins;
- losses;
- wins with privately reconciled revenue outcome.

Calculated ratios:

- human review → qualified lead;
- qualified lead → opportunity;
- opportunity → win;
- receiver-confirmed delivery → qualified lead.

No customer, carrier, candidate, company, email, phone, MC/USDOT, VIN, route, rate, budget, message, request ID, account ID, property ID, stream ID, token or raw lead row belongs in this layer.

## Evidence classes

The layer preserves the evidence taxonomy from Issue #206 instead of merging stages:

- `repository_verified`;
- `production_verified`;
- `platform_verified`;
- `production_receiver_verified`;
- `private_operations_verified`;
- `owner_provided_handoff`;
- `unverified`.

A scorecard can therefore show strong repository coverage while still flagging missing platform receipt or private outcome reconciliation.

## Missing-evidence flags

The engine emits explicit gaps when a window lacks the relevant source:

- `ai_visibility_observations_missing`;
- `search_baseline_missing`;
- `funnel_receipt_missing`;
- `qualified_outcome_reconciliation_missing`;
- `non_branded_discovery_not_observed` when search evidence exists but no non-branded impressions were recorded.

A missing row means **missing evidence**, not proof of zero market visibility or zero business activity.

## Validation rules

The engine rejects structurally invalid aggregate inputs, including:

- non-site-relative page paths;
- negative or fractional counts;
- search clicks greater than impressions;
- qualified leads greater than human-reviewed inquiries;
- opportunities greater than qualified leads;
- wins + losses greater than opportunities;
- revenue-reconciled wins greater than total wins;
- invalid `asOf` timestamps.

These checks protect the scorecard contract; they do not authenticate the underlying platform evidence.

## 7 / 28 / 90 measurement cadence

The standard scorecard windows are:

1. **7 days** — early movement and breakage detection;
2. **28 days** — primary operational comparison window;
3. **90 days** — slower entity/citation/authority and commercial trend view.

Do not manufacture a 7-day or 28-day row by proportionally scaling a different date interval. The input must represent the stated evidence window.

For the Logistics SEO owner changed on 2026-08-13, preserve the agreed observation window unless a concrete canonical, crawl, privacy or production defect appears.

## Current external gates

As of the current Issue #206 state, repository methodology is ahead of authenticated production evidence in several areas:

- current comparable GSC 7-day and 28-day query × page rows are still required;
- GA4 property/stream ownership and exact-once priority-event receipt still require authenticated verification;
- Bing search/index performance evidence remains incomplete in the recorded state;
- private-safe delivery → human review → qualification → commercial outcome reconciliation still needs the first complete production scorecard.

The GEO Measurement Layer is therefore implemented as a reusable engine, but its real scorecards must remain evidence-gated until those inputs are supplied.

## Verification

The GEO contract test is `scripts/geo-measurement-layer.test.mjs` and is imported by the existing `scripts/ai-visibility-scorecard.test.mjs`, which is already part of `npm test`.

The test covers:

- 7/28/90 windows;
- synthetic AI exclusion;
- branded/non-branded split;
- search CTR;
- funnel conversion ratios;
- qualified-lead/opportunity/win ratios;
- evidence preservation;
- missing-evidence flags;
- invalid aggregate rejection;
- absence of prohibited raw lead/credential field names in fixtures.

Full repository acceptance remains:

```bash
npm run build
npm test
npm run test:e2e
```

## Ecosystem compounding scorecard

- **Primary outcome:** one measurement contract now connects AI visibility, search discovery, funnel behavior and qualified commercial outcomes.
- **SEO:** preserves query/page ownership and separates branded from non-branded discovery.
- **Conversion:** measures CTA → intake → preview → handoff → delivery rather than treating clicks as leads.
- **Knowledge:** reuses the existing 48-prompt AI visibility registry instead of duplicating it.
- **Internal linking:** no page-link changes in this bounded implementation.
- **Scale:** the typed aggregate model can support additional verified business directions without new analytics taxonomies.
- **AI/product:** creates a reusable scorecard primitive for Hermes reporting and future internal dashboards.
- **Data/privacy:** aggregate counts and controlled enums only; no raw lead or account identifiers.
- **Content reuse:** measured AI/query gaps can later become evidence-backed content tasks, not automatic publication.
- **Architecture:** typed shared engine plus deterministic test contract.
- **Deferred:** provider automation, direct GSC/Bing/GA4 connectors, scheduled checks, persistent storage and live dashboarding remain separately gated.
- **Verification:** branch CI must run the required build/test/e2e chain before merge.
