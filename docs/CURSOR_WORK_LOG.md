# Cursor Work Log

## Session 01 - Revenue Sprint 01

STATUS: CODEX_REVIEWED_ACCEPTED

### Codex review

- Reviewed the implementation diff and both screenshots on 2026-07-13.
- Re-ran `npm run build`, `npm test`, and `npm run test:e2e` independently.
- Result: Astro diagnostics clean; static and unit checks passed; Playwright
  reported 41 passed and 1 expected skip.
- Contact-channel policy passed: phone only for Logistics; Marketing, Academy,
  and IT use email only.
- Sprint 01 accepted for the local prototype. Production deployment and live
  delivery remain separate decisions.

### Baseline read

- Read `AGENTS.md`, `README.md`, `docs/CODEX_WEBSITE_HANDOFF.md`, `docs/DESIGN_INTEGRATION_CONTRACT.md`, `docs/PUBLIC_INFORMATION_POLICY.md`, and `docs/CURSOR_FIRST_MISSION_REVENUE_SPRINT_01.md`.
- Preserved existing uncommitted Codex changes in `scripts/validate-build.mjs`, `src/data/site.ts`, and email-only contact routing on Marketing, Academy, and IT pages.

### Baseline tests (before handoff implementation)

```bash
npm test
# Validated static website: 6 routes, 17 homepage checks, 5 image assets, no external form action.

npm run build
# Astro check: 0 errors, 0 warnings, 0 hints
# 7 page(s) built in 1.13s

npm run test:e2e
# 33 passed, 1 skipped (desktop mobile-menu test)
```

### Architecture learned

- Contact form lives in `src/components/ContactCTA.astro` on homepage and all direction pages via `selectedPath`.
- Preview mode is default (`PUBLIC_CONTACT_MODE` unset or not `live`); live POST only when `PUBLIC_CONTACT_MODE=live` and HTTPS `PUBLIC_CONTACT_ENDPOINT` are set.
- Approved public contact channels are already structured in `site.paths[].directContacts`; Marketing/Academy/IT are email-only; Logistics may expose phone and email.
- Static validation in `scripts/validate-build.mjs` enforces no form `action`, preview mode default, email-only non-logistics routes, and public-information gates.

### Changes delivered

- Added `src/lib/contact.ts` with `buildContactPayload`, `buildRequestSummary`, `sanitizeContactField`, and `contactHandoffRoutes` derived from `site.paths`.
- Replaced duplicated `directRoutes` in `ContactCTA.astro` with shared site data.
- Implemented preview handoff panel: summary `<pre>`, `Copy request` button, approved route link, unsure-direction guidance, live-region copy status, and stale-handoff clearing on invalid input or direction change.
- Added handoff styles in `src/styles/global.css`.
- Added `scripts/contact-handoff.test.mjs` unit checks and extended Playwright coverage for handoff, clipboard success/failure, and direction-change clearing.
- Updated `README.md` contact workflow section.
- Captured screenshots at `docs/screenshots/handoff-desktop-1440.png` and `docs/screenshots/handoff-mobile-390.png`.

### Verification (after implementation)

```bash
npm run build
# Astro check: 0 errors, 0 warnings, 0 hints
# 7 page(s) built in 2.22s

npm test
# Validated static website: 6 routes, 16 homepage checks, 5 image assets, no external form action.
# Contact handoff unit checks passed.

npm run test:e2e
# 41 passed, 1 skipped (desktop mobile-menu test)
```

### Assumptions

- Primary handoff route per direction uses the first approved `tel:` contact for Logistics and first approved `mailto:` contact for Marketing, Academy, and IT.
- `"I am not sure yet"` shows copyable summary but no primary route link; visitor must choose a direction for the approved route.
- Clipboard permission may be denied in some browsers; manual-copy guidance is the recoverable fallback.
- Client script imports `site` for copy-status strings; acceptable for v0.1 without adding a new dependency.

### Remaining gaps

- Live contact delivery still blocked pending destination and data-handling approval.
- Conversion measurement, Wisconsin acquisition pages, Academy commercial offer, and verified mailbox aliases remain open per `REVENUE_COMPLETION_REGISTER.md`.
- Desktop/mobile screenshots were taken against local preview; production verification remains a separate release step.

### Recommended next task

- Codex review of handoff UX and channel policy, then choose approved live receiver and first-party conversion event contract.

## Session 02 - Division Intake 02

STATUS: CODEX_REVIEWED_ACCEPTED

### Codex review

- Reviewed the Session 02 implementation and evidence on 2026-07-13.
- Replaced the stretched platform-checkbox layout with a compact accessible
  fieldset grid and removed component-level inline presentation styles.
- Confirmed phone is available only in Logistics; Marketing, Academy, and IT
  remain email-only and expose no phone field.
- Re-ran Astro build/check, static validation, contact unit tests, and the
  Playwright suite. One parallel desktop navigation timed out while 44 tests
  passed; the same scenario passed independently with one worker in 3.3s.
- Session 02 accepted for the local preview. No live delivery, storage, or
  external request was introduced.

### Changes delivered
- Added direction-specific preview field groups (Logistics, Marketing, Academy, IT) that render only for the active direction.
- Ensured channel enforcement: optional `phone` input is shown only for Logistics; Marketing, Academy, and IT expose no phone input and keep email-only handoff routes.
- Extended `src/lib/contact.ts` typed payload parsing to include direction-specific preview fields.
- Updated copied request summaries to include completed direction details as plain text under `Direction details:` (and strip `<`/`>` to keep the copied summary free of HTML-like sequences).
- Cleared stale preview handoff whenever the direction selection or any direction-specific input changes.

### Verification (after Session 02 implementation)
```bash
npm test
# Validated static website: 6 routes, 16 homepage checks, 5 image assets, no external form action.
# Contact handoff unit checks passed.

npm run build
# Result (27 files):
# - 0 errors
# - 0 warnings
# - 0 hints
# 7 page(s) built in 824ms

npm run test:e2e
# 1 skipped
# 45 passed (32.5s)
# exit_code: 0
```

### Screenshots / UI evidence
- `docs/screenshots/intake02-marketing-desktop.png`
- `docs/screenshots/intake02-marketing-mobile.png`
- Evidence refreshed on 2026-08-11 with sticky header and privacy settings hidden only during capture; production UI behavior is unchanged.

### Assumptions
- “I am not sure yet” keeps direction-specific fields hidden and produces a copyable summary without an approved primary handoff route.

### Remaining gaps
- Live contact delivery still blocked pending destination and data-handling approval.

## Session 04 - Car Hauling Load Board Dry-run

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Objective

Deliver the smallest testable Load Board slice without a backend or external side effect: car-hauling intake, explainable automatic review, dry-run routing, and a copyable preview package.

### Changes delivered

- Added `/load-board/` with a responsive intake for private parties, dealers, shippers, brokers, and other businesses.
- Added typed parsing and sanitization in `src/lib/load-board.ts`.
- Added explicit decisions: `approved`, `needs_more_information`, `quarantine`, and `rejected`.
- Added rule-based handling for incomplete forms, past dates, bot honeypot, tractors/other commodities, inoperable vehicles, and multi-unit loads.
- Added proposed routing to Load Board operations, dealer/shipper sales, and Dispatch Assist dry-run queues without exposing internal details publicly.
- Added copyable dry-run package and explicit notice that no email, CRM write, publication, or carrier notification occurred.
- Added sitemap and `llms.txt` entries, static route validation, unit tests, and desktop/mobile browser tests.

### Verification

```bash
npm run build
# Astro: 0 errors, 0 warnings, 0 hints
# 12 pages built, including /load-board/

npm test
# Validated static website: 11 routes
# Contact handoff unit checks passed.
# Load Board unit checks passed.

npm run test:e2e
# Load Board desktop/mobile scenarios passed.
# Full run: 73 passed, 2 skipped, 1 unrelated /ru/ parallel timeout.

npx playwright test tests/site.spec.ts --project=desktop --grep '/ru/ renders without broken layout'
# 1 passed in 2.7s; isolated scenario completed in 851ms.
```

### Visual evidence

- `docs/screenshots/load-board-preview-desktop.png`
- `docs/screenshots/load-board-preview-mobile.png`

### Boundaries

- No backend, database, email, CRM, analytics, or carrier matching source was connected.
- No deployment, DNS change, push, or production publication was performed.
- The automatic decision is a browser-local preview, not a production approval.
- Existing unrelated uncommitted files and screenshots were preserved.

### Recommended next task

Add a controlled local submission ledger and a carrier-match fixture so approved previews can be tested end-to-end without touching production data or sending messages.

## Session 05 - Four-direction Home Entry Scene

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Objective

Turn the existing 1.3-second four-rail flash into a readable first-session entrance where visitors can understand Logistics, Marketing, Academy, and IT Development before choosing a path or opening the regular Home page.

### Changes delivered

- Rebuilt `SiteIntro` as an interactive four-direction scene with real links to every business path.
- Added the color-coded Hermes ideology line `Move. Grow. Learn. Build.` and a direction-specific statement.
- Added a 3.2-second focus interval per direction; the cycle continues without forcing navigation.
- Added always-available `Open Home`, footer Home, direct path selection, keyboard focus behavior, and Escape close.
- Kept the scene to one direct homepage view per browser session and skipped it for Home hash links.
- Kept `prefers-reduced-motion: reduce` visitors on the regular Home page.
- Added a 2 x 2 mobile composition and desktop/mobile local screenshots.
- Added browser coverage for automatic progression, four route links, one-session behavior, Home access, and reduced motion.

### Verification

```bash
npm test
# Validated static website: 17 routes, 18 homepage checks, 5 image assets, no external form action.
# Contact handoff unit checks passed.
# Load Board unit checks passed.

npm run build
# Result (47 files): 0 errors, 0 warnings, 0 hints
# 18 pages built

npm run test:e2e
# 80 passed, 2 skipped
# exit_code: 0
```

### Visual evidence

- `docs/screenshots/home-entry-scene-desktop.png`
- `docs/screenshots/home-entry-scene-mobile.png`

### Boundaries

- No deployment, push, DNS change, analytics, form delivery, message, CRM write, or other external side effect was performed.
- The existing Home page remains intact and available immediately.
- Existing Load Board and concurrent Logistics work were preserved and included in regression testing.

## Session 05 - Logistics Audience Router

STATUS: CODEX_IMPLEMENTED_VERIFIED_RELEASE_CANDIDATE

### Changes delivered

- Added a seven-card Logistics visitor router for shipper/dealer, broker, carrier/owner-operator, remote agency, careers, training, and Load Board.
- Added dedicated pages for five logistics audiences with relevant information and next actions.
- Routed training to Hermes Business Academy.
- Routed shipper/dealer and broker visitors to the Load Board preview.
- Added a shared local-only application preview for careers and remote-agency interest.
- Added sitemap coverage, static content checks, and desktop/mobile browser tests.

### Verification

```bash
npm run build
# 0 Astro errors, warnings, or hints; 18 pages built.

npm test
# 17 static routes validated; contact and Load Board unit checks passed.

npm run test:e2e
# New audience-routing and application tests passed on desktop and mobile.
# Parallel full run: 75 passed, 2 skipped; 3 unrelated old mobile interactions timed out.

npx playwright test tests/site.spec.ts --project=mobile --workers=1 --grep 'direction-specific input changes|academy screen flow|marketing growth flow'
# All 3 old mobile scenarios passed with one worker.
```

### Visual evidence

- `docs/screenshots/logistics-audience-router-desktop.png`
- `docs/screenshots/logistics-audience-router-mobile.png`

### Release boundary

- Applications and Load Board remain preview-only.
- No user data is transmitted or stored.
- No real carrier list or live loads are exposed.
- External delivery remains a later controlled integration.

## Session 06 - Carrier Vehicle Workspace Preview

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Source audit

- Reviewed the complete supplied Telegram `messages.html`, the six-slide `LoadBoard.pptx`, 14 original screenshots, and both voice messages.
- Stored the auditable source manifest and a Verified / Inference / Needs Review product brief under `/Users/progressopro/Documents/Сайт Hermes/01_Logistics`.
- Kept the Telegram dispatcher quiz in the Academy backlog rather than mixing it into Load Board MVP.

### Changes delivered

- Preserved the existing shipper/broker/private-party load intake.
- Added a separate carrier workspace preview with the proposed `Create access → Add vehicle → Dispatcher review → Available Loads` flow.
- Added a progressive minimum for MC/USDOT, email, phone, equipment class, capacity, availability, origin/radius, and destination or `Anywhere`.
- Added all discussed equipment classes as preview taxonomy; non-car-hauling classes route to `scope_review` instead of silently expanding the approved first vertical.
- Added explainable `dispatcher_review`, `scope_review`, `needs_more_information`, and `rejected` decisions plus vehicle states.
- Added a copy-visible dry-run package that explicitly confirms no account, vehicle, call, message, CRM write, or dispatcher assignment was created.
- Added unit and desktop/mobile browser coverage for the carrier vehicle flow and zero external writes.

### Verification

```bash
npm test
# Static validation, contact handoff checks, and Load Board unit checks passed.

npm run build
# 0 Astro errors, warnings, or hints; 21 pages built.

npm run test:e2e
# 88 passed, 2 skipped; exit code 0.
```

### Visual evidence

- `docs/screenshots/load-board-carrier-workspace-desktop.png`
- `docs/screenshots/load-board-carrier-workspace-mobile.png`

### Boundaries and open decisions

- No deployment, authentication, backend, database, external publication, message, call, CRM/ELD integration, advertising, or carrier outreach was performed.
- `Dispatch` remains a request state, not an automatic booking or phone call.
- Production authority/insurance verification, dispatcher data visibility, negotiation behavior, full equipment scope, and live integrations require Vladimir's explicit decision.

## Session 07 - Marketing Service Pillars and IT Proof Library

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Business structure

- Added approved local requirements for a four-pillar Marketing offer and a category-based IT service/case catalog.
- Marketing now connects Website & Conversion, SEO Optimization, Social Media Marketing, and Growth & Sales System.
- IT developments are grouped into Digital Presence, CRM & Operations, Workflow Automation, Business Assistants, and Industry Platforms.
- Small modules remain inside a clear service category; related modules can become a package or the wider Company Digital Operating System.

### Changes delivered

- Added a responsive four-column Marketing service scene with a concrete promise, scope, and next action for every pillar.
- Updated homepage Marketing points, metadata, offerings, service groups, and FAQ to include website marketing, SEO, and social media explicitly.
- Expanded the IT proof library from six to nine fact-based cards.
- Added `Why we built it`, category, maturity status, delivery description, and proof/brief action to each IT case.
- Added public-safe cases for the Carrier and Dispatcher Workspace, Multilingual Website Foundation, and Controlled Intake and Review workflow.
- Repositioned the public website case around custom software and controlled delivery rather than exposing internal implementation mechanics.
- Preserved explicit maturity labels and did not invent clients, seminars, metrics, or production status.

### Verification

```bash
npm run build
# 0 errors, 0 warnings, 0 hints; 21 pages built.

npm test
# Static validation, contact handoff checks, and Load Board unit checks passed.

npm run test:e2e
# 90 passed, 2 skipped; exit code 0.
```

### Visual evidence

- `docs/screenshots/marketing-service-pillars-section.png`
- `docs/screenshots/technology-case-library-section.png`

### Boundaries

- No deployment, DNS change, campaign, social publication, analytics connection, form delivery, message, CRM write, or other external side effect was performed.
- Search rankings, lead volume, audience growth, and sales are not guaranteed.
- Internal project names, private architecture, prompts, records, people, and credentials remain excluded from public copy.

## Session 08 - Progressive Home Direction Story

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Direction

- Preserved the approved full-screen four-column composition from the visual reference.
- Kept the regular Home page behind explicit `Open Home` actions and the one-view-per-session rule.

### Changes delivered

- Changed the desktop rails from equal static columns to a fluid layout where the active business expands from about 293 px to 472 px at the 1440 px reference viewport.
- Increased the automatic reading interval from 3.2 to 5.2 seconds.
- Added three progressive story lines per business; they reveal in sequence and the top ideology statement advances with the active story step.
- Added reverse fade behavior when a direction loses focus.
- Added hover and keyboard-focus pause so a visitor can keep reading a selected business; the automatic cycle resumes after leaving.
- Preserved direct links for Logistics, Marketing, Academy, and IT Development.
- Preserved the mobile 2 × 2 composition; mobile keeps the compact primary copy while the top statement continues to progress.
- Preserved Escape, reduced-motion bypass, session storage, and both Home exits.

### Verification

```bash
npm run build
# 0 errors, 0 warnings, 0 hints; 21 pages built.

npm test
# Static validation, contact handoff checks, and Load Board unit checks passed.

npm run test:e2e
# 90 passed, 2 skipped; exit code 0.
```

### Browser evidence

- Local in-app browser confirmed progressive `0 → 3` story-line reveal.
- Keyboard focus held IT Development active beyond the 5.2-second automatic interval.
- Desktop reference viewport confirmed a visibly wider active rail and readable inactive summaries.
- `docs/screenshots/home-entry-scene-desktop.png`
- `docs/screenshots/home-entry-scene-mobile.png`

### Boundary

- No deployment, DNS change, analytics connection, message, form delivery, or external write was performed.

## Session 09 - Role-Based Logistics Load Board Entry

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Direction

- Routed shipper/dealer, broker, and carrier/owner-operator visitors into different first jobs inside one Hermes Load Board.
- Used official U.S. carrier-platform patterns as product references without copying their interfaces.

### Changes delivered

- Added a three-role Load Board router.
- Added a fictional four-load carrier board with lane, timing, equipment, units, mileage, rate/RPM or offer status, posted age, source/payment context, and special requirements.
- Added safe demo search, `Request dispatch`, and `Make an offer` interactions; all remain local and non-operational.
- Changed shipper/dealer, broker, and carrier audience CTAs to open their matching workspace and preselect shipper/broker form roles when relevant.
- Preserved the carrier vehicle-review workflow and the shipper/broker posting-review form.
- Documented verified benchmarks, product inferences, and production decisions still requiring review.

### Boundary

- All loads are fictional demo data.
- No real search, registration, authentication, load publication, booking, bid, call, notification, CRM/ELD integration, or external write was performed.

### Verification

```bash
npm run build
# 0 errors, 0 warnings, 0 hints; 21 pages built.

npm test
# Static validation, contact handoff checks, and Load Board unit checks passed.

npm run test:e2e
# 94 passed, 2 skipped; exit code 0.
```

### Browser evidence

- Local browser confirmed the carrier-role route opens directly at `Available Loads`.
- Desktop view confirmed readable demo filters, route/rate cards, and the non-operational detail panel.
- Mobile layout and role-specific actions passed browser automation coverage.

## Session 10 - Hermes IT Product Portfolio and Connect Preview

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Source and maturity model

- Read the supplied `HERMES_CONNECT_SAAS_PLATFORM_MASTER_BRIEF` from Google Docs without modifying it.
- Kept three distinct maturity labels: Website `Live product`, CRM `Working prototype`, Hermes Connect `Product discovery`.
- Preserved the source boundary that the public IT portal, future SaaS application, and later mobile application are separate surfaces.

### Changes delivered

- Expanded the single website proof band into three full-width horizontal product lines with separate color systems.
- Preserved the existing website case and live-product claim.
- Added an original enterprise-style CRM and operations visual with navigation, KPI, pipeline stages, controlled records, owners, statuses, and next actions.
- Added an original Hermes Connect dashboard concept for Fit, Beauty, Studio, Pro, and Events with appointments, availability, clients, team context, and a safe `Hermes Flow AI` action preview.
- Added visible maturity and demo-data boundaries; no third-party UI was copied.

### Boundary

- No Hermes Connect app, account, booking, calendar sync, payment, AI execution, mobile app, backend, repository, integration, or deployment was created.

### Verification

```bash
npm run build
# 0 errors, 0 warnings, 0 hints; 21 pages built.

npm test
# 20 static routes and 24 homepage checks passed; contact and Load Board unit checks passed.

npm run test:e2e
# 96 passed, 2 skipped; exit code 0.
```

### Browser evidence

- Desktop browser confirmed the CRM prototype remains readable at product-card scale with visible navigation, KPI, pipeline, and record states.
- Desktop browser confirmed Hermes Connect has its own coral, cream, and violet identity and clearly shows schedule, operating context, and safe AI preview.
- Desktop and mobile automated checks confirmed three product lines, maturity labels, concept boundary, and no horizontal overflow.

## Session 11 - Hermes Load Board Product Line and Distribution Concept

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Direction

- Expanded the IT product portfolio from three to four products by adding Hermes Load Board.
- Recorded Vladimir's future `publish once → approved external boards → scheduled reconciliation` direction separately from the working local preview.

### Changes delivered

- Added Product 04 with a dedicated purple/navy freight-workspace visual.
- Added shipper/dealer, broker, and carrier/owner-operator role cues.
- Added public-safe load search, demo lanes, rates, dispatch/offer actions, and equipment taxonomy.
- Added a visible future distribution concept while explicitly stating that no external-board synchronization or schedule is connected.
- Added a detailed adapter, state, reconciliation, audit, and 06:00 Central Time schedule requirement for later review.

### Boundary

- No load, truck, offer, dispatch request, external-board record, API connection, scheduled job, credential, email, or partner contact was created.

### Verification

```bash
npm run build
# 0 errors, 0 warnings, 0 hints; 21 pages built.

npm test
# 20 static routes, 27 homepage checks, 6 image assets, contact checks, and Load Board unit checks passed.

npm run test:e2e
# 95 passed, 2 skipped; one unrelated animated-form click timed out.
# The timed-out scenario then passed independently on desktop and mobile: 2 passed.
```

### Browser evidence

- Desktop browser confirmed the fourth product line is readable and visually distinct from Website, CRM, and Hermes Connect.
- The local preview shows role tabs, freight search, three fictional lane cards, equipment coverage, and the future adapter concept.
- Desktop and mobile automation confirmed Product 04, its honest `Working prototype` label, route links, and the no-external-sync boundary.

## Session 12 - Public Contact Routing Correction

STATUS: CODEX_IMPLEMENTED_VERIFIED_LOCAL

### Owner direction

- Route Car Hauling inquiries from shippers, dealers, carriers, and owner-operators to `+1 (351) 777-5337`.
- Route general freight inquiries across supported equipment types to `+1 (262) 302-3626`.
- Remove the incorrect `General Inquiries`/Instagram attribution and the historical `Box Truck Department` line.
- Keep Marketing, Academy, and IT Development on email and preview-form routes only.

### Changes delivered

- Published the confirmed department labels and numbers in the local Contacts and Logistics data contracts.
- Retained `+1 (717) 696-6829` as `Additional Logistics Line`; its specific Google Voice label remains unconfirmed.
- Updated shipper/dealer and carrier audience pages to Car Hauling; broker routing now uses Freight Department.
- Updated Marketing discovery choices to distinguish SEO/Google Search, Google Ads/Paid Search, and Twitter/X while preserving the existing budget and planning-horizon structure.
- Removed the optional telephone field from the IT project brief.
- Did not publish a Natalia number because available source matches were customer/carrier records, not a verified personal contact.

### Verification

```bash
npm run build
# 0 errors, 0 warnings, 0 hints; 21 pages built.

npm test
# Static website, contact handoff, and Load Board checks passed.

npm run test:e2e
# 98 passed, 2 expected skips; exit code 0.
```

### Boundary

- No site deployment, telephone call, message, form delivery, or external integration was performed.
## 2026-07-28 — Load Board sales lead intake v0.1

### Business behavior

- Split the Load Board conversion into two clear sales paths:
  - `LOAD BOARD ACCESS / CARRIER` for carriers, owner-operators, dispatchers, free access requests, and interest in a specific demo load;
  - `POSTED LOAD / CUSTOMER|SHIPPER|DEALER|BROKER` for people and companies asking Hermes to arrange transportation.
- Added contact name, company, role, MC/USDOT, phone, email, equipment, capacity, availability, geography, and optional load reference to the carrier lead.
- Made phone required for posted-load requests because the approved next step is a Logistics Sales call.
- Demo-load actions now carry the selected `HLB-*` reference into the carrier-access request.
- Kept public equipment wording simple and recognizable: Carrier, Owner-operator, Car Hauler, MC/USDOT, Pickup, Delivery.

### Delivery boundary

- Preview mode prepares a pre-addressed email with the correct sales subject and requires the visitor to review and send it from their email application.
- Automatic delivery is implemented behind the existing `PUBLIC_CONTACT_MODE=live` and approved HTTPS `PUBLIC_CONTACT_ENDPOINT` contract.
- No endpoint was configured, no email was sent, no lead was stored, and no production deployment was performed.

### Verification

- `npm run build`: 62 Astro files checked with zero errors, warnings, or hints; 21 routes built.
- `npm test`: static website, contact handoff, and Load Board unit checks passed.
- Focused Playwright coverage: 10 desktop/mobile Load Board scenarios passed.
- Full Playwright regression after refreshing the stale IT checks: 106 passed and 2 expected device-specific skips.

### Production release

- Owner approval to publish was received on 2026-07-28.
- Cloudflare preview: `48ce1887-4664-4aa3-ad1f-eb15883cedaa`.
- Production deployment: `d8c81528-f6b0-4aa6-8ad2-00fa12f47991`.
- Public domain: `https://hermeslogisticsus.com`.
- Verified 23 public routes plus the custom 404.
- Verified on production: homepage entry scene, Load Board city search, tagged dealer email handoff, Academy AI Automation lab, Hermes Connect, CRM and Candidate Validation content.
- Production contact audit found only `tel:+12623023626`.
- Load Board and contact forms remain in preview/email-handoff mode; no Hermes form endpoint was connected.

## 2026-07-28 — Protected Logistics Sales receiver prepared

### Implemented locally

- Added a same-origin server receiver for Load Board access and posted-load requests.
- The receiver sends only to the fixed Logistics Sales destination
  `officeus@hermeslogisticsus.com`; a visitor cannot replace the recipient or
  email subject.
- Added strict lead-type and sales-tag allowlists, request-size limits,
  required phone/email checks, 24-hour duplicate protection, and a five-request
  per-hour limit.
- Request IDs and visitor addresses are hashed before the temporary protection
  records are written. Lead content is not logged.
- A failed or unavailable delivery never returns a false success message.
- Preview wording is replaced with an accurate server-delivery record only
  after the email provider accepts the message.

### Activation boundary

- The public site remains on the working prepared-email handoff.
- Cloudflare Email Sending is not available to the current project credentials
  (`2036 Unauthorized`) and Email Routing for the domain is unconfigured.
- Email Routing was not enabled because changing MX records could disrupt the
  existing corporate mailbox.
- `wrangler.toml.example` records the restricted sender, recipient, and KV
  bindings that must be verified before live activation.

### Verification

```bash
npm run build
# 64 files checked; 0 errors, 0 warnings, 0 hints; 21 pages built.

npm test
# Static website, contact handoff, Load Board, and protected receiver checks passed.

npm run test:e2e
# 106 passed, 2 expected device-specific skips; exit code 0.
```

### Source synchronization

- The configured GitHub remote currently returns `Repository not found`.
- GitHub CLI is not installed in this workspace, so no source push or pull
  request was attempted.

## 2026-07-29 — Logistics USA organic SEO pilots

### Appleton vehicle transport

- Added `/logistics/appleton-wi-vehicle-transport/` as one substantive local
  service pilot rather than a reusable city-page generator.
- Connected private-customer, dealer, shipper, and carrier calls to action to
  the existing Load Board request forms.
- Added safe Appleton/Fox Valley prefill through non-sensitive URL parameters.
- Added Service, BreadcrumbList, and visible-FAQ-matched FAQPage structured
  data without a local office, address, rating, price, partnership, or
  guaranteed carrier claim.

### National supporting resources

- Added `/logistics/resources/auction-vehicle-pickup-checklist/` with release,
  pickup access, storage deadline, condition, equipment, delivery, and record
  preparation guidance.
- Added `/logistics/resources/car-hauler-capacity-checklist/` with carrier,
  authority, route, equipment, vehicle-fit, timing, privacy, and availability
  guidance.
- Connected both resources to Appleton, the Logistics hub, shipper/dealer and
  carrier paths, and the existing preview/email-handoff forms.
- Added truthful Article and BreadcrumbList structured data, canonical
  metadata, sitemap entries, `llms.txt` entries, static checks, and desktop and
  mobile browser coverage.

### Verification

```bash
npm run build
# 67 Astro files; 0 errors, 0 warnings, 0 hints; 24 pages built.

npm test
# 24 static routes validated; contact, Load Board, and protected receiver checks passed.

npm run test:e2e
# 120 browser scenarios completed with no failures.
```

### Publication boundary

- No advertising, paid service, Google Business Profile, external message,
  CRM/Sheets write, local address, auction affiliation, or guaranteed price,
  timing, load, rate, revenue, or carrier availability was added.
- The public forms remain in their existing preview/prepared-email handoff
  state; no live CRM or automatic carrier matching was activated.

### Production

- Appleton production deployment: `f511048a-b598-48b8-bc02-6ed7c867be81`.
- National resource production deployment: `400d81a7-f144-4479-823f-18a010951efa`.
- The Appleton page, both resource pages, and the updated sitemap returned HTTP
  200 with the expected production content and canonical URLs.
- Search Console opened under the browser's active Google account with no
  existing Hermes website property. No property, DNS record, or verification
  method was created.
