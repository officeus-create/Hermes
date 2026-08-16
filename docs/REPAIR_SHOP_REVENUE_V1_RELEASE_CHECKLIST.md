# Repair Shop Revenue V1 release checklist

- [ ] `/services/hermes-connect/repair-shops/` explains the shop outcome without internal pilot/runtime language.
- [ ] Primary CTA opens owner setup; commercial CTA opens the Founding Shop Plan.
- [ ] `/services/hermes-connect/repair-shops/plan/` renders on desktop and 390px mobile.
- [ ] $99/month per-location scope is consistent everywhere in Revenue V1.
- [ ] Paid activation form requires shop, contact, email, phone, city/state, value reason, and consent.
- [ ] Paid activation submits to `/api/logistics-lead` with an idempotency key.
- [ ] Successful form state says request received, not payment completed.
- [ ] Failed form state says nothing was charged.
- [ ] Analytics contains plan-view and plan-request events but no contact PII.
- [ ] Existing payment-compliance gate stays green because no website payment technology is introduced.
- [ ] Existing booking/owner/customer flows remain unchanged.
- [ ] Build and test suite pass.
- [ ] Preview smoke confirms CTA and form behavior.
- [ ] After merge, first 10 real shops are tracked against the operating scorecard.
