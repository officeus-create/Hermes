# Hermes Load Board — competitor + licensed open-source adoption review
Date: 2026-10-12 | Source of truth: existing #1836 (product) / #1074 (permissioned freight ingest).
Status: research + a narrow feature PR, **not** a new TMS or external partner integration.

## Distinctive operational boundary
Hermes Carrier Workspace is a *closed dispatch service*. Approved carriers can study permitted current freight after-hours, save it and request their **assigned Hermes dispatcher**. No self-booking; no shipper contacts; no broker view of private freight. Carrier preferred lane is advisory: it cannot prove an actual load, trailer fit, broker release, price acceptance, driving hours or trucking authority. Direct dealer/shipper allocations require FMCSA/legal review.

## Competitive feature evidence (first-party documentation)
| Platform | Observed product patterns | Hermes decision |
|---|---|---|
| Central Dispatch — https://www.centraldispatch.com/carriers | Multi-point route searches, advanced equipment filters, price comparisons, transactional ratings and digital dispatch | Route/equipment preference first; pricing comparisons only with permissioned evidence; no automatic dispatch |
| Central Dispatch — https://api-docs.centraldispatch.com/marketplaces | Separate public/private/test marketplace IDs | Keep source rights, internal-only audience, tests and private caches; do not claim granted CD API access |
| Super Dispatch — https://superdispatch.com/carrier-tms/ | Suggested loads, multi-load planning, mobile GPS, eBOL, photo inspection, billing | Prioritize explainable carrier lane preferences, later pickup/POD/inspection/payment; avoid blind product cloning |
| Super Dispatch — https://developer.superdispatch.com/shipper/docs/private-network/ | Trusted private network and configurable access; product documents automatic fallback to public load board | NO fallback or reposting restricted Hermes loads to public/brokers without explicit separate rights |
| Super Dispatch — https://developer.superdispatch.com/shipper/docs/loadboards/ | Shipper post, request/accept/decline and direct load offers | Hermes must preserve dispatcher-mediated approval; interest != booking or actual human receipt |
| Ship.Cars — https://legal.ship.cars/solutions/carriers/driver-app/ | Mobile pickup/delivery paperless workflows, eBOL/ePOD | Later phases only after real deliveries and clear evidence/data retention rights |

## Open-source projects; inspect license/compatibility before dependency selection
| Source | License confirmed | Candidate capability | Decision |
|---|---|---|---|
| https://github.com/google/or-tools | Apache-2.0 | Capacity + pickup/delivery sequence and time windows | Candidate **external worker/service** once measured need; not directly embedded in Cloudflare Functions |
| https://github.com/VROOM-Project/vroom | BSD-2-Clause | Optimized multi-stop trips, routes | Candidate separate service; not needed for lane preference sort |
| https://github.com/project-osrm/osrm-backend | BSD-2-Clause | Distances and travel times with OSM data | Candidate road router, requires hosting and geographic source/attribution checks |
| https://github.com/graphhopper/jsprit | Apache-2.0 | Capacitated and time-window VRP | Candidate Java service if multi-pickup planning qualifies |
| https://github.com/traccar/traccar | Apache-2.0 | GPS/device tracking, geofencing, alerts | Defer until explicit carrier/driver consent and robust retention/privacy |
| https://github.com/Leaflet/Leaflet | BSD-2-Clause | Map display | Candidate only if maps add utility; use safe client and tile provider terms |

No third-party source code has been copied or dependency added in this PR. Reusing an idea does not transfer a competitor's closed-source code or partner data rights.

## Prioritized backlog (bounded, existing tasks only)
1. P0: #1860 public summary RBAC and #1859 reviewer-email privacy: independently owned open PRs, do not touch overlapping files.
2. P0: Finish #1857 inbound permissioned Gmail READ-ONLY gating and precise source-owner authorization; NO outbound, NO synthetic fresh loads.
3. P0: Dispatch 107 identity provision with verified owner authority, strong credentials and reviewer-only permissions; no shared named-password or owner capability.
4. P0: Current PR: per-verified-carrier state/equipment/slots preference, deterministic explanatory ranking, no source contacts or external API. UI cannot fabricate "matched freight" if zero real loads.
5. P0: End-to-end real user request -> assigned dispatcher viewed -> dealer/shipping response with legally authorized transaction, verified evidence. Document what is UNKNOWN.
6. P1: Carrier passport / MC-DOT / COI / equipment and validity, only by verified account; document vault with tenant RBAC and no public output.
7. P1: Road network/ETA, deadhead, multi-pickup vehicle fit, then multi-load planning; compare OR-Tools/VROOM/OSRM architecture and costs.
8. P1: Driver app, eBOL/POD, inspection photographs, documents and invoice/payment receipts under signed source rights and retention.
9. P1: Public SEO for dispatch, carriers and shippers strictly tied to real abilities (private routes stay noindex).
10. P2: DealerCenter and third-party integrations ONLY with explicit API + data redistribution license + independent source legal review.

## Quantifiable go/no-go for this PR
- GET/POST preference only for active, admin-entitled carrier owner session (no broker/dealer); company ID from server.
- 2-letter valid state codes, supported equipment, 1..16 slots, persisted per carrier company in existing D1.
- Sort *authorized and unexpired* rows only. Explicit matches/mismatches/unconfirmed, no hidden or fabricated freight.
- Preview/mobile accessible; no external messages, notifications, payment or booking triggered.
- Test CI, main conflict check, review/deploy/readback before claiming live.
