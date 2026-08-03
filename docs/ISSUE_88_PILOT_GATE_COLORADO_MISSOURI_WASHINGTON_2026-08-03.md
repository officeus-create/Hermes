# Issue #88 pilot gate: Colorado, Missouri, and Washington

Reviewed: 2026-08-03
Status: clean-room research only; no publication or implementation authorization.

## Purpose

This package continues Issue #88 with three additional non-Wisconsin markets. It evaluates whether Hermes should prepare a state vehicle-transport hub, a city page, a narrower service-intent page, a supporting resource, or no page at this time.

This document does **not**:

- create a public route;
- change a sitemap, canonical, schema, CTA, form, analytics event, or production system;
- claim Hermes offices, terminals, yards, capacity, routes, rates, customers, partners, demand, rankings, traffic, leads, or completed transportation history in these states;
- use private Shipment History, load-board observations, customer/carrier identities, exact addresses, or operational records as public evidence.

Public freight, population, and competitor observations provide market context only. They do not prove Hermes-specific demand or service fit.

## Decision summary

| Candidate | Status | Score | Current decision |
|---|---|---:|---|
| Colorado state vehicle-transport coordination hub | `NEEDS_EVIDENCE` | 6/10 | Prepare a unique brief only after query evidence and owner-confirmed service fit. Do not build yet. |
| Denver city page | `RESEARCH_ONLY` | 5/10 | Generic city-shipping intent is crowded and may collide with a future Colorado owner. |
| Colorado Springs / Fort Collins pages | `RESEARCH_ONLY` | 4/10 | No first-batch city network; require distinct intent and non-template local value. |
| Missouri state vehicle-transport coordination hub | `NEEDS_EVIDENCE` | 6/10 | Central-market context is useful, but Hermes-specific value and query ownership are not established. |
| Kansas City / St. Louis pages | `RESEARCH_ONLY` | 5/10 | Hold until a state-level owner and city-specific intent are proven. |
| Washington state vehicle-transport coordination hub | `NEEDS_EVIDENCE` | 6/10 | Research a state owner, but do not duplicate national dealer, auction, or port-pickup pages. |
| Seattle–Tacoma auction/port planning page | `RESEARCH_ONLY` | 6/10 | Potentially distinct service-intent brief, but requires verified Hermes fit and collision review. |
| Seattle generic car-shipping page | `DO_NOT_BUILD` | 4/10 | Too likely to become a generic city replacement page and compete with stronger national owners. |
| Spokane city page | `RESEARCH_ONLY` | 4/10 | Hold pending query evidence and unique local value. |

No candidate in this package reaches the required 7/10 publication gate. No production page is recommended now.

## Shared current-site ownership

Any future state or city asset must support rather than compete with current Hermes owners, including:

- `/logistics/dealer-vehicle-transportation/`;
- `/logistics/auction-vehicle-pickup/`;
- `/paths/logistics/customers/port-pickup/`;
- `/logistics/car-hauling-dispatch/`;
- `/logistics/new-authority-car-hauler-support/`;
- `/load-board/`;
- `/paths/logistics/`.

Stop a proposed state/city page if its primary purpose, heading, body, CTA, or FAQ could be reproduced by replacing only a place name.

---

# Colorado

## Public evidence

Colorado Department of Transportation publishes the **Colorado Delivers: 2024 Freight Plan** and describes it as an IIJA-compliant statewide multimodal freight plan approved in 2024. CDOT identifies statewide freight focus areas including safety, mobility, asset management, economic vitality/competitiveness, and sustainability. CDOT also operates a Freight Advisory Council representing public and private freight stakeholders.

Official sources:

- https://freight.colorado.gov/plan-invest/freight-planning-efforts
- https://freight.colorado.gov/plan-invest/freight-advisory-council
- https://freight.colorado.gov/plan-invest/strategic-planning

The U.S. Census Bureau estimates Colorado's population at **6,012,561 on July 1, 2025**, up 4.1% from the April 1, 2020 estimate base.

Official source:

- https://www.census.gov/quickfacts/CO

These facts establish statewide market and freight context. They do not establish Hermes demand, capacity, route availability, pricing, pickup timing, or local operations.

## Public competition observations

Public results show several common page models:

1. state-wide consumer car-shipping pages;
2. Denver-focused quote pages;
3. dealer and auction transport pages;
4. local-company positioning;
5. open/enclosed and relocation explanations;
6. instant-quote funnels.

Examples reviewed for page type and intent only:

- https://www.denvercarshipping.com/colorado-auto-transport/
- https://www.denvercarshipping.com/dealer-car-transport/
- https://www.wheelingwheels.com/
- https://autotransportcolorado.com/
- https://safemileautotransport.com/colorado-car-shipping/
- https://www.roadrunnerautotransport.com/colorado-car-shipping

Hermes must not imitate fleet, office, local-company, instant-pricing, timing, availability, safety-performance, review, insurance, route, or customer-volume claims without its own approved evidence.

## Candidate intent

Preferred research candidate:

`Colorado vehicle transport coordination for dealers and carriers`

Potential useful sections, subject to evidence and owner approval:

- split dealer/shipper requests from carrier/dispatch requests;
- explain the information required for a reviewed Colorado request;
- describe access, operability, equipment, pickup-location, and meeting-point questions without claiming a specific route or truck availability;
- explain that elevation, weather, access constraints, distance, timing, rate, and capacity require current carrier review;
- connect users to the national dealer, auction, car-hauling dispatch, and carrier-intake owners;
- use dated public transportation context without presenting it as Hermes operational demand.

The mountain/access angle is a hypothesis, not approved local expertise. It must not become generic travel copy or a route/safety promise.

## Score

| Dimension | Score | Reason |
|---|---:|---|
| Distinct search intent | 1/2 | State coordination intent is plausible, but no approved keyword/Search Console evidence is available. |
| Dated demand evidence | 1/2 | Current freight and population context exists; Hermes-specific or query-level demand is missing. |
| Competition opportunity | 1/2 | Active state/city competitors exist; SERP weakness and attainable differentiation are not established. |
| Hermes service fit | 1/2 | National dealer/carrier services exist; Colorado-specific acceptance and operating fit need owner confirmation. |
| Unique local value | 1/2 | Access/elevation/weather planning could be useful, but no approved Hermes operational evidence exists. |
| Conversion path | 2/2 | Existing dealer, carrier, dispatch, and reviewed intake paths can support a future asset. |
| Internal-link role | 2/2 | A single state hub could support national owners if query ownership is distinct. |
| Claim safety | 1/2 | Safe wording is possible, but local access, route, timing, and capacity claims require strong gates. |

Normalized score: **6/10** (`NEEDS_EVIDENCE`).

## City assessment

### Denver

Status: `RESEARCH_ONLY`, 5/10.

Denver has visible generic city-shipping and dealer-transport competition. A city page should not precede a state owner unless a distinct query cluster and useful Denver-specific workflow are proven. Do not create a Denver page based only on population, airport, interstate, relocation, military, university, or mountain proximity lists.

### Colorado Springs and Fort Collins

Status: `RESEARCH_ONLY`, 4/10.

Do not create city variants in the first package. Each would require its own query evidence, service fit, CTA role, and locally useful content that cannot be reproduced for another city.

## Colorado gate

Before implementation:

- verify state and city query groups using an approved keyword source and Search Console;
- compare titles/H1s/canonicals against current national owners;
- confirm which Colorado dealer, shipper, carrier, and dispatch inquiries Hermes accepts;
- approve one useful Colorado-specific workflow section beyond general geography;
- confirm CTA and intake ownership;
- approve claim boundaries for access, weather, timing, equipment, and capacity;
- do not create Denver, Colorado Springs, Fort Collins, Aurora, or mountain-town variants in the first batch.

---

# Missouri

## Public evidence

Missouri Department of Transportation publishes the **2022 Missouri State Freight and Rail Plan**. MoDOT explains that Missouri's central national location and transportation resources support a combined multimodal freight and rail planning approach.

Official sources:

- https://www.modot.org/missouri-state-freight-and-rail-plan
- https://www.modot.org/2022-state-freight-and-rail-plan-documents

The U.S. Census Bureau estimates Missouri's population at **6,270,541 on July 1, 2025**, up 1.9% from the April 1, 2020 estimate base.

Official source:

- https://www.census.gov/quickfacts/MO

Central location and multimodal context do not prove Hermes lanes, load availability, dealer demand, rates, pickup speed, carrier coverage, or local capacity.

## Public competition observations

Public results show:

1. state-wide consumer shipping pages;
2. city pages for Kansas City, St. Louis, Wentzville, Springfield, and other locations;
3. dealer/manufacturer/rental-agency positioning;
4. open/enclosed and specialty transport pages;
5. quote-first funnels;
6. local-brand and nationwide-provider models.

Examples reviewed for page type and intent only:

- https://missouriautotransport.com/
- https://missouriautotransport.com/car-shipping/
- https://www.strattonexpress.com/
- https://www.autotransportdirect.com/car-shipping/missouri/
- https://safemileautotransport.com/missouri-car-shipping/
- https://www.roadrunnerautotransport.com/missouri/wentzville-car-shipping

Hermes must not repeat manufacturer, rental-agency, dealer, local-company, years-in-business, fleet, delivery-time, tracking, pricing, coverage, review, or reliability claims without current approved evidence.

## Candidate intent

Preferred research candidate:

`Missouri vehicle transport coordination for dealers and carriers`

Potential useful sections, subject to approval:

- distinguish dealer/shipper coordination from carrier dispatch support;
- explain the minimum request details for origin/destination, vehicle condition, count, pickup readiness, equipment, and timing review;
- link national dealer, auction, dispatch, broker-setup, and readiness resources;
- explain that central geography does not guarantee a route, backhaul, rate, pickup date, or carrier availability;
- present public freight context only as market background;
- use one reviewed state owner before any city expansion.

## Score

| Dimension | Score | Reason |
|---|---:|---|
| Distinct search intent | 1/2 | A state coordination owner is plausible, but exact query ownership is unverified. |
| Dated demand evidence | 1/2 | Official freight/population context exists; approved keyword and Hermes demand evidence do not. |
| Competition opportunity | 1/2 | Multiple state/local competitors exist; no proven weak-result opportunity. |
| Hermes service fit | 1/2 | National intake exists, but Missouri-specific inquiry acceptance needs confirmation. |
| Unique local value | 1/2 | Central multimodal context is relevant but insufficient by itself for unique content. |
| Conversion path | 2/2 | Existing dealer and carrier funnels can support a future state owner. |
| Internal-link role | 2/2 | One state hub could consolidate discovery without a city-page network. |
| Claim safety | 1/2 | Safe coordination wording is possible if routes, backhauls, rates, timing, and capacity remain gated. |

Normalized score: **6/10** (`NEEDS_EVIDENCE`).

## City assessment

### Kansas City and St. Louis

Status: `RESEARCH_ONLY`, 5/10 each.

Both may have meaningful search volume, but volume alone does not justify separate pages. A city page must own a query different from the state hub and national dealer/carrier pages. Do not use generic interstate, central-location, auction, relocation, weather, or dealership lists as the only local value.

### Springfield, Columbia, and Wentzville

Status: `RESEARCH_ONLY`, 4/10.

Do not create long-tail city pages without dated query evidence, owner-confirmed service fit, and genuinely distinct public-safe guidance.

## Missouri gate

Before implementation:

- obtain state/city query evidence and branded/non-branded Search Console context;
- confirm Missouri dealer/carrier inquiry acceptance;
- identify a useful state-level workflow that is not generic national copy;
- define one canonical owner and prevent collision with dealer transport, auction pickup, dispatch, and Load Board pages;
- approve CTA and schema ownership;
- do not create Kansas City, St. Louis, Springfield, Columbia, Wentzville, or suburb variants in the first batch.

---

# Washington

## Public evidence

Washington State Department of Transportation currently uses the **2022 Washington State Freight System Plan** and is developing a **2026 Freight System Plan**, expected in fall 2026. WSDOT states that the plan covers trucks, airplanes, rail, barges, and cargo ships. WSDOT also released the 2025 Freight and Goods Transportation System update in December 2025 and amended it in April 2026.

Official sources:

- https://wsdot.wa.gov/construction-planning/statewide-plans/freight-rail-plans/freight-system-plan
- https://wsdot.wa.gov/construction-planning/statewide-plans/freight-plans
- https://wsdot.wa.gov/engineering-standards/planning-guidance/planning-study-guidance/freight-guidance-planning-studies

The U.S. Census Bureau estimates Washington's population at **8,001,020 on July 1, 2025**, up 3.8% from the April 1, 2020 estimate base.

Official source:

- https://www.census.gov/quickfacts/WA

Washington's multimodal and maritime context may justify research into port/auction planning intent, but it does not prove Hermes port service, drayage, vehicle availability, route access, rates, timing, or local operational capacity.

## Public competition observations

Public results show:

1. Seattle-focused generic vehicle shipping;
2. auction auto transport;
3. dealer transport;
4. commercial/corporate relocation;
5. heavy-haul and military categories;
6. quote-first city pages;
7. nationwide dealer-specialist pages.

Examples reviewed for page type and intent only:

- https://www.seattlecarshipping.com/
- https://www.seattlecarshipping.com/auction-auto-transport/
- https://dealershiptransport.com/

These examples include aggressive price, speed, discount, tracking, coverage, review, experience, insurance, and same-day-dispatch language. Hermes must not repeat such claims without approved evidence.

## Candidate architecture

### State owner

Research candidate:

`Washington vehicle transport coordination for dealers and carriers`

Potential sections:

- separate dealer/shipper requests from carrier/dispatch requests;
- explain request-readiness fields and current human review;
- link auction, port-pickup, dealer, dispatch, and carrier-intake owners;
- explain that maritime/freight context does not guarantee port access, appointment availability, route, price, pickup time, equipment, or capacity;
- use dated WSDOT context without presenting it as Hermes demand.

### Narrower supporting intent

Research-only candidate:

`Seattle–Tacoma auction and port vehicle pickup planning`

This may be more distinct than a generic Seattle car-shipping page, but it has a high collision risk with:

- `/logistics/auction-vehicle-pickup/`;
- `/paths/logistics/customers/port-pickup/`;
- `/logistics/dealer-vehicle-transportation/`.

It should become a page only if query evidence shows a separate Washington/Seattle–Tacoma intent and Hermes can provide useful, verified, public-safe planning guidance that the national owners do not already contain.

## State score

| Dimension | Score | Reason |
|---|---:|---|
| Distinct search intent | 1/2 | State coordination is plausible; generic shipping and narrower port/auction intent require separation. |
| Dated demand evidence | 1/2 | Current WSDOT and population context exists; no approved query or Hermes demand evidence. |
| Competition opportunity | 1/2 | Active Seattle/state competitors exist; opportunity is not quantified. |
| Hermes service fit | 1/2 | National auction, port, dealer, and carrier owners exist; Washington-specific fit needs confirmation. |
| Unique local value | 1/2 | Maritime, port, auction, and regional access context may be useful, but approved Hermes expertise is missing. |
| Conversion path | 2/2 | Existing customer/carrier intake and national owners can receive reviewed requests. |
| Internal-link role | 2/2 | A state owner or one narrow support page could connect several national resources. |
| Claim safety | 1/2 | Safe planning language is possible, but port access, appointments, timing, routes, and capacity are high-risk claims. |

Normalized score: **6/10** (`NEEDS_EVIDENCE`).

## City/service assessment

### Seattle generic vehicle-shipping page

Status: `DO_NOT_BUILD`, 4/10.

A generic Seattle page would likely duplicate existing competitor patterns and the proposed state/national owners. Population, port presence, interstate references, relocation, and weather are not sufficient unique value.

### Seattle–Tacoma auction/port planning

Status: `RESEARCH_ONLY`, 6/10.

This is the strongest narrower hypothesis in this package, but it must remain research-only until:

- query demand is proven;
- national owner overlap is mapped;
- Hermes confirms relevant inquiry acceptance;
- public-safe port/auction workflow guidance is approved;
- no appointment, access, route, pricing, capacity, or timing guarantee is implied.

### Spokane

Status: `RESEARCH_ONLY`, 4/10.

Do not create a Spokane variant without its own query cluster and operationally useful guidance.

## Washington gate

Before implementation:

- verify state, Seattle, Tacoma, Seattle–Tacoma, auction, dealer, and port-pickup query groups;
- compare current national auction/port/dealer owners and their Search Console queries;
- confirm which Washington requests Hermes accepts;
- approve public-safe port/auction workflow facts and correction ownership;
- choose either one state hub or one distinct support page, not both in the first batch;
- do not create generic Seattle, Tacoma, Spokane, Bellevue, Everett, or suburb pages.

---

# Cannibalization and doorway assessment

Risk remains **medium to high** for all three states because Hermes already has national commercial owners and competitors commonly use templated state/city shipping pages.

Stop implementation when any of the following is true:

- title/H1/body differs primarily by a state or city replacement;
- local value is only population, interstate, port, weather, airport, military, auction, or dealership lists;
- the page competes with the national dealer, auction, port-pickup, dispatch, or Load Board owner for the same primary query;
- the proposed FAQ can be reused unchanged in another state;
- the CTA has no distinct audience or handoff role;
- the page implies local offices, facilities, fleet, capacity, routes, availability, pricing, pickup speed, or performance;
- current Search Console selects another Hermes page for the intended query;
- there is no approved refresh owner for dated local facts.

# Research-only URL architecture

Do not create these URLs yet:

- `/logistics/colorado-vehicle-transport/`;
- `/logistics/missouri-vehicle-transport/`;
- `/logistics/washington-vehicle-transport/`;
- `/logistics/denver-vehicle-transport/`;
- `/logistics/kansas-city-vehicle-transport/`;
- `/logistics/st-louis-vehicle-transport/`;
- `/logistics/seattle-vehicle-transport/`;
- `/logistics/seattle-tacoma-auction-port-vehicle-pickup/`.

# Draft brief template after a 7/10 gate

Use only after evidence and owner review.

## Title

`[State] Vehicle Transport Coordination | Hermes Logistics`

## H1

`Vehicle transport coordination for [State] dealers and carriers`

## Required sections

1. Audience split: dealer/shipper versus carrier/dispatch.
2. What Hermes reviews before responding.
3. Request-readiness details: vehicle count, condition, access, equipment, origin/destination, timing window.
4. State-specific public context with source date and correction owner.
5. One genuinely useful state workflow that is not generic national copy.
6. Current-review boundary for route, timing, price, availability, equipment, capacity, and access.
7. Links to the correct national commercial owners and reviewed intake.
8. FAQ based on actual query evidence.

## Allowed schema

- `WebPage`;
- `BreadcrumbList`;
- `Service` only when visible approved business facts support it;
- `FAQPage` only when every question and answer is visible.

Do not add `LocalBusiness`, `Place`, `Offer`, `Review`, `AggregateRating`, route, live inventory, capacity, office, terminal, yard, or location schema without separately approved evidence.

# Consolidated progress for Issue #88

Research gates now completed:

- Illinois: `NEEDS_EVIDENCE`, 6/10;
- Texas: `NEEDS_EVIDENCE`, 6/10;
- Colorado: `NEEDS_EVIDENCE`, 6/10;
- Missouri: `NEEDS_EVIDENCE`, 6/10;
- Washington: `NEEDS_EVIDENCE`, 6/10.

Remaining approved research scope:

- Minnesota;
- Michigan;
- Indiana;
- Tennessee;
- Idaho.

Kansas and California remain research holds pending dated evidence and owner authorization.

# Next package

Research Minnesota, Michigan, Indiana, Tennessee, and Idaho using the same evidence and publication gate. After all approved states are reviewed, prepare one consolidated shortlist with **no more than two** pilot recommendations.

No implementation should begin until:

1. all approved-state research is complete;
2. query/Search Console evidence is available;
3. owner confirms service fit;
4. current-main overlap is reviewed;
5. a candidate reaches at least 7/10;
6. Vladimir approves no more than two pilot pages;
7. a fresh small implementation branch passes full current-head CI.
