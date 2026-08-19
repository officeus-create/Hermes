# Hermes SEO — Owner-provided GSC evidence, 2026-08-19

## Source boundary
This document records the Google Search Console export supplied by the owner on 2026-08-19.

- Search type: Web.
- GSC UI date filter: Last 3 months.
- Daily rows actually present in the supplied chart: 2026-07-30 through 2026-08-16.
- The original ZIP is intentionally not committed to the repository.
- Repository evidence is limited to aggregate search-performance values needed for SEO decisions.
- This export does not prove current indexation of an individual URL, GA4 receipt, qualified leads, customers, or revenue.

Machine-readable snapshot: `data/seo/gsc-owner-snapshot-2026-08-19.json`.

## Aggregate evidence
Device rows reconcile to 18 clicks and 791 impressions.

| Dimension | Clicks | Impressions | CTR | Avg position |
|---|---:|---:|---:|---:|
| United States | 2 | 500 | 0.40% | 46.06 |
| Ukraine | 12 | 53 | 22.64% | 11.66 |
| Mobile | 10 | 170 | 5.88% | 28.39 |
| Desktop | 8 | 621 | 1.29% | 45.34 |

The U.S. result is primarily a **ranking/ownership problem**, not enough evidence for a blanket snippet rewrite. Most demonstrated non-brand commercial queries are still around positions 55–85.

### Comparable click/impression windows from the daily chart
- 2026-08-03 through 2026-08-09: 4 clicks / 149 impressions / 2.68% CTR.
- 2026-08-10 through 2026-08-16: 10 clicks / 597 impressions / 1.68% CTR.

Impressions expanded materially in the later seven-day window while CTR fell. Average position is intentionally not recomputed from daily average-position rows because that would not reproduce GSC's aggregate position calculation. A fresh aggregate export is required for a correct comparable position metric.

## Priority page evidence
### 1. Logistics SEO commercial owner
`/services/seo-for-logistics-companies/`

- 0 clicks
- 242 impressions
- 0% CTR
- avg position 62.65

Observed query family includes:
- `seo for logistics companies` — 37 impressions / 62.92
- `logistics seo agency` — 25 / 66.32
- `seo for logistics` — 24 / 72.62
- `logistics seo` — 18 / 75.00
- `trucking seo company` — 16 / 63.38
- `logistics seo company` — 10 / 60.80
- `logistics seo consultants` — 9 / 59.44

**Decision:** KEEP canonical owner. Diagnose ownership, internal links, supported evidence, and overlap with `/services/seo/` before visible copy changes. At these positions, 0% CTR must not be misclassified as primarily a title/meta defect.

### 2. General SEO owner
`/services/seo/`

- 0 clicks
- 89 impressions
- avg position 75.37

**Decision:** OWNER-OVERLAP REVIEW. General SEO must not compete for the same logistics-specific head terms if `/services/seo-for-logistics-companies/` is the intended niche owner.

### 3. Appleton vehicle transport
`/logistics/appleton-wi-vehicle-transport/`

- 0 clicks
- 43 impressions
- avg position 40.81

The query export includes `appleton warehousing services` and `appleton logistics services`. Hermes must not add warehousing claims or content merely to absorb this tested search demand unless the business actually offers that service.

**Decision:** KEEP vehicle-transport owner; classify warehousing intent as mismatch/unsupported. Improve only transport-relevant ownership and links.

### 4. Hermes Connect
`/services/hermes-connect/`

- 0 clicks
- 22 impressions
- avg position 13.55

**Decision:** NEAR-PAGE-ONE OBSERVATION. This owner deserves a focused snippet/intent/internal-link audit because the ranking is close enough for CTR work to become meaningful. No invented software capability should be added.

### 5. Resource winners
`/logistics/resources/auction-vehicle-pickup-checklist/`

- 1 click / 15 impressions / 6.67% CTR / position 14.07

`/logistics/resources/car-hauler-capacity-checklist/`

- 1 click / 10 impressions / 10% CTR / position 9.90

**Decision:** POSITIVE RESOURCE SIGNAL. Preserve these pages, inspect their next-step paths, and use their performance as evidence before creating adjacent resources. Do not mass-produce checklist permutations.

## Brand/entity evidence
- `hermes logistics`: 3 clicks / 70 impressions / 4.29% CTR / position 26.93.
- `hermes logistics llc`: 1 click / 12 impressions / 8.33% CTR / position 4.75.
- Homepage: 6 clicks / 83 impressions / position 30.12.
- Company Information: 2 / 75 / position 9.76.
- RU home: 2 / 24 / position 9.17.
- UA home: 2 / 23 / position 14.22.

**Decision:** keep entity consistency work active. The exact LLC query is healthy relative to the broader ambiguous brand query, which indicates disambiguation remains useful. Do not invent sameAs, addresses, fleet, revenue, affiliations, or other company facts.

## Academy evidence
`/academy/us-logistics-operations/`: 0 clicks / 13 impressions / position 31.62.

Observed query: `logistics training systems` — 6 impressions / position 53.67.

**Decision:** observation only. Keep English U.S.-operations intent separate from Ukrainian acquisition. No diaspora-country page is justified by this export.

## U.S. recovery table
| Surface / query family | Evidence | Decision | Next action |
|---|---|---|---|
| Logistics SEO niche owner | High impressions, rank ~60–75 | KEEP / IMPROVE ARCHITECTURE | ownership + links + evidence; visible rewrite only after gate |
| General SEO owner | 89 impressions, rank 75 | REVIEW OVERLAP | prevent niche cannibalization |
| Hermes Connect owner | 22 impressions, pos 13.55 | IMPROVE | focused snippet/intent/link audit |
| Appleton transport | 43 impressions, pos 40.81; mixed intent | KEEP / FILTER INTENT | reject warehousing stuffing; reinforce true transport intent |
| Resource checklists | first clicks, positions ~10–14 | PRESERVE / EXPAND CAREFULLY | improve next-step path; derive adjacent resources only from evidence |
| Brand/entity | broad brand weak, exact LLC stronger | IMPROVE ENTITY CLARITY | consistency/disambiguation audit |
| Texas/DFW/Houston geo | separate research only | HOLD | distinct local value + conversion + measurement required before page |

## Batch 4 tasks 201–220 disposition
201–210 are satisfied by the machine-readable snapshot plus this provenance/measurement document, except future fresh GSC comparison exports remain external inputs.

211–220 are satisfied at the decision-table level: the dominant U.S. issue is low ranking and ownership, not a blanket CTR rewrite. Exact page/query country attribution is unavailable in this export because GSC exported dimensions separately rather than as a joined query×page×country dataset; do not fabricate that join.

## Non-negotiable release rules
1. Do not equate impressions with demand strong enough to justify a new page.
2. Do not equate 0% CTR at position 60–80 with a snippet-only problem.
3. Do not add unsupported services (for example warehousing) because Google tested a page for that query.
4. Do not create city/state/keyword permutations without distinct value and owner separation.
5. Visible public composition changes still require preview, desktop + 390px QA, and explicit CEO visual approval.
6. Nonvisual evidence, tests, ownership maps, and safe internal architecture may merge autonomously when CI is green.
