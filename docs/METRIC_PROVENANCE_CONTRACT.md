# Metric provenance contract

## Purpose

Prevent illustrative, demo, local-build, preview, unverified, private, or incomplete values from being presented as verified production metrics.

This contract defines evidence metadata only. It does not add a public MetricCard, EvidenceBadge, analytics event, business number, customer result, ranking, traffic, conversion, revenue, load, carrier, dealer, or operational claim.

## Required fields

Every metric record requires:

- stable kebab-case metric ID;
- visible label and value or an explicit unavailable state;
- unit;
- date range or as-of date;
- scope/population;
- source type and source name;
- calculation method;
- evidence class;
- environment;
- visible evidence label;
- last verified date;
- reviewer/owner role;
- caveat/limitation;
- privacy class;
- publication state.

A future renderer must reject or hide a record that fails validation. Missing evidence must render as unavailable rather than being replaced with a forecast, placeholder, modelled business result, or stale historical number.

## Controlled visible labels

### Illustrative sample

Synthetic values used to explain structure. Requires illustrative evidence and an illustrative environment.

### Demo data

Fictional interactive data. Requires illustrative evidence and an illustrative or preview environment.

### Local reviewed-build snapshot

Repository-reviewed evidence from a loopback/local build. Requires repository verification and the local-reviewed-build environment. It cannot claim production status.

### Dated production snapshot

A dated observation of a production surface. Requires the production environment, an as-of date, and verified evidence. It is a dated observation—not automatically a traffic, conversion, delivery, or customer-result metric.

### Production verified

Requires the production environment and one of these evidence classes:

- receiver verified;
- platform verified;
- private operations verified.

Repository tests alone cannot classify a business metric as production verified.

### Unavailable

Requires a null value and unverified evidence. Use this when a property, report, field sample, consent record, or owner-controlled evidence source is unavailable or insufficient.

## Evidence classes

- `illustrative` — synthetic or fictional explanatory data;
- `repository_verified` — implementation, contract, build, or read-only repository workflow evidence;
- `receiver_verified` — approved receiver confirmed delivery, not qualification;
- `platform_verified` — authenticated owner-controlled platform evidence;
- `private_operations_verified` — human-reviewed owner-controlled operational disposition;
- `unverified` — no approved evidence was reviewed.

## Privacy and publication

Public approval is allowed only for:

- `public_safe`; or
- `aggregate_non_identifying`.

`private` and `prohibited` records cannot be approved for public rendering. An unverified non-null value cannot be approved publicly.

This contract must never carry names, emails, phone numbers, company identities, MC/USDOT numbers, routes, VINs, messages, rates, budgets, IP addresses, tokens, account/property IDs, recipients, or user-level analytics rows.

## Current boundary

The contract is repository-only. It does not authorize:

- a new visual component;
- publication of any metric;
- a broad design-system refactor;
- migration of existing illustrative mockup values;
- analytics/property access;
- production receiver changes;
- automated public screenshots;
- customer or partner proof claims.

Any future MetricCard or EvidenceBadge implementation must be a separate bounded change with reviewed examples, accessibility checks, and current-head CI.
