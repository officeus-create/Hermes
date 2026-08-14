# Hermes Error Register

Reviewed: 2026-08-11

Purpose: give every human or AI agent one place to distinguish active blockers, owner/account actions, resolved defects, superseded branches, historical conditions, and items that require monitoring. This file must not contain passwords, one-time codes, private customer data, raw security-alert details, or unverified legal/profile facts.

For SEO/revenue execution, start with Issue #346. Detailed production measurement belongs in #206 and external entity/profile reconciliation belongs in #204.

## Status definitions

- `ACTIVE` — reproducible repository, production, measurement, or operating issue with an assigned next action.
- `OWNER_ACTION` — requires account, security, billing, identity, eligibility, legal, or provider verification outside a normal code PR.
- `RESOLVED` — fixed and verified on current or superseding work.
- `SUPERSEDED` — original attempt must not be merged because a clean current-main replacement or later architecture exists.
- `HISTORICAL` — true at the time but no longer an active blocker.
- `WATCH` — no confirmed defect; monitor with production evidence.

## Active and owner-required items

| ID | Status | Area | Evidence / current condition | Required next action | Do not do |
| --- | --- | --- | --- | --- | --- |
| ERR-EXT-001 | ACTIVE | Google Search Console / SEO measurement | Authenticated GSC access is confirmed. Latest reviewed evidence reports a successful sitemap with 48 discovered pages, homepage URL Inspection as `URL is on Google`, and a current three-month property snapshot of 10 clicks / 217 impressions / 4.6% CTR / average position 32. Priority-page 7/28-day query and page baselines remain incomplete. | Continue only in #206: inspect the canonical money-page set, collect sanitized 7/28-day page/query metrics, and build the query-to-page opportunity map before expanding page count. | Do not revert this item to `ownership unconfirmed`; do not infer per-page ranking, conversion, or revenue from property-level totals. |
| ERR-EXT-002 | OWNER_ACTION | Bing Webmaster Tools | Authenticated Hermes Bing site access is still missing in the current connected environment. | Resolve access to the existing Hermes property, then record crawl/index/query baseline in #206. | Do not create a replacement site/account merely to make a checklist green. |
| ERR-EXT-003 | OWNER_ACTION | Google account security | Historical reviewed mail contained sign-in and third-party application-access alerts for company/recovery accounts. Some may be legitimate, but they were not independently verified in this repository workflow. | Review devices, recovery accounts, OAuth grants, administrator access and MFA in Google Account Security; revoke only entries the owner confirms are unauthorized; record the review privately. | Do not paste alert codes, cookies, tokens, recovery data, or account lists into GitHub or an AI prompt. |
| ERR-EXT-004 | OWNER_ACTION | Entity truth and profiles | External entity inventory is complete, but canonical owner-approved identity facts and authenticated profile corrections remain incomplete. Fresh 2026-08-11 public sampling also found same-name Hermes search ambiguity and conflicting third-party Milwaukee address data. | Continue only in #204: approve canonical facts privately, correct only authenticated/owner-controlled profiles, then rerun dated branded Google/Bing/AI checks. | Do not copy directory estimates or choose a conflicting directory value merely because it appears in search. |
| ERR-EXT-005 | OWNER_ACTION | Local profiles / GBP | Real storefront or eligible service-area status has not been verified for every direction. | Confirm the actual U.S. customer-facing/service-area model before creating or editing Google Business Profile, Apple Maps, Bing Places, Yelp, Chamber or local citations. | Do not use virtual offices or create separate online-only local entities to simulate presence. |
| ERR-EXT-006 | OWNER_ACTION | GA4 production property | Repository consent/event contracts exist, but the current connected environment does not expose the existing Hermes GA4 resource/stream for authenticated receipt/DebugView verification. | Resolve access to the existing Hermes GA4 property/stream and complete synthetic non-private event receipt checks in #206. | Do not create a replacement analytics property merely to satisfy the checklist, and do not put account/stream identifiers in GitHub. |
| ERR-SEO-001 | ACTIVE | Revenue SEO measurement | Fourteen audited money pages have current canonical/intake/handoff architecture and are classified `READY_TO_MEASURE`; current bottleneck is evidence, not another generic funnel rebuild. | Execute #206, then use actual impressions/query ownership to choose CTR/content/internal-link changes. | Do not mass-publish city/equipment permutations or revive stale SEO score-raising branches before measurement. |
| ERR-SEO-002 | ACTIVE | SEO 11 execution router | Issue #346 is the single revenue-first backlog: measurement → optimize existing demand → proof → entity authority → controlled scale. | Keep one source-of-truth issue per investigation; update #346 when a major block closes or changes priority. | Do not reopen historical parent audits or duplicate active work into new handoff issues. |

## Launch/compliance gates — valid but not daily SEO blockers

| ID | Status | Area | Trigger | Current source of truth |
| --- | --- | --- | --- | --- |
| ERR-GATE-001 | OWNER_ACTION | Carrier agreement e-signature | Final production execution/signature release | #280 — qualified Wisconsin transportation counsel + final business approval required. |
| ERR-GATE-002 | WATCH | Payment/refund/recurring billing | First real checkout, paid offer, subscription or renewal flow | #319 — no fictional payment policy should be published before the actual offer/process exists. |
| ERR-GATE-003 | WATCH | International/state compliance | New market/state/data-flow requirement or production legal verification | #321. |
| ERR-GATE-004 | WATCH | Advertising/vendor technology | Meta Pixel, Ads remarketing, new analytics vendor, international processor or similar activation | #324. |
| ERR-GATE-005 | WATCH | Media/asset provenance | New or existing photo/video/icon/downloadable/client media whose publication rights are not documented | #320. Font binary provenance is already completed via PR #333. |

## Resolved repository and site errors

| ID | Status | Area | Original problem | Resolution / evidence |
| --- | --- | --- | --- | --- |
| ERR-RES-001 | RESOLVED | Domain/email | On 2026-06-01 the domain was not resolvable and email to the company mailbox bounced; Google domain purchase attempts also failed. | The domain was later acquired/configured through the active registrar and the site and Workspace mailbox became operational. Treat the bounce as historical, not a current DNS diagnosis. |
| ERR-RES-002 | RESOLVED | GA4/CSP | GA4 was present in the layout but blocked by Content Security Policy. | CSP allow-list and related browser-test filtering were corrected; current code retains the approved Google Analytics CSP boundary. |
| ERR-RES-003 | RESOLVED | Browser tests | Tests treated approved GA4 collection requests as prohibited form/CRM writes. | Added narrowly scoped analytics-request filtering while preserving failure for any real unapproved external write. |
| ERR-RES-004 | RESOLVED | Load Board CI | Calendar-brittle fixed dates caused unrelated PRs to fail after the date changed. | Issue #93 and PR #95 replaced brittle dates with dynamic future dates; full CI passed and the fix merged. |
| ERR-RES-005 | RESOLVED | SEO CTA | Original PR #109 failed because it was stale and a regression expected SEO to retain the generic CTA. | PR #109 closed without merge; clean current-main PR #111 corrected the path and merged after full green CI. |
| ERR-RES-006 | RESOLVED | AI documentation CI | Initial CLAUDE/AI handoff branches generated failure emails during early repository setup. | Documentation later merged; PR #118 added the vendor-neutral AI entrypoint, machine-readable state and consolidated error register with full green CI. |
| ERR-RES-007 | RESOLVED | E-E-A-T | About, Terms, editorial/corrections and accessibility pages were absent. | PR #116 added trust pages, sitemap ownership, footer discovery, schema rules and browser tests; full CI passed and merged. |
| ERR-RES-008 | RESOLVED | Revenue tracking contract | Funnel events stopped at digital handoff without shared manual qualified-lead, contract and revenue definitions. | PR #117 added the non-sensitive register template, UTM policy, statuses, formulas and cadence; full CI passed and merged. Actual production measurement remains #206. |
| ERR-RES-009 | RESOLVED | Website/SEO funnels | Digital services previously shared generic contact context and weak qualification. | PR #120 completed service-context website, redesign, general SEO, Local SEO, Logistics SEO and Dealer SEO funnels with privacy-safe start/preview/handoff measurement and tests. |
| ERR-RES-010 | RESOLVED | SEO query baseline architecture | Money-query work risked starting without query ownership, baseline limitations or a new-page gate. | PR #119 merged the public clean-room map, proxy rules, existing owners, release order and zero-automatic-new-page policy. Authenticated query decisions now belong in #206. |
| ERR-RES-011 | RESOLVED | Car hauling owners | Dispatch and Load Board pages lacked explicit self-dispatch comparison, cost/scope guidance, load-evaluation framework and new-authority load-access boundary. | PR #121 strengthened both existing owners, updated strict static contracts, added desktop/mobile coverage and merged after full green CI. |
| ERR-RES-012 | RESOLVED | Niche SEO owners | Logistics and dealer SEO pages underrepresented trucking/dispatch/freight-broker, independent/used dealer, audit, local eligibility and qualified-inquiry intent. | Clean replacement PR #126 changed only the two content owners and strict tests; full CI passed and merged. |
| ERR-RES-013 | RESOLVED | Website Development owner | Website Development did not sufficiently cover logistics/trucking/dispatch/freight-broker architecture, integrations and private-data boundaries. | Clean replacement PR #129 strengthened the national owner, preserved the project brief, created no niche URL, passed full CI and merged. |
| ERR-RES-014 | RESOLVED | Entity/profile governance | No single verification queue existed for NAP, sameAs, local eligibility, profiles, reviews and conflicting listings. | PR #127 added a 24-source audit and operating guide; external correction remains deliberately owner/authentication-gated in #204. |
| ERR-RES-015 | RESOLVED | SEO frozen contracts | Deliberate title/H1/content improvements initially failed old static/browser expectations. | Contracts were updated to require the new owner content rather than weakened; final replacement PRs passed build/static/unit/registry and desktop/mobile Playwright. |
| ERR-RES-016 | RESOLVED | Cloudflare build ownership | Duplicate standalone Workers integration created misleading/failing PR checks beside the Pages production owner. | #226 was completed and PR #344 removed the obsolete Marketing Brief evidence helper; fresh PR behavior verified the separate redundant Workers build no longer appears. |
| ERR-RES-017 | RESOLVED | Self-hosted font provenance | Exact provenance was missing for four deployed WOFF2 binaries. | PR #333 replaced/registered the deployed fonts with documented source provenance and merged green. Remaining #320 scope is media/assets only. |
| ERR-RES-018 | RESOLVED | Logistics public source drift | Active source objects/components still carried stale geography and the retired `freight_301@hermeslogisticsus.com` while runtime guards masked them. | PR #347 aligned canonical geography, Organization schema, commercial Logistics CTAs and both carrier/customer intake fallbacks to the approved public source; full CI and Pages preview were green, then #310 closed completed. |
| ERR-RES-019 | RESOLVED | Revenue-audit routing | The active August commercial URL audit still routed proof tasks to closed historical parent #176. | PR #348 routed measurement to #206, proof/optimization/scale to #346, entity work to #204 and carrier legal execution to #280 without changing the 14 `READY_TO_MEASURE` page classifications. |
| ERR-RES-020 | RESOLVED | iOS Safari performance | iOS Safari rendering of backdrop-blur was slow and lagged severely (10-15 FPS) during scrolling and animations. | Added -webkit-backdrop-filter prefixes and GPU transform translate3d triggers to workspace.css, workspace-v2-injected.css, styles.css, workspace-launch-v2.css, mobile.html, and sales-roleplay.html. |


## Superseded or obsolete work

| ID | Status | Item | Reason | Safe treatment |
| --- | --- | --- | --- | --- |
| ERR-SUP-001 | SUPERSEDED | PR #109 | Failed/stale SEO CTA attempt. | Use merged PR #111; never reopen or merge #109. |
| ERR-SUP-002 | SUPERSEDED | Old location-page architecture / PR #5 | Earlier multi-city implementation was obsolete and unsafe for query ownership and doorway controls. | Research demand first and create a unique page only when distinct intent and evidence justify it. |
| ERR-SUP-003 | HISTORICAL | Early five-route README status | README reflects an earlier V1 and understates current route, sitemap, funnel and governance architecture. | Treat code, tests, `docs/ai-project-state.json`, #346 and current sitemaps as operational truth until README is refreshed separately. |
| ERR-SUP-004 | SUPERSEDED | PR #122 | Original niche SEO branch exposed an unintended shared-component diff after current-main funnel changes. | Closed without merge; use merged clean replacement PR #126. |
| ERR-SUP-005 | SUPERSEDED | PR #124 | Website owner branch accumulated intermediate fixes while `main` advanced. | Closed without merge; use merged clean replacement PR #129. |
| ERR-SUP-006 | SUPERSEDED | PR #130 | Parallel niche SEO replacement duplicated the already verified and merged PR #126. | Closed without merge; do not reopen or cherry-pick duplicate content. |
| ERR-SUP-007 | HISTORICAL | PR #85 Shipment History experimental workspace | The draft was later explicitly archived and closed without merge. | Keep as historical research only. Rebuild bounded value from fresh `main` if Shipment History becomes a revenue priority. |
| ERR-SUP-008 | HISTORICAL | PR #83 Google Routes planning estimate | The feature-gated route-estimate PR was explicitly archived and closed without merge. | Rebuild on fresh `main` only if route estimates become revenue-critical and separately approve provider billing/API/secrets. |
| ERR-SUP-009 | SUPERSEDED | PR #317 payment-gate branch | Stale/conflicted branch for a payment flow that does not currently exist. | Use #319 when a real paid offer/checkout is implemented. |
| ERR-SUP-010 | SUPERSEDED | PR #330 AEO/GEO score-raising package | Large stale/conflicted homepage/FAQ/schema package lacked production evidence that the bundled changes were the highest-return work. | Use as an idea library only; selectively reimplement pieces supported by #206 query/page evidence. |
| ERR-SUP-011 | SUPERSEDED | PR #340 Marketing Brief screenshot evidence | Evidence-only branch became stale after CI cleanup and main changes. | Reproduce only the small evidence delta on fresh `main` if a future audit explicitly requires it. |
| ERR-SUP-012 | HISTORICAL | `fix/seo-meta-csp` branch | On 2026-08-11 it was 0 commits ahead and hundreds behind current `main`; the intended GA CSP/LCP/canonical themes are already represented in later current code. | Do not revive the branch. Verify current code/CI instead of reconstructing old local state. |

## Email audit policy

When auditing mail for website errors:

1. Search by source and failure class: GitHub Actions, Cloudflare, Google Workspace/domain, Search Console, security and delivery failure.
2. Map every message to current GitHub/production state before opening a fix.
3. Mark a failure `RESOLVED` only when a superseding merge or current-head green CI exists.
4. Keep security/account alerts as `OWNER_ACTION` until verified in the provider account.
5. Do not archive, delete, reply, revoke access or dismiss alerts without the appropriate explicit action and verification.

## Update format

Add or update one row with:

- stable ID;
- date discovered and last reviewed;
- status;
- affected system/branch/page;
- reproducible evidence;
- owner or agent;
- smallest safe next action;
- verification required to close.