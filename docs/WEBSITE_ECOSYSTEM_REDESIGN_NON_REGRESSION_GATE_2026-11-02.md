# Hermes Website Ecosystem — redesign non-regression release gate

Date: 2026-11-02
Status: source-only implementation in PR / production and full browser audit NOT verified.
Owner: Hermes Website QA / HAE via the existing Command Center execution and evidence system.
Related: `docs/DESIGN_INTEGRATION_CONTRACT.md`, `docs/design/HERMES_BRAND_MIGRATION_AUDIT.md`, #2251, #2252, #2253, #2036, #2106.

## Why the carrier agreement disappeared from the visible customer journey

Website checks were already present but they did not prove that the whole carrier journey was visible to every entrypoint. The current frozen design contract enumerates only seven original routes. The screenshot inventory covered carrier entry and onboarding but omitted the offer, terms and PDF viewer. Visual-evidence workflow path filters did not trigger for several carrier and Load Board page edits. A screenshot being captured does not imply a PDF download, a valid signature, email receipt, paid-access grant or production Cloudflare route works.

## 1. Inventory by business outcome — not by page count

A release owner should retain a canonical *journey registry* for every public-facing or owner workflow:

| Journey | Entrance / source | Critical handoff | Proof needed |
| --- | --- | --- | --- |
| Carrier dispatch acquisition | `/carrier/`, `/sign/` | 6%, 8%, custom -> onboarding | choices, exact terms, correct preserved CTA |
| Carrier contract | `/logistics/carrier-offer/`, `/logistics/carrier-agreement/`, `/contracts/carrier-agreement-v3/` | PDF -> signed Appendix A -> email ledger | version/SHA, executed state, distinct carrier/Hermes receipts, error recovery |
| Carrier Load Board access | `/load-board/`, `/services/hermes-connect/load-board/access/` | free lead -> vetting -> granted workspace | public != entitlement; verified company, contract, assigned dispatcher and source rights |
| Customer vehicle transport | `/logistics/request-vehicle-transport/` | intake -> sales/operations receipt | validation, consent, dedupe, no bogus confirmed booking |
| Marketing / IT leads | public marketing and service pages | business lead form -> designated receiver | live-vs-preview truth, consent, no lost lead |
| Hermes Connect | public product -> auth -> company workspace | owner/member role -> scoped action | 401/403, revoked access and tenant isolation |
| Academy | public program -> eligibility -> assessment/review | content and locale continuity | no broken enrollment/paid claims or inaccessible UI |
| Catalog / dealers | `/businesses/`, dealer/shipper branches | real profile / authorized transport intent | canonical profile and publication rights |
| Command Center / HAE | public showcase -> private owner | work item -> routed agent -> durable D1 receipt | public-data firewall, no fake status or role elevation |
| Search / analytics | indexable URL -> canonical / sitemap / hreflang | crawl and consent policy | no SEO owners dropped, no PII telemetry |

## 2. Protection layers for every redesign

1. **Source-level route and business invariant guard (implemented in this PR).** `scripts/ecosystem-business-journey-preservation.test.mjs` validates 13 protected source files / handoffs and 17 mandatory screenshot routes. It fails if a required function or visible customer path is removed; does NOT prove it works in runtime.
2. **Responsive visual evidence (extended in this PR).** `scripts/route-screenshot-contract.mjs` includes carrier offer, agreement, PDF viewer, Load Board account access and transport intake at 1440/1024/768/430/390 widths. `hermes-connect-visual-evidence.yml` triggers on the corresponding page changes. A QA owner must inspect artifacts; the current screenshot capture is not pixel baseline comparison.
3. **Real browser journeys (already partly existing, incomplete).** Preserve Playwright flows for selection -> preview -> field validation -> submission/error/success, keyboard, mobile, reduced-motion and real PDF button behavior. Add stable baseline screenshots only after visual approval. Do not mass-update snapshots to make a failed check pass.
4. **Server / legal / access negative tests.** Contract execution must validate the precise signed document hash, 14-day trial vs ongoing fee, no auto continuation and carrier/Hermes delivery receipts. Free Load Board inquiry is NOT paid authorization; exercise multi-tenant RBAC and expired/revoked states. Refer to #2252 and #2036; do not invent a second authorizer or CRM.
5. **Search and data invariants.** Verify redirects, no lost canonical URLs, robots/noindex, hreflang, schema, sitemaps, valid headers, consent, and analytics duplicate prevention through existing tests and Search error matrix.
6. **Deployment verification.** After protected merge, confirm the deployed exact SHA, Cloudflare Pages Functions route ownership, no Error 1102/5xx on important URLs, direct URL loads (not merely homepage), PDF content-type/hash, and safe synthetic receipt/delivery probes.
7. **Observability and rollback.** Map each failing gate to an existing Hermes WORK_ID/HAE receipt, source version, owner, priority and corrective PR. Preserve the previous deployment and stop rollout on P0; do not mark DONE from green source-only checks.

## Current bounded release state

- Existing PR #2251 repairs 6%/8%/Custom visibility and static Pages routing; do not replace its writer or assume merged/live.
- Existing PR #2253 repairs free Load Board inquiry -> optional agreement handoff; do not equate free registration with paid service or a new load-board role.
- Issue #2252 owns owner-approved 14-day trial master, Appendix A fees, legal version, signing mode and delivery.
- This QA PR changes no business form/API, no legal PDF, no production permission and sends no emails. It adds prevention coverage only.

## Non-negotiable DONE evidence

`SOURCE + BUILD / STATIC + EXACT-HEAD CI + SCREENSHOTS + BROWSER POSITIVE AND NEGATIVE + INDEPENDENT REVIEW + PROTECTED MERGE + DEPLOYED EXACT SHA + PRODUCTION FLOW RECEIPTS`.

Explicitly report **UNKNOWN** for any stage not observed. `13 source checks green` != `13 production journeys verified`.

## Immediate follow-on lanes

- P0: finish #2251, #2253 after green exact-head tests and review, then reverify all changed links from live US browser.
- P0: finish #2252 and negative signing / delivery tests, with approved carrier-specific fees and version hash.
- P0: freeze a wider canonical route list from the current build (dynamic & static), compare it to navigation + historical route owners and flag deleted journeys/redirects.
- P1: implement approved visual pixel diff baselines for *states* (empty, pending, denied, error, success) as well as routes, and production smoke on every deploy.
- P1: expand the owner QA matrix to Academy, Catalog, Repair Shops, HR/Recruiting, Social, Marketing, Technology, private Command Center, API auth and localization. Use independent QA with least privilege; do not screenshot real customer PII.
