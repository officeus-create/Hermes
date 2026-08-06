# Carrier Contract Engine — Activation and Operating Runbook

Status: CODE READY FOR CONTROLLED REVIEW PACKETS / PRODUCTION EXECUTION REQUIRES APPROVAL  
Owner: Hermes Logistics + IT Development  
Last updated: 2026-08-06

## Purpose

The carrier contract engine continues the Logistics Sales conversation through one phone-friendly workflow:

1. carrier selects Essential Dispatch, Hermes Pro, or Custom Cooperation;
2. carrier provides legal company, signer, authority, equipment, lanes, load-board names, and adaptation details;
3. carrier identifies the Hermes assistant or load planner they spoke with;
4. carrier confirms electronic-record consent and signer authority;
5. carrier signs with a finger, stylus, mouse, or trackpad;
6. the server creates a PDF Appendix A / onboarding packet with the selected plan, operating profile, signature image, timestamp, document identifiers, and hashed audit fingerprints;
7. the server attaches the applicable master agreement PDF;
8. copies are delivered to the carrier and a private, environment-controlled Hermes recipient list;
9. the carrier receives an immediate PDF download even when email delivery needs follow-up.

The website never asks for or accepts load-board passwords, PINs, API tokens, recovery codes, payment credentials, W-9 files, CDL images, VIN lists, bank data, or private shipment documents.

## Current document classification

The repository currently contains the attorney-review draft:

- version: `DRAFT-2026-08-05`;
- path: `/contracts/Hermes_Carrier_Dispatch_Agreement_Master_DRAFT_v2026-08-05.pdf`;
- SHA-256: `35b14cf8e68a8cc4a0e4720157e8dd141765868a16b5db3145c94168bbf80e0b`;
- commercial term in that draft: 5.00%.

Therefore the safe initial mode is:

`CARRIER_CONTRACT_MODE=review`

In review mode, the carrier receives:

- the signed service-selection and onboarding PDF;
- the current master draft PDF;
- explicit wording that the packet does not activate a final agreement until Hermes issues an approved execution version.

The proposed 6% Essential and 8% Pro structures are recorded as selected commercial proposals. They must not be represented as a final executed contract while the attached master agreement still states 5%.

## Required Cloudflare bindings

The Pages production environment must provide:

- `ASSETS` — Pages static asset binding;
- `LEAD_EMAIL_SERVICE` — service binding to the private email worker;
- `LEAD_LIMITS` — production KV namespace used for idempotency and rate control;
- `LEAD_SERVICE_TOKEN` — shared secret stored only in Cloudflare secret storage;
- `LEAD_DELIVERY_MODE=live`;
- `ALLOWED_ORIGIN=https://hermeslogisticsus.com`;
- `CARRIER_CONTRACT_MODE=review` until final legal approval;
- `CARRIER_CONTRACT_INTERNAL_RECIPIENTS` on the email worker;
- `EMAIL_TRANSPORT_MODE=cloudflare_email_message` when the Cloudflare Email Routing send binding is used for MIME/PDF attachments.

Do not place secret values, account IDs, binding IDs, recipient lists, or provider diagnostics in GitHub, page HTML, analytics, URLs, screenshots, or public logs.

## Internal recipient configuration

The internal recipient list is not accepted from the browser. It is read only from the private email-worker variable:

`CARRIER_CONTRACT_INTERNAL_RECIPIENTS`

Format:

```text
officeus@hermeslogisticsus.com,freight_301@hermeslogisticsus.com,EXACT_DISPATCH_34_47_ADDRESS,EXACT_DISPATCH_107_ADDRESS
```

Confirmed in current project records:

- `officeus@hermeslogisticsus.com`;
- `freight_301@hermeslogisticsus.com`.

The exact addresses described operationally as “dispatch 34–47” and “dispatch 107” were not confirmed in the repository or connected mailbox search. Do not guess them. Add them to the encrypted/private Cloudflare variable only after the owner supplies or verifies their exact spelling and domain.

If only the confirmed addresses are configured initially, the engine operates without requiring a code change. Updating the private recipient variable later extends distribution immediately after the worker configuration is deployed.

## Production execution activation

Final agreement execution may be enabled only after all of the following are true:

1. qualified Wisconsin transportation counsel approves the master agreement and related authorization/addendum;
2. Essential 6%, Pro 8%, and any supported selected-service language are consistent between the master agreement and Appendix A;
3. Hermes publishes an immutable approved PDF under `/contracts/`;
4. Hermes records the exact approved version and SHA-256;
5. the Cloudflare Pages production environment receives:
   - `CARRIER_CONTRACT_MODE=live`;
   - `CARRIER_CONTRACT_APPROVED_VERSION=<non-draft version>`;
   - `CARRIER_CONTRACT_APPROVED_PDF_PATH=/contracts/<approved-file>.pdf`;
   - `CARRIER_CONTRACT_APPROVED_PDF_SHA256=<64 lowercase hex characters>`;
6. preview environments are proven unable to access production email, KV, recipient, and agreement bindings;
7. a synthetic end-to-end execution succeeds on a phone;
8. the carrier test inbox and every internal recipient receive both PDFs;
9. the downloaded and emailed files have matching SHA-256 values;
10. no private value appears in analytics, URLs, GitHub, or public logs.

The endpoint refuses to label a package live when the approved version is missing, contains `draft`, has an invalid path/hash, or the carrier selected non-approved custom terms.

## Electronic-signature record

The generated PDF records:

- selected plan and percentage;
- company and authority identifiers;
- authorized signer name and title;
- carrier business email and phone;
- equipment, operating areas, lane preferences, and adaptation notes;
- load-board names and secure access-handoff method;
- Hermes representative referenced by the carrier;
- four affirmative consent confirmations;
- typed signer name;
- drawn JPEG signature;
- UTC timestamp;
- consent-version identifier;
- SHA-256 input fingerprint;
- hashed network and device fingerprints;
- master-document version and SHA-256;
- generated Appendix A SHA-256.

Raw IP addresses and raw device strings are not written to the PDF or email. Only one-way hashes are retained in the signed record.

## Custom plan boundary

A Custom Cooperation submission is always a proposal. It may generate a signed review/onboarding packet, but it must not become a live executed agreement automatically.

Required sequence:

1. carrier proposes percentage and scope;
2. Hermes reviews the commercial and operating terms;
3. Hermes approves or revises the proposal;
4. Hermes issues a matching immutable agreement/appendix version;
5. the carrier completes a new signature request against that approved version.

## Failure handling

- The endpoint returns a PDF immediately when generation succeeds.
- `X-Hermes-Delivery: delivered` means the private email worker accepted delivery to the carrier and configured Hermes recipients.
- `X-Hermes-Delivery: pending` means the PDF was created but email delivery was not confirmed; the carrier keeps the downloaded copy and Logistics Sales must complete a secure manual follow-up.
- Idempotency prevents repeated clicks from sending duplicate contract emails.
- KV stores the generated carrier PDF for 24 hours only to support same-request recovery; it is not the permanent contract archive.
- Permanent completed-document storage must be added to the approved private records system before high-volume production execution.

## Synthetic acceptance test

Use an obviously synthetic carrier and approved test inboxes.

Verify:

1. Essential and Pro query links preselect the correct plan;
2. MC or USDOT is required;
3. at least one equipment type is required;
4. no password-like field exists;
5. the signature canvas works on iPhone/Android and desktop;
6. typed signature must match the signer name;
7. all four consents are required;
8. the server verifies the master PDF SHA-256;
9. the generated Appendix A opens as a valid three-page PDF;
10. the carrier and every configured Hermes recipient receive both PDFs;
11. a duplicate submission does not send again;
12. a payload containing password, token, bank, W-9, CDL, or VIN keys is rejected;
13. custom terms remain review mode;
14. production preview builds cannot use production recipient or contract bindings.

## Release classifications

Before approved master activation:

`SIGNED REVIEW/ONBOARDING PACKET READY / FINAL AGREEMENT NOT ACTIVATED`

After legal approval, binding isolation, recipient verification, and synthetic execution:

`PRODUCTION CARRIER E-SIGN VERIFIED`
