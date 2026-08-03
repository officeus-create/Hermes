# Production vs current-main release manifest — finalized 2026-08-03

## Decision

**Production is not equivalent to current `main`. A full current-main static deployment is the smallest safe release.**

Production is pinned to commit `79ab8a477042802881bc308ce69ebf8b9c9e979d` by the verified PR #86 release record. Current `main` is `2a1004b92e5aeb5bd01317174d8d6e497b31e7cb`.

A partial cherry-pick is not recommended because the current render layer changes `BaseLayout.astro`, shared resource styles, global CSS ownership, entity/contact behavior, and route-scoped CSS across the site. Deploying only the 19 new routes would create mixed runtime contracts.

## Exact comparison

| Metric | Production baseline | Current main | Gap |
|---|---:|---:|---:|
| Generated HTML pages | 85 | 104 | +19 |
| Indexable routes | 80 | 95 | +15 |
| Declared sitemap files | 5 | 7 | +2 |
| Noindex workspaces, excluding 404 | 4 | 8 | +4 |
| Browser tests in recorded green CI | 140 passed / 2 skipped | 284 passed / 2 skipped | +144 passed |

Manifest status across the 104 current routes:

| Status | Count | Meaning |
|---|---:|---|
| `MISSING` | 19 | Route exists in current main but not in the production baseline |
| `STALE` | 82 | Route exists in both, but current output is not equivalent because shared and/or route-specific source changed |
| `COMPLETE` | 3 | Unchanged static noindex demo assets |
| **Total** | **104** | Exact current generated route inventory |

The machine-readable inventory is in [`release-manifest-2026-08-01.json`](./release-manifest-2026-08-01.json).

## Missing indexable URLs

The 15 current sitemap URLs absent from production are:

- `/logistics/resources/new-authority-car-hauler-readiness-checklist/`
- `/logistics/resources/dispatch-service-vs-self-dispatch/`
- `/logistics/resources/broker-setup-packet-checklist/`
- `/resources/website-project-brief-template/`
- `/resources/technical-seo-checklist/`
- `/resources/search-to-inquiry-conversion-checklist/`
- `/academy/us-logistics-operations/`
- `/academy/marketing/`
- `/academy/how-training-works/`
- `/academy/apply/`
- `/academy/resources/`
- `/about/`
- `/terms/`
- `/editorial-policy/`
- `/accessibility/`

## Missing noindex workspaces

The four current internal workspaces absent from production are:

- `/demos/content-pipeline/`
- `/demos/content-pipeline/insight-preview/`
- `/demos/social-distribution/`
- `/demos/ai-visibility-scorecard/`

## Sitemap ownership change

Production `robots.txt` declares:

- `sitemap.xml`
- `sitemap-local.xml`
- `sitemap-services.xml`
- `sitemap-digital-services.xml`
- `sitemap-cases.xml`

Current main declares those five plus:

- `sitemap-academy.xml`
- `sitemap-trust.xml`

The main, local, and cases URL sets are unchanged. The 15 indexable additions are isolated to:

- `sitemap-services.xml`: 3 Logistics resources;
- `sitemap-digital-services.xml`: 3 website/SEO resources;
- `sitemap-academy.xml`: 5 Academy routes;
- `sitemap-trust.xml`: 4 trust/legal routes.

## Verified production drift

The public homepage crawl still exposes the retired three-track Academy wording and the COO / Operational Director Program. Current main's Academy contract enforces two public programs and rejects the retired third track. This is direct evidence that production has not reached current-main parity.

Other route-specific stale areas include the homepage, Load Board, Logistics commercial pages, Academy hub, contact routing, entity architecture, Website Development, SEO, case studies, and several Wisconsin/vehicle-transport pages. All remaining Astro routes are still stale at the rendered-output level because the shared layout and CSS ownership changed after the production baseline.

## Release blockers

1. No deployment record exists for current commit `2a1004b...`.
2. Production still reflects the previous release baseline.
3. Fifteen indexable routes and four noindex workspaces are missing.
4. `robots.txt` on production must be verified after deployment for seven sitemap declarations.
5. The production sitemap total must be verified at 95 unique canonical URLs.
6. The homepage and Academy routes must be checked for the two-program public contract.
7. New contact/qualification flows must remain preview-safe unless the live endpoint is explicitly configured.
8. The CSS performance contract from PR #154 must remain green after deployment.

## Smallest safe deploy sequence

1. Deploy the complete static output from current `main` commit `2a1004b...`; do not cherry-pick individual pages.
2. Record the immutable Cloudflare Pages deployment ID and URL.
3. Verify HTTP 200 for the homepage, the 15 new indexable URLs, and the four new noindex workspaces.
4. Verify the four noindex workspaces emit `noindex,nofollow`.
5. Verify `robots.txt` declares all seven sitemap files.
6. Verify all seven sitemap files return HTTP 200 and contain 95 unique canonical URLs with no duplicate ownership.
7. Verify the homepage, `/paths/academy/`, all five `/academy/.../` routes, `/load-board/`, `/logistics/car-hauling-dispatch/`, `/services/website-development/`, and `/services/seo/`.
8. Run the existing full CI/Playwright chain against the release candidate or immutable deployment.
9. Update this manifest with the deployment ID, immutable URL, deployed commit, verification timestamp, and final status.
10. Hand the deployed URL inventory to Issue #91. Only then resume Issue #88 multi-state pilots.

## Rollback criteria

Rollback to the last verified immutable release if any of the following occurs:

- route count is below 104;
- sitemap unique URL count is below 95;
- a current sitemap is missing or duplicated;
- Academy exposes the retired third public track;
- a preview form unexpectedly sends or stores data;
- critical commercial routes return non-200;
- CSS or interaction regressions fail the production verification set.

## Evidence sources

- production baseline commit: `79ab8a477042802881bc308ce69ebf8b9c9e979d`;
- production immutable release recorded in Issue #87: `f2b7a02d.hermes-eu4.pages.dev`;
- production CI run: `30723528687`;
- current main commit: `2a1004b92e5aeb5bd01317174d8d6e497b31e7cb`;
- current performance PR: #154;
- current route inventory: seven checked-in sitemap files plus generated noindex routes;
- machine-readable comparison: `docs/release-manifest-2026-08-01.json`.
