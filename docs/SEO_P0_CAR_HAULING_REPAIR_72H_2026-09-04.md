# SEO P0 — Car Hauling + Repair / 72-hour execution

Date: 2026-09-04

## CEO focus
Only two acquisition directions are P0 for this window:
1. U.S. car-hauling carriers → search → Hermes carrier/load product → registration/intake → qualified carrier lead.
2. U.S. repair/service businesses → search → Hermes Connect Repair Shops → registration/intake → qualified business lead.

## Platform evidence at start
- GSC settled through 2026-09-02.
- Proven car-hauling GSC demand includes `car hauler dispatch`, `car hauling dispatch`, `car hauler load board`, `load boards for car hauling`, and `where can i find car hauling loads`; observed positions are mostly outside page one.
- Google keyword research for the United States also confirms meaningful commercial volume around `car hauler load board` (~480 monthly searches).
- Repair Shop canonical owner is Google `Submitted and indexed`, robots allowed, fetch successful, but repair/mechanic/collision/tire/detailing query rows are not yet present in the available 28-day GSC slice.
- Independent U.S. keyword-demand research confirms an existing Repair software market rather than a speculative content idea: `auto repair shop software` ~2,900 monthly searches, `repair shop management software` ~1,300, `mechanic shop software` ~590, and `collision repair software` ~590. These are keyword-research estimates, not Hermes GSC impressions.
- GA4 is available through the connected Branch 40 property. Sitewide `commercial_cta_click` and `seo_intake_start` exist, but the P0 Repair registration path lacked comparable page/service-group attribution before this branch.

## Bounded implementation in this branch
- Existing `/logistics/car-hauling-dispatch/` remains the canonical owner; no new location/lane doorway pages were created.
- The protected Car Hauling title and H1 remain unchanged to preserve existing production contracts. Proven load-search demand is added through the meta description, intro, audience copy, FAQ and internal handoff, including `find car hauling loads` and `car hauler load board`.
- Existing `/load-board/` remains the separate generic load-board owner; it is linked from the commercial car-hauling owner rather than duplicated.
- Repair Shop root remains the canonical product owner; no speculative repair city/category pages were created.
- Verified U.S. Repair software demand is recorded for the next bounded localized SEO patch, but the public Repair copy is deliberately unchanged in this sprint because its exact hero copy is a production revenue and multilingual localization contract. Demand alone is not permission to break that owner.
- No unsupported motorcycle, detailing, car-wash, parts or category-specific capability claims were added. Those require both search demand and product-fit evidence before targeting.
- Repair Shop root CTA clicks now emit `commercial_cta_click` with controlled `repair_shop_registration` / `repair_shop_plan` cta types, `hermes_connect_repair` page group, and `repair_shop_software` service group.
- Repair registration form submit emits `repair_shop_registration_start` so the next GA4 window can distinguish discovery from registration intent.

## CI evidence
- Production SEO hygiene continues to report 168 unique canonical URLs across 8 child sitemaps.
- Bing Webmaster hygiene passes.
- SEO growth audit reports 168 indexable pages, 168 sitemap URLs and 0 review warnings.
- Internal-link audit reports 0 review warnings.
- No sitemap, canonical, noindex or mass-indexing change is justified by this sprint.

## Stop rules
- No sitemap resubmit without a new proven defect.
- No mass indexing requests.
- No canonical/noindex changes to discovered-not-indexed URLs without crawl/page×query evidence.
- No generic rewrite wave and no new SEO pages without distinct demand plus product truth.
- GSC, keyword-demand research and GA4 remain separate evidence classes.

## 72-hour KPI
Stretch: 40,000 organic impressions across the two P0 acquisition directions.
Operational leading indicators: broader unique query coverage, improving impressions on the existing car-hauling owners, first Repair software query rows, non-zero attributed Repair registration CTA/start events, and no index/canonical regression.

40,000 impressions is a target, not a guaranteed search-engine outcome.
