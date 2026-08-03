# Issue #88: eight-state logistics SEO research gate

Reviewed: 2026-08-03  
Scope: Colorado, Missouri, Washington, Minnesota, Michigan, Indiana, Tennessee, and Idaho.  
Companion review: [`ISSUE_88_PILOT_GATE_ILLINOIS_TEXAS_2026-08-02.md`](./ISSUE_88_PILOT_GATE_ILLINOIS_TEXAS_2026-08-02.md).

## Decision

This is a documentation-only research handoff. It does not authorize a page, route, sitemap entry, schema change, deployment, Search Console submission, IndexNow request, paid research, or public claim about Hermes demand, routes, rates, offices, terminals, yards, customers, completed shipments, response times, or available capacity.

Public freight, manufacturing, auction, and competitor evidence describes the market and search-result environment. It does not prove Hermes operating history or demand in a state.

### Consolidated ten-state gate

| State | Recommended page type | Status | Score | Decision |
|---|---|---:|---:|---|
| Michigan | State vehicle-transport coordination hub | `APPROVED_FOR_BRIEF` | 7/10 | Safest first research pilot; do not index until owner facts and query evidence are approved. |
| Indiana | State dealer/auction vehicle-transport coordination hub | `APPROVED_FOR_BRIEF` | 7/10 | Second research pilot; do not index until owner facts and query evidence are approved. |
| Colorado | State planning hub, not a Denver page | `NEEDS_EVIDENCE` | 6/10 | Terrain and corridor context is distinct, but query ownership and Hermes-specific value are not proven. |
| Missouri | State coordination hub | `NEEDS_EVIDENCE` | 6/10 | Freight-hub context is useful, but the proposed page still risks becoming generic. |
| Washington | State coordination hub | `NEEDS_EVIDENCE` | 6/10 | Port and multimodal context is distinct, but it overlaps the national port-pickup owner. |
| Minnesota | State coordination hub | `NEEDS_EVIDENCE` | 6/10 | Regional freight context is useful; current unique conversion value is insufficient. |
| Tennessee | State dealer/automotive coordination hub | `NEEDS_EVIDENCE` | 6/10 | Automotive and corridor context is promising, but competitor/query evidence is incomplete. |
| Illinois | State vehicle-transport hub | `NEEDS_EVIDENCE` | 6/10 | Existing merged review; no city page. |
| Texas | State vehicle-transport hub | `NEEDS_EVIDENCE` | 6/10 | Existing merged review; no city page. |
| Idaho | Supporting auction-pickup resource before a state hub | `RESEARCH_ONLY` | 5/10 | Search opportunity is too narrow and a generic state hub would be thin. |

Kansas and California remain `DO_NOT_BUILD` under the current authorization because the required dated evidence has not been supplied.

**Maximum first implementation batch:** two state hubs only—Michigan and Indiana—and only after Vladimir approves the pilots and the evidence gates below are satisfied. No city pages belong in the first batch.

## Evidence model

Each candidate is scored across eight dimensions: distinct search intent, dated demand/context evidence, competition opportunity, Hermes service fit, unique local value, conversion path, internal-link role, and claim safety. Each dimension is scored 0–2 and normalized to 10.

A 7/10 score means “safe to prepare a unique brief,” not “safe to publish.” Approved keyword evidence, Search Console ownership, owner-confirmed service fit, and claim review remain required before indexation.

## Current Hermes query owners

Every state proposal must support, not replace or cannibalize, these current national owners:

- `/logistics/dealer-vehicle-transportation/` — dealer and inventory-movement commercial intent;
- `/logistics/auction-vehicle-pickup/` — auction pickup commercial intent;
- `/logistics/car-hauling-dispatch/` — carrier dispatch-service intent;
- `/logistics/inoperable-vehicle-transport/` — inoperable vehicle intent;
- `/logistics/multi-car-transport/` — multi-unit movement intent;
- `/load-board/` — reviewed carrier/customer intake and load-board preview;
- `/logistics/resources/auction-vehicle-pickup-checklist/` — informational auction preparation;
- `/logistics/resources/car-hauler-capacity-checklist/` — carrier capacity preparation.

A state page must own a state-level coordination query and explain locally relevant planning questions. It must not become a duplicate national service page with the state name substituted.

# State research

## Michigan

### Public evidence

Michigan DOT treats freight as part of a statewide multimodal system and identifies freight, marine, rail, aviation, bridges, and border crossings as transportation-planning surfaces. Michigan Economic Development Corporation positions automotive and mobility manufacturing as a core state industry and describes Michigan as a major automotive R&D and manufacturing center.

Official sources:

- https://www.michigan.gov/mdot/travel/mobility/freight
- https://www.michiganbusiness.org/industries/mobility-and-automotive-manufacturing/

### Public competitor/page-type review

Observed result types include:

- Michigan-based carriers offering dealership, auction, fleet, open, and enclosed transport;
- regional auction-to-lot pages serving Michigan, Indiana, Illinois, and Ohio;
- national quote pages that target Michigan without meaningful local planning content.

Examples reviewed for page type only:

- https://stopwatchusa.com/
- https://www.stimsontransport.com/about-us
- https://alinetransport.com/auto-dealers-and-yards/

Hermes must not copy fleet, equipment, authority, response-time, damage-free, nationwide-coverage, or operating-history claims from competitors.

### Search-intent map

Primary candidate: `Michigan vehicle transport coordination for dealers, auctions, fleets, and carriers`.

Supporting intents:

- auction release and vehicle-condition preparation;
- dealer inventory and multi-unit request preparation;
- inoperable vehicle equipment questions;
- carrier capacity and dispatch intake;
- border-crossing questions only as an informational boundary, not as a promise that Hermes handles a particular international movement.

### City shortlist

| Candidate | Status | Score | Reason |
|---|---|---:|---|
| Detroit / Metro Detroit | `RESEARCH_ONLY` | 5/10 | Automotive relevance is strong, but state-hub and national-page collision is high. |
| Grand Rapids | `RESEARCH_ONLY` | 4/10 | No distinct query owner or unique Hermes value is proven. |
| Lansing | `DO_NOT_BUILD` | 3/10 | Likely thin and derivative in the first architecture. |

### Score

| Dimension | Score | Reason |
|---|---:|---|
| Distinct search intent | 2/2 | Automotive/dealer/auction coordination can be separated from generic consumer shipping. |
| Dated demand/context evidence | 1/2 | Strong official industry context; no approved keyword or Search Console demand evidence. |
| Competition opportunity | 1/2 | Active local carriers exist; weak-result opportunity is not yet proven. |
| Hermes service fit | 1/2 | National intake exists; Michigan-specific acceptance must be confirmed. |
| Unique local value | 2/2 | Automotive ecosystem, vehicle condition, dealer/auction workflow, and border-planning boundaries support unique sections. |
| Conversion path | 2/2 | Existing dealer, auction, carrier, and load-board paths are usable. |
| Internal-link role | 2/2 | The hub can route users to distinct national owners without a city-page network. |
| Claim safety | 1/2 | Safe with strict exclusions; local operating history is not available. |

Normalized score: **7/10 — `APPROVED_FOR_BRIEF`**.

## Indiana

### Public evidence

INDOT states that Indiana handles approximately 724 million tons of freight annually, has the fifth-busiest commercial freight traffic in the United States, and sees roughly one-third of freight pass through the state. Indiana Economic Development Corporation describes the state as having the second-largest automotive industry in the U.S. and highlights automotive, advanced manufacturing, logistics, and EV supply-chain activity.

Official sources:

- https://www.in.gov/indot/multimodal/freight/
- https://iedc.in.gov/industries/advanced-manufacturing

### Public competitor/page-type review

Observed result types include:

- direct Indiana carriers serving dealerships, auctions, fleets, and private owners;
- large commercial multi-car carriers;
- auction-owned transportation assistance;
- generic state/city quote pages with route prices and pickup-time claims.

Examples reviewed for page type only:

- https://www.velocitylogisticsfreight.com/
- https://carcarriers.com/
- https://indianaautoauction.net/services/transportation-assistance/

Hermes must not copy competitor fleet size, carrier count, completed-move, pickup-time, quote, office, or route claims.

### Search-intent map

Primary candidate: `Indiana dealer and auction vehicle transport coordination`.

Supporting intents:

- auction pickup preparation and release information;
- dealer-to-dealer and multi-unit request preparation;
- inoperable/salvage equipment qualification;
- carrier capacity and dispatch intake;
- through-freight context as planning background, not as proof of a Hermes lane.

### City shortlist

| Candidate | Status | Score | Reason |
|---|---|---:|---|
| Indianapolis | `RESEARCH_ONLY` | 5/10 | Auction/dealer intent exists, but a city page would collide with the state hub and national auction page. |
| Fort Wayne | `RESEARCH_ONLY` | 4/10 | No verified query owner or unique Hermes section. |
| Northwest Indiana | `CONFLICT` | 4/10 | Likely overlaps Chicago/Illinois and the broader Midwest state architecture. |

### Score

| Dimension | Score | Reason |
|---|---:|---|
| Distinct search intent | 2/2 | Dealer/auction coordination is separable from generic car shipping. |
| Dated demand/context evidence | 1/2 | Official freight and automotive context exists; approved query demand does not. |
| Competition opportunity | 1/2 | Strong competitors and auctions exist; SERP weakness is not proven. |
| Hermes service fit | 1/2 | Existing national intake fits; Indiana-specific acceptance requires owner confirmation. |
| Unique local value | 2/2 | Through-freight, auction release, multi-unit, and equipment qualification create distinct sections. |
| Conversion path | 2/2 | Existing dealer, auction, carrier, and load-board paths are usable. |
| Internal-link role | 2/2 | A state hub can organize national owners without creating a city network. |
| Claim safety | 1/2 | Safe if route, auction relationship, capacity, timing, and office claims are prohibited. |

Normalized score: **7/10 — `APPROVED_FOR_BRIEF`**.

## Colorado

CDOT adopted its 2024 Colorado Freight and Passenger Rail Plan on February 15, 2024. The plan addresses statewide freight systems and identifies complex rail and corridor planning. Public results include Colorado-based direct carriers, Denver dealer/auction transport pages, and local towing/transport companies.

Official source: https://www.codot.gov/programs/transitandrail/colorado-freight-and-passenger-rail-plan

Research decision:

- state hub: `NEEDS_EVIDENCE`, 6/10;
- Denver: `RESEARCH_ONLY`, 5/10;
- Colorado Springs and mountain-town pages: `DO_NOT_BUILD` in the first architecture.

Potential unique sections—weather/terrain/access questions and equipment qualification—are useful only as public planning guidance. Hermes cannot claim mountain-route experience, winter capacity, special equipment, pickup windows, or specific corridors without approved evidence.

## Missouri

MoDOT’s State Freight and Rail Plan frames Missouri as an integrated multimodal freight system. Public results include auction-operated transportation, dealer/auction commercial carriers, and generic state shipping pages.

Official source: https://www.modot.org/missouri-state-freight-and-rail-plan

Research decision:

- state hub: `NEEDS_EVIDENCE`, 6/10;
- Kansas City and St. Louis: `RESEARCH_ONLY`, 5/10 each;
- no city or corridor pages in the first architecture.

A page needs more than “central location” or generic freight statistics. It requires approved query evidence and a unique explanation of dealer/auction request preparation that does not duplicate the national auction and dealer pages.

## Washington

WSDOT’s 2022 Freight System Plan covers truck, rail, air, barge, and cargo-ship freight; WSDOT is developing an updated 2026 plan. This gives Washington distinct multimodal and port context, but also creates substantial overlap with Hermes’ national port-pickup owner.

Official source: https://wsdot.wa.gov/construction-planning/statewide-plans/freight-rail-plans/freight-system-plan

Research decision:

- state hub: `NEEDS_EVIDENCE`, 6/10;
- Seattle/Tacoma: `CONFLICT`, 5/10 because port and state intent could cannibalize `/paths/logistics/customers/port-pickup/`;
- Spokane: `RESEARCH_ONLY`, 4/10.

Do not publish port, terminal, customs, cross-border, capacity, or named-corridor claims without approved Hermes proof and a separate query-owner decision.

## Minnesota

MnDOT adopted the 2024 Minnesota State Freight Plan in November 2024. It covers statewide goods movement and explicitly connects to regional district freight plans, supporting the idea that Minnesota has distinct regional freight characteristics.

Official source: https://www.dot.state.mn.us/planning/freightplan/index.html

Research decision:

- state hub: `NEEDS_EVIDENCE`, 6/10;
- Minneapolis–Saint Paul: `RESEARCH_ONLY`, 5/10;
- Duluth and Rochester: `DO_NOT_BUILD` in the first architecture.

The current evidence supports a planning brief, not a unique commercial page. Owner-confirmed service fit and approved query evidence are still absent.

## Tennessee

TDOT maintains a statewide multimodal freight plan and corridor-planning program. Tennessee Economic and Community Development identifies automotive as an important manufacturing sector. Public results show automotive auctions and nationwide dealer/auction transport pages, but the state-specific vehicle-transport SERP opportunity is not established.

Official sources:

- https://www.tn.gov/content/dam/tn/tdot/freight-and-logistics/TDOT_FreightPlan_AMENDED_05182022.pdf
- https://tnecd.com/industries/automotive/

Research decision:

- state dealer/automotive coordination hub: `NEEDS_EVIDENCE`, 6/10;
- Nashville, Memphis, and Knoxville: `RESEARCH_ONLY`, 5/10 each;
- no corridor, plant, factory, railhead, or auction-specific pages.

Manufacturing context cannot be converted into a claim that Hermes serves OEMs, plants, suppliers, or particular routes.

## Idaho

ITD’s 2023 Strategic Freight Plan addresses growing statewide multimodal freight needs. Public results contain dealer auctions, local auction transport services, and thin auction-location landing pages targeting Boise or individual auction brands.

Official source: https://itd.idaho.gov/planning/freight/

Research decision:

- state vehicle-transport hub: `RESEARCH_ONLY`, 5/10;
- Boise/Nampa: `RESEARCH_ONLY`, 4/10;
- Idaho Falls/Blackfoot: `DO_NOT_BUILD`, 3/10;
- preferred future content type: a national auction-pickup or inoperable-vehicle resource that can use Idaho only as a non-promotional example after evidence review.

A standalone Idaho state hub would currently depend on generic rural-distance language, auction names, or unsupported local operating claims and would be vulnerable to doorway classification.

# Pilot briefs

## Pilot 1 — Michigan state hub

Proposed URL, not authorized for creation: `/logistics/michigan-vehicle-transport/`

**Title:** Michigan Vehicle Transport Coordination | Hermes Logistics  
**Meta description:** Prepare a Michigan dealer, auction, fleet, or carrier vehicle-transport request. Review vehicle condition, equipment, release details, timing, and the correct Hermes intake path.  
**H1:** Vehicle transport coordination for Michigan dealers, auctions, fleets, and carriers

### Unique value proposition

One reviewed state-level decision page that separates customer/dealer intake from carrier dispatch intake and explains the information needed for Michigan automotive and auction-related vehicle movements—without promising a route, rate, capacity, pickup time, or local office.

### Required outline

1. Who the page serves: dealers/fleets/auction buyers versus carriers/owner-operators.
2. Why Michigan vehicle requests require complete condition, release, equipment, and access information.
3. Operable, inoperable, open, enclosed, and multi-unit qualification questions.
4. Dealer and auction pickup preparation; no affiliation claims.
5. Michigan automotive/freight context from official sources.
6. Border and international-movement boundary: review required, no availability claim.
7. Correct conversion path for customers and carriers.
8. Current-review disclaimer for rate, timing, lane, and capacity.

### FAQ candidates

Use only after query evidence confirms wording:

- What information is needed to request vehicle transport in Michigan?
- Can an inoperable auction vehicle be reviewed for transport?
- How should a dealer prepare a multi-vehicle request?
- Does submitting a request guarantee a carrier or pickup date?
- How do Michigan carriers share equipment and capacity with Hermes?

### Internal links

- `/logistics/dealer-vehicle-transportation/`
- `/logistics/auction-vehicle-pickup/`
- `/logistics/inoperable-vehicle-transport/`
- `/logistics/multi-car-transport/`
- `/logistics/car-hauling-dispatch/`
- `/load-board/`
- both current Logistics checklists.

### Allowed schema

`WebPage`, `BreadcrumbList`, and visible `FAQPage`. Use `Service` only after the owner confirms the visible state-level service scope. Do not use `LocalBusiness`, `Place`, `Offer`, `Review`, `AggregateRating`, route, inventory, vehicle, office, or availability schema.

## Pilot 2 — Indiana state hub

Proposed URL, not authorized for creation: `/logistics/indiana-vehicle-transport/`

**Title:** Indiana Dealer & Auction Vehicle Transport Coordination | Hermes Logistics  
**Meta description:** Prepare an Indiana dealer, auction, or carrier vehicle-transport request. Review release details, vehicle condition, equipment, multi-unit scope, timing, and the correct intake path.  
**H1:** Vehicle transport coordination for Indiana dealers, auctions, and carriers

### Unique value proposition

A state-level coordination page focused on dealer inventory, auction release, inoperable-unit, multi-car, and carrier-capacity preparation. It uses Indiana freight and automotive context only to explain planning questions, never to imply a Hermes route or auction relationship.

### Required outline

1. Dealer/auction/customer versus carrier intent split.
2. Auction release, buyer number, lot information, keys, condition, and access questions in generic form.
3. Multi-unit and dealer inventory request preparation.
4. Inoperable and equipment qualification.
5. Indiana freight/automotive context from official sources.
6. Why through-freight context does not guarantee a Hermes lane or available carrier.
7. Correct customer and carrier intake routes.
8. Current-review boundary for quote, timing, price, and capacity.

### FAQ candidates

- What should an Indiana auction buyer prepare before requesting pickup?
- Can dealers submit several vehicles in one request?
- What information is needed for an inoperable vehicle?
- Does Hermes have an Indiana office or guaranteed carrier capacity?
- How can an Indiana car hauler request Load Board access or dispatch review?

The office/capacity FAQ answer must explicitly say no local office or guaranteed capacity is represented unless current owner-approved facts change.

### Internal links and schema

Use the same national owners and schema restrictions as the Michigan brief. Do not create Indianapolis, Fort Wayne, auction-brand, or named-corridor child pages in the first package.

# Doorway and cannibalization assessment

Stop any proposed page when one or more conditions apply:

- the body works after replacing only the state name;
- local value consists only of population, highway, manufacturing, or freight statistics;
- the primary query is already owned by a national dealer, auction, dispatch, inoperable, multi-car, or port page;
- the page needs invented routes, rates, capacity, customers, offices, facilities, or completed moves to sound credible;
- state and city pages would target the same query;
- city pages primarily link to one another to manufacture crawl signals;
- public evidence describes a market but no owner-approved Hermes conversion path exists;
- Search Console or approved keyword evidence selects a different canonical owner.

Risk by candidate:

- Michigan state hub: medium, manageable with automotive/dealer/auction information architecture;
- Indiana state hub: medium, manageable with dealer/auction/multi-unit qualification;
- Colorado, Missouri, Minnesota, Tennessee: medium-high until unique query ownership is shown;
- Washington: high because of port-pickup overlap;
- Idaho: high because of thin-content and auction-location-template risk;
- all city pages: high in the first package.

# Evidence required before indexation

For each pilot, require all of the following:

1. approved keyword source showing a distinct state-level query cluster;
2. Search Console review confirming no current Hermes page already owns the cluster;
3. owner confirmation that Hermes accepts the relevant state inquiries;
4. owner-approved conversion route and responsible team;
5. at least two genuinely state-specific visible sections that do not rely on private operational data;
6. current official sources with publication/adoption dates;
7. competitor SERP refresh on the implementation date;
8. explicit prohibition of office, terminal, yard, route, rate, capacity, timing, customer, and completed-move claims unless separately proven;
9. canonical, title, H1, FAQ, schema, and sitemap-owner review;
10. desktop/mobile content-difference and internal-link QA.

# Implementation order for Codex

No implementation begins until Vladimir selects the pilots.

1. Owner review of this document and the Illinois/Texas companion.
2. Approve zero, one, or two state hubs; do not approve city pages in batch one.
3. Supply approved query/Search Console evidence and owner-confirmed service fit.
4. Re-score each selected pilot; stop if below 7/10.
5. Create one static noindex prototype per approved pilot from current `main`.
6. Run cannibalization comparison against all current national and Wisconsin owners.
7. Review copy, CTA, schema, disclaimers, and public facts.
8. Run normal build, static/SEO contracts, route CSS coverage, and desktop/mobile Playwright.
9. Obtain explicit owner approval before changing indexability or any sitemap.
10. Publish one pilot first; measure crawl, impressions, query ownership, engagement, and qualified inquiries before considering the second.

# Recommended owner decision

- **Approve for brief/prototype review:** Michigan and Indiana state hubs.
- **Do not authorize publication yet:** both pilots still need query evidence and owner-confirmed service fit.
- **Hold:** Colorado, Missouri, Washington, Minnesota, Tennessee, Illinois, and Texas.
- **Research only:** Idaho.
- **Do not build:** Kansas, California, and all first-batch city/corridor pages.
