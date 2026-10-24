# Hermes Investor Portal — release and evidence contract

Status: IN PROGRESS / NOT READY TO SEND (2026-10-24)
Owner: Founder / CEO; technical implementation: website lane.
Existing PR: #2055. Do not duplicate a parallel investor website.

## Purpose and scope
The investor-facing product is a controlled data room linked from the existing Hermes website, not a public fundraising offer or an unverified revenue dashboard. Support English for investors and Russian for founder review. All sensitive views must be authenticated and server-authorized.

## Investor packages
1. **Fleet / asset finance**: Hermes Logistics LLC legal identity, authorized signer, FMCSA authority and insurance, equipment purchase quotes, truck-by-truck cash flow, driver availability, maintenance and downtime reserves, downside scenario, debt service, collateral and default structure. Existing carrier network is not proof of owned trucks.
2. **Technology / venture**: issuer and IP ownership, current product matrix (live / pilot / code / concept), real demos, active users, contracts, paid revenue, architecture, roadmap, capital use and realistic milestones. 24/7 automation and 1,000 digital workers are vision until measured in production.
3. **Regional / strategic**: Academy training capacity, local compliance and partnership plan, economics of each proposed territory. 110 countries is long-term ambition, not active footprint.

## Evidence register (one record per claim)
- claim_id, product, metric_name, unit, measurement_window, source_system, source_url_or_record_id, as_of, owner, reviewer, approval_state, sensitivity, investor_visibility.
- Status enum: UNKNOWN, UNVERIFIED, VERIFIED_INTERNAL, APPROVED_EXTERNAL, RETIRED.
- NEVER render UNKNOWN or UNVERIFIED as zero, growth or achieved milestones.
- Verified figures must specify gross versus net, cash versus accrual, operating versus owned equipment, unique real humans versus QA/bots, and exact date range.
- Reconcile Drive/One Brain with current GitHub code, actual deployment and original accounting source; a green test is not production or revenue evidence.

## Required portal security before invitation
- Pre-provision investor identities by exact corporate email; email ownership verification and unique expiring password setup link; no shared or emailed permanent passwords.
- Server-side session and authorization on EVERY API and file download, not client-only route hiding.
- Separate scopes: investor summary, confidential diligence, administrator. Organization-level scope if multiple employees of a fund.
- No sensitive data in Astro static HTML, client bundles, public assets, build artifacts, caches, robots/sitemaps or unauthenticated API responses.
- Rate limiting, session revocation, short token lifetimes, secure cookies, login audit and document access audit; sanitize logs of secrets and sensitive data.
- Never infer affiliation solely from an email domain; manually approve verified contacts.
- No public sign-up. No personal financial data from founder's inbox until classified and explicitly approved for investor distribution.

## Weekly updates (publish only after review)
- Report date, previous week comparison, source evidence links, product milestone, production deployment status, verified customers, revenue where authorized, fleet metrics where authorized, risks, and next milestone.
- Data pipeline: source -> snapshot -> metric definition -> independent verification -> CEO approval -> immutable published report.
- If data missing: 'Not verified'; no invented graphs or extrapolation.
- The investor sees only reports and documents explicitly assigned to their access scope.

## Legal / compliance
- Verify the legal entity that may issue securities, beneficial ownership, intellectual property ownership, corporate approvals, US and applicable non-US securities solicitation restrictions.
- Review public landing copy with qualified counsel before production release. Avoid public valuation, equity percentage, return claims, fundraising terms, or implying an SEC exemption.
- Verify W-9 and company formation papers against Hermes Logistics LLC (not similarly named carriers). Never publish tax IDs or W-9.
- Any finance offers and agreements require authorized human approval; no automated investor solicitation or email campaign before legal review.

## Acceptance gates
- [x] English draft route on PR #2055
- [x] Russian founder-review draft route on PR #2055
- [x] Noindex, honest stage descriptions, contact CTA and cross-language links
- [x] Static contract test source added (execution still pending)
- [ ] CI build, tests and 390px/desktop browser screenshots on exact PR head
- [ ] Founder reviews both visual designs and product claims
- [ ] Legal review approves issuer/solicitation language
- [ ] Auth provider and D1/server security model reviewed; no second auth stack
- [ ] Investor account invitation and email verification tested
- [ ] Two-user isolation tests: user A cannot read user B files
- [ ] Document scopes, expiry/revocation, audit trail and rate limiting tested
- [ ] Weekly report pipeline verified against original evidence and approved
- [ ] Historical fleet financials reconciled and stress-tested
- [ ] Approved pitch deck, executive summary, financial model and data room documents
- [ ] Exact-head CI, preview and production smoke evidence
- [ ] CEO explicitly approves deployment and sending outreach


## 2026-10-24 investor programme audit checkpoint (bounded; NOT whole-company 100%)
- Verified source inventory: 25 owned private plugin packages listed by Plugin Creator (presence only, NOT runtime health), current One Brain Execution & Ideas Ledger, AI Error & Lesson Register, Finance Control Tower, investor PR #2055 and original #1011, HAE current synthesis and selected domain Docs.
- Knowledge Curator plugin release v0.1.76 confirmed; new investor-evidence-portfolio skill exists and preserves existing onboarding. No 26th plugin created.
- Existing global Ledger rows `W-20261024-102` through `W-20261024-106` are the cross-domain investor work owners. Business-domain backlogs and errors stay canonical; do not duplicate tasks in this document.
- English and Russian public pages now map **7 product/operating areas** from a single bilingual `src/data/investor-public-portfolio.ts`, with distinct truthful evidence levels, public destination links and cross-language metadata. Seven areas != seven commercially launched products.
- The Opportunities hub adds a contextual Investor Relations overview link. Current investor routes are still `noindex,nofollow`; being SEO/AEO-ready is not equivalent to searchable/indexed.
- A CI contract run on an earlier PR head failed because two routes were missing from the route-release manifest. The bounded fix is `docs/release-manifest-deltas/2026-10-24-investor-relations-en-ru.json`; exact-head rerun must PASS before any merge.
- Repository currently has functioning static Astro rendering for various public services; no independent private investor auth, published investor report, bank-settled fleet gross model or signed investor offer is verified.
- HAE elsewhere has specific limited successful Cloudflare Queue/Worker/D1 dry-run/read-only replay proofs and merged no-LLM scheduling components. These do NOT prove 24/7 customer-business automation or investor reporting. HAE implementation ownership remains exclusively with its existing engineering lane/chat.
- Finance Control Tower's seven exception records are operational reconciliation leads, not an audited 24-month truck-level profit report. Do not expose carriers, invoice detail or settlement assertions on the public investor route.
- SEC general solicitation guidance: public web investment advertising may trigger securities rules even without direct purchase links. A counsel-approved public corporate information strategy and the Search Release Gate must precede indexability; no securities terms or anticipated returns published in the meantime.

## Investor product-map evidence precedence
`CEO directive -> first-party live readback -> current main/CI -> domain-source facts -> historical planning`.
Each project stage records distinct flags `SOURCE_FOUND, CODE, CI, MERGED, DEPLOYED, LIVE, REAL_USER, REVENUE, CASH_SETTLED`. Missing flags are `UNKNOWN`; no global percent without an inventoried denominator and explicit stage definitions.

## Continuation pointer / Investment Program 2
1. Current single website PR: https://github.com/officeus-create/Hermes/pull/2055 ; latest release-manifest regression must go green first.
2. Reconcile public copy to all 7 current domain sources, independently run 390px + desktop screenshots, review search/legal noindex state.
3. Source-check ownership, trucking authority, 24-month truck asset-level gross/fuel/driver/repair/insurance/capex/debt before modeling a fleet investment.
4. Technology + Access Governor + Security design the pre-existing-auth investor role, private documents and org isolation with explicit fail-closed tests; never display a fake login page.
5. Source-scoped weekly metrics only through existing One Brain + HAE after independent QA/Finance and CEO publishing gate. No second queue or schedule.
6. Continue iterative source-passport audit by one domain, update existing Ledger `W-20261024-103` and domain owners, promote validated lessons into existing 25 plugins. Mark every source class separately; don't call this first pass a full ecosystem audit.


## Chronology audit C001 — oldest-first reconciliation (2026-10-24)
Coverage: BOUNDED, not a claim that all past Drive, GitHub or Cloudflare artifacts were inspected. The user's first available recorded business history and the first versions of key documents are more valuable than treating a recent summary as the beginning of the company.

| Original period | Evidence class | Next/current authority | Correct current disposition |
| --- | --- | --- | --- |
| 2020 | Old access-control workbook metadata exists in Drive | Existing Access Registry + identity/security owner | METADATA_ONLY; credential content deliberately not inspected, never copy to investor/public surfaces |
| 2022 | Dated transaction rows in historical car-hauling workbook; carrier-facing price and dispatch invoice are separate columns | Source S014 in canonical One Brain; Finance owns reconciled meaning | HISTORICAL_OPERATING_EVIDENCE, not proof of Hermes-owned trucks or bank settlement |
| May–Oct 2024 | Original Hermes business plan and Google revision history; initial company founding year later corrected | S015; current `docs/CANONICAL_COMPANY_FACTS_APPROVAL.md` lists Wisconsin legal formation 2018-11-01 | LEGAL_YEAR_CORRECTED; historical revision must remain archival, not current claim |
| 2024 investment forecast | Historical projections and model of carrier network gross and investor participation | Finance + CEO + securities counsel | FORECAST_ONLY / NOT_APPROVED_FOR_EXTERNAL_INVESTOR_OFFER; no ROI or revenue number can be copied to site |
| 2024–2026 operations | Master `Loads`, monthly reports, invoices, drivers and carrier data in a dated operational workbook | S016, `W-20261024-104`, current Finance Control Tower | DATA_AVAILABLE / DEDUP_RECONCILIATION_REQUIRED; sheet `PAID` is not bank receipt |
| 2025 | Sales CRM/workforce database and operational history | S017, existing Sales/Finance lanes | INVENTORIED_NOT_FULLY_AUDITED; do not count CRM contacts as customers |
| July–Aug 2026 | GitHub issue #1 added GA4 sitewide tag; early release manifest issue #87; entity-history issue #204 | Current consented analytics event registry, current release-manifest checks, approved company facts + separate Work.ua issue #515 | Code installation/release manifest and legal year are **scope-limited** resolved; actual GA4 business attribution and Work.ua corrections remain separate verification work |
| Oct 2026 | Investor site, portfolio and HAE technical steps | Existing PR #2055; One Brain W-102..106; HAE separate workstream | Investor story CODE/CI stage until separate merge, production, counsel, actual metrics, auth and data-room approval |

### Concrete bounded data quality observation
From the first 220 source rows of `Loads` and `JAN26_Report` in the historical OFFICE operating workbook, 141 normalized shipment signatures appear in both views. This is **cross-tab materialization overlap**, not evidence of 141 double-booked real shipments or duplicated bank payments. A naive sum of the two tabs would overstate sampled shipment activity; Finance must define one transaction grain and join against invoice/bank evidence. User-approved source-specific analysis remains internal to One Brain.

### Capital/revenue staircase — decision hypothesis, not an investment offer
1. **First proof:** reconcile existing logistics-service fee and digital-service revenues, cash settlement, customer/customer-retention evidence and true operating margins.
2. **First low-capital commercial scale:** acquire/retain paying dispatch, website, SEO/GEO and marketing customers through proven products; cap new fixed spend until customer acquisition payback is observable.
3. **First asset-financed pilot:** only if truck-level historical/quote-backed economics, driver readiness, USDOT/MC legal entity path, authority, insurance, maintenance reserves, collateral and debt service pass Finance/Compliance. Distinguish trucking equipment investor from software-equity investor and avoid a portfolio-wide unsupported ROI.
4. **Second product layer:** feed real operating insights into authorized Load Board and CRM demand loops; improve HAE deterministic processes when reliable and useful, not as a standalone cost center.
5. **Regional scaling:** train qualified staff and run a measured pilot office/partner team per country via Academy; expand internationally only after actual local conversion and legal feasibility.

**Next C002 source chain:** independently date and review July/Aug 2026 One Brain/early GitHub history; follow each issue through its most recent status, especially company identity #204→#515, analytics #1→event proof, Load Board early product boundaries→current source-rights/runtime. Latest source and proof supersede historical text, but do not delete originals.


## C003 — historical issue outcome split (2026-10-24; source-grounded, no public claims promotion)

This batch reconciles earlier August–September execution history with independently reread current GitHub issue and PR metadata. It is NOT a full source inventory, legal or finance assurance opinion.

| Capability chain | Old technical work | Current commercial / operational gate | Canonical current owner | Investor-claim grade |
| --- | --- | --- | --- | --- |
| Corporate identity #204→#515 | #204 closed for bounded owned-site entity/search work; approved legal-facts file records Wisconsin formation 2018-11-01 | External Staff.am/Work.ua conflicting profile values and verified correcting account remain OPEN under HR #515; exact current platform facts still must be reread, not inferred from older snapshots | `W-20261010-038`, HR; Search separately validates external corroboration | Approved entity identity ONLY; no employee/office/agency totals |
| GA4 #1→#206→PR #2004 | #1 closed for tag installation, #206 closed for owner-provided measurement framework/SEO hygiene; `TrackingConsent` and source event contracts exist | GA4 platform exactly-once receipt, consent withdrawn state, qualified user→receiver→revenue and GSC/Bing authenticated outcomes NOT proven; PR #2004 OPEN, marked nonmergeable at current metadata read | `W-20261004-047`, Technology consent reviewer and Marketing attribution | CODED / engineering; revenue attribution UNKNOWN |
| Load Board #1252→#1838/#1839→#1836 | Load Board curtain and permissioned Carrier/Dispatcher/Dealer-Shipper workspace PRs merged; #1836 carries recorded bounded production/release receipts | Real source entitlement, live genuine offered loads with expiration, Dispatch 107 authorized login and one actual carrier/dealer shipment flow remain unverified in this bounded audit | `W-20261012-028/029`, Dispatch OS, existing #1836 | Bounded deployed interface, NOT a revenue-generating public board |
| Connect #585→#960→#510 | #585 monetization coordination closed; existing Repair PWA/auth/booking/operations have test/release receipts; website factory #1033 merged | #960 and #510 still OPEN: one approved real shop owner completing first booking→processing→repeat and payment decision, no verified paid MRR in this batch | `W-20261012-032`, `W-20261011-034`, Technology & Sales/COO | Product/pilot only; paying retention UNKNOWN |
| Fleet historical data 2022–26→financing | Old car-hauling logs, OFFICE master/monthly sheets and invoice snapshots exist; sampled 141 master-vs-Jan-report duplicate shipment signatures in first 220-row windows | Bank settlements, Hermes fee ownership, 24-month net contribution, fuel/repairs, owned equipment, authority and financing offers not reconciled. Gmail 2025 factoring/referral correspondence is NOT an equipment purchase quote. | `W-20261024-104`, Finance | HISTORICAL_DATA only; equipment ROI NOT PUBLISHABLE |

The issue status `CLOSED` applies to the bounded implementation/hand-off objective, not automatically to the independent current business KPI. Conversely, an `OPEN` program parent does not mean its listed code should be rebuilt. Always link predecessor and successor before touching either.

### C004 — the first two cash-evidence gates, not a new product
1. **Logistics first:** prove the actual **Hermes earned fee** and settled receipt from one bounded existing carrier/dispatch activity; exclude third-party carrier transportation GROSS, unpaid invoice statuses and repeated monthly views. The old 2022–2026 records permit a reconciliation investigation but not an investor return claim. Use existing Finance Control Tower and `W-20261024-104`.
2. **Digital services first:** select an existing website/SEO/marketing customer/opportunity and trace source→deliverable→invoice→settlement→renewal only where verified. If no historical cash can be proven, preserve UNKNOWN and test one authorized low-capital paid offer; do not invent a client, change sales offers or send outreach without approval.
3. If both proof chains support a positive contribution margin, propose a **single-vehicle** independent car-hauling equipment financing pilot with full actual cash needs, legal carrier authority/insurance, maintenance/fuel reserves, downside scenario and debt-service margin. Keep specialized asset-backed financiers separate from strategic business partners and potential software venture investors.
4. No cross-company completion percentage; report verified counts per source gate, product, and time period. Investor material never contains private mail attachments, contracts, employee contact info, W-9, fuel receipts or internal ledger URLs.

**Current PR evidence:** `b5cf7ca4b4587971391100b5864ed292cc717d98` achieved `Website checks=SUCCESS` and `Open-source web quality audit=SUCCESS` on the recorded head. Subsequent PR changes trigger fresh CI. `PR #2055` remains OPEN/DRAFT, noindex and neither legally approved nor production/live verified. Public preview URLs were unavailable to unauthenticated readback, not evidence of 404.

**Continuation C005:** take the earliest true settled fee and a true digital-services sale (or document SOURCE_GAP), quantify source coverage, compare against historical $50k proposal without resurrecting returns; then audit the 2026 Oct auth/cloud-runtime source chain separately from One Brain.

## Release rule
Do not mark READY_TO_SEND until all mandatory gates above are evidenced. Do not send investment emails, upload private documents, or merge/deploy as part of drafting.
