# Search Console Release Protocol

Date established: 2026-08-01  
Owner: Hermes SEO execution lane

## Purpose

Turn each public SEO release into a measured operating cycle without delaying useful, claims-safe publication while waiting for performance data.

Priority order:

1. Publish a useful, indexable, claims-safe page.
2. Confirm crawl discovery and canonical eligibility.
3. Collect Search Console evidence for the exact URL and query group.
4. Improve titles, descriptions, content, internal links, and CTA paths from measured data.
5. Publish a performance result only after the source, date range, and scope are reviewable.

## Required page registry fields

Every tracked URL must record:

- canonical URL;
- release date;
- page type and primary intent;
- supporting query groups;
- sitemap owner;
- internal-link source pages;
- structured-data types;
- privacy-safe CTA event name;
- URL Inspection status;
- Google-selected canonical when available;
- first impression date;
- 7-day and 30-day review dates;
- latest Search Console export date;
- case-study eligibility status;
- blocker or next action.

## Current first case registry

| Canonical URL | Page type | Primary intent | Release state | Search Console state | Case state |
|---|---|---|---|---|---|
| `/logistics/appleton-wi-vehicle-transport/` | Local commercial | Appleton vehicle transport | Published | Dated baseline export pending | Implementation case published; performance results pending |
| `/logistics/resources/auction-vehicle-pickup-checklist/` | National resource | Auction vehicle pickup checklist | Published | Dated baseline export pending | Supporting resource in Appleton case |
| `/logistics/resources/car-hauler-capacity-checklist/` | National resource | Car hauler capacity checklist | Published | Dated baseline export pending | Supporting resource in Appleton case |
| `/case/` | Case-study hub | Hermes website and SEO case studies | Published in repository | Inspect after production deployment | Not applicable |
| `/case/appleton-vehicle-transport-seo/` | Case study | Appleton vehicle transport SEO case study | Published in repository | Inspect after production deployment | Implementation evidence only |

## URL inspection sequence

After production deployment:

1. Confirm the URL returns HTTP 200.
2. Confirm the rendered canonical equals the production URL.
3. Confirm the URL appears in exactly one declared sitemap.
4. Run Search Console URL Inspection.
5. Record discovery source, crawl date/status, index eligibility, user-declared canonical, Google-selected canonical, mobile usability, and enhancement findings.
6. Request indexing only when the page is useful, canonical, indexable, internally linked, and free of unresolved release defects.

## Seven-day review

Use the exact page filter and a stable release date. Capture first impression date, impressions, clicks, CTR, average position, query list, useful country/device splits, intent match, possible page overlap, and canonical exclusions.

Do not publish a result claim from a very small sample without stating that limitation.

## Thirty-day review

Capture the same fields and add:

- branded versus non-branded query grouping;
- city, service, and checklist query grouping;
- page-to-query overlap and cannibalization;
- title and description CTR opportunities;
- content gaps visible in actual queries;
- internal-link opportunities from pages already receiving impressions;
- privacy-safe GA4 CTA events;
- inquiry quality only when a lawful, approved source exists.

## Appleton query groups

### Local commercial

- appleton vehicle transport;
- appleton car transport;
- car shipping appleton wi;
- auto transport appleton wisconsin;
- vehicle transportation fox valley;
- dealer vehicle transport appleton;
- auction vehicle pickup appleton.

### Auction preparation

- auction vehicle pickup checklist;
- information needed for auction car pickup;
- inoperable auction vehicle transport preparation;
- vehicle release and pickup requirements.

### Carrier preparation

- car hauler capacity checklist;
- information needed from a car hauling carrier;
- car hauler equipment and capacity details;
- carrier availability information for vehicle transport.

These are tracking groups, not search-volume or ranking claims.

## Public performance-result rules

A performance result may be added only when all are present:

- dated Search Console or GA4 export;
- exact URL or clearly defined page group;
- exact comparison period and metric definition;
- sample-size context;
- branded/non-branded distinction when relevant;
- no PII or private operational data;
- no unsupported attribution;
- reviewer role and review date.

Allowed examples:

- `The page received X non-branded impressions during DATE–DATE in Google Search Console.`
- `CTR changed from X% to Y% after the title update, comparing equal periods.`
- `The URL was first shown for QUERY GROUP on DATE.`

Not allowed without stronger evidence:

- `SEO generated X dollars.`
- `This page guarantees leads.`
- `Hermes ranks #1.`
- `Capacity is available now.`
- `This route has proven demand` based only on current load-board observations.

## Release loop

1. Create a clean branch from current `main`.
2. Implement one coherent indexable release.
3. Add unique sitemap ownership and internal-link coverage.
4. Add canonical, title, description, H1, schema, and CTA checks.
5. Run dependency audit, build, static/unit/SEO checks, and Playwright.
6. Merge only a green current-head PR.
7. After deployment, run URL Inspection and record the baseline.
8. Review at 7 and 30 days.
9. Make the next improvement from actual query and page evidence.
