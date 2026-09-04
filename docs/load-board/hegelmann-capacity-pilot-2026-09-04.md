# Hegelmann USA capacity pilot — 2026-09-04

## Status

APPROVED SOURCE / LIVE-PILOT IMPLEMENTATION

This is the first source-rights evidence record for a real email-fed capacity surface in Hermes Load Board.

## Source

- Company: Hegelmann USA
- Source format: recurring daily `Truck list` email
- Provider path: connected Tina Bloom Gmail account
- Current source message pointer: Gmail message `1a06cc3b326821fe`
- Source timestamp: 2026-09-04T14:09:00Z
- MC shown by source: MC-1106753

No Gmail credential, token, password, raw MIME, or private mailbox secret is stored in this repository.

## Permission evidence

On 2026-09-04, after Hermes proposed converting the recurring truck-availability email into a structured Hermes Load Board / Hermes Connect capacity feed, Hegelmann COO Arthur Manek responded that:

1. public visibility of Hegelmann dispatcher contact information was acceptable for this pilot;
2. keeping the existing email format was preferred because it creates no additional work for Hegelmann;
3. Hegelmann is interested in a Load Board where available loads can be viewed and quotes can be submitted.

The permission is source-specific. It does **not** grant permission to expose contacts or raw email content from other brokers, carriers, shippers, marketplaces, or mailing lists.

## Public projection allowed for this source

- source attribution: Hegelmann USA
- equipment type
- current city/state
- ready / appointment time
- preferred destination or lane when supplied
- team status when supplied
- source last-updated time
- Hegelmann dispatcher email/phone associated with the listed capacity

Raw email bodies, signatures, unrelated conversation text, and non-operational personal data are not projected.

## First approved capacity snapshot

| Equipment | Current location | Preferred destination | Availability | Public contact |
| --- | --- | --- | --- | --- |
| Reefer | Farr West, UT | Chicago, IL | Ready 12 PM | Esarkauskas@hegelmann.us · 217-893-5294 |
| Dry Van | Williamsburg, VA | Open destination | Sunday · ready 4 PM | Felix@hegelmann.us · 217-636-3678 |
| Dry Van | Langhorne, PA | Open destination | Ready 12 PM | Eddy@hegelmann.us · 331-258-2655 |
| Dry Van | Dundalk, MD | Open destination | Ready 12 PM | Eddy@hegelmann.us · 331-258-2655 |

## Freshness / expiry rule

Capacity is not freight and must never be presented as a bookable load.

- same-day ready capacity expires after the operational day unless refreshed by a newer source message;
- explicitly future-dated availability may remain until the stated availability day ends;
- a newer source message should supersede or refresh matching capacity records;
- stale Hegelmann messages may be retained as private evidence/history but must not remain in the live capacity surface.

## Product boundary

Hermes Load Board should expose two distinct market concepts:

1. **Loads** — freight opportunities supplied by brokers/shippers/approved marketplaces.
2. **Available Trucks** — carrier capacity supplied by carriers/fleets such as Hegelmann USA.

Do not inflate the live load count with capacity records.

## Runtime implementation

The first proof uses an approved source-specific seed on `/load-board/live-pilot/` and merges it with `GET /api/load-board/active?type=capacity` every 30 seconds. This avoids making a new mailbox or OAuth architecture a launch blocker while preserving the D1 path for subsequent sources.

## Car Hauling policy

Separate standing rule as of 2026-09-04:

- Car Hauling ingestion, parsing, normalization, dedupe, expiry and display are allowed.
- Car Hauling broker outreach remains HOLD until the owner opens that gate.
- Existing broker relationships must not be disturbed.

## Next gate

1. Ship the approved Hegelmann capacity UI safely.
2. Keep scanning already connected mailboxes for current freight/lot lists.
3. Add only fresh, permission-safe freight as `record_type=load`.
4. Convert source-specific manual proofs to the shared intake/D1 pipeline as real recurring volume justifies it.
5. Do not manufacture live inventory from stale Central Dispatch history or preview fixtures.
