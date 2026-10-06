# SEO Authority Registry — 2026-08-14

Status: `PRIMARY-SOURCE + EXISTING-ASSET MAPPED / NO OUTREACH SENT`

Owner issue: #368  
Dependencies: current canonical company facts, Recruiting/HR Work.ua correction #515, on-demand measurement under `docs/SEARCH_GROWTH_GUARDRAIL.md`, preserved fail-closed proof permission policy from historical #362 (closed; do not reopen)  
Closed provenance: #204 entity reconciliation; #206 generic measurement router

## Purpose

Build a small, high-relevance authority/referral pipeline for Hermes without paid-link schemes, fake partner pages, PBNs, mass directory submissions, fabricated press, or unsupported company claims.

This registry records **opportunities**, not backlinks. Membership, editorial acceptance, directory inclusion, publication, referral traffic, and qualified referrals must be verified separately.

## Current baseline

The 2026-08 SEO14 handoff historically reported **4 GSC external links**, all attributed to Work.ua. Treat that number as dated provenance, **not a current backlink count**.

Fresh owner-provided Bing evidence reconciled on 2026-10-05/06 separately flags insufficient high-quality inbound domains as a current authority recommendation. That supports keeping earned authority as a real growth lane, but it does not justify mass link acquisition or imply that a specific backlink count caused ranking movement.

The primary goal remains useful, relevant referring domains and qualified referral traffic. Raw backlink count is not the KPI.

## Activation rules

Before any outreach or application:

1. destination URL must be production-healthy and canonical;
2. identity facts used in the pitch must match the current canonical company-facts approval matrix; Work.ua contradictions remain routed to #515;
3. no unsupported agency count, employee count, fleet, customer, revenue, ranking, award, or result claim;
4. proof-dependent pitches remain blocked unless the preserved case-specific permission/rights policy from closed #362 is independently cleared; do not reopen #362;
5. paid advertising/sponsorship is never counted as earned editorial authority;
6. external outreach belongs to Sales/Partnerships operations, not the SEO implementation thread; SEO supplies target, destination, evidence and measurement requirements.

## Primary-source verification refresh — 2026-08-14

The first four priority organizations were rechecked against their own current public membership/publication pages before activation:

- **WMCA:** current 2026 membership page explicitly offers an Allied (non-trucking company) membership at **$650/year**; the association also publishes a membership list and identifies non-trucking allied members by category. This confirms a legitimate eligibility path, but membership remains a business decision rather than an SEO purchase.
- **WATDA:** current membership page explicitly allows Associate Membership for suppliers/vendors to dealers, advertising agencies, allied automotive businesses and consultants. Audience fit is strong for dealer-facing transport, but Hermes company facts must be reconciled before any application.
- **TIA:** the current public directory separates Regular 3PL members from Marketplace Associate members. The associate join path exists, but Hermes must first be classified truthfully by legal/operating fit rather than choosing a category for SEO convenience.
- **NAAA:** current membership rules allow Associate Members only in defined categories such as Supplier/Publisher or Remarketer and require pre-qualification/review. The public member map exists. Hermes eligibility is therefore plausible only if current operations truthfully match one of those categories.
- **WATDA Dealer Point:** the current public page clearly exposes paid advertising. A separate earned editorial-contribution path was not verified in this refresh, so paid placement is explicitly **not** counted as earned authority.

## Primary-source editorial refresh — 2026-10-06

A bounded first-party review added three **editorial-first, no-paid-link** routes. These are opportunities only; editorial acceptance, publication, links, referral traffic and business outcomes remain unproven until separately observed.

- **Inbound Logistics:** current guest-editorial guidance accepts non-promotional supply-chain submissions on a rolling basis, limits an organization to one submission in a 12-month period, and requires a real author name/title/contact information plus an author photo. Editorial submissions/story ideas are also accepted through the publication's editorial route. Current gate: `HOLD_AUTHOR_IDENTITY`; Hermes does not yet have an approved public author/contact/photo package for this use. Sources: `https://www.inboundlogistics.com/guest_byline_specs/`, `https://www.inboundlogistics.com/editorial-submissions/`.
- **FreightWaves Playbook:** the current "Share Your Story" page invites drivers, owner-operators and industry professionals to submit road stories, industry takes and trucking-related story ideas. Current gate: `HOLD_IDENTITY_RIGHTS`; use only a real permissioned contributor/story and never convert private carrier history into public proof. Source: `https://www.freightwaves.com/share-your-story`.
- **Auto Remarketing:** the current editorial-team page exposes active editorial contacts, and a publication-owned editorial note explicitly invites story ideas/comments/suggestions from automotive-industry participants. Current gate: `READY_FOR_NON_PROMOTIONAL_IDEA / NO_SEND_SEO_THREAD`; the strongest Hermes basis is the existing auction-vehicle-pickup workflow/checklist, without unsupported customer, scale or performance claims. Sources: `https://www.autoremarketing.com/editorial-team/`, `https://www.autoremarketing.com/ar/analysis/editor-auto-remarketing-goes-international/`.

Decision: prioritize these editorial routes ahead of paid memberships **only when their identity/rights gates are truthful and the topic genuinely serves the publication's audience**. SEO does not send the pitch; approved external contact belongs to the existing Sales/Partnerships communication lane.

## Existing linkable-asset audit — 2026-08-14

Repository review found that a new authority page is **not justified**. Hermes already has useful indexable resources that are stronger citation destinations than a generic commercial homepage:

- `/logistics/resources/new-authority-car-hauler-readiness-checklist/` — eight readiness checks, a decision tree, FAQs, Article/Service/FAQ schema, and explicit no-guarantee/regulatory boundaries; strongest first asset for carrier/new-authority audiences such as WMCA.
- `/logistics/resources/car-hauler-capacity-checklist/` — six actionable capacity areas, practical update structure, privacy boundaries, and carrier review path; supporting WMCA/carrier asset.
- `/logistics/resources/auction-vehicle-pickup-checklist/` — seven-step release/access/storage/condition/equipment/delivery/records checklist with auction-specific boundaries; strongest current WATDA/NAAA citation asset.
- `/logistics/resources/broker-setup-packet-checklist/` — eight broker setup areas, document-security boundaries, workflow, FAQ, Article/Service/FAQ schema; strongest current TIA/broker-carrier resource asset.

Decision: `EXISTING_ASSET_REUSE / NO_NEW_AUTHORITY_URL`.

Do not create another checklist or association-targeted landing page merely to obtain links. Improve an existing owner only when a concrete editorial/audience requirement exposes a real content gap.

## Opportunity registry

| ID | Target | Opportunity class | Why relevant | Intended Hermes destination | Status | Gate / next SEO decision |
|---|---|---|---|---|---|---|
| AUTH-001 | Wisconsin Motor Carriers Association (witruck.org) | Industry association / legitimate citation | Current 2026 WMCA membership explicitly supports Allied non-trucking companies; public member lists include non-trucking service categories. | `/logistics/resources/new-authority-car-hauler-readiness-checklist/` (primary); `/logistics/resources/car-hauler-capacity-checklist/` (supporting) | `PRIMARY_SOURCE_VERIFIED_HOLD_IDENTITY` | Reconcile canonical Hermes facts first. Current allied dues are a business/membership decision and must never be justified as buying a backlink. |
| AUTH-002 | WMCA public membership list | Association member directory | WMCA currently publishes company, city, state and member type; legitimate membership can create a relevant trucking-industry citation. | `/paths/logistics/` for entity listing; resource asset only where editorially relevant | `DEPENDENT_ON_AUTH-001` | Only valid as an outcome of genuine membership. No directory-only application. |
| AUTH-003 | Transportation Intermediaries Association (tianet.org) | 3PL / marketplace association | TIA currently separates Regular 3PL members from Marketplace Associate suppliers/shippers/other members and exposes a join flow. | `/logistics/resources/broker-setup-packet-checklist/` for resource context; `/paths/logistics/` for entity context | `PRIMARY_SOURCE_VERIFIED_HOLD_FIT` | Determine Hermes' truthful operating category before any application; do not select a category merely for directory presence. |
| AUTH-004 | TIA Member Directory | Association member directory | Current directory separates Regular 3PL and Marketplace Associate membership. | `/paths/logistics/` | `DEPENDENT_ON_AUTH-003` | Directory presence is an outcome of legitimate membership, not a standalone link target. |
| AUTH-005 | TIA resource ecosystem | Expert contribution / resource citation | TIA publishes broker, carrier-selection, fraud and business-practice resources relevant to Hermes operational knowledge. TIA also publicly invites article submissions as part of its member-engagement program. | `/logistics/resources/broker-setup-packet-checklist/` | `PRIMARY_SOURCE_VERIFIED / HOLD_MEMBERSHIP_FIT` | Editorial contribution route is real, but current public evidence frames it as member engagement. Activate only after AUTH-003 truthful membership/operating-category fit is cleared; no SEO-only membership, mass guest-post outreach or backlink guarantee. |
| AUTH-006 | Wisconsin Automobile & Truck Dealers Association (watda.org) | Automotive/dealer association / legitimate citation | Current WATDA rules allow Associate Membership for suppliers/vendors, allied automotive businesses and consultants serving the dealer industry. | `/logistics/resources/auction-vehicle-pickup-checklist/` for useful-content context; `/logistics/dealer-vehicle-transportation/` for commercial context | `PRIMARY_SOURCE_VERIFIED_HOLD_IDENTITY` | Strong dealer-audience fit. Reconcile canonical company facts and confirm genuine business value before membership/application. |
| AUTH-007 | WATDA Dealer Point | Member publication / paid advertising | Dealer Point is a current quarterly WATDA member publication and exposes an advertising path. | Dealer/auction resource only if a separate legitimate campaign is approved | `NOT_EARNED_AUTHORITY` | Paid advertising is not an earned backlink KPI. No SEO activation unless a separate marketing/business case exists. |
| AUTH-008 | National Auto Auction Association (naaa.com) | Vehicle remarketing association | Current NAAA rules allow Associate Members only in bounded Supplier/Publisher, Remarketer or State Independent Auto Dealer Association categories. | `/logistics/resources/auction-vehicle-pickup-checklist/` | `PRIMARY_SOURCE_VERIFIED_HOLD_FIT` | Confirm Hermes truthfully fits Supplier/Publisher or Remarketer criteria. Pre-qualification/review is required; no SEO-only application. |
| AUTH-009 | NAAA member ecosystem / member map | Association/auction-network discovery | NAAA currently operates a public member map/search for auctions and industry professionals. | `/logistics/resources/auction-vehicle-pickup-checklist/` only where editorial/resource context exists; entity listing remains `/paths/logistics/` | `DEPENDENT_ON_AUTH-008` | Do not seek listing without legitimate approved membership/relationship. |
| AUTH-010 | Intermodal Association of North America (intermodal.org) | 3PL/intermodal association / member directory | IANA publishes a member ecosystem spanning 3PL, motor-carrier, rail, marine, supplier and associate participants. | `/paths/logistics/` | `RESEARCHED_HOLD_FIT` | Hermes must have a truthful intermodal/3PL fit before activation; do not broaden service claims merely to qualify. |
| AUTH-011 | Transportation Development Association of Wisconsin (tdawisconsin.org) | Wisconsin transportation association / directory | TDA is a statewide Wisconsin transportation alliance whose public membership includes businesses, organizations, government units and individuals, and it publishes a current member directory. | `/paths/logistics/` | `PRIMARY_SOURCE_VERIFIED / HOLD_BUSINESS_FIT` | Relevant route and directory are verified, but Hermes membership value/fit and current Wisconsin entity facts still require an owner business decision. No SEO-only membership. |
| AUTH-012 | Metropolitan Milwaukee Association of Commerce (mmac.org) | Local business association / citation | Local Milwaukee business/entity relevance could be useful if Hermes' Milwaukee identity is owner-approved and membership has real business value. | `/about/`, `/company-information/` or `/paths/logistics/` | `RESEARCHED_HOLD_IDENTITY` | Verify current membership/directory terms and canonical Milwaukee facts before activation. |
| AUTH-013 | WPG Shippers Association (wpg.org) | Shipper/logistics association | WPG publicly offers multiple membership classes, including 3PL membership, but current eligibility is bounded by Wisconsin/Upper Michigan presence and/or authorized commodities produced in Wisconsin or Michigan depending on category. | Shipper/dealer canonical owner if factual service fit is confirmed | `PRIMARY_SOURCE_VERIFIED / HOLD_ELIGIBILITY` | Route is real, but Hermes eligibility and commercial value are not yet proven. Do not apply for membership for SEO alone or broaden service/geography claims to qualify. |
| AUTH-014 | Work.ua Hermes employer profile | Existing owned-profile citation | Current public Hermes employer profile and one Car Hauling Dispatcher job are discoverable and are the reported source of current GSC external links. | `/careers/car-hauling-dispatcher/` | `EXISTING_CITATION / JOB_PRODUCTION_VERIFIED / ENTITY_RECONCILIATION_PENDING` | Job URL is production verified. Profile facts/Telegram copy still require Recruiting/HR handling in #515; SEO validates entity consistency and index behavior only. |
| AUTH-015 | Staff.am Hermes employer profile | Existing owned-profile citation | Direct EN/RU public readback on 2026-10-06 shows the Hermes domain with restrained logistics copy; the former conflicting foundation year, employee count, location, benefit and phone fields are no longer visible. | `/logistics/careers/` or canonical job page when an active matching role exists | `EXISTING_CITATION / PUBLIC_FACTS_RECONCILED_2026-10-06 / ACCESS_OWNER_UNKNOWN` | Preserve the corrected public state. Authenticated ownership is needed only for a future edit or if the public profile regresses; do not route this row back into #515 merely because Work.ua remains open. |
| AUTH-016 | Inbound Logistics guest editorial / story idea | Earned editorial / expert contribution | Current first-party guidelines accept non-promotional supply-chain editorials and story ideas; audience includes transportation/logistics buyers. | `/logistics/resources/broker-setup-packet-checklist/` or another mapped resource only as factual background/context where editorially relevant; no link guarantee | `PRIMARY_SOURCE_VERIFIED_HOLD_AUTHOR_IDENTITY` | Requires a real approved author name/title/contact/phone/photo package and non-promotional copy. One submission/company/12 months. Do not fabricate a reviewer/person or send from SEO before identity approval. |
| AUTH-017 | FreightWaves Playbook — Share Your Story | Earned editorial / industry perspective | Current first-party route invites drivers, owner-operators and industry pros to contribute trucking stories, industry takes and story ideas. | `/logistics/resources/new-authority-car-hauler-readiness-checklist/` only where a real contributor's topic naturally supports it; no link guarantee | `PRIMARY_SOURCE_VERIFIED_HOLD_IDENTITY_RIGHTS` | Requires a real permissioned contributor/story. Do not repurpose private carrier/customer records, closed proof candidates or synthetic personas as public editorial material. |
| AUTH-018 | Auto Remarketing editorial team / story ideas | Earned editorial / automotive remarketing idea | Current editorial contacts are public and publication-owned editorial copy has invited automotive-industry story ideas; strong audience fit for auction/dealer vehicle-movement process insight. | `/logistics/resources/auction-vehicle-pickup-checklist/` as factual topic basis; no commercial result claim and no link guarantee | `EDITORIAL_CONTACT_VERIFIED / READY_FOR_NON_PROMOTIONAL_IDEA / NO_SEND_SEO_THREAD` | Prepare only a neutral auction/dealer transport-workflow idea after author/source identity is approved. External pitch belongs to Sales/Partnerships; record acceptance/publication/referral separately. |

## Rejected / not-counted patterns

- paid advertorial or sponsorship sold primarily for a followed link;
- generic guest-post marketplace;
- PBN/link farm or bulk directory network;
- exact-match-anchor package;
- reciprocal-link bundle;
- fake local office/location directory entry;
- paid WATDA/MMAC/association advertising counted as earned authority;
- association membership purchased only for SEO with no genuine business fit;
- unrelated same-name Hermes profiles.

## First SEO activation sequence

1. **Completed:** `/careers/car-hauling-dispatcher/` has an exact production JobPosting PASS and was included in the accepted 109-URL IndexNow batch. Search-engine indexing remains a separate platform state.
2. Keep Staff.am in its corrected public state. Use Recruiting/HR #515 only for the still-conflicting Work.ua employer profile, then return dated visible evidence to the current canonical entity inventory.
3. Keep AUTH-014/015 as citations, not earned editorial authority.
4. Eligibility research ranks: **WMCA → WATDA → TIA → NAAA**. WMCA/WATDA are strongest audience-fit candidates; TIA/NAAA require stricter operating-fit classification.
5. **Completed at SEO asset layer:** do not build a new linkable page. Use the mapped existing resource for each audience and only add content when a concrete target exposes a real gap.
6. Any actual email, partner contact, membership application or commercial negotiation is handed to Sales/Partnerships/Operations; SEO receives the published URL and referral measurement outcome.

## KPI fields for activation

For each activated row record only public-safe aggregate state:

`authority_id | relationship_state | outreach_status | response_status | published_url | first_seen | last_checked | referral_sessions | qualified_referrals | notes`

Do not store personal emails, private contact data, credentials, customer/carrier data or message bodies in this registry.
