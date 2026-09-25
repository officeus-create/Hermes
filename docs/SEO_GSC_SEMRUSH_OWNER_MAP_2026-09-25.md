# SEO/GEO query ownership map — 2026-09-25

## Evidence boundary

This snapshot combines two authenticated first-party/project views reviewed on 2026-09-25:

- Google Search Console for `https://hermeslogisticsus.com/`, settled through 2026-09-22.
- Semrush U.S. desktop Organic Rankings dated 2026-09-24 and Keyword Magic results reviewed on 2026-09-25.

Semrush volumes and difficulty are market estimates. GSC clicks, impressions, CTR and average position are property observations. Neither source proves a qualified lead, customer, revenue result or future ranking.

## Current property baseline

| Source and window | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| GSC, 28 days (2026-08-26..2026-09-22) | 8 | 395 | 2.0% | 43.9 |
| GSC, 3 months | 38 | 1,964 | 1.9% | 41.3 |

Semrush reports 29 U.S. desktop keywords, estimated traffic 0, and 14 ranked pages. The free table exposes ten rows; hidden rows are not inferred.

## Priority owner map

| Priority | Product / intent | Confirmed query evidence | Canonical owner | Action |
| --- | --- | --- | --- | --- |
| P0 | Logistics-focused SEO | GSC: `/services/seo-for-logistics-companies/` 106 impressions and 0 clicks in 28 days. Semrush: `seo for transportation companies` positions 49 and 51, volume 50, KD 10; `trucking seo agency` position 63, volume 40, KD 8; `seo for supply chain companies` position 84, volume 50. | `/services/seo-for-logistics-companies/` | Preserve one owner. Current code already covers trucking, transportation, freight, dispatch, warehousing and supply-chain variants; do not repeat stale Sep 15 On Page edits or create separate pages for wording variants. |
| P0 | Car-hauling dispatch | Semrush: `car hauler dispatch` position 39, volume 110, KD 4–5. Keyword Magic: `car hauling dispatch service` volume 50, KD 5; `car hauler dispatcher` 40, KD 10; `car hauler dispatch service` 30, KD 0; related app/services variants 20 each. | `/logistics/car-hauling-dispatch/` | Keep the existing owner and its carrier-controlled scope. Shorten dense answers and improve scan structure during the next content pass. Keep load-board discovery intent on the Load Board owner. |
| P0 | Car-hauler load discovery | GSC: `auto transport load board` 15 impressions, `car hauler load board` 8. Semrush: `load boards for car hauling` position 73, volume 140, KD 8. | `/load-board/` | Preserve the existing owner and role/state canonical controls. The dispatch owner now links directly to the Carrier Knowledge Hub; retain descriptive internal anchors from carrier resources and other relevant owners. Do not publish fake live loads or clone role/query variants as indexable pages. |
| P0 | Repair-shop operating software | Keyword Magic: `auto repair shop management software` volume 880, KD 30, commercial/informational; `automotive repair shop management software` 320, KD 66; `repair shop management software` 320, KD 34; `best auto repair shop management software` 140, KD 50; `truck repair shop management software` 90, KD 24; `auto repair shop management software free` 70, KD 30. | `/services/hermes-connect/repair-shops/` | Route the cluster to the existing live Repair Shops page after active PR #1476 settles. Lead with verified booking/customer/vehicle/workspace capabilities and the truthful setup offer. Do not claim “best,” permanent free access, reviews or integrations without evidence. |
| P1 | Logistics education | Keyword Magic: `logistics training courses` volume 40, KD 27; `free online logistics training courses` volume 40, KD 24; longer online/management/shipping variants show volume 20. | `/paths/academy/` hub and `/academy/us-logistics-operations/` curriculum owner | Keep public curriculum discoverable as a `LearningResource` until approved cohort dates, access terms and price create a real Course offering. Do not target “free” unless the full described course is actually free. |
| P1 | Wisconsin vehicle transport | Semrush: Waukesha transactional query `carrier services for businesses near me in waukesha` position 43, volume 40, KD 8. GSC recorded a click on a Wisconsin vehicle-transport page. | Existing city/state vehicle-transport pages | Monitor the exact page-query fit. Keep local claims within verified service-area evidence; do not create more city pages until distinct demand and content are proven. |
| Monitor | Brand ambiguity | Semrush: `hermes engineering` position 80 and `hermes logistics` position 66. | Homepage and canonical entity references | Treat as ambiguous branded discovery. Improve consistent entity naming and citations; do not rewrite commercial pages around unrelated same-name demand. |
| Exclude | Competitor or misleading intent | `central dispatch car hauling` volume 140 is navigational; `badger vehicle shipping` volume 110 appears competitor/ambiguous. | None | Use only for comparison/research where truthful. Do not create doorway pages or imply affiliation. |

## Supporting keyword clusters

### Logistics dispatch

Primary: `car hauler dispatch`.

Supporting terms assigned to the same owner:

- `car hauling dispatch service`
- `car hauler dispatch service`
- `car hauler dispatcher`
- `car hauler dispatch services`
- `car hauler dispatch app`

### Logistics and trucking SEO

Primary: `trucking seo` and `seo for transportation companies`.

Supporting terms assigned to the same owner:

- `truck company seo marketing` — Semrush volume 260, KD 8
- `trucking seo company` — 260, KD 1
- `truck company seo` — 210, KD 7
- `seo for trucking` — 50, KD 1
- `trucking seo agency` — ranked position 63, volume 40

Food-truck terms are excluded because they represent a different market.

### Hermes Business Academy

Primary candidate: `logistics training courses`.

Supporting candidates, pending verified course fit:

- `online logistics training courses`
- `logistics training courses online`
- `logistics management training courses`
- `shipping logistics training courses`
- `warehouse logistics training courses`

### Hermes Connect Repair Shops

Primary: `auto repair shop management software`.

Supporting terms assigned to the same existing owner:

- `repair shop management software`
- `automotive repair shop management software`
- `truck repair shop management software`
- `auto body repair shop management software`
- `collision repair shop management software`

The “best,” “free,” and “open source” modifiers require explicit evidence and should not be used as claims.

## Technical findings that affect retrieval

- Semrush Site Audit reports 17 invalid structured-data items. Sixteen are incomplete `WebApplication` entities; the remaining Academy item declares a `Course` without a real offering. Draft PR #1492 supplies truthful Offers, changes informational capability parents to `WebPage`, and publishes pre-offer curricula as `LearningResource`.
- The 165 unminified-resource rows are repeated occurrences of the global `design-owner-polish.css` and `design-owner-polish.js` pair, not 165 distinct resources.
- The 78 broken-external-link warnings are dominated by Threads responses with HTTP 429. They are not accepted as proof that the profile URL is broken.
- The robots format warning is caused by the deliberate nonstandard `Content-Signal` directive required by repository policy. It is not removed solely to satisfy Semrush.
- Eleven “content optimization” notices expose a low-readability recommendation. They justify focused sentence and scan-structure improvements, not automated rewriting of every page.
- Eight pages have only one incoming internal link. The affected set includes the carrier resource hub and several specialized carrier/location pages; add links only from contextually related owners.

## Semrush project state and free-plan boundaries

- SEO Dashboard (2026-09-25): Authority Score 2, 217 referring domains and 444 backlinks. Of the referring domains, 211 have Authority Score 0–10, five have 11–20 and one has 61–70. The Network Graph labels the profile dangerous; this is a review signal, not sufficient evidence for disavowal.
- A free Backlink Audit campaign was started for the root domain and is calculating toxicity. No link was marked for removal, outreach, export or Google disavow.
- On Page SEO Checker contains 57 ideas for eight pages from a 2026-09-15 snapshot: 35 content, eight semantic, eight backlink, three SERP-feature, two UX and one technical idea. The technical idea is for the UI-state URL `/load-board/?role=broker`; the canonical SEO owner is `/load-board/`.
- The On Page snapshot includes stale keyword-placement advice already satisfied in current code. Its free rerun is blocked because all 10 monthly keywords are used.
- A fresh Site Audit rerun is blocked at 100/100 free monthly crawled pages. Position Tracking cannot be added because the free monitored-site limit is reached. JS Impact, detailed AI reports and additional analytical requests require a trial or paid quota; no trial was started.
- Site changes therefore use only current code plus reproducible audit defects. AggregateRating, review and video suggestions are held until real evidence or media exists.

## Execution order

1. Review and merge the bounded structured-data repair only after exact-head CI passes.
2. Let active PR #1476 settle before changing the Repair Shops owner.
3. Preserve the merged logistics-SEO owner and avoid repeating stale On Page keyword advice.
4. Improve the existing dispatch owner only where current copy remains hard to scan.
5. Strengthen contextual internal links to the Load Board, dispatch owner and carrier resource hub.
6. After deployment and monthly quota reset, rerun Site Audit and On Page SEO Checker, then compare the next settled 28-day GSC window.
