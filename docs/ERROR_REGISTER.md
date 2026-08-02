# Hermes Error Register

Reviewed: 2026-08-02

Purpose: give every human or AI agent one place to distinguish active blockers, owner/account actions, resolved defects, and obsolete branches. This file records evidence and next action; it must not contain passwords, one-time codes, private customer data, or raw security-alert details.

## Status definitions

- `ACTIVE` — reproducible repository or production issue with an assigned next action.
- `OWNER_ACTION` — requires account, security, billing, identity, eligibility, or infrastructure verification outside a normal code PR.
- `RESOLVED` — fixed and verified on a current or superseding branch/PR.
- `SUPERSEDED` — original attempt should not be merged because a clean current-main replacement exists.
- `HISTORICAL` — true at the time but no longer an active blocker.
- `WATCH` — no confirmed defect; monitor with production evidence.

## Active and owner-required items

| ID | Status | Area | Evidence / current condition | Required next action | Do not do |
| --- | --- | --- | --- | --- | --- |
| ERR-EXT-001 | OWNER_ACTION | Google Search Console | No reviewed mailbox or repository evidence confirms Domain Property ownership, submitted sitemaps, selected canonicals, Coverage/CWV access, or current query baseline. | Verify the Domain Property in the approved Google account, submit every current sitemap, record the owner and date, and export a non-sensitive baseline. | Do not claim GSC is configured from a GA4 tag or sitemap file alone. |
| ERR-EXT-002 | OWNER_ACTION | Bing Webmaster Tools | Ownership and sitemap submission are not confirmed. | Verify the domain, submit current sitemaps, and record crawl/index baseline. | Do not create duplicate properties under uncontrolled accounts. |
| ERR-EXT-003 | OWNER_ACTION | Google account security | Reviewed mail contains repeated sign-in and third-party application-access alerts for company/recovery accounts. Some may be legitimate, but they are not independently verified. | Review recent devices, recovery accounts, OAuth grants, and administrator access in Google Account Security; revoke only entries the owner confirms are unauthorized; enable strong MFA and record the review date outside the public repo. | Do not paste alert codes, cookies, tokens, or private account lists into GitHub or an AI prompt. |
| ERR-EXT-004 | OWNER_ACTION | Local profiles / GBP | Real storefront or eligible service-area model has not been verified for every direction. | Confirm the actual U.S. customer-facing/service-area model before creating or editing Google Business Profile, Apple, Bing, Yelp, Chamber, or local citations. | Do not use virtual offices or create separate online-only local entities to simulate presence. |
| ERR-OPS-001 | ACTIVE | PR #85 | Draft Shipment History branch is heavily diverged and lacks a confirmed complete current-head reconciliation. | Keep draft; rebuild or reconcile in deliberate small batches from current `main`, with full CI at each bounded step. | Do not merge, force-push over reviewed history, or mix it into SEO work. |
| ERR-OPS-002 | WATCH | PR #83 | Google Routes feature was green on an older head but remains owner-controlled and may be stale relative to current `main`; live use also requires paid/provider and Cloudflare configuration. | Re-evaluate only when route estimates become a revenue priority; rebase/rebuild on current main and repeat all tests before any enablement. | Do not enable billing, secrets, KV, or live flags as a side effect of SEO work. |
| ERR-SEO-001 | ACTIVE | SEO-2 baseline | Search Console/Bing metrics and indexed-query baseline are not yet confirmed, so exact impression/click/CTR movement cannot be responsibly attributed. | Capture repository/production baseline now; add GSC/Bing data when verified; label keyword difficulty and CPC as external-tool evidence or proxy, never invented precision. | Do not start A/B tests or mass publishing without baseline and conversion volume. |

## Resolved repository and site errors

| ID | Status | Area | Original problem | Resolution / evidence |
| --- | --- | --- | --- | --- |
| ERR-RES-001 | RESOLVED | Domain/email | On 2026-06-01 the domain was not resolvable and email to the company mailbox bounced; Google domain purchase attempts also failed. | The domain was later acquired/configured through the active registrar and the site and Workspace mailbox became operational. Treat the bounce as historical, not a current DNS diagnosis. |
| ERR-RES-002 | RESOLVED | GA4/CSP | GA4 was present in the layout but blocked by Content Security Policy. | CSP allow-list and related browser-test filtering were corrected; production/client wiring was subsequently verified and the full test suite passed. |
| ERR-RES-003 | RESOLVED | Browser tests | Tests treated approved GA4 collection requests as prohibited form/CRM writes. | Added narrowly scoped analytics-request filtering while preserving failure for any real unapproved external write. |
| ERR-RES-004 | RESOLVED | Load Board CI | Calendar-brittle fixed dates caused unrelated PRs to fail after the date changed. | Issue #93 and hotfix PR #95 replaced brittle dates with dynamic future dates; full CI passed and the fix was merged. |
| ERR-RES-005 | RESOLVED | SEO CTA | Original PR #109 failed because it was based on stale assumptions and a regression expected SEO to retain the generic CTA. | PR #109 was closed without merge; clean current-main PR #111 updated the regression and merged after full green CI. |
| ERR-RES-006 | RESOLVED | AI documentation CI | Initial CLAUDE/AI handoff documentation branches generated failure emails during early repository setup. | The documentation was later merged; current project rules and full CI process supersede those initial run notifications. |
| ERR-RES-007 | RESOLVED | E-E-A-T | About, Terms, editorial/corrections, and accessibility pages were absent. | PR #116 added the trust pages, sitemap ownership, footer discovery, schema rules, and browser tests; full CI passed and the PR merged. |
| ERR-RES-008 | RESOLVED | Revenue tracking | Funnel events stopped at digital handoff without a shared manual qualified-lead, contract, and revenue definition. | PR #117 added the non-sensitive register template, UTM policy, qualification statuses, formulas, and operating cadence; full CI passed and the PR merged. |

## Superseded or obsolete work

| ID | Status | Item | Reason | Safe treatment |
| --- | --- | --- | --- | --- |
| ERR-SUP-001 | SUPERSEDED | PR #109 | Failed/stale SEO CTA attempt. | Use merged PR #111; never reopen or merge #109. |
| ERR-SUP-002 | SUPERSEDED | Old location-page architecture / PR #5 | Earlier multi-city implementation was identified as obsolete and unsafe for current query ownership and doorway controls. | Research demand first and create a unique page only when a distinct intent and evidence justify it. |
| ERR-SUP-003 | HISTORICAL | Early five-route README status | README reflects an earlier V1 and understates the current route, sitemap, funnel, and governance architecture. | Treat code, tests, `docs/ai-project-state.json`, and current sitemaps as operational truth until README is refreshed in a separate bounded docs PR. |

## Email audit policy

When auditing mail for website errors:

1. Search by source and failure class: GitHub Actions, Cloudflare, Google Workspace/domain, Search Console, security, delivery failure.
2. Map every message to current GitHub/production state before opening a new fix.
3. Mark a failure `RESOLVED` only when a superseding merge or current-head green CI exists.
4. Keep security/account alerts as `OWNER_ACTION` until verified in the provider account.
5. Do not archive, delete, reply, revoke access, or dismiss alerts without the appropriate explicit action and verification.

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