# Hermes GEO Operating Runbook

Status: `STACKED_PREVIEW — NON-VISUAL`

Backlog: Issue #693 tasks 91–99  
Measurement source of truth: Issue #206  
CEO visual queue: Issue #694

## 1. One-command local scorecard run

From repository root:

```bash
node --experimental-strip-types scripts/geo-operational-scorecard.mjs examples/geo-operational-input.synthetic.json > /tmp/hermes-geo-scorecard.json
```

For real operations, replace the example path with a locally prepared sanitized input file. Do not commit authenticated exports, raw lead rows, raw queries, analytics IDs, credentials, or provider conversations.

The CLI is fail-closed, offline, reads one JSON file, and writes report JSON to stdout.

## 2. Synthetic examples

- input: `examples/geo-operational-input.synthetic.json`
- validated summary snapshot: `examples/geo-operational-output.synthetic.json`

All example counts are invented and use `unverified` evidence. They demonstrate schema, window, funnel and reconciliation behavior only.

## 3. GSC / Bing evidence preparation checklist

Before adding search evidence:

- [ ] authenticate in the real owner-controlled platform outside GitHub;
- [ ] confirm exact export start and end dates;
- [ ] keep 7 / 28 / 90-day exports exact; preserve any other interval as its real checkpoint;
- [ ] aggregate to canonical page × reviewed discovery/query group before committing any reusable fixture;
- [ ] remove raw query text from GitHub-facing artifacts; use opaque reviewed query-group IDs where query diagnostics are needed;
- [ ] classify branded/non-branded as `reviewed` or leave it pending — do not silently promote a heuristic;
- [ ] use controlled geography/device buckets where diagnostics need them;
- [ ] preserve Google and Bing source identity;
- [ ] record evidence class and evidence/check timestamp;
- [ ] keep authenticated index-state evidence separate from IndexNow transport acknowledgement;
- [ ] never claim `INDEXED` from IndexNow `ACCEPTED` alone;
- [ ] compare platform totals to the raw owner-side export before sanitization is discarded locally.

## 4. Existing GA4 exact-once evidence checklist

Do **not** create a replacement GA4 property just to satisfy this checklist.

For the existing Hermes property:

- [ ] resolve owner access to the existing property outside GitHub;
- [ ] identify the current canonical commercial events from `docs/PRODUCTION_ANALYTICS_EVENT_REGISTRY.md`;
- [ ] perform one controlled non-private test action in browser;
- [ ] verify consent state before analytics transport;
- [ ] inspect the browser/network event without exposing property/stream IDs in GitHub evidence;
- [ ] confirm the intended event is received once — not zero times and not duplicated client/server;
- [ ] confirm event payload contains only allowed non-PII fields;
- [ ] distinguish browser emission from GA4 platform receipt;
- [ ] record a private owner-side receipt reference/timestamp, then transfer only sanitized aggregate evidence into the GEO runner;
- [ ] repeat per funnel family before treating analytics evidence as platform-verified;
- [ ] do not instrument proposed SEO/website `delivery_confirmed` events until receiver boundaries and existing exact-once receipt are proven.

## 5. Private qualification aggregate checklist

Raw inquiry rows stay private.

Prepare only owner/window aggregates:

- [ ] exact standard window: 7 / 28 / 90;
- [ ] canonical owner page path;
- [ ] reviewed inquiries;
- [ ] qualified leads;
- [ ] opportunities;
- [ ] wins;
- [ ] losses;
- [ ] revenue-reconciled win **count only**;
- [ ] one private evidence snapshot timestamp;
- [ ] evidence class;
- [ ] verify `qualified <= reviewed`;
- [ ] verify `opportunities <= qualified`;
- [ ] verify `wins + losses <= opportunities`;
- [ ] verify `revenue-reconciled wins <= wins`;
- [ ] verify reviewed inquiries do not exceed receiver-confirmed delivery when the owner/window is called reconciled;
- [ ] remove names, emails, phones, company names, IDs, shipment/load data and revenue values before the aggregate leaves the private system.

Preferred preparation contract: `geo_private_outcome_aggregate_v1`.

## 6. AI visibility manual-review checklist

The current system is review-first; do not scrape or store full provider conversations.

For each governed prompt/provider checkpoint:

- [ ] run the exact governed prompt manually in the intended provider/context;
- [ ] record provider and timestamp;
- [ ] record brand mention yes/no;
- [ ] record linked citation yes/no;
- [ ] if cited, record only the reviewed Hermes site-relative cited path;
- [ ] record recommendation strength;
- [ ] review entity accuracy;
- [ ] review description accuracy;
- [ ] flag factual error separately;
- [ ] record public competitor business labels only when materially present;
- [ ] write a short corrective-action note without copying the full answer;
- [ ] store an opaque evidence reference, not response text;
- [ ] verify the cited path against the prompt's governed canonical owner;
- [ ] keep weekly vs monthly cadence from the prompt registry;
- [ ] never convert observation coverage into a claim about the provider's whole index or market share.

## 7. Weekly operating sequence

Run this loop once per operating cycle:

1. **Gather** — obtain owner-authenticated GSC/Bing/GA4/private-operation evidence and scheduled AI observations.
2. **Sanitize** — remove raw queries, PII, private rows, IDs, credentials and full AI responses.
3. **Validate** — pass strict import/security contracts; reject malformed, future-dated, duplicate or non-standard evidence rather than repairing it silently.
4. **Compile** — run the secure operational scorecard.
5. **Reconcile** — inspect held evidence, incomplete funnels, freshness, owner readiness, index state and qualification integrity.
6. **Compare** — compare only matching 7↔7, 28↔28 and 90↔90 scorecards.
7. **Prioritize** — apply the owner remediation ordering below.
8. **Implement** — make bounded non-visual fixes autonomously; create visual preview variants only when a material design decision is required.
9. **Verify** — build + test + e2e on exact head.
10. **Record** — update Issue #206 evidence state, Issue #693 task progress, and Issue #694 only for material visual decisions.

## 8. Owner remediation priority rules

Use this order. Do not reorder work because a page is visually interesting.

### Priority 1 — evidence/truth gap

Examples: no authenticated search evidence, stale evidence, factual error, missing source coverage, incorrect citation owner, incomplete index-state proof.

### Priority 2 — demonstrated demand

Prefer owners with authenticated impressions/clicks/non-branded discovery or reviewed AI observation demand. Do not create demand from synthetic examples.

### Priority 3 — funnel break

Fix missing CTA/intake/preview/handoff/delivery evidence and receiver reconciliation before optimizing downstream conversion ratios.

### Priority 4 — lead quality / commercial outcome

Use private-safe reviewed/qualified/opportunity/win aggregates only after receiver evidence is reconciled.

### Priority 5 — answer surface / internal graph

Then address concise answers, evidence modules, entities, comparison/Q&A structure, internal links and schema parity.

### Priority 6 — material visual refinement

Only after the evidence and owner contract are clear. If the implementation materially changes Hermes layout, hero, card language, evidence module, navigation, imagery, animation, typography or mobile composition, add it to Issue #694 for batch CEO review.

## 9. Evidence labels are not freshness labels

Keep these concepts independent:

- evidence class = where/how the evidence was verified;
- freshness = how old the evidence is;
- completeness = whether all required layers are present;
- reconciliation = whether cross-layer counts are internally consistent.

A stale platform-verified record remains platform evidence; a fresh unverified record remains unverified.
