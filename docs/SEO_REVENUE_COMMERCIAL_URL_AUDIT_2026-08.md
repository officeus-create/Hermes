# SEO Revenue Commercial URL Audit — August 2026

Reviewed: 2026-08-02  
Scope: current `main` repository contracts  
Machine-readable source: `data/marketing/seo-revenue-commercial-url-audit-2026-08.json`

## Decision

The original revenue sprint is complete at the repository level. The priority pages now have an indexable canonical owner, a defined commercial intent, a usable CTA destination, a preview/handoff route, and a stable measurement contract.

No historical impressions, clicks, traffic, leads, rankings, contracts or revenue are inferred from code. Production and account evidence remains in Issue #123.

## Status definition used

`READY_TO_MEASURE` means the current repository provides:

- an indexable canonical route and declared sitemap owner;
- a clear commercial or local-commercial intent;
- a usable CTA destination;
- a preview/contact or qualified-intake route;
- a privacy-safe event family or an approved request-preview contract;
- no unsupported guarantee required to begin measurement.

It does **not** mean that the page already has traffic, rankings, leads, verified case proof, or a completed Search Console inspection.

## Current audit table

| URL | Primary intent | CTA destination | Handoff | Revenue status | Main external dependency |
| --- | --- | --- | --- | --- | --- |
| `/logistics/appleton-wi-vehicle-transport/` | Appleton vehicle transport | Load Board | Transport request preview | `READY_TO_MEASURE` | Appleton production/Search Console evidence |
| `/logistics/wisconsin-vehicle-transport/` | Wisconsin vehicle transport | Load Board | Transport request preview | `READY_TO_MEASURE` | Statewide query baseline |
| `/logistics/dealer-vehicle-transportation/` | Dealer vehicle transportation | Load Board | Dealer request preview | `READY_TO_MEASURE` | Approved dealer case evidence |
| `/logistics/car-hauling-dispatch/` | Car-hauling dispatch | Carrier intake | Qualified carrier preview and explicit handoff | `READY_TO_MEASURE` | Production event verification |
| `/logistics/auction-vehicle-pickup/` | Auction vehicle pickup | Load Board | Vehicle request preview | `READY_TO_MEASURE` | Approved auction/customer evidence |
| `/logistics/wisconsin-dealer-vehicle-transport/` | Wisconsin dealer transport | Load Board | Dealer request preview | `READY_TO_MEASURE` | Query ownership review |
| `/logistics/wisconsin-auction-vehicle-pickup/` | Wisconsin auction pickup | Load Board | Auction request preview | `READY_TO_MEASURE` | Query ownership review |
| `/logistics/green-bay-wi-vehicle-transport/` | Representative Wisconsin city transport | Load Board | Transport request preview | `READY_TO_MEASURE` | City-level demand validation |
| `/services/seo-for-logistics-companies/` | Logistics SEO | Marketing SEO intake | Structured preview and handoff | `READY_TO_MEASURE` | Production events and case evidence |
| `/services/seo-for-independent-auto-dealers/` | Auto dealer SEO | Marketing SEO intake | Structured preview and handoff | `READY_TO_MEASURE` | Production events and dealer evidence |
| `/services/seo/` | General U.S. SEO services | Marketing SEO intake | Structured preview and handoff | `READY_TO_MEASURE` | GSC/GA4 production verification |
| `/services/local-seo/` | Local SEO | Marketing SEO intake | Structured Local SEO preview and handoff | `READY_TO_MEASURE` | Business/profile eligibility evidence |
| `/services/website-development/` | New website and website + SEO | Technology Project Brief | Structured preview and IT handoff | `READY_TO_MEASURE` | Production events and approved cases |
| `/services/website-redesign/` | Redesign and migration protection | Technology Project Brief | Structured preview and IT handoff | `READY_TO_MEASURE` | Production events and redesign evidence |

## Implemented commercial changes

### Car hauling

- canonical national page retained;
- carrier and car-hauler context preselected;
- authority status/age, insurance readiness, equipment, capacity, fleet size, geography, availability and current dispatch status qualified;
- active carriers use `dispatcher_review`;
- pending/new authority and insurance-in-progress use `readiness_review`;
- inactive authority or insurance does not enter normal onboarding;
- CTA → intake → preview → explicit handoff events remain free of submitted values.

### Website development and redesign

- Website Development and Website Redesign retain separate query intent;
- both route to one approved Technology Project Brief;
- exact scope includes new website, redesign, website + SEO, current URL, target U.S. market, page range, integrations and languages;
- local preview and explicit email handoff are available;
- no combined doorway page was created.

### SEO services

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
- `/logistics/car-hauling-dispatch/` owns the national carrier-acquisition commercial intent; audience and checklist pages support it.

## Measurement contract

Canonical revenue-funnel events:

- `commercial_cta_click`;
- `carrier_intake_start` → `carrier_intake_preview_ready` → `carrier_handoff_ready`;
- `website_project_intake_start` → `website_project_preview_ready` → `website_handoff_ready`;
- `seo_intake_start` → `seo_intake_preview_ready` → `seo_handoff_ready`.

Manual qualification, proposals, contracts and revenue are maintained outside GA4 using the qualified-lead operating runbook.

## Proof still required externally

The following are not completed by repository configuration and are tracked in Issue #123:

- Search Console and Bing ownership/index reports;
- GA4 production realtime/event verification;
- real profile and NAP/entity claims;
- verified reviews and named experts;
- customer-approved case results;
- actual backlink placements and referral outcomes;
- production PageSpeed/Core Web Vitals history;
- Appleton refinement after query and conversion evidence.

## Promotion rule

A page may remain `READY_TO_MEASURE` while proof is pending, but paid promotion, strong outcome claims, new location expansion or derivative pages require verified evidence and owner review. Measurement begins before page multiplication.
