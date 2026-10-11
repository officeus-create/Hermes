# Hermes Search + Growth Guardrail

Owner-approved: 2026-10-06  
Scope: every Hermes department, product, page, repository agent, release lane, and search/marketing decision.

## Business priority

**P0 is qualified Car Hauling carrier acquisition**: real owner-operators and fleets with car-hauling equipment that want Hermes to source/plan loads and support dispatch operations.

This is the current proven money flow. Search/Marketing may allocate up to **100%** of effort to this P0 when current evidence shows it is the highest-value use of capacity. There is no fixed allocation reserved for secondary products.

After P0, choose the next action dynamically by:

`expected qualified revenue × current evidence × speed to learn × reuse ÷ effort ÷ cannibalization risk ÷ technical/legal risk`

High-value secondary opportunities include Website Development / Website Redesign worldwide, Hermes Connect / CRM, dealers/shippers/brokers / Load Board, and any other real Hermes product or service when fresh evidence shows a faster credible route to qualified users or revenue.

An evidence-backed quick win may jump the queue. It must still pass the Search Release Gate and must not materially weaken P0.

## No website freeze

Do **not** stop Design, Technology, Hermes Connect, CRM, Load Board, Catalog, Academy, client implementations, UX, bug fixing, conversion work, or product development.

The restriction is on **uncontrolled search-surface expansion**, not on useful website/product work.

A new public route does not automatically earn `index,follow` or sitemap ownership.

## Search Release Gate

Before a new route becomes an indexable search owner, all applicable checks must pass:

1. **Distinct intent** — real query/audience/problem not already owned by an existing page.
2. **Real capability** — Hermes can actually deliver what the page offers.
3. **Truth/evidence** — claims, geography, inventory, pricing, availability, results, and relationships are supportable.
4. **Canonical ownership** — no duplicate owner, keyword cannibalization, or thin permutation.
5. **Unique user value** — useful content/tool/evidence, not a cloned city/equipment/keyword shell.
6. **Internal discovery** — meaningful internal links from appropriate hubs/owners.
7. **Real action** — CTA/receiver leads to a real human/system workflow where applicable.
8. **Clean measurement** — query/page and action path can be measured without PII or synthetic-QA contamination.
9. **Technical pass** — HTTP, canonical, robots, sitemap, schema, mobile/accessibility, and performance are valid.
10. **Experiment contract** — baseline, hypothesis, metric, window, success/failure threshold, and rollback/hold rule when the page is an SEO experiment.

If the gate fails, strengthen the existing canonical owner, keep the new route out of the sitemap, or use intentional non-search/private/demo behavior where appropriate.

Do not mass-create city/state/equipment/service permutations. Do not turn private/auth/CRM/API/demo routes into SEO pages merely to increase page count. Do not mass-`noindex` proven existing owners as a cleanup shortcut.

## History-first recovery rule

Do not start a new broad SEO/GEO/GSC/Bing/site audit when a verified analysis and error register already exist.

Use this order:

`RECOVER HISTORY -> CHECK CURRENT STATE OF THE EXACT DEFECT -> CLOSE IF ALREADY FIXED -> BOUNDED FIX IF STILL PRESENT -> REGRESSION GATE -> OWNER-GATED RELEASE -> EXACT-SHA LIVE VERIFY -> SEARCH SETTLEMENT`

- Old platform buckets are evidence about the past, not automatic current defects.
- A closed/superseded issue, PR or branch must not remain an execution router.
- Do not merge a stale recovery branch wholesale. Replay only the reviewed delta onto current `main`.
- Do not rerun a generic baseline merely because a prior task requested one. Pull a newer bounded platform window only when the underlying state changed or a concrete decision requires a newer settled interval.
- Every recurring technical failure should become a regression/release gate, and every operating lesson should be written to One Brain.
## Existing-owner-first rule

Before creating a URL:

`SEARCH EXISTING OWNER -> STRENGTHEN -> INTERNAL AUTHORITY -> CTA/RECEIVER -> MEASURE -> NEW URL only if still justified`

Search recovery and growth should prefer pages already earning real impressions, rankings, qualified traffic, or commercial actions.

## Question / Topic Mapping rule

Use topic mapping as an **existing-owner strengthening method**, not as permission to create a large new article/page wave.

Preferred question sources, in order:

1. settled GSC/Bing query history already on record;
2. real Sales / Carrier / Dealer / Shipper objections and questions;
3. CRM, Catalog, support and product-navigation questions;
4. Search Console / Bing exact-query evidence from a bounded current decision window when needed;
5. external question tools only when the existing evidence cannot answer a specific gap.

Process:

`QUESTION -> INTENT -> EXISTING CANONICAL OWNER -> ANSWER/FAQ/SECTION/TOOL -> INTERNAL LINK -> CTA -> MEASURE`

Create a new indexable URL only when the question represents a distinct, durable intent that passes the full Search Release Gate. Otherwise answer the question inside the existing owner.

Do not publish one page per question, one client × platform page, or one city/equipment/service permutation merely because a keyword/question exists. Topic coverage is measured by useful intent ownership and qualified outcomes, not article count.

For AI visibility / LLMO, prefer concise source-bounded answers, clear entity/context relationships, structured headings, truthful FAQ where appropriate, and direct links to the canonical product/service/entity owner. Do not invent expertise signals, customer outcomes, ratings, or unsupported claims.

## Growth learning and evidence-to-client loop (12 October 2026)

Every historical insight and external-marketer practice must resolve to an existing owner and a decision, not a new audit or content factory. Classify it as `VERIFIED_SUCCESS | VERIFIED_FAILURE | REUSABLE_LESSON | OPEN_DEFECT | SUPERSEDED | EXPERIMENT | ACCESS_GAP`. Include source, date/window, affected canonical page or business lane, evidence, current issue/PR, commercial hypothesis and next action. Never reopen a superseded issue based solely on old chat text.

Prioritization is two-dimensional: **urgency × business impact**, then estimate fix effort. Fix a small bounded defect immediately only when current ownership, exact production impact and regression scope are clear; route larger fixes to the existing owner/backlog. A critical major incident is not deferred merely because it is large. Do not write to concurrent active owner branches.

Preserve audience attribution: U.S. paying carriers/dealers/businesses and international Academy/recruiting candidates are separate cohorts. Historic country/language social-post views establish a content hypothesis, not U.S. commercial demand, ranking lift or customer proof. For each content experiment track account, market, intent, canonical destination, publish verification, UTM, real site sessions, CTA, receiver confirmation, human qualification, opportunity and business result. `VIEWS != SESSIONS != LEADS != REVENUE`; synthetic, QA and internal traffic are separate. Provider acceptance is not proof of published visibility.

Daily loop: `READ CANONICAL STATE -> PICK ONE COMMERCIAL BOTTLENECK -> SAFE ACTION -> EXACT OWNER/PRODUCTION PROOF -> LEARN -> NEXT`. Evaluate daily operational failures, but use comparable settled 7/28-day windows for search response. Independent experts' advice is a candidate experiment unless independently verified for Hermes.

Training the installed SEO Director plugin requires reading its **current release and touched files**, applying the smallest rule/evaluation delta, guarded update, and post-release readback. A GitHub note or PR **does not** prove the plugin release was updated. Preserve existing safety boundaries, current One Brain router, no automated outbound email, and no dispatcher outreach.

## Synthetic traffic

Hermes synthetic traffic includes CI, GitHub Actions, Playwright, release verifiers, headless browsers, Codex/Claude/ChatGPT production checks, uptime probes, API smoke tests, and other machine-generated Hermes QA traffic.

Synthetic traffic is **not** a customer, lead, qualified action, or revenue proof.

Required controls:

- Identify Hermes-owned synthetic requests with a stable User-Agent naming scheme where possible.
- Add a non-secret synthetic marker/header where the architecture supports it.
- Keep `HUMAN`, `SEARCH_CRAWLER`, and `HERMES_SYNTHETIC` as separate evidence classes.
- Exclude known synthetic sessions/events from business analytics and conversion KPIs where possible.
- Never block verified Googlebot/Bingbot or other approved search crawlers while cleaning internal QA traffic.
- Prefer deploy/change-triggered verification over repeated full-site polling.
- Centralize overlapping production readbacks; multiple agents should not repeatedly crawl the same surfaces.
- Use bounded health checks for always-on monitoring; reserve full browser sweeps for release/regression/scheduled QA.
- Synthetic forms/test leads stay explicitly QA and never become commercial lead/revenue evidence.
- Investigate 401/403/404/429/5xx patterns before changing WAF/bot rules; do not make broad blocking changes from inference.

## Department non-regression rules

### CEO / COO / Completion Architect
Enforce this policy across workstreams. Page count is not a KPI. Resolve collisions by current business value and source-of-truth precedence.

### Marketing / SEO / GEO / AEO / LLMO
Own the Search Release Gate, canonical query ownership, and search-priority decisions. P0 is Car Hauling carrier acquisition until newer evidence supports a better business-priority shift. `UNKNOWN` is never zero.

### Logistics / Carrier Operations / Sales
Treat qualified Car Hauling carriers as the first money outcome. Feed real objections, equipment/route needs, and commercial language back to Search/Marketing. Do not publish private operational records or transient load observations as public proof.

### Technology / Web Development
Keep building. Apply the Search Release Gate before a new public route becomes a search owner. Reuse existing canonical pages/components/data models before parallel routes. Private/utility/API routes do not need search ownership by default.

### Hermes Connect / CRM
Build toward real users, repeat use, value, and payment. Private/auth/customer workspaces remain non-search surfaces. Do not create SEO pages for every screen or capability.

### Load Board
Prioritize truthful carrier/dealer/shipper/broker workflows and real inventory state. Never imply live loads/capacity when the verified count is zero or unknown. Strengthen existing search owners before creating new provider/equipment/city families.

### Design / UX / Brand
Continue design work. Do not remove, hide in JS-only UI, or materially weaken canonical headings, meaningful crawlable copy, internal links, evidence, or primary CTAs without Search-owner review. Motion and cinematic layers are progressive enhancement.

### DevOps / Cloudflare
Preserve verified search-crawler access and canonical redirects. Separate/minimize Hermes synthetic traffic safely. Do not use WAF/bot cleanup rules that may accidentally block Googlebot/Bingbot. Runtime health is evidence, not a ranking KPI.

### Analytics / QA / Security
Maintain `HUMAN` vs `SEARCH_CRAWLER` vs `HERMES_SYNTHETIC` separation. Synthetic QA proves technical behavior only, never a customer/lead/revenue outcome.

### Academy / HR / Recruiting / Community
Do not make every program, country, vacancy, or community state an indexable owner without current demand, truth, lifecycle, and a useful conversion path. Expired roles/programs must not be marketed as current.

### Catalog / Partnerships / Client Pages
Real client work continues. Public indexation requires truth, permission/ownership boundaries, unique value, and a real purpose. No mass directory expansion for page count alone.

### Finance
Prioritize verified commercial evidence. Keep actual money separate from forecast, pipeline, and synthetic/test outcomes.

## Evidence ladder

Use the highest stage actually proven:

`TECHNICAL_DONE -> LIVE_VERIFIED -> INDEX_STATE_OBSERVED -> RANKING_OBSERVED -> TRAFFIC_OBSERVED -> QUALIFIED_ACTION_OBSERVED -> BUSINESS_RESULT_VERIFIED -> REVENUE_VERIFIED`

Do not skip stages.

- `MERGED != LIVE`
- `INDEXED != RANKING`
- `CLICK != LEAD`
- `FORM SUBMIT != HUMAN RECEIPT`
- `SYNTHETIC QA != CUSTOMER`
- `LEAD != REVENUE`

## Current Search Recovery rule

During the current recovery:

- do not freeze the website;
- do not start mass new indexable page waves;
- protect and strengthen existing money owners first;
- P0 is Car Hauling carrier acquisition;
- high-confidence quick-win money opportunities are allowed when they pass the gate;
- clean synthetic analytics/QA noise in parallel; it is not a prerequisite for every product change, but it must not contaminate decisions.

## Bing evidence

Fresh Bing evidence supplied by the owner must be treated by exact date/scope as current owner-provided/authenticated evidence. Do not replace it with stale historical Bing state. Do not change Bing/IndexNow/search settings until the fresh evidence is reconciled.

## Owner directive

Build the ecosystem aggressively, but do not let any department damage Search/Marketing authority, create uncontrolled index bloat, invent demand, or pollute measurement. Search exists to produce qualified users and money; page count is not a KPI.
