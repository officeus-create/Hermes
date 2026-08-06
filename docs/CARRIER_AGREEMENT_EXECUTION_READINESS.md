# Carrier Agreement Portal — Production Execution Readiness

Status: CODE AND OPERATING CONTRACT READY / LEGAL DOCUMENT AND PROVIDER ACTIVATION REQUIRED  
Owner: Hermes Logistics  
Last updated: 2026-08-05

## Objective

Define the final production path from a qualified carrier to a uniquely issued, auditable electronic agreement without exposing reusable signer links, credentials, private onboarding documents, or production secrets in the public website or repository.

This document completes the implementation contract. It does not declare the current draft agreement legally approved and does not activate signing before the final document and provider are approved.

## Current repository implementation

The repository already provides:

- a private `noindex,nofollow` agreement-review page;
- versioned PDF and DOCX downloads;
- visible document version and PDF SHA-256;
- a provider-hosted e-sign feature flag through `PUBLIC_CARRIER_ESIGN_URL`;
- an honest request fallback when a hosted session is not configured;
- mobile and desktop browser coverage;
- an explicit prohibition on passwords, PINs, W-9s, CDL images, payment credentials, VIN lists, gate codes, release documents, and private shipment records through the public URL.

## Commercial document boundary

The current repository asset is a draft using a 5.00% fee. Hermes has stated an intended target of 8%, but the public execution workflow must not silently change the commercial term.

Before production signing is activated:

1. the final fee and all related payment language must be approved as one document version;
2. the agreement, Appendix A, and Limited Dispatch Authorization Addendum must use the same approved commercial model;
3. qualified Wisconsin transportation counsel must review the execution copy;
4. Hermes must publish a new immutable version ID and SHA-256;
5. the old draft must remain clearly marked as superseded or review-only;
6. no signer may receive a mixed set of 5% and 8% documents.

A user instruction to finish the software is not a substitute for legal approval of the agreement text.

## Required production workflow

### 1. Sales qualification

Logistics Sales confirms privately:

- legal company name;
- DBA, when applicable;
- authorized signer name and title;
- MC and/or USDOT;
- operating email and/or mobile number;
- signer authority;
- exact approved document version;
- fee and payment terms displayed in that version.

At least one approved signer delivery channel is required. The workflow may support business email, verified mobile/SMS, or both, depending on the approved e-sign provider. The public page must not require email when the selected provider legally and operationally supports verified SMS signing.

### 2. Server-side request creation

A trusted server-side service creates the signature request. The browser must never receive provider API credentials.

Required input:

```text
carrier_internal_id
legal_company_name
authorized_signer_name
authorized_signer_title
signer_email_optional
signer_mobile_optional
mc_optional
usdot_optional
document_version
document_sha256
sales_owner
```

Validation rules:

- at least one of signer email or verified signer mobile is present;
- the document version exists in the approved execution registry;
- the SHA-256 matches the approved registry entry;
- the request is unique to the carrier and signer;
- the request cannot be created from arbitrary public URL parameters;
- the request contains no passwords, payment credentials, W-9, CDL image, VIN list, gate code, release document, or private shipment record.

### 3. Unique signer session

The provider returns a unique request/session identifier and one-time or scoped signer URL.

Production rules:

- never reuse a signer URL between carriers;
- never place a reusable provider template-management URL on the public page;
- never put the signer URL in analytics;
- never expose the signer URL in Git history, issue comments, screenshots, or public logs;
- apply provider expiration and signer authentication appropriate to the approved risk level;
- the public review page may explain the process but must not generate a production signer session client-side.

### 4. Completion and record retention

After completion, retain in the approved private records system:

- completed immutable PDF;
- agreement version;
- PDF SHA-256;
- carrier internal ID;
- legal company name;
- authorized signer identity and title;
- approved delivery channel;
- provider request ID;
- creation, viewed, signed, declined, expired, and completed timestamps where available;
- provider audit certificate or equivalent audit trail;
- Hermes countersignature status when required;
- sales owner;
- onboarding disposition.

GitHub must contain only public-safe implementation contracts and aggregate status, never signer records or provider identifiers.

## Status model

Use these internal states:

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

Transitions must be append-only in the audit record. A corrected agreement creates a new version and request; it must not mutate a completed PDF.

## Provider adapter contract

The chosen provider adapter must expose server-side operations equivalent to:

```text
createSignatureRequest(input) -> request_id, signer_url_or_delivery_status
getSignatureRequestStatus(request_id) -> controlled status
cancelSignatureRequest(request_id, reason)
downloadCompletedAgreement(request_id) -> immutable PDF + audit trail
```

The adapter must support:

- unique requests;
- versioned document templates or uploaded immutable documents;
- business email and/or verified SMS delivery as approved;
- signer authentication appropriate to the agreement;
- completion webhooks or safe polling;
- downloadable completed documents;
- audit trail;
- request cancellation/voiding;
- data retention and deletion controls acceptable to Hermes.

## Cloudflare and secret boundary

Provider credentials belong only in approved server-side secret storage. They must not be stored in:

- Astro public environment variables;
- client JavaScript;
- GitHub source files;
- public Pages preview bindings;
- issue comments;
- analytics;
- URLs.

Until issue #226 proves preview/production binding isolation, production provider credentials and production signature creation must not be made available to pull-request previews.

## Safe fallback before provider activation

Until the final legal document and provider are approved:

- keep the page `noindex,nofollow`;
- show the version/hash of the review draft;
- allow PDF/DOCX review downloads;
- let Sales initiate a unique request manually through the approved Workspace/provider interface;
- accept a business email or verified mobile number privately according to provider capability;
- do not claim that clicking the public CTA signs or executes the agreement;
- do not remove `Draft for attorney review` from the current asset.

## Synthetic acceptance test

Use only a non-production test carrier and an approved test inbox/mobile number.

Required test sequence:

1. create a request for one exact approved document version;
2. verify no reusable public signer URL exists;
3. verify the recipient can open the session on a phone;
4. verify the displayed fee and terms match the approved PDF;
5. sign with synthetic test data;
6. verify both parties can obtain the same completed PDF;
7. verify the completed PDF hash is stable;
8. verify the audit trail includes the expected timestamps and signer channel;
9. verify no private signer value appears in analytics, URLs, GitHub, Pages preview logs, or browser source;
10. void/delete the synthetic request according to the approved retention rule.

## Production activation checklist

- [ ] Wisconsin transportation counsel approved the execution copy.
- [ ] Hermes approved the final fee and related commercial language.
- [ ] Agreement, Appendix A, and authorization addendum use one consistent version.
- [ ] Approved PDF/DOCX assets are published with new immutable version and SHA-256.
- [ ] E-sign provider and signer authentication method are approved.
- [ ] Email-only, SMS-only, or dual-channel delivery policy is approved.
- [ ] Server-side provider adapter is deployed with production-only secrets.
- [ ] Preview environments are proven unable to access production signature bindings.
- [ ] One synthetic end-to-end execution passed.
- [ ] Completed-document retention location and access policy are approved.
- [ ] Rollback/disable procedure is tested.
- [ ] Only then is the review-page draft boundary removed.

## Release classification

Until every production activation item is complete, use:

`EXECUTION_WORKFLOW_READY / PRODUCTION SIGNING NOT ACTIVATED`

After legal approval, provider activation, secret isolation, and the synthetic execution test, use:

`PRODUCTION E-SIGN VERIFIED`
