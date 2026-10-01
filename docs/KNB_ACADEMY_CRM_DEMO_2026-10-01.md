# Academy Business CRM / KNB demo — 2026-10-01

## Goal

Create one reusable Hermes Connect workspace pattern for academies, online schools, business clubs and course operators.

The first concrete instance is **Конс на Бі$ / Бізнес Клуб КНБ**. The same template must be usable by Hermes Business Academy without creating a second Academy runtime.

## Evidence boundary

This branch intentionally separates three things:

1. **Publicly verified operating signals** — official KNB program pages and current public vacancies.
2. **Existing Hermes capability** — current Academy learner identity, curriculum, evidence, support, reviewer and progression routes.
3. **Hermes product inference / demo** — CRM fields and dashboards that logically connect those workflows.

No private KNB CRM data, paid-service status, billing record, owner ID, activation receipt or real KPI value is fabricated.

The exact original client test-assignment text has not been recovered from the available sources. Therefore the demo implements observable requirements from the public operating model instead of pretending an unavailable brief was seen.

## Public operating requirements represented

### Marketing
- marketing strategy;
- channels and funnels;
- hypothesis backlog;
- budget and channel efficiency;
- CAC / LTV / ROMI;
- revenue / profit impact;
- brand, content and media;
- marketing ↔ sales ↔ product synchronization.

### Sales
- multilevel / four-level sales structure;
- warm leads;
- consultation and needs discovery;
- program selection;
- CRM notes and next action;
- conversion, average check, productivity and profitability;
- manager hierarchy and management analytics.

### Education operations
- program catalog;
- cohorts;
- enrollment;
- lessons / recordings;
- practical assignments;
- weekly review;
- expert / VIP sessions;
- private participant community;
- learner progress and completion;
- renewal / next program.

### HR
- vacancies;
- candidates;
- screening;
- interviews;
- assessment;
- candidate stage;
- adaptation.

## Existing Hermes Academy reuse

Do not create a second Academy auth or learning store.

Reuse the current Hermes Connect Academy surfaces:
- /services/hermes-connect/academy/dashboard/
- /services/hermes-connect/academy/submissions/
- /services/hermes-connect/academy/progression/
- /services/hermes-connect/academy/support/
- /services/hermes-connect/academy/reviewer/

The new business CRM demo is the management layer around those capabilities.

## KNB onboarding boundary

PR #1591 remains the isolated backend provisioning / canonical Catalog projection workstream.

This branch does not:
- merge or alter PR #1591;
- create a production KNB company;
- assign an owner identity;
- opt the client into the public Catalog;
- write real leads, budgets, candidates or learners;
- claim that the new design is approved.

After backend onboarding is explicitly approved and a canonical company identity exists, this management template can bind to the real company ID instead of demo data.

## Routes in this branch

- /businesses/concepts/kons-na-bis/ — noindex client-facing website / Catalog concept.
- /services/hermes-connect/academy/business-demo/kons-na-bis/ — noindex academy CRM management demo.

Both routes are review artifacts, not production activation receipts.
