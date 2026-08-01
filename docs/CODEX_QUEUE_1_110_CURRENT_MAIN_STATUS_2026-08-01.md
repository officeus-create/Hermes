# Codex Queue Tasks 1–110 — Current Main Status

Date: 2026-08-01  
Repository: `officeus-create/Hermes`  
Current-main baseline at branch creation: includes merge commit `799d389eee6c1b1e9d6723d5ec0668ca363613d8` and technical SEO release document commit `1bb2a0504be712d383d0125af8be23ecd635299f`.

## Purpose

Replace stale branch assumptions with one current-main reconciliation for coordination, core website completion, release safety, and technical SEO tasks 1–110. This document does not copy PR #19 wholesale and does not authorize private-data connections, provider credentials, DNS, billing, or unsupported public claims.

## Current release state

- Queue tasks 111–200 were merged through the green dependency stack #68 → #58 and then into `main`.
- Final pre-main workflow run #347 passed build, static/unit/registry checks, and desktop/mobile Playwright.
- PR #19 remains 76 commits ahead and 208 commits behind current `main`; it is a historical source branch, not a merge candidate.
- Tasks 109–110 are now represented by `docs/TECHNICAL_SEO_RELEASE_AND_MONTHLY_REVIEW.md` on `main`.
- Real historical lane tasks 116 and 127 remain blocked until an owner-approved sanitized export exists.

## Tasks 1–20 — coordination and source of truth

Status: **completed or superseded by current-main evidence**, with one cleanup action remaining.

Completed evidence:

- Issue #20 is the active tracker.
- Current and historical PRs were inventoried repeatedly during the 200-task execution.
- Merged SEO, layout, schema, analytics, localization, and test work was preserved.
- PRs #58–#68 were validated and merged in dependency order.
- Owner-only gates and private-data boundaries are recorded in current repository documents and Issue #20.
- Stale PR #57 was reconciled file-by-file and closed without losing unique work.

Remaining cleanup:

- Classify PR #19 unique files as `already implemented`, `historical documentation`, `safe port candidate`, or `obsolete`, then close the PR as superseded. Do not merge or rebase it wholesale.

## Tasks 21–50 — core website completion

Status: **core static and preview website is operational; live-delivery and hosting controls remain separate gates**.

Verified by current build/test architecture:

- route generation and 404 output;
- frozen homepage sections and navigation targets;
- desktop and mobile navigation;
- keyboard interaction and mobile menu dismissal;
- reduced-motion behavior;
- valid public phone and email routes;
- preview forms explicitly state that information was not sent or stored;
- consent is not preselected;
- analytics events use controlled non-PII parameters;
- preview/demo routes use explicit labels and noindex where required;
- `/ua/` is used instead of `/uk/`;
- localized pages, language links, footer/legal routes, and privacy boundaries are covered by static and browser checks.

Blocked or not applicable until a live backend is deliberately enabled:

- production form delivery;
- Cloudflare Function request validation;
- durable shared rate limiting;
- idempotency for external submissions;
- duplicate live-delivery handling.

Hosting-level verification still required after a production deployment:

- canonical `www`/non-`www` redirect;
- HTTP-to-HTTPS redirect;
- trailing-slash behavior at the edge;
- Cloudflare cache behavior.

## Tasks 51–80 — automated release safety

Status: **substantially complete on current main**.

Current CI executes:

- Astro type check and static build;
- generated-output validation;
- metadata, sitemap, localization, hreflang, entity-schema, internal-link, performance, commercial-page, digital-service, carrier/demand registry, contact, load-board, and sales-receiver checks;
- desktop and mobile Playwright workflows.

Current non-blocking cleanup targets:

1. confirm the frozen-anchor assertion is present on current main and retire stale PR #53;
2. add explicit loading policy to above-the-fold hero images and retire stale PR #46;
3. remove the remaining Astro inline-script hint without changing behavior;
4. keep latest-head green CI as the release requirement.

## Tasks 81–110 — technical SEO completion

Status: **automated coverage exists; warning cleanup remains**.

Covered by current audits:

- unique title and description review;
- canonical, robots, sitemap, Open Graph, Twitter, Organization, WebSite, Service, BreadcrumbList, FAQPage, Course/JobPosting withholding, hreflang, x-default, localized canonical, `/uk/` leakage, duplicate localized metadata, internal links, orphan detection, image/performance budgets, noindex leakage, and critical route structure.

Tasks 109–110 are completed by:

- `docs/TECHNICAL_SEO_RELEASE_AND_MONTHLY_REVIEW.md`.

## Current defect register

| ID | Severity | Finding | Current state | Next action |
|---|---|---|---|---|
| SEO-01 | P2 | Several indexable pages are reported as absent from the primary sitemap even when cluster sitemaps exist | Warning; no build failure | Reconcile sitemap ownership/index logic and remove false positives |
| SEO-02 | P2 | Some indexable service pages are unreachable from the homepage graph | Warning | Add relevant hub links or document intentional crawl path |
| SEO-03 | P2 | Logistics audience pages lack visible breadcrumb navigation | Warning | Add visible breadcrumb component without changing URLs |
| SEO-04 | P3 | Two commercial pages appear in multiple sitemaps | Warning | Assign one canonical sitemap owner per route |
| PERF-01 | P3 | Five hero images lack explicit loading policy | Existing stale PR #46 contains a safe candidate fix | Port only the loading attributes onto current main |
| PERF-02 | P3 | Several source images are larger than the preferred budget | Warning | Generate responsive modern-format variants in a separate asset batch |
| BUILD-01 | P3 | Academy inline script produces one Astro processing hint | Hint only | Add explicit `is:inline` after confirming no processing dependency |
| DEP-01 | P2 | `npm ci` reports one moderate and three high dependency advisories | Review required | Inspect exact packages and upgrade only with full regression tests |

## Release recommendation

`READY FOR CONTINUED CLEANUP`.

No known P0 or P1 defect is recorded in the latest green stack. The next independent package should address frozen-anchor verification, hero loading policy, the Academy inline-script hint, and stale PR cleanup. Sitemap/crawl warnings should follow as a separate SEO architecture batch so assertions are not weakened merely to remove warnings.
