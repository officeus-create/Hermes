# Hermes Error Register

Reviewed: 2026-08-04

Purpose: give every human or AI agent one place to distinguish active blockers, owner/account actions, resolved defects, superseded branches, historical conditions, and items that require monitoring. This file must not contain passwords, one-time codes, private customer data, raw security-alert details, or unverified legal/profile facts.

## Status definitions

- `ACTIVE` — reproducible repository or production issue with an assigned next action.
- `OWNER_ACTION` — requires account, security, billing, identity, eligibility, or infrastructure verification outside a normal code PR.
- `RESOLVED` — fixed and verified on a current or superseding branch/PR.
- `SUPERSEDED` — original attempt must not be merged because a clean current-main replacement exists.
- `HISTORICAL` — true at the time but no longer an active blocker.
- `WATCH` — no confirmed defect; monitor with production evidence.

## Active and owner-required items

| ID | Status | Area | Evidence / current condition | Required next action | Do not do |
| --- | --- | --- | --- | --- | --- |
| ERR-EXT-001 | OWNER_ACTION | Google Search Console | No reviewed mailbox or repository evidence confirms Domain Property ownership, submitted sitemaps, selected canonicals, Coverage/CWV access, or a current query baseline. | Verify the Domain Property in the approved Google account, submit every current sitemap, record owner/date, and export a non-sensitive baseline. | Do not claim GSC is configured from a GA4 tag or sitemap file alone. |
| ERR-EXT-002 | OWNER_ACTION | Bing Webmaster Tools | Ownership and sitemap submission are not confirmed. | Verify the domain, submit current sitemaps, and record crawl/index/query baseline. | Do not create duplicate properties under uncontrolled accounts. |
| ERR-EXT-003 | OWNER_ACTION | Google account security | Reviewed mail contains repeated sign-in and third-party application-access alerts for company/recovery accounts. Some may be legitimate, but they are not independently verified. | Review recent devices, recovery accounts, OAuth grants, administrator access and MFA in Google Account Security; revoke only entries the owner confirms are unauthorized; record the review privately. | Do not paste alert codes, cookies, tokens, recovery data, or account lists into GitHub or an AI prompt. |
| ERR-EXT-004 | OWNER_ACTION | Entity truth and profiles | Exact legal/public NAP, leadership, FMCSA relationship, real service/location model and authorized profile managers are not fully verified. Public directories appear to contain conflicting or stale data. | Build the owner-controlled canonical identity record, verify each listing, and then claim/correct only legitimate profiles. | Do not copy unclaimed directory data into schema or create sameAs links from assumptions. |
| ERR-EXT-005 | OWNER_ACTION | Local profiles / GBP | Real storefront or eligible service-area status has not been verified for every direction. | Confirm the actual U.S. customer-facing/service-area model before creating or editing Google Business Profile, Apple Maps, Bing Places, Yelp, Chamber or local citations. | Do not use virtual offices or create separate online-only local entities to simulate presence. |
| ERR-OPS-001 | ACTIVE | PR #85 | Shipment History remains draft and diverged: 35 commits ahead and 26 behind current `main` at review time. The newest head has no complete current-main validation. | Keep draft; rebuild or reconcile deliberate bounded batches from current `main`, with full CI after each batch. | Do not merge, force-push over reviewed history, or mix it into SEO work. |
| ERR-OPS-002 | WATCH | PR #83 | Google Routes PR is draft and diverged: 24 commits ahead and 26 behind current `main`. Historical green CI does not validate current architecture. Live use also requires Google billing/API/key and Cloudflare secret/KV/flags. | Rebuild from current `main` only when route estimates become a revenue priority; rerun all checks and obtain separate provider/infrastructure approval. | Do not enable billing, secrets, KV, provider APIs or live flags as a side effect of SEO work. |
| ERR-SEO-001 | OWNER_ACTION | SEO measurement | SEO-2 implementation is complete, but GSC/Bing impressions, clicks, CTR, selected canonicals and indexed-query baseline are not verified. | Start 7/28/90-day measurement after verified access; combine search metrics with privacy-safe funnel and manual qualified-lead/revenue records. | Do not claim ranking or revenue lift, start A/B tests, or mass-publish without sufficient baseline and conversion volume. |
| ERR-OPS-003 | ACTIVE | Issue #167 / #185 — lead delivery is live-mode but not wired | **Confirmed via read-only Cloudflare Pages API call (account/project read scope, no secrets exposed).** Production `deployment_configs.production.env_vars`: `LEAD_DELIVERY_MODE=live` (plain_text), `ALLOWED_ORIGIN` correct, `LEAD_SERVICE_TOKEN` present (secret, value not read), `kv_namespaces: [LEAD_LIMITS]` present. But **`service_bindings: []` — empty**. The Worker `hermes-lead-email` does exist (`wrangler deployments list` shows it created 2026-08-04T08:10:31Z with a secret set at 08:11:21Z), but the Pages project has no Service Binding named `LEAD_EMAIL_SERVICE` pointing to it. `functions/api/logistics-lead.ts` line 211 (`!env.LEAD_EMAIL_SERVICE`) correctly guards this: every production submission currently returns `503 delivery_not_configured` — this is NOT a silent lead-loss bug, the direct phone/email fallback stays authoritative. Issue #167's closure ("one synthetic inquiry was delivered") does not match this production config; it was likely verified against a different (preview) deployment or a state that has since changed. | Add the Pages **Service Binding** named `LEAD_EMAIL_SERVICE` on the production environment, targeting the already-deployed `hermes-lead-email` Worker (Cloudflare dashboard → Pages → hermes → Settings → Functions → Service bindings, or the equivalent Pages API/wrangler.toml `[[services]]` block). This is the only missing piece — mode, token, and KV are already correct. Then re-run one owner-approved synthetic production submission and confirm actual email delivery before treating #167 as genuinely complete. | Do not add the Service Binding without owner approval (Cloudflare/infra change per `docs/AI_ROLES.md`). Do not submit another synthetic production lead without owner sign-off. Do not weaken or remove the `!env.LEAD_EMAIL_SERVICE` guard — it is the reason this gap hasn't already cost a real lead. |

## Resolved repository and site errors

| ID | Status | Area | Original problem | Resolution / evidence |
| --- | --- | --- | --- | --- |
| ERR-RES-001 | RESOLVED | Domain/email | On 2026-06-01 the domain was not resolvable and email to the company mailbox bounced; Google domain purchase attempts also failed. | The domain was later acquired/configured through the active registrar and the site and Workspace mailbox became operational. Treat the bounce as historical, not a current DNS diagnosis. |
| ERR-RES-002 | RESOLVED | GA4/CSP | GA4 was present in the layout but blocked by Content Security Policy. | CSP allow-list and related browser-test filtering were corrected; production/client wiring was subsequently verified and the full test suite passed. |
| ERR-RES-003 | RESOLVED | Browser tests | Tests treated approved GA4 collection requests as prohibited form/CRM writes. | Added narrowly scoped analytics-request filtering while preserving failure for any real unapproved external write. |
| ERR-RES-004 | RESOLVED | Load Board CI | Calendar-brittle fixed dates caused unrelated PRs to fail after the date changed. | Issue #93 and PR #95 replaced brittle dates with dynamic future dates; full CI passed and the fix merged. |
| ERR-RES-005 | RESOLVED | SEO CTA | Original PR #109 failed because it was stale and a regression expected SEO to retain the generic CTA. | PR #109 closed without merge; clean current-main PR #111 corrected the path and merged after full green CI. |
| ERR-RES-006 | RESOLVED | AI documentation CI | Initial CLAUDE/AI handoff branches generated failure emails during early repository setup. | Documentation later merged; PR #118 added the vendor-neutral AI entrypoint, machine-readable state and consolidated error register with full green CI. |
| ERR-RES-007 | RESOLVED | E-E-A-T | About, Terms, editorial/corrections and accessibility pages were absent. | PR #116 added trust pages, sitemap ownership, footer discovery, schema rules and browser tests; full CI passed and merged. |
| ERR-RES-008 | RESOLVED | Revenue tracking | Funnel events stopped at digital handoff without shared manual qualified-lead, contract and revenue definitions. | PR #117 added the non-sensitive register template, UTM policy, statuses, formulas and cadence; full CI passed and merged. |
| ERR-RES-009 | RESOLVED | Website/SEO funnels | Digital services previously shared generic contact context and weak qualification. | PR #120 completed service-context website, redesign, general SEO, Local SEO, Logistics SEO and Dealer SEO funnels with privacy-safe start/preview/handoff measurement and tests. |
| ERR-RES-010 | RESOLVED | SEO-2 baseline | Money-query work risked starting without query ownership, baseline limitations or a new-page gate. | PR #119 merged the 30-query public clean-room map, proxy rules, five existing owners, release order and zero-automatic-new-page policy. |
| ERR-RES-011 | RESOLVED | Car hauling owners | Dispatch and Load Board pages lacked explicit self-dispatch comparison, cost/scope guidance, load-evaluation framework and new-authority load-access boundary. | PR #121 strengthened both existing owners, updated strict static contracts, added desktop/mobile coverage and merged after full green CI. |
| ERR-RES-012 | RESOLVED | Niche SEO owners | Logistics and dealer SEO pages underrepresented trucking/dispatch/freight-broker, independent/used dealer, audit, local eligibility and qualified-inquiry intent. | Clean replacement PR #126 changed only the two content owners and strict tests; full CI passed and merged. |
| ERR-RES-013 | RESOLVED | Website Development owner | Website Development did not sufficiently cover logistics/trucking/dispatch/freight-broker architecture, integrations and private-data boundaries. | Clean replacement PR #129 strengthened the national owner, preserved the project brief, created no niche URL, passed full CI and merged. |
| ERR-RES-014 | RESOLVED | Entity/profile governance | No single verification queue existed for NAP, sameAs, local eligibility, profiles, reviews and conflicting listings. | PR #127 added a 24-source audit and operating guide; no profile or unverified fact was published; full CI passed and merged. |
| ERR-RES-015 | RESOLVED | SEO-2 frozen contracts | Deliberate title/H1/content improvements initially failed old static/browser expectations. | Contracts were updated to require the new owner content rather than weakened; every final replacement PR passed build, static/unit/registry and desktop/mobile Playwright. |

## Superseded or obsolete work

| ID | Status | Item | Reason | Safe treatment |
| --- | --- | --- | --- | --- |
| ERR-SUP-001 | SUPERSEDED | PR #109 | Failed/stale SEO CTA attempt. | Use merged PR #111; never reopen or merge #109. |
| ERR-SUP-002 | SUPERSEDED | Old location-page architecture / PR #5 | Earlier multi-city implementation was obsolete and unsafe for query ownership and doorway controls. | Research demand first and create a unique page only when distinct intent and evidence justify it. |
| ERR-SUP-003 | HISTORICAL | Early five-route README status | README reflects an earlier V1 and understates current route, sitemap, funnel and governance architecture. | Treat code, tests, `docs/ai-project-state.json` and current sitemaps as operational truth until README is refreshed separately. |
| ERR-SUP-004 | SUPERSEDED | PR #122 | Original niche SEO branch exposed an unintended shared-component diff after current-main funnel changes. | Closed without merge; use merged clean replacement PR #126. |
| ERR-SUP-005 | SUPERSEDED | PR #124 | Website owner branch accumulated intermediate fixes while `main` advanced. | Closed without merge; use merged clean replacement PR #129. |
| ERR-SUP-006 | SUPERSEDED | PR #130 | Parallel niche SEO replacement duplicated the already verified and merged PR #126. | Closed without merge; do not reopen or cherry-pick duplicate content. |

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