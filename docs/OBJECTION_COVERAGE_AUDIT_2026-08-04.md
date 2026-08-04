# Objection Coverage Audit — 5 money pages

Reviewed: 2026-08-04  
Reconciled against current `main`: 2026-08-04

Method: rendered `dist/` HTML was checked against the buyer-question sequences for each audience. The original audit identified four gaps. Two operational-copy gaps are now closed in current public page content and protected by regression tests; two trust-layer gaps remain intentionally blocked until real people and evidence are approved.

Pages covered:

- Car Hauling Dispatch — `/logistics/car-hauling-dispatch/`
- Dealer Vehicle Transportation — `/logistics/dealer-vehicle-transportation/`
- Logistics SEO — `/services/seo-for-logistics-companies/`
- Website Development — `/services/website-development/`
- Academy (US Logistics Operations) — `/academy/us-logistics-operations/`

## Current summary

| Page | Covered well | Current gap status |
| --- | --- | --- |
| Car Hauling Dispatch | Pricing/fee language, carrier control, guarantee boundaries, self-dispatch comparison, qualification, and direct intake | **Closed.** The page now explains what happens after intake: Logistics Sales reviews authority, insurance, equipment, capacity, operating area, availability, and dispatch scope; submission does not automatically create an account, assign a dispatcher, book a load, or guarantee acceptance. No response-time promise is made. |
| Dealer Vehicle Transportation | Auction/release requirements, inoperable vehicles, open vs enclosed, storage deadlines, insurance, multi-vehicle planning, and direct intake | **Closed at public-information level.** The page now explains delay and damage reporting, preservation of BOL/condition reports, time-stamped photos and communication records, prompt notice to the carrier and Hermes, and the responsibility boundary for the motor carrier, insurer, agreements, documents, and law. No claim outcome or timeline is guaranteed. |
| Logistics SEO | Scope language, case/results references, onboarding and no-guarantee boundaries | **Owner-gated.** No named external-facing expert or reviewer profile. A real identity, approved bio, photo, role, and evidence are required. |
| Website Development | Pricing/scope/quote language, timeline/phase/process, case reference, guarantee language | No gap found in this audit set. |
| Academy (US Logistics Operations) | Pricing/fee, certificate/outcome boundaries, duration and application model | **Owner-gated.** No named instructor/mentor bio. A real identity, approved public role, photo, bio, and evidence are required. |

## Detail

### Car Hauling Dispatch — closed

The original finding was that the page avoided an unsupported response-time promise but did not clearly tell a first-time carrier what happens after submission.

Current public coverage now includes:

- a dedicated commercial carrier intake rather than dependence on the fictional Load Board demo;
- authority and insurance readiness review;
- equipment, capacity, geography and availability review;
- routing to dispatcher review, readiness review or scope clarification;
- a visible FAQ explaining that secure delivery or direct email/phone handoff does not automatically create an account, assign a dispatcher, book a load or guarantee acceptance;
- carrier approval and final-decision boundaries.

The page still correctly avoids guaranteeing response time, loads, rates, lanes, mileage or revenue.

### Dealer Vehicle Transportation — closed at public-information level

The original finding was that damage/delay handling surfaced only indirectly. Current public coverage now includes:

- a visible `Documented exception path` benefit;
- direct notice to the agreed Hermes coordination contact and assigned motor carrier when timing changes;
- preservation of facility notices, appointments, release information, timestamps and communications;
- preservation of the bill of lading or condition report and time-stamped photos when condition changes or damage is reported;
- a clear statement that Hermes coordinates information flow while liability, coverage, deadlines, review and payment are determined by the motor carrier, insurer, applicable agreement, transportation documents and law;
- no guaranteed revised timing, claim decision, payment or resolution timeline.

This is intentionally a public information and coordination boundary, not a substitute for transaction-specific contractual or legal instructions.

### Logistics SEO — owner input still required

Scope, onboarding, methodology and result-boundary language are present. The remaining gap is a named, external-facing expert/reviewer. The words `author` and `credentials` inside evidence-policy copy do not replace a visible real-person trust layer.

Do not invent a name, role, biography, photograph, credentials, client history or results. Close this only after the owner approves a real profile and supporting evidence.

### Website Development — no gap found

This remains the strongest objection-covered page in this audit set. It addresses scope, pricing/quote logic, phases, timeline boundaries, ownership questions, launch and post-launch expectations, and does not promise unsupported outcomes.

### Academy — owner input still required

Pricing/fee, duration, application and outcome boundaries are present. The remaining trust gap is a named instructor/mentor with an approved public role, biography, photograph, current program responsibility and evidence-supported experience.

Do not insert a placeholder person or revive retired Academy program language.

## Remaining action items

1. Add a real Logistics SEO reviewer/expert profile only after owner approval and evidence review.
2. Add a real Academy instructor/mentor profile only after owner approval and evidence review.
3. Keep the Car Hauling post-submit and Dealer exception guidance protected by `scripts/commercial-logistics-pages.test.mjs`.
4. Re-run this audit after any material change to the commercial-page template, intake routes, service responsibility language or trust layer.

## Publication boundary

- No guaranteed response time, pickup/delivery window, rate, load volume, revenue, claim outcome or payment.
- No invented fleet ownership, insurance responsibility, named expert, mentor, testimonial or case result.
- No sensitive VIN, release credential, private shipment information, customer identity or real lead data in repository fixtures, public pages or analytics.
