# Hermes Connect Connector Runtime — Telegram Adapter #001

Status: review-only implementation foundation  
Date: 2026-09-16  
Contract: `1.0`

## Decision

Hermes Connect must not accumulate one-off integrations. The reusable primitive is **Hermes Connector Runtime**; Telegram is Adapter #001.

The runtime owns connection metadata, tenant/owner boundaries, source approval, normalized events/messages, idempotency, provenance, checkpoints, audit receipts, dead letters and future confirmation-gated writes. Provider adapters translate provider events into that common contract.

Existing Telegram Login and operational notification bots remain separate. They are not a knowledge connector and their credentials/data models must not be reused implicitly.

## Telegram v0.1 scope

Telegram is a private ingestion source, not the canonical Hermes brain. v0.1 is intentionally narrow:

- **read-only**;
- **owner-authored only**;
- no ambient group/channel corpus collection;
- live ingestion only from the configured owner's direct private chat with the bot, after the source is explicitly enabled;
- historical bootstrap only from Telegram Desktop JSON export messages whose `from_id` matches the configured owner;
- raw provider payload retention off by default;
- no automatic AI extraction;
- no outbound Telegram send/edit/delete;
- authenticated private retrieval/search only;
- connector revocation purges Telegram-derived messages, raw events, sources, verifier, derived knowledge, checkpoints/sync state and prior connection audit details, while keeping only a minimal revoked connection tombstone and sanitized purge receipt.

This restriction is deliberate. Current Telegram Bot Platform terms restrict data collection beyond what is essential and prohibit collection aimed at building AI products such as scraping public group/channel content. Telegram's Content Licensing / AI terms also impose explicit-consent requirements around AI use. Therefore the first Hermes release does **not** treat membership/admin rights in a group/channel as permission to vacuum that corpus into an AI system. Provider terms and applicable law must be re-reviewed before any broader mode is designed.

## Runtime data model

| Table | Purpose |
| --- | --- |
| `hc_connections` | Multi-tenant connection metadata / state |
| `hc_connection_verifiers` | One-way webhook verifier hashes |
| `hc_sources` | Explicit source enablement and scope |
| `hc_raw_events` | Idempotent provider receipts, minimized by default |
| `hc_messages` | Normalized private owner-authored message layer |
| `hc_sync_runs` | Import/sync execution receipts |
| `hc_checkpoints` | Incremental cursors/checkpoints |
| `hc_knowledge_items` | Future derived decision/task/idea/SOP candidates with provenance |
| `hc_audit_events` | Sanitized configuration/revoke receipts |
| `hc_dead_letters` | Future bounded retry queue |

## API surface

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/hermes-connect/connectors` | GET | Registry + authenticated owner's connections |
| `/api/hermes-connect/connectors/telegram/connection` | POST | Create private read-only owner-authored Telegram connection |
| `/api/hermes-connect/connectors/telegram/connection?connection_id=…` | DELETE | Revoke and purge Telegram-derived content |
| `/api/hermes-connect/connectors/telegram/sources` | GET/POST | List/configure owner-content sources |
| `/api/hermes-connect/connectors/telegram/webhook?connection_id=…` | POST | Secret-verified direct owner-message ingestion |
| `/api/hermes-connect/connectors/telegram/historical-import` | POST | Bounded owner-authored Desktop-export import |
| `/api/hermes-connect/connectors/telegram/messages` | GET | Private bounded retrieval/search |

The inbound webhook verifies `X-Telegram-Bot-Api-Secret-Token` against a stored SHA-256 verifier. The actual bot token is not needed by that handler and is not stored in connector config. Invalid verifier format fails before a connection row is persisted.

Historical import is capped at 200 messages per authenticated request. Large exports must be split into bounded chunks rather than raising the request ceiling.

## Connector gap map

| Connector / capability | Hermes decision |
| --- | --- |
| Telegram owner knowledge | **Adapter #001 — build first** |
| Google Drive | **Adapter #002 candidate — wrap existing connector with provenance/checkpoints; preserve Drive/approved One Brain source-of-truth rules** |
| Gmail | Wrap existing read/actions behind common registry and future confirmation wall |
| Google Calendar | Wrap existing actions behind common preview/confirm/audit contract |
| GitHub | Wrap execution/evidence; do not duplicate GitHub state into a second canonical database |
| Cloudflare / D1 | Controlled operational adapter for health/readback/approved operations; secrets remain external |
| ClickUp | Wrap task/evidence routing after P0 connector contract is proven |
| TMS / load boards / accounting / CRM / ATS / reviews | Do not build one-off adapters yet; add after 2–3 real adapters validate the SDK contract |
| Customer custom integrations | Productize Connector SDK + Registry/Marketplace after the contract is proven |

## Existing Hermes tasks this unblocks

The connector foundation maps directly to existing unfinished work around Telegram subsystem consolidation, Telegram knowledge organization, Digital CEO recovery of the owner's own decisions/tasks/ideas, and the connector map.

The next knowledge layer should classify only eligible imported owner content into **decision / task / idea / fact / SOP / commitment** candidates, preserve message provenance and require human acceptance before durable promotion into One Brain.

## SaaS direction

After Telegram plus two different adapter types are proven, Hermes Connect can expose a Connector Registry/Marketplace, self-service connect wizard, health/last-sync state, source controls, retries/dead letters, contract versioning, a customer Connector SDK, confirmation wall for writes, retention/delete/export controls, usage metering and private AI workflows over normalized customer-authorized data.

The intended product is **Hermes Connect as a business AI control plane**, not a collection of provider scripts.

## Live activation gates

No credentials or live Telegram configuration belong in this PR. Before activation:

1. resolve/verify the existing historical Telegram credential rotation/revocation blocker before reusing any old credential;
2. select or create the approved bot privately;
3. configure a fresh scoped webhook verifier privately;
4. deploy the accepted code through the normal release gate;
5. configure Telegram's webhook to the deployed endpoint;
6. explicitly enable the owner's direct bot chat as a source;
7. prove exactly one synthetic owner-authored direct message receipt and zero storage for a group/channel update;
8. verify private search and revoke+purge behavior;
9. only then import selected owner-authored history.

`MERGED != DEPLOYED != LIVE_VERIFIED`.

## Deferred by design

- ambient group/channel ingestion;
- third-party participant content ingestion;
- MTProto account-wide user sessions;
- outbound send/edit/delete;
- automatic AI extraction;
- connector marketplace UI redesign;
- automatic billing.

Any future expansion must begin with current provider-terms review, explicit consent/retention/deletion design, threat modeling and a separate bounded PR.
