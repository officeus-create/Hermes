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
- Car-hauling title/description/H1/intro/FAQ/internal handoff are aligned to the already-observed load-search query family, including `find car hauling loads` and `car hauler load board`.
- Existing `/load-board/` remains the separate generic load-board owner; it is linked from the commercial car-hauling owner rather than duplicated.
- Repair Shop root remains the canonical product owner; no speculative repair city/category pages were created.
- The Repair owner now maps the verified software-demand family to the product truth: repair shop management, online booking, scheduling, customers and vehicle workflow, with explicit current fit for auto repair, truck/diesel, mobile mechanic, tire and body/collision shops.
- The page does not claim unsupported motorcycle, detailing, car-wash, parts or other category-specific product capability merely because those businesses are part of the longer-term acquisition market; those require product-fit evidence before dedicated targeting.
- Repair Shop root CTA clicks now emit `commercial_cta_click` with controlled `repair_shop_registration` / `repair_shop_plan` cta types, `hermes_connect_repair` page group, and `repair_shop_software` service group.
- Repair registration form submit emits `repair_shop_registration_start` so the next GA4 window can distinguish discovery from registration intent.

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
