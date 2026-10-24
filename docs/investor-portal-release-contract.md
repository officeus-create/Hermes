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

## Release rule
Do not mark READY_TO_SEND until all mandatory gates above are evidenced. Do not send investment emails, upload private documents, or merge/deploy as part of drafting.
