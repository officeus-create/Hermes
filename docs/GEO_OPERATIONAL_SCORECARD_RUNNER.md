# GEO Operational Scorecard Runner

Status: `STACKED_PREVIEW — NON-VISUAL`

Parent implementation: PR #685  
Measurement source of truth: Issue #206  
Autonomous execution backlog: Issue #693

## Purpose

Turn reviewed, sanitized evidence exports into the existing Hermes GEO measurement contracts without editing TypeScript data fixtures by hand.

The runner is intentionally local/offline and has no provider, analytics, CRM, or production write access.

Input → strict import boundaries → exact-window adapters → duplicate guards → canonical funnel reconciliation → evidence freshness/provenance → 7/28/90 global scorecards → canonical-owner readiness/coverage.

## Command

```bash
node --experimental-strip-types scripts/geo-operational-scorecard.mjs path/to/sanitized-input.json > geo-scorecard-report.json
```

The input file is capped at 5 MiB. The runner writes only JSON to stdout.

## Input contract

Top-level schema version:

`geo_operational_scorecard_v2`

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

Analytics and private outcome rows now require `observed_at`. This timestamp is evidence provenance only; it is not a user-level timestamp and must not contain private identifiers.

## Evidence time and freshness

Evidence class and freshness remain separate dimensions.

Freshness states:

- `fresh`
- `aging`
- `stale`
- `undated`
- `unverified`
- `missing`

A stale `platform_verified` record remains platform-verified evidence; age does not erase provenance. An `unverified` record does not become verified merely because its timestamp is recent.

Current conservative thresholds:

- repository evidence: fresh through 30 days, aging through 90 days;
- public production evidence: fresh through 14 days, aging through 45 days;
- platform / receiver / private-operations / owner-handoff evidence: fresh through 7 days, aging through 28 days.

Anything older than the aging threshold is `stale`. Evidence with no timestamp is `undated`. Future-dated evidence is rejected.

## Search evidence

Exact search checkpoints are preserved honestly.

- exact 7 / 28 / 90-day rows may enter standard scorecards;
- any other interval stays in `heldSearchCheckpoints` with its real dates, counts, evidence class, window length, and reason;
- a non-standard export is never manufactured into a standard window;
- duplicate source × owner × discovery-type × exact-date-range aggregates are rejected.

A checkpoint ending after `as_of` is rejected.

## Analytics funnel

Sanitized analytics rows are grouped by:

`family × standard window × canonical journey owner`

Each row requires `observed_at`, and one funnel group must use one evidence snapshot time. Duplicate aggregate rows are rejected before reconciliation.

Each group is passed through the canonical funnel adapter.

Ready carrier / vehicle-transport funnels enter measurement.

Incomplete groups remain in `incompleteFunnels` and normalized `heldEvidence` with missing events and registry gaps. Handoff is never substituted for receiver-confirmed delivery.

SEO and website-project families therefore remain incomplete while their canonical delivery event is not established.

## Private outcome evidence

Private-safe aggregate outcomes require `observed_at` and are rejected if the evidence timestamp is after report `as_of`.

One outcome aggregate per canonical owner × standard window is accepted in a report. Duplicate owner/window outcome rows are rejected to prevent double counting.

Only aggregate reviewed / qualified / opportunity / won-lost / revenue-reconciled-win counts enter the contract. No raw lead rows or revenue values are stored.

## AI observations

AI observation rows pass through the existing sanitized observation importer.

Future observations relative to `as_of` are rejected. Business measurement excludes synthetic observations.

No full answer or conversation text is stored in the report.

## Output contract

Report schema version:

`geo_operational_scorecard_report_v2`

The report contains:

- ingestion counts;
- held non-standard search checkpoints;
- incomplete funnel diagnostics;
- normalized `heldEvidence` reasons;
- global 7 / 28 / 90 scorecards;
- canonical-owner 7 / 28 / 90 scorecards and reconciliation status;
- evidence freshness records;
- per-window provenance summaries that preserve evidence classes;
- owner readiness percentage based on four independent layers: AI visibility, search, funnel, outcomes;
- mixed-evidence-class warnings rather than silent class collapse;
- owner window-coverage summary for 7 / 28 / 90.

The report does not echo the original input bundle.

## Comparable-window deltas

`src/data/geo-operational-comparison.ts` provides comparison contracts for two already-built operational reports.

Rules:

- current report `asOf` must be later than previous report `asOf`;
- 7-day may compare only with 7-day, 28-day only with 28-day, and 90-day only with 90-day;
- mismatched windows throw instead of producing a misleading delta;
- global and canonical-owner deltas include AI mention/citation rate, search impressions/clicks/CTR, non-branded impressions, CTA/intake/delivery, qualified leads, opportunities and wins.

The comparison contract never manufactures a previous period from a non-standard export.

## Truth boundary

The runner compiles evidence; it does not create evidence.

Missing data remains missing. `unverified` remains unverified. A held 16-day export remains 16-day evidence. An incomplete funnel remains incomplete. Stale evidence remains evidence but is visibly stale. No ranking, citation, traffic, lead, opportunity, win, or revenue claim is inferred from absence.

## Visual boundary

This slice has no UI and no production-page changes. It does not alter the CEO visual approval gate in Issue #665. Material visual decisions are accumulated separately in Issue #694.
