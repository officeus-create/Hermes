# Growth 120 Conflict Baseline

Reviewed: 2026-07-31

Purpose: preserve work from Claude and the separate technical SEO sprint while PR #19 continues.

## Recently merged Claude work

### PR #15 — localized hero image alt text

Merged into `main`.

Files changed:

- `src/data/localized-overviews.ts`
- `src/components/LocalizedOverviewPage.astro`

Rule: PR #19 must not restore empty hero alt text or replace the localized content data with an older version.

### PR #16 — preconnect and alternate Open Graph locales

Merged into `main`.

File changed:

- `src/layouts/BaseLayout.astro`

Rule: any later BaseLayout work must preserve the Google preconnect hints and `og:locale:alternate` output.

### PR #17 — breadcrumb schema and external-link hardening

Merged into `main`.

Files changed:

- `src/components/SiteFooter.astro`
- `src/components/PathDetailPage.astro`
- `src/pages/case/it-development.astro`
- `src/pages/logistics/[audience].astro`
- `src/pages/paths/[slug].astro`

Rule: preserve `rel="noopener noreferrer"` and the added BreadcrumbList schema when synchronizing or resolving conflicts.

## Open PR #13 versus draft PR #19

A full changed-file comparison identified exactly two overlapping paths:

- `package.json`
- `public/sitemap.xml`

### `package.json` reconciliation

PR #13 adds technical SEO audit commands and scripts. PR #19 adds the focused Careers regression test to the existing test chain.

Required merge behavior:

- preserve every non-duplicate technical SEO command from PR #13;
- preserve `scripts/careers-page.test.mjs` in the test chain;
- do not replace the whole scripts object with either branch version;
- run the complete combined `npm test` command after reconciliation.

### `public/sitemap.xml` reconciliation

PR #13 adds commercial logistics URLs and technical SEO sitemap changes. PR #19 adds `/careers/`.

Required merge behavior:

- preserve all valid URLs from both branches;
- preserve the canonical HTTPS non-`www` host;
- include `/careers/` exactly once;
- include commercial logistics pages exactly once;
- keep demo and `noindex` routes out of the sitemap;
- run sitemap, canonical, hreflang, and internal-link audits after reconciliation.

## Current execution boundary

Until current-main synchronization is complete:

- prefer new isolated files and routes that do not touch the paths above;
- do not modify `BaseLayout.astro`, localized overview files, breadcrumb files, `package.json`, or `public/sitemap.xml` casually;
- any necessary edit to an overlapping path requires a fresh fetch from current `main`, a three-way intent review, and full CI.

## Release rule

A green feature-branch CI is necessary but not sufficient. Before review readiness, PR #19 must be synchronized with current `main`, conflicts must be reconciled by intent, and the combined build, static tests, unit tests, and Playwright tests must pass.
