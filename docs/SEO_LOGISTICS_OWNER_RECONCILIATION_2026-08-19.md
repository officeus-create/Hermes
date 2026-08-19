# Hermes SEO — Logistics Canonical Owner Reconciliation

Date: 2026-08-19  
Scope: Google/Bing organic commercial SEO. This review prevents old content briefs from creating duplicate owners or cannibalizing current production routes.

## Decision summary

| Old brief | Current production ownership | Decision |
|---|---|---|
| Carrier Onboarding | `/logistics/carrier-onboarding/` + `/logistics/start-car-hauling-dispatch/` + carrier audience/path owners | `ALREADY_OWNED` — do not create another onboarding URL |
| Shipper & Dealer Transport Intake | `/logistics/request-vehicle-transport/` + `/logistics/dealer-vehicle-transportation/` + `/logistics/shipper-dealer/` + `/paths/logistics/shippers-dealers/` | `ALREADY_OWNED` — strengthen existing funnel only |
| Broker Collaboration & Carrier Capacity | `/logistics/broker/` + `/paths/logistics/brokers/carrier-capacity/` | `ALREADY_OWNED / QUERY_EVIDENCE_REQUIRED` — do not add another commercial URL without distinct query evidence |
| Port-to-Dealer / Port Vehicle Pickup | `/paths/logistics/customers/port-pickup/` owns qualification intent; no dedicated commercial `/logistics/...` service owner found in current build | `COMMERCIAL_OWNER_CANDIDATE` — research first, then build only if intent separation remains clear |
| Luxury & Classic Vehicle Transport | `/paths/logistics/customers/luxury-classic-vehicle/` + `/logistics/enclosed-vehicle-transport/` | `ALREADY_OWNED / STRENGTHEN_EXISTING` — do not create a third overlapping owner |

## 1. Carrier Onboarding

The old brief proposed `/logistics/carrier-onboarding/`, but current production already builds that route and also provides `/logistics/start-car-hauling-dispatch/` as a qualification/handoff workspace.

Current public operating facts already cover authority and insurance readiness, equipment, capacity, geography, availability, scope review, carrier control, and explicit no-guarantee language.

Decision: retire the brief as a page-creation task. Future SEO work should improve internal ownership, titles/copy, or funnel measurement only when evidence shows a gap.

## 2. Shipper & Dealer Transport Intake

The old brief proposed `/logistics/shipper-dealer-transport-intake/`. Current production already has:

- direct structured intake at `/logistics/request-vehicle-transport/`;
- commercial dealer owner at `/logistics/dealer-vehicle-transportation/`;
- audience owner at `/logistics/shipper-dealer/`;
- path owner at `/paths/logistics/shippers-dealers/`.

The existing flow already separates one-time transportation, repeat capacity review, and managed coordination without promising capacity, price, timing, equipment, or assignment.

Decision: do not publish another intake URL. Any new content should link into the existing canonical intake and owners.

## 3. Broker Collaboration & Carrier Capacity

The old brief proposed `/logistics/broker-carrier-capacity/`. Current production already builds `/logistics/broker/` and `/paths/logistics/brokers/carrier-capacity/`.

The current path requires origin, destination, dates, equipment, commodity, rate, authority/insurance, and tracking expectations before capacity can be represented as available.

Decision: hold a new commercial broker-capacity page unless current query evidence demonstrates a distinct transactional intent that the existing broker audience/path owners cannot satisfy. Prefer strengthening existing owners before adding a URL.

## 4. Port Vehicle Pickup — candidate

Current production has `/paths/logistics/customers/port-pickup/` with a qualification-first owner covering:

- release/customs-status checklist;
- terminal/port/airport/warehouse access review;
- arrival, pickup window, storage and demurrage review;
- TWIC or escort discussion when applicable;
- vehicle condition, handling and equipment fit;
- private-document boundary.

Current commercial SERPs also show a distinct port-vehicle-transport archetype: port-to-door/port-to-dealer transport, terminal release/access, paperwork, storage timing, equipment and carrier scheduling. Competitor claims are research inputs only and are not Hermes facts.

Decision: this is the only old brief in the five-page set that remains a plausible dedicated commercial owner. Do not publish yet. First resolve query ownership and overlap against:

- `/paths/logistics/customers/port-pickup/`;
- `/logistics/dealer-vehicle-transportation/`;
- `/logistics/auction-vehicle-pickup/`;
- `/logistics/request-vehicle-transport/`.

### Allowed Hermes value if built

Only use capabilities already supported by current public truth:

- collect/review release status and access context;
- review facility type, ready date, storage/deadline context and vehicle condition;
- discuss TWIC/escort/access requirements when applicable;
- match equipment and carrier fit after qualification;
- route sensitive documents through an approved private channel.

### Prohibited claims without new evidence

Do not claim:

- Hermes performs customs brokerage or customs clearance;
- Hermes owns or operates a port, terminal, yard or warehouse;
- guaranteed terminal release;
- guaranteed TWIC access or escort;
- guaranteed pickup/delivery timing;
- live carrier capacity at a named port;
- named port partnerships;
- port-specific rates or storage-fee avoidance;
- damage-free transport.

## 5. Luxury & Classic Vehicle Transport

Current production already has a path owner for luxury/classic vehicle qualification and a commercial enclosed transport owner.

The existing public truth covers open-vs-enclosed review, operability/clearance/loading/securement/handling, authority/insurance/experience qualification, access/release/storage/timing, and private handling of sensitive details.

Decision: do not add `/logistics/luxury-classic-vehicle-transport/` now. Strengthen the existing enclosed commercial page and luxury/classic path only if query/SERP evidence identifies missing user questions or conversion gaps.

## Publication rule

A historical content brief is not permission to create a page. Before adding any new commercial Logistics URL:

1. identify the current canonical owner;
2. prove distinct query intent;
3. document non-duplicative user value;
4. map visible claims to current Hermes service truth;
5. define the direct conversion path;
6. define internal links and sitemap owner;
7. pass thin/cannibalization review;
8. add measurement ownership;
9. pass desktop/mobile QA and current SEO gates.

## Next action

1. Finish and release the Wisconsin cost-guide growth slice.
2. Validate Port Vehicle Pickup query families and SERP archetypes more deeply.
3. If distinct commercial intent survives overlap review, prepare one commercial Port Pickup owner — not multiple port/city permutations.
4. Strengthen existing Enclosed/Luxury owner links instead of adding a duplicate luxury page.
