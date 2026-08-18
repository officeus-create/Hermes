# GEO Operational Scorecard Runner

Status: `STACKED_PREVIEW — NON-VISUAL`

Parent implementation: PR #685  
Measurement source of truth: Issue #206

## Purpose

Turn reviewed, sanitized evidence exports into the existing Hermes GEO measurement contracts without editing TypeScript data fixtures by hand.

The runner is intentionally local/offline and has no provider, analytics, CRM, or production write access.

Input → strict import boundaries → exact-window adapters → canonical funnel reconciliation → 7/28/90 global scorecards → canonical-owner scorecards.

## Command

```bash
node --experimental-strip-types scripts/geo-operational-scorecard.mjs path/to/sanitized-input.json > geo-scorecard-report.json
```

The input file is capped at 5 MiB. The runner writes only JSON to stdout.

## Input contract

Top-level schema version:

`geo_operational_scorecard_v1`

Exact top-level fields:

- `schema_version`
- `as_of`
- `ai_visibility_evidence_class`
- `ai_observations`
- `search_checkpoints`
- `analytics_events`
- `outcomes`

Undeclared top-level fields are rejected.

Nested rows pass through the existing strict GEO import boundaries. Those boundaries reject undeclared/private fields and do not accept raw leads, names, emails, phones, companies, MC/USDOT, VINs, rates, messages, account/property/stream IDs, credentials, cookies, raw search queries, or full AI conversations.

## Search evidence

Exact search checkpoints are preserved honestly.

- exact 7 / 28 / 90-day rows may enter standard scorecards;
- any other interval stays in `heldSearchCheckpoints` with its real dates, counts, evidence class, window length, and reason;
- a non-standard export is never manufactured into a standard window.

A checkpoint ending after `as_of` is rejected.

## Analytics funnel

Sanitized analytics rows are grouped by:

`family × standard window × canonical journey owner`

Each group is passed through the canonical funnel adapter.

Ready carrier / vehicle-transport funnels enter measurement.

Incomplete groups remain in `incompleteFunnels` with missing events and registry gaps. Handoff is never substituted for receiver-confirmed delivery.

SEO and website-project families therefore remain incomplete while their canonical delivery event is not established.

## AI observations

AI observation rows pass through the existing sanitized observation importer.

Future observations relative to `as_of` are rejected. Synthetic fixture observations are not accepted by the operational import path unless they satisfy the governed import contract, and business measurement continues to exclude `synthetic` observations.

No full answer or conversation text is stored in the report.

## Output contract

Report schema version:

`geo_operational_scorecard_report_v1`

The report contains:

- ingestion counts;
- held non-standard search checkpoints;
- incomplete funnel diagnostics;
- global 7 / 28 / 90 scorecards;
- canonical-owner 7 / 28 / 90 scorecards and reconciliation status.

The report does not echo the original input bundle.

## Truth boundary

The runner compiles evidence; it does not create evidence.

Missing data remains missing. `unverified` remains unverified. A held 16-day export remains 16-day evidence. An incomplete funnel remains incomplete. No ranking, citation, traffic, lead, opportunity, win, or revenue claim is inferred from absence.

## Visual boundary

This slice has no UI and no production-page changes. It does not alter the CEO visual approval gate in Issue #665.
