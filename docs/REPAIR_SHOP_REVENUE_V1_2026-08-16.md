# Hermes Connect Repair Shops — Revenue V1

Date: 2026-08-16
Status: implementation branch

## Product decision

Repair Shops is no longer evaluated only as a technical pilot. The next product gate is whether a real shop can understand the value, use the workflow, and raise a concrete intent to pay.

## Revenue V1 offer

- Offer: **Founding Shop Plan**
- Launch price: **$99/month per repair shop location**
- Current scope: owner workspace, shop profile, service catalog, weekly availability, public booking link, booking inbox/status history, customer and vehicle context, private product feedback.
- Website payment collection: **not enabled in Revenue V1**.
- Conversion path: value page → workspace trial/setup → paid activation page → private Hermes Logistics sales intake → human confirmation and invoice.
- The paid activation form does not charge a card and does not represent automatic approval or activation.

## Why manual close first

The repository currently has a deliberate payment compliance gate with website payments disabled. Revenue V1 therefore uses the existing production lead receiver instead of adding a fake checkout or blocking customer acquisition on processor setup.

The first commercial KPI is not checkout completion. It is **qualified paid activation requests and manually closed paying shops**.

## Funnel

1. Repair shop lands on `/services/hermes-connect/repair-shops/`.
2. The page explains the customer outcome instead of internal runtime/pilot terminology.
3. Owner can create an account and test the real shop workflow.
4. Public page and workspace point toward the **Founding Shop Plan**.
5. `/services/hermes-connect/repair-shops/plan/` presents one simple $99/month offer.
6. Shop submits a consented paid activation request.
7. Request is delivered through the existing `/api/logistics-lead` receiver with an idempotency key.
8. Hermes confirms scope/billing and invoices the shop manually.
9. Product team records the objections, requested features, activation friction, and payment result.

## Initial KPI set

For the first 10 real shops, record:

- landing → owner registration;
- registration → configured profile;
- profile → first service;
- service → availability configured;
- configured shop → booking link shared/opened;
- booking link → first booking;
- active shop → Founding Plan view;
- plan view → paid activation request;
- paid activation request → invoice sent;
- invoice sent → paid;
- paid shop → retained active use;
- top objections and top missing features.

## Definition of done for Repair Shops before Academy becomes the primary build stream

Repair Shops is considered commercially launched when:

- the core owner-to-booking loop works on desktop and mobile;
- a real shop can understand setup without internal product terminology;
- the $99 Founding Shop Plan is visible and understandable;
- paid activation requests reach Hermes reliably;
- at least the first real shops can be manually invoiced and activated;
- acquisition, activation, booking, purchase intent, and close outcomes are measurable;
- feedback from real users drives the next fixes instead of speculative feature expansion.

## Next monetization step

After real manual payments validate the offer, replace the manual invoice handoff with reviewed online billing/checkout and subscription status inside the owner workspace. Do not add multiple SaaS tiers until real customer evidence supports segmentation.

## Next product stream after Repair Shops

Hermes Connect Academy should reuse the existing Academy public subsite and the already-real U.S. Logistics Operations and Marketing curriculum foundations, then grow into additional reviewed specializations rather than launching as a duplicate website/runtime.
