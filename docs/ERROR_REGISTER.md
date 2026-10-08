# Hermes Error Register

Reviewed: 2026-10-06

Purpose: give every human or AI agent one place to distinguish active blockers, owner/account actions, resolved defects, superseded branches, historical conditions, and items that require monitoring. This file must not contain passwords, one-time codes, private customer data, raw security-alert details, or unverified legal/profile facts.

For SEO/revenue execution, start with `docs/SEARCH_GROWTH_GUARDRAIL.md`, the current One Brain Search/AI Visibility prompt, and this register. Issues #206 and #346 are closed and must not be revived as default routers. External entity/profile reconciliation no longer routes through closed #204. Staff.am public propagation is resolved; the remaining authenticated employer-profile correction is Work.ua under Recruiting/HR issue #515, while other third-party/legal-directory items stay access- or evidence-gated in the canonical fact inventory.

## Status definitions

- `ACTIVE` — reproducible repository, production, measurement, or operating issue with an assigned next action.
- `OWNER_ACTION` — requires account, security, billing, identity, eligibility, legal, or provider verification outside a normal code PR.
- `ACCESS_GAP` — the desired bounded action is known, but the currently authorized tool surface cannot perform or verify that mutation safely; do not route around the missing capability.
- `RESOLVED` — fixed and verified on current or superseding work.
- `SUPERSEDED` — original attempt must not be merged because a clean current-main replacement or later architecture exists.
- `HISTORICAL` — true at the time but no longer an active blocker.
- `WATCH` — no confirmed defect; monitor with production evidence.

## Active and owner-required items

| ID | Status | Area | Evidence / current condition | Required next action | Do not do |
| --- | --- | --- | --- | --- | --- |
| ERR-REPAIR-INTAKE-ATTRIBUTION-20261008 | ACTIVE | Repair Website/SEO event attribution | Exact main `4f1fb7b8` source confirms repair context is already in CTA query, but Website event base drops source/vertical/group and SEO base hardcodes `seo_services`. Bounded Project31 draft prepares fixed context allowlist and isolated source/funnel regressions; central review of `624be2bf` exposed simultaneous opposite-mode keys, now addressed with explicit absence checks and symmetric/empty-key regressions on exact replay base `590bb3a3`. | Review current-head CI and synthetic fixture evidence, then obtain separate release authority. Remains active until approved production verification. | Do not call this delivery failure, send a form/telemetry, copy arbitrary query values or expand search owners. |
| ERR-PRODUCTION-VERIFIER-EMPTY-ENV-20261008 | ACTIVE | GitHub Actions release verification | After #1731 merged as `4f1fb7b8588e957f78407d242e0053efea5fff17`, runs `37792999535` and `37793001628` failed before job creation. Exact-main inspection found an empty job-level `env:` mapping in the main-production and production-domain manual verifiers after the retired `GH_TOKEN` value was removed. | Remove only the two empty mappings, enforce the invariant across all five retired-router workflows, require exact-head CI, merge through protected main, and confirm no jobless verifier failure on the hotfix push. | Do not restore issue-comment routing, `issues: write`, closed-issue reporting, or claim verifier execution from a workflow that never created a job. |
| ERR-WI-JOBPOSTING-RUNTIME-20261008 | RESOLVED | Wisconsin recruiting expiry | Request-time expiry merged in #1750 as cc5a8ae58914a65a7cd43497a9cdad39ee2ab073; exact-SHA production run37695299826 SUCCESS. Technical expiry boundary is 2026-10-10T23:59:59Z. Current HR revalidation found no evidence to renew; legal entity, equipment/authority/insurance/program and applicant receiver gates remain separate. | Preserve runtime suppression of Apply/JobPosting after expiry until dated HR/legal/operations approval; continue only existing business-confirmation gates. | Do not silently extend expiry, infer authority from a live/unlisted ATS link, delete/noindex the useful canonical page, or call click/submit a human receipt. |
| ERR-CLOUDFLARE-CRAWLER-HINTS-20261006 | RESOLVED | Cloudflare / Bing notification ownership | Cloudflare Crawler Hints was changed from ON to OFF in the authenticated owner UI on 2026-10-07 and immediately read back as `Value: 0`. The durable receipt is `data/seo/indexnow-crawler-hints-setting-2026-10-07.json`; the canonical repository-controlled IndexNow workflow remains enabled. | Preserve Crawler Hints OFF and repository-controlled IndexNow. Judge notification and crawl behavior only from a settled future Bing interval tied to this dated change. | Do not re-enable Crawler Hints, disable the controlled IndexNow workflow, repeat broad submissions, infer lead or revenue impact from the setting change, or rerun a broad SEO audit. |
| ERR-GITHUB-MAIN-PROTECTION-20261006 | RESOLVED | GitHub release governance | Independent read of ruleset24686927 Protect main release gate on 2026-10-08 confirms active enforcement on the default branch, PR required, six strict checks (contracts, three browser shards, build-and-test, audit), deletion/non-fast-forward prohibited, and no bypass actors. Earlier branch-protection endpoint403 was a read-permission boundary, not proof of current absence. | Preserve enforced PR/exact-head checks. Re-read current ruleset before claiming enforcement changed. | Do not route around Administration restrictions, create credentials, direct-push protected main or weaken release gates. |
| ERR-INDEXNOW-ROUTER-20261007 | RESOLVED | Search / IndexNow workflow governance | PR #1723 clean-replayed the still-required two-file delta from a branch 13 commits behind current main, removed the dead issue-comment router bound to closed #346, passed exact-head Website checks, 4/4 browser shards, build-and-test, Cloudflare ownership and web-quality audit, then merged as `0f2d64dff288551a1217a9acb855e81b93988b39`. | Preserve the canonical manual workflow_dispatch and changed-money-page submission contracts; replay future historical fixes from current main rather than merging stale branches wholesale. | Do not restore closed issue numbers as executable routing dependencies or run broad/full recurring IndexNow submissions. |
| ERR-CLOUDFLARE-961-REPORTING-20261007 | RESOLVED | Cloudflare release governance | PR #1725 clean-replayed the still-required Cloudflare governance delta, removed closed #961 as a release-reporting sink and removed unnecessary `issues: write`, preserved exact-SHA deployment/public readbacks and Actions-summary evidence, passed exact-head CI, then merged as `6ad8af09dafe68dff44f768cbe28501aa780f8ec`. | Keep release evidence in bounded Actions/deployment evidence and preserve #960 as the current bounded D1/operator proof owner. | Do not write release success/failure evidence into closed issues or keep permissions solely for retired reporting paths. |
| ERR-CATALOG-WORKER-COMPAT-20261004 | OWNER_ACTION | Catalog inquiry delivery compatibility | The source/review defect is closed: PR #1671 merged as `a122bb2a4f15c37a442801760d38310a2baf858a`, current `main` exposes authenticated `GET /v1/capabilities` with `catalog_delivery_receipt_contract: v1`, and Catalog fails closed with `503 worker_contract_unavailable` before any D1 receipt claim/provider call when capability is missing or mismatched. The remaining gap is production Worker rollout/readback, not more Pages code. | Deploy the same existing `hermes-lead-email` Worker through the owner-approved #611 path, capture the Cloudflare version at 100%, capability readback through the private Service Binding, authorized D1 receipt readback, and one unique synthetic accepted/replay canary before enabling normal Catalog delivery. | Do not create a second Worker/workflow, rewrite the merged compatibility guard, deploy with a broad token, mutate D1 manually, claim runtime compatibility from source tests, or resend an uncertain receipt. |
| ERR-UX-TECH-001 | RESOLVED | Technology path consent overlap | The defect reproduced in the older Wisconsin-careers full-suite run, but newer exact-head #1699 (`761c63c0161ad3ae9b3004d355a191d4502c89b7`) completed Website checks with all four browser-regression shards successful before merge to current `main`. The current `tests/tracking-consent.spec.ts` still contains the desktop/mobile hero-CTA geometry guard for `/paths/technology/`, so the later green browser suite is stronger current-state evidence than the older failure. | Preserve the consent/hero overlap assertions and reopen only if a newer exact-head browser run reproduces the geometry failure. | Do not add speculative CSS for a stale failure, weaken the overlap assertion, or treat an older branch run as newer than merged exact-head evidence. |
| ERR-SEO-INTAKE-MODE-20261002 | RESOLVED | SEO intake copy | Current `main` renders the production-aware SEO intake note, explicitly states that acceptance is not human receipt or qualification, and keeps preview environments non-sending. The current mobile regression and commercial CTA contracts enforce that wording; the #1696 exact-SHA main release reached Cloudflare production successfully. | Preserve `tests/seo-intake-mode-copy.spec.ts`, the production contact-runtime proof, and the receiver-delivery evidence boundary. | Do not reopen from the retired `12d4a4a` snapshot or closed #346 backlog; reopen only from a current source/runtime regression. |
| ERR-HOME-V4-001 | RESOLVED_IN_REVIEW | Home V4 public semantics and motion | Main #1574 rendered design-governance copy publicly, used a generic container for direction navigation, omitted visible goal text from accessible names, and kept two decorative ring animations infinite on mobile/desktop. The bounded Home follow-up uses a named nav landmark, complete goal-based link names, customer-facing guidance, one desktop cycle under two seconds and static mobile/tablet/reduced-motion rings. | Require exact-head browser CI for no-JS, keyboard order/Enter, five widths and reduced motion; owner-approved merge/deploy and public readback remain separate. | Do not rebuild HomeFourRooms, weaken V4 tests, add a runtime, or promote source/CI evidence to LIVE_VERIFIED. |
| ERR-EXT-001 | SUPERSEDED | Google Search Console / SEO measurement | The old baseline route is obsolete: #206 is closed and newer authenticated GSC evidence is already retained in the Search/AI Visibility operating history and One Brain. Current recovery is governed by `docs/SEARCH_GROWTH_GUARDRAIL.md` and the history-first rule. | Reuse the latest settled authenticated evidence already on record. Pull a new bounded window only when a concrete decision requires a newer settled interval; do not rerun a generic baseline by default. | Do not reopen #206, reinterpret stale aggregate exclusion buckets as current defects, or infer lead/revenue from search-platform metrics. |
| ERR-EXT-002 | SUPERSEDED | Bing Webmaster Tools | The old Bing snapshot is obsolete. Newer owner-authenticated evidence was reconciled in #1692; controlled changed-money-page IndexNow replaced broad submission noise, and #1696 added fail-closed Bing title/meta/H1/alt hygiene while consolidating low-evidence search owners. | Preserve the successful sitemap and controlled IndexNow path. Let Bing recrawl the released corrections; inspect a new Bing window only when a settled post-release decision requires it. | Do not reopen #206, repeatedly resubmit a healthy sitemap, or mass-edit pages from historical aggregate warnings without exact current URLs. |
| ERR-SEO-005 | RESOLVED | GSC canonical discovery / internal links | The two historically orphaned canonical owners were fixed by merged #1503. Subsequent #1696 search-surface consolidation also removed low-evidence reference capabilities such as Load Analyzer from independent search ownership where appropriate. Current commercial-owner and internal-link contracts pass on the released main. | Preserve contextual-owner and same-origin-target regression gates. Reopen only from a current build/public-link regression, not from the stale GSC aggregate. | Do not advertise expired roles, promote reference concepts as live products, or recreate index ownership solely to satisfy an old report bucket. |
| ERR-EXT-003 | OWNER_ACTION | Google account security | Historical reviewed mail contained sign-in and third-party application-access alerts for company/recovery accounts. Some may be legitimate, but they were not independently verified in this repository workflow. | Review devices, recovery accounts, OAuth grants, administrator access and MFA in Google Account Security; revoke only entries the owner confirms are unauthorized; record the review privately. | Do not paste alert codes, cookies, tokens, recovery data, or account lists into GitHub or an AI prompt. |
| ERR-EXT-004 | OWNER_ACTION | Entity truth and profiles | First-party entity disambiguation is already merged in #1693. Staff.am EN/RU public propagation was directly rechecked on 2026-10-06 and the earlier conflicting year/employee/location/benefit/phone fields are no longer visible. Issue #204 was closed after #1709 reconciled current entity facts. The remaining authenticated employer-profile contradiction is Work.ua under Recruiting/HR #515; D&B/Buzzfile and other profile/legal-directory facts remain evidence/access-gated. | Use #515 for the authenticated Work.ua edit/support correction, removing or evidence-gating unsupported scale, employee, agency/network and future-business claims while preserving approved identity, website and recruiting facts. Reconcile D&B/Buzzfile only from owner-controlled legal records. After an actual external change settles, perform one bounded post-change entity verification. | Do not reopen #204, repeat branded Google/Bing/AI checks without an underlying profile change, copy modelled directory estimates, or choose a conflicting value merely because it appears in search. |
| ERR-EXT-005 | OWNER_ACTION | Local profiles / GBP | Real storefront or eligible service-area status has not been verified for every direction. This is an eligibility/fact gate, not a signal to run another generic local-SEO audit. | Confirm the actual U.S. customer-facing/service-area model first; create or edit Google Business Profile, Apple Maps, Bing Places, Yelp, Chamber or local citations only where the business is genuinely eligible and the account is authenticated. Verify once after the approved profile change settles. | Do not run repeated local-profile scans while eligibility is unchanged, use virtual offices, or create separate online-only local entities to simulate presence. |
| ERR-EXT-006 | WATCH | GA4 production measurement | No current GA4 defect is asserted here: the existing Hermes property and production stream are established, while commercial receiver/qualification evidence remains a separate layer from browser/search metrics. The former #206 router is closed. | Use the existing production measurement runbook and current event contracts only when a specific release or business decision needs bounded GA4 receipt evidence; preserve HUMAN / SEARCH_CRAWLER / HERMES_SYNTHETIC separation. | Do not reopen #206, create a replacement property, rerun a generic baseline by default, mark unused `purchase` as proof, or send submitted/private values to analytics. |
| ERR-CONTACT-001 | RESOLVED | Shared public contact form delivery | PR #1344 merged as `5051b53fa03d2ff682ec2c60372419a1b520e741`; Cloudflare exact-SHA production deployment passed, production `/paths/logistics/` exposed `data-contact-mode=live` + `/api/logistics-lead`, the deployed ContactCTA resolved the relative endpoint against `window.location.href`, and one bounded synthetic browser submission returned HTTP 200 with matching corporate inbox receipt. | Preserve the relative-endpoint regression and normal exact-SHA Cloudflare release path. Reopen only from a fresh browser-path regression, not from the retired pre-fix snapshot. | QA receipt proves delivery only; do not count it as a qualified lead, customer, sale, or revenue. |
| ERR-CONTACT-002 | RESOLVED | Logistics public contact routing / fact governance | PR #1700 merged as `e65e61409ccf33edba88413d555f2ad12cf5654e`. Current canonical facts keep `+1 (262) 302-3626` retired and no canonical public phone approved. A targeted live production fetch on 2026-10-06 with cache tolerance `ttl=0` for `/paths/logistics/` showed no retired phone, no `freight_301@hermeslogisticsus.com`, and did show `officeus@hermeslogisticsus.com` as the Logistics contact route. Older search/web-reader copies that still expose the retired phone are stale crawl/cache evidence, not current production truth. | Preserve `docs/CANONICAL_COMPANY_FACTS_APPROVAL.md` as the publication authority, the canonical-contact governance regression, and the approved email route. Reopen only from a fresh current production/source regression. | Do not restore the retired phone from historical docs, repurpose another unapproved number, or treat stale search/web cache as current production evidence. |
| ERR-CARRIER-001 | OWNER_ACTION | Carrier lead Telegram routing | The code defect is no longer open: merged #1427 (`bebed9f40b0b22b88540f7f520e46d5a2db322fd`) added the fail-closed America/Chicago guard immediately before Telegram delivery, and current `scripts/sales-lead-receiver.test.mjs` preserves 09:00/17:45 allowed plus 17:46/weekend blocked. The remaining gap is external/runtime: an owner-approved dedicated Sales destination/token and current Worker release/readback are required before claiming live Telegram delivery. Email delivery remains independent. | Configure only an owner-approved dedicated Sales chat/token through the authorized runtime path, release the existing Worker through its normal owner gate, then obtain one controlled in-window receipt and one outside-window no-send proof. | Do not rewrite the already-merged time guard, reuse the retired HL40 group, invent a destination, expose bot credentials, or count synthetic routing proof as a real carrier lead. |
| ERR-AI-001 | OWNER_ACTION | Hermes Connect internal AI Assistant | PR #878 is merged at `cb582c9f43e0d7ea8157eebfc4dbe4e3569ab803`; the private route is publicly deployed and anonymous internal-AI status/task requests fail closed. The owner capability binding, scoped runner secret, and outbound Mac runner are not configured in the available private environment, so no end-to-end receipt or approval-gate simulation exists. `REMOTE_BROWSER_TO_CODEX = UNVERIFIED`. | In an approved authenticated private admin/provider surface, identify the real existing owner specialist ID, create exactly one active `HERMES_INTERNAL_OWNER` binding, configure one scoped runner secret without revealing it, then execute the bounded receipt and simulated `needs_approval` tests. | Do not guess or publish the owner identity, commit/log a credential, use a customer role as an internal role, expose the route in customer navigation, enable remote shell behavior, merge/deploy automatically, or claim live runner access. |
| ERR-SEO-001 | SUPERSEDED | Revenue SEO measurement | The generic #206 measurement route is closed. Existing money-page evidence remains reusable; the current Search Recovery rule prioritizes known visibility/indexation/release defects and proven P0 owners instead of rebuilding the measurement baseline. | Use existing settled evidence and `docs/SEARCH_GROWTH_GUARDRAIL.md`; obtain a newer bounded metric window only when it changes a specific optimization decision. | Do not restart generic funnel audits, mass-publish permutations, or rewrite existing owners merely to improve a synthetic SEO score. |
| ERR-SEO-002 | SUPERSEDED | SEO execution router | Issue #346 is closed. Current owner-approved routing is `docs/SEARCH_GROWTH_GUARDRAIL.md` plus the canonical One Brain Search/AI Visibility prompt and current GitHub error/release evidence. | Recover historical evidence, verify the exact defect against current main/production, and route only the remaining bounded delta. | Do not reopen #346 or historical parent audits merely because an old handoff points to them. |
| ERR-SEO-003 | RESOLVED | GSC crawl/index quality | The historical thin/index-bloat problem is addressed by the current Search Release Gate and merged #1696: low-evidence supporting/provider/equipment/thin-hub surfaces remain usable where appropriate but no longer claim independent sitemap/search ownership; P0 owners remain indexable. Exact-head SEO/Bing/GSC contracts passed before release and the exact-SHA main deployment succeeded. | Preserve one-intent/one-owner, noindex supporting surfaces, sitemap ownership and search-release regression gates; allow search engines to settle before interpreting old aggregate buckets. | Do not bulk-request indexing, revive thin variants, or add superficial copy to force uniqueness. |
| ERR-SEO-004 | RESOLVED | Structured data eligibility | The historical Semrush structured-data defects were corrected by merged #1492 (`fcedba8729206155ce3b2660326d21f848cb3edb`): truthful zero-price Offers are limited to eligible live/free setup surfaces, informational capability references use `WebPage`, and pre-offer Academy curricula use `LearningResource`. Current source and regression contracts preserve these boundaries. | Preserve the schema contracts and truthful offer/course eligibility rules. Reopen only from a current source/build/search-enhancement regression that identifies an exact affected owner. | Do not rerun the old Semrush audit merely to re-prove the merged fix, invent ratings/reviews/prices/availability, or publish `Course`/offer semantics without a real current offering. |
| ERR-EXT-007 | RESOLVED | `www` custom domain | Fresh GitHub-hosted production reconciliation on 2026-09-19 returned `301` for both `https://www.hermeslogisticsus.com/` and `http://www.hermeslogisticsus.com/`, with `Location: https://hermeslogisticsus.com/`. The earlier Cloudflare `520` state is no longer current. | Preserve the apex as canonical. Repository middleware now also carries a fail-closed `www`/production-Pages → apex redirect contract so a future routing change cannot create a second indexable host when requests reach Pages. | Do not reopen DNS/custom-domain work without fresh production regression evidence; do not treat historical GSC blocked rows as current Cloudflare failure after the redirect is proven live. |
| ERR-HC-RS-001 | RESOLVED | Hermes Connect Repair Shops cabinet | Current `main` contains scoped Repair Shop workspace/customer styling in `src/styles/hermes-connect-workspace.css`, `src/styles/hermes-repair-public-shell.css`, and the customer route's own light card/header rules. The later exact-head #1699 Website checks completed all four browser-regression shards successfully on this codebase, so the older low-contrast/layout review state is superseded by newer merged source + browser evidence. | Preserve the scoped workspace/customer/availability styling and reopen only from a newer authenticated/current-head visual or pointer regression. | Do not rebuild the cabinet from an old review branch or treat a local synthetic demo as proof of a live booking, customer, or availability integration. |
| ERR-HC-RS-002 | RESOLVED | First-run Repair Shop setup | Focused PR #1471 merged as `1aaf5f347d693e755d2b760887648067087eb9f4`. Current `tests/hermes-connect-repair-resilience.spec.ts` models the pre-profile `shop_profile_required` response, requires the profile next-step cue to stay visible, verifies required name/city/state clear the Save attention state even when optional phone/address/ZIP remain empty, and advances to the first-service step after save. A later exact-head #1699 full browser matrix passed all four shards on code that contains this regression. | Preserve the first-run resilience contract and reopen only from a newer current-head/product regression. | Do not recreate the already-merged first-run fix, call a manager-prepared login an owner-verified shop, or connect it to an unclaimed public listing automatically. |
| ERR-HC-RS-003 | OWNER_ACTION | Prospect access and publication | Manager-prepared CRM, manager call sheet, unclaimed Catalog card, and client outreach are distinct states. Source email can be missing or belong to a different business. Meta cards save links but do not synchronize content. | Team signs into each manager-prepared demo and verifies services, hours and identity; obtain correct contacts on held leads. Enable Meta OAuth, read permission and an approved failure notification channel before claiming automated sync. Client email awaits an explicit team go-ahead. | Do not describe a catalog entry or spreadsheet email as a verified CRM login, invent social sync, send prospect mail before QA, or portray a prospect as a customer. |
| ERR-HC-SOC-001 | OWNER_ACTION | Hermes Connect business social connectors | The feature is no longer in review: PR #1564 merged as `662370ca38f6b8cc562859b6da607d494ac3a545`. Current code contains the shared owner-scoped Facebook Page / Instagram Professional / Threads adapter, encrypted provider state, OAuth/readback, account selection and bounded publish-now flows. Current PR #1700 exact-head social connector contract workflows are also green, confirming the contracts remain intact on later main-based code. The remaining work is provider/account activation, not another connector implementation. | Configure/verify private Meta/social runtime values, then the owner authorizes the exact intended business accounts; confirm provider identity/readback and run only bounded canaries before calling any account connected. | Do not rewrite the merged connectors, commit tokens, claim an account is connected before OAuth/readback, run browser password automation, create a second scheduler/publisher, or treat a canary/social engagement as a lead or revenue. |

## Launch/compliance gates — valid but not daily SEO blockers

| ID | Status | Area | Trigger | Current source of truth |
| --- | --- | --- | --- | --- |
| ERR-GATE-001 | OWNER_ACTION | Carrier agreement e-signature | Final production execution/signature release | Qualified Wisconsin transportation counsel + final owner/business approval + approved execution/provider/audit safeguards required. |
| ERR-GATE-002 | WATCH | Payment/refund/recurring billing | First real checkout, paid offer, subscription or renewal flow | #319 — no fictional payment policy should be published before the actual offer/process exists. |
| ERR-GATE-003 | WATCH | International/state compliance | New market/state/data-flow requirement or production legal verification | #321. |
| ERR-GATE-004 | WATCH | Advertising/vendor technology | Meta Pixel, Ads remarketing, new analytics vendor, international processor or similar activation | #324. |
| ERR-GATE-005 | WATCH | Media/asset provenance | New or existing photo/video/icon/downloadable/client media whose publication rights are not documented | #320. Font binary provenance is already completed via PR #333. |
| ERR-GATE-006 | ACTIVE | Android APK distribution | Any direct APK binary or download claim | #511 — the stale debug-signed binary was retired. Rebuild from the canonical runtime, use a controlled release key, record artifact/certificate checksums, and pass clean-device install/launch/core-flow smoke before restoring distribution. |
| ERR-AI-ROUTE-001 | OWNER_ACTION | Hermes AI resilient route | Repository/runtime documentation already records `openai/gpt-5.6-terra` as the active routed model and `openai/gpt-5.4-mini` as the authenticated fallback; NVIDIA is explicitly not an active fallback because a missing key is a configuration failure, not resilience evidence. No current repository code defect is identified. The remaining proof requires an authorized live local/provider session with two real authenticated providers and a controlled retryable primary failure. | Run that bounded fallback proof only in the authorized Hermes runtime, retain sanitized local/FCC evidence, and promote resilience status only if the second provider actually completes the request. | Do not add an unauthenticated provider, treat a missing key as fallback proof, expose provider credentials, or rerun broad AI benchmarks to close this gate. |

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
| ERR-RES-020 | RESOLVED | iOS Safari performance | iOS Safari rendering of backdrop-blur was slow and lagged severely (10-15 FPS) during scrolling and animations. | Added -webkit-backdrop-filter prefixes and GPU transform translate3d triggers to the canonical workspace.css, workspace-enhancements.css, styles.css, the shared responsive workspace, and sales-roleplay.html. |
| ERR-RES-021 | RESOLVED | Public UX friction | Consent controls could cover mobile conversion actions, the Logistics desktop title could enter the image column, the mobile Hermes Connect product family had no visible overflow cue, and its canonical desktop demo toolbar overflowed the viewport by 8px. | Compact consent and static post-choice settings preserve the CTA; the Logistics title stays in its text column; Connect navigation exposes scroll affordance and snap behavior; the canonical demo toolbar wraps inside the viewport. Focused desktop/mobile browser contracts protect all four boundaries. |
| ERR-RES-022 | RESOLVED | Mobile homepage hero test | The homepage visual-scene contract sometimes read lazy mobile room backgrounds before the IntersectionObserver had activated them, producing intermittent `backgroundImage: none` failures even though the intended deferred loading worked. | The browser contract now scrolls each room into view and waits for its `data-image-ready` receipt before checking the computed background. The focused mobile scenario passed 10/10 parallel repetitions after the correction without disabling lazy loading or weakening the four-image requirement. |
| ERR-RES-023 | RESOLVED | Hermes AI benchmark CI portability | The benchmark scope-contract fixture used one developer's absolute repository path, so it passed locally but classified that path as external on GitHub Actions. | The fixture now constructs an in-repository path from the active checkout root; the outside-repository and symlink rejection coverage remains intact. Full current-head CI is required to confirm the repair. |
| ERR-RES-025 | RESOLVED | Hermes AI benchmark Linux evidence scope | The benchmark classifier recognized a limited set of macOS-oriented absolute path roots, so an external Linux `/home/...` read could evade `outsideRepositoryReadCount` and falsely appear eligible for comparison. | The classifier now conservatively recognizes macOS and Linux home/system roots, and a `/home/runner/.codex/...` regression fixture requires review. A live run exposed the condition but was correctly quarantined because its transcript contained other forbidden external-path evidence. |
| ERR-RES-026 | RESOLVED | Production contact smoke freshness | The production lead monitor still looked for retired homepage copy, so a current healthy deployment could never reach the synthetic receiver and duplicate-suppression steps. | Align the production marker with the canonical homepage contact component, trigger the smoke when either monitored component changes, and enforce the source-to-workflow relationship with a static contract test. |
| ERR-GATE-005 | NEEDS_OWNER_PROVENANCE | Public material media | Six public JPEG visuals have verified repository history and SHA-256 identities but no recovered original creator, generator/vendor, source URL or publication-permission record. | Preserve current use without inferring a legal defect; CI blocks byte changes, unregistered assets and expanded reuse until owner evidence or a documented replacement is supplied. |


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
| ERR-SUP-013 | SUPERSEDED | PR #509 Brand Funnel Unification | The open branch was 87 commits behind current `main` and would restore the retired Brand V1/mobile/V2 trees while removing later Repair Shop, carrier-contract, Android, canonical Connect and production-smoke work. | PR closed on 2026-08-15. Use merged PRs #529, #532-#548 and the canonical `public/demos/hermes-connect/` runtime; never merge or revive #509 wholesale. |

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


## 2026-09-12 — Load Board source setup release reconciliation

PROBLEM: PR #1252 built successfully but Website checks #4608 failed static validation.
ROOT_CAUSE: The private source-setup route was added without its release-manifest delta (310 generated routes versus 309 declared).
FAILED_APPROACH: Expanding product code before reconciling the complete release inventory.
WORKING_APPROACH: Declare the existing source-setup route in a separate noindex delta; preserve the access-funnel delta and every existing indexability guard.
EVIDENCE: GitHub Actions run 34686669424, job 103534737278; the focused curtain contract and static suite passed locally before the additional scoped runtime fixes; final-head CI remains required.
LESSON: A new private route still needs release inventory, not a sitemap entry.
REUSE_RULE: Reconcile route, canonical, robots and manifest together; do not disable the manifest test.


## 2026-09-14 — Catalog promotion draft accessibility

PROBLEM: The unreleased promotional-rail draft auto-rotated with only hover/focus suspension and 8px dot targets.
ROOT_CAUSE: A visually small carousel was treated as decoration rather than an interactive reading/navigation surface.
FAILED_APPROACH: Resuming rotation on focus-out and using reduced-motion alone as the pause mechanism.
WORKING_APPROACH: Provide explicit persistent pause, stop on keyboard focus until an explicit restart, use 44px controls, honor reduced motion and document/viewport visibility, and expose all messages without JavaScript.
EVIDENCE: Focused Catalog/Academy/claim desktop-mobile run 38/38 PASS; separate controlled-clock check confirms the eight-second transition. Current full-suite/CI release checks remain required. No production incident is inferred from this pre-release draft finding.
LESSON: New marketing motion needs usable controls and truthful next-step links before release, not only animation.
REUSE_RULE: Reuse the shared HermesPromoRail behavior; preserve the owner-controlled pause and do not hide essential offers behind JavaScript-only rendering.


## 2026-09-21 — Exact-SHA rollout convergence and paid-intent scope transport

PROBLEM: The first post-merge Repair Shop booking smoke for main `66fff8c480583209b3756bce8b613dabddd10dd0` registered under the new free-setup policy, then received the retired `repair_shop_free_registration_ended` response from the profile endpoint. The post-deploy paid-intent verifier also failed before its production readback with `Argument list too long`.

ROOT_CAUSE: A successful exact-SHA Cloudflare Pages check can precede full custom-domain Functions convergence by a short interval. Separately, the paid-intent workflow copied the complete GitHub commit response into one process environment variable, exceeding the runner's argument/environment limit on a large merge commit.

FAILED_APPROACH: Treating the first green Pages check as immediate convergence for every Function, allowing the retired closed-registration result to count as a successful skip, and transporting unbounded commit JSON through `COMMIT_JSON`.

WORKING_APPROACH: Require the Cloudflare check's exact `head_sha` and deployment ID, retry only the retired 403 gate with bounded backoff, fail every other or persistent auth/commercial response, and keep synthetic cleanup active through an `EXIT` trap. Reduce commit metadata to filenames with `jq`, stream it over stdin to a bounded classifier, and fail safe to the full receiver proof when the list is invalid, missing, or at the GitHub pagination boundary.

EVIDENCE: Deployment workflow `35670092982` and Cloudflare check `106564786622` succeeded for the exact main SHA; deployment ID `8649342e-4685-45b4-8aca-9af942ce8975`. Booking run `35670092939` captured the rollout split, and paid-intent run `35670520086` captured the runner limit. The bounded repair branch passes focused retry/scope simulations, YAML and shell syntax, build, and full static tests. Exact-head PR CI and a later main production rerun remain required.

LESSON: Exact commit identity proves which release was accepted; it does not prove that every custom-domain edge has converged at the same instant. Production smoke must tolerate only a narrowly identified transient state and must never turn a persistent commercial/auth mismatch into success.

REUSE_RULE: Keep production payloads bounded before crossing environment or argv boundaries, make synthetic cleanup unconditional, and gate any rollout retry on an immutable exact-deployment receipt plus an explicit allowlisted transient error.


## 2026-09-22 — Internal AI approval transport contract

PROBLEM: The local runner detected a valid `HERMES_INTERNAL_APPROVAL_GATE` marker and selected `needs_approval`, but its completion payload omitted `approval_gate`; the server correctly rejected that state with `approval_gate_required`.

ROOT_CAUSE: Detection and persistence were covered by separate static assertions without an end-to-end contract test for the actual runner payload and D1 transition.

FAILED_APPROACH: Treating the presence of the marker parser and server validation as proof that the two sides agreed on the wire contract.

WORKING_APPROACH: Transport the allowlisted gate explicitly; persist `awaiting_approval`; require an exact-gate owner decision; keep waiting tasks unclaimable; issue a scoped persisted receipt for the same task/branch; make approve/cancel replay idempotent; and consume the receipt when another gate is reached.

EVIDENCE: Repository-only runner transport test plus an in-memory SQLite integration exercises missing/wrong gates, reload, pre-approval claim denial, exact approval, replay, approved claim, terminal audit retention, cancel replay and malformed continuation denial. Full current-head verification and exact-head CI remain required.

LESSON: A fail-closed approval boundary needs one executable state-machine test across producer payload, persistence, decision and consumer claim—not independent token checks.

REUSE_RULE: For every consequential workflow, test the complete transition `running → awaiting approval → exact scoped decision → approved continuation/terminal`, including reload and replay behavior.

FOLLOW-UP P1: The first cancellation helper selected a queued task, then chose a status-specific write. A runner claim between that read and write could move the task to `running`, make the queued-only update affect zero rows, and still produce a false success response with `cancel_requested=false`.

WORKING_APPROACH: Use one conditional write whose predicates are evaluated against the current database state: queued/awaiting tasks become terminal `cancelled`, while running tasks atomically receive `cancel_requested=1`. On zero changes, reload and return success only for a verified idempotent cancelled/cancel-requested state; otherwise fail closed. Emit the cancellation audit event only for the first state transition.

EVIDENCE: A deterministic SQLite interleave claims the queued task after the cancel read but before the cancel update, then proves the response and stored row are either terminal cancelled or running with `cancel_requested=true`. Running and terminal replays remain idempotent and create no duplicate audit event.

REUSE_RULE: A successful control-plane response must describe the post-write row, never the state inferred from a pre-write read. Cover claim/cancel and other state-machine races with deterministic interleaving tests.


## 2026-09-26 — Contact analytics promoted provider acceptance to final recipient delivery

PROBLEM: Production `contact_request_delivered` could fire after a 2xx duplicate or initial Email Service send acceptance without a terminal recipient-server delivery signal.

ROOT_CAUSE: The public Pages endpoint treats a successful private Email Worker `env.EMAIL.send()` call as successful handoff. Cloudflare distinguishes queued `Sent` from terminal `Delivered`, but the browser previously tracked either 2xx as delivered.

FAILED_APPROACH: Treating a matching request ID and `success:true` receipt alone as final delivery proof. That receipt proves an accepted handoff, and a duplicate response can acknowledge an earlier attempt without a new receiver outcome.

WORKING_APPROACH: Review-only #1500 validates the matching accepted receipt, acknowledges duplicates without a second event, describes the UI outcome as accepted for delivery, and suppresses `contact_request_delivered` unless a non-duplicate receipt explicitly has `delivery_status:delivered`. The current endpoint does not return that field, so the event fails closed.

EVIDENCE: Cloudflare Email Service lifecycle/logs separate `Sent` (accepted/queued) and `Delivered` (recipient server accepted); its `message.delivered` event subscription is the documented terminal signal. Production QA proved one actual inbox delivery and zero duplicate receiver emails, but that single example does not validate future accepted sends. Exact-head CI on #1500 is required after this change.

LESSON: A provider's synchronous send acceptance cannot name an analytics event after a later delivery state.

REUSE_RULE: Correlate provider message/terminal event to a private request ledger, dedupe on the private key, keep request ID/PII out of GA4, and emit delivered only after terminal receiver evidence and consent. Cloudflare live subscription setup and existing GA4 OAuth reconnect require owner action; never infer status from a generic 2xx.


## 2026-09-26 — Public GA4 tag inherited raw document URL/referrer

PROBLEM: The public-site Google tag config omitted page_location and page_referrer, so default GA4 page_view could inherit the full URL and document.referrer including query strings, despite contact_request_delivered passing only a route and UTM-presence boolean.

ROOT_CAUSE: The separate Hermes Connect analytics path had explicit route-only page_location, but the public TrackingConsent config still relied on default Google fields.

WORKING_APPROACH: Review-only #1500 explicitly supplies current origin plus pathname and referrer origin only before loading gtag. A browser test adds private sentinels in current and referring queries and asserts they do not enter the config. Do not treat a green source test as an authenticated GA4 payload/readback; keep GA4 OAuth/production network verification open.

REUSE_RULE: Review default SDK-collected page_location/referrer and campaign fields whenever promising that a custom event payload is privacy safe. A clean event object does not sanitize automatic page_view fields.

## 2026-09-27 — Repair Shop Services renders every service in one long list

PROBLEM: Authenticated Office QA shop had 147 services; the Services page displayed all 147 cards and Delete actions on one scroll. Search worked, but owners had to traverse an excessively long list.

ROOT_CAUSE: The renderer iterated over every fetched service without a visible limit. The private API returned the expected tenant-scoped catalog.

FAILED_APPROACH: Treating a readable individual card and a search field as proof that a 147-item list is manageable.

WORKING_APPROACH: Review branch `fix/repair-owner-service-availability-layout-20260927` limits the initial view to 20, loads 20 more on demand, searches the complete in-memory catalog, shows visible/total counts and no-match state, and surfaces newly added items. A 45-item browser mock covers paging and search.

EVIDENCE: 2026-09-27 authenticated production showed 147 items; locally build/static checks and exact-head CI are tracked in the PR. Production release and readback are pending.

LESSON: Evaluate owner screens against realistic high-volume tenants, not only two-item fixtures.

REUSE_RULE: When lists can grow substantially, test at least 40 items, search the whole collection, and ensure create/delete and empty states remain discoverable.

## 2026-09-27 — Dynamic Repair Shop Catalog profile had an isolated outdated presentation

PROBLEM: The public Kittle's Garage Catalog profile returned HTTP 200 with canonical and AutoRepair schema, but rendered through a compact dynamic template separate from the fuller Catalog profiles. Its most prominent internal block discussed SEO reporting dates and timelines, while the actual owner claim/correction route was not directly available.

ROOT_CAUSE: `functions/businesses/connect/repair-shop/[slug].ts` had an old single-line page template; later static Catalog design and the structured claim request form did not update this dynamic route.

FAILED_APPROACH: Counting an indexable URL and JSON-LD as a finished, easy-to-use business page.

WORKING_APPROACH: Keep the existing database-backed profile, schema, URL, and owner publication toggle. Render a responsive light business page with clear owner-review status, factual service/hour sections, listed website, a structured claim/correction handoff, and a separate growth request. Remove promised SEO reporting dates and make indexing/outcomes explicitly unverified. Add a route-level mock proving escaped business data, safe public fields, CTA routes, canonical and no-index behavior for invalid profiles.

EVIDENCE: Production baseline returned 200 with self-canonical on 2026-09-27. Local build, full static tests and the route-level test passed on the review branch. Browser/CI and exact-production readback remain separate release gates.

LESSON: A technically indexable profile can still leave both visitor and business owner without the right next action.

REUSE_RULE: For any public business page, test one real user action and the owner correction path alongside canonical/schema. Do not turn draft growth operations into a customer-facing ranking promise.

## 2026-09-27 — Repair Shop offered a customer booking link before a bookable service and hours existed

PROBLEM: A saved shop profile immediately exposed customer-facing Copy/Share actions in both the dashboard and the workspace share bar. Seven prospect CRM profiles have no saved services or open hours, so these buttons suggested sending an unusable link.

ROOT_CAUSE: Link presentation was tied to the presence of a shop slug; it did not check service and weekly availability records even though the activation tracker checked them separately. Subsequent audit found the same slug-only exposure in Appointments calendar and Company settings.

WORKING_APPROACH: On review branch `fix/repair-booking-share-readiness-20260927`, leave an internal preview link visible, but disable or omit Copy/Share/QR export until the saved name/location, at least one saved service and one open day with valid times are read successfully. Reuse that verified readiness for the Appointments and Company share controls, with closed defaults before async results and on read failures. Update the state when a service is created/deleted in either the dashboard or Services page, or availability is saved. A browser regression covers the incomplete, completed and read-error paths.

EVIDENCE: 2026-09-27 production public HOLT Tulsa profile explicitly says booking is off pending owner verification; private CRM technical QA found zero saved services and open days. Local build and static suite passed. Local Playwright did not start because the preview process exited before accepting connections. A first full CI run exposed a brittle ready-state test that expected a literal `aria-disabled="false"` even when a second script legitimately removed the attribute from an active booking link; the assertion now checks the usable destination. Exact-head CI and production readback remain release gates.

REUSE_RULE: A generated URL is a preview artifact, not proof the downstream action works. Enable customer-sharing controls only after the required underlying records have been read successfully.

## 2026-09-27 — Ready shop still had closed share controls in Company and Appointments

PROBLEM: Post-release browser readback on a configured synthetic shop found the workspace share bar ready, but Company Copy disabled and the Appointments share card hidden. Incomplete-shop controls correctly remained closed.

ROOT_CAUSE: Those screens depended on reading a transient JavaScript global at their own initialization. The exact cause of the production mismatch is not yet proven; relying only on that global left no fallback when the readiness event had already fired or a page loaded asynchronously.

WORKING_APPROACH: Consume the readiness event's explicit `{slug, ready}` payload, and use the same verified share bar's DOM state as a fallback if the event preceded the screen's initialization. Compare the bar slug to the local shop before enabling controls. Keep the service/hour/profile checks in one owner bar.

EVIDENCE: Authenticated production Office synthetic shop had 147 services and `data-ready=true` in the share bar, while Company Copy stayed disabled and Appointments share stayed hidden. Separate exact-head CI and post-deploy browser check are pending.

REUSE_RULE: After shipping a shared readiness signal, verify every consumer in a real authenticated session. A passing mocked browser test does not prove cross-script timing in production.

FOLLOW_UP: PR #1516 passed exact-head CI and the approved-main deployment workflow reported the exact commit live. Browser comparison then found the compiled Company script had the same content-addressed `_astro` URL as the #1516 preview, while the unversioned `/repair-shop-activation.js` still rendered a share bar without the new `data-shop-slug`. This is evidence of a stale unversioned public asset in that browser path; it does not prove whether browser or edge cache retained it. Version the changed public script URLs in the rendered HTML, then recheck authenticated production. Bump those query versions whenever the scripts change.

## 2026-09-28 — Prospect access email bypassed the manager handoff gate

PROBLEM: The first Repair Shop prospect received an invitation and a separate password email on September 24 while the manager's fact/booking QA, call, client-email approval and handoff timestamps were unrecorded. The private working Sheet still showed its client-email-sent cell blank until September 28. There was no client reply in the company mailbox as of that reconciliation.

ROOT_CAUSE: Technical account readiness and customer outreach were treated as the same milestone. The send path did not reconcile the manager QA/approval cells or check Sent mail against the working Sheet before reporting progress.

FAILED_APPROACH: Inferring that a verified login, populated services/hours and a published Catalog profile authorize a customer email or prove the owner reviewed the facts. Leaving an actual send unrecorded made another send look eligible.

WORKING_APPROACH: Reconcile the two sent-message receipts into the private Sheet (`CRM ACCESS — DEMOS`, row 2, columns C/I/P/R) with their actual Central Time and keep manager QA/approval blank. The public profile and claim/correction form were checked in production; this proves the page path, not owner consent or first booking. Assign the manager a single next action: confirm owner identity and reception, review services/hours/address, traverse the booking flow, and record the call/outcome. Suppress duplicate client mail until an explicit manager-approved follow-up is recorded.

EVIDENCE: Corporate Gmail Sent has two messages to the prospect at 2026-09-24 03:48 CT; a September 28 search found no reply from the prospect. The private Sheet readback confirms the send timestamp, manager QA still pending, and no approval inferred. Production Catalog page displays 18 services, seven-day hours, a truthful owner-review status and a prefilled claim/correction form. This evidence does not establish delivery to the inbox, account use, booking, or a qualified lead.

LESSON: A code release, a ready demo and a customer relationship are three different claims. A send receipt is an outreach event that must be reconciled into the canonical operating row even when it violated the intended sequence.

REUSE_RULE: Before any client access email, read the manager row and Sent history for that exact prospect. Require completed manager fact/booking QA, a recorded handoff and call, explicit send approval, and the agreed following-day timing. After send, record the actual message/time and monitor a real reply or call outcome. If an earlier send already exists, reconcile it and avoid a duplicate; never backfill an approval that is not evidenced.
## 2026-09-28 — Prospect registration blocked at Cloudflare before Repair Shop API

PROBLEM: An authorized attempt to provision the first interested Arkansas Repair Shop prospect from the current execution workspace received HTTP 403 from Cloudflare before the production registration handler responded. The second prospect was not attempted from the same blocked environment.

ROOT_CAUSE: The edge refusal is confirmed; the exact Cloudflare rule and whether either email already has a preexisting account are unknown without authorized operator access. The API contract alone cannot prove production account creation or login.

FAILED_APPROACH: Treating a manager spreadsheet row or generated password as evidence of a live CRM account. Retrying the blocked registration through alternative routes would bypass the edge decision and is not an authorized recovery path.

WORKING_APPROACH: Record both prospects as login-unverified in the private working Sheet, with distinct evidence for the attempted and unattempted registrations. Do not write fake credentials, announce client-ready access, or send client messages. Prepare public-source unclaimed Catalog profiles separately. Production operator should review the Cloudflare event and use the approved provisioning flow; verify login, profile, services, availability, booking and manager QA before delivery.

EVIDENCE: 2026-09-28 structured Cloudflare HTTP 403 on the first production registration request; malformed-email request returned an application 400, showing that the endpoint exists. No success response, account ID, profile or verified login was obtained. Catalog change is review-only until exact-head release and production readback.

LESSON: Prospect identified, public listing prepared, API reachable, account registered, and account tested are separate facts.

REUSE_RULE: Never populate login/password cells based on intent or source code. Require production success evidence and a repeat authenticated login before manager handoff. Preserve the specific HTTP edge category and attempt scope so a future operator can resolve the rule without guessing.


## 2026-09-28 — Resolution — Cloudflare 403 was not the durable provisioning blocker

STATUS: RESOLVED FOR THE THREE ARKANSAS PROSPECTS.

RESOLUTION: The earlier direct signup attempt from the execution workspace did receive a real Cloudflare 403, but that edge refusal did not prove the production application or the customer emails were unusable. The approved live browser registration flow subsequently created Shop Owner accounts for Smart Bubble Mobile Auto/Body Repair Shop, Clendenin's Auto Repair, and The Dapper Wrench and saved their profiles, services, and hours.

CORRECTED_ROOT_CAUSE: The confirmed failure was path/environment-specific edge rejection of that direct request. Treating it as a company/account blocker was too broad. Production state must be established by the approved user-facing flow and a fresh authenticated readback, not by one blocked automation request.

PREVENTION: Record transport/edge failure and account state separately. A 403 on one provisioning path must not be upgraded to "account cannot be created." Conversely, successful registration is not complete until a new session can sign in and read back the expected company, services, hours, and share/booking route. Do not publish credentials in GitHub or public Catalog data.


## 2026-09-30 — Approved Home visual mismatch and inherited responsive menu cascade

PROBLEM: Main #1574 showed a system-ring scene rather than the later owner-approved pearl architectural image. Initial task5 QA found a 1024px menu button controlling a nav hidden by inherited desktop CSS; raster source contact labels ghosted behind native copy and inherited footer white text lost contrast.
ROOT_CAUSE: Superseded visual target and layered legacy Home/shared CSS. Existing production contact smoke depended on retired wording; global reduced-motion timing overrode a local declaration.
FAILED_APPROACH: Treating prose or a green prior visual head as fidelity proof; starting a browser capture against rebuilding output.
WORKING_APPROACH: Materialize and inspect exact approved pixels; reuse handed-off PR1577; real HTML text/actions over decorative approved artwork windows; opaque duplicate-label masks, native OFL quill font, scoped pearl footer and open-menu breakpoint, hook-based production marker and explicit static reduced-motion overrides. Single 216,880-byte WebP rather than shipping the 1.94MB source PNG.
EVIDENCE: Fresh base main 9f71a9ff, idle-owner handoff at fa191201, viewed 390/430/768/1024/1440 screenshots and local build/full static suite. Exact final CI and production release status must be read from PR1577; no LIVE claim in this preparation entry.
LESSON: Visual approval, semantic usability, responsive cascade and production evidence are distinct checks.
REUSE_RULE: Preserve native links/text and shared service functionality; inspect the actual final screenshot at every navigation breakpoint. Update copy-dependent monitors to existing semantic hooks when visual copy changes.

## 2026-09-30 — Home history browser harness frame starvation
STATUS: Root cause evidenced; verification pending.
EVIDENCE: exact-head CI 8753035f / Website run36743152348: returned Home visible=true, focused=true, rAF callback absent after 1s; menu geometry unchanged x315/y18.1875/44x44 with zero animations, repeated identically. Normal locator click and screenshot both wait on absent frames. Parent headed cloud-browser menu→Connect→Back pointer flow passed.
WORKING_APPROACH: Preserve the full native pointer flow with explicit visible/enabled checks, two equal bounding boxes, in-viewport center and elementFromPoint hit-target assertion before page.mouse.click; retain aria-expanded/menu visibility and actual sign-in URL/Back checks. No forced click, skipped case, increased timeout, product workaround, or local Chromium launch bypass.

## 2026-09-30 — Approved Home light footer / contact group accessibility
STATUS: bounded fixes implemented; final exact-head verification required.
EVIDENCE: 3097d25d Website checks passed 1,741 browser cases/12 existing skips; quality audit36744479204 passed advisory workflow, ZAP0 failures/13 warning classes/54 passes; Home Pa11y count36 versus87 on original handed-off PR. Audit explicitly identified new contact div aria-label without permitted group role and inherited pale-green status text on the new light footer.
WORKING_APPROACH: Add role=group to the already-named native contact actions; scope darker green status foreground to Home footer only. Keep shared service themes, account/product truth and other-route accessibility remediation untouched. No WCAG-clean claim or audit gate changes.


## 2026-09-30 — Home raster resolution ceiling / bounded motion preview
STATUS: Small preview implemented, browser/visual exact-head verification pending.
PROBLEM: Owner likes live layout but requests clearer first-page imagery and subtle truck/leaf motion.
ROOT_CAUSE:1111x1416 source gives267px per portal, below desktop/Retina display demand; compression is a secondary limit.
FAILED_APPROACH: No repeated generation, fake resolution upscale, heavy autoplay or browser-launch bypass attempted.
WORKING_APPROACH: Source-preserving quality93 WebP283474B; reuse masked actual truck/leaves, one6s compositor animation paused offscreen/hidden and canceled for reduced motion.
EVIDENCE: Local metadata/source pixels viewed; build388 pages and full static suite pass. Browser results and screenshot/preview fidelity pending exact-head CI.
LESSON/REUSE_RULE: Check native source dimensions before attributing blur to CSS or compression. Bound decorative animation time, visibility, motion preferences and transfer budget independently.

## 2026-10-01 — Home nested-letter semantics and decorative crop
STATUS: Heading issue fixed on PR1590 head e265c252; decorative crop refinement pending preview QA.
PROBLEM: Wrapping the i in “directions” for a short hop preserved visible text but inserted spaces into its computed accessible name. A separate build check also searched the serialized HTML for a contiguous word, despite already checking the exact rendered h1. Initial marketing cards covered approved art copy; Academy shelf overlays looked like artificial columns.
ROOT_CAUSE: Inline visual markup affects accessible-name spacing; screenshot review at the final crop is needed for any decorative layer over generated art.
WORKING_APPROACH: Explicitly preserve the h1 accessible name “Four directions.” and retain the exact rendered-heading build gate; remove only its redundant raw-markup substring check. Capture individual hover portals under the artifact transfer limit, then refine decorative geometry from actual pixels.
EVIDENCE: PR1590 first Website run 36854008608 failed the heading assertions; corrected head e265c252 Website 36854981058 passed, visual run 36854981146 passed with artifact 11158726272, and viewed desktop/mobile frames showed the crop issue. New visual adjustment requires its own current-head verification.
LESSON/REUSE_RULE: Test computed accessible names after animating a single letter. Keep public headline text and contract checks semantic. Inspect hover and mobile pixels before accepting overlays; animation state alone does not establish visual quality.

## 2026-10-03 — `http-cache-semantics` max-stale shared-cache disclosure gate

PROBLEM: The required dependency audit blocked PR #1649 because `http-cache-semantics@4.2.0` is affected by GHSA-ch52-4w7c-c8xp / CVE-2026-93748. An attacker-controlled `Cache-Control: max-stale` request could make a shared cache reuse a response that must be revalidated, including responses with private `Set-Cookie`, `no-cache`, or `proxy-revalidate` semantics.

ROOT_CAUSE: The package's `evaluateRequest()` stale-response branch honored request `max-stale` without rechecking whether the stored response was safe to reuse in a shared cache. The official npm registry still exposes 4.2.0 as latest and the advisory has no patched upstream version as of 2026-10-03.

FAILED_APPROACH: Waiting for an unavailable upstream release, suppressing the advisory, or weakening the repository's high-severity audit gate would leave the vulnerable code reachable and turn a release check green without fixing the behavior. A direct file override without a declared root dependency also produced an invalid nested lockfile.

WORKING_APPROACH: Vendor the exact BSD-2-Clause-licensed 4.2.0 source as `4.2.1-hermes.0`, add a narrow response-side guard before honoring `max-stale`, and pin every transitive consumer through the root dependency plus npm `$http-cache-semantics` override. Keep legitimate stale reuse for explicitly public cacheable responses. Add a regression test covering private cookies, `no-cache`, `proxy-revalidate`, and a permitted public stale response.

EVIDENCE: Fresh `npm ci --ignore-scripts` and `node scripts/dependency-audit-report.mjs` report zero known vulnerabilities; the new regression test, `npm run build`, and the full static `npm test` pass. A local monolithic Playwright run exposed pre-existing Home/Connect branch drift and was stopped after 538 passes rather than changing the separately owned Home design; exact-head GitHub browser shards remain the release gate.

LESSON: A dependency audit exception is not a security fix. When no upstream release exists, preserve license/provenance, patch the smallest reachable behavior, force one dependency instance, and prove both the blocked exploit behavior and the legitimate behavior that must remain.

REUSE_RULE: Do not remove this vendored override until an official `http-cache-semantics` release excludes GHSA-ch52-4w7c-c8xp and passes the repository regression. Replace the vendor only through a reviewed lockfile change with the same test retained.

## 2026-10-03 — International Catalog pages had no visible parent-to-child navigation

PROBLEM: Google URL Inspection reported `/businesses/ukraine/`, `/businesses/ukraine/chaiky/`, and `/businesses/ukraine/irpin/` as unknown with no crawl or referring URLs, even though each page returned HTTP 200, was self-canonical, indexable, and present in the sitemap.

ROOT_CAUSE: The Catalog root linked directly to individual international profiles but skipped the country hub. The Ukraine hub listed profiles but did not expose the Chaiky and Irpin locality hubs. Locality pages rendered a generic back link to the root instead of a visible link to the Ukraine parent.

WORKING_APPROACH: Preserve the existing URLs, profile facts, sitemap and secondary-market boundary. Add one generated country link on the Catalog root, generated locality links on the country hub, and a parent-country link on each locality hub. Derive every link from the existing route registry and breadcrumb data so new supported countries/localities inherit the same hierarchy.

EVIDENCE: Fresh build produces 392 pages. The Catalog publication contract reads the generated HTML and proves the exact chain `/businesses/` → `/businesses/ukraine/` → `/businesses/ukraine/chaiky/` and `/businesses/ukraine/irpin/`, plus both locality pages back to Ukraine. Full static tests pass. GitHub exact-head checks, authorized release, production anchor readback and a later dated URL Inspection remain separate gates.

REUSE_RULE: For every new indexable Catalog country or locality, require a visible two-way hierarchy in rendered HTML. Sitemap membership and direct profile links do not replace parent-to-child discovery.

FOLLOW_UP: The first exact-head GitHub contracts job found a stale workflow-only assertion expecting the retired repair-only Catalog filter. Updated the assertion to verify the current explicit Repair branch plus bounded Ukraine Academy classification, and added that contract to ordinary `npm test` so local validation and CI cannot drift again. No runtime code changed for this follow-up.

## 2026-10-04 — Connect hostname routed `/robots.txt` into a missing demo asset

STATUS: RESOLVED / PRODUCTION VERIFIED.

PRODUCTION_RECEIPT: PR #1677 merged as `03336816fa1f431ba52062eba10d0e58d4c40694`. The later approved-main Cloudflare Pages release run `37441992508` completed successfully, including the `Verify Connect custom subdomain` gate. That verifier includes the Connect `/robots.txt` crawl-control checks described below, so the old pre-release 404 state is superseded.

PROBLEM: A fresh remote-Mac series returned 20/20 HTTP 200 responses for the apex `/robots.txt`, while `https://connect.hermeslogisticsus.com/robots.txt` returned 20/20 HTTP 404 responses.

ROOT_CAUSE: `connectAssetPath()` treated every unlisted Connect path as a demo-relative asset and rewrote `/robots.txt` to `/demos/hermes-connect/robots.txt`. The repository already owns the correct public crawl-control file at `/robots.txt`.

WORKING_APPROACH: Route only the Connect `/robots.txt` request to the existing root public asset. Preserve all existing Connect compatibility redirects, PWA/demo/API routing, HSTS handling, and apex behavior. A regression test first reproduced the wrong asset pathname, then passed after the bounded routing change.

EVIDENCE: Focused test failed before the implementation with actual `/demos/hermes-connect/robots.txt` versus expected `/robots.txt`, then passed. `npm run build` and the complete `npm test` suite pass. Full Playwright is not locally accepted: Astro 7.2.8 first auto-backgrounded preview in the detected agent environment; with `ASTRO_PREVIEW_BACKGROUND=0`, Playwright reached test launch but the required Chromium 1228 binary was absent. Its official download returned a zero-byte/truncated archive in this execution environment. Exact-head CI remains required before merge or deploy.

FOLLOW_UP: The existing post-merge Connect production verifier previously accepted the approved Web App without checking hostname-root crawl control. It now samples `/robots.txt` alongside the page, applies the same 80% quorum, and fails the `approved_web_app` release gate unless the exact Connect URL returns HTTP 200 `text/plain` with wildcard `User-agent` and the canonical sitemap declaration. The classifier and exit decision were added test-first. A fresh remote-Mac pre-release baseline still showed apex robots 6/6 HTTP 200 and Connect robots 6/6 HTTP 404, proving the new gate detects the unreleased state rather than converting it into a false live claim.

REUSE_RULE: Crawl-control and other hostname-root assets need explicit middleware contracts for every owned hostname. Verify apex and subdomain paths independently in production; apex success does not establish Connect success.


## 2026-10-05 — KNB client Catalog work was noindex despite the organic objective

STATUS: RESOLVED / PRODUCTION VERIFIED.

PRODUCTION_RECEIPT: PR #1681 merged as `8981b1c9db19321739352ccbb3f02c7a75d8be6e`. A targeted live fetch on 2026-10-06 with cache tolerance `ttl=0` returned `/businesses/ukraine/bila-tserkva/kons-na-bis/` as publicly reachable content with self-canonical metadata and `robots: index,follow,max-image-preview:large`. The detailed KNB strategy/evidence workspace remains a separate noindex surface, so the canonical Catalog entity/profile owns organic discovery without turning private/internal strategy into the search owner.

PROBLEM: The recovered «Конс на Бі$» marketing assessment, Academy CRM demo, and client strategy page existed, but the client-specific strategy page was intentionally `noindex,nofollow` and the KNB entity/product did not have an indexable Catalog profile in the business-directory sitemap. The generic Marketing Growth Audit example was indexable, so the reusable Hermes methodology could rank while the actual client/product discovery objective remained incomplete.

ROOT_CAUSE: The initial safety boundary correctly kept an unapproved client strategy concept out of search, but the follow-up step was never completed: create a separate source-bounded public Catalog entity/profile that can be indexed without presenting Hermes' internal strategy, demo KPI, or unapproved claims as the client's official site.

WORKING_APPROACH: Keep the detailed marketing assessment and CRM demo noindex. Add KNB to the existing international Catalog registry as a verified client workstream, generate the visible Hermes Catalog → Ukraine → Bila Tserkva → KNB hierarchy, expose only official/public entity facts and a direct official link to the seven-week «Стратегія керованого зростання у бізнесі» program, add sitemap membership and Course/EducationalOrganization semantics, and leave price, cohort dates, schedules, result claims, and final presentation approval explicitly evidence-gated.

EVIDENCE: PR #1681 branch `feat/catalog-knb-organic-profile-20261005`. Initial exact-head CI correctly failed because the shared Hermes Connect vertical preview did not yet support the new `business_academy` enum; commit `0adbb70654145dafab0b87a2d741f1be94555e74` adds the missing vertical mapping rather than suppressing Astro type checks. The next exact-head CI remains the release gate.

LESSON: A noindex strategy/demo is not an organic Catalog deliverable. Privacy/approval-safe review surfaces and search-owned public entity pages are separate artifacts with different evidence boundaries.

REUSE_RULE: For a client Catalog task whose goal includes organic discovery, require a distinct indexable source-bounded owner/entity page with visible parent-child internal links, sitemap ownership, verified public facts, explicit official-source links, and regression tests. Keep internal audits, CRM demos, candidate assessments, private metrics, and unapproved strategy noindex.


## 2026-10-05 — KNB marketing case incorrectly treated funnel/offer as the next social step

STATUS: RESOLVED / PRODUCTION VERIFIED.

PRODUCTION_RECEIPT: The same 2026-10-06 `ttl=0` live readback of the canonical KNB Catalog owner renders the corrected sequence `Audit → Organic Programming → Stable Organic Baseline → Controlled Paid Learning → Signal Gate → Offer hypothesis → Funnel + CRM attribution`, and explicitly keeps public observations separate from internal analytics. No paid-first or public-data-as-validated-offer behavior remains on the live canonical owner.

PROBLEM: The recovered KNB candidate brief asked for a social audit plus a funnel/offer. Earlier Hermes strategy surfaces answered the request literally and promoted an offer-first path. That was not evidence-safe: a public profile cannot expose complete Meta reach, engagement, retention, audience quality, paid/organic split, ad-learning state, CAC, or downstream CRM sales.

ROOT_CAUSE: The assignment text was treated as the execution sequence instead of as a test of strategic judgment. The missing gate was whether the candidate would identify that a validated social offer is impossible before owner analytics, organic programming, a stable baseline, and controlled paid learning.

WORKING_APPROACH: Preserve the original KNB assignment wording, but score the reasoning differently. Canonical sequence is public/internal audit → organic programming → stable organic baseline → controlled paid learning on repeatable organic winners → signal gate → offer hypothesis → CRM attribution → consultation/sale → delivery/outcome. The four-column training method is also canonical: leave column 1 blank; fill 2 Awareness, 3 Understanding, 4 Application; then return to 1 and write leading questions so content follows Question → Awareness → Understanding → Application.

CATALOG_REUSE: Business Catalog profiles can expose a source-bounded Digital Audit layer with channel icons/cards (Website, Google where known, Instagram, Facebook, Threads, TikTok, YouTube, Telegram). Each card must distinguish observed public facts, private-analytics requirements, and the recommended next step. Do not create thin per-channel doorway pages: keep the channel audit on the canonical business profile and link to one reusable Hermes marketing-audit methodology page plus a full-audit CTA.

REUSE_RULE: Audit ≠ Funnel. Never convert public social observations into a validated offer, shadowban/bot claim, CAC/ROMI conclusion, or paid-media recommendation. Internal analytics and evidence gates determine when paid learning and offer tests are allowed.


## 2026-10-05 — Shared Catalog route normalized repair-only data before the route-kind gate

STATUS: RESOLVED / PRODUCTION VERIFIED.

PRODUCTION_RECEIPT: PR #1681 is merged and the same current production Catalog route family successfully renders the international KNB concept owner on the shared `/businesses/[state]/[city]/[slug]` path. The production page returning structured concept content without the prior `sources.flatMap` prerender failure is live evidence that the route-kind guard is active on the released shared route. Preserve the discriminator-before-shape-specific-read regression.

PROBLEM: After adding Digital Health to US static repair/dealer profiles, the shared `/businesses/[state]/[city]/[slug]` prerender failed on an international concept route with `Cannot read properties of undefined (reading 'flatMap')`.

ROOT_CAUSE: The file serves a union of `repair | concept` route props. A repair-specific normalization object called `business.sources.flatMap(...)` before the render branch checked `kind`. International concept businesses use a different evidence model and do not expose the repair-directory `sources` array.

FAILED_APPROACH: Relying on the later JSX branch to protect type-specific preprocessing. Top-level Astro preprocessing runs before the conditional renderer, so data access must be gated before it executes.

WORKING_APPROACH: Gate both repair-only website/source normalization and `sources.flatMap` with `kind === "repair"`; concept routes receive an empty normalized repair channel list and continue through their dedicated `CatalogConceptRoute` renderer. Add a regression contract that requires the route-kind guard.

EVIDENCE: Exact-head visual-evidence build for commit `a598e5e244849085289886f3bc0ae81d27f5a1cc` failed during prerender of `/businesses/ukraine/chaiky/chayka-store`. Commit `36c76fc1ecc94cea0a4c02d604e24dec6f95b630` gates repair normalization by route kind; commit `2f5ec2fe0413b20d64983b30349f3d359850599d` adds the regression guard.

LESSON: A conditional renderer does not protect top-level preprocessing in a union route.

REUSE_RULE: For any shared Astro/SSR route with multiple prop shapes, perform the discriminator check before reading shape-specific arrays, objects, or methods. Regression tests should assert the discriminator is part of the normalization contract, not only the final render branch.

## Existing Connect registration-language correction — 2026-10-06

- ID: ERR-HC-AUTH-LANGUAGE-20261006
- Status: IN_REVIEW, not production verified
- Owner: dot, current owner-directed registration correction
- Problem/root cause: Access and both Academy auth pages treated omitted `lang=en` as Ukrainian, conflicting with the shared Connect shell and duplicating its language control; business auth additionally rewrote header language links.
- Correction: explicit EN/UK choice, saved choice, then English; use the existing header control only and limit page-owned link rewriting to content.
- Evidence: `scripts/connect-auth-language-regression.test.mjs` executes actual page initializers and the chrome adapter; 15 failures before language correction, now 27/27 checks including preserved CTA icon and route-local document-transition opt-out. Build and full `npm test` pass on 6 October 12:22 UTC. In `cb78b27` CI, the mobile hit stack placed HTML above the visible menu; rAF callbacks previously stalled after navigation. Existing Kittle concept route already documents the same Chromium document-transition failure. The three auth routes now use that existing `@view-transition { navigation: none; }` pattern; compiled CSS order independently verified, ordinary Playwright clicks restored, all language/history assertions retained. Fresh exact-head browser CI remains required. No force-click, relaxed timeout or sitewide animation change. Local Chromium launch remains blocked by socket permissions.
- Release: feature branch only; no merge/deploy. Search-owned configuration, URL ownership and metadata untouched.

## 2026-10-07 — Carrier dispatch retry could create a duplicate lead

STATUS: RESOLVED IN BRANCH / NOT RELEASED.

PROBLEM: After an ambiguous network failure or browser timeout on `/logistics/start-car-hauling-dispatch/`, a carrier could choose Send again. The browser created a new request ID for the retry even when the reviewed form was unchanged. If the receiver had accepted the first request but its response never reached the browser, the second request could bypass receiver idempotency and create a duplicate Logistics Sales lead.

ROOT_CAUSE: The carrier enhancer generated `crypto.randomUUID()` inside every send attempt. The receiver correctly deduplicates a repeated idempotency key, but the browser did not preserve that key for the lifetime of the reviewed carrier intent.

FAILED_APPROACH: Treating every click as a new request identity makes a network retry indistinguishable from a changed carrier submission. A success-only UI guard also cannot cover the ambiguous-outcome case because the browser does not know whether the first delivery was accepted.

WORKING_APPROACH: Keep one request ID with the active reviewed lead, reuse it for every retry while the form is unchanged, and clear it only after trusted form input/change or when review no longer produces a deliverable lead. Preserve the existing receiver, endpoint, payload, analytics, email fallback, qualification rules, and public route.

EVIDENCE: The new regression failed before implementation because two attempts produced `synthetic-fixture-request-1` and `synthetic-fixture-request-2`. It now proves header/body identity, same-key retry after a simulated network failure, and a new key after trusted form input. The focused carrier suite passes 10/10 across desktop and mobile. `npm run build` completed with zero errors and 399 pages; full `npm test` passed. A fresh CI-mode run completed all 1,992 browser cases: 1,971 passed, 16 were skipped, two unrelated existing scenarios were flaky, and three unrelated existing Home/consent cases failed after retry. The changed carrier test passed in both projects. Exact-head GitHub CI remains the complete release gate.

LESSON: An idempotency key identifies one business intent, not one click. A retry after an ambiguous outcome must reuse the same identity; a material user edit must create a new one.

REUSE_RULE: Every browser-to-receiver lead flow with retryable ambiguous delivery must persist its request identity across unchanged retries and reset it on trusted intent changes. Test both the retry and new-intent boundaries.


## 2026-10-07 — Public journey recovery and Lighthouse deployment race

STATUS: proposed branch, not released.
CAUSE: general header used missing #contact targets; Academy inbound track anchors were absent; general website navigation selected a London owner; public MotionLayer loaded repair-owner runtime; push-triggered Lighthouse ran before deployment.
PREVENTION: build-time header/Academy/owner-runtime contracts and successful exact-revision deployment gate before production measurement.
EVIDENCE: docs/WEB_PUBLIC_JOURNEY_RECOVERY_2026-10-07.md. Build and npm test pass; browser verification and release remain pending.

## 2026-10-08 — Repair Shop public entry / commercial context

- Owner: Codex, bounded owner instruction; parent pilot #510 and completion gate #960.
- PROBLEM: clean `/services/hermes-connect/access/` rendered Ukrainian markup, metadata and privacy controls; stale saved locale changed the clean route. Product context classified the shared entry as a reference capability. Repair Website/SEO CTAs lost the vertical before the existing Technology/Marketing forms.
- ROOT_CAUSE: Ukrainian SSR defaults plus generic capability fallback; commercial links carried only a generic project/service selector.
- WORKING_APPROACH: English SSR access with explicit Ukrainian variant retained; access-only clean locale rule; product-family entry explains the current Repair Shop pilot without promising activation/results. Existing Website/SEO forms retain editable repair context and fixed public source owner in their summaries. No new receiver, Catalog writer or search owner.
- EVIDENCE: current-main base `d82279a8d81f5415137cefef4ac3cc656df52086`; source contracts pass. Initial build and full static/unit suite pass. New ten desktop/mobile browser cases cover locale, CTA navigation, form context, mocked Website submission, canonical/schema and overflow; local browser launch is BLOCKED_ENV (`process_singleton_posix.cc socket() failed: Operation not permitted`). This is not a page assertion failure. Full e2e attempted and stopped at that same launch gate; no browser pass or screenshots claimed.
- STATUS: CODED / REVIEW_REQUIRED, not production resolved. Current-head CI/browser and preview evidence are release gates. PR: https://github.com/officeus-create/Hermes/pull/1749.
- OWNER HANDOFF: #1744 owns broad locale/Catalog parity; reconcile only overlapping access/BaseLayout/locale assertions, preserve this English SSR main and pilot boundary. #1673 owns DigitalServicePage design; preserve its styles while retaining this CTA-query delta. Catalog #1663 / Catalog owner retains Kittle server-rendered discovery. No Catalog files changed here.
- REUSE_RULE: server HTML and runtime language must agree on clean English owners; carry allowlisted commercial context to the existing form and its private summary, never infer Sales receipt from a page/form or HTTP acceptance alone.

### PR #1749 — stale saved-locale browser assertion, 2026-10-08

- PROBLEM / ROOT_CAUSE: on `fbae1ddf`, the older browser regression still expected saved Ukrainian on clean access, contradicting the intentional English clean-route contract. It correctly remains the default for the separate Academy auth routes.
- WORKING_APPROACH: update only the regression to distinguish access from Academy, check clean-route reload, explicit `?lang=uk` and its reload, and explicit English. Do not restore the defect or relax assertions.
- EVIDENCE: focused locale/source contracts pass; fresh desktop/mobile auth and repair-context browser verification is recorded in the PR. GitHub shard 3 cancellation is not a green aggregate run, even when its tests finished successfully; rerun all gates on the new head.
- STATUS: regression aligned / current-head verification required. No runtime, Catalog, receiver, deployment or client-data change in this follow-up.

- Second exact CI finding in the same PR: `tests/seo-repair-b2b-owner-map.spec.ts` selected retired generic Website/SEO hrefs. The regression now identifies each visible hero primary CTA by accessible name and asserts its complete repair-context destination, including vertical/source path and the correct form anchor. Product links are not reverted.

## LOAD-BOARD-TRUTHFUL-INTAKE-20261008 — request acceptance is not human receipt

STATUS: REVIEW_BRANCH; production verification pending.
PROBLEM: Direct transport production runtime enabled live submission while leaving a Preview mode note. Load Board and transport handlers treated generic HTTP 2xx as receipt by Logistics Sales; the customer path appeared after the dynamically inserted marketplace. Footer top anchors were absent on these two pages.
ROOT_CAUSE: Static mode copy was not reconciled with production overrides. Browser handlers did not inspect the existing receiver's success/request_id receipt, and the carrier qualification enhancer independently replaced the Load Board handler. The receiver confirms Worker handoff, not final delivery or human receipt.
FAILED_APPROACH: HTTP success, a matching receipt, successful CI, and a synthetic submission are not interchangeable with mailbox delivery or a qualified human-reviewed lead.
FIX: Shared receipt validation exposes submitted only for success plus matching request_id; delivery and human receipt stay unconfirmed. Retries retain the reviewed lead's request identity. Production mode note updates, hero customer CTA, explicit demo boundary, truthful WebPage/WebApplication schema, existing intake contact target and top anchors are restored locally.
PREVENTION: Receipt unit cases reject empty/error/mismatched responses and ignore unsupported delivery/human claims. Browser regressions cover desktop/mobile, generic 2xx retry, canonical/indexability, first-screen CTA and anchors. No source gates, booking rules, fields, receiver, sitemap or robots policy changed.
EXTERNAL_GATE: Actual approved inventory and mailbox/human receipts require operational evidence; this branch creates none. Historical delivery-confirmed analytics counts remain non-delivery evidence.
REVIEW_CORRECTION: Preserve older secure-browser compatibility when randomUUID is unavailable by generating UUID v4 from getRandomValues. Same-object retry reuses the stored ID; no timestamp or Math.random identity. Added failing-first unit regression and real browser fallback coverage.
VERIFICATION: Final build and full npm test pass; all Load Board browser files and direct customer-intake regression pass 58/58. Earlier full suite had 1,970 passed, 16 skipped, 20 failed; the two package terminology failures are corrected and pass in the final scoped run. The 18 other scenarios remain outside this package and do not constitute a green release receipt. PR #1752 stays review-only pending exact-head CI and release decision.

## ERR-MOBILE-HERO-CACHE-20261007 — IMPLEMENTED / RELEASE_GATE_PENDING

PROBLEM: successful #1747 deploy still delivers old 222,111-byte logistics hero at unversioned URL.
ROOT_CAUSE: long-lived cached public asset URL does not change when optimized bytes change; query revision returns exact main 90,337 bytes.
FAILED_APPROACH: treating merge or build source byte count as live asset verification; attributing old single high TBT to a function from URL alone.
WORKING_APPROACH: capture three production runs/trace per Home/Dealer, repeated edge GET pairs, then content-hash the same approved image and align hero/preload/schema.
EVIDENCE: main d82279a8; deploy 37686365007; Lighthouse 37686780431; production medians Home90/2071.636ms/0, Dealer79/2579.6585ms/0. Controlled replay Dealer LCP median5649.966→5035.2165ms, three consistent pairs; payload222111→90337. Not production after.
LESSON: MERGED != LIVE; check body hash/bytes and distinguish raw trace, simulated lab medians and field outcomes.
REUSE_RULE: changed long-lived public media must get a content-versioned URL, identical preload/display/schema target, preserved provenance and functional CTA readback.
NEXT: exact-head CI/browser acceptance, owner-authorized release, then live hashed-byte and three-run production check. Full local browser suite has unresolved unrelated failures; do not merge from a false green claim. Canonical evidence/status: docs/WEB_PUBLIC_JOURNEY_RECOVERY_2026-10-07.md.
## 2026-10-07 — Repair service sticky CTA context follow-up (Codex)

PROBLEM: Production 390×844 readback on both existing repair Website/SEO owners shows visible mobile sticky links omit vertical/source_path while hero links preserve them.
ROOT_CAUSE: MoneyPageActionBar has independent hardcoded destinations; #1749 updated DigitalServicePage only.
FAILED_APPROACH: New parity assertions fail on unchanged main for both owners in desktop/mobile (4 failed, 2 passed).
WORKING_APPROACH: Change only the two repair href entries. Extend existing owner-map browser tests with exact hero/sticky parity, mobile click-to-existing-form/preselected repair context, desktop hidden state and unchanged generic owner destinations.
EVIDENCE: Base main 84a787f169f6248edfcc5caa34953835f27ec00b. Branch fix/repair-sticky-context. Production before: Website /paths/technology/?project=website_development#project-brief; SEO /paths/marketing/?service=seo#contact. Candidate adds &vertical=auto_repair&source_path=<encoded existing owner> before the unchanged anchor. Validation and exact-head CI recorded in follow-up draft PR.
LESSON: A primary CTA regression does not cover the separate mobile sticky conversion entry.
REUSE_RULE: Check href parity plus actual mobile form context for every duplicated conversion entry.
STATUS: Review-only candidate; production remains unfixed until separately authorized release and live readback. No merge/deploy, real lead submission or delivery claim.
OWNERSHIP: Open PR file sets checked: no runtime/test overlap; additive handoff/error docs overlap #1750/#1751/#1752/#1753/#1679. Catalog #1751/#1663 and shared layout #1755 untouched.
SCORECARD: Conversion/context +; durable knowledge +; reusable regression +; search owner/metadata/indexability unchanged; no new product/automation/public claims.
NEXT: Exact-head CI review, then owner-authorized release and 390×844 production href/form readback.

LOCAL VALIDATION: build PASS (399 pages); full npm test PASS; focused desktop/mobile owner-map + repair public/form/context suite 20/20 PASS. Screenshots captured for both mobile sticky entries. Full browser suite is delegated to exact-head PR CI; no local full-suite green claim. Canonical/robots/schema contracts and title/H1 assertions pass; sitemap file untouched.

MAIN SYNC: Rebased this same PR onto cc5a8ae58914a65a7cd43497a9cdad39ee2ab073 after merged #1750. Rebase applied cleanly; all main/release records retained. Runtime/test diff remains exactly two repair href entries plus bounded existing owner-map assertions. Old-head local full E2E stopped for rebase: 901 passed, 8 failed outside repair CTA, 7 skipped, 4 interrupted, 1096 not run; not a green gate. Old-head contracts/audit passed; final rebased-head CI supersedes those. Fresh final-base build/unit/focused verification required and reported in the same draft PR. No merge/deploy.

MAIN SYNC AFTER #1752 (2026-10-08): Rebased existing #1757 onto 83aef305da82f5221b51d617da34c9f040cbc5cf. Shared-doc EOF conflicts resolved by retaining both complete Load Board and Repair records. Repair component/tests unchanged from prior green head9f83334d (2004 passed/16 skipped exact-head CI); fresh-head CI required, results recorded in same PR. No merge/deploy.

RELEASE BASE SYNC AFTER #1753 (2026-10-08): Rebased existing draft #1757 onto 859dc26dc9d28b0c3a09f825751ad1317c6ffa18. Retained all fresh-main release records plus complete Repair follow-up records. Runtime/test files unchanged from prior551f3c74; only two repair Website/SEO sticky href entries and narrow regression coverage remain. Earlier CI/cancellation is historical coordination evidence, not this head qualification. Fresh required exact-head CI recorded in #1757; no merge/deploy.

## 2026-10-07 — Runtime Repair Catalog had JavaScript-only hub discovery

STATUS: REVIEW_IMPLEMENTATION; exact-head browser CI and owner-approved release/live readback pending.
TARGET: `/businesses/connect/repair-shop/kittle-s-garage-a146544/`.
ROOT_CAUSE: `/businesses/` serves static Astro cards; opted-in runtime repairs were added only by the client API renderer. Runtime sitemap membership, a self-canonical 200 and index,follow did not create a raw-HTML hub link.
WORKING_APPROACH: Add a separate Pages hub function with visible escaped discovery links; share opt-in/identity/name/slug eligibility and canonical path across hub, profile, sitemap and API. Use no-store for fresh-request withdrawal, retain existing indexing and leave locale/counts work untouched. No new card renderer or production data mutation.
EVIDENCE: Build and unit/publication/canonical/robots/schema/privacy regressions pass; local browser runner cannot complete navigation in this managed environment. This is not production resolution or indexing evidence. Release requires full exact-head browser CI and a bounded live readback. See `docs/CATALOG_RUNTIME_DISCOVERY_2026-10-07.md`.
PREVENTION: Public runtime owner release must verify a meaningful raw-HTML hub anchor, matching sitemap/profile canonical, withdrawal behavior and one client card. Mechanical eligibility does not replace verified facts, permitted public fields or the editorial Search Release Gate.
NEXT_OWNER: Project31 / repository release owner. #1663 stale-base conflict remains with its original owner; do not replay that branch wholesale.

## 2026-10-08 — Academy measurement synthetic lead timestamps drifted outside spend fixture

STATUS: RESOLVED by #1760, accepted495183d6f13bff7e61dd760d50ebbbeb3504b46b merged233c83aaee9d1582203efdb4066a388ca607bfd8; exact-head Website37706532079/audit37706532059 SUCCESS and approved-main deploy37707840904 SUCCESS. Production attribution logic was not changed.
PROBLEM: On fresh main 55eaf2762242fb830641e227280b98ad89966fe9 the focused measurement test returned attributedLeads 0 instead of 2 after the UTC date rolled past October 7.
ROOT_CAUSE: The real CRM handler correctly stamps current created_at, while the synthetic spend fixture ends on 2026-10-07. Production attribution correctly excludes those later-created fixtures.
FAILED_APPROACH: Reproduced the unchanged test with the current clock: 3 pass, 1 fail (0 !== 2). No campaign-window extension or production workaround was attempted.
WORKING_APPROACH: Set only the two in-memory synthetic lead created_at values to 2026-10-07T08:00:00.000Z, asserting each fixture update touches exactly one row. Retain the real handler path, fixed campaign period, attribution semantics and existing economics assertions.
EVIDENCE: Focused node --experimental-strip-types --test scripts/hermes-connect-academy-measurement.test.mjs passes 4/4 on October 8. Full build/test and exact-head CI recorded in the bounded test-stability PR.
LESSON: Historical attribution fixtures require explicit event timestamps rather than the runner wall clock.
REUSE_RULE: Pin synthetic event dates inside their documented synthetic periods; never extend real periods to accommodate test drift.
NEXT_OWNER: Preserve the pinned synthetic timestamps. The #1760 prerequisite is closed; Academy #1756 still requires its own current-main CI and live acceptance after the localized-owner package.

## ERR-LOAD-BOARD-FIRST-PAINT-CSS-20261008 — RESOLVED_TARGETED_CSS_FIX

PROBLEM: Load Board can paint the large legacy hero, then shrink it when conditional marketplace CSS arrives late in streamed body HTML.
ROOT_CAUSE: existing hero rules are emitted about216KB into the body. Identical94px hero-grid movement appears in all3 primary production raw traces on deployed55eaf; deterministic desktop/mobile streaming regression reproduces it after fonts are ready. Font-timing correlation alone was an incorrect candidate explanation.
FAILED_APPROACH: optimize JS from one TBT1382ms sample, infer field truth from Lighthouse, or select the better run. Stable primary TBT median0; secondary median0 despite one768ms outlier. Other body/context/font/counter CLS sources remain outside this one fix.
WORKING_APPROACH: deliver unchanged24399-byte marketplace rules through the existing Load Board page's head stylesheet; keep component markup/scripts and every product/SEO/receipt/form/consent boundary unchanged. New regression fails2/2 before, passes2/2 after.
EVIDENCE: approved-main37704990231; primary three-pass trace run37705761158/artifact11519501972; primary medians84/3103.386ms/0ms/0.091099; secondary37705825841 separately recorded. Build399 PASS, targeted browser60/60 PASS, receipt/fallback/handoff PASS. Full npm test blocked by clean-main Academy date fixture at measurement.test.mjs:169 after UTC October8 rollover; exact-head CI is required, not presumed green.
LESSON: below-the-fold conditional CSS can mutate above-the-fold geometry after paint. Test a streamed first response with fonts settled, compare raw rectangles, and move rules without changing their values or product behavior.
REUSE_RULE: existing-owner evidence -> reproducible trace/DOM cause -> one delivery fix -> current-head contracts/mobile/CI -> authorized release -> production remeasurement. Preserve partial evidence commit0cc7dba and all verified release entries.
RELEASE_RECEIPT: #1761 acceptedfe19155c12483150c73e0569629426ea04536a7e merged0dc12892d8c15b802a50be02bea238bd4291029d; deploy37730419072 SUCCESS. Independent live head-stylesheet/CTA/canonical/robots readback passed. Complete three-pass run37732522106/artifact11530995432 pinned to deployedbbddded92734ba6cd3ec3d522540e6717d6a102e verified the original0.181572 late-CSS hero transition absent from all raw traces. Medians Performance87/LCP3416.4195ms/TBT0/CLS0.091099/SEO100; every report has a slow-load warning. Failed trace37731065662 and moving-main37731673712 excluded, retained as evidence.
NEXT: This CSS defect is closed. Preserve its streaming regression. Residual body/context/font/counter shifts and broader LCP/field/commercial outcomes remain separate; do not claim overall speed or revenue gains.

## ERR-HOME-HISTORY-HIT-TEST-20261008 — RESOLVED_TEST_READINESS

PROBLEM: The existing Home→Connect→Back pointer test repeatedly failed after stable visible button geometry; Catalog and locale CI were blocked by the same assertion.
ROOT_CAUSE: Hit testing can lag history-restored DOM geometry. Independent production observation initially returned HTML at the button center, then SVG/button without an overlay or runtime change.
FAILED_APPROACH: Single immediate elementFromPoint sample and repeated blind full-run retries; original Italian head failed run37737845961 attempts1/2.
WORKING_APPROACH: Preserve visibility, enabled state, stable geometry, viewport bounds, the exact pointer receiver requirement, real mouse click and navigation assertions; poll only pointer readiness for at most5s without rAF or force click.
EVIDENCE: #1764 accepted25b82dc87fdba0934911a7564c00feb5622a13df merged1195b3533225d8646a099d8f775e44cae751d02d. Website37741601313/audit37741601304 SUCCESS, browser2026passed/16skipped/0failed/0flaky. Job113193747448 records initial HTML hit and subsequent successful test. Deploy37743142806 SUCCESS; Home runtime unchanged.
REUSE_RULE: Stable geometry is not pointer actionability after browser history. Wait for the actual hit receiver; never force a click or remove assertions to make CI green.
NEXT: Preserve the regression and consume current-main checks in existing blocked PRs; no duplicate Catalog/Academy implementation or customer evidence claim.
## PR #1756 Academy language-purity regression — 2026-10-08

Code correction prepared on the existing feature branch; exact-head CI required before release. Failed job 113042540715 found `follow-up` in the Ukrainian Logistics route-local related Marketing card. Translate the card rather than narrow the whole-main assertion; require the translated label/body and reject the other missed English fragments. Existing course/admission/employment boundaries and search owners are preserved. Release remains ordered after #1754 with the central owner.

## 2026-10-08 — PR #1663 count/facet and U.S. card scope reconciliation

STATUS: REVIEW_IMPLEMENTATION; fresh exact-head CI pending in existing PR #1663.
PROBLEM: count copy combines business/service entries; live repair insertion does not reconcile category/state facets and accepts non-US/unknown country into the U.S. grid.
ROOT_CAUSE: static category/state counts and renderer lack normalized country scope; profile publication eligibility is a separate concern.
WORKING_APPROACH: replay only unique #1663 counts/filter logic on accepted main55eaf276; increment facets after identity dedupe and actual U.S. card insertion; keep unbuilt state tiles passive and preserve Home Service/Academy current paths.
EVIDENCE: synthetic regression covers mixed-case/whitespace US, non-US/unknown exclusion, duplicate identity, category/state counts and no invented state link; current-head full CI required. Local execution unavailable; no local validation claim.
REUSE_RULE: presentation scope must not modify opt-in, canonical/indexing or sitemap ownership. #1751 publication helper/withdrawal rules untouched.
NEXT_OWNER: Project31 release owner for acceptance after exact-head green; no merge/deploy by this task.
