# SEO Authority Registry — 2026-08-14

Status: `RESEARCHED / NO OUTREACH SENT`

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

## Opportunity registry

| ID | Target | Opportunity class | Why relevant | Intended Hermes destination | Status | Gate / next SEO decision |
|---|---|---|---|---|---|---|
| AUTH-001 | Wisconsin Motor Carriers Association (witruck.org) | Industry association / legitimate citation | Wisconsin trucking association has a public membership list and Allied Member path for companies serving motor carriers. | `/logistics/car-hauling-dispatch/` or `/paths/logistics/` | `RESEARCHED_HOLD_IDENTITY` | Verify Hermes eligibility and canonical public company facts first; membership fee is a business decision and must not be justified as buying a backlink. |
| AUTH-002 | WMCA public membership list | Association member directory | Public list exposes company, city, state and member type; a legitimate member listing could strengthen Wisconsin/trucking entity relevance. | `/paths/logistics/` | `DEPENDENT_ON_AUTH-001` | Only valid if Hermes becomes a genuine eligible member. No directory-only application. |
| AUTH-003 | Transportation Intermediaries Association (tianet.org) | 3PL association / legitimate citation | TIA represents third-party logistics professionals, reports ~2,000 member companies, and operates a member directory. | `/paths/logistics/` or broker-facing canonical owner | `RESEARCHED_HOLD_ELIGIBILITY` | Confirm Hermes legal/operating fit for TIA membership before any application. |
| AUTH-004 | TIA Member Directory | Association member directory | Public TIA directory separates regular 3PL members and marketplace associate members. | `/paths/logistics/` | `DEPENDENT_ON_AUTH-003` | Directory presence is an outcome of legitimate membership, not a standalone link target. |
| AUTH-005 | TIA Marketplace Digest / resource ecosystem | Expert contribution / resource citation | TIA publishes current broker/carrier-selection, fraud and business-practice material relevant to Hermes operational knowledge. | Relevant public-safe logistics resource, not a generic homepage pitch | `RESEARCH_ONLY` | First verify an editorial contribution route and prepare a genuinely useful asset; no mass guest-post pitch. |
| AUTH-006 | Wisconsin Automobile & Truck Dealers Association (watda.org) | Automotive/dealer association / partner citation | WATDA represents 700+ Wisconsin dealers and offers Associate Membership to suppliers/vendors and allied automotive-industry businesses. | `/logistics/dealer-vehicle-transportation/` | `RESEARCHED_HOLD_IDENTITY` | Strong audience fit for dealer transport. Confirm eligibility and canonical company facts before any partnership/application. |
| AUTH-007 | WATDA Dealer Point | Expert contribution / industry publication | WATDA's quarterly Dealer Point publication covers Wisconsin dealership industry updates and member stories. | Dealer transport resource or dealer-facing canonical page | `RESEARCH_ONLY` | Editorial contribution must be useful to dealers; paid advertising is not an earned-link KPI and should remain separately classified. |
| AUTH-008 | National Auto Auction Association (naaa.com) | Vehicle remarketing association | NAAA represents 340+ auction members and 140+ associate members across remarketing-related industries. | `/logistics/auction-vehicle-pickup/` | `RESEARCHED_HOLD_ELIGIBILITY` | Associate membership categories are bounded; confirm Hermes qualifies before considering application. |
| AUTH-009 | NAAA member ecosystem / member map | Association/auction-network discovery | NAAA operates a public member map/search for auctions and industry professionals; highly relevant to auction pickup/car hauling audience. | `/logistics/auction-vehicle-pickup/` | `DEPENDENT_ON_AUTH-008` | Do not seek listing without legitimate membership/relationship. Separate possible partner outreach from SEO implementation. |
| AUTH-010 | Intermodal Association of North America (intermodal.org) | 3PL/intermodal association / member directory | IANA publishes a large member list with 3PL, motor-carrier, rail, marine, supplier and associate divisions. | `/paths/logistics/` | `RESEARCHED_HOLD_FIT` | Hermes must have a truthful intermodal/3PL fit before activation; do not broaden service claims merely to qualify. |
| AUTH-011 | Transportation Development Association of Wisconsin (tdawisconsin.org) | Wisconsin transportation association / directory | TDA Wisconsin maintains a public membership directory spanning transportation stakeholders. | `/paths/logistics/` | `RESEARCHED_HOLD_ELIGIBILITY` | Verify membership category, value beyond SEO, and exact Wisconsin entity facts. |
| AUTH-012 | Metropolitan Milwaukee Association of Commerce (mmac.org) | Local business association / citation | MMAC represents ~2,000 member businesses and provides an online member directory where members manage organization description, website and contact fields. | `/about/`, `/company-information/` or `/paths/logistics/` | `RESEARCHED_HOLD_IDENTITY` | High entity/local relevance if Hermes' Milwaukee public identity is owner-approved. Membership is a business decision, not a link purchase. |
| AUTH-013 | WPG Shippers Association (wpg.org) | Shipper/logistics association | Wisconsin-based not-for-profit logistics/shippers association with membership and industry tools. | Shipper/dealer canonical owner if factual service fit is confirmed | `RESEARCH_ONLY` | Confirm whether Hermes is eligible and whether the relationship would be commercially real; no SEO-only membership. |
| AUTH-014 | Work.ua Hermes employer profile | Existing owned-profile citation | Current public Hermes employer profile and one Car Hauling Dispatcher job are already discoverable and are the reported source of current GSC external links. | `/careers/car-hauling-dispatcher/` after production verification | `EXISTING_CITATION_NEEDS_RECONCILIATION` | Profile facts and current Telegram CTA require Recruiting/HR handling in #515; SEO only validates entity consistency and destination/index behavior. |
| AUTH-015 | Staff.am Hermes employer profile | Existing owned-profile citation | Staff.am has a verified Hermes company profile, domain reference and historical job presence. | `/logistics/careers/` or canonical job page when an active matching role exists | `EXISTING_CITATION_NEEDS_RECONCILIATION` | Employee count/founding-year/company-copy conflicts with Work.ua; resolve via #515 before treating as clean entity evidence. |

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

1. Complete production verification for `/careers/car-hauling-dispatcher/` after merge commit `599c3449d685be751d5d9e108fa888f5e7f63e66`.
2. Receive canonical employer/company fact table back from Recruiting/HR handoff #515 and reconcile #204.
3. Keep AUTH-014/015 as citations, not earned editorial authority.
4. Prioritize Logistics audience fit in this order for further eligibility research: WMCA → WATDA → TIA → NAAA → MMAC → IANA/TDA/WPG.
5. For editorial authority, build one public-safe useful asset first (dealer transport checklist, auction pickup checklist, carrier readiness resource, or evidence-gated logistics research) and match it to one publication/audience rather than mass pitching.
6. Any actual email, partner contact, membership application or commercial negotiation is handed to Sales/Partnerships/Operations; SEO receives the published URL and referral measurement outcome.

## KPI fields for activation

For each activated row record only public-safe aggregate state:

`authority_id | relationship_state | outreach_status | response_status | published_url | first_seen | last_checked | referral_sessions | qualified_referrals | notes`

Do not store personal emails, private contact data, credentials, customer/carrier data or message bodies in this registry.
