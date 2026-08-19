# Hermes SEO — Logistics Commercial Owner Map

Date: 2026-08-19
Scope: Batch 3 tasks 101–108 and prerequisite architecture for tasks 109–125.

## Current canonical owner map

| Intent family | Canonical owner | Distinct value / boundary |
|---|---|---|
| General direct vehicle transport request and network | `/logistics/direct-vehicle-transport-network/` + `/logistics/request-vehicle-transport/` | National request/network entry. Do not turn it into a dealer, port, equipment, or local page. |
| Dealer inventory transportation | `/logistics/dealer-vehicle-transportation/` | Dealer-to-dealer, dealer/auction inventory, multi-unit and recurring dealer context. |
| Auction pickup | `/logistics/auction-vehicle-pickup/` | Auction/facility release, pickup readiness, storage deadlines and operability. No auction affiliation claim. |
| Port / terminal inland vehicle pickup | `/logistics/port-vehicle-pickup/` | Inland transport after release context. No customs brokerage, customs clearance, port/terminal operation, credential or access guarantee. |
| Open vehicle transport | `/logistics/open-vehicle-transport/` | Open-equipment transport intent. |
| Enclosed vehicle transport | `/logistics/enclosed-vehicle-transport/` | Higher-protection/enclosed-equipment intent. No automatic luxury/value assumption or capacity guarantee. |
| Inoperable vehicle transport | `/logistics/inoperable-vehicle-transport/` | Non-running/loading-equipment context. |
| Multi-car transport | `/logistics/multi-car-transport/` | Multi-unit capacity/equipment/sequence context. |
| Wisconsin statewide vehicle transport | `/logistics/wisconsin-vehicle-transport/` | State hub and local-owner navigation; not a generic national transport replacement. |
| Wisconsin car-shipping pricing education | `/logistics/resources/wisconsin-car-shipping-cost-guide/` | Pricing-factor guide only. No generic rate, per-mile number, seasonal surcharge or quote guarantee. |

## Production verification — Batch 3

### Wisconsin cost guide
- Current main route exists and is indexable under the public BaseLayout defaults.
- `public/sitemap-services.xml` includes the canonical route with `lastmod` 2026-08-19.
- CTA routes to the existing direct vehicle-transport intake with customer-delivery context.
- The page explicitly refuses a guessed/generic price and describes route-specific factors instead.
- Wisconsin statewide owner links contextually to the guide.
- Dealer Vehicle Transportation also links to the guide.

### Port Vehicle Pickup
- Current main route exists and is included in `public/sitemap-services.xml` with `lastmod` 2026-08-19.
- The page explicitly says Hermes is not a customs broker, port, terminal, warehouse or customs-clearance provider.
- FAQ/process copy also refuses customs-clearance, terminal-access, pickup-timing, carrier-capacity and TWIC/escort guarantees.
- Primary CTA reuses the existing `/logistics/request-vehicle-transport/` intake with business/other context.
- Dealer Vehicle Transportation links to Port Vehicle Pickup both in FAQ context and the related-owner list.

## Cannibalization rules

1. A new state/city owner must not target the same broad national intent merely by adding a place name.
2. Dealer pages own dealer inventory and repeat dealer workflows; local pages may add local access/facility/service-area value, but may not duplicate the national dealer owner wholesale.
3. Auction pages own auction/release/storage pickup context; named auction brands are facility context only and must not imply affiliation.
4. Port pages own post-release inland pickup context; customs, ocean freight, terminal operations and access credentials remain outside represented scope unless an approved product/service is separately established.
5. Open/enclosed/inoperable/multi-car pages own equipment or vehicle-condition intent. A geographic page may reference those options but should not become a duplicate equipment owner.
6. Cost/resource pages answer preparation/education intent and must route commercial action into the appropriate service/intake owner rather than create a second booking backend.
7. Texas/DFW/Houston research cannot move to build solely because the location is large or has dealers/auctions. Approval requires distinct query archetype, distinct local user value, non-overlapping canonical ownership, conversion context and measurement ownership.

## Internal-link requirements

### Port owner inbound paths
At minimum maintain contextual inbound paths from:
- Dealer Vehicle Transportation when port-to-dealer inventory movement is discussed;
- relevant national transport owner/resource surfaces where port/facility pickup is a distinct next step;
- any future state/local page only when port/terminal context is actually relevant.

Do not add sitewide/footer links merely to inflate internal-link count.

### Wisconsin cost-guide inbound paths
Maintain contextual inbound paths from:
- Wisconsin statewide owner;
- Dealer Vehicle Transportation where Wisconsin dealer request preparation is discussed;
- relevant Wisconsin/local owners only when pricing-factor education helps the user prepare the request.

## Build gate for the next Logistics owner

A candidate may move from research to build only when all are true:
1. query/intent evidence is distinct from an existing owner;
2. Hermes has factual service truth for the user need;
3. the page adds material value beyond substituting geography/keyword text;
4. one existing intake/backend can preserve the correct request context;
5. canonical and internal-link ownership are documented;
6. 390px funnel QA is defined;
7. 7/28-day measurement ownership is defined;
8. no fabricated price, capacity, timing, affiliation, authority, facility-access or outcome claim is required to make the page useful.

## Batch 3 state

- 101 VERIFIED — Wisconsin cost-guide main/sitemap/indexability contract.
- 102 VERIFIED — Port owner main/sitemap/indexability contract.
- 103 VERIFIED — Port customs/access/affiliation boundary.
- 104 VERIFIED — Port shared intake reuse.
- 105 COMPLETE — national vehicle-transport owner map recorded here.
- 106 AUDIT ACTIVE — title/H1 overlap still needs automated cross-owner comparison before closure.
- 107 VERIFIED BASELINE — Dealer owner provides contextual inbound Port link; broader depth audit remains part of task 107.
- 108 VERIFIED BASELINE — Wisconsin statewide + Dealer owner link to cost guide; broader local-depth audit remains part of task 108.
