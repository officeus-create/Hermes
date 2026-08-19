# Hermes GEO — Current State Entrypoint

Status: `IMPLEMENTATION_ACTIVE / VERIFICATION_PENDING`  
Backlog: #730  
Measurement source of truth: #206  
Design contract: #665  
CEO material visual queue: #694

This file is the canonical starting point for future GEO implementation work. Read it before older GEO design, scorecard, evidence, search, analytics, or operations documents.

## Truth rules

- `implemented` is not `CI verified`.
- `CI verified` is not Google/Bing/GA4/private-operations proof.
- owner-provided evidence stays owner-provided until independently/platform verified.
- unknown metrics stay unknown/null, never zero.
- no full AI conversations, credentials, user-level analytics, lead PII, deal amounts, or revenue amounts in public repository GEO evidence.
- no location/equipment/lane page factory without distinct demand, distinct first-party evidence and a non-conflicting canonical owner.
- no material visual production change without CEO preview approval.

## Stable foundation

GEO-200 tasks 1–160 were previously exact-head verified. Tasks 161–200 are implemented in #734–#737 but remain verification-pending while GitHub runners are queued; do not relabel them verified without an exact-head successful workflow.

Consolidation checkpoint: #731.

## GEO-300 implementation map

| Range | PR | Scope | Current repository state |
|---|---:|---|---|
| 201–210 | #738 | exact fresh GSC checkpoint | implemented, CI verification pending |
| 211–220 | #739 | US CTR/position opportunity engine | implemented, CI verification pending |
| 221–230 | #741 | bounded Logistics SEO owner optimization | implemented, CI verification pending |
| 231–240 | #743 | car-hauling search/answer readiness | implemented, CI verification pending |
| 241–250 | #746 | public JobPosting search evidence governance | implemented, CI verification pending |
| 251–260 | #748 | manual AI review-wave operating priorities | implemented, CI verification pending |
| 261–270 | #749 | entity/schema fail-closed operations | implemented, CI verification pending |
| 271–280 | #750 | discovery journey graph operations | implemented, CI verification pending |
| 281–290 | #751 | aggregate commercial funnel operations | implemented, CI verification pending |
| 291–300 | current PR | current-state / verification / handoff loop | implementation in progress |

## Fresh search checkpoint

Owner-provided exact export: `2026-07-30..2026-08-16` = 18 days.

Known aggregate facts:

- total: 18 clicks / 791 impressions / 2.28% CTR;
- United States: 2 clicks / 500 impressions / 0.4% CTR / average position 46.06;
- Ukraine: 12 clicks / 53 impressions;
- `/services/seo-for-logistics-companies/`: 242 impressions; page clicks/CTR/position unknown;
- `/services/seo/`: 89 impressions; page clicks/CTR/position unknown;
- `/logistics/car-hauling-dispatch/`: 20 impressions; page clicks/CTR/position unknown;
- `/careers/car-hauling-dispatcher/`: average position 5.12; other page metrics unknown;
- Google Jobs search appearance: 7 impressions / average position 2.71; clicks/CTR unknown.

Do not infer that page-level impressions are U.S. impressions. The export contains a country aggregate and page aggregates but not the cross-dimension country×page evidence required for owner-level U.S. attribution.

## Current highest-value external evidence gaps

1. U.S.-scoped owner-level GSC evidence for commercial owners.
2. GA4 existing-property exact-once receipt proof.
3. receiver-confirmed delivery for SEO / website-project families.
4. private aggregate human qualification evidence.
5. private aggregate opportunity / won / revenue-reconciled-win coverage evidence.
6. next manual 48-prompt × 5-provider AI review wave.
7. exact Google URL Inspection evidence for the first JobPosting owner.
8. exact Bing URL/index evidence.

These are external/authenticated evidence actions. Do not replace them with synthetic fixtures or new analytics properties.

## Current owner findings

### Logistics SEO

- first-screen intent and primary CTA pass current bounded audit;
- verified service/case/resource inbound types exist;
- metadata/evidence requires review around `Proven Growth System`, `Free Audit Scope` messaging, and held ProgressoPro relationship state;
- no immediate rewrite is authorized merely because the page has 242 impressions.

### Car hauling

- canonical answer/production owner and direct intake align;
- owner-operator, small fleet, new-authority conditional readiness and no-guarantee boundaries pass;
- evidence is fresh;
- current related-owner gap: broker setup packet + dedicated new-authority readiness checklist are not in the production related-owner set;
- 20 impressions do not establish U.S. performance, CTR, position, load availability, rates, or revenue.

### JobPosting

- one verified-open canonical public job owner is governed;
- Work.ua is the live submission route; Hermes path remains a preparation/preview surface;
- organic and Google Jobs evidence stay separate;
- a second public job page is blocked unless a distinct approved public role need and non-cloned evidence exist.

## Entity state

Schema publication approved:

- `hermes_ecosystem`;
- `hermes_academy`.

Held:

- `hermes_logistics`;
- `progressopro_marketing`;
- `hermes_it`.

Held entity/profile relationships must not leak into `sameAs` or production provider identity.

## Four-direction contract

The four business directions remain:

- Logistics → `/paths/logistics/`;
- Marketing → `/paths/marketing/`;
- Academy → `/paths/academy/`;
- Technology → `/paths/technology/` (SEO market key `it_hermes_connect`).

Shared business direction does not collapse GEO and SEO measurement into one evidence stream.

## Completion rule

Do not close #730 merely because all code packages exist.

Closure requires:

1. exact-head build success;
2. exact-head `npm test` success;
3. exact-head full `npm run test:e2e` success;
4. successful four-direction / owner / evidence / privacy contract chain;
5. explicit accounting of external evidence gaps;
6. material visual items, if any, routed to #694 and approved before production.

If engineering verification becomes green while authenticated external evidence remains missing, record the state as `engineering_verified_external_evidence_open`; do not invent a performance conclusion.
