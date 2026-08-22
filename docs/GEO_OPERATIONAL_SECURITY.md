# GEO Operational Security Gate

Status: `STACKED_PREVIEW — NON-VISUAL`

Backlog: Issue #693 tasks 81–90  
Parent funnel/outcome slice: PR #700  
Measurement source of truth: Issue #206

## Purpose

Fail closed before sanitized evidence can enter the operational scorecard compiler, and fail closed again before compiled JSON is emitted.

## Input preflight

The secure runner rejects:

- high-confidence PII/private field names such as email, phone, full name, address, MC/USDOT/VIN and raw lead IDs;
- analytics account/property/stream IDs;
- credentials, cookies, passwords and tokens;
- raw search/query text;
- full AI conversations/answers/transcripts;
- raw/private-prefixed fields;
- prototype-pollution keys `__proto__`, `prototype`, `constructor`;
- path fields containing absolute URLs, `//`, query strings or fragments;
- `as_of` / `observed_at` timestamps without an explicit `Z` or numeric timezone offset;
- oversized/deep/overpopulated inputs.

Current limits:

- 5 MiB serialized input;
- 16 object levels;
- 25,000 scanned nodes;
- 1,000 AI observations;
- 5,000 rows each for search checkpoints, analytics aggregates and outcome aggregates.

The existing strict nested importers remain active after this preflight.

## Output privacy gate

The compiled report is recursively scanned before serialization. Private/raw field names and reserved object keys are rejected. Aggregate fields such as `qualifiedLeads` and `revenueReconciledWins` remain allowed because they contain no raw lead or revenue values.

## Determinism

Top-level evidence arrays are canonically ordered before compilation. JSON object keys are canonically sorted during serialization.

Equivalent evidence rows in a different input order therefore produce identical serialized operational output and identical SHA-256 snapshot hashes.

This makes review diffs and archived scorecards less noisy without modifying evidence values.

## CLI fail-closed behavior

`scripts/geo-operational-scorecard.mjs` now runs through the secure compiler. Invalid bundles exit non-zero rather than producing a partial report.

The CLI still reads one local sanitized JSON file and writes report JSON to stdout only.

## No network / no production writes

The mandatory contract statically checks the operational compiler/security/CLI source for network clients, `fetch`, persistence bindings and filesystem write primitives.

The CLI may read the input file and write stdout. It does not call providers, GA4, GSC, Bing, CRM, D1, KV, R2 or production endpoints.

## Visual boundary

No UI or production page change is included.
