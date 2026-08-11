# SEO 11 Weekly Revenue Scorecard

Status: `TEMPLATE_READY / AUTHENTICATED VALUES PENDING`  
Owner: SEO 11 / Issue #366  
Cadence: weekly operating review; use one defined timezone and non-overlapping reporting periods.

## Purpose

Answer one operating question each week:

`Which search/landing paths produced real qualified commercial opportunity, what changed, and what do we do next?`

This scorecard is not a vanity dashboard. A metric may be shown only when its evidence class is explicit. Missing platform/operations data remains `DATA_PENDING` rather than estimated.

## Evidence classes

- `PLATFORM_VERIFIED` — authenticated GSC, GA4, Bing, CrUX or another named platform.
- `PRODUCTION_RECEIVER_VERIFIED` — approved receiver confirmed delivery.
- `PRIVATE_OPERATIONS_VERIFIED` — human-reviewed aggregate disposition/outcome from an owner-controlled private system.
- `REPOSITORY_VERIFIED` — implementation/contract/build/production-verifier evidence only; not traffic or conversion proof.
- `UNVERIFIED` — no adequate evidence read.
- `DATA_PENDING` — required value is intentionally blank until its source is available.

Never place names, emails, phones, MC/USDOT, VINs, routes, rates, messages, private account identifiers or user-level analytics rows in this file.

---

# 1. Executive weekly pulse

| KPI | This week | Prior week | Delta | Evidence class | Decision / note |
| --- | ---: | ---: | ---: | --- | --- |
| Unique delivered inquiries | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Receiver reconciliation required |
| Human-reviewed inquiries | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Private operations aggregate |
| Qualified inquiries | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Use approved #206 definitions |
| Qualification rate | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | `qualified / human-reviewed` |
| Opportunities | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Private operations only |
| Won outcomes | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Direction-specific authoritative outcome |
| Non-branded GSC clicks | DATA_PENDING | DATA_PENDING | DATA_PENDING | PLATFORM_VERIFIED required | No query estimates |
| GSC impressions | DATA_PENDING | DATA_PENDING | DATA_PENDING | PLATFORM_VERIFIED required | Query/page evidence |
| GSC CTR | DATA_PENDING | DATA_PENDING | DATA_PENDING | PLATFORM_VERIFIED required | `clicks / impressions` |
| Priority money pages indexed | DATA_PENDING | DATA_PENDING | DATA_PENDING | PLATFORM_VERIFIED required | GSC URL/page-index evidence |
| Production SEO hygiene | PASS on 2026-08-11 | — | — | REPOSITORY_VERIFIED + live public read | Re-run after material SEO releases |
| Mobile field LCP | DATA_PENDING | DATA_PENDING | DATA_PENDING | PLATFORM_VERIFIED / CrUX required | Lighthouse lab is separate |

## Weekly CEO answer

- Strongest revenue/search path: `DATA_PENDING`
- Biggest leak/blocker: `DATA_PENDING`
- Highest-confidence next experiment: `DATA_PENDING`
- What we will not scale yet: `DATA_PENDING`

---

# 2. Direction scorecard

Keep funnels separate. Do not blend Academy candidates with customer leads or mix unlike commercial directions into one conversion rate.

| Direction | Delivered | Reviewed | Qualified | Qualification rate | Contacted | Conversation | Opportunity | Won | Evidence state | Next action |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Logistics — carrier / owner-operator | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Reconcile private aggregate |
| Logistics — dealer / auction / transport | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Reconcile private aggregate |
| Marketing / SEO | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Reconcile platform + private aggregate |
| IT / website / automation | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Reconcile platform + private aggregate |
| Academy | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Report separately from customer revenue |

Canonical stage definitions and formulas remain in `docs/QUALIFIED_INQUIRY_DEFINITIONS.md`; this scorecard must not redefine qualification locally.

---

# 3. Search demand and page opportunity

Use authenticated GSC evidence only.

| Cluster / page | Clicks | Impressions | CTR | Avg position | Non-branded share | WoW direction | Issue class | Experiment / next action | Evidence |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| `/logistics/car-hauling-dispatch/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull 7d/28d query-page evidence | PLATFORM_VERIFIED required |
| `/logistics/dealer-vehicle-transportation/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull 7d/28d query-page evidence | PLATFORM_VERIFIED required |
| `/logistics/auction-vehicle-pickup/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull 7d/28d query-page evidence | PLATFORM_VERIFIED required |
| `/logistics/appleton-wi-vehicle-transport/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull current query-page evidence | PLATFORM_VERIFIED required |
| `/services/seo/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull 7d/28d query-page evidence | PLATFORM_VERIFIED required |
| `/services/website-development/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull 7d/28d query-page evidence | PLATFORM_VERIFIED required |
| `/academy/us-logistics-operations/` | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | Pull 7d/28d query-page evidence | PLATFORM_VERIFIED required |

Allowed query/page issue classes are defined in `docs/SEO11_GSC_QUERY_PAGE_SCORECARD_2026-08-11.md`.

## Weekly query movers

### Positive

`DATA_PENDING`

### Negative

`DATA_PENDING`

### Cannibalization / wrong-owner watch

`DATA_PENDING`

---

# 4. Conversion-chain health

Only populate GA4 rates after authenticated production event receipt/deduplication is verified.

| Stage | Count / rate | Evidence | Status / blocker |
| --- | ---: | --- | --- |
| Eligible sessions | DATA_PENDING | PLATFORM_VERIFIED required | GA4 ownership/receipt pending |
| Commercial CTA | DATA_PENDING | PLATFORM_VERIFIED required | Do not infer from repository events |
| Intake started | DATA_PENDING | PLATFORM_VERIFIED required | Do not infer from repository events |
| Intake completion / handoff | DATA_PENDING | PLATFORM_VERIFIED required | Define approved event per direction |
| Delivery confirmed | DATA_PENDING | PRODUCTION_RECEIVER_VERIFIED | Exclude tests/duplicates/spam |
| Human reviewed | DATA_PENDING | PRIVATE_OPERATIONS_VERIFIED | Owner-controlled aggregate |
| Qualified | DATA_PENDING | PRIVATE_OPERATIONS_VERIFIED | Approved #206 definition |

Required rates where evidence exists:

- CTA rate = `trusted commercial CTA / eligible sessions`.
- Intake completion rate = `approved completed/handoff stage / intake started`.
- Unique delivered inquiry rate = `unique non-test delivered inquiries / eligible sessions`.
- Human-review rate = `human-reviewed unique inquiries / unique delivered inquiries`.
- Qualification rate = `qualified unique inquiries / human-reviewed unique inquiries`.
- Opportunity rate = `opportunities / qualified inquiries`.
- Win rate = `won / (closed won + closed lost)`.

State direction, period, attribution window and timezone whenever a rate is published.

---

# 5. Index / technical health

| Check | Current state | Evidence | Next trigger |
| --- | --- | --- | --- |
| Priority canonical route contract | PASS 2026-08-11 | production SEO verifier | Re-run after material SEO/release changes |
| Noindex workspace contract | PASS 2026-08-11 | production SEO verifier | Re-run after intake-route changes |
| Sitemap index + 7 child sitemaps | PASS 2026-08-11 | production SEO verifier | Re-run after sitemap architecture changes |
| `llms.txt` basic contract | PASS 2026-08-11 | production SEO verifier | Re-run after agent-discovery changes |
| Real 404 HTTP contract | PASS 2026-08-11 | production SEO verifier | Re-run after routing/platform changes |
| GSC Crawled/Discovered-not-indexed reasons | DATA_PENDING | PLATFORM_VERIFIED required | Pull authenticated GSC Page Indexing |
| Google-selected vs declared canonical | DATA_PENDING | PLATFORM_VERIFIED required | URL Inspection / index evidence |
| Bing index/inspection state | DATA_PENDING | PLATFORM_VERIFIED required | Existing Bing access must be restored |

Do not equate repository or public HTTP health with Google/Bing index status.

---

# 6. Performance / UX

| Metric | Lab | Field | Status |
| --- | --- | --- | --- |
| Mobile LCP | pending repeatable post-deploy measurement in #354 | DATA_PENDING | Keep lab and field separate |
| Mobile FCP | pending | not a field Core Web Vital | Lab diagnostic |
| Mobile TBT | pending | not field INP | Lab diagnostic |
| Mobile CLS | pending | DATA_PENDING | Field only when CrUX/GSC available |
| INP | not established in current lab scorecard | DATA_PENDING | Field evidence required |

Never fill the field column from Lighthouse.

---

# 7. Trust / proof coverage

| Proof slot | State | Public permission | Next action |
| --- | --- | --- | --- |
| Carrier / owner-operator | private evidence candidate identified | NOT_REQUESTED | Private eligibility review |
| Dealer/customer vehicle movement | private evidence candidate identified | NOT_REQUESTED | Private eligibility review |
| Logistics SEO reviewer | decision pending | NO | Verify real reviewer or `NO_NAMED_REVIEWER` |
| Academy instructor/mentor | decision pending | NO | Verify real person or `NO_NAMED_INSTRUCTOR` |

Source: `docs/SEO11_PERMISSIONED_PROOF_REGISTRY.md`.

---

# 8. Experiments and decisions

Maximum active SEO experiments per page should remain small enough to attribute directionally. One experiment row represents one bounded hypothesis, not a bundle of unrelated changes.

| Experiment ID | Page/query family | Hypothesis | Change | Start date | Pre-period | Post-period | Result | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING | DATA_PENDING |

Decision vocabulary:

- `KEEP`
- `ITERATE`
- `REVERT`
- `CONSOLIDATE`
- `NEW_PAGE_JUSTIFIED`
- `NEW_PAGE_NOT_JUSTIFIED`
- `WAIT_FOR_DATA`

---

# 9. Scale gate

Programmatic location/equipment/language expansion stays **BLOCKED** unless the evidence package shows:

1. current owner pages are indexable and earning relevant impressions;
2. a distinct query intent cannot be served cleanly by an existing owner;
3. new content can add unique buyer value rather than swap names;
4. conversion path and measurement exist;
5. qualified-action evidence supports continued investment or an explicit strategic exception is approved.

Weekly gate decision: `BLOCKED_PENDING_#206` until authenticated page/query + qualified-action evidence changes it.

---

# 10. Weekly action output

End every review with no more than five operational decisions:

1. `DATA_PENDING`
2. `DATA_PENDING`
3. `DATA_PENDING`
4. `DATA_PENDING`
5. `DATA_PENDING`

For each decision specify: owner, evidence dependency, target page/process, expected observable signal, and review date.
