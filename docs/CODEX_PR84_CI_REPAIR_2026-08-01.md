# Codex PR #84 CI repair — 2026-08-01

## Scope

Focused repair for GitHub Actions run #389 on draft PR #84.

## Failure observed

- `npm run build`: passed with 0 errors, 0 warnings, and 0 hints.
- Static validation reached `scripts/load-import-preview.test.mjs` and failed at the new invalid-calendar-date assertion.
- The test expected one accepted and one quarantined row, but received two accepted rows.

## Root cause

The new tests attempted to replace historical fixture values that are no longer present in the current synthetic CSV files:

- shipment replacements referenced `2026-07-01`, `2026-07-02`;
- offer replacements referenced `2026-07-29T18:00:00Z`.

Current fixtures use:

- shipment dates `2026-07-10`, `2026-07-12`, and `2026-07-13`;
- first offer expiry `2026-07-30T18:00:00Z`.

Because `String.replace` found no match, the unmodified valid CSV was passed to the preview adapter.

## Repair

Updated only the synthetic test substitutions:

- impossible calendar date now targets `2026-07-10`;
- reversed shipment chronology now changes second-row delivery `2026-07-13` to `2026-07-11` while pickup remains `2026-07-12`;
- malformed and reversed offer windows now target `2026-07-30T18:00:00Z`.

Runtime validation code, privacy boundaries, lifecycle behavior, adapter permissions, and public-export settings were not changed.

## Safety

No real shipment data, OFFICE 374 data, PII, companies, MC/DOT, addresses, orders, invoices, BOL/POD, notes, rates, commissions, identities, positions, credentials, scraping, provider calls, merge, or deployment.

## Verification state

A new GitHub Actions run is required for commit `efc19f610732bfc5a0674b165f1dda355589bfd7`. Do not claim the full build/static/unit/registry/Playwright suite is green until that run completes successfully.
