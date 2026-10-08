# I am Italy — Shopping, Affiliate and Hermes Connect CRM contract

Status: **STAGE 3 HERMES CONNECT PRODUCT LAB — SOURCED RESEARCH + FRONTEND PROTOTYPE, NOT ACTIVE COMMERCE**. Canonical delivery chain: Stage 2 Catalog PR #1785 merged at `a9b57ad84b059774b5720cb63b109dbf15af1be1` → Stage 3 PR #1787. Historical provenance only: startup task #1776, Stage 1 News #1781 and initial Italy Tax Free research #1773/#1774.

## Real user value first
Traveller flying to Italy can browse a safe, source-linked shortlist of merchants, mark shopping channels and understand which actions require a provider, an internet connection, a departing flight, and customs evidence. I am does not issue an order, collect a payment, submit a government form, sell an item, reserve airport stock, or yet earn an affiliate commission.

Country: IT. Language of first traveller/partner test: English; Italian merchant capability follows by reviewed localization. Supported screens: desktop and 390px mobile via responsive web, not a native App Store release.

## Source-checked merchant inventory (reference date 2026-10-08)
Registry: `src/data/i-am-italy-merchant-candidates.ts`. Public status `NOT PARTNERED`, affiliate `NOT APPLIED` for every entry.

| Candidate | Official source and demonstrated capability | I am financial status |
|---|---|---|
| FARFETCH | https://www.farfetch.com/it/pag1987.aspx publishes an affiliate application programme, approved-sale commissions, 30-day cookie window and feed information | Application not submitted, no signed affiliate ID or payouts |
| YOOX | https://www.yoox.com/it/affiliation/program publishes a free affiliate publisher programme and tracking links available after approval | Not enrolled, tracking links unavailable |
| Mytheresa | https://www.mytheresa.com/au/en/affiliates publishes a free-to-apply global affiliate programme with customizable links and product feeds | Application not submitted, no tracking credentials or payouts |
| Rinascente | https://www.rinascente.it/en/ publishes its online, On Demand Chat&Shop and Click & Collect channels | No affiliate programme, referral relationship or commercial agreement is verified |
| Fidenza Village | https://www.thebicestercollection.com/fidenza-village/en/visit/ describes Shop from Home and direct boutique contact; separate VAT-related services | No Hermes commission or boutique integration |
| Milan Airports Boutique | https://www.milanairports-shop.com/en/services/eboutique shows non-binding airport departure reservations, flight-dependent pricing and store payment/pickup | I am is not an airport operator or affiliate; service applies at **departure** rather than an arrival collection promise |
| Awin (candidate publisher network) | https://www.awin.com/it/pricing/affiliate-partners advertises free publisher joining; some technology partner integrations have a one-off fee | No Hermes programme membership verified; zero new spend authorized |

Official retailer URLs are direct non-affiliate links. Never add fabricated `aff_id`, click IDs, commission percentages, discounts, customer reviews, stock status, reseller status, Tax Free entitlement, merchant logos/photography or partner badges.

## Travel-provider commercial research (reviewed 2026-10-08)
These are **official public programme facts**, not I am partnerships or approved referral links.

| Provider | Public programme evidence | I am integration decision |
|---|---|---|
| Expedia Group Travel Creator Program | Official page advertises free joining, trackable links/widgets/site banners and up to 4% on qualifying bookings; rates/transactions remain subject to current account terms | `PUBLISHER_AFFILIATE_CANDIDATE`; application + terms + payout proof required |
| Skyscanner Affiliate Programme | Official page describes 30-day referral data, widgets/banners/text links and qualified-action commission | `SEPARATE_TECH_PARTNERSHIP_REQUIRED`: Skyscanner explicitly excludes technology partners from its affiliate programme |
| Viator Affiliate Program | Official resources advertise affiliate links, current 8% economics on eligible products booked within 30 days, plus widgets/partner tooling | `PUBLISHER_AFFILIATE_CANDIDATE`; verify account approval, API/surface permissions and current terms |
| DiscoverCars Affiliate Program | Official programme advertises free signup, 365-day cookie, links/widgets/landing pages/XML API; affiliate terms require application and approved links | `PUBLISHER_AFFILIATE_CANDIDATE`; only eligible completed rentals and provider reconciliation can become payout evidence |

Canonical public sources live in `src/data/i-am-provider-candidates.ts`. Never surface marketing-income estimates from provider calculators as an I am revenue forecast.

## Existing Hermes data graph (NO SECOND CRM)
`HermesIdentity -> Consent -> Business/Company -> Workspace -> Membership/Role -> Capability -> Customer/Counterparty -> Request/Intent -> Action -> Event/Receipt -> Analytics/Commission`.

Stage 0 concept: I am itself is unincorporated; no verified Company/customer row, no independent auth, D1 or revenue records. Existing Hermes Connect owner governs first authentic product activation and merchant claims. Public incubation Catalog page is `noindex` and separate from actual verified Company profiles.

Later server data contracts (only after authorized user/merchant):
- `TripIntent`: trip/session ID, permissioned identity, country, purpose, consent version, data-minimized tasks, status, createdAt.
- `Selection`: trip ID, merchant candidate ID / exact approved offer or product SKU, storefront locale, selectedAt, source page, no passport/payment/flight numbers unless explicitly authorized and strictly necessary.
- `Retailer/Partner`: canonical source, evidence owner, legal identity, review date, approved merchant adapter, permissions, programme terms and revocation.
- `AffiliateProgramme`: partner ID, approved publisher merchant programme state and effective dates; validated redirect template only after agreement; any affiliate credential stays server-side.
- `ShoppingHandoff`: user-approved redirect or API operation, idempotency key, provider identity, payload-minimization, HTTP accepted and separate provider/order confirmation.
- `CommissionLedger` (future): confirmed order reference, approved attributable sale event, network reconciliation, cancellations/returns, payable amount/currency, payout and financial audit. No commission record on unapproved click.

## Commercial status state machine
`PROGRAM_DISCOVERED -> APPLIED -> PROGRAM_APPROVED -> TRACKED_LINK_APPROVED -> CONSENTED_OUTBOUND -> PROVIDER_ORDER_VERIFIED -> RETURN_WINDOW_CLEARED -> NETWORK_SALE_APPROVED -> PAYOUT_VERIFIED`.

Do not skip stages or assume conversion: click != checkout != reservation != completed sale != approved commission != received payment. Affiliate programme approval can vary by country and campaign; only the programme portal and signed agreement confirm fees, cookie rules, required disclosure, prohibited paid-search bidding and allowable deep links.

## Travel pre-order state machine (future)
`LOCAL_SHORTLIST -> CONNECTION_RESTORED -> USER_APPROVED_MERCHANT_HANDOFF -> PROVIDER_ORDER_OR_RESERVATION_RECEIPT -> MERCHANT_FULFILLED -> USER_CONFIRMED_PICKUP`.

- Before integration, only `LOCAL_SHORTLIST` and a plain external link can be demonstrated. A direct merchant website request is not an I am order.
- Airport reserve-and-collect requires eligibility by departure flight/terminal/destination and provider acceptance. No promise of arrival pickup or offline stock.
- Merchant online checkout does not necessarily qualify for tourist VAT refunds; the seller/OTELLO/customs rule is separate from shopping and airport duty free.

## Privacy / offline / UX
Current Stage 3 web prototype is designed to run without new API calls and reuses the Hermes Connect product boundary. On an already loaded page, list editing can work without connectivity. **No claim of guaranteed offline reload/installation**: that requires separately tested authorized PWA caching and service-worker scope.
By default selected IDs live in JS page memory. An explicit checkbox writes only vetted merchant IDs to `localStorage` on the current device; users can uncheck or clear the data. No visitor passport, flight number, name, email, date of birth, token/card details, custom notes or orders are saved. Cross-device sync and identity-managed journeys require separate Hermes Connect authenticated entitlement and consent.
Page and merchant links have clear status labels: public programme != Hermes membership; catalog concept != entity/customer; generated guidance != official eligibility result.

## SEO/GEO and content
- Insights `/insights/` features a truthful first-party startup development news item in Technology; the article itself may have genuine `NewsArticle` metadata for the **announcement event only**, not Product/Offer/merchant transactional claims. The linked Catalog and application demonstrations remain noindex.
- Italy Catalog `/businesses/italy/` and I am concept `/businesses/concepts/i-am/` remain `noindex,nofollow`. The browser preview `/demos/hermes-connect/i-am-shopping/` remains `noindex,follow`. All three stay outside sitemaps/IndexNow. The ONE indexed I am editorial search owner is `/insights/technology/i-am-vision/` after production release, with no duplicate actual-product or business entity claim.
- The standalone first-party development article is now registered for the Technology feed, RSS and sitemap; noindex concept URLs are excluded. Release/HTTP 200/sitemap do **not** establish that Google has indexed, ranked or referred qualified visitors. The editorial owner controls actual publication state and Search Release Gate.
- SEO measurement after deployment: URL health/robots/canonical/age, approved real search owner only where appropriate, qualified opt-in human enquiries separate from raw clicks and referrals.

## CI / acceptance gate
- `npm run build`, release-manifest, SEO links/robots/sitemap, privacy/analytics contracts and Playwright browser desktop + mobile.
- Browser checks: six actual official merchant links; no fabricated affiliation; guest shortlist add/remove, reload without default persistence; explicit local-storage opt in/out; filtering distinguishes arrival from airport **departure**; no 390px overflow; Insights visual and Catalog country links; no new server writes.
- Production deployment must match exact merged SHA and actual URLs, followed by standard phone/browser readback. DO NOT mark live because draft PR is green.

## Roadmap inside the 14-month startup vision
M1: source-supported visual, desktop/mobile shortlist, first official affiliate applications when legal entity and account authority exist.
M2–3: consented real traveller testing, Italian localization, legal counsel for affiliate, Italy VAT and privacy; verify first 10 candidate merchants/interviews.
M4–6: approved product feeds and merchant checkout redirect, server-authoritative commission/event proof if contracts and provider API allow.
M7–9: authenticated shared Hermes user/trip account, opt-in cross-device persistence and real partner receipts, accessibility and PWA offline lifecycle.
M10–14: second country and genuinely authorized fulfillment flows, economics per approved purchase, partner payments, retention and security.

**NEXT_ACTION:** review the one-time Stage 3 rebuild in PR #1787 against exact merged Stage 2 base `a9b57ad84b059774b5720cb63b109dbf15af1be1`; require exact-head checks and merge only after the release-owner gate. After any separately authorized deployment, verify actual Cloudflare/production. Continue affiliate applications only after founder/operator legal structure and permitted commercial identity. No ad spend and no fabricated partnerships.
