# SEO Revenue Priority Backlog

Reviewed: 2026-08-07
Status: `HISTORICAL COMMERCIAL PRIORITY MAP — NOT THE CURRENT EXECUTION ROUTER`
Current execution: `docs/SEARCH_GROWTH_GUARDRAIL.md` → `docs/ERROR_REGISTER.md` → `ai-collaboration/02_SEO/CURRENT_STATE.md`.

## Objective

Move the highest-value Hermes pages from repository readiness to measured commercial outcomes.

The operating funnel is:

`indexable page -> organic visibility -> click -> landing session -> CTA -> delivered inquiry -> qualified inquiry -> sales follow-up`

Traffic without a measurable CTA and follow-up path is not treated as a successful outcome.

## Current repository state

The original commercial-routing sprint recorded repository readiness in August 2026. `docs/SEO_REVENUE_COMMERCIAL_URL_AUDIT_2026-08.md` is a historical routing/readiness snapshot, not current implementation or delivery evidence. Current measurement/event authority: `docs/PRODUCTION_ANALYTICS_EVENT_REGISTRY.md`, current receiver/source and their regression contracts.

2026-10-08 carrier reconciliation: `carrier_submitted` means matching request-service acceptance only. Final delivery and human receipt remain UNKNOWN. The existing machine-readable August audit preserves its original carrier event family separately and reconciles the active carrier contract; other dated event families remain historical. Search routing still follows the existing guardrail and Search owner; this correction creates no new search surface.

Remaining priority is measurement, proof, entity consistency and follow-up quality rather than adding more pages.

### Tier 1 — Logistics pages closest to revenue

1. `/logistics/appleton-wi-vehicle-transport/`
   - Revenue action: qualified vehicle-transport request.
   - Current primary CTA: direct vehicle-transport intake.
   - External gates: bounded search/analytics evidence only when a current decision requires it, plus qualified-inquiry reconciliation; #206 is closed historical provenance.

2. Wisconsin state and city vehicle-transport cluster
   - Revenue action: local vehicle-transport inquiry.
   - Current primary CTA: direct vehicle-transport intake.
   - External gates: index/query ownership, cannibalization evidence and conversion data before any further city expansion.

3. `/logistics/dealer-vehicle-transportation/`
   - Revenue action: dealer or shipper transport inquiry.
   - Current primary CTA: dealer-prefilled direct transport intake.
   - External gates: current production-event evidence when required and one permissioned dealer/customer proof asset; do not reopen #206 by default.

4. `/logistics/car-hauling-dispatch/`
   - Revenue action: carrier/owner-operator dispatch inquiry.
   - Current primary CTA: direct carrier dispatch review.
   - External gates: current production-event evidence when required, one permissioned carrier proof asset, and the separately governed final execution agreement; do not reopen #206 by default.

5. `/logistics/auction-vehicle-pickup/` and supporting auction resources
   - Revenue action: move resource and service intent into transport review.
   - Current primary CTA: auction-prefilled direct transport intake.
   - External gates: query/event evidence and one permissioned workflow/example where available.

### Tier 2 — Digital services with high contract value

6. `/services/seo-for-logistics-companies/`
   - Revenue action: SEO audit or consultation inquiry.
   - Current primary CTA: structured Marketing SEO intake.
   - External gates: bounded GA4 receipt evidence when required, a named reviewer and evidence-approved case/proof; do not reopen #206 by default.

7. `/services/seo-for-independent-auto-dealers/`
   - Revenue action: dealer SEO consultation.
   - Current primary CTA: structured Marketing SEO intake.
   - External gates: GA4 verification, dealer proof and entity/profile consistency.

8. `/services/seo/`, `/services/local-seo/`, `/services/website-development/`, `/services/website-redesign/`
   - Revenue action: SEO or website-project inquiry.
   - Current primary CTA: structured SEO intake or Technology Project Brief as appropriate.
   - External gates: production event verification, case proof, branded/entity trust and qualified-inquiry follow-up.

## Required measurement for each URL

- publication status;
- production availability;
- canonical and sitemap owner;
- Search Console inspection state;
- indexation state;
- impressions, clicks, CTR and average position;
- landing sessions and engaged sessions;
- CTA type and event count;
- delivered inquiry count when receiver evidence exists;
- qualified inquiry count when a reviewed private source exists;
- next action and accountable owner.

Unknown values remain null. They must never be converted to zero without source evidence.

## Revenue decision rules

- Not published: release blocker takes priority over content expansion.
- Published but not inspected: inspect in authenticated search platforms after production verification.
- Inspected but not indexed: diagnose canonical, quality, duplication and crawl paths.
- Indexed with impressions but weak CTR: review title, description and intent alignment.
- Clicks without sessions: investigate analytics or destination problems.
- Sessions without CTA: improve commercial handoff and CTA relevance.
- CTA without delivered inquiry: inspect receiver/runtime behavior.
- Delivered inquiry without qualification: assign human review ownership; do not call it a qualified lead automatically.
- Qualified inquiries without sales outcome tracking: connect aggregate stage counts before scaling traffic.

## Initial KPI hierarchy

1. qualified inquiries;
2. sales-contacted qualified inquiries;
3. delivered-to-qualified conversion;
4. CTA-to-delivered conversion;
5. session-to-CTA conversion;
6. organic clicks;
7. CTR;
8. indexed commercial URL coverage;
9. impressions.

## Release discipline

Do not publish mass city, state, equipment or thin semantic pages to increase URL count. Existing audited money pages must first have authenticated index/query evidence, production event verification, qualified-inquiry reconciliation and proof review.

Current external blockers/actions are no longer owned by this dated backlog. Route them through the current Error Register and active owner lanes:

- measurement — existing production/search contracts, invoked only for a bounded release or business decision; #206 stays closed;
- entity/profile consistency — Work.ua under Recruiting/HR #515; Staff.am is preserved as corrected public evidence; #204 stays closed;
- earned authority/proof — #368 plus permissioned real evidence only; no synthetic backlink volume;
- Cloudflare Crawler Hints — current owner/account access gate in the Error Register;
- GitHub main protection — current admin/owner gate #938;
- legal/commercial execution — follow the current Legal/Sales owner rather than this historical Search backlog.
