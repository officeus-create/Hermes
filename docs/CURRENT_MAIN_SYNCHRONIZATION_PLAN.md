# Current Main Synchronization Plan

Reviewed: 2026-07-31

## Verified branch state

Comparison:

- base: `main`
- head: `growth/58-task-expansion-sprint-v2`
- status: diverged
- feature branch ahead by: 29 commits
- feature branch behind by: 71 commits
- current `main` commit at review: `935238a7f16966d011455fe89925f3111ec05cd5`
- merge base: `3a67ee111e7e888efc6739602390a60311078e65`

This branch must not be merged in its current unsynchronized state even though GitHub may report it as mergeable.

## Synchronization objective

Bring PR #19 onto current `main` while preserving:

1. Claude PR #15 localized hero alt text;
2. Claude PR #16 preconnect and alternate Open Graph locale metadata;
3. Claude PR #17 breadcrumb schema and `noopener noreferrer` hardening;
4. all valid technical SEO work from PR #13;
5. the Careers page, Careers test, sitemap entry, privacy-safe career analytics, and growth documentation from PR #19.

## Required sequence

1. Freeze new edits to known overlapping paths during synchronization.
2. Fetch current `main` and the latest PR #13 head.
3. Create a temporary integration branch from current `main` rather than force-moving the existing feature branch.
4. Apply or cherry-pick PR #19 commits in logical batches:
   - isolated documentation;
   - Careers route and audience link;
   - Careers test;
   - sitemap change;
   - package script change.
5. Resolve overlaps by intent, not by choosing one complete file version.
6. Re-run full build and test coverage.
7. Compare the integration branch against `main` and confirm that no merged Claude behavior disappeared.
8. Only after green CI, retarget or replace PR #19 through an explicit reviewed branch update.

## Known overlap handling

### `package.json`

Build a combined scripts object that preserves:

- every technical SEO audit from PR #13;
- the Careers regression test from PR #19;
- all existing unit and browser commands from current `main`.

Acceptance checks:

- JSON parses;
- `npm ci` succeeds;
- `npm run build` succeeds;
- `npm test` runs every intended static/unit audit;
- `npm run test:e2e` succeeds.

### `public/sitemap.xml`

Build a union of valid indexable production URLs.

Acceptance checks:

- canonical HTTPS non-`www` host only;
- `/careers/` exactly once;
- all approved commercial logistics URLs from PR #13 exactly once;
- no demo, preview, query-string, fragment, duplicate, or `noindex` route;
- sitemap/canonical/hreflang audits pass.

### Recently merged Claude paths

Do not overwrite these files with stale branch versions:

- `src/data/localized-overviews.ts`
- `src/components/LocalizedOverviewPage.astro`
- `src/layouts/BaseLayout.astro`
- `src/components/SiteFooter.astro`
- `src/components/PathDetailPage.astro`
- `src/pages/case/it-development.astro`
- `src/pages/logistics/[audience].astro`
- `src/pages/paths/[slug].astro`

## Verification matrix

Before review readiness:

- Astro check: pass;
- Astro build: pass;
- static validation: pass;
- technical SEO audits: pass;
- Careers regression test: pass;
- unit tests: pass;
- desktop Playwright: pass;
- mobile Playwright: pass;
- localized alt text spot check: pass;
- Open Graph locale alternates spot check: pass;
- breadcrumb JSON-LD spot check: pass;
- external-link `noopener noreferrer` spot check: pass;
- sitemap URL union review: pass;
- no secrets or PII introduced: pass.

## Safety

Do not force-update the feature branch, merge PR #19, close PR #13, or deploy production as part of synchronization without separate owner approval.
