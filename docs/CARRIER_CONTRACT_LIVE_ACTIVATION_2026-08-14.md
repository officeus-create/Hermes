# Carrier contract live activation — 2026-08-14

Status: `COUNSEL-CONFIRMED / STANDARD EXECUTION LIVE`

## Owner decision

Vladimir authorized activation of the existing carrier e-sign flow for real carrier use and requested that each signed carrier packet be delivered to the main Hermes mailbox with a personal operational notification.

Vladimir reported on 2026-08-14 that counsel confirmed the execution agreement. The repository records that owner-relayed decision and does not claim independent access to counsel correspondence.

## Standard execution scope

Live execution is restricted to the two standard commercial models already published by Hermes:

- `6%` — Dispatch Support;
- `8%` — Full Partnership.

A custom percentage/scope remains a proposal/review record until Hermes accepts matching written terms. The backend continues to enforce `contract.plan !== custom` for live mode.

## Immutable execution master

Production asset:

`/contracts/Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf`

Version:

`HERMES-CARRIER-EXECUTION-V2026-08-06`

SHA-256:

`ac35ae765617010dd7551b4a22537b32715923c49601d9aac1f21bbb5e0904a8`

The contract endpoint must refuse live execution if the fetched master does not match this fingerprint.

## Delivery

A successful packet is sent through the private `hermes-lead-email` service binding with subject:

`[HERMES CONTRACT] [CARRIER ONBOARDING]`

The delivery contains:

1. carrier-specific signed Appendix A;
2. immutable execution master;
3. carrier/company/signer/MC/USDOT/plan/percentage summary in the email body.

The private email worker guarantees the configured Hermes contract recipient before the API reports internal delivery. The current main Hermes recipient is `officeus@hermeslogisticsus.com`. The retired `freight_301@hermeslogisticsus.com` address remains excluded. The carrier always receives an immediate browser download; carrier email delivery is reported separately as `delivered`, `download_only`, or `pending` and is never inferred from internal delivery.

Transient provider failures receive bounded retries. The API stores a 30-day operational recovery record with separate internal/carrier statuses, attempt count, last-attempt time, PDF hash, mode, and request-payload hash. The approved Hermes mailbox remains the durable business record containing both PDFs.

## Privacy and attribution controls retained

The pre-signature flow keeps the existing minimized data boundary and does not collect passwords, PINs, bank/payment credentials, W-9s, CDL images, VIN lists, full operating profiles, load-board credentials, or private shipment documents.

The signed Appendix retains document version, master SHA-256, timestamp, consent version, typed signer name, drawn signature and audit fingerprints. Raw IP address is not placed in the PDF/email.

## UX activation layer

The underlying legacy/review source remains preserved for audit history. Production route functions present the current execution state on:

- `/sign/`;
- `/logistics/carrier-onboarding/`;
- `/logistics/carrier-agreement/`.

This keeps rollback simple while the execution path is being observed in real use.

## Acceptance test

`scripts/carrier-contract-live-activation.test.mjs` verifies:

- immutable execution-master SHA-256;
- 6%/8% live configuration;
- live execution response;
- delivery to the carrier and `officeus@hermeslogisticsus.com`;
- two PDF attachments;
- exact contract email subject;
- custom-plan fallback to review mode.

## Remaining deployment boundary

Repository activation can deploy through the approved Hermes Pages production path. The private email Worker and its Service/KV/token/email bindings must already be active in Cloudflare. If any required private binding is absent, the endpoint intentionally returns `contract_delivery_not_configured` instead of accepting a signature without reliable delivery.
