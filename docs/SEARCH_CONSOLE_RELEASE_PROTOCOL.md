# Search Console Release Protocol

Date established: 2026-07-31
Owner: Hermes SEO execution lane

## Purpose

Turn each public SEO release into a measured operating cycle without delaying publication while waiting for performance data.

Priority order:

1. Publish a useful, indexable, claims-safe page.
2. Confirm crawl discovery and canonical eligibility.
3. Collect Search Console evidence for the exact URL and query group.
4. Improve titles, descriptions, content, internal links, and CTA paths from measured data.
5. Publish a case-study result only after the source, date range, and scope are reviewable.

## Required page registry fields

Every tracked URL must record:

- canonical URL;
- release date;
- page type;
- primary intent;
- supporting query groups;
- sitemap location;
- internal-link source pages;
- structured-data types;
- CTA event name;
- URL inspection status;
- Google-selected canonical when available;
- first impression date;
- 7-day review date;
- 30-day review date;
- latest Search Console export date;
- case-study eligibility status;
- blocker or next action.

## Current first case registry

| Canonical URL | Page type | Primary intent | Release state | Search Console state | Case state |
|---|---|---|---|---|---|
| `/logistics/appleton-wi-vehicle-transport/` | Local commercial | Appleton vehicle transport | Published | Baseline export pending | Implementation case published; performance results pending |
| `/logistics/resources/auction-vehicle-pickup-checklist/` | National resource | Auction vehicle pickup checklist | Published | Baseline export pending | Supporting resource in Appleton case |
| `/logistics/resources/car-hauler-capacity-checklist/` | National resource | Car hauler capacity checklist | Published | Baseline export pending | Supporting resource in Appleton case |
| `/case/` | Case-study hub | Hermes website and SEO case studies | Release candidate | Inspect after approved merge/deploy | Not applicable |
| `/case/appleton-vehicle-transport-seo/` | Case study | Appleton vehicle transport SEO case study | Release candidate | Inspect after approved merge/deploy | Implementation evidence only |

## URL inspection sequence

After an approved merge and production deployment:

1. Confirm the production URL returns HTTP 200.
2. Confirm the rendered canonical equals the production URL.
3. Confirm the URL appears in the correct sitemap.
4. Run Search Console URL Inspection.
5. Record:
   - discovery source;
   - crawl status and date;
   - indexing allowed state;
   - user-declared canonical;
   - Google-selected canonical;
   - mobile usability result;
   - enhancement or schema findings.
6. Request indexing only when the page is useful, canonical, indexable, internally linked, and free of unresolved release defects.

## Seven-day review

Use the exact page filter and compare only after a stable release date.

Capture:

- first impression date;
- impressions;
- clicks;
- CTR;
- average position;
- query list;
- country and device split when sample size is useful;
- whether impressions match the intended page intent;
- whether another page is receiving the same queries;
- any excluded or duplicate canonical status.

Do not publish a result claim from a very small sample without saying that the sample is limited.

## Thirty-day review

Capture the same fields and add:

- branded versus non-branded query grouping;
- city/service/checklist query grouping;
- page-to-query overlap and cannibalization;
- title and description CTR opportunities;
- content gaps visible in actual queries;
- internal-link opportunities from pages already receiving impressions;
- privacy-safe GA4 CTA events for the page;
- inquiry quality when a lawful, approved source exists.

## Query groups for the Appleton cluster

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
- what information is needed for auction car pickup;
- inoperable auction vehicle transport preparation;
- vehicle release and pickup requirements.

### Carrier preparation

- car hauler capacity checklist;
- information needed from a car hauling carrier;
- car hauler equipment and capacity details;
- carrier availability information for vehicle transport.

These are tracking groups, not search-volume or ranking claims.

## Case-study publication rules

A performance result may be added to a public case only when all are present:

- dated Search Console or GA4 export;
- exact URL or clearly defined page group;
- exact comparison period;
- metric definition;
- sample-size context;
- branded/non-branded distinction when relevant;
- no PII or private operational data;
- no unsupported attribution;
- reviewer name or role and review date.

Allowed examples:

- `The page received X non-branded impressions during DATE–DATE in Google Search Console.`
- `CTR changed from X% to Y% after the title update, comparing equal periods.`
- `The URL was first shown for QUERY GROUP on DATE.`

Not allowed without stronger evidence:

- `SEO generated X dollars.`
- `This page guarantees leads.`
- `Hermes ranks #1.`
- `Capacity is available now.`
- `This route has proven demand` based only on a current load-board observation.

## Release loop

For every small SEO package:

1. Create a clean branch from current `main`.
2. Implement one coherent indexable release.
3. Add sitemap and internal-link coverage.
4. Add canonical, title, description, H1, schema, and CTA checks.
5. Run build, static/unit/registry, and Playwright tests.
6. Open a PR and wait for owner approval before merge.
7. After approved deployment, run URL inspection and record the baseline.
8. Review at 7 and 30 days.
9. Make the next small improvement from actual query and page data.
