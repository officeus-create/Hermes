# SEO Revenue Priority Backlog

Reviewed: 2026-08-07

## Objective

Move the highest-value Hermes pages from repository readiness to measured commercial outcomes.

The operating funnel is:

`indexable page -> organic visibility -> click -> landing session -> CTA -> delivered inquiry -> qualified inquiry -> sales follow-up`

Traffic without a measurable CTA and follow-up path is not treated as a successful outcome.

## Current repository state

The original commercial-routing sprint is complete at repository level. The audited Tier 1 and Tier 2 pages now have direct intent-matched commercial paths and privacy-safe event contracts. Current implementation authority is `docs/SEO_REVENUE_COMMERCIAL_URL_AUDIT_2026-08.md`.

Remaining priority is measurement, proof, entity consistency and follow-up quality rather than adding more pages.

### Tier 1 — Logistics pages closest to revenue

1. `/logistics/appleton-wi-vehicle-transport/`
   - Revenue action: qualified vehicle-transport request.
   - Current primary CTA: direct vehicle-transport intake.
   - External gates: Search Console/GA4 baseline (#206), query evidence, qualified-inquiry reconciliation.

2. Wisconsin state and city vehicle-transport cluster
   - Revenue action: local vehicle-transport inquiry.
   - Current primary CTA: direct vehicle-transport intake.
   - External gates: index/query ownership, cannibalization evidence and conversion data before any further city expansion.

3. `/logistics/dealer-vehicle-transportation/`
   - Revenue action: dealer or shipper transport inquiry.
   - Current primary CTA: dealer-prefilled direct transport intake.
   - External gates: production event verification (#206) and one permissioned dealer/customer proof asset (#176).

4. `/logistics/car-hauling-dispatch/`
   - Revenue action: carrier/owner-operator dispatch inquiry.
   - Current primary CTA: direct carrier dispatch review.
   - External gates: production event verification (#206), one permissioned carrier proof asset (#176), final execution agreement remains separate under #280.

5. `/logistics/auction-vehicle-pickup/` and supporting auction resources
   - Revenue action: move resource and service intent into transport review.
   - Current primary CTA: auction-prefilled direct transport intake.
   - External gates: query/event evidence and one permissioned workflow/example where available.

### Tier 2 — Digital services with high contract value

6. `/services/seo-for-logistics-companies/`
   - Revenue action: SEO audit or consultation inquiry.
   - Current primary CTA: structured Marketing SEO intake.
   - External gates: GA4 verification (#206), named reviewer and evidence-approved case/proof (#176).

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

Current external blockers are tracked in:

- #206 — Search Console, Bing, GA4 and qualified-lead baseline;
- #204 / #306 — external profiles and Hermes entity disambiguation;
- #176 — permissioned proof, named experts and conversion evidence;
- #226 / #305 — Cloudflare/CI ownership and deployment isolation;
- #280 — final carrier agreement execution.
