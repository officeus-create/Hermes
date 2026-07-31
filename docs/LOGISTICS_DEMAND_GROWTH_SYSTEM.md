# Hermes Logistics — Dealer, Shipper, Broker, and Customer Demand System

Purpose: connect verified car-hauler capacity with verified vehicle-transport demand on the same lanes without manufacturing demand, publishing private data, or claiming guaranteed capacity.

## 1. Demand taxonomy aligned to carrier lanes

Every demand record should be classified by audience, movement type, route, timing, vehicle condition, and equipment fit.

### Audience

- independent dealer;
- dealer group;
- auction buyer or seller;
- remarketing business;
- wholesaler;
- restoration/classic-vehicle business;
- exporter/importer;
- broker;
- manufacturer or specialty-vehicle business;
- private customer.

### Movement type

- dealer-to-dealer transfer;
- auction pickup;
- auction delivery;
- customer purchase delivery;
- trade-in relocation;
- fleet or inventory repositioning;
- port pickup or delivery;
- storage-facility pickup;
- restoration/classic movement;
- open transport;
- enclosed transport;
- operable vehicle;
- inoperable vehicle requiring additional review.

### Required demand fields

```ts
export type VehicleTransportDemandRecord = {
  recordId: string;
  sourceType: "internal_request" | "public_business_research" | "approved_partner" | "research_only";
  sourceReference: string;
  sourceDate: string;
  reviewedAt?: string;
  status: "raw" | "needs_review" | "verified" | "rejected";

  audience: "dealer" | "shipper" | "broker" | "auction" | "restoration" | "private_customer" | "other";
  originCity?: string;
  originState?: string;
  destinationCity?: string;
  destinationState?: string;
  laneKey?: string;

  vehicleType?: string;
  vehicleCount?: number;
  operableStatus?: "operable" | "inoperable" | "unknown";
  preferredTransport?: "open" | "enclosed" | "either" | "unknown";
  readyWindow?: string;
  recurringPotential?: "one_time" | "possible_repeat" | "verified_repeat" | "unknown";

  privateDataRemoved: boolean;
  evidenceNotes?: string;
};
```

No public SEO dataset may contain customer names, personal phones, personal email addresses, exact residential addresses, VINs, gate codes, account numbers, or private documents.

## 2. Independent dealer intake content brief

Primary intent: help independent dealers prepare a vehicle-transport request and understand the review process.

Required sections:

1. vehicle quantity and type;
2. pickup and delivery city/state;
3. operable/inoperable condition;
4. open/enclosed preference;
5. auction or facility release status;
6. ready date and delivery constraints;
7. title/key/document availability where operationally relevant;
8. how Hermes reviews route and carrier fit;
9. what is not guaranteed;
10. phone, email, and approved intake CTA.

Approved boundary:

> Hermes coordinates information, reviews service fit, and may identify relevant carrier capacity. The carrier and customer retain final control over price, acceptance, timing, equipment, and transport decisions.

## 3. Auction buyer and remarketing brief

Useful content:

- verify facility name and actual pickup location;
- confirm vehicle release and payment status;
- confirm buyer number or release document requirements;
- record storage deadline and pickup window;
- identify operable/inoperable status;
- identify keys, tires, rolling/steering/braking status when known;
- record vehicle dimensions or special conditions when relevant;
- confirm whether forklift, winch, or other equipment may be required;
- avoid representing Hermes as affiliated with the auction unless verified.

CTA:

`Share the auction, pickup city, release status, vehicle condition, and delivery market for review.`

## 4. Restoration and classic-vehicle customer brief

Primary intent: qualify specialized vehicle movement without implying every carrier or trailer is suitable.

Required facts:

- year, make, model, and general vehicle type;
- operable/inoperable condition;
- open/enclosed preference;
- low-clearance, oversized, non-running, loose-part, or special-loading considerations;
- pickup/delivery city and facility type;
- requested timing;
- evidence that enclosed or specialized capacity is actually available before implying a match.

Required boundary:

> Specialized or enclosed transport depends on verified equipment, authority, insurance, access, loading conditions, route, and current carrier availability.

## 5. Port and storage-facility pickup brief

Hermes may discuss coordination involving a port, terminal, auction, yard, or storage facility. Do not claim that Hermes owns, operates, or provides warehousing or storage.

Required questions:

- exact facility name and city/state;
- release status;
- required identification or appointment process;
- pickup hours and deadline;
- storage or demurrage urgency as reported by the customer;
- vehicle condition and keys;
- equipment/access constraints;
- final destination;
- contact route for facility instructions.

Approved wording:

`Hermes may coordinate transport information for pickup from a third-party port, terminal, auction, yard, or storage facility. Facility access, release, fees, rules, and availability remain controlled by that third party.`

## 6. Capacity-to-demand internal linking rules

A carrier-capacity page may link to a customer-demand page only when both share at least one verified dimension:

- route or corridor;
- equipment type;
- service area;
- vehicle category;
- auction/dealer/port market;
- timing pattern;
- language audience.

Required link structure:

- logistics hub → carrier service page;
- logistics hub → customer/dealer service page;
- carrier page → related demand page;
- demand page → related carrier/equipment page;
- both pages → direct contact/intake;
- supporting checklist → relevant commercial page.

Never present the link itself as proof of live capacity or demand.

## 7. Customer CTA matrix

- Independent dealer: `Share the vehicles, pickup market, destination, condition, and ready date.`
- Auction buyer: `Send the auction, release status, vehicle condition, and delivery market.`
- Recurring shipper: `Describe your monthly volume, common lanes, vehicle types, and operating requirements.`
- Broker: `Submit the route, commodity, equipment requirement, timing, and verification details.`
- Restoration/classic customer: `Request a review for open, enclosed, operable, or specialized vehicle transport.`
- Port/storage pickup: `Share the facility, release status, deadline, vehicle condition, and destination.`
- Private party: `Prepare a vehicle-transport request; submission does not guarantee a rate, pickup date, or carrier.`

## 8. Lane-pair publication checklist

A paired carrier/customer lane cluster may move to a content brief only when:

- at least one verified historical carrier route exists;
- at least one verified demand signal exists or a documented public business market justifies research;
- origin and destination are normalized;
- equipment fit is documented;
- private data is removed;
- the page adds unique local and operational value;
- search competition is reviewed;
- both sides have useful CTA routes;
- no guaranteed-capacity wording appears;
- the cluster scores at least 7/10.

## 9. Dealer-route evidence requirements

A dealer-route page requires:

- verified dealer/auction/remarketing market at one or both ends;
- verified historical or current carrier corridor evidence;
- clear vehicle-transport use case;
- local operational details that are not generic;
- publication-safe source references and dates;
- no unaffiliated brand implication;
- no customer identity or private transaction details;
- route-specific FAQ and qualification steps.

A list of dealers alone does not justify a route page.

## 10. Recurring shipper qualification

Ask for:

- legal business name and public website;
- role and authority to discuss shipments;
- commodity/vehicle types;
- estimated frequency and volume stated as customer-provided, not guaranteed;
- common origin/destination markets;
- pickup/delivery requirements;
- payment and documentation expectations;
- current process and main operational problem;
- whether the request is immediate, planned, or exploratory.

Classify:

- `one_time_request`;
- `unverified_repeat_interest`;
- `verified_recurring_pattern` after reviewed evidence;
- `not_a_fit`.

## 11. Broker opportunity qualification

Required:

- broker legal name and authority/verification details;
- pickup and delivery;
- vehicle/commodity and count;
- equipment requirements;
- operable/inoperable status;
- timing and pickup window;
- rate context if voluntarily supplied;
- payment terms and documents;
- contact authorization;
- unusual conditions.

Hold when authority, commodity, equipment fit, or payment details cannot be reasonably reviewed.

## 12. Private-customer qualification

Required:

- pickup and delivery city/state;
- vehicle year/make/model;
- operable status;
- open/enclosed preference;
- earliest ready date;
- facility type;
- access constraints;
- contact consent.

Boundary:

> A request begins a review. It does not create a booking, guarantee a carrier, guarantee a rate, or confirm pickup/delivery timing.

## 13. Content architecture

Recommended cluster pattern:

`lane/corridor evidence → carrier equipment/support page → dealer/shipper demand page → operational checklist → intake/contact`

Do not create one page per dealer, carrier, or private request. Publish substantive market or corridor pages only when they serve multiple users and meet the publication gate.
