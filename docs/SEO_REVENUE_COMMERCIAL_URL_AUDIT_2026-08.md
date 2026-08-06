# SEO Revenue Commercial URL Audit — August 2026

Reviewed: 2026-08-06  
Scope: current `main` repository contracts through the direct-intake, Wisconsin CTA and carrier-journey releases  
Machine-readable source: `data/marketing/seo-revenue-commercial-url-audit-2026-08.json`

## Decision

The original revenue sprint is complete at the repository level. The 14 priority pages have an indexable canonical owner, a defined commercial intent, a current CTA destination, a usable intake/handoff route and a privacy-safe measurement contract.

The audit no longer treats the fictional Load Board as the primary commercial destination for Appleton, Wisconsin transport, dealer transport, auction pickup or car-hauling dispatch. Those pages now route to the appropriate direct intake. The Load Board may remain as an explicitly labelled product demo or secondary related link.

No historical impressions, clicks, traffic, leads, rankings, contracts or revenue are inferred from code. Authenticated measurement remains in Issue #206, permissioned proof in Issue #176, profile corrections in Issue #204 and final carrier agreement execution in Issue #280.

## Status definition used

`READY_TO_MEASURE` means the current repository provides:

- an indexable canonical route and declared sitemap owner;
- a clear commercial or local-commercial intent;
- a direct, intent-matched CTA destination;
- a local review and explicit handoff route;
- a privacy-safe event family;
- no unsupported guarantee required to begin measurement.

It does **not** mean that the page already has traffic, rankings, qualified inquiries, verified case proof, a completed Search Console inspection or proven revenue.

## Current audit table

| URL | Primary intent | Current primary destination | Handoff | Revenue status | Main external dependency |
| --- | --- | --- | --- | --- | --- |
| `/logistics/appleton-wi-vehicle-transport/` | Appleton vehicle transport | Direct vehicle-transport intake | Review, fallback and receiver confirmation | `READY_TO_MEASURE` | GSC/GA4 #206; proof #176 |
| `/logistics/wisconsin-vehicle-transport/` | Wisconsin vehicle transport | Direct vehicle-transport intake | Review, fallback and receiver confirmation | `READY_TO_MEASURE` | State/city query ownership #206 |
| `/logistics/dealer-vehicle-transportation/` | Dealer vehicle transportation | Dealer-prefilled direct transport intake | Review, fallback and receiver confirmation | `READY_TO_MEASURE` | Events #206; dealer proof #176 |
| `/logistics/car-hauling-dispatch/` | Car-hauling dispatch | Direct carrier dispatch review | Qualification, fallback and receiver confirmation | `READY_TO_MEASURE` | Events #206; carrier proof #176 |
| `/logistics/auction-vehicle-pickup/` | Auction vehicle pickup | Auction-prefilled direct transport intake | Review, fallback and receiver confirmation | `READY_TO_MEASURE` | Events #206; auction proof #176 |
| `/logistics/wisconsin-dealer-vehicle-transport/` | Wisconsin dealer transport | Dealer-prefilled direct transport intake | Review, fallback and receiver confirmation | `READY_TO_MEASURE` | Query ownership/events #206 |
| `/logistics/wisconsin-auction-vehicle-pickup/` | Wisconsin auction pickup | Auction-prefilled direct transport intake | Review, fallback and receiver confirmation | `READY_TO_MEASURE` | Query ownership/events #206 |
| `/logistics/green-bay-wi-vehicle-transport/` | Representative Wisconsin city transport | Direct vehicle-transport intake | Review, fallback and receiver confirmation | `READY_TO_MEASURE` | City query evidence #206 |
| `/services/seo-for-logistics-companies/` | Logistics SEO | Marketing SEO intake | Structured preview and handoff | `READY_TO_MEASURE` | Events #206; proof #176 |
| `/services/seo-for-independent-auto-dealers/` | Auto dealer SEO | Marketing SEO intake | Structured preview and handoff | `READY_TO_MEASURE` | Events #206; dealer proof #176 |
| `/services/seo/` | General U.S. SEO services | Marketing SEO intake | Structured preview and handoff | `READY_TO_MEASURE` | GSC/GA4 #206 |
| `/services/local-seo/` | Local SEO | Marketing SEO intake | Structured Local SEO preview and handoff | `READY_TO_MEASURE` | Profile eligibility #204; events #206 |
| `/services/website-development/` | New website and website + SEO | Technology Project Brief | Structured preview and IT handoff | `READY_TO_MEASURE` | Events #206; cases #176 |
| `/services/website-redesign/` | Redesign and migration protection | Technology Project Brief | Structured preview and IT handoff | `READY_TO_MEASURE` | Events #206; cases #176 |

## Implemented logistics conversion paths

### Direct vehicle transport

The current customer-side event family is:

`commercial_cta_click → vehicle_transport_intake_start → vehicle_transport_preview_ready → vehicle_transport_handoff_ready → vehicle_transport_delivery_confirmed`

It applies to the audited Appleton, statewide, dealer, auction and representative Wisconsin city routes. Query parameters may preselect an approved role or request type, but identity, route, vehicle, release, timing and contact values remain outside analytics.

### Direct car-hauling dispatch

The current carrier-side event family is:

`commercial_cta_click → carrier_intake_start → carrier_intake_preview_ready → carrier_handoff_ready → carrier_delivery_confirmed`

The commercial page routes to `/logistics/start-car-hauling-dispatch/`, not to the Load Board. The intake qualifies authority status, insurance readiness, equipment, capacity, fleet size, geography, availability and current dispatch context while excluding submitted values from analytics.

### Carrier proposal and agreement journey

The private `/carrier/` route, proposal, agreement-review and onboarding pages now form a separate sales/signature journey. Their events are defined in `docs/CARRIER_CONTRACT_ANALYTICS_2026-08-06.md`. This journey does not replace the dispatch-review intake and must not be reported as final legal execution while Issue #280 remains open.

## Website development and redesign

- Website Development and Website Redesign retain separate query intent;
- both route to one approved Technology Project Brief;
- exact scope includes new website, redesign, website + SEO, current URL, target U.S. market, page range, integrations and languages;
- local preview and explicit email handoff are available;
- no combined doorway page was created.

## SEO services

- canonical SEO, Local SEO, Logistics SEO and Auto Dealer SEO retain distinct page ownership;
- all four route to one structured Marketing intake using approved service contexts;
- qualification covers current website, U.S. market, vertical, Local/National scope, Search Console, GA4, requested work, timeline, budget approach and current problem;
- submitted website URLs, markets, access status, budgets, timelines and free text remain outside analytics.

## Query ownership and cannibalization

- local pages support state/national service owners and must not become place-name doorway copies;
- `/services/website-development/` owns new-site and website-plus-SEO-foundation intent;
- `/services/website-redesign/` owns redesign and migration-risk intent;
- `/services/seo/` owns general SEO service intent;
- Local, Logistics and Auto Dealer SEO pages own distinct scope or vertical intent while sharing one intake;
- `/logistics/car-hauling-dispatch/` owns the national carrier-acquisition commercial intent; audience, proposal and checklist pages support different stages rather than duplicating that intent.

## Measurement contract

Canonical revenue-funnel events include:

- `commercial_cta_click`;
- `carrier_intake_start` → `carrier_intake_preview_ready` → `carrier_handoff_ready` → `carrier_delivery_confirmed`;
- `vehicle_transport_intake_start` → `vehicle_transport_preview_ready` → `vehicle_transport_handoff_ready` → `vehicle_transport_delivery_confirmed`;
- `website_project_intake_start` → `website_project_preview_ready` → `website_handoff_ready`;
- `seo_intake_start` → `seo_intake_preview_ready` → `seo_handoff_ready`.

Manual qualification, proposals, contract status and revenue remain outside GA4 and require the qualified-lead operating runbook plus private operations reconciliation.

## Proof still required externally

Repository configuration does not complete:

- Search Console and Bing ownership/index/query reports;
- GA4 DebugView, Realtime and standard-report verification;
- delivered-event reconciliation with approved receivers;
- human-qualified inquiry disposition;
- real profile and NAP/entity corrections;
- verified reviews, named experts and permissioned cases;
- actual backlink placements and referral outcomes;
- production field Core Web Vitals history;
- Appleton or city-page refinement after query and conversion evidence.

## Promotion rule

A page may remain `READY_TO_MEASURE` while proof is pending, but paid promotion, strong outcome claims, new location expansion or derivative pages require verified evidence and owner review. Measurement begins before page multiplication.
