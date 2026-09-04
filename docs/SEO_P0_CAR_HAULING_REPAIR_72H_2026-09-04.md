# SEO P0 — Car Hauling + Repair / 72-hour execution

Date: 2026-09-04

## CEO focus
Only two acquisition directions are P0 for this window:
1. U.S. car-hauling carriers → search → Hermes carrier/load product → registration/intake → qualified carrier lead.
2. U.S. repair/service businesses → search → Hermes Connect Repair Shops → registration/intake → qualified business lead.

## Fresh settled Search Console evidence
- GSC is settled through 2026-09-02.
- `/logistics/car-hauling-dispatch/` is already being attributed to dispatch intent. In 2026-08-20..2026-09-02 its page×query rows were `car hauler dispatch` (6 impressions, avg position 41.5), `car hauler dispatch service` (1, 41), `car hauler dispatcher` (2, 64), `car hauling dispatch` (1, 40), and `car hauling dispatch service` (1, 38).
- `/load-board/` is already being attributed to load-board intent. In the same settled window its rows included `auto transport load board` (6 impressions, avg position 73.7), `car hauler load board` (1, 81), `car hauling load boards` (2, 65.5), and `load boards for car hauling` (2, 79.5).
- Across 2026-08-05..2026-09-02, `where can i find car hauling loads` was attributed to `/load-board/?role=broker` (4 impressions, avg position 26.75), while `car hauler load board` was attributed only to Load Board role/root variants in the returned rows.
- This page×query split is direct evidence to preserve owner separation rather than broaden the Dispatch page into generic Load Board intent.
- Independent U.S. keyword research previously confirmed meaningful commercial demand around `car hauler load board` (~480 monthly searches). This is keyword-research evidence, not Hermes GSC impressions.

## Repair evidence
- Repair Shop canonical owner is Google `Submitted and indexed`, robots allowed, fetch successful.
- Existing Repair SERP audit classifies `/services/hermes-connect/repair-shops/` as `KEEP_CANONICAL_OWNER / STRONG_INTENT_FIT`; its current title, H1, WebApplication schema, booking/scheduling/customer/vehicle workflow and direct owner registration already match the supported product truth.
- Independent U.S. keyword-demand research confirms a Repair software market: `auto repair shop software` ~2,900 monthly searches, `repair shop management software` ~1,300, `mechanic shop software` ~590, and `collision repair software` ~590. These are keyword-research estimates, not Hermes GSC impressions.
- Unsupported modules, duplicate generic Repair owners and geographic Repair page expansion remain prohibited without product/query evidence.

## Bounded implementation in this branch
- The public Car Hauling Dispatch owner is deliberately left unchanged after fresh page×query evidence confirmed Google already separates dispatch intent from Load Board intent.
- The existing `/load-board/` remains the single generic load-board canonical owner; role/equipment query parameters remain UI/funnel state, not new SEO owners.
- Repair Shop public copy is deliberately unchanged to preserve the existing revenue and multilingual localization contracts.
- Repair Shop root CTA clicks now emit `commercial_cta_click` with controlled `repair_shop_registration` / `repair_shop_plan` cta types, `hermes_connect_repair` page group, and `repair_shop_software` service group.
- Repair registration form submit emits `repair_shop_registration_start` so the next GA4 window can distinguish discovery from registration intent.
- A static regression contract now locks Dispatch/Load Board owner separation.

## CI / index hygiene evidence
- Production SEO hygiene reports 168 unique canonical URLs across 8 child sitemaps.
- Bing Webmaster hygiene contract passes.
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
Primary: improve query coverage / average position on the existing two search owners without owner crossover or index regression.
Commercial: produce non-zero attributed Repair registration CTA/start events after deployment, measured separately from Search visibility.
Stretch: 40,000 organic impressions across the two P0 acquisition directions remains an ambition, not a guaranteed search-engine outcome.
