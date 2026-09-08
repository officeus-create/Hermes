# SEO/GEO — Car Hauler Carrier 25-Market Launch — 72h Measurement Protocol

Date: 2026-09-08
Scope: `/logistics/car-hauler-loads/` + 25 city market pages
Business owner: Hermes Logistics carrier acquisition

## Primary outcome

Acquire qualified car-hauling owner-operators and fleets from search around markets where Hermes has internal operating familiarity, then move them through:

`organic/search discovery → city market page → carrier interest → direct dispatch intake → human qualification → carrier plans/agreement → onboarding`

The public pages do not publish private shipment history, customer identities, private routes, rates, MC/USDOT values, or internal load counts. Private operating history is used only to prioritize markets internally.

## 25 launch markets

1. Colorado Springs, CO
2. Puyallup, WA
3. Denver, CO
4. Springfield, MO
5. Aurora, CO
6. Kansas City, MO/KS
7. Chicago Heights, IL
8. Lynnwood, WA
9. Pueblo, CO
10. Fountain, CO
11. University Park, IL
12. St. Louis, MO
13. Renton, WA
14. Rogersville, MO
15. Topeka, KS
16. Marysville, WA
17. Chicago, IL
18. Tacoma, WA
19. Bridgeton, MO
20. Seattle, WA
21. Auburn, WA
22. Fremont, CA
23. Brighton, CO
24. Graham, WA
25. Commerce City, CO

## Search intent owned by this cluster

The cluster is designed around carrier-side demand, not consumer car-shipping demand:

- car hauler loads + city
- car hauling loads + city
- auto transport loads + city
- find car hauler loads + city
- car hauler loads from/to/out of + city
- car hauler load board + city
- auto transport load board + city
- car hauler dispatch + city
- car hauler dispatcher + city
- dispatch service for car haulers + city
- route/radius/deadhead/equipment-fit questions around the same carrier need

The hub owns the multi-market discovery intent; each city page adds unique market context and nearby search areas while handing the commercial conversion to the existing direct carrier intake.

## New privacy-safe analytics events

### `carrier_geo_page_view`
Meaning: a launch hub or city page rendered and the GEO measurement enhancer initialized.

Controlled parameters only:
- `audience_type=carrier`
- `page_group=car_hauler_geo`
- `service_group=car_hauler_geo`
- `page_path`

### `carrier_geo_section_view`
Meaning: the visitor reached a measurable section of the page.

Controlled parameters only:
- the base values above
- `section_id`

City page section IDs:
- `hero`
- `three_workstreams`
- `load_sources`
- `vehicle_fit`
- `support_20`
- `ecosystem`
- `faq`
- `final_cta`

Hub section IDs:
- `hero`
- `markets`
- `search_model`
- `conversion`

### `carrier_geo_cta_click`
Meaning: visitor selected a controlled next action from the GEO cluster.

Controlled CTA types include:
- `start_review`
- `carrier_agreement`
- `market_select`
- `load_board`
- `hermes_connect`
- `dispatch_details`
- `all_markets`

The existing `commercial_cta_click` remains the canonical commercial-entry event when a GEO page sends a carrier to `/logistics/start-car-hauling-dispatch/`.

No submitted form values, names, email addresses, phone numbers, company names, MC/USDOT, exact routes, rates, budgets, or contract details may enter analytics.

## Existing downstream funnel events

Use the existing carrier funnel after the GEO CTA:

1. `commercial_cta_click` — GEO visitor chose direct carrier intake.
2. `carrier_intake_start` — carrier interacted with intake.
3. `carrier_intake_preview_ready` — local qualified review was prepared.
4. `carrier_handoff_ready` — handoff route was selected.
5. `carrier_delivery_confirmed` — approved receiver confirmed delivery in browser; reconcile privately before calling it a qualified lead.
6. Carrier proposal/agreement/onboarding events — use the existing carrier contract journey event family for progression after human qualification or direct plan review.

## 72-hour scorecard

For each of the 25 city pages and the hub, record when available:

- organic/search landing users or sessions;
- total page views;
- `carrier_geo_page_view` count;
- section reach by section ID;
- CTA clicks by CTA type;
- CTA click-through rate from GEO page to direct carrier intake;
- `carrier_intake_start`;
- `carrier_intake_preview_ready`;
- `carrier_handoff_ready`;
- `carrier_delivery_confirmed`, reconciled against receiver evidence before calling it a lead;
- carrier contract/proposal/onboarding progression when applicable;
- Search Console impressions, clicks, CTR, average position, query, and landing page when settled data is available;
- Bing/IndexNow discovery evidence when available.

Search Console data can lag and should be labelled provisional at the 72-hour checkpoint rather than treated as complete.

## Diagnosis rules

### 1. No impressions / no landing traffic
Likely problem class: discovery, crawl, indexation, query fit, or insufficient distribution.

Do not redesign the page first. Check:
- production deployment and canonical readback;
- sitemap ownership;
- robots/indexability;
- IndexNow submission state;
- Search Console URL/query evidence;
- internal links;
- whether the query has enough actual local demand.

### 2. Landing traffic but weak reach beyond `hero`
Likely problem class: hero/message mismatch, slow/awkward first screen, wrong search intent, weak trust, or immediate UX problem.

Review:
- H1 and first 150 words;
- mobile first viewport;
- page speed / layout shift;
- whether “loads now” is visible quickly enough;
- CTA wording and visual hierarchy.

### 3. Reaches `three_workstreams` / `load_sources`, then exits
Likely problem class: explanation is too complex, source coverage does not feel credible, or the carrier still cannot see the immediate value.

Review:
- simplify the three-workstream explanation;
- move carrier-control/trust proof closer to source coverage;
- make “what Hermes does today” visually dominant over long-term features.

### 4. Reaches `support_20` / `ecosystem`, but no CTA
Likely problem class: high curiosity, weak commercial offer or insufficient trust/price/scope clarity.

Review:
- CTA prominence;
- carrier plans/fee explanation;
- proof and objections;
- whether Load Board / Hermes Connect distract from the primary dispatch conversion.

### 5. `carrier_geo_cta_click=start_review`, but no `carrier_intake_start`
Likely problem class: destination-page friction.

Review:
- first viewport of direct intake;
- mobile form density;
- trust/disclosure overload;
- whether the carrier understands what happens after submission.

### 6. `carrier_intake_start`, but no `carrier_intake_preview_ready`
Likely problem class: form friction or qualification fields.

Review field-level UX privately without sending submitted values to analytics. Measure only controlled step/status signals.

### 7. Intake/handoff succeeds, but carrier does not progress to commercial agreement
Likely problem class: sales qualification, commercial scope, fee, trust, or follow-up — not SEO.

Review the human sales handoff and agreement journey separately from page design.

## 72-hour decision rule

Do not make a broad site redesign from aggregate impressions alone. Change the smallest proven weak point in the funnel:

`discovery → hero → value depth → CTA → intake → handoff → agreement`

Keep a city page unchanged when the sample is too small to support a design conclusion. Scale or rewrite only with evidence.

## Release boundary

A feature branch/PR may contain this implementation and its tests. Merge and production deployment remain owner-confirmed actions under repository governance. The 72-hour clock begins only after production deployment/readback, not when the branch or PR is created.
