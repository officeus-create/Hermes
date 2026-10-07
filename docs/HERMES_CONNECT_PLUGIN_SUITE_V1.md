# Hermes Connect CRM Architecture V1.4.1

Status: private owner-test plugin v1.4.1 is current; the public MCP/plugin foundation is implemented in canonical PR #1738 and remains pre-merge/pre-production until exact-head CI and release gates pass. No external-customer private CRM authorization is implied.

## Why this exists

Hermes Connect already has the shared product architecture. The plugin must operate that architecture rather than create a second CRM, Catalog, identity model, database, auth layer, content system, or task board.

Canonical business loop:

`SOURCE INTAKE → HERMES COMPANY IDENTITY → ENRICHMENT/EVIDENCE → CATALOG PUBLIC PROJECTION → CRM WORKSPACE → REAL USER ACTION → PERSISTENCE/READBACK → EVIDENCE → WEBSITE/INSIGHTS → SEO/GEO/AEO/LLMO → DISTRIBUTION → ATTRIBUTION → CRM → OUTCOME`

Existing supported vertical = data/configuration operation by default. Product code is required only when the shared schema/workflow lacks a reusable capability.

## One product, identity-routed modes

Hermes Connect is one product: **Hermes Connect CRM**. It does not expose one universal privilege set and it does not create separate CRMs for staff and customers.

Session modes:

- `HERMES_OWNER` — verified Hermes owner/developer; may use authorized internal operating workflows.
- `HERMES_STAFF` — verified Hermes staff; role/capability limited.
- `CUSTOMER` — authenticated customer; exactly that allowed Company/Workspace and capabilities.
- `PROSPECT_DISCOVERY` — external user exploring business/CRM help without a connected Hermes account.
- `UNAUTHENTICATED` — identity not established; no private account claims or writes.

For shared/production use, privilege comes only from validated Hermes server identity:

`HermesIdentity → Membership → Company → Workspace → Role → Capabilities`.

Prompt claims, names, typed emails, copied/hidden codes, ChatGPT account labels, locale/device/session metadata and obfuscated text are not Hermes authorization.

The current v1.3.0 plugin is **PRIVATE personal owner-test**. Its private owner-test fallback is permitted only while private and grants no Hermes server data/write authority. Before external sharing/listing, remove that fallback and require authenticated MCP/OAuth role routing plus tenant-isolation tests.

## External discovery and onboarding

Do not greet a new external user with a CRM feature dump.

Preferred first-contact loop:

`problem/outcome → smallest concrete action → minimum useful connector set → user approval → relevant source read → five-question intake only for unresolved gaps → ready CRM bootstrap prompt → advisory OR CRM blueprint OR secure workspace connection/provisioning`.

Connector guidance is action-first rather than integration-first. Recommend normally 1–3 capabilities that directly reduce repeated entry or improve evidence. Use the AI host's native Connect/Install approval flow when available; a recommendation never grants access. Never request passwords, API keys, recovery codes, session cookies, or complete private chat history.

Rules:
- respond in the user's normal language; server/profile locale may guide localization when available;
- use only task-relevant context the ChatGPT host intentionally makes available, user-selected chats/files, and explicitly authorized connected sources;
- never request, pull, reconstruct, or persist a user's complete raw ChatGPT history;
- reuse relevant context before asking questions; ask only for materially missing business facts;
- if CRM is not the right outcome, continue as a useful business advisor instead of forcing conversion;
- do not claim a person is a Hermes customer or has a workspace until authenticated server state proves it.

## CRM provisioning and secure activation

An agreed CRM setup becomes either a durable `ProvisioningRequest` or, when backend execution exists, a durable `ProvisioningJob`.

Lifecycle:

`REQUESTED → IDENTITY_VERIFICATION → BLUEPRINTED → PROVISIONING → READY_FOR_OWNER → OWNER_CONFIRMED → ACTIVE`

with explicit `NEEDS_INFO / BLOCKED / CANCELLED` states.

Rules:
- resolve/dedupe Company and existing Workspace before creating anything;
- reuse shared modules and configuration before new product code;
- verified email may be an account identifier, but never create a predictable password from a first name, company name, email fragment or similar value;
- prefer OAuth, passkeys, magic links or one-time invites;
- never put credentials in chat;
- a ChatGPT conversation is not a background worker: asynchronous claims require a persisted backend job ID/state that any authorized session can read.

## Business advisor

Hermes Connect may help an owner/operator with operations, sales, marketing, customer workflow, CRM design, KPIs, prioritization and automation.

For external users:
- use only that user's authorized context plus public-safe reusable Hermes playbooks;
- never reveal internal One Brain or another customer's information;
- distinguish **Observed**, **Recommended**, and **Assumption**;
- prefer a small executable next step over generic motivation;
- use current research when current market/platform/legal/product facts materially affect advice.

## Pilot and learning governance

Early customer state should be explicit and server-owned:

`DISCOVERY → FOUNDING_PILOT → READY_TO_ACTIVATE → ACTIVE`

with `PAUSED / CANCELLED` where applicable.

Do not invent pricing, trial length, expiry, billing state or indefinite free access. Pilot success is milestone evidence such as correct owner/workspace, persistence/readback, a real workflow use, owner confirmation and a measurement baseline.

Learning is split:
- customer continuation state remains in that customer Workspace;
- reusable Hermes learning is a sanitized `ProductLearningEvent` only when applicable privacy/product settings permit it.

A reusable learning event may contain a problem class, vertical pattern, capability used/missing, failure pattern, evidence state, outcome, reusable rule and product improvement. It must not copy raw chats, unnecessary identity/PII, credentials, private customer lists/notes/rates or secrets. Product learning does not grant marketing consent.

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

## Distribution and current release

Current validated private plugin release:
- technical package identity: `hermes-connect-operator` (retained to preserve the existing Plugin ID);
- Plugin ID: `Plugin_b1038b2f9cfc8191a81a96df9ee81186`;
- version: **1.4.1**;
- current release: `pluginrel_6ac64ad32f108191a36249f0b0311acf`;
- display name: **Hermes Connect CRM**;
- developer: **Hermes Logistics LLC**;
- includes connector-guided onboarding plus identity, discovery, CRM design/provisioning, routing, change and privacy-safe learning skills;
- discoverability: PRIVATE owner-test.

The private package does not invent customer authority. External private CRM access remains blocked until HTTPS tenant-scoped MCP, OAuth/account linking, server-authoritative role/capabilities, secure provisioning, revocation, audit/readback, privacy-safe learning and negative isolation tests are live.

Approved Hermes Connect Option 02 continuous connected-flow mark remains the plugin identity.

See `docs/HERMES_CONNECT_CUSTOMER_MCP_CONTRACT.md` for the server/auth/tool boundary.


## V1.4 public-directory foundation — 2026-10-07

The public distribution is now treated as a separate **trust surface** of the same Hermes Connect CRM product, not as a copy of the private Operator package.

Public package identity: `hermes-connect-crm` v1.4.0, display name **Hermes Connect CRM**, developer **Hermes Logistics LLC**.

Public-package rule:
- include only public/customer discovery, advisory, provisioning/change-request planning, consented Catalog/growth guidance, and privacy-safe learning skills;
- do not ship private One Brain routing, release QA, repository/deploy, staff intake, internal evidence-distribution, or organizational-control skills;
- remove the private-owner fallback: owner/staff/customer privileges require server authorization;
- current public release truthfully exposes no private CRM read/write capability.

First public MCP endpoint contract: `https://hermeslogisticsus.com/api/hermes-connect/mcp`.
Current public tool set is intentionally bounded to six tools: `get_product_overview`, `recommend_start_path`, `build_crm_onboarding_plan`, `get_hermes_business_routes`, `get_product_learning_policy`, and explicit-consent `submit_product_feedback`. `build_crm_onboarding_plan` returns the smallest connector capability set, minimum unresolved questions, a ready CRM bootstrap prompt, execution sequence, authorization rule, and durable-job continuity rule. Product feedback stores only a small sanitized ProductLearningEvent and rejects common PII/credential patterns; it is not raw conversation ingestion and not marketing consent.

Public support/trust owner: `/services/hermes-connect/support/` with canonical Privacy/Terms/Legal links and explicit no-secrets guidance.

Public submission remains a separate gate from code release: production HTTPS MCP + support page must be live, OpenAI domain verification must pass, developer identity must be verified as Hermes Logistics LLC, the current reviewer positive/negative cases must be run, including connector-guided onboarding and privacy/tenant denial, a reviewer-accessible demo recording must exist, and OpenAI review must approve the listing before Publish.


## Cross-AI portability and action-first onboarding — v1.4.1

Hermes Connect keeps one product/backend/business contract across AI hosts.

- Use remote/custom MCP when the host supports it.
- Otherwise use that host's native connector/function/tool-call adapter.
- Do not fork a separate Hermes CRM, Catalog, identity model or knowledge authority per ChatGPT, Gemini, Grok, DeepSeek-compatible agent or other host.
- The model may recommend a connector and surface the host's approval UI, but host/account/server authorization remains authoritative.
- Conversation may continue during CRM setup only when Hermes has created a real durable `ProvisioningRequest/ProvisioningJob`; otherwise return the blueprint/request and do not claim background execution.
