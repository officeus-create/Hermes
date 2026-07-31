# Lane Publication Scorecard

Date: 2026-07-31  
Tracking: Issue #20, draft PR #19, queue tasks 116–126

## Current source status

Task 116 remains blocked: no owner-approved sanitized historical origin-to-destination export is connected to this repository.

The repository must not connect `OFFICE 374 2026` directly. It is an internal structure example only. Current load-board offers remain private observations and cannot prove completed routes, public capacity, rates, availability, or demand.

Tasks 117–120 have a synthetic/preview implementation in the existing Phase 2 draft stack. Real-data execution remains blocked until an owner-approved sanitized export exists. Any future intake must remove private fields, normalize the approved geography/equipment/date fields, preserve raw records during deduplication, and attach provenance to every retained row.

## Tasks 121–126 implementation

`src/data/lane-opportunity.ts` provides a transparent internal score with five visible dimensions:

| Dimension | Score | Evidence requirement |
| --- | ---: | --- |
| Route evidence | 0–2 | Completed transportation history or a verified public source; never a current offer alone |
| Demand evidence | 0–2 | Dated, attributable demand research |
| Competition evidence | 0–2 | Dated SERP/market research from approved sources |
| Hermes operational fit | 0–2 | Evidence that the service scope and equipment fit are real and current |
| Unique local value | 0–2 | Specific useful guidance that is not a thin location-page variation |

Maximum score: 10.  
Editorial-review threshold: 7.

The score is not hidden. The result returns the five-part breakdown, blockers, threshold, and limitations.

## Hard gates

A score cannot become eligible for editorial review unless all of these are true:

- origin and destination use city plus two-letter state code;
- equipment and language scope are present;
- every score dimension has provenance IDs;
- every score dimension has a valid review date;
- sources passed the approved-source review;
- privacy review passed;
- a useful crawlable path and CTA are planned;
- the total score is at least 7/10;
- the evidence is not synthetic;
- the route basis is not a current load-board offer observation.

Missing evidence produces `blocked_missing_evidence`. A score below 7, synthetic evidence, or current-offer-only evidence produces `research_only`.

The highest possible result is `eligible_for_editorial_review`. The evaluator has no `published` result and cannot publish a page, move a lifecycle state, create a route, expose data, or claim capacity.

## Privacy boundary

No fixtures or examples may contain real names, phones, emails, companies, MC/DOT, exact addresses, VINs, orders, invoices, BOL/POD, notes, individual rates, commissions, customer/broker/carrier identities, live positions, or credentials.

Source identifiers used in tests are synthetic fixture identifiers only. Real source identifiers must remain in an approved internal system and must not be rendered into public pages.

## Release evidence

Required before this batch can be recommended for merge:

1. `npm run build`
2. `npm test`
3. `npm run test:e2e`
4. Latest PR head has green GitHub Actions
5. Owner separately approves any merge or production deployment
