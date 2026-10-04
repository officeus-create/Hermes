# Car Hauling Carrier Discovery: Evidence and Correction — 2026-10-04

## Decision

Keep `/logistics/car-hauling-dispatch/` as the indexable commercial owner for carrier-side car hauling and auto transport dispatch intent. Keep `/logistics/start-car-hauling-dispatch/` as the noindex qualification receiver. Do not create another landing page for the same intent.

The useful gap was not a missing traffic counter or another city page. The commercial owner did not state the high-value `auto transport dispatch service` wording clearly enough, repair-oriented catalog profiles skipped that owner in their carrier handoff, and the owner page had no dedicated page-view event.

## Source-backed intent map

| Search or discovery intent | Canonical page | CTA | Receiver and qualification | Evidence state |
| --- | --- | --- | --- | --- |
| `car hauling dispatch service`, `car hauler dispatch service`, `auto transport dispatch service`, owner-operator or small-fleet dispatch | `/logistics/car-hauling-dispatch/` | Start carrier review | `/logistics/start-car-hauling-dispatch/`; review authority, insurance, equipment, capacity, geography, availability, and requested support scope | Page, CTA, and receiver exist; availability or acceptance is not promised |
| `car hauling loads`, car-hauler load planning, load-board comparison | `/logistics/car-hauler-loads/` and `/load-board/` | Review dispatch support or start review | Same controlled carrier intake | Separate supporting intent; do not merge with the commercial owner |
| `car hauler trailer repair`, `car hauler repair near me`, truck/diesel/fleet/trailer discovery | verified public-source Hermes Catalog business profile | Car-hauling dispatch support | Canonical commercial owner, then controlled intake | Cross-intent route now exists only on carrier-relevant profiles; repair listing does not imply endorsement or carrier eligibility |

## Current evidence

- The [One Brain Board](https://docs.google.com/document/d/1zblFM0EGsWqetFxTtDcKq0UFI-Pu8rdUgwrk5Kx-pIg/edit) records the shared rule `query → page → answer → CTA → structured intake → qualified inquiry → sales follow-up → outcome`. Its last historical GSC readback was 2026-09-28; the current GSC planning connector required reauthentication on 2026-10-04, so no new ranking or query claim is made here.
- The [Global Semantic Core](https://drive.google.com/file/d/1EkHisAho3p8YXn586mZ8O94whI0b2Xle/view?usp=drivesdk) assigns car-hauling dispatch, auto-transport dispatch, car-carrier dispatch, owner-operator, and small-fleet variants to `/logistics/car-hauling-dispatch/` and says to expand the existing owner before creating another URL.
- Google and Bing US-English autocomplete checks on 2026-10-04 separated dispatch-service, load-board/load-planning, jobs/training, and repair-near-me intent. That supports one commercial owner plus internal bridges, not a repair-intent doorway page.
- Competitor pages use the exact commercial language `car hauling dispatch service` or `auto transport dispatch service`: [Trucksmile](https://www.trucksmile.com/car-hauling-dispatch-service/), [AVN Logistics](https://avnlogisticstm.com/auto-transport-dispatch-service/), and [Express Auto Logistics](https://expressautologistics.com/auto-transport-dispatch-service/). Their unsupported service, rate, availability, or response-time claims were not copied.
- GA4 readback for 2026-09-07 through 2026-10-04 showed 124 active users, 455 sessions, 2,074 views, and 303 engaged sessions site-wide. Organic Search accounted for 7 active users and 34 sessions. The commercial carrier page recorded 2 landing sessions; no GA4-attributed Organic Search landing row appeared for the car-hauling URL group in that period. This is an attribution observation, not a ranking claim.
- A first-party Cloudflare D1 traffic collector and GA4 were already live in production. Adding another counter would fragment measurement. PostHog is bounded to the Repair Shop product and had no ingested events; it is not the site-wide traffic source.

## Implemented correction

1. Expanded the commercial owner's description, intro, and FAQ with explicit `car hauling and auto transport dispatch service` language. The copy distinguishes carrier operations from consumer vehicle-shipping quotes and from general-freight dispatch.
2. Added the canonical commercial owner as the first carrier link on truck, diesel, fleet, trailer, and commercial-repair Catalog profiles. The existing repair-business disclaimer remains intact.
3. Added `carrier_dispatch_page_view` for the exact commercial owner path. It fires once only after analytics consent and carries bounded page, audience, and service fields. Existing commercial CTA measurement remains the next funnel event.
4. Added contract checks for the intent language, repair-to-carrier link, event name, exact path, and consent gate.

## Measurement after release

Use GA4 to read this sequence without treating eligibility or a form submission as a sale:

1. `carrier_dispatch_page_view` on `/logistics/car-hauling-dispatch/`.
2. Existing `commercial_cta_click` to `/logistics/start-car-hauling-dispatch/`.
3. Receiver acceptance and qualification outcome from the controlled intake flow.

The initial 28-day baseline is 2 commercial-page landing sessions and no GA4-attributed Organic Search landing row in the car-hauling URL group. Search Console query and page evidence must be refreshed after the existing connection is reauthenticated; until then, GA4 and production telemetry can prove visits and actions but cannot prove Google impressions, position, or indexing performance.

## Files changed

- `src/pages/logistics/car-hauling-dispatch/index.astro`
- `src/pages/businesses/[state]/[city]/[slug].astro`
- `public/seo4-conversion-enhancer.js`
- `scripts/commercial-logistics-pages.test.mjs`
- `scripts/catalog-repair-profile-route.test.mjs`
- `scripts/analytics-tag-contract.test.mjs`
