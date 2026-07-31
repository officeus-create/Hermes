# Hermes Branch Conflict Matrix — 2026-07-31

Purpose: keep active and recently merged work visible before any synchronization or implementation batch.

## Current repository state

- `main` includes merged PRs #13, #15, #16, and #17.
- PR #19 (`growth/58-task-expansion-sprint-v2`) is open as a draft.
- PR #19 is currently **45 commits ahead and 71 commits behind** `main`.
- Merge base: `3a67ee111e7e888efc6739602390a60311078e65`.
- Current `main`: `935238a7f16966d011455fe89925f3111ec05cd5`.
- PR #19 head before this document: `8e4d4f371bf52e5a98e28c7e0aa97cd555b125f3`.

## Active and recently merged work

| PR | State | Scope | Overlap/risk with PR #19 | Required action |
|---|---|---|---|---|
| #5 | Open | 14 logistics location pages and generated sitemap | High SEO/doorway risk; sitemap architecture conflicts with current evidence-first policy | Do not merge into PR #19. Revalidate every location against dated demand, competition, service fit, and 7/10 publication gate. |
| #6 | Open | Academy baseline and gap audit | Documentation only; may contain stale Search Console or program assumptions | Reuse only still-valid baseline notes. Keep pricing and Course schema blocked until approved facts exist. |
| #7 | Open | Restores frozen `#journey` anchor | Low code overlap; branch is stale relative to current `main` | Verify whether `#journey` is still absent on current `main`, then run current-main browser tests before any merge recommendation. |
| #9 | Open | Commercial logistics pages and schema | Much of this scope is superseded by merged PR #13 | Compare file-by-file. Close or retain only unique, verified changes not already present in `main`. |
| #13 | Merged | Technical SEO, commercial logistics pages, audits, performance budgets | Direct overlap in `package.json` and `public/sitemap.xml`; also establishes current SEO source of truth | Preserve all merged audit scripts, route entries, schema, metadata, privacy, performance, and commercial-page work. Reconcile shared files additively. |
| #15 | Merged | Localized hero alt text | Potential loss if PR #19 replaces older localized files | Preserve translated hero alt values and component contract. |
| #16 | Merged | Preconnect and alternate Open Graph locales | Potential loss if older layout is reintroduced | Preserve both preconnect origins and all alternate OG locale output. |
| #17 | Merged | Breadcrumb schema and safe external links | Potential loss if older route/layout files are reintroduced | Preserve BreadcrumbList additions and `noopener noreferrer` hardening. |
| #19 | Draft/open | Careers, growth registries, evidence gates, 200-task queue | Diverged from current `main` | Synchronize deliberately; never replace current-main shared files wholesale. Run full build, static tests, and Playwright after reconciliation. |

## Exact known shared paths requiring manual reconciliation

1. `package.json`
   - keep every merged PR #13 technical SEO audit command;
   - keep Careers, lane-opportunity, multilingual logistics, and growth-registry tests from PR #19;
   - preserve existing unit and workflow tests;
   - do not remove scripts merely to make CI pass.

2. `public/sitemap.xml`
   - keep all valid indexable URLs merged through PR #13;
   - add `/careers/` only once;
   - exclude demos, private previews, blocked geo pages, and unverified lanes;
   - preserve canonical-host consistency.

## Files in PR #19 that are low-conflict additions

These are new files and can normally be retained after current-main synchronization, subject to build/test verification:

- `docs/CLAUDE_200_TASK_EXECUTION_QUEUE.md`;
- `docs/CLAUDE_CURRENT_BLOCKERS_AND_OWNER_GATES.md`;
- `docs/GROWTH_DATA_MEASUREMENT_RELEASE_SYSTEM.md`;
- `docs/LOGISTICS_CARRIER_GROWTH_SYSTEM.md`;
- `docs/LOGISTICS_DEMAND_GROWTH_SYSTEM.md`;
- `docs/RU_UA_MARKETING_GROWTH_SYSTEM.md`;
- `docs/WEBSITE_SEO_US_GROWTH_SYSTEM.md`;
- `src/data/lane-opportunity.ts`;
- `src/data/logistics-growth-registry.ts`;
- `src/data/growth-research-registry.ts`;
- their dedicated tests;
- `src/pages/careers/index.astro`, after checking current navigation, layout, privacy, and schema conventions.

## Synchronization order

1. Refresh PR and branch metadata.
2. Compare current `main` against PR #19 again.
3. Preserve merged PR #13/#15/#16/#17 behavior first.
4. Reconcile `package.json` additively.
5. Reconcile `public/sitemap.xml` additively.
6. Review `src/data/logistics-audiences.ts` against current-main content.
7. Verify the Careers route follows current layout, analytics, privacy, and structured-data conventions.
8. Run `npm ci`, `npm run build`, `npm test`, and `npm run test:e2e`.
9. Record exact failures without weakening assertions.
10. Keep PR #19 draft and request owner approval only after latest-head CI is green.

## Owner-only gates

No automation or agent may perform the following without a separate explicit instruction:

- merge any PR;
- deploy production;
- modify DNS, billing, secrets, Cloudflare account settings, or external provider accounts;
- publish unverified location/lane pages;
- expose operational shipment, carrier, customer, rate, or personal data.
