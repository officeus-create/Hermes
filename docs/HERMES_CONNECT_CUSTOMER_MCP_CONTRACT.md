# Hermes Connect Customer MCP Contract V1.1

Status: design contract. No remote MCP endpoint, real-customer authentication flow, or customer production readiness is claimed by this document.

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

## Read tools

- `whoami` — verified identity, memberships, current company/workspace, roles/capabilities.
- `get_workspace_context` — allowed modules, links, plan/status and privacy-safe stats.
- `get_capabilities` — server-authoritative capability registry for the authenticated workspace.
- `resolve_company` — dedupe by allowed identifiers; never return unauthorized tenants.
- `get_company_state` — canonical company/evidence states.
- `get_catalog_projection` — public projection state.
- `get_change_request` — request/status/release/readback.
- `list_change_requests` — only requests belonging to allowed company/workspace.
- `get_session_receipt` — bounded prior action/readback receipt.

## Tenant-safe write tools

- `upsert_company_profile` — allowed/idempotent business fields.
- `set_catalog_projection` — owner-confirmed evidence-safe public projection.
- `activate_workspace` — activate an already-supported vertical workspace.
- `update_workspace_config` — reversible supported configuration exposed by the capability registry.
- `record_touchpoint` — append/idempotent source/content/CTA history.
- `create_change_request` — durable request/status object.
- `append_change_request_context` — add clarification/evidence without overwriting history.
- `create_evidence_candidate` — internal evidence candidate, not publication.
- `create_distribution_draft` — draft + UTM, not unrestricted publishing.
- `write_session_receipt` — durable scoped audit/current state.

No write tool should accept an arbitrary company/workspace supplied by the model without resolving it against the authenticated memberships.

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

## Customer pilot gate

Do not invite a real customer until:
- remote MCP endpoint exists and is HTTPS;
- OAuth/account linking exists;
- `whoami` + tenant scopes are proven;
- capability registry is server-authoritative;
- cross-tenant denial tests pass;
- no internal staff data/instructions are in the customer package;
- tenant writes have audit + readback + receipt;
- ChangeRequest persistence + owner routing works;
- shared code changes remain engineering-gated;
- revoke/rollback exists;
- one synthetic tenant journey passes end-to-end without privileged bypass.

Until this gate passes, the Customer package remains a preview and intentionally omits `mcp.json`.
