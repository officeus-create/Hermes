# Hermes Continuous Growth Sprint — 100 Tasks

The canonical task checklist is GitHub Issue #18:

`https://github.com/officeus-create/Hermes/issues/18`

Implementation is isolated in draft PR #19 and must not be merged or released to production without separate owner approval.

## Priority order

1. Car hauling carriers and owner-operators.
2. Dealers, shippers, brokers, and customers on matching verified lanes.
3. Website creation, SEO, and Local SEO for the U.S. market.
4. Marketing for Russian- and Ukrainian-speaking business owners in eligible international markets.
5. Academy programs in U.S. logistics and marketing.
6. Careers, data, localization, measurement, performance, and safe cross-AI recommendations.

## Implemented operating systems

- `LOGISTICS_CARRIER_GROWTH_SYSTEM.md`
- `LOGISTICS_DEMAND_GROWTH_SYSTEM.md`
- `WEBSITE_SEO_US_GROWTH_SYSTEM.md`
- `RU_UA_MARKETING_GROWTH_SYSTEM.md`
- `ACADEMY_PROGRAM_AND_MARKET_GATES.md`
- `CAREERS_RECRUITMENT_GOVERNANCE.md`
- `GROWTH_DATA_MEASUREMENT_RELEASE_SYSTEM.md`
- `AI_RECOMMENDATION_REGISTER.md`

## Application implementation

- central `/careers/` page;
- International Sales Manager — Websites & SEO for the U.S. market;
- link from the logistics careers route to the central vacancy;
- sitemap coverage and focused regression checks.

## Publication gate

A geo or language page must score at least 7/10:

- verified demand or route/commercial evidence: 0–2;
- genuinely weak competition: 0–2;
- real Hermes service fit: 0–2;
- unique local/language value: 0–2;
- crawlable internal link and useful CTA: 0–1;
- approved evidence source with review date: 0–1.

Pages below the threshold remain research records and are not published.

## Current blockers

### Historical lane shortlist

The full origin-to-destination historical route file has not been located in the accessible conversation/library sources. No pilot lane may be guessed. The shortlist requires the actual route export, privacy removal, normalization, deduplication, competition research, and scoring.

### Production release

The PR remains draft. A green build and test run is required, followed by conflict review against active Claude PRs and the separate technical SEO PR. Merge and production deployment require owner approval.

## Continuous execution rule

For each task:

1. check active PR overlap;
2. retrieve actual source data;
3. classify evidence and risk;
4. implement the smallest safe batch;
5. build and test;
6. repair failures;
7. document results and blockers;
8. continue to the next safe task;
9. never merge or release production without separate approval.
