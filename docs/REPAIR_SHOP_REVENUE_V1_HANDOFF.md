# Repair Shop Revenue V1 handoff

Branch: `feature/repair-shop-revenue-v1`

Implementation scope:

- customer-facing Repair Shops landing rewritten around outcomes rather than internal pilot/runtime terminology;
- one simple Founding Shop Plan at $99/month per repair shop location;
- new `/services/hermes-connect/repair-shops/plan/` conversion page;
- paid activation request routed through the existing private `/api/logistics-lead` production receiver with idempotency and consent;
- no online card collection or payment-provider code in this V1;
- analytics records plan view/request events without customer PII;
- existing Repair Shop growth contract test extended to guard the revenue funnel;
- first-10-shop commercial scorecard and Academy follow-on backlog documented.

Required verification before merge:

- Astro check/build;
- existing payment compliance gate remains green;
- Repair Shop growth CTA contract remains green;
- internal link audit resolves the new plan route;
- no PII is added to analytics events;
- no fake payment success state is introduced.
