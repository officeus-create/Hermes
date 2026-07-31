# Hermes Cross-AI Recommendation Register

Purpose: prevent duplicated, obsolete, unsafe, or invented AI recommendations from returning to the codebase. Every recommendation is classified before implementation.

Statuses:

- `SAFE_TO_IMPLEMENT`: low-risk and consistent with verified architecture/business boundaries.
- `NEEDS_EVIDENCE`: potentially useful, but requires source data, owner-approved facts, or current research.
- `DUPLICATE_OR_IN_PROGRESS`: already addressed by another PR or sprint.
- `OBSOLETE`: superseded by current APIs, architecture, or code.
- `REJECTED`: unsafe, misleading, privacy-invasive, technically incorrect, or likely to create false claims.

## 1. Logistics and SEO recommendations

| Recommendation | Status | Decision |
|---|---|---|
| Two-department carrier positioning: dispatch today plus separate direct-freight development | NEEDS_EVIDENCE | Useful positioning. Public timeline and included work must match the signed service scope. No response/load guarantee. |
| Build pages around verified equipment, service area, routes, auctions, ports, dealers, and specialized vehicle transport | SAFE_TO_IMPLEMENT | Use only with route/demand evidence, unique content, privacy review, and 7/10 publication score. |
| Create one page for every carrier or every city automatically | REJECTED | High doorway/thin-content risk; exposes operational/private data and creates cannibalization. |
| Use historical origin-to-destination records to find weak-competition lane opportunities | SAFE_TO_IMPLEMENT | Import only after locating the actual dataset; preserve provenance and remove PII. |
| Treat 13 remembered locations as automatically verified route pages | REJECTED | A list or memory is not sufficient evidence. Route direction, source row, equipment, date, and review state are required. |
| Spanish, Russian, and Ukrainian logistics content | NEEDS_EVIDENCE | Priority research languages. Publish after demand, service-language capacity, localization, and hreflang review. |
| Romanian/Moldovan, Lithuanian, Hindi, Punjabi, and Gujarati content | NEEDS_EVIDENCE | Research only until minimum query/service threshold is met. Do not use one generic “Indian language” page. |
| Claim guaranteed weekly gross, direct customers, or rankings | REJECTED | Unsupported result guarantees. |
| Research or introduce insurance agents, trucks, and trailers | SAFE_TO_IMPLEMENT | Describe as third-party research/introduction only; provider controls approval, price, terms, financing, inventory, and service. |

## 2. Google Maps and route-calculation recommendations

| Recommendation | Status | Decision |
|---|---|---|
| Places Autocomplete for address/city input | NEEDS_EVIDENCE | Good future feature after Google project, billing, restricted browser key, privacy, UX, and cost review. |
| Routes API for preliminary distance/duration | NEEDS_EVIDENCE | Use a server-side key and label results as estimates. Not truck-routing or a final quote. |
| Legacy Distance Matrix endpoint for new implementation | OBSOLETE | Prefer current Routes API for new work. |
| Hardcoded public price formula `$150 + miles × 1.85 + minutes × 0.25` | REJECTED | Not an approved car-hauling quote model and omits critical commercial/equipment factors. |
| Parse distance from localized display text | REJECTED | Use numeric API fields such as distance meters/seconds. |
| Put a private Maps key in browser code | REJECTED | Browser key must be restricted; server key must remain server-only. |
| Replace the existing secure `logistics-lead` function with a simplified AI-generated handler | REJECTED | Existing validation, CORS, idempotency, delivery, and rate-limit protections must not be removed. |
| In-memory `Map` as reliable Cloudflare rate limiting | REJECTED | Isolate-level memory is not a durable distributed limit. Use reviewed Cloudflare/KV/Durable/Rate Limiting architecture. |
| Set `hasConsent: true` automatically | REJECTED | Consent must come from a real user action and applicable disclosure. |
| Submit a fake placeholder customer email | REJECTED | Pollutes CRM/analytics and creates false records. |
| `console.log` as email/CRM delivery | REJECTED | Logging is not delivery. Use an approved binding/endpoint. |

## 3. Website, SEO, and marketing recommendations

| Recommendation | Status | Decision |
|---|---|---|
| U.S. website-development and SEO/Local SEO service clusters | SAFE_TO_IMPLEMENT | Implement from approved scope, proof labels, no ranking guarantees, and niche-first research. |
| Mass `service × city` pages because keyword difficulty is low | REJECTED | Requires real business density, demand, unique local value, internal links, and evidence. |
| Russian/Ukrainian coordination for businesses in international markets | SAFE_TO_IMPLEMENT | Target by language and business need, not ethnicity or assumed wealth. Deliver customer-facing work in the actual market language. |
| Target “oligarch neighborhoods” or imply residents are wealthy | REJECTED | Use neutral premium/international business-market research and real business needs. |
| Publish client results without source dates, baselines, or permission | REJECTED | Use Live Product / Working Prototype / Build-Ready / Verified Case Study labels. |
| Add GA4 CTA events without PII | SAFE_TO_IMPLEMENT | Use service/action/page/language keys only. |
| Send form values, email, phone, company, route, or resume data to analytics | REJECTED | Prohibited. |

## 4. Academy recommendations

| Recommendation | Status | Decision |
|---|---|---|
| Limit Academy to U.S. logistics and marketing | SAFE_TO_IMPLEMENT | Prevents topic dilution and keeps program facts reviewable. |
| Public prices `$999`, `$400/month`, `$600/month corporate` | NEEDS_EVIDENCE | Publish only after syllabus, terms, dates, refund, entity, payment, eligibility, and package scope are approved. |
| Target countries only because average salary is very low | REJECTED | Research must include English readiness, internet, payment/compliance, demand, schedule fit, and learner protection. |
| Free practical track separate from paid enrollment | SAFE_TO_IMPLEMENT | Publish expectations, duration, access/data boundaries, inactivity rules, and no-employment guarantee. |
| Promise employment or income after training | REJECTED | Training does not guarantee employment, clients, loads, rankings, or income. |

## 5. Careers recommendations

| Recommendation | Status | Decision |
|---|---|---|
| Central Careers page | SAFE_TO_IMPLEMENT | Implemented in draft PR #19. |
| International Sales Manager — Websites & SEO for the U.S. market | SAFE_TO_IMPLEMENT | Implemented with honest scope and no-guarantee language. |
| JobPosting schema without approved compensation, dates, status, and application facts | REJECTED | Use only for a real current opening whose visible page contains required facts. |
| Publish salary/earnings promises from informal discussions | REJECTED | Compensation must be approved in writing and accurately represented. |

## 6. Technical SEO recommendations and overlap control

| Recommendation | Status | Decision |
|---|---|---|
| Localized hero alt text | DUPLICATE_OR_IN_PROGRESS | Claude PR #15. Do not duplicate. |
| `preconnect` and alternate OG locales | DUPLICATE_OR_IN_PROGRESS | Claude PR #16 and existing SEO work. Do not duplicate without conflict review. |
| Breadcrumb schema and `noopener` hardening | DUPLICATE_OR_IN_PROGRESS | Claude PR #17. Do not edit overlapping files. |
| Site-wide technical SEO, hreflang, entities, internal links, performance budgets | DUPLICATE_OR_IN_PROGRESS | Existing draft PR #13 owns the large technical SEO sprint. New work should extend only after merge/conflict review. |

## 7. Safe low-risk recommendations already implemented in this sprint

- 100-task evidence-driven growth tracker;
- central Careers page and website/SEO sales vacancy;
- carrier value/claim/route/language growth system;
- dealer/shipper/broker/customer demand system;
- U.S. website and SEO growth system;
- Russian/Ukrainian international marketing growth system;
- Academy program/pricing/eligibility gates;
- careers recruitment and privacy-safe measurement governance;
- data, Search Console, GA4, image, performance, and release requirements.

## 8. Reintroduction rule

A rejected or obsolete recommendation may return only when:

1. new evidence or architecture materially changes the decision;
2. the new source is attached and dated;
3. privacy/security/business-claim review is repeated;
4. the register is updated before code or public copy changes.

## 9. Continuous execution cycle

For every next task:

1. check Claude/other open PR overlap;
2. retrieve the actual source data when the task depends on prior files;
3. classify evidence and risk;
4. implement the smallest safe batch;
5. run available build/test/CI checks;
6. document claims, sources, and blockers;
7. update the issue and draft PR;
8. continue to the next unblocked task;
9. never merge or release production without separate owner approval.
