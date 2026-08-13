# SEO13 — Appleton Query-Intent Boundary — 2026-08-13

Status: BOUNDED INTENT / INTERNAL-LINK PASS
Parent: #461
Execution issue: #463
Measurement source: #206

## Evidence context

The recorded GSC snapshot shows `/logistics/appleton-wi-vehicle-transport/` receiving impressions while visible Appleton query language also includes broad local terms such as warehousing and generic logistics services.

Those impressions are not permission to rewrite a vehicle-transport page as a warehousing page.

## Classification

### Canonical owner
`/logistics/appleton-wi-vehicle-transport/` remains the intended owner for Appleton/Fox Valley vehicle transport and auto-transport intent.

### Broad Appleton warehousing queries
Current classification: `INTENT_MISMATCH` / `NEW_PAGE_NOT_JUSTIFIED` until both conditions are satisfied:
1. Hermes has a real approved warehousing service that can be truthfully described; and
2. authenticated query-to-page evidence shows commercially meaningful demand for a distinct service page.

Neither condition is established by the current repository evidence alone.

### Generic Appleton logistics queries
Current classification: `ADJACENT_INTENT` or `INTENT_MISMATCH` depending on the exact query. They should not broaden the vehicle-transport page beyond its real job.

## Repository audit result

The current Appleton commercial page already has a vehicle-transport title, H1, description, vehicle/dealer/auction/private-party content, transport preparation guidance and the matching canonical URL.

The reviewed Appleton SEO case links to that page using the descriptive anchor `Appleton vehicle transport` and separately describes the SEO implementation. No reviewed production source was found intentionally targeting `Appleton warehousing services` on the vehicle-transport page.

Therefore this pass does **not** add warehousing copy to the page.

## Changes in this pass

1. Strengthened the homepage crawl path from generic `Vehicle transport planning` / `Open Appleton guide` wording to:
   - `Appleton vehicle transport`;
   - `Plan Appleton vehicle transport`.
2. Added build-output regression checks requiring:
   - the Appleton page canonical to remain `/logistics/appleton-wi-vehicle-transport/`;
   - one H1 containing both Appleton and vehicle-transport meaning;
   - title meaning to remain Appleton + vehicle transport;
   - no targeted `Appleton warehousing services` / `Appleton warehouse services` wording;
   - the homepage to reinforce the exact vehicle-transport owner with descriptive internal anchors.
3. Preserved the existing page instead of making a speculative broad rewrite.

## What would justify a new Appleton service URL later

A separate Appleton warehousing/generic-logistics page should be considered only if:
- the underlying service is genuinely offered and approved for public sale;
- distinct buyer intent is verified;
- the page can provide unique operational value rather than a city permutation;
- a qualified conversion path exists;
- query/page and outcome evidence supports the investment.

## Follow-up

After release, review the Appleton query-to-page matrix at the next authenticated 7/28-day checkpoint. If vehicle-transport queries begin consolidating around this canonical owner, keep the boundary. If broad unrelated terms persist, investigate external/entity/internal semantic sources before changing the commercial service scope.
