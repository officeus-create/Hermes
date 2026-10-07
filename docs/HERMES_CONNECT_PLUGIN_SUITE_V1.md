# Hermes Connect Plugin Suite V1.2

Status: review-only architecture + installable package contract. No merge, deployment, customer invitation, or live remote MCP is implied by this document.

## Why this exists

Hermes Connect already has the shared product architecture. The plugin must operate that architecture rather than create a second CRM, Catalog, identity model, database, auth layer, content system, or task board.

Canonical business loop:

`SOURCE INTAKE → HERMES COMPANY IDENTITY → ENRICHMENT/EVIDENCE → CATALOG PUBLIC PROJECTION → CRM WORKSPACE → REAL USER ACTION → PERSISTENCE/READBACK → EVIDENCE → WEBSITE/INSIGHTS → SEO/GEO/AEO/LLMO → DISTRIBUTION → ATTRIBUTION → CRM → OUTCOME`

Existing supported vertical = data/configuration operation by default. Product code is required only when the shared schema/workflow lacks a reusable capability.

## Two distributions, one product

### Hermes Connect — Operator

Private staff plugin.

Responsibilities:
- recover current One Brain/repository/live state without restarting solved analysis;
- business/prospect intake and dedupe;
- existing-vertical onboarding;
- client self-service classification;
- customer change-request triage;
- evidence-to-growth;
- Insights/social/Telegram draft routing;
- exact release/tenant/production QA;
- organizational learning/writeback.

It may use internal context only through already-authorized staff connectors/tools.

Current package candidate: `hermes-connect-operator` v1.2.0.

### Hermes Connect — Customer

Customer-facing, public-safe plugin.

It must not include internal One Brain routing, staff-only instructions, cross-tenant search, secrets, shared repository release authority, or admin bypasses.

Customer target journey:

`invite/account link → install → OAuth 2.1/OIDC or one-time server-validated invite exchange → whoami → company/workspace/capabilities → help/configuration/change request → audit + readback`

An email typed into chat, hidden prompt, encrypted/obfuscated string, copied token, or “secret code” is not authentication.

Current package state: Customer Preview v0.3.0. It intentionally has no live MCP endpoint and is not approved for real-customer installation.

## Change Broker — the core customer-change architecture

Every customer request enters one bounded decision layer:

`CUSTOMER CHATGPT → authenticated MCP → HermesIdentity/Membership → Company/Workspace → Change Broker → Capability Registry`

The Change Broker classifies exactly one primary path:

1. **TENANT_CONFIG_SAFE / CONTENT_PROFILE_SAFE**
   - capability already exists;
   - caller role is allowed;
   - change is tenant-scoped and reversible;
   - server performs mutation;
   - audit event is written;
   - post-write readback proves the new state;
   - customer receives a receipt.

2. **WORKFLOW_PREVIEW**
   - prepare a proposed configuration/workflow;
   - do not mutate shared product code;
   - require the capability's confirmation rule before activation.

3. **BUG / PRODUCT_FEATURE**
   - persist a structured `ChangeRequest`;
   - route to the existing Hermes engineering owner/lane;
   - preserve acceptance criteria, evidence, verification and rollback;
   - customer can later read request/release status.

4. **ACCESS_SECURITY / BILLING_LEGAL**
   - fail closed for ordinary self-service;
   - route to the authorized human/admin owner.

A customer request never grants shared-core GitHub, merge, deploy, arbitrary SQL or cross-tenant authority.

## Email and messaging are notifications, not the system of record

When a customer asks for a product change, the canonical object is the persisted Hermes Connect `ChangeRequest`.

Email, Telegram, Slack or other messages may notify the team about that request, but must not be the only record of:
- request identity;
- customer/workspace;
- status;
- acceptance criteria;
- owner;
- release evidence;
- customer confirmation.

This prevents lost requests, duplicate work and status drift.

## Capability Registry — reuse first

Before creating code, the server resolves whether the requested behavior already exists as a reusable capability.

A capability record should expose at minimum:
- `capability_id`;
- module;
- state/version;
- tenant scope;
- effect (`read`, `write`, `workflow`, `request-only`);
- allowed roles;
- confirmation policy;
- required evidence;
- readback contract;
- rollback/disable path.

Decision rule:

`EXISTING CAPABILITY → tenant configuration/data`

`MISSING REUSABLE CAPABILITY → product ChangeRequest`

Never hard-code a new product fork just because one client phrases a request differently.

## Canonical IDs and data ownership

Use one identity graph, with explicit projections:

- `company_id` — canonical private business identity owner;
- `workspace_id` — CRM tenant/workspace;
- `catalog_profile_id` — public Catalog projection;
- `change_request_id` — durable customer/product request;
- `evidence_id` — verified proof object/candidate;
- `insight_id` — public/content projection when justified;
- `touchpoint_id` — attributed source/distribution/customer interaction.

Catalog is a public discovery projection, not a second CRM.
Insights/News is a verified knowledge/distribution projection, not a second client database.
Hermes Connect remains the private operating/company identity owner.

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
13. Notification delivery != persisted request/state.
14. A requested “small change” is safe only when a server capability explicitly permits it.

## Release/adoption evidence ladder

Never collapse the following into one status:

`CODED → EXACT_HEAD_CI_GREEN → MERGED → DEPLOYED → LIVE_VERIFIED → AUTHENTICATED_TENANT_READBACK → REAL_USER_USED → CUSTOMER_CONFIRMED → VALUE/BUSINESS_RESULT`

A later state requires dated evidence for that state. UNKNOWN remains UNKNOWN.

## Current reference gaps that remain real work

- KNB: real owner binding/login/company+CRM IDs/save→reload/business use.
- Connect→Catalog: real cross-vertical path with privacy and reread.
- Kittle/MZM: real owner session, persisted data and business/manager utility.
- Catalog service request: persisted Sales/request ID, responsible owner and human next action.
- Public capability proof: every claimed feature should point to a functioning scenario/evidence.

The plugin helps close these lanes; it must not relabel them done.

## Catalog as a presales mini-site and Growth Center

Catalog is not merely a directory. It is a consented public **presales projection and action surface** backed by the same canonical Company/Workspace.

Required contract:
- preserve one `company_id`, one workspace relationship and one stable public profile identity/URL;
- distinguish `UNCLAIMED / CLAIM_PENDING / CLAIMED / UNKNOWN` and verified-owner state;
- do not create owner access or owner notifications from a guessed/public email;
- public projection contains only safe company facts allowed by explicit server-side consent/capability;
- private CRM contacts, customers, estimates/jobs, private notes, credentials and private commercial fields never leak into Catalog/News;
- call/form/booking/website/CTA actions return to the existing CRM/touchpoint layer with provenance/UTM/idempotency;
- an action event is not automatically a qualified lead, sale or revenue;
- owner/manager notifications require verified identity plus notification consent;
- weekly/monthly reporting preserves funnel stage and evidence state; missing metrics stay UNKNOWN rather than 0.

Customer self-service includes a tenant-scoped **Growth Brief** for Website, SEO/GEO/Local/AI visibility, SMM/social, content, CTA/booking and advertising readiness. It is attached to the same Company/Workspace; do not create a second marketing CRM.

Recommendation guard:

`PRODUCT/OFFER/CTA + MEASUREMENT + ORGANIC BASELINE → PAID AMPLIFICATION`

Paid advertising does not repair an unproven funnel and must not be recommended solely because an ad channel exists. No rankings/leads/revenue guarantee.

## Customer Growth Center

When authenticated MCP exists, the customer-facing plugin may show only server-supplied tenant data:
- CRM/workspace state;
- Catalog claim/owner-verification/public-consent state;
- measured Catalog actions;
- qualified/won outcomes only when that evidence exists;
- Website/SEO/GEO/Insights/social activity and attribution when available;
- durable change-request status.

The Customer Preview must say UNKNOWN rather than fabricate missing metrics. It must respect workspace/profile locale supplied by Hermes Connect rather than infer language from the prompt alone.

## Content and growth compounding

Every meaningful verified action/result may become an evidence candidate, never an automatic post.

`FACT/RESULT → EVIDENCE → RIGHTS/PRIVACY/CURRENT TRUTH → CANONICAL WEBSITE/INSIGHTS OWNER → SEO/GEO/INTERNAL LINKS → CHANNEL-NATIVE DERIVATIVES → ATTRIBUTED RETURN → CRM/QUALIFICATION → OUTCOME`

Historical first-party work may become a Then→Now story only after PII/private-figure removal and current-claim revalidation.

## Customer change-request classes

Use one primary category:

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

Current validated local build:
- `hermes-connect-operator` v1.1.0 — private staff candidate;
- `hermes-connect` Customer Preview v0.2.0 — hold for MCP/auth;
- combined Plugin Suite v1.1.0 — review bundle.

Approved Hermes Connect Option 02 continuous connected-flow mark is the plugin identity.

The customer package intentionally omits `mcp.json` until a real HTTPS tenant-scoped remote MCP endpoint exists. Do not ship a placeholder endpoint just to make the package look complete.

See `docs/HERMES_CONNECT_CUSTOMER_MCP_CONTRACT.md` for the server/auth/tool boundary.
