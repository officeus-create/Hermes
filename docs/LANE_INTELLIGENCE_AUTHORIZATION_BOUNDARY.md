# Lane Intelligence Authorization and Sanitized Data Boundary

## Current truth

The repository does **not** contain production authentication for Lane Intelligence. It does not connect real shipment history, OFFICE 374, a CRM/TMS, a carrier master sheet, or a load-board account.

Three feature flags remain false:

- `LANE_INTELLIGENCE_AUTHENTICATION_IMPLEMENTED`;
- `LANE_INTELLIGENCE_PRODUCTION_DATA_ENABLED`;
- `LANE_INTELLIGENCE_REAL_CONNECTORS_ENABLED`.

No page, demo, test, or internal document may describe these capabilities as connected until a separate reviewed implementation changes that state.

## Surfaces

### Public demo

Allowed:

- synthetic data;
- read-only rendering;
- transparent arithmetic;
- explicit prototype labels;
- `noindex,nofollow,noarchive`;
- exclusion from the sitemap.

Not allowed:

- sanitized or restricted operational data;
- imports;
- booking, negotiation, messaging, spreadsheet or CRM writes;
- authentication claims;
- public shipment-history export.

### Future internal workspace

Default state: denied.

Before internal access can be enabled, all of the following must exist and pass review:

1. authentication implementation;
2. role model;
3. tenant and subject scoping;
4. owner-approved source registry;
5. authorization tests;
6. audit logging without PII leakage;
7. retention and deletion rules;
8. incident and access-revocation procedure;
9. secret storage outside the repository;
10. explicit production approval.

## Roles

- `anonymous`: synthetic public demo only;
- `dispatcher`: future authenticated internal read or import-preview scope;
- `carrier`: future authenticated internal read scope limited to an explicit subject match;
- `reviewer`: future publication-review scope.

The code does not imply these roles are operational today.

## Dataset classes

- `synthetic`: fictional data created for tests and demonstrations;
- `owner_approved_sanitized`: a future export approved by the owner and validated against the safe contract;
- `restricted_operational`: real private operational data, denied by the current module.

## Sanitized lane contract

A candidate aggregated record may contain only:

- internal lane ID;
- origin and destination regions, not exact addresses;
- equipment class;
- aggregation period;
- completed-shipment count;
- median loaded and deadhead miles;
- publication-review status;
- source type and review dates.

The contract rejects identity, contact, authority, exact-address, shipment-document, note, individual-rate, commission, and live-position fields.

## Publication boundary

`verified` does not mean public. Publication requires:

- a separate publication review;
- approved evidence;
- aggregation and privacy review;
- unique public value;
- compliance with the SEO publication gate;
- explicit owner-approved release process.

## Production blockers

- exact approved data source is not selected;
- no sanitized export has been approved;
- no provider API permission has been confirmed;
- authentication is not implemented;
- no production credential may be requested or stored in this branch;
- merge and deployment require separate owner approval.
