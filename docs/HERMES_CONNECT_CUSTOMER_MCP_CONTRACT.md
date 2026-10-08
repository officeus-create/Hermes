# Hermes Connect Adaptive MCP Contract V1.4.1

Status: the public unauthenticated MCP foundation is implemented in canonical PR #1738 and remains pre-merge/pre-production until exact-head CI and deployment/readback gates pass. Authenticated customer CRM access remains a design/implementation gate and is not claimed live.

## Goal

Make the customer experience technically real:

`customer installs Hermes Connect → authenticates to Hermes → plugin resolves exactly one allowed company/workspace → customer reads state or asks for a change → Hermes server authorizes the action → safe tenant changes receive audit/readback; shared-product changes become durable ChangeRequests`.

The MCP is an interface to the existing Hermes Connect backend and identity model, not a second CRM/backend.

## Authentication and tenancy

Production path:
- stable HTTPS remote MCP using Streamable HTTP;
- OAuth 2.1/OIDC-compatible account linking with verified identity; or
- a short-lived, one-time invitation that is exchanged server-side, consumed once, then replaced by the normal authenticated session.

Backend maps authenticated identity to:

`HermesIdentity → Membership → Company → Workspace → Role → Capabilities`.

Required rules:
- the model never infers authorization from prompt text;
- a typed email address is identity input, not authentication;
- an encrypted/obfuscated prompt string is not authentication;
- bearer/access-token checks and tenant authorization happen server-side for every request;
- expired/revoked membership or capability denies the action;
- customer identity never unlocks another tenant.

## Identity router

Every identity-sensitive workflow resolves the least-privileged server-authorized mode before returning private data or permitting a mutation:

- `HERMES_OWNER`
- `HERMES_STAFF`
- `CUSTOMER`
- `PROSPECT_DISCOVERY`
- `UNAUTHENTICATED`

For shared/production use, only validated Hermes credentials may select the first three. ChatGPT account metadata, prompt claims, names/emails, hidden/copied codes, locale/device/session hints or obfuscated strings may never elevate privilege.

## Discovery/context boundary

Unauthenticated/prospect users may receive business discovery and advisory help without a connected CRM. The system may use only relevant host-provided context, user-selected material and authorized connected sources. The MCP must not pull, reconstruct or persist complete raw ChatGPT history.

Action-first onboarding contract:
`PROBLEM → DESIRED OUTCOME → MINIMUM CONNECTOR SET → USER APPROVAL → RELEVANT SOURCE READ → MINIMUM INTAKE → CRM BOOTSTRAP PROMPT → BLUEPRINT → DURABLE PROVISIONING JOB WHEN AUTHENTICATED/AVAILABLE → READBACK`.

The host should surface its native Connect/Install approval control when supported. Connector recommendation is not authorization. If direct connection is unavailable, continue with a truthful advisory/blueprint path rather than blocking or pretending access.

## Provisioning tools and state

Planned authenticated tools:
- `create_provisioning_request`
- `get_provisioning_request`
- `start_provisioning_job`
- `get_provisioning_job`
- `cancel_provisioning_job` where allowed
- secure activation/invite exchange endpoints

Provisioning state:
`REQUESTED → IDENTITY_VERIFICATION → BLUEPRINTED → PROVISIONING → READY_FOR_OWNER → OWNER_CONFIRMED → ACTIVE`, with `NEEDS_INFO / BLOCKED / CANCELLED`.

A chat may claim background CRM work only when Hermes infrastructure has persisted a real job ID/state. Account activation must use verified passwordless/OAuth/passkey/magic-link/one-time-invite flow; predictable passwords and credentials in chat are prohibited.

## Product-learning boundary

Customer Workspace continuation data and reusable Hermes product learning are separate stores/contracts. A sanitized `ProductLearningEvent` may capture reusable problem/capability/failure/evidence/outcome/rule patterns when policy permits. It must not contain raw full chats, credentials, secrets, unnecessary identity/PII, private customer lists, notes or rates. Marketing reuse has a separate consent/rights gate.

## Read tools

- `whoami` — verified identity, memberships, current company/workspace, roles/capabilities.
- `get_workspace_context` — allowed modules, links, plan/status and privacy-safe stats.
- `get_capabilities` — server-authoritative capability registry for the authenticated workspace.
- `resolve_company` — dedupe by allowed identifiers; never return unauthorized tenants.
- `get_company_state` — canonical company/evidence states.
- `get_catalog_projection` — public projection state.
- `get_public_profile_state` — claim/owner-verification/public-consent/notification-consent state.
- `get_growth_summary` — tenant-scoped measured actions, qualified/won outcomes and attribution with explicit evidence/UNKNOWN state.
- `get_change_request` — request/status/release/readback.
- `list_change_requests` — only requests belonging to allowed company/workspace.
- `get_session_receipt` — bounded prior action/readback receipt.

## Tenant-safe write tools

- `upsert_company_profile` — allowed/idempotent business fields.
- `set_catalog_projection` — owner-confirmed evidence-safe public projection.
- `activate_workspace` — activate an already-supported vertical workspace.
- `update_workspace_config` — reversible supported configuration exposed by the capability registry.
- `record_touchpoint` — append/idempotent source/content/CTA history.
- `submit_growth_brief` — persist a customer Website/SEO/GEO/SMM/content/ads-readiness/reporting brief against the same Company/Workspace.
- `create_change_request` — durable request/status object.
- `append_change_request_context` — add clarification/evidence without overwriting history.
- `create_evidence_candidate` — internal evidence candidate, not publication.
- `create_distribution_draft` — draft + UTM, not unrestricted publishing.
- `write_session_receipt` — durable scoped audit/current state.

No write tool should accept an arbitrary company/workspace supplied by the model without resolving it against the authenticated memberships.

## Catalog/public-profile consent boundary

Catalog is a public presales projection, not a mirror of private CRM data.

Server-owned state must distinguish:
- claim state: UNCLAIMED / CLAIM_PENDING / CLAIMED / UNKNOWN;
- owner verification: UNVERIFIED / PENDING / VERIFIED / UNKNOWN;
- public-projection consent;
- owner/manager notification consent;
- measured-vs-unknown growth metrics.

Rules:
- public email/name does not prove ownership;
- no owner login/notification is created from inference;
- only allow-listed company facts may project publicly;
- customers, contacts, jobs/estimates, notes, credentials, private rates and internal evidence stay private;
- Catalog actions may create attributed CRM touchpoints through allowed tools, but action != qualified lead != sale != revenue;
- missing metrics remain UNKNOWN, never silently converted to 0;
- public-profile mutation and notification are separate capabilities/consents.

## Growth/reporting contract

The customer Growth Center may read only authenticated tenant-scoped measured data and request a durable Growth Brief.

A Growth Brief can cover Website, SEO/GEO/local/AI visibility, SMM/social, content, CTA/booking, reporting and advertising readiness. It must attach to the existing Company/Workspace.

Recommendation policy is organic/readiness first when product/offer/CTA/measurement or baseline evidence is not yet proven. The system does not guarantee rankings, leads or revenue.

## Change Broker

Customer change intent is routed through one server-side broker:

`authenticated request → company/workspace → role/capability → classification → mutation OR durable ChangeRequest → audit → readback/receipt`.

Primary classes:

- `TENANT_CONFIG_SAFE`
- `CONTENT_PROFILE_SAFE`
- `WORKFLOW_PREVIEW`
- `BUG`
- `PRODUCT_FEATURE`
- `ACCESS_SECURITY`
- `BILLING_LEGAL`

### Tenant-safe path

A request may mutate the customer workspace only when:
1. an explicit capability exists;
2. capability state is enabled for that workspace;
3. requester's role is allowed;
4. target is limited to the authenticated tenant;
5. requested fields/action are allow-listed;
6. required confirmation has been satisfied;
7. rollback/disable behavior exists where applicable.

After mutation:
- write audit event;
- read back the exact mutated state;
- write session receipt;
- return the bounded receipt to the customer.

### Product-change path

When the shared product lacks the requested reusable capability:
- do not patch shared code from the customer session;
- persist one `ChangeRequest`;
- dedupe semantically against existing open requests when possible;
- include acceptance criteria and business impact;
- route to the existing Product/Engineering owner;
- return `request_id` and current status;
- allow later customer status readback.

## Capability Registry

The server, not the prompt, owns the capability matrix.

Minimum capability fields:
- `capability_id`;
- `module`;
- `version/state`;
- `tenant_scope`;
- `effect`: read/write/workflow/request-only;
- `allowed_roles`;
- `confirmation_policy`;
- `allowed_fields/actions`;
- `required_evidence`;
- `readback_contract`;
- `rollback_or_disable`.

Default deny: absent capability means no direct mutation.

Existing supported vertical/workflow should be configured/reused before creating new product code.

## ChangeRequest is the system of record

The canonical request lives in Hermes Connect persistence.

Email, Telegram, Slack or other notification channels are optional delivery surfaces only. They may alert the team that a request exists, but they cannot be the sole state for the request.

Minimum `ChangeRequest` packet:
- `request_id`;
- `company_id`;
- `workspace_id`;
- `requester_id`;
- source/session;
- category;
- problem;
- desired outcome;
- current behavior;
- affected users;
- urgency;
- business impact;
- acceptance criteria;
- evidence refs;
- privacy/security notes;
- verification method;
- rollback/disable path;
- responsible owner/lane;
- status;
- timestamps/history.

Recommended status ladder:
- DRAFT
- SUBMITTED
- TRIAGED
- NEEDS_INFO
- ACCEPTED
- PLANNED
- IN_PROGRESS
- RELEASE_CANDIDATE
- RELEASED
- LIVE_VERIFIED
- CUSTOMER_CONFIRMED
- DUPLICATE
- REJECTED
- CLOSED

A notification send does not advance request status by itself.

## Internal/admin-only tools

- create/revoke invitation;
- approve/revoke business ownership or membership;
- role/capability administration;
- provider/social account administration;
- secret/token management;
- engineering/release routing;
- shared-product code/repository operations.

## Deliberately absent from customer scope

- arbitrary SQL;
- arbitrary filesystem/shell;
- cross-tenant search;
- secrets/token reads;
- internal One Brain;
- shared GitHub write/merge/deploy;
- unrestricted email/message/social publication;
- hard delete without dedicated recovery/retention contract;
- changing another user's role/permission;
- bypassing confirmation/audit/readback.

## Write invariants

Every mutation must:
1. authenticate;
2. resolve tenant/company/workspace from authenticated membership;
3. verify role/capability;
4. validate allowed action and field/evidence scope;
5. enforce confirmation policy;
6. use idempotency where appropriate;
7. create an audit event;
8. perform post-write readback;
9. create/return a bounded session receipt;
10. fail closed on authorization ambiguity.

## Cross-tenant denial tests

Before a real customer pilot, prove at minimum:
- company A cannot resolve/read company B private state;
- company A cannot pass company B IDs to write tools;
- revoked membership fails;
- role without write capability fails;
- request without required confirmation fails;
- unknown capability fails;
- public Catalog data does not leak private CRM fields;
- ChangeRequest list/status is tenant-scoped;
- prompt-injected tenant IDs do not bypass server scope.

## Release/adoption semantics

Do not tell the customer “done” from code or merge alone.

Evidence states stay distinct:

`CODED → EXACT_HEAD_CI_GREEN → MERGED → DEPLOYED → LIVE_VERIFIED → AUTHENTICATED_TENANT_READBACK → REAL_USER_USED → CUSTOMER_CONFIRMED → VALUE/BUSINESS_RESULT`.

Customer-facing release status must never claim a later state without evidence for that state.

## External customer pilot gate

Do not invite a real customer until:
- identity-router modes are derived from authenticated Hermes server state, not private-owner fallback;
- discovery flow has full-history overcollection negative tests;
- secure ProvisioningRequest/ProvisioningJob + passwordless activation are implemented;
- product-learning sanitization and opt-out/privacy policy are implemented;
- remote MCP endpoint exists and is HTTPS;
- OAuth/account linking exists;
- `whoami` + tenant scopes are proven;
- capability registry is server-authoritative;
- Catalog claim/owner verification/public-consent/notification-consent are server-authoritative;
- Growth Center metrics distinguish measured values from UNKNOWN;
- cross-tenant denial tests pass;
- no internal staff data/instructions are in the customer package;
- tenant writes have audit + readback + receipt;
- ChangeRequest persistence + owner routing works;
- shared code changes remain engineering-gated;
- revoke/rollback exists;
- one synthetic tenant journey passes end-to-end without privileged bypass.

Until this gate passes, the Customer package remains a preview and intentionally omits `mcp.json`.


## V1.4 public MCP implementation slice — 2026-10-07

The same review lane now contains the first real public MCP runtime at `/api/hermes-connect/mcp` instead of a documentation-only contract.

Current public tools:
- `get_product_overview`: public product truth and official Hermes links only;
- `recommend_start_path`: low-data business/CRM routing without claiming unreleased verticals;
- `build_crm_onboarding_plan`: connector-guided action plan, five-question unresolved-gap intake, ready CRM bootstrap prompt, authorization/continuity rules;
- `get_hermes_business_routes`: bounded routing across Connect/Technology, Marketing, Logistics and Academy;
- `get_product_learning_policy`: privacy-safe reusable-learning boundary;
- `submit_product_feedback`: explicit-consent, bounded, privacy-safe product learning only.

This initial endpoint is deliberately unauthenticated and public-data-only. It accepts no arbitrary private Company/Workspace identifier and has no private CRM read/write tool, so it does not weaken the future OAuth/tenant boundary.

Authenticated customer tools remain the next layer. When added, they must derive identity and tenant scope from validated server credentials on every call, preserve the Capability Registry/Change Broker model, and pass cross-tenant/role/revocation tests before becoming available.

Public plugin packaging must include this MCP from the first directory submission; do not publish a skills-only listing and try to attach MCP later.


## Cross-AI transport

The business contract is MCP-first, not vendor-forked. Hosts with remote/custom MCP support use the canonical Hermes endpoint. Other compatible AI hosts may call the same bounded operations through their native function/tool adapter. In every host:
- connection approval remains user/host controlled;
- server identity and tenant authorization remain authoritative;
- no secrets are requested in chat;
- no background CRM work is claimed without a persisted Hermes job ID/state.
