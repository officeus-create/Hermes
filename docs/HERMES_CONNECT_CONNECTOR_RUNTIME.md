# Hermes Connect Connector Runtime — Telegram Adapter #001

Status: implementation foundation / review-only feature branch  
Date: 2026-09-16  
Contract version: `1.0`

## 1. Decision

Hermes Connect must not accumulate one-off integrations. The reusable product primitive is **Hermes Connector Runtime**; Telegram is Adapter #001.

The runtime owns the common contract for authentication boundaries, source approval, ingestion, idempotency, provenance, checkpoints, audit, retries/dead letters, private search and future confirmation-gated writes. Provider adapters only translate provider-specific events into that contract.

This turns the first internal need — recovering Hermes knowledge from Telegram — into a product primitive that can later support customer connectors without rebuilding the integration layer each time.

## 2. Existing Telegram code is not the connector

The repository already has Telegram login and operational Telegram notifications. Those flows remain unchanged. They authenticate users or send bounded notifications; they do not ingest Telegram history into a searchable Hermes Connect knowledge source.

The connector lives under:

- `functions/api/hermes-connect/connectors/`
- `functions/api/_lib/connector-runtime.mjs`
- `functions/api/_lib/telegram-connector.mjs`

Do not merge Telegram Login and Telegram Knowledge Connector credentials, data models or responsibilities.

## 3. Product model

### Control plane

Hermes Connect stores connection metadata, source approvals, consent scope, mode, health state and audit receipts.

### Data plane

Approved provider events become normalized private messages with stable provider provenance. Unknown or disabled sources are ignored by default.

### Knowledge plane

`hc_knowledge_items` is reserved for later task/decision/idea/SOP extraction. v0.1 deliberately does **not** auto-send imported Telegram content to an AI provider. The ingestion boundary must be proven first; knowledge extraction becomes a separate, consent-aware consumer.

### Source-of-truth rule

Telegram remains the source of the original Telegram message. Hermes Connect stores a private normalized working copy and provenance for retrieval/automation. It does not silently rewrite the original Telegram source.

## 4. Runtime tables

| Table | Purpose |
| --- | --- |
| `hc_connections` | Multi-tenant connection metadata and health state |
| `hc_connection_verifiers` | One-way webhook verifier hashes only |
| `hc_sources` | Explicitly approved chats/channels and consent scope |
| `hc_raw_events` | Idempotent provider event receipts; minimized by default |
| `hc_messages` | Searchable normalized private message layer |
| `hc_sync_runs` | Import/sync execution receipts |
| `hc_checkpoints` | Incremental cursor/checkpoint state |
| `hc_knowledge_items` | Future derived decisions/tasks/ideas/SOPs with provenance |
| `hc_audit_events` | Configuration/import/revoke audit trail |
| `hc_dead_letters` | Future bounded retry queue for failed provider events |

Every customer-facing extension should retain `tenant_id`, `owner_specialist_id`, `connection_id` and provider/source IDs. Do not build a single-owner Telegram schema that later requires a migration to become SaaS.

## 5. Telegram Adapter #001

### Historical bootstrap

Supported input: bounded chunks from Telegram Desktop JSON export.

Default policy: `owner_authored_only`.

Alternative policy: `approved_sources`, but the source itself must already be enabled in Hermes Connect and use either:

- `owner_content` — content owned/authored by the connecting owner; group content is still restricted to the configured owner identity, while an explicitly approved owner channel may ingest its channel posts;
- `explicit_opt_in` — the source has an explicit opt-in basis for ingestion.

Each request is capped at 200 messages. A future private uploader should split large exports client-side or through a bounded worker; do not raise the API request limit just to accept an entire account dump.

### Live sync

Supported transport: Telegram Bot API webhook.

Security contract:

1. connection is created inside an authenticated Hermes Connect session;
2. owner explicitly approves each Telegram source;
3. webhook receives `connection_id`;
4. `X-Telegram-Bot-Api-Secret-Token` is verified against a stored SHA-256 verifier;
5. unknown/disabled/non-consented sources return HTTP 200 but are not stored;
6. accepted messages use Telegram update/message IDs for idempotency;
7. secrets are never echoed and must not be stored in `config_json`;
8. successful first ingestion promotes the local connection state to `active`.

The Bot API token itself is not required by the inbound webhook handler. Setting or rotating the real bot token/webhook is an external credential/configuration action and remains a separate owner-confirmed activation step.

### Private retrieval

Authenticated endpoint supports bounded latest-message retrieval and text search. It is not public, is `no-store`, and does not send search terms or message content to analytics.

### Outbound actions

Disabled in v0.1. Telegram sending/editing/deleting must not be added until Hermes Connect has the shared preview → changeset → confirm/cancel wall defined in the Master Brief.

## 6. Privacy / compliance defaults

The connector is intentionally stricter than a generic Telegram account vacuum:

- no implicit discovery-and-ingest of every chat;
- no account-wide MTProto user session in v0.1;
- no plaintext session export, bot token or webhook secret in D1 config, logs or Git;
- unknown sources denied;
- raw provider payload retention off by default;
- historical import bounded and authenticated;
- AI extraction not automatically triggered by ingestion;
- provenance stays attached so a derived item can later point back to its source.

A future MTProto adapter may be useful for account-wide history, but it is a separate advanced connector requiring security review, provider-policy review, explicit user consent design, credential rotation/revocation and a clear retention/deletion contract.

## 7. API surface introduced

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/hermes-connect/connectors` | GET | Connector registry + authenticated owner's connections |
| `/api/hermes-connect/connectors/telegram/connection` | POST | Create a private read-only Telegram connection |
| `/api/hermes-connect/connectors/telegram/connection?connection_id=…` | DELETE | Revoke the connection locally |
| `/api/hermes-connect/connectors/telegram/sources` | GET/POST | List or explicitly configure approved sources |
| `/api/hermes-connect/connectors/telegram/webhook?connection_id=…` | POST | Secret-verified Telegram Bot API ingestion |
| `/api/hermes-connect/connectors/telegram/historical-import` | POST | Bounded authenticated Telegram Desktop chat import |
| `/api/hermes-connect/connectors/telegram/messages` | GET | Private bounded search/retrieval |

No route in this package deploys a bot, changes Telegram configuration, sends a Telegram message or writes back to Telegram.

## 8. Connector gap map

This is the current architectural classification, not a claim that every provider lacks a third-party integration globally.

| Connector / capability | Current Hermes situation | Decision |
| --- | --- | --- |
| Telegram knowledge/history | Login + notifications exist; no unified knowledge ingestion runtime | **BUILD NOW — Adapter #001** |
| Google Drive | Connected source already exists; One Brain is a source-of-truth layer | **WRAP NEXT** with shared provenance/checkpoint contract; do not duplicate Drive data blindly |
| Gmail | Connected capability exists | **WRAP** read/actions behind common runtime and future confirmation wall |
| Google Calendar | Connected capability exists | **WRAP** with common action preview/confirmation/audit |
| GitHub | Connected and already central to execution | **WRAP** execution/evidence into the same registry rather than creating another GitHub database |
| Cloudflare / D1 | Hermes runtime depends on it; operational/account actions are sensitive | **BUILD CONTROLLED ADAPTER** for health/readback/approved operations; keep secrets external |
| ClickUp | Current task system connector exists separately | **WRAP AFTER P0** so Hermes Completion Architect can route task evidence consistently |
| Business vertical systems (TMS, load boards, accounting, CRM, ATS, review platforms) | Mixed APIs, paid limits and provider-specific gaps | **DO NOT one-off build yet**; implement only after Adapter #001 proves the SDK/registry contract |
| Generic customer custom connector | Not yet packaged | **PRODUCTIZE** as Connector SDK + registry after 2–3 real adapters validate the abstraction |

## 9. What this unlocks for existing Hermes tasks

The connector foundation directly supports four existing unfinished workstreams:

1. Telegram components can become one controlled subsystem rather than duplicate bots/scripts.
2. Telegram groups/channels can be explicitly registered and searchable instead of becoming lost history.
3. Digital CEO can recover owner-authored decisions/tasks/ideas from an approved source with provenance.
4. The connector map becomes executable architecture rather than a list of vendor links.

The next product layer should classify approved messages into **decision / task / idea / fact / SOP / commitment** candidates, always preserving source provenance and human acceptance before promotion into durable One Brain memory.

## 10. Customer SaaS direction

After Telegram + one existing connector wrapper + one operational connector are proven, Hermes Connect should expose:

- Connector Registry / Marketplace;
- self-service connect wizard;
- per-connection health and last-sync state;
- source/consent controls;
- event volume and retry observability;
- schema/contract versioning;
- customer-specific connector SDK;
- confirmation wall for writes;
- retention/delete/export controls;
- usage metering by active connection, synchronized event and confirmed action;
- private AI workflows that consume normalized data without making third-party apps the canonical Hermes memory.

This is the scalable product: **Hermes Connect as the business AI control plane**, not a collection of scripts.

## 11. Activation gates

This code package can be reviewed/merged without credentials. Live Telegram activation still requires all of the following outside the PR:

1. resolve/verify the repository's existing historical Telegram credential rotation/revocation blocker before reusing any old credential;
2. create or select the approved Telegram bot;
3. configure a new scoped webhook secret privately;
4. configure the Bot API webhook to the deployed Hermes Connect endpoint;
5. explicitly approve the first source in Hermes Connect;
6. send one synthetic owner-authored message;
7. prove exactly one normalized message receipt and no storage for one unapproved source;
8. verify private search and revoke behavior;
9. only then enable historical import for selected chats.

`MERGED != DEPLOYED != LIVE_VERIFIED` applies here.

## 12. Deferred by design

- UI redesign / connector marketplace visuals — route to the active Hermes Connect design owner after backend contract acceptance.
- MTProto account-wide session — advanced privacy/security/provider-policy workstream.
- outbound Telegram send/edit/delete — waits for shared confirmation wall.
- AI auto-extraction — waits for consent-aware knowledge promotion contract.
- automatic billing — waits for two or more proven customer connector use cases and usage evidence.
