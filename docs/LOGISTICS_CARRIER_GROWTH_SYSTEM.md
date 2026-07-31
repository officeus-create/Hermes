# Hermes Logistics — Car-Hauler Carrier Growth Operating System

Status: implementation guidance for the 100-task growth sprint. This document governs research, copy, data preparation, and publication. It does not authorize mass page generation or production release.

## 1. Evidence and publication gate

Every public statement must be assigned one evidence state:

- `VERIFIED_PUBLIC`: already supported by a public Hermes page, approved public contact, signed public-facing policy, or published product behavior.
- `VERIFIED_INTERNAL`: supported by an internal agreement, operating record, approved workflow, or owner-confirmed process; publication still requires privacy and claim review.
- `OWNER_APPROVED_PENDING_SOURCE`: approved direction, but the supporting source and exact wording must be attached before publication.
- `RESEARCH_ONLY`: keyword, route, language, location, or service opportunity under investigation.
- `DO_NOT_PUBLISH`: unsupported guarantee, private information, invented result, prohibited claim, or unverified location/service combination.

A geo, route, or language page must score at least 7/10:

1. verified route/demand evidence: 0–2;
2. genuinely weak search competition: 0–2;
3. real fit with a current Hermes service: 0–2;
4. enough unique lane/language value: 0–2;
5. crawlable internal link and useful CTA: 0–1;
6. approved source with review date: 0–1.

Automatic rejection conditions:

- only the city name changes;
- no verified carrier activity or customer demand;
- no unique operational guidance;
- the page promises loads, revenue, rankings, insurance approval, financing, rates, or direct freight;
- private customer/carrier data would be exposed;
- the same search intent already has a stronger Hermes page;
- the team cannot respond in the represented language or clearly explain the communication boundary.

## 2. Twenty approved carrier-value categories

These are value categories, not universal promises. A page may use only the categories that match the verified service scope for that audience and lane.

1. Load search aligned with equipment, location, timing, and carrier preferences.
2. Daily dispatch coordination after the carrier approves a load.
3. Route, deadhead, and schedule planning support.
4. Backhaul opportunity research.
5. Broker and shipper communication support.
6. Rate-negotiation support without guaranteeing the final rate.
7. Broker setup and carrier-packet coordination.
8. Authority, W-9, COI, and required-document workflow support.
9. Pickup, transit, and delivery instruction coordination.
10. Exception and communication support during an active load within the agreed scope.
11. BOL, POD, rate-confirmation, and document collection workflow.
12. Invoicing and accounts-receivable support where included in the signed scope.
13. Equipment and commodity-fit review.
14. Open, enclosed, hotshot, and multi-car operational positioning.
15. Direct shipper, dealer, auction, port, broker, and customer research.
16. Decision-maker identification and structured outreach.
17. Direct-freight pipeline development over an agreed working period, without response or load guarantees.
18. Trusted Carrier Network qualification review based on verified operating factors.
19. Introductions or research for insurance agents, trucks, trailers, and service vendors without approval, price, financing, or availability guarantees.
20. Operational growth planning around verified equipment, service area, lanes, communication, documents, and carrier-controlled decisions.

## 3. Claim boundaries

Approved pattern:

> Hermes provides research, coordination, communication, dispatch, documentation, and business-development support within the agreed service scope. The carrier keeps final control over loads, rates, routes, equipment, insurance, vendors, and business decisions.

Never state or imply:

- guaranteed load volume;
- guaranteed weekly gross or net income;
- guaranteed direct shippers or dealers;
- guaranteed rate, pickup, delivery, or capacity;
- guaranteed Trusted Carrier Network admission;
- guaranteed insurance approval or premium;
- guaranteed truck/trailer financing, purchase, condition, or availability;
- that Hermes is the broker, insurer, lender, dealer, warehouse, auction, port, or equipment seller unless a separately verified relationship says so;
- that submitting a form creates an account, books a load, or signs a contract.

## 4. Historical route-opportunity data contract

The route dataset must preserve provenance and review state. Minimum record:

```ts
export type RouteOpportunityRecord = {
  recordId: string;
  sourceFile: string;
  sourceRow?: number;
  sourceDate?: string;
  importedAt: string;
  reviewedAt?: string;
  reviewStatus: "raw" | "normalized" | "needs_review" | "verified" | "rejected";

  originRaw: string;
  destinationRaw: string;
  originCity?: string;
  originState?: string;
  originZip?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationZip?: string;

  equipmentRaw?: string;
  equipmentClass?: "open_car_hauler" | "enclosed_car_hauler" | "hotshot_car_hauler" | "multi_car_hauler" | "unknown";
  capacityUnits?: number;
  vehicleCount?: number;
  operatedAt?: string;
  carrierInternalId?: string;

  laneKey?: string;
  evidenceNotes?: string;
  privateDataRemoved: boolean;
};
```

Do not store public-facing carrier names, phones, emails, VINs, exact residential addresses, private rate confirmations, or customer documents in an SEO dataset.

## 5. Lane normalization and deduplication

Normalization order:

1. trim whitespace and control characters;
2. preserve the raw value;
3. normalize U.S. state names to two-letter codes;
4. normalize city capitalization without guessing misspellings;
5. keep ZIP only when present and plausible;
6. separate facility names from city/state;
7. map equipment only from explicit evidence;
8. create a directional lane key: `origin_city|origin_state->destination_city|destination_state`;
9. create a corridor key without direction for research comparisons;
10. merge duplicates only when normalized origin, destination, equipment class, and date context agree.

Hold for review when:

- city or state conflicts with ZIP;
- origin/destination is a facility name without a resolvable city;
- one field contains several locations;
- equipment is inferred only from company name;
- route direction is missing;
- date is missing and the record cannot be tied to the reviewed historical period.

## 6. Route opportunity score

Use a 0–10 score:

- historical route evidence: 0–2;
- customer/carrier commercial fit: 0–2;
- weak current search competition: 0–2;
- unique operational content available: 0–2;
- internal linking and CTA path: 0–1;
- source provenance and review date: 0–1.

Decision:

- 0–4: reject or archive;
- 5–6: research only;
- 7–8: content brief permitted;
- 9–10: pilot implementation permitted after conflict and claim review.

A low third-party keyword score alone is never enough.

## 7. Keyword taxonomies

### Car-hauler owner-operator

Core intent families:

- car hauling dispatch support;
- car hauler dispatcher;
- dispatch for owner-operators;
- car hauling load search;
- car hauler backhaul support;
- car hauling route planning;
- dispatch support by trailer capacity;
- open/enclosed car hauling support;
- dealer and auction vehicle transport opportunities;
- car hauling paperwork and broker setup;
- direct shipper/dealer development for car haulers.

Modifiers must come from evidence:

- equipment: open, enclosed, hotshot, 1/2/3/6/7/9/10-car only when verified;
- operating stage: new authority, active authority, owner-operator, small fleet;
- geography: verified origin, destination, home market, or corridor;
- problem: deadhead, backhaul, documents, negotiation, dealer demand, auction pickup;
- language: only after query and service-language validation.

### New authority

Intent families:

- car hauler dispatch for new authority;
- first-load preparation for car haulers;
- carrier packet and COI workflow;
- MC/DOT readiness review;
- choosing lanes for a new car-hauling authority;
- equipment and capacity positioning;
- broker setup preparation;
- document workflow for new owner-operators.

Boundary: Hermes may review information and explain operating preparation. Hermes does not issue authority, insurance, financing, legal advice, or guaranteed first loads.

### Backhaul and deadhead

Problem families:

- return-load research;
- empty-mile reduction planning;
- repositioning between auction/dealer markets;
- schedule-compatible backhaul search;
- partial-capacity opportunity review;
- preferred-lane development;
- direct-customer pipeline around repeated corridors.

Do not publish claimed savings unless a reviewed calculation and methodology exist.

## 8. Equipment taxonomy

- `open_car_hauler`: open trailer intended for vehicle transport; capacity must be separately verified.
- `enclosed_car_hauler`: enclosed vehicle-transport trailer; never imply luxury/classic suitability without equipment and operating confirmation.
- `hotshot_car_hauler`: pickup/medium-duty configuration pulling a vehicle-transport trailer; authority, insurance, weight, and equipment fit remain carrier responsibilities.
- `multi_car_hauler`: multi-unit vehicle transporter; unit count must be explicit.
- `single_or_small_capacity`: one- to three-vehicle capacity only when explicitly recorded.
- `unknown`: no public targeting until reviewed.

Required page facts before using an equipment modifier:

- explicit equipment class;
- verified operating area or lane;
- approximate capacity only when documented;
- operable/inoperable handling boundary;
- authority and insurance qualification language;
- final load approval remains with the carrier.

## 9. Carrier support content brief

Primary audience: active car-hauling owner-operators and small fleets.

Primary promise boundary: operational support, not guaranteed outcomes.

Required sections:

1. who the service is for;
2. equipment and authority information required;
3. how load search and carrier approval work;
4. broker setup and document coordination;
5. pickup/delivery communication;
6. deadhead and schedule considerations;
7. what Hermes does not control;
8. direct call/email/intake CTA;
9. visible non-guarantee statement;
10. related dealer/shipper demand pages when verified.

## 10. Direct shipper/dealer development brief

Positioning:

> One operating path supports today's dispatch needs. A separate business-development path may research and develop relationships around the carrier's verified equipment and lanes over an agreed period.

Required boundaries:

- no prospect response guarantee;
- no direct-load guarantee;
- no exclusivity claim unless written;
- opportunity transfer into operations only after qualification;
- carrier approves final commercial and operating decisions;
- timeline is approximate and subject to the signed scope.

## 11. Vendor-introduction brief

Permitted categories:

- insurance-agent research/introduction;
- truck and trailer listing research;
- maintenance/service-vendor research;
- compliance-service research;
- technology and document-tool research.

Required disclosure:

> Hermes may research or introduce third-party providers. The provider controls eligibility, pricing, underwriting, financing, inventory, condition, terms, and service. The carrier performs final due diligence and makes the final decision.

No referral relationship or compensation claim may be published without evidence.

## 12. Language priorities

### Publishable after demand validation

1. English — primary national and lane language.
2. Spanish — full research priority for U.S. carriers, dealers, and shippers.
3. Russian — carrier and owner-operator support where Hermes can communicate effectively.
4. Ukrainian — carrier and owner-operator support where Hermes can communicate effectively.

### Research-only until minimum threshold is met

- Romanian for Romanian/Moldovan audiences;
- Russian for Moldovan audiences when search behavior supports it;
- Lithuanian;
- Hindi;
- Punjabi;
- Gujarati.

Minimum language threshold:

- at least one validated query family or Search Console impression set;
- service-language capacity confirmed;
- unique localized explanation and FAQ;
- no machine-translated thin copy;
- correct canonical/hreflang plan;
- one useful CTA and response-language disclosure;
- total page score at least 7/10.

## 13. Terminology governance

Keep common U.S. operating terms in English when that is how the audience searches and works: `carrier`, `owner-operator`, `dispatch`, `load`, `broker`, `shipper`, `dealer`, `MC`, `DOT`, `COI`, `BOL`, `POD`, `rate confirmation`, `backhaul`, `deadhead`, `car hauler`.

Localized copy should explain the term naturally instead of replacing it with an inaccurate literal translation. Do not use a single label such as “Indian language”; research Hindi, Punjabi, and Gujarati separately.

## 14. Unique lane-page requirement

Every route page must contain all of the following:

- verified origin and destination relationship;
- why the lane matters to a specific carrier/customer audience;
- equipment or vehicle context;
- local pickup/delivery or market considerations;
- the Hermes support scope relevant to that lane;
- qualification and final-decision boundaries;
- unique FAQ based on the lane;
- links to the carrier side and customer-demand side;
- reviewed source and date stored internally;
- a non-generic CTA.

A location name substitution is not sufficient.

## 15. Pilot-lane shortlist status

The accessible conversation/library search did not surface the claimed full historical origin-to-destination dataset. Therefore no lane is approved for publication from this document alone.

Next data action:

1. locate or export the historical route file;
2. import it under the contract above;
3. remove private information;
4. normalize and deduplicate;
5. score each lane;
6. publish only a reviewed shortlist scoring 7/10 or higher.

No guessed lane is permitted.

## 16. Carrier CTA matrix

- New authority: `Prepare your authority, equipment, and first operating lanes for review.`
- Active owner-operator: `Share your equipment, current area, and preferred lanes.`
- Open car hauler: `Review open-car-hauler dispatch and lane support.`
- Enclosed carrier: `Discuss enclosed vehicle opportunities that match verified equipment.`
- Hotshot: `Share your trailer configuration, capacity, and operating area.`
- Multi-car fleet: `Discuss dispatch, documentation, and lane-development support for your fleet.`
- Backhaul problem: `Send your current destination and preferred return market for review.`
- Direct-freight development: `Discuss a separate shipper/dealer development scope around verified lanes.`
- Vendor research: `Ask for third-party provider research; approval and terms remain with the provider.`

All CTAs begin a review. They do not create a load, account, approval, contract, insurance policy, purchase, or guaranteed business result.
