# SEO Source Registry Template

Use this file or a connected Sheet to register every data source used by the SEO program.

| Source | Direction | Location | Owner | Date range | Sensitivity | Public-use rule | Fields available | Agent access | Last verified | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| One-year Hermes load/route history | Logistics | Google Drive / uploaded database | Owner | 1 year | Private operational data | Aggregate only; never publish customer, shipment, rate, or private contact details | pickup/delivery city/state/ZIP, lane frequency, equipment, seasonality, hubs | Pending exact file registration | Pending | Primary first-party geo evidence |
| Google Search Console | All | Connected Google account | Owner | Ongoing | Internal analytics | Use aggregate query/page/country data | impressions, clicks, CTR, position, indexing | Connected when available | Pending | Phase A baseline |
| GA4 | All | Connected Google account | Owner | Ongoing | Internal analytics | Aggregate reporting only | sessions, events, conversions, geography, device | Connected when available | Pending | Verify after PR #3 production deploy |
| GitHub repository | All | officeus-create/Hermes | Owner | Ongoing | Mixed | Follow public information policy | routes, code, content, tests, PRs | Connected | 2026-07-30 | Technical source of truth |
| ProgressoPro social profiles | Marketing | Instagram/Facebook/Threads/LinkedIn/etc. | Owner | Ongoing | Public + account analytics | Publish only owner-approved claims | profile URLs, content, analytics | Pending exact registry | Pending | Entity and branded SERP support |

## Rules

- Register the exact file or connector before analysis begins.
- Mark private operational sources clearly.
- Use private logistics data only in aggregated form.
- Never publish customer names, shipment details, rates, internal contacts, credentials, or private records.
- Record the date and method of every baseline and measurement snapshot.
- If a source cannot be located, write the exact missing file name or permission needed instead of guessing.