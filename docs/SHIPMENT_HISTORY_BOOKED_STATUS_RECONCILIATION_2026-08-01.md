# Shipment History `booked` status reconciliation — 2026-08-01

## Context

Issue #20 requires the internal lifecycle to distinguish:

1. `observed`
2. `booked`
3. `completed`
4. `verified`
5. `published`

Current `src/lib/load-import-preview.ts` already defines and tests the full five-state transition sequence. However, the lower-level Shipment History CSV importer in `src/lib/load-operations.ts` currently accepts only `observed`, `completed`, `verified`, and `published` as `proof_status` values.

## Verified gap

A sanitized or synthetic Shipment History row with `proof_status=booked` is rejected as an invalid status before it can enter the preview boundary.

This is a contract mismatch, not authorization to connect any live data source.

## Required safe implementation

A follow-up isolated runtime patch should:

- add `booked` to `RouteProofStatus`;
- accept `booked` in the CSV `proofStatus` parser;
- keep delivery-evidence requirements limited to `completed`, `verified`, and `published`;
- keep `booked` preview-only and non-public;
- preserve `PUBLIC_ROUTE_EXPORT_ENABLED = false`;
- add a fully synthetic regression proving a booked row is accepted without completion evidence;
- retain the existing regression proving `completed` is rejected without delivery evidence;
- run `npm run build`, `npm test`, and `npm run test:e2e`.

## Safety boundary

This document does not authorize:

- connection to `OFFICE 374 2026`;
- copying real shipment rows into fixtures;
- use of PII, company identities, MC/DOT, exact addresses, order IDs, invoices, BOL/POD, notes, rates, commissions, customer/broker/carrier identities, live positions, or credentials;
- automatic booking, status transitions, publication, provider calls, scraping, merge, or deployment.

Current load-board offers remain private observations and are not confirmed routes or public capacity.

## Coordination

PR #84 owns the separate date/freshness quarantine patch and is fully green on GitHub Actions run #391. The booked-status implementation should remain isolated from PR #84 to avoid parallel edits to its validated date logic.
