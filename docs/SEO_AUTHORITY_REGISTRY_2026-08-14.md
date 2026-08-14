# SEO Authority Registry — 2026-08-14

Status: `PRIMARY-SOURCE + EXISTING-ASSET MAPPED / NO OUTREACH SENT`

Owner issue: #368  
Dependencies: #204 entity consistency, #206 measurement, #362 proof permissions  
Recruiting employer-profile operations handoff: #515

## Purpose

Build a small, high-relevance authority/referral pipeline for Hermes without paid-link schemes, fake partner pages, PBNs, mass directory submissions, fabricated press, or unsupported company claims.

This registry records **opportunities**, not backlinks. Membership, editorial acceptance, directory inclusion, publication, referral traffic, and qualified referrals must be verified separately.

## Current baseline

Authenticated SEO14 handoff reports only **4 GSC external links**, all attributed to Work.ua. This is a discovery/authority bottleneck, but raw backlink count is not the KPI. The primary goal remains useful referring domains and qualified referral traffic.

## Activation rules

Before any outreach or application:

1. destination URL must be production-healthy and canonical;
2. identity facts used in the pitch must be reconciled through #204/#515;
3. no unsupported agency count, employee count, fleet, customer, revenue, ranking, award, or result claim;
4. proof-dependent pitches remain blocked by #362;
5. paid advertising/sponsorship is never counted as earned editorial authority;
6. external outreach belongs to Sales/Partnerships operations, not the SEO implementation thread; SEO supplies target, destination, evidence and measurement requirements.

## Primary-source verification refresh — 2026-08-14

The first four priority organizations were rechecked against their own current public membership/publication pages before activation:

- **WMCA:** current 2026 membership page explicitly offers an Allied (non-trucking company) membership at **$650/year**; the association also publishes a membership list and identifies non-trucking allied members by category. This confirms a legitimate eligibility path, but membership remains a business decision rather than an SEO purchase.
- **WATDA:** current membership page explicitly allows Associate Membership for suppliers/vendors to dealers, advertising agencies, allied automotive businesses and consultants. Audience fit is strong for dealer-facing transport, but Hermes company facts must be reconciled before any application.
- **TIA:** the current public directory separates Regular 3PL members from Marketplace Associate members. The associate join path exists, but Hermes must first be classified truthfully by legal/operating fit rather than choosing a category for SEO convenience.
- **NAAA:** current membership rules allow Associate Members only in defined categories such as Supplier/Publisher or Remarketer and require pre-qualification/review. The public member map exists. Hermes eligibility is therefore plausible only if current operations truthfully match one of those categories.
- **WATDA Dealer Point:** the current public page clearly exposes paid advertising. A separate earned editorial-contribution path was not verified in this refresh, so paid placement is explicitly **not** counted as earned authority.

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
| AUTH-005 | TIA resource ecosystem | Expert contribution / resource citation | TIA publishes broker, carrier-selection, fraud and business-practice resources relevant to Hermes operational knowledge. | `/logistics/resources/broker-setup-packet-checklist/` | `EXISTING_ASSET_READY / EDITORIAL_ROUTE_RESEARCH_ONLY` | Verify an actual editorial contribution route before preparing any pitch; no mass guest-post outreach. |
| AUTH-006 | Wisconsin Automobile & Truck Dealers Association (watda.org) | Automotive/dealer association / legitimate citation | Current WATDA rules allow Associate Membership for suppliers/vendors, allied automotive businesses and consultants serving the dealer industry. | `/logistics/resources/auction-vehicle-pickup-checklist/` for useful-content context; `/logistics/dealer-vehicle-transportation/` for commercial context | `PRIMARY_SOURCE_VERIFIED_HOLD_IDENTITY` | Strong dealer-audience fit. Reconcile canonical company facts and confirm genuine business value before membership/application. |
| AUTH-007 | WATDA Dealer Point | Member publication / paid advertising | Dealer Point is a current quarterly WATDA member publication and exposes an advertising path. | Dealer/auction resource only if a separate legitimate campaign is approved | `NOT_EARNED_AUTHORITY` | Paid advertising is not an earned backlink KPI. No SEO activation unless a separate marketing/business case exists. |
| AUTH-008 | National Auto Auction Association (naaa.com) | Vehicle remarketing association | Current NAAA rules allow Associate Members only in bounded Supplier/Publisher, Remarketer or State Independent Auto Dealer Association categories. | `/logistics/resources/auction-vehicle-pickup-checklist/` | `PRIMARY_SOURCE_VERIFIED_HOLD_FIT` | Confirm Hermes truthfully fits Supplier/Publisher or Remarketer criteria. Pre-qualification/review is required; no SEO-only application. |
| AUTH-009 | NAAA member ecosystem / member map | Association/auction-network discovery | NAAA currently operates a public member map/search for auctions and industry professionals. | `/logistics/resources/auction-vehicle-pickup-checklist/` only where editorial/resource context exists; entity listing remains `/paths/logistics/` | `DEPENDENT_ON_AUTH-008` | Do not seek listing without legitimate approved membership/relationship. |
| AUTH-010 | Intermodal Association of North America (intermodal.org) | 3PL/intermodal association / member directory | IANA publishes a member ecosystem spanning 3PL, motor-carrier, rail, marine, supplier and associate participants. | `/paths/logistics/` | `RESEARCHED_HOLD_FIT` | Hermes must have a truthful intermodal/3PL fit before activation; do not broaden service claims merely to qualify. |
| AUTH-011 | Transportation Development Association of Wisconsin (tdawisconsin.org) | Wisconsin transportation association / directory | TDA Wisconsin maintains a transportation-stakeholder membership ecosystem. | `/paths/logistics/` | `RESEARCHED_HOLD_ELIGIBILITY` | Verify membership category, value beyond SEO, and exact Wisconsin entity facts. |
| AUTH-012 | Metropolitan Milwaukee Association of Commerce (mmac.org) | Local business association / citation | Local Milwaukee business/entity relevance could be useful if Hermes' Milwaukee identity is owner-approved and membership has real business value. | `/about/`, `/company-information/` or `/paths/logistics/` | `RESEARCHED_HOLD_IDENTITY` | Verify current membership/directory terms and canonical Milwaukee facts before activation. |
| AUTH-013 | WPG Shippers Association (wpg.org) | Shipper/logistics association | Wisconsin-based shipper/logistics relevance may fit a genuine relationship. | Shipper/dealer canonical owner if factual service fit is confirmed | `RESEARCH_ONLY` | Confirm eligibility and commercial relevance; no SEO-only membership. |
| AUTH-014 | Work.ua Hermes employer profile | Existing owned-profile citation | Current public Hermes employer profile and one Car Hauling Dispatcher job are discoverable and are the reported source of current GSC external links. | `/careers/car-hauling-dispatcher/` | `EXISTING_CITATION / JOB_PRODUCTION_VERIFIED / ENTITY_RECONCILIATION_PENDING` | Job URL is production verified. Profile facts/Telegram copy still require Recruiting/HR handling in #515; SEO validates entity consistency and index behavior only. |
| AUTH-015 | Staff.am Hermes employer profile | Existing owned-profile citation | Staff.am has a Hermes company profile, domain reference and historical job presence. | `/logistics/careers/` or canonical job page when an active matching role exists | `EXISTING_CITATION_NEEDS_RECONCILIATION` | Employee count/founding-year/company-copy conflicts with Work.ua; resolve via #515 before treating as clean entity evidence. |

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
2. Receive canonical employer/company fact table back from Recruiting/HR handoff #515 and reconcile #204.
3. Keep AUTH-014/015 as citations, not earned editorial authority.
4. Eligibility research ranks: **WMCA → WATDA → TIA → NAAA**. WMCA/WATDA are strongest audience-fit candidates; TIA/NAAA require stricter operating-fit classification.
5. **Completed at SEO asset layer:** do not build a new linkable page. Use the mapped existing resource for each audience and only add content when a concrete target exposes a real gap.
6. Any actual email, partner contact, membership application or commercial negotiation is handed to Sales/Partnerships/Operations; SEO receives the published URL and referral measurement outcome.

## KPI fields for activation

For each activated row record only public-safe aggregate state:

`authority_id | relationship_state | outreach_status | response_status | published_url | first_seen | last_checked | referral_sessions | qualified_referrals | notes`

Do not store personal emails, private contact data, credentials, customer/carrier data or message bodies in this registry.
