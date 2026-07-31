# Codex current-main reconciliation — 2026-07-31

Tracking: Issue #20, draft PR #19

## Verified repository state

- `main` is the source of truth for implementation decisions.
- PR #7 is merged into `main`; the `#journey` anchor must not be reimplemented from stale branches.
- PR #9 remains open, draft, and non-mergeable. It must not be merged wholesale. Its remaining changes require file-by-file classification as superseded, useful to port, obsolete, conflicting, or evidence-gated.
- PR #19 remains open, draft, and non-mergeable. Its takeover handoff exists only on its branch and has not yet been reconciled onto current `main`.
- `docs/CODEX_CLAUDE_TAKEOVER_HANDOFF_2026-07-31.md` is present on PR #19's branch but absent from current `main`.

## Required next safe batches

### Batch A — public SEO resource revalidation

Revalidate, without duplicating pages:

1. Appleton vehicle transport.
2. Auction Vehicle Pickup Checklist.
3. Car Hauler Capacity Checklist.

For each record source path, canonical URL, sitemap inclusion, title, description, visible H1, schema, internal links, privacy review, direct-contact fallback, and test coverage.

### Batch B — Shipment History preview contract

Implement from current `main` on an isolated branch using synthetic fixtures only.

Required lifecycle states:

- `observed`
- `booked`
- `completed`
- `verified`
- `published`

No transition from `completed` or `verified` to `published` may occur automatically.

Preview output must include normalized city/state origin and destination, equipment, event date, freshness, provenance, lifecycle state, duplicate candidates, missing fields, privacy flags, quarantine reason, and proposed action.

### Batch C — privacy and quarantine tests

Tests must reject or quarantine:

- missing origin or destination;
- malformed dates;
- unknown equipment;
- conflicting lifecycle states;
- completed records without approved proof;
- PII or exact addresses in public-safe exports;
- unapproved company identity;
- stale observed offers;
- missing provenance;
- unsupported publication flags.

Raw source records must never be deleted automatically during deduplication.

### Batch D — private synthetic workspace

Build a read-only synthetic dispatcher/carrier workspace with filters, duplicate grouping, transparent metrics, quarantine review, and manual booking handoff. Public export and real-data connections remain disabled.

### Batch E — official-only integration research

Research only official provider documentation for DAT, Truckstop, Central Dispatch, Super Dispatch, Ship.Cars, and other approved providers. Record API/export/webhook/TMS support, authentication, commercial permission, limits, retention, redistribution, deletion requirements, and verification status. No scraping, credential collection, subscription purchase, or provider contact.

## Data boundary

`OFFICE 374 2026` is an internal structure example only. Do not connect it, copy real rows into fixtures, or expose names, phones, emails, companies, MC/DOT, exact addresses, orders, invoices, BOL/POD, notes, rates, commissions, customer/broker/carrier identities, live truck positions, or credentials.

Current load-board offers are private observations, not completed routes, public capacity, or publication evidence.

## Approval boundary

This reconciliation does not authorize merge to `main`, production deployment, DNS or Cloudflare changes, billing, secrets, real operational-data connections, destructive changes, or public communication.
