# Load Board source ingestion runtime gate — 2026-09-05

## Purpose

Track the remaining production dependency after canonical `/load-board/` is wired to the active D1 feed and Car Hauling ingestion is allowed.

## Current architecture

`approved source -> inbound email/API adapter -> parser -> D1 intake -> /api/load-board/active -> /load-board/`

The application code supports this path. The dedicated Cloudflare subdomain route is configured, but only fresh/permissioned messages may become active inventory; existing Gmail history is never automatically treated as live. Runtime readback on 2026-09-10 confirmed `LEAD_SERVICE_TOKEN` already exists on both the Hermes Pages project and `hermes-lead-email`, so the bridge may reuse that existing private service trust instead of requiring a second token.

Cloudflare Email Routing for the apex domain remains disabled/unconfigured and the apex MX remains Google Workspace (`smtp.google.com`). Do **not** enable or replace apex MX for Load Board ingestion.

On 2026-09-13 a dedicated Email Routing subdomain was onboarded instead: `loadboard.hermeslogisticsus.com`. Cloudflare reports the subdomain routing state as `ready`, while the apex Google Workspace MX is unchanged. The bounded routing rule sends only `loads@loadboard.hermeslogisticsus.com` to `hermes-lead-email`; catch-all remains disabled.

## Canonical inbound target

- Hermes intake target: `loads@loadboard.hermeslogisticsus.com`
- Worker: `workers/lead-email`
- Required runtime configuration:
  - `LOADBOARD_EMAIL_RECIPIENT`
  - `LOADBOARD_INGEST_URL`
  - `LOADBOARD_INGEST_TOKEN` (optional dedicated secret; never store in this file)
  - existing shared private `LEAD_SERVICE_TOKEN` may be used as the authenticated service fallback on both sides, avoiding a duplicate secret when the same Pages↔Worker trust boundary is used
  - `LOADBOARD_EMAIL_SOURCE_CONFIG`

## Known mailbox source status

Source-of-truth access status lives in `Hermes_Mailbox_Load_Source_Access_Registry_2026-09-04.xlsx` in the Hermes knowledge/library layer. Do not duplicate credentials into GitHub.

- `tina.bloom.truckload@gmail.com` — connected; Hegelmann truck/capacity feed confirmed.
- `officeus@hermeslogisticsus.com` — connected corporate identity; central intake target, not yet a proven high-volume freight feed.
- `volkogon.v@gmail.com` — connected personal legacy mailbox; do not ingest by default.
- `Mollyuniversaltruck@gmail.com` — legacy freight/agency mailbox; access/routing pending.
- `dispatchtruck998@gmail.com` — legacy dispatch mailbox; access/routing pending.
- `dispatchtruck3447@gmail.com` — historically important legacy dispatch mailbox; access/routing pending.
- `dmitriy.k.truckload@gmail.com` — Car Hauling source; ingestion allowed, broker outreach HOLD; access/routing pending.
- `dispatchtruck107@gmail.com` — legacy dispatch mailbox; access/routing pending.

## Non-negotiable safety split

- Car Hauling ingestion/display: ALLOWED when source permission and freshness gates pass.
- Broker outreach: HOLD.
- Automatic outbound: OFF.
- Capacity records must never inflate the load count.
- Unknown sources remain rejected/quarantined.
- Public visibility requires configured redistribution permission and authentication where required.
- Raw email bodies, credentials and private contacts never belong in the public D1 projection.

## Source expansion order

1. Connect/forward the approved legacy freight mailboxes into the Hermes intake path.
2. Backfill only fresh/unexpired messages or explicitly re-validated records; do not publish stale historical offers as live.
3. Add authorized marketplace adapters/API partnerships.
4. Keep source-specific proof and visibility (`public`, `carrier_only`, `internal_only`).
5. Deduplicate cross-posted loads by source message ID + normalized fingerprint.

## External marketplace integration principle

Public visibility on a third-party load board is not by itself redistribution authorization. Prefer official API/feed/partner integration, explicit source permission, or an authorized private carrier-side connector. Do not bulk-republish listings from a source unless its permission/contract allows it.

Known official integration paths already identified for follow-up include 123Loadboard, DAT, Truckstop, Central Dispatch and Super Dispatch. Credentials and commercial approvals remain outside source control.
