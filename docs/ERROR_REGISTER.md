# Hermes Error Register

Reviewed: 2026-08-15

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
| ERR-EXT-002 | ACTIVE | Bing Webmaster Tools | Authenticated Hermes site access was verified on 2026-08-28. The sitemap index was successful with 110 URLs and zero errors/warnings; three priority URLs were indexed, while `/services/seo-for-logistics-companies/` remained `Discovered but not crawled`. | Preserve the successful sitemap; continue the existing-site performance baseline and review the one remaining priority crawl gap in #206. | Do not create a replacement site/account or repeatedly resubmit a healthy sitemap. |
| ERR-EXT-003 | OWNER_ACTION | Google account security | Historical reviewed mail contained sign-in and third-party application-access alerts for company/recovery accounts. Some may be legitimate, but they were not independently verified in this repository workflow. | Review devices, recovery accounts, OAuth grants, administrator access and MFA in Google Account Security; revoke only entries the owner confirms are unauthorized; record the review privately. | Do not paste alert codes, cookies, tokens, recovery data, or account lists into GitHub or an AI prompt. |
| ERR-EXT-004 | OWNER_ACTION | Entity truth and profiles | External entity inventory is complete, but canonical owner-approved identity facts and authenticated profile corrections remain incomplete. Fresh 2026-08-11 public sampling also found same-name Hermes search ambiguity and conflicting third-party Milwaukee address data. | Continue only in #204: approve canonical facts privately, correct only authenticated/owner-controlled profiles, then rerun dated branded Google/Bing/AI checks. | Do not copy directory estimates or choose a conflicting directory value merely because it appears in search. |
| ERR-EXT-005 | OWNER_ACTION | Local profiles / GBP | Real storefront or eligible service-area status has not been verified for every direction. | Confirm the actual U.S. customer-facing/service-area model before creating or editing Google Business Profile, Apple Maps, Bing Places, Yelp, Chamber or local citations. | Do not use virtual offices or create separate online-only local entities to simulate presence. |
| ERR-EXT-006 | ACTIVE | GA4 production measurement | The existing Hermes property and one production web stream were authenticated on 2026-08-28; collection was active, enhanced measurement was enabled and zero connected site tags were shown. Commercial key-event receipts and exact-once DebugView proof remain incomplete, and the visible Direct/first-visit concentration requires traffic-quality review. | In #206, define the approved commercial key events, separate internal/test/bot traffic, then complete one synthetic non-private exact-once DebugView receipt before changing configuration. | Do not create a replacement property, mark unused `purchase` as proof, or send submitted/private values to analytics. |
| ERR-CONTACT-001 | RESOLVED | Shared public contact form delivery | PR #1344 merged as `5051b53fa03d2ff682ec2c60372419a1b520e741`; Cloudflare exact-SHA production deployment passed, production `/paths/logistics/` exposed `data-contact-mode=live` + `/api/logistics-lead`, the deployed ContactCTA resolved the relative endpoint against `window.location.href`, and one bounded synthetic browser submission returned HTTP 200 with matching corporate inbox receipt. | Preserve the relative-endpoint regression and normal exact-SHA Cloudflare release path. Reopen only from a fresh browser-path regression, not from the retired pre-fix snapshot. | QA receipt proves delivery only; do not count it as a qualified lead, customer, sale, or revenue. |
| ERR-CONTACT-002 | ACTIVE | Logistics public contact routing | Production still publishes `+1 (262) 302-3626` on carrier and dispatch surfaces, but current owner evidence identifies that line as a separate STO/auto-repair outbound number rather than an approved Logistics/Carrier Sales destination. A review branch removes the number from public Logistics surfaces and retains the existing protected intake plus `officeus@hermeslogisticsus.com`. | Pass exact-head build/static/browser verification, merge only with owner approval, deploy through the existing Pages path, then verify the canonical carrier, dispatch, Load Board, contacts and footer surfaces contain no retired Logistics phone CTA. | Do not repurpose the STO line, the dispatcher number, or another unapproved number; do not claim the correction is live before production readback. |
| ERR-CARRIER-001 | ACTIVE | Carrier lead durable delivery | Current `main` has the approved 09:00–17:45 America/Chicago Telegram guard and QA/commercial split, but Pages KV uses a non-atomic read-then-write and the Worker has no durable per-destination receipt or quiet-hours replay. Review PR #1485 adds one SQLite Durable Object per `request_id`, atomic claim/lease, email/Telegram receipt ledger, destination-level retries and alarms, payload-conflict rejection, deterministic Message-IDs, and post-completion lead-body purge. | Require full exact-head CI on PR #1485, independent review, then explicit owner approval for merge/deploy. After an authorized Worker release, verify exact deployed SHA/config without a fake commercial lead; keep the issue open for the next genuine carrier and human qualification evidence. | Do not reuse the retired HL40 group, configure an unapproved Telegram destination, expose bot credentials, treat mocked/provider-accepted transport as qualified-lead proof, or claim the PR is live before production readback. |
| ERR-AI-001 | OWNER_ACTION | Hermes Connect internal AI Assistant | PR #878 is merged at `cb582c9f43e0d7ea8157eebfc4dbe4e3569ab803`; the private route is publicly deployed and anonymous internal-AI status/task requests fail closed. The owner capability binding, scoped runner secret, and outbound Mac runner are not configured in the available private environment, so no end-to-end receipt or approval-gate simulation exists. `REMOTE_BROWSER_TO_CODEX = UNVERIFIED`. | In an approved authenticated private admin/provider surface, identify the real existing owner specialist ID, create exactly one active `HERMES_INTERNAL_OWNER` binding, configure one scoped runner secret without revealing it, then execute the bounded receipt and simulated `needs_approval` tests. | Do not guess or publish the owner identity, commit/log a credential, use a customer role as an internal role, expose the route in customer navigation, enable remote shell behavior, merge/deploy automatically, or claim live runner access. |
| ERR-SEO-001 | ACTIVE | Revenue SEO measurement | Fourteen audited money pages have current canonical/intake/handoff architecture and are classified `READY_TO_MEASURE`; current bottleneck is evidence, not another generic funnel rebuild. | Execute #206, then use actual impressions/query ownership to choose CTR/content/internal-link changes. | Do not mass-publish city/equipment permutations or revive stale SEO score-raising branches before measurement. |
| ERR-SEO-002 | ACTIVE | SEO 11 execution router | Issue #346 is the single revenue-first backlog: measurement → optimize existing demand → proof → entity authority → controlled scale. | Keep one source-of-truth issue per investigation; update #346 when a major block closes or changes priority. | Do not reopen historical parent audits or duplicate active work into new handoff issues. |
| ERR-SEO-003 | ACTIVE | GSC crawl/index quality | On 2026-08-28, 28 sitemap URLs were `Discovered - currently not indexed`. Production metadata was valid, but nine guided equipment variants were near-template pages; eight shared variants had 0.895–0.939 maximum pairwise word-set similarity. | Review the bounded `SEO-GSC-INDEXATION-2026-08-28` branch: keep the user routes, set the nine low-evidence variants to `noindex,follow`, remove them from the sitemap, and preserve 19 distinct public owners. | Do not bulk-request indexing or add superficial text to make thin variants look unique. |
| ERR-EXT-007 | RESOLVED | `www` custom domain | Fresh GitHub-hosted production reconciliation on 2026-09-19 returned `301` for both `https://www.hermeslogisticsus.com/` and `http://www.hermeslogisticsus.com/`, with `Location: https://hermeslogisticsus.com/`. The earlier Cloudflare `520` state is no longer current. | Preserve the apex as canonical. Repository middleware now also carries a fail-closed `www`/production-Pages → apex redirect contract so a future routing change cannot create a second indexable host when requests reach Pages. | Do not reopen DNS/custom-domain work without fresh production regression evidence; do not treat historical GSC blocked rows as current Cloudflare failure after the redirect is proven live. |
| ERR-HC-RS-001 | RESOLVED_IN_REVIEW | Hermes Connect Repair Shops cabinet | The Customers heading inherited the public-site dark hero rule, while dynamically rendered customer and availability cards did not receive scoped page styles. The result was low contrast and crowded fields in the real route. | The pending review branch isolates the cabinet header, supplies durable CRM card styles and replaces improvised navigation glyphs with SVG icons. Verify the exact PR head and a deployed authenticated view before closing as production-resolved. | Do not treat the local synthetic demo as proof of a live booking, customer, or availability integration. |
| ERR-HC-RS-002 | ACTIVE | First-run Repair Shop setup | A new owner's availability endpoint can return `shop_profile_required` before a shop exists. The dashboard hid its setup notice until that endpoint succeeded, so the owner lost the next-step cue. Optional contact fields also kept the Save button animated after required name/city/state were filled. | Review the focused first-run fix, test both desktop and mobile with a new owner, then deploy and verify in production. | Do not call a manager-prepared login an owner-verified shop or connect it to an unclaimed public listing automatically. |
| ERR-HC-RS-003 | OWNER_ACTION | Prospect access and publication | Manager-prepared CRM, manager call sheet, unclaimed Catalog card, and client outreach are distinct states. Source email can be missing or belong to a different business. Meta cards save links but do not synchronize content. | Team signs into each manager-prepared demo and verifies services, hours and identity; obtain correct contacts on held leads. Enable Meta OAuth, read permission and an approved failure notification channel before claiming automated sync. Client email awaits an explicit team go-ahead. | Do not describe a catalog entry or spreadsheet email as a verified CRM login, invent social sync, send prospect mail before QA, or portray a prospect as a customer. |

## Launch/compliance gates — valid but not daily SEO blockers

| ID | Status | Area | Trigger | Current source of truth |
| --- | --- | --- | --- | --- |
| ERR-GATE-001 | OWNER_ACTION | Carrier agreement e-signature | Final production execution/signature release | Qualified Wisconsin transportation counsel + final owner/business approval + approved execution/provider/audit safeguards required. |
| ERR-GATE-002 | WATCH | Payment/refund/recurring billing | First real checkout, paid offer, subscription or renewal flow | #319 — no fictional payment policy should be published before the actual offer/process exists. |
| ERR-GATE-003 | WATCH | International/state compliance | New market/state/data-flow requirement or production legal verification | #321. |
| ERR-GATE-004 | WATCH | Advertising/vendor technology | Meta Pixel, Ads remarketing, new analytics vendor, international processor or similar activation | #324. |
| ERR-GATE-005 | WATCH | Media/asset provenance | New or existing photo/video/icon/downloadable/client media whose publication rights are not documented | #320. Font binary provenance is already completed via PR #333. |
| ERR-GATE-006 | ACTIVE | Android APK distribution | Any direct APK binary or download claim | #511 — the stale debug-signed binary was retired. Rebuild from the canonical runtime, use a controlled release key, record artifact/certificate checksums, and pass clean-device install/launch/core-flow smoke before restoring distribution. |
| ERR-AI-001 | ACTIVE | Hermes AI resilient route | Any fallback configuration or resilience claim | Local primary smoke passed through FCC with `openai/gpt-5.6-terra`; a missing NVIDIA key failed before a fallback could be exercised. Keep only authenticated providers in the active chain. Verify fallback later with two real providers and a controlled retryable runtime failure; record local evidence. |

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
