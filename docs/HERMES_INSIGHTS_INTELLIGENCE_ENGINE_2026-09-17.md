# Hermes Insights Intelligence Engine — Operating Contract

Date: 2026-09-17
Owner surface: `/insights/`

## Objective

Turn current public changes plus Hermes first-party operating history into evidence-backed, useful, searchable Insights. The canonical website answer comes first. Telegram and other social platforms distribute a shorter platform-native version that links back to the relevant Hermes owner page or Insight.

This system is not a bulk-news scraper. It is an editorial and evidence pipeline designed to produce original analysis, historical comparison, internal links, and measurable distribution without exposing private operating data.

## Canonical flow

`source signal -> rights/privacy review -> current verification -> topic classification -> historical match -> publication score -> canonical Hermes Insight/digest -> Telegram draft -> social variants -> measurement -> reuse`

The website remains the canonical long-lived owner. Telegram, Instagram, Facebook, Threads, X and other channels are distribution surfaces, not competing canonical copies.

## Governed sources

The machine-readable source inventory lives in `src/data/insights-source-registry.json`.

### Historical Telegram

- `TG-001`: HTML export for HL 40 Branch / Hermes Logistik Yerevan. Historical operations evidence only.
- `TG-002`: `Telegram_Business_Export_2026-07-17.jsonl`, 6,104 messages across 17 chats, observed coverage 2021-09-13 through 2026-04-29.
- Priority historical clusters include HL 40 Branch, HL Dispatch K., HL Dealers Shippers, HL Dispatch Assist (D), Hermes Logistics Academy, HL 40 Branch Sales Team, HL Carrier agreement and HL Shippers.

Historical Telegram is never current truth by itself. It is useful for patterns such as equipment segmentation, dispatch workflow, deadhead reduction, rate negotiation, objections, shipper/dealer workflow and training evolution.

### Gmail

- `officeus@hermeslogisticsus.com`: business, search, partnership, product and operations signals.
- `tina.bloom.truckload@gmail.com`: shipper/broker/logistics operating signals.

Email is `signal_then_verify` or aggregate-pattern evidence. Private correspondence, contact data, quoted commercial terms, customer/load data and private discussions are not public sources by default.

### Current public web

Current claims must be revalidated against dated authoritative public sources whenever possible: regulators, platform documentation, primary company announcements, official datasets and other directly attributable sources.

## Privacy and claim-safety gates

Any public content based on historical Telegram or private Gmail must pass all three gates before publication:

1. `piiRemoved = true` — remove names, phone numbers, emails, personal handles, MC/company identifiers where not explicitly public and necessary.
2. `privateFiguresRemoved = true` — remove private rates, revenue, customer/carrier figures, unpublished commercial data and one-to-one correspondence details.
3. `historicalClaimsRevalidated = true` — old pricing, commission, earnings, guarantees, tools and operating capabilities must not be represented as current without current verification.

Historical earnings promises, old commission percentages and old sales language are evidence of prior practice, not approved current claims.

## Publication score

Candidate scoring is implemented in `scripts/score-insight-candidate.mjs`.

Positive signals:

- freshness: 0–20
- source authority: 0–20
- first-party evidence: 0–20
- historical comparison: 0–15
- search value: 0–15
- internal-link fit: 0–10

Risk penalties:

- privacy risk: 0–30
- unverified current claim: 0–25
- duplicate risk: 0–20
- promotional-only signal: 0–15

Routing:

- `0–39`: hold; collect evidence or discard
- `40–59`: Telegram-only candidate
- `60–74`: digest candidate
- `75–89`: standalone Insight candidate
- `90–100`: standalone candidate; when historical comparison is strong, use `standalone_historical`

A score is a routing control, not a substitute for editorial review or factual verification.

## Then -> now format

High-value historical stories should use this structure:

1. What Hermes teams observed or did in the earlier period.
2. What has changed in the current market, platform, process or product.
3. Which parts of the old practice remain useful and which are superseded.
4. What the change means operationally now.
5. What action a carrier, shipper, shop, marketer, trainee or technology buyer can take.
6. Current dated sources plus relevant Hermes internal links.

Historical private chats should be paraphrased as anonymous operating patterns, not quoted as identifiable conversations.

## Weekday news cycle

Timezone: `America/Chicago`.
Cadence: Monday–Friday at 06:00 CT.

Approved public Telegram destinations for the existing news loop:

- `Hermes Logistics Academy`
- `SMM Organic Target`

`HL 40 Branch` may be a private historical source but is excluded from public news posting.

Maximum: one useful item per approved destination per weekday. If no candidate clears the required threshold, publish nothing.

Default short-form sequence:

`What changed -> Why it matters -> What to do -> Result -> Source/date -> CTA`

Current market claims require a dated current source. Telegram history can add context but cannot replace current verification.

## Website publication

Existing publication contract remains authoritative:

- `src/data/insights.generated.json`
- `scripts/publish-insight.mjs`
- `scripts/insights-pipeline.test.mjs`
- `scripts/sync-insights-sitemap.mjs`
- `scripts/sync-insights-release-delta.mjs`
- `.github/workflows/insights-content-pr.yml`

New optional provenance fields are additive so existing published records remain valid:

- `evidence[]`
- `historicalComparison`
- `publicationScore`
- `privacyReview`

When supplied, these fields are now enforced by the publish and test gates.

## Social distribution

The existing internal social-distribution workspace already prepares separate Facebook, Threads, Instagram, X and Telegram drafts with platform-specific UTM links and an auditable review path. It remains noindex and does not assume live publication.

Observed connector state on 2026-09-17:

- Instagram account `hermes.logistics`: connected through Windsor.ai and supports direct image, video, Story and 2–10 image carousel publication.
- Metricool Hermes brand: exists with timezone `America/Chicago`, but no networks were connected in the observed account state.
- Facebook / Threads / X: no live publication connection was verified in this implementation pass.

Therefore the safe rollout order is:

1. canonical website asset approved;
2. Telegram draft/approved delivery through the existing Hermes workflow;
3. Instagram carousel generation and review, then live publication when the visual asset is approved;
4. connect Facebook, Threads and X to a supported publisher;
5. reuse the same canonical asset with platform-native copy and UTM attribution.

Do not turn on blind cross-posting. Each platform receives a distinct draft and tracked URL; the website remains canonical.

## Measurement

Primary funnel:

`evidence -> approved Insight -> discovered/crawled -> indexed -> impression -> click -> internal owner page -> qualified action`

Track at minimum:

- candidate count by source and direction
- hold / Telegram / digest / standalone routing rate
- percentage of historical candidates with successful current verification
- publication-to-indexing latency
- impressions and unique queries per Insight
- Telegram and social CTR by `utm_source`
- internal-link clickthrough to commercial/product/Academy owners
- qualified lead or product action assisted by an Insight
- content reused across channels
- privacy or claim-safety rejects (target: caught pre-publication, zero public incidents)

## Direction taxonomy

Top-level direction remains intentionally small:

- Logistics
- Marketing
- Academy
- Technology

Use secondary metadata for product/topic/geography rather than creating many competing top-level news silos. Relevant product/owner links may include Hermes Connect, Catalog, Load Board, carrier operations, shipper/dealer resources, Academy programs, SEO/GEO/SMM and technology products.

## Operational rule

Volume is never the goal. The system may collect hundreds of signals and publish zero items if none add verified value. Historical first-party evidence is valuable because it can create original context, but private content is an input to analysis, never raw public copy.
