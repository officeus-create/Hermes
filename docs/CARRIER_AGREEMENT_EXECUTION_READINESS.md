# Carrier Agreement Portal - Production Execution Readiness

Status: V3 WORKFLOW READY / LEGAL APPROVAL AND PRODUCTION ACTIVATION REQUIRED  
Owner: Hermes Logistics  
Last updated: 2026-08-06

## Objective

Move a qualified carrier from a safe SMS or website link to a unique, auditable agreement packet without exposing reusable signer links, production secrets, credentials, or unnecessary operating data.

This document defines implementation readiness. It does not declare the v3 attorney-review draft legally approved.

## Current v3 implementation

- private `noindex,nofollow` carrier entry, offer, agreement, and signing pages;
- safe short URL `https://hermeslogisticsus.com/carrier/`;
- optional URL context limited to plan, rate, representative code, and offer code;
- three-step pre-signature flow;
- blank percentage in the master and exact percentage in Appendix A;
- legal company, MC/USDOT, optional website, authorized signer, business email/phone;
- typed and drawn signature with affirmative electronic-record consent;
- immutable review master version and PDF SHA-256;
- server-side PDF generation, idempotency, rate control, and controlled email delivery;
- retired-recipient filtering;
- explicit rejection of credentials, private documents, detailed address, equipment, lanes, load boards, and access details from the pre-signature payload.

## Commercial and legal boundary

Current review master:

- `ATTORNEY-REVIEW-V3-2026-08-06`;
- percentage blank in master;
- exact carrier-specific rate in Appendix A;
- counsel review required;
- production signing not activated.

Before live execution:

1. Wisconsin transportation counsel approves the final master and limited authorization language;
2. Hermes approves the supported service models, percentage range, invoice language, termination, limitation of liability, indemnity, and venue;
3. an immutable approved PDF is published with a new non-review version and SHA-256;
4. supported rates are placed in the production-only `CARRIER_CONTRACT_ALLOWED_PERCENTAGES` allowlist;
5. custom terms remain separately approved and separately issued;
6. no carrier receives a review draft labeled as final execution.

## Required production issuance

A trusted server creates a unique request. Browser code never receives provider or email credentials.

Minimum trusted input:

```text
carrier_internal_id
legal_company_name
authorized_signer_name
authorized_signer_title
signer_email_optional
signer_mobile_optional
mc_optional
usdot_optional
company_website_optional
selected_service_model
approved_percentage
document_version
document_sha256
sales_owner
offer_code_optional
```

Validation:

- at least one of signer email or verified signer mobile is present;
- the operating email and/or mobile number belongs to the authorized business contact;
- at least one of MC or USDOT is present;
- document version/hash exist in the approved registry;
- percentage exists in the approved-rate registry;
- request is unique and cannot be created from arbitrary public parameters;
- no password, payment credential, W-9, CDL image, VIN list, full street address, lane profile, load-board access, gate code, release document, or shipment record is accepted.

## Unique signer session

When a third-party provider is approved:

- never reuse a signer URL between carriers;
- never expose a reusable template-management URL;
- never place signer URLs or provider IDs in analytics, GitHub, screenshots, or public logs;
- apply appropriate expiration and authentication;
- create requests server-side only;
- use business email and/or verified SMS according to approved provider capability.

## Record retention

Retain in the approved private records system:

- completed immutable PDF and audit trail;
- document version and SHA-256;
- selected percentage and service model;
- carrier internal ID, legal name, MC/USDOT, and optional website;
- signer identity/title and approved delivery channel;
- provider request ID when applicable;
- created/viewed/signed/declined/expired/completed timestamps;
- countersignature status;
- sales owner and onboarding disposition.

GitHub contains implementation contracts only, never signer records.

## Status model

```text
DRAFT_REVIEW
LEGAL_APPROVED
READY_TO_ISSUE
SIGNATURE_REQUEST_CREATED
SENT
VIEWED
SIGNED_BY_CARRIER
COUNTERSIGNED
COMPLETED
DECLINED
EXPIRED
VOIDED
ONBOARDING_READY
```

Corrected terms create a new immutable version and request. Completed PDFs are never mutated.

## Cloudflare and preview boundary

Production provider/email credentials belong only in production secret storage. Preview environments are proven unable to access production signature bindings, recipient variables, email send bindings, contract registry, or records storage before activation.

## Safe fallback

Until approval:

- pages remain `noindex,nofollow`;
- v3 remains labeled attorney review;
- HTML/PDF/HTML review files remain available;
- the built-in signature flow produces a signed review packet only;
- Sales may use an approved manual provider process when legally authorized;
- the public CTA must not claim final execution.

## Production checklist

- [ ] Wisconsin transportation counsel approved final execution copy.
- [ ] Hermes approved commercial terms and allowed percentages.
- [ ] Master and Appendix A use one consistent model.
- [ ] New immutable approved PDF and SHA-256 published.
- [ ] `CARRIER_CONTRACT_ALLOWED_PERCENTAGES` configured in production only.
- [ ] Provider/authentication method approved when used.
- [ ] Email/SMS delivery policy approved.
- [ ] Preview/production binding isolation proven.
- [ ] Completed-document retention approved.
- [ ] Synthetic phone execution passed.
- [ ] Carrier and active internal recipients received matching documents.
- [ ] Rollback/disable procedure tested.

## Release classification

Until complete:

`EXECUTION_WORKFLOW_READY / PRODUCTION SIGNING NOT ACTIVATED`

After approval and verification:

`PRODUCTION E-SIGN VERIFIED`
