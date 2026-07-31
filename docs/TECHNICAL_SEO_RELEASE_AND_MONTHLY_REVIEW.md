# Technical SEO Release and Monthly Review

Date established: 2026-07-31
Owner: Hermes website release lane
Queue coverage: tasks 109–110 in `docs/CLAUDE_200_TASK_EXECUTION_QUEUE.md`

## Purpose

Use one evidence-first gate for every new indexable route and one repeatable monthly review for the full public site. This document does not authorize merge, deployment, DNS, Cloudflare, billing, Search Console account changes, or publication of unsupported claims.

## A. New indexable route release checklist

Complete every item before recommending a route for merge.

### 1. Source and business evidence

- [ ] The page has one named owner and one intended audience.
- [ ] The primary query family and search intent are written down.
- [ ] The service, location, equipment, program, vacancy, or case-study facts come from an approved source.
- [ ] No ranking, traffic, lead, income, load, lane, rate, capacity, hiring, approval, pickup, delivery, or customer-result guarantee is implied.
- [ ] Operational observations are not presented as completed routes or public capacity.
- [ ] A location page has dated demand, competition, operating-fit, and unique-value evidence; otherwise it remains research-only.
- [ ] A case study separates delivered work from measured outcomes and labels unavailable metrics honestly.

### 2. Privacy and publication boundary

- [ ] No names, personal phones, personal emails, unapproved companies, MC/DOT, exact addresses, order IDs, invoices, BOL/POD, shipment notes, individual rates, commissions, live positions, credentials, or private source identifiers appear.
- [ ] No row from `OFFICE 374 2026` or another private operational source is copied into public fixtures or content.
- [ ] Any operational history is aggregated and separately approved for publication.
- [ ] `observed`, `booked`, `completed`, `verified`, and `published` are not collapsed into one status.
- [ ] No automatic transition to `published` exists.
- [ ] Analytics events contain only allow-listed non-PII parameters.

### 3. Page contract

- [ ] The route builds as static HTML.
- [ ] Exactly one visible H1 is present.
- [ ] The title is unique, useful, and aligned with the page intent.
- [ ] The meta description is unique and accurately describes the page.
- [ ] The page has one self-referencing canonical URL on the approved host.
- [ ] Robots meta is `index,follow` only when the page is approved for publication.
- [ ] Open Graph and Twitter metadata are present and accurate.
- [ ] A direct contact fallback is available and follows the direction-specific contact rules.
- [ ] Preview forms do not claim that data was sent or stored.
- [ ] Consent is explicit and not preselected.

### 4. Structured data

- [ ] JSON-LD parses successfully.
- [ ] Schema type matches the page: Service, Article/CreativeWork, CollectionPage, BreadcrumbList, FAQPage, or another approved type.
- [ ] Service schema contains only supported public claims.
- [ ] FAQ schema mirrors visible questions and answers exactly.
- [ ] BreadcrumbList matches the visible hierarchy and canonical route.
- [ ] Organization and WebSite references use the stable site entities.
- [ ] Course and JobPosting schema remain absent unless all required facts are current and approved.

### 5. Crawlability and internal linking

- [ ] The canonical URL appears in exactly one intended sitemap or has a documented reason for intentional duplication.
- [ ] `robots.txt` exposes the sitemap.
- [ ] At least two useful internal links point to the page from relevant hubs or supporting pages.
- [ ] The page links back to its parent hub and to the next useful customer action.
- [ ] Anchor text describes the destination rather than using generic wording.
- [ ] The route is reachable from the homepage link graph within the approved click-depth target.
- [ ] No broken internal links or orphaned supporting pages are introduced.

### 6. Performance, accessibility, and UI

- [ ] Images have width, height, useful alt text, and explicit loading behavior.
- [ ] The likely LCP image has an appropriate priority policy.
- [ ] Page weight remains within the repository performance budget.
- [ ] Keyboard navigation, focus order, mobile menu behavior, reduced motion, and tap targets remain usable.
- [ ] No horizontal overflow, console error, missing asset, or layout failure appears on desktop or mobile.
- [ ] Demo/private-preview routes are clearly labeled and `noindex` where appropriate.

### 7. Verification evidence

Run in CI order:

```bash
npm run build
npm test
npm run test:e2e
```

Record:

- [ ] branch and head commit;
- [ ] files changed;
- [ ] build diagnostics and generated page count;
- [ ] static/unit/registry result;
- [ ] Playwright desktop/mobile result;
- [ ] warnings reviewed and either fixed or explicitly accepted;
- [ ] current-main comparison after the final commit;
- [ ] mergeability status;
- [ ] owner-only actions still pending.

### 8. Search Console release record

After an owner-approved merge and production release, record without exposing account identifiers:

- canonical URL;
- production verification date;
- HTTP status;
- sitemap discovery status;
- URL Inspection status;
- crawl/index state;
- primary query family;
- Day 7 review date;
- Day 30 review date;
- responsible owner;
- next action.

Do not claim indexation, rankings, impressions, clicks, or leads until retrieved from dated Search Console or analytics evidence.

---

## B. Monthly technical SEO regression report

Create one dated report per month. Compare with the previous report and distinguish new regressions from known accepted warnings.

### Report header

- Review month:
- Review date:
- Repository `main` commit:
- Production release identifier:
- Reviewer:
- Search Console evidence date range:
- GA4 evidence date range:
- Known unavailable sources:

### 1. Executive release status

| Area | Status | Change vs prior month | Evidence | Action owner | Deadline |
|---|---|---|---|---|---|
| Build and CI |  |  |  |  |  |
| Indexable route inventory |  |  |  |  |  |
| Sitemap and robots |  |  |  |  |  |
| Canonicals and metadata |  |  |  |  |  |
| Structured data |  |  |  |  |  |
| Internal links and crawl depth |  |  |  |  |  |
| Localization and hreflang |  |  |  |  |  |
| Performance and Core Web Vitals |  |  |  |  |  |
| Search Console coverage |  |  |  |  |  |
| Conversion measurement |  |  |  |  |  |
| Privacy/publication controls |  |  |  |  |  |

### 2. Route inventory

Record:

- generated HTML page count;
- indexable page count;
- noindex demo/private-preview count;
- sitemap URL count by sitemap;
- new routes;
- removed or redirected routes;
- orphan pages;
- sitemap URLs without generated HTML;
- generated indexable pages absent from all intended sitemaps;
- duplicate sitemap ownership requiring review.

### 3. Metadata and canonical integrity

Report counts and affected URLs for:

- missing or multiple titles;
- duplicate titles;
- missing or duplicate descriptions;
- descriptions requiring snippet review;
- missing or multiple canonicals;
- canonical/sitemap mismatch;
- host, protocol, query-string, fragment, or trailing-slash inconsistencies;
- robots meta conflicting with sitemap inclusion;
- missing Open Graph or Twitter fields.

### 4. Structured data integrity

Report:

- invalid JSON-LD blocks;
- Service pages missing supported Service schema;
- visible FAQ sections missing FAQPage schema;
- FAQ schema not matching visible text;
- missing or incorrect BreadcrumbList;
- inconsistent Organization/WebSite entity references;
- unsupported Course, JobPosting, Review, AggregateRating, price, or availability claims.

### 5. Internal links and crawl paths

Report:

- broken internal links;
- pages unreachable from the homepage graph;
- click-depth distribution;
- missing parent-hub links;
- generic or misleading anchor text;
- competing pages targeting the same primary query;
- supporting pages that fail to link to the preferred canonical page.

### 6. Localization

Report:

- hreflang reciprocity;
- `x-default` correctness;
- localized canonical correctness;
- `/ua/` versus accidental `/uk/` usage;
- untranslated UI fragments;
- duplicate localized metadata;
- invalid language-switch destinations.

### 7. Performance and accessibility

Report:

- total built asset size;
- page-weight outliers;
- large image sources requiring modern responsive variants;
- missing image dimensions or alt text;
- missing loading policy or LCP priority;
- render-blocking resources;
- unnecessary client JavaScript;
- desktop/mobile Playwright failures;
- keyboard, focus, reduced-motion, tap-target, CLS, or overflow regressions;
- field Core Web Vitals only when dated source data is available.

### 8. Search Console and analytics

Use dated exports or connected reports only. Record:

- submitted versus discovered sitemap status;
- indexed/not-indexed counts by route family;
- new indexing reasons and affected URLs;
- clicks, impressions, CTR, and average position for 7-day and 28-day windows;
- top query groups by preferred page;
- query cannibalization between Hermes URLs;
- pages with impressions but weak CTR;
- indexed pages with no measurable impressions after the agreed observation period;
- privacy-safe CTA and contact event counts;
- measurement gaps or broken events.

Never include search-property IDs, user identities, form values, shipment identifiers, private rates, or other operational details.

### 9. Content and case evidence

Record:

- pages published this month;
- pages refreshed from measured query evidence;
- pages held for insufficient evidence;
- first real cases with delivered-work proof;
- outcomes still marked as measurement in progress;
- unsupported or stale claims removed;
- location/lane candidates below publication threshold;
- next pages selected from Search Console evidence rather than volume-only generation.

### 10. Defect and action register

| ID | Severity | URL/file | Finding | Evidence | Fix | Owner | Deadline | Status |
|---|---|---|---|---|---|---|---|---|
|  | P0/P1/P2/P3 |  |  |  |  |  |  |  |

Severity guidance:

- **P0:** privacy exposure, credentials, destructive behavior, production outage, or serious legal/publication risk.
- **P1:** indexation blocked broadly, broken canonical/sitemap architecture, lead path failure, or major CI regression.
- **P2:** isolated metadata/schema/internal-link/performance defect with measurable impact.
- **P3:** improvement, warning cleanup, copy refinement, or research item without current production failure.

### 11. Release recommendation

Choose one:

- `READY FOR OWNER MERGE REVIEW` — latest head is green and all P0/P1 issues are closed.
- `HOLD` — blockers are documented and no production action is recommended.
- `RESEARCH ONLY` — evidence is insufficient for publication.

State separately:

- exact PRs recommended for review;
- exact PRs superseded or requiring reconciliation;
- owner-only actions requested;
- next independent batch;
- next Search Console review date.

## Completion rule

A monthly review is complete only when its evidence date, repository commit, production state, unresolved warnings, and next owner are explicit. Missing Search Console or analytics access must be stated as unavailable; values must never be guessed.
