# SEO-4 Full Re-audit — 2026-08-04

## Decision

The previous audit was directionally correct, but its active-task list is now stale. The conversion and lead-delivery gaps that were P0 on August 3–4 have been closed. The current priority is no longer another form rewrite or another broad technical SEO pass.

The next money-focused phase is:

`production measurement → evidence-backed trust → external authority → selective semantic expansion`

Do not treat repository implementation, a merged PR, or a successful build as proof of indexing, qualified leads, rankings, reviews, or revenue.

## Sources reviewed

- current `main` at merge commit `3d417410a0dd2a7d4a5169e73125bfcc8c565cc2`;
- recent merged PRs #177–#183;
- Issue #167 production evidence;
- Issue #176 SEO-4 Secret Shopper roadmap;
- `docs/SEO2_CLOSEOUT_2026-08-02.md`;
- `docs/ai-project-state.json`;
- `README.md` and `docs/AI_START_HERE.md`;
- current homepage, commercial owners, trust pages, entity registry, contact and intake contracts;
- owner-provided audit/conversation export dated August 1–3, 2026;
- the two supplied Instagram reel URLs already registered in the content pipeline.

## Current verified baseline

### Repository and production

- latest reviewed `main`: `3d417410a0dd2a7d4a5169e73125bfcc8c565cc2`;
- open pull requests at re-audit time: zero;
- generated HTML routes: 107;
- indexable routes: 96;
- sitemap files: 7;
- production contact smoke: PASS;
- one synthetic inquiry: delivered;
- repeated idempotency key: suppressed as duplicate;
- Issue #167: closed as completed;
- rollback remains `LEAD_DELIVERY_MODE=off`.

### Conversion work now complete

- direct carrier dispatch intake is separate from the fictional Load Board demo;
- direct dealer, auction, shipper, broker, business, and private-customer transport intake exists;
- homepage has a six-role fast router before the four ecosystem pillars;
- Logistics commercial pages have final contextual CTA modules and direct fallbacks;
- Load Board demo freshness uses evergreen labels rather than stale public dates;
- all four general website inquiry directions use the protected same-origin receiver in production;
- privacy-safe intake, preview, handoff, delivery-confirmed, fallback, and role-routing event contracts exist.

## Reconciliation of the earlier audit

| Audit area | Earlier conclusion | Current conclusion | Status |
| --- | --- | --- | --- |
| Technical SEO | Mostly implemented | Still strong; route, canonical, sitemap, schema, internal-link and browser regression coverage are mature | COMPLETE / monitor |
| Query-to-page ownership | Missing final map | 30 commercial/problem-solving queries are mapped to five existing owners; broader semantic coverage is still incomplete | FOUNDATION COMPLETE |
| External authority | Seriously weak | Still one of the largest remaining gaps | ACTIVE COMPLEX |
| Local SEO / GBP | Conditional | Still conditional on real customer-facing/service-area eligibility and verified NAP | OWNER GATE |
| Analytics | Installed but commercially incomplete | Event taxonomy and production delivery exist; GSC/Bing/GA4-to-qualified-lead evidence remains incomplete | ACTIVE COMPLEX |
| Production technical field data | Missing | Still missing a durable PageSpeed/CWV/TTFB/error-monitoring feedback loop | ACTIVE COMPLEX |
| E-E-A-T / trust | About, legal and proof pages missing | About, Terms, Editorial/Corrections and Accessibility now exist; real people, cases, testimonials and external verification remain missing | PARTIAL |
| Conversion SEO | Priority #1 and mostly absent | Carrier/customer intake, role router, final CTA and production delivery are now implemented | COMPLETE / measure |
| Reputation SEO | Missing | Still missing a real review acquisition and response process in operation | ACTIVE COMPLEX |
| Competitor SERP intelligence | Missing | Still required before a new large semantic expansion | ACTIVE COMPLEX |
| Entity SEO | Missing | Registry and safe sameAs governance exist; legal/NAP/brand relationship verification is still unresolved | PARTIAL / OWNER GATE |
| Content distribution | Missing | Reusable pipeline exists, but only two Instagram sources are registered and both remain on hold | FOUNDATION ONLY |
| Mass state/city/equipment pages | Proposed as growth lever | Do not mass-publish. Build only 15–25 strong clusters and no more than two evidence-backed geo pilots at a time | DEFER / EVIDENCE GATE |

## Light tasks — low-risk and mostly repository/documentation work

These tasks can be completed without inventing business evidence or changing external accounts.

### L1. Repair stale project-state documentation

Update:

- `docs/ai-project-state.json`;
- `README.md`;
- `docs/AI_START_HERE.md`;
- Issue #176 checklist/status.

Required corrections:

- production contact delivery is live and verified;
- Issue #167 is completed;
- route count is 107 generated / 96 indexable;
- PR #83 was replaced by merged current-main route-estimate foundation #164 and remains default-off only at the external activation layer;
- old PR #85 status must be reconciled against its current actual state rather than copied from the August 2 snapshot;
- general contact is not universally preview-only on the production host.

### L2. Publish a current SEO-4 scorecard

Create one durable table for the 20 personas with:

- landing owner;
- correct CTA;
- click depth;
- required fields;
- current proof gap;
- abandonment risk;
- severity;
- next action.

The record can initially use repository/browser evidence, but must be clearly marked heuristic until real analytics and user testing are available.

### L3. Consolidate production KPI names

Document one canonical funnel vocabulary:

- landing view;
- commercial CTA;
- intake start;
- validation complete;
- preview ready;
- delivery attempted;
- delivery confirmed;
- fallback opened;
- human-qualified lead;
- proposal;
- contract;
- revenue.

Remove or alias obsolete event names rather than creating parallel definitions.

### L4. Reduce stale or contradictory operational copy

Audit visible copy for statements such as:

- `Preview`;
- `submission pending connection`;
- `not sent or stored`;
- delivery or feature blockers that are already resolved.

The repository production-host logic is current, but documentation and cached/public copy should be checked systematically after every deployment.

### L5. Create evidence intake templates

Prepare private, non-public templates for:

- carrier case evidence;
- dealer/shipper case evidence;
- testimonial permission;
- team profile approval;
- sanitized workflow screenshot approval;
- publication date/source/reviewer evidence.

No public claim is added until the corresponding evidence record is approved.

### L6. Process the two supplied Instagram sources only after transcript evidence

The two URLs are already registered. They remain held because a URL alone does not establish:

- transcript;
- original publication date;
- factual claims;
- stable media/thumbnail rights;
- canonical topic owner;
- publication permission for a website article or VideoObject.

Do not scrape or invent the missing content. Accept an owner-supplied transcript or source file, then score it through the existing publication gate.

### L7. Add an explicit monthly release/measurement checklist

The checklist should require:

- deployed commit and immutable deployment;
- current-domain smoke;
- sitemap and canonical checks;
- delivery and duplicate test;
- GSC/Bing coverage review when connected;
- GA4 funnel counts;
- 404/5xx/JS/error review;
- mobile CTA and completion review;
- qualified-lead reconciliation.

## Complex tasks — require real data, external accounts, evidence or sustained execution

### C1. Google Search Console and Bing Webmaster Tools operating loop

Required:

- verify ownership;
- submit and confirm all current sitemaps;
- export page/query/index coverage baselines;
- separate branded and non-branded demand;
- monitor selected canonical, crawled-not-indexed, discovered-not-indexed, soft 404, 5xx and sitemap drift;
- record Day 0, 7, 28 and 90 evidence.

Repository tests cannot replace this work.

### C2. GA4 to qualified-lead and revenue reconciliation

Required:

- prove production events are received;
- verify event parameters contain no PII;
- connect landing owner to confirmed delivery;
- reconcile delivered inquiries with a manual or approved CRM qualification register;
- track proposal, contract and revenue manually or through a separately approved adapter;
- create a weekly `organic page → CTA → intake → delivery → qualified lead` report.

Do not send names, emails, phones, MC/USDOT, routes, customer URLs, budgets or messages to GA4.

### C3. Real trust and proof layer

Required owner evidence:

- exact legal/public business name and relationship between Hermes, Hermes Logistics, ProgressoPro, Academy and IT Development;
- leadership names, roles, experience and publication permission;
- authorized photographs;
- correct FMCSA/operating relationship language;
- one approved carrier/owner-operator case;
- one approved dealer/shipper/vehicle-movement case;
- one approved digital-service client case;
- verified testimonials with source, date and permission;
- sanitized process screenshots.

This is the highest-conviction gap on money pages.

### C4. Entity and public-profile cleanup

Current public search results are mixed with unrelated Hermes companies and third-party employment/resume pages. Required:

- approve canonical legal/public NAP;
- determine which profiles represent the root Hermes entity versus a direction/brand;
- verify and correct controlled profiles;
- create only eligible Bing Places, Apple Business Connect, Yelp, LinkedIn, Clutch, GitHub and logistics-directory profiles;
- add `sameAs` only after ownership and same-entity verification;
- correct conflicting phone, company-size, service and location descriptions where control is available.

Do not use virtual offices or create a Google Business Profile before eligibility is confirmed.

### C5. Reputation and review operations

Required:

- define the moment a real customer/carrier may be asked for a review;
- use approved email/message templates;
- request reviews without incentive, exchange or pressure;
- monitor and answer real reviews;
- convert only permissioned evidence into case studies;
- track review source, date, service direction and response status;
- monitor brand, domain, phone and leadership mentions.

### C6. Backlink and authority execution

The CRM and playbook foundation exists; the operating work remains:

- analyze 10–20 relevant competitors by commercial cluster;
- build a qualified target list;
- execute personalized outreach;
- reclaim unlinked mentions;
- pursue expert comments, interviews, podcasts and partner resources;
- publish linkable assets with real utility;
- track acquired/lost domains, referral inquiries and anchor distribution.

Do not buy bulk guest posts, use PBNs or submit to low-quality mass directories.

### C7. Production field performance and error monitoring

Required:

- PageSpeed/Lighthouse baseline for homepage and priority money pages;
- real LCP, INP and CLS when field data exists;
- mobile 375 px and constrained-network task tests;
- TTFB from relevant U.S. regions;
- uptime and 5xx monitoring;
- JavaScript error monitoring;
- image, font, cache, third-party script and waterfall review;
- monthly history rather than one screenshot.

### C8. Selective semantic expansion

Do not increase the semantic core by producing dozens of near-duplicate pages.

First research and prioritize approximately 15–25 strong clusters, including:

- car hauling loads;
- car hauler dispatch service;
- owner-operator car hauling;
- new-authority car hauler;
- hotshot and multi-car dispatch;
- enclosed transport/dispatch context;
- return-load and deadhead problems;
- dispatch pricing and process;
- Central Dispatch workflow/alternatives only within trademark and evidence boundaries;
- dispatcher comparison and qualification;
- supporting educational guides that naturally lead to the canonical commercial owner.

A new page requires distinct intent, evidence, conversion path, low cannibalization risk and an approved canonical owner.

### C9. Competitor SERP intelligence

For each money direction, review at least 20 priority queries and record:

- top result type;
- search intent;
- page structure;
- offer and CTA;
- proof and trust elements;
- pricing/scope visibility;
- backlink and citation pattern;
- weak results Hermes can realistically beat;
- directory, Reddit, YouTube, map and AI-answer presence.

This research must precede large page expansion.

### C10. Content pipeline activation

The technical pipeline exists, but the source library is not ready.

Required:

- collect 30 owner-approved assets with transcript/date/rights;
- deduplicate and cluster them;
- select 3–5 strong website-owned canonical assets;
- publish only after evidence, privacy, claim, entity and cannibalization review;
- distribute derivatives back to social channels;
- measure referral sessions, search impressions, CTA and qualified inquiries.

## Deferred or not recommended now

- mass publication for every state, city, route, equipment or language;
- A/B testing before stable traffic and conversion volume;
- AMP;
- monthly Disavow uploads without manual action or proven artificial-link history;
- virtual-office profiles;
- fake, exchanged or incentivized reviews;
- mass guest-post purchases, PBNs or automated directory submission;
- automatic publication from Shipment History, Load Board observations or social feeds;
- live Google route estimates until cost, billing, quota, provider and product value are approved;
- public Hermes Connect booking/payment/account claims before an actual connected release.

## Priority order

### P0 — measure and protect the revenue path

1. repair stale project-state documentation;
2. confirm GSC and Bing ownership/sitemaps;
3. verify production GA4 funnel events;
4. operate a qualified-lead register;
5. publish the 20-persona current-state scorecard;
6. monitor delivery failures, 404/5xx and mobile completion.

### P1 — create commercial conviction

1. approve legal/entity/NAP facts;
2. publish verified leadership/expert profiles;
3. publish one carrier case and one customer/dealer case;
4. launch legitimate review operations;
5. verify controlled profiles and correct conflicts;
6. execute the first authority/outreach sprint.

### P2 — expand demand coverage selectively

1. complete competitor SERP intelligence;
2. choose 15–25 strongest semantic clusters;
3. build only the first evidence-backed pages/resources;
4. evaluate no more than two geo pilots at a time;
5. process the first 3–5 approved social-source assets;
6. expand languages only after the English owners and measurement loop are stable.

## Updated scorecard

| Area | Current estimate | Reason |
| --- | ---: | --- |
| Technical SEO foundation | 90–94 / 100 | mature automated architecture; field monitoring remains |
| Conversion infrastructure | 85–90 / 100 | direct intakes and production delivery now work; real completion/qualification rates are unknown |
| Semantic coverage for U.S. carrier discovery | 40–50 / 100 | strong owners, but many high-value intent clusters remain uncovered or unproven |
| Trust and evidence | 40–50 / 100 | trust pages exist; real people, cases, reviews and third-party proof remain thin |
| External authority / reputation | 20–30 / 100 | process foundations exist; placements, profiles and reviews are not yet operating at scale |
| Measurement maturity | 35–45 / 100 | event contracts and smoke tests exist; GSC/Bing/GA4-to-qualified-lead evidence is incomplete |
| Overall readiness to acquire qualified organic inquiries | 55–65 / 100 | technical and conversion engine is strong, but demand coverage, proof, authority and measurement remain the limiting factors |

## Completion definition for SEO-4

SEO-4 is complete only when:

- all 20 persona records are current;
- production delivery and failure handling remain verified;
- GSC, Bing and GA4 baselines exist;
- landing-to-qualified-lead reporting operates;
- priority pages have field performance evidence;
- one carrier and one dealer/shipper case are approved and published;
- leadership/entity/NAP facts are approved;
- review and authority operations are active;
- the first selective semantic expansion is based on evidence rather than page-count targets.
