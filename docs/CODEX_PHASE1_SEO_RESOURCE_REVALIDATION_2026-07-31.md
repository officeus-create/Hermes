# Codex Phase 1 SEO Resource Revalidation — 2026-07-31

## Scope

Revalidate the three logistics SEO resources inherited from the Claude handoff without changing production or private operational data.

## Source state

| Resource | Source route | Title/canonical/schema | Internal CTA links |
|---|---|---|---|
| Appleton Vehicle Transport | `/logistics/appleton-wi-vehicle-transport/` | Present | Present |
| Auction Vehicle Pickup Checklist | `/logistics/resources/auction-vehicle-pickup-checklist/` | Present | Present |
| Car Hauler Capacity Checklist | `/logistics/resources/car-hauler-capacity-checklist/` | Present | Present |

The pages use the shared `BaseLayout`, explicit descriptions and canonical URLs. Appleton includes Service, BreadcrumbList, and FAQPage data. Both checklist resources include Article and BreadcrumbList data.

## Sitemap state

All three canonical URLs are present in `public/sitemap.xml` with `lastmod` dates of 2026-07-29.

## Build and workflow state

PR #25 commit `d1d535276e7c35d24982b15357d92655fffeb6a0` passed GitHub Actions `Website checks` run #227. The workflow includes Astro check/build, static and unit checks, and Playwright desktop/mobile scenarios. The shared route test list includes all three resources.

## Independent live check

- Appleton returned live HTML with the expected H1, audience sections, safety boundaries, internal links, FAQs, and request CTAs.
- The two checklist URLs could not be independently refetched in the current verification environment because the fetch layer returned a cache-miss error. This is not recorded as a site failure and is not recorded as a fresh live success.
- Follow-up is tracked in Issue #28 and does not block Phase 2 implementation.

## Safety conclusion

No new location page was generated. No real route, carrier, customer, rate, OFFICE 374 row, BOL/POD, invoice, live position, or private note was used. PR #25 remains draft and does not authorize merge or deployment.
