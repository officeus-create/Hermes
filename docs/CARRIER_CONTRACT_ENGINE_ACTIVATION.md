# Carrier Contract Engine - v3 Activation and Operating Runbook

Status: SIGNED REVIEW PACKET READY / PRODUCTION EXECUTION REQUIRES APPROVAL  
Owner: Hermes Logistics + IT Development  
Last updated: 2026-08-06

## v3 operating model

The carrier agreement journey is intentionally separated into two phases.

### Before signature - three-step legal/commercial packet

1. confirm Dispatch Support, Operations + Growth, or Custom Cooperation;
2. confirm the exact carrier-specific percentage for Appendix A;
3. provide legal company, MC or USDOT, optional company website, authorized signer, and business email/phone;
4. review the plain-language control and payment boundaries;
5. provide electronic consent, typed name, and drawn signature;
6. receive a signed Appendix A review PDF plus the current master review PDF.

### After signature - secure operating onboarding

Equipment, lanes, load boards, and access details are collected after the agreement review packet through an approved secure onboarding process.

Availability, delegated access, W-9, insurance, carrier packets, driver/CDL documents, VIN lists, and shipment records are also collected only when required through the appropriate approved private workflow. They are not part of the public pre-signature form.

No password, PIN, recovery code, API key, payment credential, bank information, W-9, CDL image, VIN list, full street address, lane profile, or private shipment document is accepted by the v3 pre-signature endpoint.

## External link policy

The standard external handoff is always the clean route:

`https://hermeslogisticsus.com/sign/`

SMS, WhatsApp, Telegram, email, public pages, and sales messages must not add carrier identity, signer identity, percentage, representative code, offer code, tracking identifier, MC/USDOT, phone, or email to the URL.

A non-sensitive plan choice may be carried only during same-origin navigation after the carrier actively selects it on the Hermes site. Percentage, representative, offer, identity, and record-retrieval values must not be trusted from ordinary query parameters.

A future personalized execution link must use an opaque, signed, expiring, single-purpose token resolved by a trusted Hermes server. The token may identify an approved offer record server-side, but the URL must not reveal the underlying commercial or personal values and must never be reusable as a general authentication credential.

## Current review document

- version: `ATTORNEY-REVIEW-V3-2026-08-06`;
- PDF path: `/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf`;
- PDF SHA-256: `9d26436b95b63610179f3af9ac4cddf5df59a1610e402bad2162ef394951d5cb`;
- HTML review versions are published under `/contracts/`;
- master percentage: blank;
- exact percentage: carrier-specific Appendix A;
- status: attorney review, not final execution.

Safe mode:

`CARRIER_CONTRACT_MODE=review`

## Required production bindings

- `ASSETS` - production static asset binding;
- `LEAD_EMAIL_SERVICE` - private email-worker binding;
- `LEAD_LIMITS` - production KV for idempotency and rate control;
- `LEAD_SERVICE_TOKEN` - Cloudflare secret;
- `LEAD_DELIVERY_MODE=live`;
- `ALLOWED_ORIGIN=https://hermeslogisticsus.com`;
- `CARRIER_CONTRACT_MODE=review` until approval;
- `CARRIER_CONTRACT_INTERNAL_RECIPIENTS` on the email worker;
- `EMAIL_TRANSPORT_MODE=cloudflare_email_message` when using the Email Routing send binding.

Never place secret values, account IDs, recipient lists, provider diagnostics, signer records, raw commercial terms, or personal data in GitHub, HTML, analytics, URLs, screenshots, or public logs.

## Internal recipients

The browser cannot choose internal recipients. The private email worker reads `CARRIER_CONTRACT_INTERNAL_RECIPIENTS` and removes retired addresses.

Confirmed active fallback:

`officeus@hermeslogisticsus.com`

`freight_301@hermeslogisticsus.com` is retired and denylisted. Dispatch 34-47 and dispatch 107 addresses must not be guessed.

## Production execution gate

Final execution may be enabled only when all conditions are true:

1. qualified Wisconsin transportation counsel approves the master and any limited authorization/addendum;
2. Hermes publishes an immutable non-review PDF under `/contracts/`;
3. exact approved version and PDF SHA-256 are recorded;
4. approved service models and percentage rules are consistent between the master and Appendix A;
5. production receives:
   - `CARRIER_CONTRACT_MODE=live`;
   - `CARRIER_CONTRACT_APPROVED_VERSION=<non-draft/non-review version>`;
   - `CARRIER_CONTRACT_APPROVED_PDF_PATH=/contracts/<approved-file>.pdf`;
   - `CARRIER_CONTRACT_APPROVED_PDF_SHA256=<64 lowercase hex>`;
   - `CARRIER_CONTRACT_ALLOWED_PERCENTAGES=<comma-separated approved percentages>`;
6. the selected percentage is present in `CARRIER_CONTRACT_ALLOWED_PERCENTAGES`;
7. Custom Cooperation remains review-only until a separately approved matching document is issued;
8. any personalized link uses an approved opaque, signed, expiring server-side offer/session mechanism;
9. preview environments cannot access production email, KV, recipient, agreement, records, or signing bindings;
10. a synthetic phone execution passes;
11. the downloaded and emailed files have matching hashes;
12. permanent private record retention is approved.

The endpoint falls back to review mode whenever the version is missing or contains `draft`/`review`, the PDF path/hash is invalid, the percentage is absent from the allowlist, the personalized request is not server-approved, or Custom Cooperation is selected.

## Electronic signature record

The v3 generated Appendix records:

- document mode, version, and master SHA-256;
- selected service model and exact percentage;
- legal company, DBA, MC/USDOT, optional company website;
- authorized signer name/title and business contact;
- Hermes representative and offer code only when supplied by an approved server-side offer record;
- custom scope when applicable;
- four affirmative consents;
- typed signer name and drawn JPEG signature;
- UTC timestamp and consent version;
- input, network, and device audit fingerprints;
- generated Appendix SHA-256.

Raw IP addresses and raw user-agent strings are not written into the PDF or email.

## Failure and recovery

- successful generation returns a PDF immediately;
- `X-Hermes-Delivery: delivered` confirms private worker acceptance;
- `X-Hermes-Delivery: pending` means the carrier keeps the downloaded PDF and Sales follows up securely;
- idempotency prevents duplicate contract email from repeated clicks;
- generated recovery data remains in KV for 24 hours only;
- permanent completed-document storage is a separate production requirement.

## Synthetic acceptance test

1. open the clean `https://hermeslogisticsus.com/sign/` route with no query parameters;
2. verify no carrier identity, percentage, representative, offer, or tracking value appears in the URL;
3. choose a service model through the same-origin site flow;
4. verify the form has three steps;
5. verify MC or USDOT is required;
6. verify company website is optional and validated;
7. verify full address, equipment, lanes, load boards, and access details are absent;
8. verify all four consents and typed/drawn signature are required;
9. verify a rate absent from `CARRIER_CONTRACT_ALLOWED_PERCENTAGES` stays review mode;
10. verify Custom Cooperation stays review mode;
11. verify the master PDF SHA-256;
12. verify the two-page Appendix PDF and attached master open;
13. verify carrier and active internal recipients receive both PDFs;
14. verify retired recipients are filtered;
15. verify duplicate submission does not resend;
16. verify prohibited or unnecessary pre-signature fields are rejected;
17. verify production bindings are unavailable to previews;
18. after personalized execution is implemented, verify opaque tokens expire, cannot be reused across carriers, and reveal no underlying record values.

## Release classification

Before approval:

`SIGNED REVIEW PACKET READY / FINAL AGREEMENT NOT ACTIVATED`

After counsel approval, allowed-rate activation, secure personalized issuance, binding isolation, retention, and synthetic execution:

`PRODUCTION CARRIER E-SIGN VERIFIED`
