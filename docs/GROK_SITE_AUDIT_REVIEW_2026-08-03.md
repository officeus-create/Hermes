# Grok Site Audit Review — 2026-08-03

## Purpose

Review the external Grok report titled **Current Site Analysis vs July 18 Report**, preserve the useful findings, correct unsupported or stale conclusions, and convert only real gaps into controlled Hermes work.

The Grok report is useful as a directional external review. It is not accepted as a source of truth without repository, production, permission, and measurement checks.

## Current verified baseline

- Current build inventory: **104 HTML routes**.
- Current indexable inventory: **95 URLs**.
- Sitemap ownership: **7 sitemap files**, with exactly one sitemap owner for every indexable route.
- Production snapshot: all **95 current-main indexable routes** were present in the reviewed production snapshot.
- Public languages: **English, Spanish, French, Ukrainian, Italian, and Russian**.
- Local sitemap inventory: **16 local-cluster URLs** at the Phase 1 snapshot.
- Public case routes currently include the case hub, the IT-development website case, and the Appleton vehicle-transport SEO case.
- The general contact workflow remains preview-first in production.
- A protected same-origin Logistics lead receiver already exists in the repository; production activation still requires approved Cloudflare Email Sending, sender verification, KV, bindings, environment configuration, and a real delivery test.
- Hermes Connect is a product-discovery/prototype direction. No account, booking, calendar, payment, or AI action is represented as live.

## Findings accepted

### 1. The website made a real product-level jump

Accepted. The site is no longer only a small brochure. It now contains role-based Logistics paths, structured resources, product previews, multilingual routes, controlled data boundaries, and a deeper technology portfolio.

### 2. Conversion is now constrained more by live delivery than by missing page volume

Accepted with correction. The key gap is not “forms do not exist.” The forms, qualification logic, preview states, safe payloads, and one Logistics receiver already exist. The next conversion step is controlled production activation and measurement of the approved contact routes.

### 3. More evidence-backed case studies would improve trust

Accepted as P1, but only with owner permission, source dates, evidence, correction contact, and no invented metrics. Existing case routes mean this is an evidence-expansion task, not a missing-template task.

### 4. Hermes Connect may become a valuable product pilot

Accepted as a separate P1 product-discovery lane. It is not a website P0 and must not jump directly from concept UI to public booking. A pilot requires a selected vertical, user roles, scheduling source of truth, consent, account model, privacy, support owner, payment decision, rollback, and success criteria.

## Findings corrected

### Languages

The report says EN + UA + RU + IT. The current public language set also includes Spanish and French. Polish and German should not be added only because they were suggested in a prior market analysis; they require query, audience, conversion, translation-quality, and maintenance evidence.

### Real forms

The statement “everything is still mailto / preview” is incomplete. Production remains preview-first, but the repository already includes a protected Logistics lead receiver with same-origin checks, request-size limits, idempotency, KV-backed rate limits, server-controlled sales tags, and email delivery bindings. The missing work is external activation and a verified production delivery test.

### Local SEO expansion

The report understates the existing Wisconsin cluster. Generic “add more city pages” is rejected. Further expansion remains evidence-gated under the multi-state research task, with no bulk place-name replacement, no doorway pages, and no more than two first non-Wisconsin pilots after review.

### Google Business Profile and reviews

Absence of a visible website link does not prove that a profile does or does not exist. This remains an authenticated external-verification task. No profile, location eligibility, review count, or optimization state should be claimed from public-page inspection alone.

### Hermes Connect maturity

The product has structured prototype and discovery material, but it remains explicitly unconnected. It must not be described as a live booking product, working backend, or public pilot.

### Cross-sell

A generic increase in cross-sell blocks is rejected. The current product principle is to help a visitor choose one direction first. Cross-direction links are allowed only where the next workflow genuinely requires another Hermes capability, such as Logistics → CRM automation or Marketing → website/SEO implementation.

## Important issue the Grok report did not identify

The production homepage exposed a retired Academy signal:

- `COO / Operational Director Program`;
- `3 × 6`;
- `3 tracks`.

The approved Academy public contract contains exactly two public programs:

1. U.S. Logistics Operations;
2. Marketing.

The mismatch came from two sources:

- an outdated visible trust badge;
- legacy static-validator compatibility text stored as template text nodes, which external text extraction could still surface.

## Actions taken

### P0 — implemented in branch `fix/academy-home-contract`

- created one centralized `publicPaths` layer;
- made the homepage and generated path pages consume the same public Academy override;
- changed the homepage trust signal to `2 programs`;
- removed retired Academy wording from compatibility template text nodes;
- added regression coverage against crawler-extractable retired wording;
- preserved the current static validator contract without restoring a third public program.

### P0 — create controlled production lead-delivery activation task

A dedicated owner/external-operations issue should cover:

- verified sender and destination;
- Cloudflare Email Sending onboarding;
- KV binding;
- exact environment variables;
- preview deployment;
- real test delivery;
- duplicate/rate-limit checks;
- privacy-safe logging;
- rollback;
- production activation and conversion baseline.

### P1 — evidence-backed cases

Use the existing external SEO/evidence issue rather than creating unsupported case copy. Target two or three cases only after evidence and publication permission are supplied.

### P1 — Hermes Connect discovery gate

Do not implement booking/auth/payments from this report alone. Create a product brief only when one pilot vertical and operating owner are selected.

### Deferred

- bulk city pages;
- Polish/German localization;
- generic cross-sell expansion;
- Google Business Profile claims without authenticated evidence;
- traffic, ranking, lead, or revenue promises.

## Final decision

The Grok report is **partially accepted**.

Its strongest strategic conclusion is correct: the next meaningful website value comes from controlled live conversion, stronger evidence, and selectively moving one product from prototype to a real pilot—not from indiscriminate page growth.

Its recommendations were not copied into the backlog wholesale. Existing work was reconciled first, one real P0 public-contract defect was found and fixed, and the remaining actions were routed to the correct evidence and activation gates.
