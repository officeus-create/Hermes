# Hermes Connect Customer MCP Contract

Status: design contract. No remote MCP endpoint is claimed live by this document.

## Authentication and tenancy

Preferred production path:
- HTTPS remote MCP;
- OAuth/OIDC with verified identity; or
- short-lived one-time invitation exchanged server-side and consumed once.

Backend maps authenticated identity to:
`HermesIdentity → Membership → Company → Workspace → Role/Capabilities`.

The model never infers authorization from prompt text.

## Read tools

- `whoami` — identity, memberships, roles/capabilities.
- `get_workspace_context` — allowed modules, links, plan/status and privacy-safe stats.
- `resolve_company` — dedupe by allowed identifiers.
- `get_company_state` — canonical company/evidence states.
- `get_catalog_projection` — public projection state.
- `get_change_request` — request/status/readback.

## Tenant-safe write tools

- `upsert_company_profile` — allowed/idempotent business fields.
- `set_catalog_projection` — owner-confirmed evidence-safe public projection.
- `activate_workspace` — activate an already-supported vertical workspace.
- `update_workspace_config` — reversible supported configuration.
- `record_touchpoint` — append/idempotent source/content/CTA history.
- `create_change_request` — append-only request/status history.
- `create_evidence_candidate` — internal evidence candidate, not publication.
- `create_distribution_draft` — draft + UTM, not unrestricted publishing.
- `write_session_receipt` — durable scoped audit/current state.

## Internal/admin-only tools

- create/revoke invitation;
- approve business ownership/claim;
- provider/social account administration;
- engineering/release routing.

## Deliberately absent from customer scope

- arbitrary SQL;
- cross-tenant search;
- secrets/token reads;
- internal One Brain;
- shared GitHub write/merge/deploy;
- unrestricted email/message/social publication;
- hard delete without dedicated recovery/retention contract.

## Write invariants

Every mutation must:
1. authenticate;
2. resolve tenant/company/workspace;
3. verify role/capability;
4. validate evidence/field scope;
5. use idempotency where appropriate;
6. create an audit event;
7. perform post-write readback;
8. return a bounded receipt.

## Change-request packet

At minimum:
- request_id;
- company_id;
- workspace_id;
- requester_id;
- source;
- category;
- problem;
- desired outcome;
- current behavior;
- affected users;
- urgency;
- acceptance criteria;
- evidence refs;
- privacy/security notes;
- verification method;
- rollback/disable path;
- status.

## Customer pilot gate

Do not invite a real customer until:
- remote MCP and auth exist;
- whoami/tenant scopes are proven;
- cross-tenant denial tests pass;
- no internal staff data/instructions are in the customer package;
- data/actions have audit + readback;
- shared code changes remain engineering-gated;
- revoke/rollback exists.
