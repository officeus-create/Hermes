# Hermes Connect Repair Shops — remaining activation gaps

Date: 2026-08-16
Parent: #586 / #585
Canonical activation PR: #584

## Current activation loop in #584

`profile → 3 services → booking hours → share/open public booking link → first booking → first completed booking → Founding Shop Plan`

This is the current canonical first-value path. Do not create a second activation runtime.

## Remaining gaps after #584

### P0 — prove real first-shop loop
Run one synthetic and then real-shop acceptance on desktop and ~390px mobile:
1. register;
2. save profile;
3. add 3 services;
4. set hours;
5. open/share booking link;
6. submit customer booking;
7. see it in owner inbox;
8. move it to Completed;
9. submit private feedback;
10. open $99 Founding Shop Plan;
11. submit paid activation intent;
12. reconcile delivery with the receiving Hermes workflow.

Do not treat repository tests as proof of the external delivery step.

### P1 — QR for public booking link
The product roadmap promises a shareable QR, but current repository search found no Repair Shop QR implementation.

Implement as a small separate slice after #584:
- QR generated only from the public booking URL;
- owner can view/download/print it;
- no external tracking URL;
- selected locale does not change shop identity;
- mobile friendly;
- simple guidance for counter card, business card, website, Google Business Profile, SMS/WhatsApp/social sharing;
- no second booking URL or new backend required.

### P1 — post-completion feedback nudge
After the first completed booking, show one compact non-blocking prompt in the owner workspace:
`What was confusing or missing?`

Reuse the existing private `/api/repair-shop/feedback` path. No modal that blocks work and no duplicate feedback backend.

### P1 — paid-intent delivery evidence
Revenue V1 already posts the plan request through `/api/logistics-lead` with consent and idempotency. Before calling the commercial loop complete, obtain evidence that a synthetic paid-intent request is delivered and reconciled in the intended Hermes receiving workflow.

### HOLD
Do not add advanced Repair Shop features until a repeated first-user problem proves the need. First collect actual friction from the first shops.
