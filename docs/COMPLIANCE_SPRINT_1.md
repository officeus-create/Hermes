# Compliance Sprint 1 — US Privacy Baseline

Date: 2026-08-10

## Scope implemented

- expanded public Privacy Policy / Notice at Collection;
- public Privacy Choices & Requests route;
- public Company Information / contracting-entity boundary page;
- footer discovery links for Privacy Choices and Company Information;
- reusable TrustPage action support;
- data-governance release gate for new forms, analytics, advertising, payments, uploads, and international targeting;
- automated regression check for the public compliance layer.

## Existing control preserved

The main Hermes contact form already requires an explicit checkbox stating that Hermes may use submitted details to respond and links to the Privacy notice. Sprint 1 improves the disclosure behind that link rather than adding redundant consent controls without a legal or operational reason.

## Legal boundary

This sprint is a conservative engineering and disclosure baseline, not a determination that CCPA, GDPR, or any other specific privacy statute applies to every Hermes business or visitor. Applicability, response deadlines, opt-out mechanics, cookie consent, and service-specific contracting terms must be reviewed when the relevant business, audience, data flow, or payment model is activated.

## Primary-source basis

- Federal Trade Commission privacy/security guidance: inventory data, collect only what is needed, limit access, retain only for a legitimate need, securely dispose, and plan for incidents.
- California Attorney General / California privacy guidance: when CCPA applies, Notice at Collection must be provided at or before collection and disclose categories and purposes, with a link to the privacy policy and applicable sale/sharing choice information.

## Deferred to later sprints

- cookie consent manager and regional consent mode if non-essential tracking/ads are introduced;
- dedicated Global Privacy Control implementation if required by an applicable deployed processing activity;
- payment Terms of Sale, refund/cancellation, recurring billing disclosures;
- EEA/UK targeted-market privacy layer and transfer assessment;
- font/image/video/license inventory;
- service-provider/subprocessor register;
- workflow-specific retention schedule after live CRM/form architecture is finalized.
