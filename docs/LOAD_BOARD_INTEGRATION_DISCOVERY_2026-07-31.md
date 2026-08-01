# Official Load-Board Integration Discovery — 2026-07-31

## Decision boundary

This document records publicly available official integration information only. It does not create accounts, request credentials, buy plans, contact providers, connect production data, or authorize use beyond each provider's terms.

Prohibited implementation paths:

- scraping, crawling, browser automation, reverse engineering, or bypassing anti-bot controls;
- copying marketplace data into a public feed;
- assuming that an API subscription permits aggregation, redistribution, model training, long-term storage, or resale;
- placing provider credentials in the repository;
- claiming any integration is connected before a successful approved test.

## Status definitions

- **Verified** — an official provider page confirms the capability.
- **Needs Review** — capability exists, but account eligibility, contract, pricing, data rights, retention, display, or production access still requires provider-specific confirmation.
- **Not Available / Rejected** — no approved mechanism was verified or the method conflicts with documented provider restrictions.

## Comparison matrix

| Provider | Official mechanisms verified | Authentication/access | Commercial or account prerequisite | Internal aggregation/display | Public redistribution | Status | Safe next step |
|---|---|---|---|---|---|---|---|
| Central Dispatch | REST APIs for Listings, Fulfillment, Membership, Dispatch Documents, Events, Market Intelligence, and Offers | Bearer tokens; OAuth authorization-code and client-credentials flows are documented | API availability depends on Core, Premium, Private Marketplace, or Market Intelligence subscription; credentials require an API access request | Technically possible through documented APIs, but Hermes-specific storage, aggregation, display, and retention rights are not yet confirmed | Not approved by the public documentation reviewed | **Verified API / Needs Review rights** | Prepare an endpoint-to-Hermes field map. Do not submit the access form until owner approval and subscription eligibility are confirmed. |
| Super Dispatch | Carrier API, Shipper API, Pricing Insights API, REST/JSON, webhooks, order status, tracking, eBOL/ePOD, invoices, loadboard/private-network workflows | OAuth 2.0 client credentials are documented; credentials are obtained through an account/support process | Shipper or carrier account and API access approval are required | Strong technical fit for vehicle transport, but exact commercial terms, data retention, and cross-system display rights require confirmation | Not approved by the public documentation reviewed | **Verified API / Needs Review rights** | Treat as a leading car-hauling integration candidate. Build a field and event map only; do not request credentials yet. |
| Truckstop | REST and SOAP APIs; Load Search, Truck Posting/Management, Truck Search, and Load Management are documented | REST token flows and SOAP username/password/integration ID are documented | A fully executed Systems Integration Agreement is required before credentials; API access may require Load Board Pro and additional costs | Possible only within the signed agreement and licensed products | Official Data Use terms prohibit redistribution, sharing, crawling/scraping, and unapproved derivative use | **Verified API / Contract required** | Keep the adapter disabled. Prepare a contract-question checklist covering permitted use, cache duration, user display, deletion, and derived metrics. |
| DAT | Official APIs are advertised for DAT Load Board, BookNow, Tracking, Freight Posting, and other products | DAT Developer Portal account is required; detailed access is behind the portal | Account and product/API access are required | Public pages confirm integration into a TMS, but Hermes-specific data use, retention, and aggregation rights are not publicly verified | Not approved by the public pages reviewed | **Verified API family / Needs Review details** | Create a requirements checklist for the Developer Portal. Do not create an account or contact support without owner approval. |
| Ship.Cars | Official product pages confirm API integration capabilities, LoadMate/LoadMate Pro integrations, real-time updates, and bulk VIN CSV upload | Public technical authentication documentation was not located in this review | API access is associated with higher-tier/custom products such as LoadMate Pro or carrier Professional | Product pages indicate integrations are supported; exact endpoints, storage, display, and retention terms are not publicly documented | Not approved by the public pages reviewed | **Verified capability / Needs Review technical docs** | Prefer a provider-supplied CSV/export or documented API after an approved commercial review. Do not infer endpoints from the website. |
| Owner-approved sanitized CSV | Manual or scheduled import from an export controlled by Hermes | No third-party marketplace credential is required for the parser | Owner approval, field map, privacy removal, provenance, and export authorization | Supported by the existing preview/quarantine architecture | Public export remains disabled | **Verified first adapter** | Use synthetic fixtures now. Later accept only an owner-approved sanitized export through preview, quarantine, and manual approval. |
| Web scraping or browser automation | None | Not applicable | Conflicts with provider controls and/or terms | Not allowed | Not allowed | **Not Available / Rejected** | Do not implement. |

## Provider notes

### Central Dispatch

Official sources reviewed:

- `https://www.centraldispatch.com/features/api`
- `https://api-docs.centraldispatch.com/`
- `https://api-docs.centraldispatch.com/apis`
- `https://api-docs.centraldispatch.com/overview`
- `https://api-docs.centraldispatch.com/authentication`
- `https://api-docs.centraldispatch.com/faqs`

Confirmed:

- Listings and Dispatch Document APIs are presented for all plans;
- Fulfillment, Event, and Membership APIs are presented for Premium plans;
- Market Intelligence is an add-on;
- Offer API is identified for Private Marketplace clients;
- OAuth/bearer-token authentication and scopes are documented;
- the FAQ says authorization-code credentials are for approved software providers/third parties and says emerging CRM integrations are not currently offered automatically.

Open questions:

- whether Hermes qualifies as a direct customer integration, software provider, or both;
- whether search or marketplace-read access required for Lane Intelligence is available under the intended plan;
- cache duration, derived calculations, internal display, historical storage, and deletion obligations;
- whether sandbox/test credentials are available for the intended account type.

### Super Dispatch

Official sources reviewed:

- `https://developer.superdispatch.com/`
- `https://developer.superdispatch.com/carrier/reference/carrier-api/`
- `https://developer.superdispatch.com/shipper/docs/overview/`
- `https://developer.superdispatch.com/shipper/docs/quickstart/`
- `https://developer.superdispatch.com/shipper/docs/documentation-intro/`

Confirmed:

- separate Carrier, Shipper, and Pricing Insights APIs;
- REST/JSON and OAuth 2.0 client-credentials support;
- webhooks for lifecycle updates;
- vehicle-transport order, carrier assignment, tracking, eBOL/ePOD, inspection, invoicing, loadboard, and private-network workflows;
- credentials require an applicable account and support/access process;
- production endpoints operate on live data.

Open questions:

- sandbox availability and test-data isolation;
- rate limits and plan-specific API entitlements;
- retention, document storage, redaction, and deletion terms;
- whether Hermes may aggregate offers from Super Dispatch with other providers in one internal comparison view;
- whether derived metrics may be stored after source access ends.

### Truckstop

Official sources reviewed:

- `https://developer.truckstop.com/reference/general-overview`
- `https://developer.truckstop.com/reference/overview`
- `https://developer.truckstop.com/reference/load-operations-overview`
- `https://developer.truckstop.com/reference/overview-1`
- `https://developer.truckstop.com/reference/storage-policy`
- `https://truckstop.com/product/integrations/`

Confirmed:

- signed Systems Integration Agreement required before credentials;
- REST and SOAP products;
- Load Search, Truck Posting/Management, Truck Search, and Load Management capabilities;
- REST access/refresh token model and SOAP integration IDs;
- Load Board Pro or other commercial requirements may apply;
- official Data Use text prohibits scraping and unapproved redistribution/sharing.

Open questions:

- permitted internal multi-provider comparison;
- cache and retention periods;
- whether derived RPM/deadhead metrics are allowed and how long they may be retained;
- rules when a user's Truckstop access ends;
- whether every Hermes user needs an individually licensed Truckstop account.

### DAT

Official sources reviewed:

- `https://www.dat.com/api-integration`
- `https://www.dat.com/resources/api-integration`

Confirmed:

- official APIs are advertised for Load Board, BookNow, Tracking, Freight Posting, and additional products;
- the Developer Portal contains detailed documentation and examples;
- a Developer Portal account/access process is required.

Open questions:

- exact API products available to a carrier/dispatcher organization;
- authentication model, sandbox, rate limits, pricing, and licensing;
- data retention, internal display, aggregation with other providers, and deletion requirements;
- whether recommendations or derived metrics may be stored outside DAT.

### Ship.Cars

Official sources reviewed:

- `https://ship.cars/products/loadmate/`
- `https://ship.cars/pricing/shippers/`
- `https://ship.cars/pricing/carriers/`
- `https://ship.cars/solutions/shippers/pricing-automation-integration/`
- `https://ship.cars/products/smarthaul-tms/`

Confirmed:

- API integration capabilities are advertised;
- LoadMate Pro includes API access and bulk VIN CSV upload;
- carrier Professional plans mention API integration capabilities;
- product workflows include vehicle transport, load management, tracking, carrier management, documents, and pricing automation.

Open questions:

- public developer documentation, endpoints, authentication, sandbox, rate limits, and webhooks;
- exact plan and commercial approval;
- data ownership, retention, aggregation, and deletion rules;
- whether load-board opportunity data can be displayed in a separate Hermes internal interface.

## Recommended implementation order

1. **Synthetic adapter** — continue tests and read-only prototype work.
2. **Owner-approved sanitized CSV** — first real adapter after a field-level privacy review; preview and quarantine before any write.
3. **Central Dispatch or Super Dispatch discovery** — highest relevance for car hauling; prepare field/event maps and permission questions.
4. **Ship.Cars discovery** — evaluate official CSV/API options once technical documentation and commercial terms are available.
5. **Truckstop discovery** — proceed only through the SIA and licensed API products.
6. **DAT discovery** — proceed only after owner-approved Developer Portal access and product-rights review.

No provider adapter may move from `disabled` to `test` or `production` based on this document alone.

## Questions requiring owner approval before provider contact or purchase

- which provider account Hermes already has and under which legal entity;
- whether Hermes is integrating for its own staff only or offering software access to third parties;
- budget and acceptable subscription tier;
- who may sign an integration or data-use agreement;
- which fields Hermes needs and how long they must be retained;
- whether an approved sandbox or sanitized export exists;
- whether provider data may be shown to carriers, dispatchers, agents, or customers;
- deletion procedure when access is revoked or a subscription ends.
