# Load Board source ingestion runtime gate — 2026-09-05

## Purpose

Track the remaining production dependency after canonical `/load-board/` is wired to the active D1 feed and Car Hauling ingestion is allowed.

## Current architecture

`approved source -> inbound email/API adapter -> parser -> D1 intake -> /api/load-board/active -> /load-board/`

The application code now supports this path. Production still needs actual source routing and runtime configuration; existing Gmail history is not automatically backfilled by the Cloudflare inbound-email worker.

## Canonical inbound target

- Hermes intake target: `loads@hermeslogisticsus.com`
- Worker: `workers/lead-email`
- Required runtime configuration:
  - `LOADBOARD_EMAIL_RECIPIENT`
  - `LOADBOARD_INGEST_URL`
  - `LOADBOARD_INGEST_TOKEN` (secret; never store in this file)
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
