# Hermes Commercial Website Rebuild — Evidence-Gated Case Draft

Status: `PUBLICATION_DRAFT — MEASUREMENT_PENDING`  
Evidence review date: 2026-08-04  
Case type: first-party Hermes implementation record, not an external client case.

## Publication boundary

This draft may describe verified public architecture, workflow changes, production delivery controls, and regression evidence.

It must not claim:

- increased rankings, traffic, leads, revenue, close rate, carrier volume, dealer volume, or customer acquisition;
- causal business impact from a repository change;
- real-user Core Web Vitals from a Lighthouse lab run;
- customer satisfaction, market superiority, or repeatable client outcomes;
- live route estimates, autonomous AI dispatch, guaranteed capacity, guaranteed response time, or guaranteed commercial results.

Search Console, GA4, qualified-inquiry, CrUX, and revenue evidence remain gated by Issue #206.

---

# 1. Case summary

Hermes rebuilt its website from a broad multi-direction corporate experience into a controlled commercial system with clearer role routing, direct carrier and customer intake paths, protected inquiry delivery, evidence boundaries, and automated regression checks.

The work focused on one practical question:

> Can a carrier, dealer, shipper, marketing buyer, website/automation buyer, or Academy candidate reach the correct next step without entering a misleading demo, receiving an unsupported promise, or losing the request between the browser and the responsible team?

The verified answer is architectural and operational, not yet commercial:

- relevant visitor groups have direct paths;
- carrier and customer transport requests no longer depend on the fictional Load Board demonstration;
- production inquiry delivery is confirmed through a protected same-origin workflow;
- duplicate requests and foreign-origin requests are controlled;
- direct phone and email fallbacks remain visible;
- unsupported proof, pricing, result, office, fleet, authority, and product claims are gated;
- static, privacy, integration, and desktop/mobile workflow contracts protect the released behavior.

The effect on organic search demand, qualified inquiries, and revenue is not yet established.

---

# 2. Starting problem

The site already had a mature technical SEO foundation, but the conversion audit identified several buyer-level risks:

1. A carrier ready to request dispatch could be routed into a fictional/dry-run Load Board experience.
2. Dealer, auction, shipper, broker, and customer transport visitors lacked one direct qualified intake path.
3. The homepage required visitors to understand the full Hermes ecosystem before reaching a role-specific action.
4. Logistics commercial pages needed a strong final contextual CTA and fallback contact path.
5. Production inquiry delivery had to be proven independently before the site could show a success state.
6. Public proof and named expertise were weaker than the technical implementation.
7. Repository tests could not substitute for production search, analytics, real-user performance, or qualified-lead evidence.

The solution therefore had to improve conversion architecture without manufacturing testimonials, commercial outcomes, live product capability, response times, rates, capacity, locations, authorities, or rankings.

---

# 3. What was changed

## 3.1 Direct carrier commercial intake

Release reference: PR #177.

The primary Car Hauling Dispatch action was separated from the synthetic Load Board demonstration.

Implemented behavior:

- dedicated direct carrier dispatch-review workspace;
- authority, insurance, equipment, capacity, geography, availability, fleet, current dispatch, contact, consent, and safety qualification;
- `noindex,follow` workspace so the canonical commercial page remains the search owner;
- explicit carrier approval and no-automatic-booking boundaries;
- privacy-safe intake and delivery events without submitted values;
- direct email and phone fallback;
- Load Board preserved only as a clearly labeled demo/product preview.

## 3.2 Final Logistics conversion modules

Release reference: PR #177.

Shared Logistics commercial pages received a contextual final CTA after the main explanatory content, plus direct email and phone fallbacks.

This reduced dependence on a hero-only action and preserved a usable contact route when secure delivery is unavailable.

## 3.3 Evergreen Load Board demonstration

Release reference: PR #177.

Hard-coded stale dates and recent-posting language were replaced by evergreen demo labels.

The Load Board remains synthetic and must not imply live load freshness, real capacity, booking, or provider connectivity.

## 3.4 Homepage role routing

Release reference: PR #178.

A role-first router was placed after the homepage hero and before the four ecosystem pillars.

It provides direct destinations for:

- carrier / owner-operator;
- dealer / auction buyer;
- shipper / logistics manager;
- logistics SEO / marketing buyer;
- website / automation buyer;
- Academy candidate.

The original four-direction ecosystem remains available below the faster decision path.

## 3.5 Direct dealer, shipper, broker, and customer transport intake

Release reference: PR #179.

A dedicated `noindex,follow` customer-side workspace was introduced for:

- dealer inventory;
- auction pickup;
- dealer transfer;
- customer delivery;
- repeat transport;
- other vehicle-movement contexts.

The intake can qualify route, timing, quantity, operability, open/enclosed/multi-car preference, facility context, release status, storage deadline, repeat need, target-price context, and business contact information.

Copart, IAA, and Manheim appear only as non-affiliated facility context. VINs, gate-pass credentials, payment data, identity documents, private contracts, passwords, and release files are excluded from public URLs and repository evidence.

## 3.6 Production inquiry delivery for all website directions

Release references: Issue #167 and PRs #180–#183.

Verified production path:

`browser → same-origin Pages Function → Service Binding → private Email Worker → approved destination`

Verified controls:

- same-origin enforcement;
- server-controlled categories and subjects;
- request-size limits;
- KV-backed rate limiting and idempotency;
- encrypted shared-token boundary;
- private Worker with no public route;
- fixed sender/destination boundary;
- provider-error normalization;
- browser-safe errors and logs;
- default-off delivery gate;
- direct phone/email fallback;
- immediate rollback with `LEAD_DELIVERY_MODE=off`.

Verified activation evidence on 2026-08-04:

- separate preview and production KV namespaces;
- approved fixed destination;
- synthetic preview delivery;
- foreign-origin rejection;
- duplicate suppression without a second message;
- synthetic production delivery;
- custom-domain production HTML and inquiry smoke verification;
- no Google Workspace MX/DNS change;
- no paid Cloudflare plan required for the approved verified-destination operating mode.

This proves the controlled technical delivery workflow. It does not prove customer demand, response quality, conversion, or revenue.

## 3.7 Verified advantages and objection coverage

Release references: PRs #190–#198 and #201.

Completed work includes:

- competitor and audience meaning matrices;
- verified advantage sections on the homepage and direction pages;
- restrained visual emphasis with reduced-motion support;
- objection coverage and buyer-progress maps for current money pages;
- carrier post-submit explanation;
- dealer delay, vehicle-condition, documentation, carrier/insurer, and responsibility boundaries;
- proof/evidence publication register;
- regression assertions that protect the approved carrier and dealer guidance.

Named expert, instructor, testimonial, carrier case, dealer/customer case, and quantitative performance claims remain evidence-gated.

---

# 4. What was deliberately not built or claimed

The rebuild intentionally did not:

- turn the Load Board demo into a live booking system;
- activate Google route estimates;
- claim Hermes Connect is a live customer account, calendar, payment, booking, or autonomous AI platform;
- add bulk city/state landing pages without measurement evidence;
- publish unverified universal pricing;
- invent response-time, load, rate, mileage, capacity, pickup, delivery, claim, ranking, traffic, lead, or revenue guarantees;
- publish private carrier/customer details, routes, rates, VINs, contracts, messages, credentials, or provider diagnostics;
- treat historical proposals, resumes, social posts, or internal product specifications as current public proof;
- manufacture team identities, testimonials, reviews, offices, authorities, fleet ownership, customers, or results.

---

# 5. Evidence currently available

## Repository and release evidence

Available:

- pull-request and commit history;
- build/static/privacy/integration regression results;
- desktop/mobile Playwright workflows;
- canonical and sitemap ownership checks;
- production inquiry smoke evidence;
- current public pages and noindex workspaces;
- documented rollback and safety boundaries.

## First-party process evidence

Available:

- visible homepage role routing;
- visible direct carrier and vehicle-transport intake paths;
- visible final CTA and fallback contacts;
- visible Load Board demo labeling;
- documented production delivery architecture;
- sanitized synthetic production verification.

## Evidence not yet available for publication

Still required:

- Search Console page/query/index baseline;
- Bing Webmaster baseline;
- GA4 funnel verification and privacy audit;
- receiver-to-human-review-to-qualified-inquiry reconciliation;
- 7-day and 28-day aggregate qualified-inquiry scorecards;
- CrUX or Search Console real-user Core Web Vitals where available;
- one permissioned carrier proof asset;
- one permissioned dealer/customer transport proof asset;
- named Logistics SEO reviewer;
- named Academy instructor/mentor;
- external client case with source exports and publication permission.

---

# 6. Measurement plan

Tracking issue: #206.

The evidence stack must remain separated:

| Evidence class | What it can establish | What it cannot establish alone |
| --- | --- | --- |
| Repository CI | Released code and regression contracts pass | Production demand, rankings, leads, revenue |
| Production smoke | Protected receiver accepted an approved synthetic request | Real lead quality, team follow-up, sales outcome |
| Lighthouse lab | Controlled synthetic page-performance snapshot | Real-user Core Web Vitals or conversion |
| Search Console/Bing | Search visibility, queries, clicks, index status | Lead quality or revenue causation |
| GA4 | Privacy-safe behavior and funnel events | Delivered request or qualified lead without reconciliation |
| Receiver/CRM operations | Delivered, reviewed, qualified, contacted, opportunity stages | Organic attribution without approved source mapping |
| Finance/contract records | Won business and value | Causal SEO effect without a defined attribution method |

Initial KPI hierarchy:

1. confirmed delivered inquiries;
2. human-reviewed and qualified inquiries;
3. landing-page CTA rate;
4. intake start-to-completion rate;
5. fallback usage and delivery failures;
6. non-branded search impressions and clicks;
7. indexed canonical money pages;
8. mobile field LCP, INP, and CLS;
9. verified proof/case coverage;
10. correct external entity and AI-reference coverage.

---

# 7. Candidate public narrative

The following narrative is suitable only after final editorial review:

> Hermes rebuilt its own website around role-specific commercial paths rather than a generic corporate brochure. Carriers received a direct dispatch-review intake separated from the fictional Load Board demo. Dealers, auction buyers, shippers, brokers, and customers received a qualified vehicle-transport request path. The homepage gained faster role routing, Logistics pages gained final contextual actions and fallback contacts, and website inquiries were connected to a protected same-origin production delivery workflow with duplicate suppression, origin controls, private service boundaries, and rollback. The implementation is verified as a technical and process release. Search visibility, qualified-inquiry, and business results remain under measurement and are not claimed in this case.

---

# 8. Assets required before public-page release

- [ ] Dated before/after homepage screenshots with no private data.
- [ ] Dated carrier commercial-page and direct-intake screenshots.
- [ ] Dated dealer transport and direct-intake screenshots.
- [ ] Dated Load Board demo-label screenshot.
- [ ] Sanitized production smoke summary.
- [ ] Architecture diagram with no secret/account/resource identifiers.
- [ ] Current route/canonical/sitemap evidence from the release manifest.
- [ ] First Lighthouse lab baseline from PR #202.
- [ ] Search Console and GA4 evidence only after #206 privacy and property review.
- [ ] Final owner-approved title, author/reviewer, publication date, and correction contact.

# 9. Release decision

Current decision: **keep as internal publication draft**.

A public first-party case may be released when:

- technical statements are reconciled against current production;
- screenshots and public routes are dated;
- the named reviewer is approved;
- the case clearly says first-party/internal implementation;
- measurement sections identify source, period, metric, and limitation;
- no customer outcome is implied;
- no private or infrastructure-sensitive evidence appears;
- correction and review ownership are assigned.
