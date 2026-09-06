# Automotive GEO P0 — carrier + dealer + repair acquisition — 2026-09-05

Status: IMPLEMENTATION CONTRACT

## CEO scope

Use the same evidence-backed U.S. automotive markets to acquire three distinct audiences without collapsing their search intent into duplicate pages:

1. Car-hauling carriers / owner-operators / small fleets.
2. Dealers and vehicle-market businesses that need vehicle transportation.
3. Automotive repair/service businesses that can register for Hermes Connect and separately review Local SEO, SEO, and website development.

## GEO priority

### P0

- South Florida / Miami
- Atlanta
- Orlando / Central Florida
- Chicago

### P1 validation

- Phoenix
- Houston
- Los Angeles / Orange County
- Inland Empire

The priority comes from privacy-safe aggregation of first-party carrier geography plus search-demand validation. It is an acquisition and measurement priority, not a claim that Hermes has an office, fleet, guaranteed load supply, guaranteed dealer demand, or guaranteed repair-shop customers in any market.

## Canonical owners

| Audience / job | Canonical owner | Primary action |
| --- | --- | --- |
| Generic car-hauler / auto-transport load-board intent | `/load-board/` | Carrier role state / access workflow |
| Car-hauling dispatch support | `/logistics/car-hauling-dispatch/` | `/logistics/start-car-hauling-dispatch/` |
| Dealer inventory / auction / dealer-to-dealer vehicle movement | `/logistics/dealer-vehicle-transportation/` | Direct dealer transport intake |
| Dealer SEO | `/services/seo-for-independent-auto-dealers/` | Dealer SEO inquiry |
| Repair-shop software / registration | `/services/hermes-connect/repair-shops/` | Repair owner registration |
| Repair/local growth | `/services/local-seo/`, `/services/seo/`, `/services/website-development/` | Separate growth inquiry |

Role/equipment query parameters on `/load-board/` remain UI state and must not become duplicate search owners.

## Search-demand checkpoint

Validated U.S. demand already includes approximately:

- `car hauler load board`: 480 searches/month
- `auto transport load board`: 390 searches/month
- `car hauling dispatch service`: 70 searches/month
- `car hauling dispatch`: 50 searches/month
- `auto repair shop software`: 2,900 searches/month
- `repair shop management software`: 1,300 searches/month
- `mechanic shop software`: 590 searches/month
- `collision repair software`: 590 searches/month

Exact city-token variants such as `car hauler load board Miami` did not return sufficient Keyword Planner volume in the first validation pass. Therefore GEO priority does not automatically create an indexable city page.

## Product-truth boundary

The current Repair Shops workflow is represented for:

- independent auto repair;
- truck / diesel repair;
- mobile mechanics;
- tire service;
- body / collision businesses.

Do not claim additional automotive categories are supported until the product workflow has been reviewed for them.

## Publication policy

P0 is implemented first as truthful semantic coverage and internal routing on existing canonical owners. A new indexable city/metro URL requires all of:

1. distinct query intent;
2. SERP evidence that a separate local owner is useful;
3. real service/product capability in that market;
4. useful non-duplicative local content or utility;
5. an attributable qualified-action path;
6. privacy/evidence review.

No mass city cloning, doorway pages, private carrier/dealer/shop records, addresses, phones, emails, MC/DOT data, shipment records, or unsupported local-office claims may be published.

## Measurement

Keep Search and product analytics separate.

### Car hauling

- GSC impressions and query coverage for `/load-board/` and `/logistics/car-hauling-dispatch/`;
- average position and clicks for carrier/load-board/dispatch intent;
- carrier intake starts and qualified carrier handoffs.

### Dealer transport

- GSC dealer transport / auction / multi-vehicle query coverage;
- visits to `/logistics/dealer-vehicle-transportation/`;
- dealer transport intake starts and qualified transport requests;
- dealer SEO / Local SEO / website-development handoff clicks separately.

### Repair

- GSC query coverage for repair-shop software and supported subtype intent;
- repair owner registration starts;
- separate Local SEO / SEO / website-development CTA activity;
- qualified shop activation or growth inquiries only when production attribution proves them.

## 72-hour rule

The next checkpoint looks for directional evidence: new or stronger query coverage, impressions, position movement, product registration/intake activity, and clean attribution. No traffic, ranking, lead, or revenue number is guaranteed.
