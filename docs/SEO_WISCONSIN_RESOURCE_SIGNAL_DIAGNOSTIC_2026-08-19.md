# Wisconsin/local + resource signal diagnostic — Batch 4 tasks 241–260

## Appleton
GSC snapshot:
- `/logistics/appleton-wi-vehicle-transport/`: 43 impressions, 0 clicks, avg position 40.81.
- query sample includes `appleton warehousing services` (14 impressions / 54.93) and `appleton logistics services` (11 / 55.27).

Current page scope is explicitly vehicle transport: dealer, auction, business and private moves; route, vehicle condition, timing, access, open/enclosed equipment and carrier review.

### Decision
KEEP the Appleton vehicle-transport owner. Do not add warehousing copy, warehousing schema, warehouse CTAs, storage claims, or warehouse service pages to capture the observed warehousing query. Google testing the URL for a mismatched query is not evidence that Hermes Logistics offers that service.

The page already has direct vehicle-transport intake plus Load Board demo paths. Any future visible snippet/copy experiment must stay vehicle-transport specific and pass the normal preview/390px/CEO gate.

## Waukesha and Wisconsin local mismatch
Observed queries include:
- `carrier services for businesses near me in waukesha` — 15 impressions / position 53.
- `carrier services near me in waukesha` — 10 / 63.1.

These terms are ambiguous. They do not justify changing the Waukesha page into a generic carrier-services or business-services page. Maintain the statewide/city hierarchy and only strengthen real vehicle-transport meaning.

Other observed local signals remain small:
- `enclosed auto transport wi` — 5 impressions / 41.4.
- `auto transport services eau claire wi` — 5 / 48.8.
- `vehicle transport milwaukee` — 2 / 71.
- `auto transport kenosha wi` — 1 / 50.
- `car transport milwaukee wi` — 1 / 76.

### Local architecture decision
- Wisconsin statewide owner = state/service-area hub.
- City pages = exact local vehicle-transport owner only.
- Equipment pages = open/enclosed/inoperable/multi-car intent owners.
- Dealer/Auction/Port pages = operating-context owners.
- Cost guide = pricing-input informational owner.

No city/state page may absorb unrelated warehousing, machinery moving, generic carrier, freight forwarding or other unsupported intent simply because an impression appears.

## Positive resource signals
### Auction Vehicle Pickup Checklist
GSC:
- 1 click
- 15 impressions
- 6.67% CTR
- position 14.07

Current page has a direct auction transport intake, practical release/access/storage/condition/equipment checklist, explicit facility-rule boundary and no auction affiliation claim.

**Decision:** PRESERVE. It has the first demonstrated click signal and a useful direct next step. No title/content expansion is required merely because it has started ranking.

### Car Hauler Capacity Checklist
GSC:
- 1 click
- 10 impressions
- 10% CTR
- position 9.90

Current page has a direct carrier-capacity review action, dispatch-support path, authority/equipment/route/timing guidance and explicit no-load/no-rate/no-revenue guarantee.

**Decision:** PRESERVE. It has page-one-range evidence at low sample size. Protect its carrier-capacity intent and measure before cloning adjacent checklist pages.

## Adjacent resource gate
A new resource may be proposed only when all are true:
1. observed query/problem is relevant to a real Hermes service or user workflow;
2. the resource has unique utility beyond an existing page;
3. one canonical commercial next step exists;
4. no private operational/customer/carrier data is required publicly;
5. no fabricated rates, capacity, cases, customers, statistics or results are needed;
6. it does not become a keyword/city/equipment permutation;
7. existing winner performance is not diluted by near-duplicate content.

## Tasks 241–260 status
- 241–248: Appleton/Waukesha/Wisconsin query mismatch diagnosed; true transport owner preserved; unsupported warehousing/generic-service expansion rejected.
- 249: thin/local doorway guard remains mandatory.
- 250: Texas/Florida/California remain separately evidence gated.
- 251–255: both resource winners audited; current direct next-step paths are present and aligned.
- 256–258: adjacent resource/no-fabrication gates recorded.
- 259: resource -> qualified action still depends on authenticated analytics/lead reconciliation not contained in GSC; remains external measurement work.
- 260: future resource production must be evidence-led, not checklist-volume-led.
