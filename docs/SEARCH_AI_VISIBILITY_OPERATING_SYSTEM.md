# Hermes Search & AI Visibility Operating System

Status: `ACTIVE / IMPLEMENTATION BASELINE 2026-09-25`

## North star

`query → canonical owner → retrieval surface → qualified action → qualification → opportunity → revenue`

Traffic and rank are diagnostics. The business outcome is qualified opportunity and revenue.

## Current forensic baseline

Authenticated Search Console comparison:

- 2026-08-26..2026-09-22: 8 clicks / 395 impressions / 2.03% CTR / avg position 43.92.
- 2026-07-29..2026-08-25: 31 clicks / 1,581 impressions / 1.96% CTR / avg position 40.31.
- Delta: -74.2% clicks and -75.0% impressions while CTR remained roughly flat.

Classification: `VISIBILITY_LOSS_NOT_PRIMARY_CTR_COLLAPSE`.

This means the first response is not a sitewide snippet rewrite. Find lost query/page families, preserve correct canonical owners, and rebuild authority/entity/evidence where the owner is relevant.

## Page Survival Pipeline

Every indexable URL must be classifiable through:

`URL → distinct intent → index state → impressions → unique queries → useful engagement → qualified action → opportunity/revenue`

Allowed decisions:

- `KEEP`
- `MERGE`
- `NOINDEX`
- `REPOSITION`
- `IMPROVE`
- `DELETE`
- `PENDING_EVIDENCE`

Lifecycle groups:

- `core_money`
- `supporting_authority`
- `experimental`
- `catalog`
- `geo`
- `localization`

## Growth freeze

Until the current indexable inventory is classified, do not launch bulk city/lane/equipment/job/resource/catalog permutations merely to grow indexable surface.

A new indexable page requires:

1. distinct authenticated demand or a strong user/product need;
2. real operating truth;
3. a canonical owner that does not duplicate an existing page;
4. a conversion or useful-action path;
5. a defined survival review date.

## Retrieval surfaces

Track separately where evidence exists:

- Google Web
- Google Image
- Google multimodal/search-by-image reporting
- Google AI features
- Bing Organic
- Bing/Copilot citations
- AI referral sessions from ChatGPT, Perplexity, Claude, Gemini and Copilot

Do not combine unavailable surfaces into a fabricated total.

## Business attribution

The canonical scorecard now carries:

`Search → landing sessions → CTA → qualified inquiry → opportunity → won/lost → pipeline value → revenue value`

Attribution methods must be explicit:

- `direct`
- `page_level`
- `query_share_estimate`
- `crm_reconciled`
- `not_available`

Estimated query value must never be reported as exact CRM revenue.

## Priority order

1. Forensic GSC loss analysis.
2. Indexable inventory + lifecycle/survival classification.
3. Entity Resolution #204.
4. Earned Authority #368.
5. Original evidence assets from real Hermes operations.
6. Video/image retrieval assets.
7. AI/search visibility measurement.
8. Search-to-revenue reconciliation.
9. Only then choose the next bounded on-page or new-page experiment.

## Current page decisions from the authenticated 28-day window

### Logistics SEO

Owner: `/services/seo-for-logistics-companies/`

Decision: `KEEP / OBSERVATION FREEZE`.

The page has relevant non-brand query discovery, but visibility is volatile and average positions are mostly outside page one. Do not run another broad title/H1/content rewrite merely because clicks are zero.

### Load Board

Owner: `/load-board/`

Decision: `IMPROVE / DO NOT MULTIPLY OWNERS`.

Relevant car-hauler/load-board impressions are increasing, but most rankings remain ~65-82. Improve usefulness, evidence, authority and retrieval assets; keep query parameters as UI/funnel state rather than new SEO owners.

### Appleton vehicle transport

Owner: `/logistics/appleton-wi-vehicle-transport/`

Decision: `PENDING_EVIDENCE / KEEP INTENT BOUNDARY`.

Do not create warehousing or nearby-city pages from old impressions alone.

## Cadence

Daily: indexing anomalies, material impression gains/losses, query migrations, conversion failures.

Weekly: query discovery, page groups, positions 10-30 / 30-50, gaining/losing owners, entity/AI citation deltas.

28 days: stable search trend, CTR, rank, organic sessions, qualified inquiries and opportunities.

90 days: revenue, durable authority/entity improvement, real referring domains and topic authority.

## Evidence boundary

Repository CI, sitemap submission, IndexNow acceptance, public search sampling and deployment success are not proof of Google indexing, Bing reporting, GA4 receipt, human qualification, opportunity or revenue. Keep each evidence stage separate.
