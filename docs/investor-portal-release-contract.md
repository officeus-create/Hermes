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

## Release rule
Do not mark READY_TO_SEND until all mandatory gates above are evidenced. Do not send investment emails, upload private documents, or merge/deploy as part of drafting.
