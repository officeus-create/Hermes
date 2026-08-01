# Official load-board integration research — 2026-08-01

Scope: official provider sources only. This document does not authorize or configure a provider connection. No credentials, subscriptions, scraping, outbound requests, booking, publication, or production changes were used.

Status meanings:

- **Verified** — an official provider source confirms the capability or access condition.
- **Needs Review** — an official source is incomplete for storage, retention, redistribution, deletion, rate limits, or account eligibility.
- **Not Available** — the reviewed official sources do not expose the capability publicly.

## Safety boundary

Current marketplace offers remain private observations. They are not confirmed routes, completed transportation history, public capacity, or publishable SEO evidence. All provider adapters remain disabled. The only currently permitted technical path is an owner-approved sanitized CSV entering local preview and quarantine.

## Provider matrix

| Provider | Official API availability | Auth / access | Confirmed operations | Webhooks / events | CSV / email ingestion | Commercial gate | Storage / retention / redistribution | Current Hermes status |
|---|---|---|---|---|---|---|---|---|
| DAT | **Verified.** DAT advertises APIs for Load Board, BookNow, Tracking, Freight Posting, rates and analytics through its Developer Portal. | Developer Portal account is required; detailed credentials and scopes are not public on the reviewed marketing page. | Send and receive DAT information through a TMS; product-specific API details require portal access. | **Needs Review.** Not confirmed in the reviewed public source. | TMS/FTP integration is advertised for certain office plans; generic CSV/email ingestion was not confirmed. | Account, product and plan eligibility apply. | **Needs Review.** Rate limits, storage, retention, deletion, closed-dashboard aggregation and redistribution rights were not found in the reviewed public material. | `owner_approval_required`; provider connection remains disabled. |
| Truckstop | **Verified.** Official REST Load Management APIs and SOAP Load Search, Truck Posting/Management and Truck Search APIs are documented. | REST uses access/refresh bearer tokens; SOAP requires username/password plus an integration ID. | Post, update, retrieve, search, refresh, boost and delete the customer's posted loads; SOAP load search and truck search/posting are documented. | **Needs Review.** No general webhook capability was confirmed in the reviewed official pages. | **Not Available in reviewed sources.** No generic CSV or email-ingestion workflow was confirmed. | A signed Systems Integration Agreement is required before credentials are issued; Truckstop also states Load Board Pro is required for API access and additional costs/requirements may apply. | **Needs Review.** The reviewed official pages do not establish storage, retention, deletion, aggregation or redistribution rights. | `contract_required`; provider connection remains disabled. |
| Central Dispatch | **Verified.** Official Listings, Fulfillment, Membership, Dispatch Document, Event, Market Intelligence and Offer APIs are published. | OAuth-based bearer-token authorization. Official docs describe Authorization Code flow for software providers/third-party clients and Client Credentials for server-to-server access. Scopes are required. | Listings create/read/update/delete; dispatch management; documents; membership; events; market intelligence; offers for eligible private-marketplace clients. | **Verified for eligible plans.** Event API supports subscriptions and retrieval of past events; Premium plan required. | **Needs Review.** Generic CSV and email ingestion were not confirmed in reviewed official docs. | Core includes Listings and Dispatch Document APIs; Premium adds Fulfillment, Event and Membership; Market Intelligence is an add-on; Offer API is limited to Private Marketplace clients. Account/API request approval is required. | **Needs Review.** Public docs confirm OAuth/scopes and ETag concurrency controls, but not Hermes-specific storage, retention, deletion, aggregation, dashboard display or redistribution rights. | `owner_approval_required`; provider connection remains disabled. |

## Official sources reviewed

### DAT

- https://www.dat.com/api-integration
- https://www.dat.com/resources/api-integration
- https://www.dat.com/load-boards

### Truckstop

- https://truckstop.com/product/integrations/
- https://developer.truckstop.com/reference/general-overview
- https://developer.truckstop.com/reference/load-operations-overview
- https://developer.truckstop.com/reference/overview

### Central Dispatch

- https://www.centraldispatch.com/features/api
- https://api-docs.centraldispatch.com/
- https://api-docs.centraldispatch.com/apis
- https://api-docs.centraldispatch.com/overview
- https://api-docs.centraldispatch.com/authentication
- https://api-docs.centraldispatch.com/faqs

## Implementation decision

1. Do not connect any provider in this batch.
2. Do not request or store credentials.
3. Do not infer permission to aggregate, retain, redistribute or publish marketplace observations.
4. Keep `SCRAPING_ALLOWED`, `OUTBOUND_PROVIDER_REQUESTS_ENABLED`, `PUBLIC_MARKETPLACE_EXPORT_ENABLED`, `REAL_PROVIDER_CREDENTIALS_CONFIGURED`, and every `providerConnectionEnabled` flag set to `false`.
5. Continue using the synthetic and owner-approved sanitized CSV preview adapters for import, quarantine, lifecycle, freshness, dedupe, provenance and privacy work.
6. Before any future provider implementation, obtain separate owner approval and complete provider-specific commercial, account-eligibility and data-rights review covering scopes, rate limits, storage, retention, deletion, audit logs, closed-dashboard use and redistribution.

## Still to research from official sources

- Super Dispatch: API families, webhooks, authentication, partner eligibility, retention and redistribution terms.
- Ship.Cars: public API/CSV capabilities, authentication, partner eligibility and data-rights terms.
- DAT: authenticated Developer Portal details for scopes, rate limits, events/webhooks and data-use restrictions.
- Truckstop: exact REST product entitlement, token lifecycle, rate limits and contractual data-use restrictions.
- Central Dispatch: plan/account eligibility for Hermes, rate limits, storage/retention/deletion terms and whether private read-only aggregation is permitted.
