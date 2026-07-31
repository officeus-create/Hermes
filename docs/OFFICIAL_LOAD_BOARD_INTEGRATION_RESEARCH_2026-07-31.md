# Official load-board integration research

Date: 2026-07-31
Scope: research only; no provider connection, credentials, subscription purchase, scraping, or production data transfer.

## Safety boundary

- Use only provider-approved APIs, exports, webhooks, email ingestion, or certified TMS/partner integrations.
- Current load-board offers remain private observations. They are not completed routes, public capacity, rate promises, or SEO evidence.
- Do not copy provider records into public fixtures or public pages.
- Do not store PII, company identities, MC/DOT, exact addresses, order identifiers, invoices, BOL/POD, notes, rates, commissions, live positions, or credentials in this repository.
- The first technical adapter remains a manual synthetic or owner-approved sanitized CSV preview.

## Provider matrix

| Provider | Official integration path verified | Authentication / access | Webhooks / events | Commercial and data-use boundary | Current status |
|---|---|---|---|---|---|
| DAT | Official APIs are available through the DAT Developer Portal for Load Board, BookNow, Tracking, Freight Posting, and other products. DAT also documents certified TMS integrations. | Developer Portal account plus organization/service-account and user-level authorization. Product seats and a Connexion seat may be required. | Product-specific; not treated as verified for this prototype until the exact approved API product is selected. | API use requires an appropriate subscription and DAT approval/certification. Official terms restrict use to authorized product interoperability and prohibit unapproved analytics/data mining. Search/post limits and product-specific permissions apply. | **Verified — access approval required** |
| Truckstop | Official Load Management API supports creating, retrieving, updating, searching, refreshing, boosting, and deleting the customer’s own posted loads. | Bearer token. Integration access and exact product entitlement still require provider approval. | Not verified for the intended Hermes read-only opportunity workflow in the reviewed official pages. | The reviewed API is oriented to management of loads posted by the authenticated customer. It does not establish permission to ingest the entire marketplace, retain third-party results, redistribute data, or publish route/capacity claims. | **Verified for own-load management; broader use needs review** |
| Central Dispatch | Official REST APIs include Listings V2, Fulfillment, Dispatch Documents, Events, Membership, Offers, and Market Intelligence, with plan-specific restrictions. | Bearer tokens with scopes. Official docs describe Authorization Code and Client Credentials flows. API access requires an approved request and issued credentials. | Event API exists for Premium Plan clients; integrations must handle duplicate and potentially out-of-order event delivery. | Premium, Private Marketplace, and Market Intelligence APIs have separate eligibility. Official docs do not grant public redistribution rights. Listings and fulfillment payloads contain highly sensitive operational data and must stay behind a private authorization boundary. | **Verified — plan and account approval required** |
| Super Dispatch | Official Carrier, Shipper, and Pricing Insights APIs are documented. Shipper API supports orders, carrier assignment, load-board/private-network workflows, tracking, documents, and webhooks. | OAuth 2.0 client credentials or provider-issued API access, depending on API. Credentials must be requested through official support/account channels. | Official Shipper and Carrier documentation confirms webhook-based status updates. | APIs can expose orders, contacts, vehicle details, pricing, documents, tracking, and carrier data. None may enter public fixtures or SEO output. Provider permission and a private role-based system are prerequisites. | **Verified — access approval required** |
| Ship.Cars | Official product material confirms LoadMate combines a transportation-management workflow and market load board and advertises API-enabled real-time updates. | A public developer/authentication specification was not located in the reviewed official material. | Not verified. | No assumption is made about marketplace search access, retention, redistribution, publication, rate limits, or deletion rules until official technical and commercial documentation is provided. | **Needs Review** |

## Official source notes

### DAT

Official sources reviewed:

- https://www.dat.com/api-integration
- https://one.support.dat.com/9-troubleshooting-2734b01a/service-accounts-and-restful-api-faq-7c689bc5
- https://www.dat.com/load-boards/pro

Verified conclusions:

- A developer portal and multiple APIs exist.
- API access is tied to appropriate subscriptions, seats, provider approval, and integration certification.
- DAT’s published terms restrict unapproved analytics/data mining and impose product-specific limits.

Open questions before implementation:

- Which exact DAT product and account role Hermes would be authorized to use.
- Approved storage duration, closed-dashboard aggregation, deletion, and redistribution rules for that product.
- Whether the intended read-only dispatcher workflow is certifiable under the selected subscription.

### Truckstop

Official sources reviewed:

- https://developer.truckstop.com/reference/load-operations-overview
- https://developer.truckstop.com/reference/refresh-a-load

Verified conclusions:

- A bearer-token Load Management API exists.
- The reviewed endpoints manage loads posted by the authenticated customer.
- Refresh operations have explicit provider controls.

Open questions before implementation:

- Whether Hermes can officially search third-party marketplace offers through an approved API product.
- Retention, display, export, redistribution, and deletion rules for search results.
- Webhook/event support for the specific authorized workflow.

### Central Dispatch

Official sources reviewed:

- https://api-docs.centraldispatch.com/
- https://api-docs.centraldispatch.com/apis
- https://api-docs.centraldispatch.com/overview
- https://api-docs.centraldispatch.com/authentication
- https://api-docs.centraldispatch.com/support

Verified conclusions:

- Listings, fulfillment, events, membership, offers, documents, and market-intelligence APIs are documented.
- Bearer tokens, scopes, versioned media types, ETags, and formal access approval are required.
- Several APIs are limited to Premium, Private Marketplace, or Market Intelligence subscribers.

Open questions before implementation:

- Exact account eligibility and approved API scopes for Hermes.
- Storage, retention, redistribution, and deletion terms beyond endpoint documentation.
- Whether closed-dashboard aggregation of sanitized observations is contractually allowed.

### Super Dispatch

Official sources reviewed:

- https://developer.superdispatch.com/
- https://developer.superdispatch.com/shipper/docs/
- https://developer.superdispatch.com/shipper/docs/overview/
- https://developer.superdispatch.com/carrier/reference/carrier-api/

Verified conclusions:

- Carrier and Shipper APIs exist and use authenticated REST workflows.
- Webhooks support lifecycle updates.
- The APIs may expose sensitive order, contact, vehicle, document, invoice, and tracking information.

Open questions before implementation:

- Hermes account eligibility and allowed API scopes.
- Product-specific rate limits and retention/deletion requirements.
- Whether any load-board observations may be aggregated in a closed internal dashboard.

### Ship.Cars

Official source reviewed:

- https://ship.cars/products/loadmate/

Verified conclusion:

- LoadMate publicly describes TMS/load-board integration and API-enabled real-time updates.

Open questions before implementation:

- Official developer documentation and authentication model.
- API, webhook, CSV/export, TMS-partner, retention, deletion, and redistribution policies.

## Recommended implementation sequence

1. Keep the synthetic/sanitized CSV preview as the only active adapter.
2. Define private authentication, authorization, roles, audit logging, retention, export, and revocation before connecting any provider.
3. Select one provider and one narrow use case only after written account eligibility and data-use terms are confirmed.
4. Implement a provider adapter behind the existing normalized preview contract; never send provider data directly to public pages.
5. Add contract tests for provenance, freshness, lifecycle mapping, dedupe, quarantine, deletion obligations, and public-export denial.
6. Require a separate owner approval before credentials, subscriptions, provider contact, real data, or production connectivity.

## Explicitly not completed

- No API account was created.
- No credentials were requested or stored.
- No provider was contacted.
- No subscription or billing change was made.
- No scraping or browser automation against a private dashboard was performed.
- No claim is made that any integration is connected or commercially approved.
