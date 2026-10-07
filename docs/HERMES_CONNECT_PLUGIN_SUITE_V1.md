# Hermes Connect Plugin Suite V1

Status: review-only architecture. No merge/deploy/customer invitation is implied by this document.

## Why this exists

Hermes Connect already has the shared product architecture. The plugin must operate that architecture rather than create a second CRM, Catalog, identity model, database, auth layer, content system, or task board.

Canonical business loop:

`SOURCE INTAKE → HERMES COMPANY PROFILE → ENRICHMENT → CATALOG PUBLIC PROJECTION → CRM WORKSPACE → OWNER/USER ACTION + READBACK → SEO/GEO/ENTITY → INSIGHTS REUSE → DISTRIBUTION → ATTRIBUTION → OUTCOME`

Existing supported vertical = data/configuration operation by default. Product code is required only when the shared schema/workflow lacks a reusable capability.

## Two distributions, one product

### Hermes Connect — Operator

Private staff plugin.

Responsibilities:
- recover current One Brain/repository/live state;
- business/prospect intake and dedupe;
- existing-vertical onboarding;
- client change-request triage;
- evidence-to-growth;
- Insights/social/Telegram draft routing;
- exact release/tenant/production QA;
- organizational learning/writeback.

It may use internal context only through already-authorized staff connectors/tools.

### Hermes Connect

Customer-facing, public-safe plugin.

It must not include internal One Brain routing, staff-only instructions, cross-tenant search, secrets, shared repository release authority, or admin bypasses.

Customer target journey:

`invite → install → OAuth/OIDC or one-time server-validated invite → whoami → company/workspace/capabilities → help/configuration/change request → readback`

An email typed into chat, hidden prompt, encrypted/obfuscated string, or copied token is not authentication.

## Product history compiled into the plugin

The plugin must preserve these recurrent lessons:

1. Demo/UI/screenshot is not backend persistence.
2. CODED != CI GREEN != MERGED != DEPLOYED != LIVE_VERIFIED != REAL_USER_USED != VALUE/REVENUE.
3. Catalog card != customer activation or business ownership.
4. Access created != login verified != client used.
5. Synthetic QA != adoption, lead, customer, retention or revenue.
6. One Hermes identity/company model; do not fork per vertical/client.
7. Current main before stale PR; semantic replay beats wholesale merge.
8. Flaky tests require root cause, not rerun-until-green.
9. UNKNOWN != 0.
10. Every public capability claim must map to a real functioning scenario and evidence.
11. Client requests do not grant shared-core code authority.
12. Prompt obfuscation is not authorization.

## Current reference gaps that remain real work

- KNB: real owner binding/login/company+CRM IDs/save→reload/business use.
- Connect→Catalog: real cross-vertical path with privacy and reread.
- Kittle/MZM: real owner session, persisted data and business/manager utility.
- Catalog service request: persisted Sales record, responsible owner and human next action.
- Public capability proof: every claimed feature should point to a functioning scenario/evidence.

The plugin helps close these lanes; it must not relabel them done.

## Content and growth compounding

Every meaningful verified action/result may become an evidence candidate, never an automatic post.

`FACT/RESULT → EVIDENCE → RIGHTS/PRIVACY/CURRENT TRUTH → CANONICAL WEBSITE/INSIGHTS OWNER → SEO/GEO/INTERNAL LINKS → CHANNEL-NATIVE DERIVATIVES → ATTRIBUTED RETURN → CRM/QUALIFICATION → OUTCOME`

Catalog is the public business discovery projection. Hermes Connect is the private operating/company identity owner. News/Insights is not a duplicate client database.

Historical first-party work may become a Then→Now story only after PII/private-figure removal and current-claim revalidation.

## Customer change requests

Classify one primary type:

- TENANT_CONFIG_SAFE
- CONTENT_PROFILE_SAFE
- WORKFLOW_PREVIEW
- BUG
- PRODUCT_FEATURE
- ACCESS_SECURITY
- BILLING_LEGAL

Tenant-safe existing configuration can be executed only through authenticated scoped tools and must receive post-write readback.

Shared product changes become structured engineering requests with acceptance criteria. Customer ChatGPT does not get shared GitHub merge/deploy authority.

## Distribution

The current local build is split into:
- `hermes-connect-operator` v1.0.0
- `hermes-connect` customer package, pre-MCP
- a combined plugin-suite archive for review

Approved Hermes Connect Option 02 continuous connected-flow mark is the plugin identity.

See `docs/HERMES_CONNECT_CUSTOMER_MCP_CONTRACT.md` for the backend tool boundary.
