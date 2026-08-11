# Hermes Connect API inventory for Agent Readiness — 2026-08-11

Status: READ-ONLY INVENTORY / NO PUBLIC API APPROVAL
Parent track: #393
Related diagnostics: Cloudflare Agent Readiness Level 2 — API Catalog, Link Headers, auth.md

## Purpose

Cloudflare reports Technical Groundwork at 0/3. This inventory answers the first safe question before publishing an API Catalog: which server routes already exist, and which of them are actually appropriate for public AI-agent discovery?

No route is approved for external AI-agent use by this document. No production code, authentication, CORS, rate limits, secrets, data collection, or API behavior is changed.

## Existing server routes

| Route | Current role | Data / side effect | Current access boundary | Agent-readiness classification | Decision |
| --- | --- | --- | --- | --- | --- |
| `/api/business-lead` | Business/marketing/IT lead submission | Collects contact and marketing-attribution fields; can trigger internal email delivery | Origin-restricted POST/OPTIONS, rate limited, no-store | Form-delivery endpoint | **DO NOT publish in public API Catalog** |
| `/api/logistics-lead` | Logistics/load-board/general inquiry submission | Collects contact/logistics fields; can trigger internal email delivery | Origin-restricted POST/OPTIONS, rate limited, no-store | Form-delivery endpoint | **DO NOT publish in public API Catalog** |
| `/api/connect-lead` | Hermes Connect access-request adapter | Forwards the Connect-origin request into the reviewed logistics lead receiver | Accepts only `https://connect.hermeslogisticsus.com` Origin and preserves no-store/CORS boundary | Product form adapter | **DO NOT publish in public API Catalog** |
| `/api/carrier-contract` | Carrier agreement/signature workflow | Handles legal company/signer fields, signatures, document/version controls, and delivery | Origin-restricted, rate limited, legal/document state, no-store | Sensitive legal transaction endpoint | **EXCLUDE from public agent discovery** |
| `/api/route-estimate` | US route distance/duration estimate | Calls Google Routes with origin/destination and returns derived route values; no lead creation | Origin-restricted POST/OPTIONS, feature flag, API key + KV required, 10/hour/IP, no-store, `X-Robots-Tag: noindex, nofollow` | Read-like computational capability, but not currently an external agent API | **ONLY plausible future public tool candidate; requires explicit product/security approval first** |

## Why four routes are not API Catalog candidates

The lead and contract routes are implementation endpoints behind human-facing forms or legal workflows. Publishing them to AI agents merely to pass Cloudflare would expand discoverability of state-changing surfaces without a corresponding authorization, consent, abuse-control, or agent UX contract.

They may remain perfectly legitimate website endpoints while being intentionally absent from an agent-facing API Catalog.

## Route-estimate candidate

`/api/route-estimate` is structurally different:

- it computes route distance/duration rather than creating a lead, contract, payment, booking, or account;
- it already validates US location input;
- it has a strict request-size boundary;
- it is feature-gated;
- it requires the server-side Google Maps credential and KV rate limiter;
- it applies per-IP rate limiting;
- it returns JSON and no-store/noindex headers.

However it is currently restricted to the approved website origin and is not a stable third-party/agent contract. It must not be listed as a public agent tool until an explicit decision covers authentication or anonymous quota, CORS/origin policy, abuse cost, request/response schema, versioning, uptime expectations, and whether external agent usage is a desired product feature.

## Safe Level 2 sequence

1. Keep Technical Groundwork at 0/3 until a real public machine capability is approved.
2. Treat `/api/route-estimate` as the first candidate for a future read-only Hermes machine tool, not as automatically approved.
3. If approved later, define a versioned contract first (for example a documented `/api/v1/...` surface or equivalent reviewed endpoint).
4. Only then publish API Catalog metadata for that exact stable contract.
5. Add Link Headers only when they point to that real catalog/schema/documentation.
6. Add `auth.md` only when a real agent registration/sign-in flow exists; do not use `auth.md` for anonymous form endpoints.

## Explicit exclusions

Do not expose through Agent Readiness metadata:

- lead delivery internals;
- internal email service URLs or tokens;
- carrier contract signing internals;
- signatures or personal/contact data;
- Cloudflare KV/binding details;
- Google API credentials;
- private carrier, customer, candidate, shipment, payment, employee, or account data.

## Current conclusion

Cloudflare's 0/3 Technical Groundwork score is not evidence that three missing files should immediately be created. The repository already contains real server capabilities, but the current set is mostly form/transaction infrastructure. The first legitimate Level 2 opportunity is to productize one deliberately bounded read-only capability — most plausibly route estimation — and publish discovery metadata only after that contract is intentionally approved.
