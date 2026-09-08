# SEO/GEO — Car Hauler Carrier 25-Market Launch — 72h Measurement Protocol

Date: 2026-09-08
Scope: `/logistics/car-hauler-loads/` + 25 city market pages
Business owner: Hermes Logistics carrier acquisition

## Primary outcome

Acquire qualified car-hauling owner-operators and fleets from search around markets where Hermes has internal operating familiarity, then move them through:

`organic/search discovery → city market page → carrier interest → direct dispatch intake → human qualification → carrier plans/agreement → onboarding`

The public pages do not publish private shipment history, customer identities, private routes, rates, MC/USDOT values, or internal load counts. Private operating history is used only to prioritize markets internally.

## Measurement sources

Keep evidence classes separate and do not substitute one source for another:

- **Production/live** — custom-domain HTTP/rendered-page verification proves deployment, response status, canonical/indexability, and visible public content.
- **Google Search Console / GSC Wizard** — content group `Car Hauler GEO 25 Markets`, tracked URLs, URL Inspection verdict/coverage/crawl state, and settled search performance. If tracker summary counters conflict with URL Inspection details, use the URL-level `verdict` + `coverage_state` + crawl evidence for index truth.
- **GA4 / HYPD** — current authoritative Hermes property `properties/547903956`; use privacy-safe eventName × pagePath reporting for consenting traffic only.
- **SE Ranking** — project `Hermes Logistics US — SEO/GEO`, keyword group `Car Hauler GEO 25 Markets`; one strict-target `car hauler loads <market>` probe per city page. Treat modelled search volume independently from rank position; zero/unknown modelled volume is not proof of zero real demand.
- **IndexNow** — notification evidence only. The 2026-09-08 production submission of 194 canonical sitemap-backed URLs was accepted with HTTP 200; this is not Bing crawl/index/ranking proof.
- **Private operations / agreement flow** — human qualification, receiver delivery, opportunity, agreement and revenue evidence stay separate from public analytics.

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

Carrier GEO analytics are **consent-gated**. Do not emit or infer `carrier_geo_*` events before explicit analytics consent. When a first-time visitor grants analytics consent after page load, GEO measurement initializes exactly once from that point forward. No pre-consent events are retroactively replayed. Therefore a zero GA4 carrier-event count is not equivalent to zero total page visits; compare it with consent-independent search/index evidence before diagnosing traffic.

### `carrier_geo_page_view`
Meaning: a launch hub or city page has explicit analytics consent and the GEO measurement layer initialized exactly once for that page view.

Controlled parameters only:
- `audience_type=carrier`
- `page_group=car_hauler_geo`
- `service_group=car_hauler_geo`
- `page_path`

### `carrier_geo_section_view`
Meaning: after analytics consent, the visitor reached a measurable section of the page.

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
Meaning: after analytics consent, the visitor selected a controlled next action from the GEO cluster.

Controlled CTA types include:
- `start_review`
- `carrier_agreement`
- `market_select`
- `load_board`
- `hermes_connect`
- `dispatch_details`
- `all_markets`

The existing `commercial_cta_click` remains the canonical commercial-entry event when a consenting GEO visitor goes to `/logistics/start-car-hauling-dispatch/`.

No submitted form values, names, email addresses, phone numbers, company names, MC/USDOT, exact routes, rates, budgets, or contract details may enter analytics.

## Existing downstream funnel events

Use the existing carrier funnel after the GEO CTA:

1. `commercial_cta_click` — consenting GEO visitor chose direct carrier intake.
2. `carrier_intake_start` — carrier interacted with intake.
3. `carrier_intake_preview_ready` — local qualified review was prepared.
4. `carrier_handoff_ready` — handoff route was selected.
5. `carrier_delivery_confirmed` — approved receiver confirmed delivery in browser; reconcile privately before calling it a qualified lead.
6. Carrier proposal/agreement/onboarding events — use the existing carrier contract journey event family for progression after human qualification or direct plan review.

## 72-hour scorecard

For each of the 25 city pages and the hub, record when available:

- production HTTP/canonical/indexability status;
- Google URL Inspection verdict, coverage state, crawl time and page fetch state;
- organic/search impressions, clicks, CTR, average position, query and landing page when settled GSC data exists;
- SE Ranking first/current position for the strict target query and whether the intended city URL ranks rather than another Hermes URL;
- total landing/page-view evidence where available;
- `carrier_geo_page_view` count for consenting traffic;
- section reach by section ID for consenting traffic;
- CTA clicks by CTA type for consenting traffic;
- CTA click-through rate from GEO page to direct carrier intake when denominator and consent scope are comparable;
- `carrier_intake_start`;
- `carrier_intake_preview_ready`;
- `carrier_handoff_ready`;
- `carrier_delivery_confirmed`, reconciled against receiver evidence before calling it a lead;
- carrier contract/proposal/onboarding progression when applicable;
- Bing platform evidence only when authenticated Bing Webmaster evidence exists; IndexNow acceptance alone remains notification evidence.

Search Console data can lag and should be labelled provisional at the 72-hour checkpoint rather than treated as complete. GA4 is consent-scoped; do not equate analytics-event absence with total-visit absence.

## Diagnosis rules

### 1. No impressions / no landing traffic
Likely problem class: discovery, crawl, indexation, query fit, or insufficient distribution.

Do not redesign the page first. Check:
- production deployment and canonical readback;
- sitemap ownership;
- robots/indexability;
- IndexNow notification state;
- Search Console URL/query evidence;
- SE Ranking strict-target position and wrong-page ranking;
- internal links;
- whether the query has enough actual local demand.

### 2. Search/landing evidence exists but no GA4 carrier events
Do not immediately call this a broken funnel. Separate:
- visitors who did not grant analytics consent;
- analytics instrumentation failure;
- low sample size.

Verify the consent-safe telemetry contract and compare with GSC/SE Ranking evidence before changing the page.

### 3. Consenting landing traffic but weak reach beyond `hero`
Likely problem class: hero/message mismatch, slow/awkward first screen, wrong search intent, weak trust, or immediate UX problem.

Review:
- H1 and first 150 words;
- mobile first viewport;
- page speed / layout shift;
- whether “loads now” is visible quickly enough;
- CTA wording and visual hierarchy.

### 4. Reaches `three_workstreams` / `load_sources`, then exits
Likely problem class: explanation is too complex, source coverage does not feel credible, or the carrier still cannot see the immediate value.

Review:
- simplify the three-workstream explanation;
- move carrier-control/trust proof closer to source coverage;
- make “what Hermes does today” visually dominant over long-term features.

### 5. Reaches `support_20` / `ecosystem`, but no CTA
Likely problem class: high curiosity, weak commercial offer or insufficient trust/price/scope clarity.

Review:
- CTA prominence;
- carrier plans/fee explanation;
- proof and objections;
- whether Load Board / Hermes Connect distract from the primary dispatch conversion.

### 6. `carrier_geo_cta_click=start_review`, but no `carrier_intake_start`
Likely problem class: destination-page friction.

Review:
- first viewport of direct intake;
- mobile form density;
- trust/disclosure overload;
- whether the carrier understands what happens after submission.

### 7. `carrier_intake_start`, but no `carrier_intake_preview_ready`
Likely problem class: form friction or qualification fields.

Review field-level UX privately without sending submitted values to analytics. Measure only controlled step/status signals.

### 8. Intake/handoff succeeds, but carrier does not progress to commercial agreement
Likely problem class: sales qualification, commercial scope, fee, trust, or follow-up — not SEO.

Review the human sales handoff and agreement journey separately from page design.

## 72-hour decision rule

Do not make a broad site redesign from aggregate impressions alone. Change the smallest proven weak point in the funnel:

`discovery → correct ranking owner → hero → value depth → CTA → intake → handoff → agreement`

Keep a city page unchanged when the sample is too small to support a design conclusion. Scale or rewrite only with evidence.

## Release boundary

A feature branch/PR may contain this implementation and its tests. Merge and production deployment remain owner-confirmed actions under repository governance. The 72-hour clock begins only after production deployment/readback, not when the branch or PR is created.
