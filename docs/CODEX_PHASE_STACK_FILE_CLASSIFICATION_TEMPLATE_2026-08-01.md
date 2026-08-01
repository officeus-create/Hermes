# Phase-stack file classification template

Use this table before any runtime port from PRs #25 and #36–#41.

| Source PR | File | Current-main state | Classification | Required action | Shared-file risk | Test coverage |
|---|---|---|---|---|---|---|
| #25 | TBD | TBD | present / safe port / superseded / conflict / blocked | TBD | low / medium / high | build / static / unit / registry / Playwright |
| #36–#38 | TBD | TBD | present / safe port / superseded / conflict / blocked | TBD | low / medium / high | build / static / unit / registry / Playwright |
| #39 | TBD | TBD | present / safe port / superseded / conflict / blocked | TBD | low / medium / high | documentation + full workflow |
| #40 | TBD | TBD | present / safe port / superseded / conflict / blocked | TBD | low / medium / high | registry + full workflow |
| #41 | TBD | TBD | present / safe port / superseded / conflict / blocked | TBD | low / medium / high | adapter + privacy + full workflow |

## Mandatory rejection conditions

Reject or hold any candidate file that would:

- reconnect or copy from `OFFICE 374 2026`;
- include real PII, company identities, MC/DOT, exact addresses, shipment documents, rates, commissions, live positions, or credentials;
- enable public export, external provider requests, automated booking, negotiation, or messaging;
- weaken current sitemap ownership, privacy, noindex, preview-only, default-deny, or publication-review checks;
- overwrite newer shared files wholesale.
