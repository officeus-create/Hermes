# Route Estimate Boundary — Release A

## Status

The repository contains a disabled-by-default route-estimate foundation for the Load Board request form.

This release does **not**:

- enable Google Maps Platform billing;
- enable the Routes API in a Google Cloud project;
- create or store an API key;
- create a Cloudflare KV namespace;
- add a production or preview binding;
- enable the public feature flag;
- deploy or submit anything to production;
- calculate a transport quote or binding price;
- provide truck routing, legal routing, toll guidance, pickup/delivery ETA, or carrier availability;
- add Places Autocomplete or make requests while a visitor types.

The built website remains in `preview` mode unless an owner separately approves and configures the external dependencies.

## Architecture

### Browser

`src/components/RouteEstimateEnhancer.astro`

- renders only on `/load-board/`;
- mounts beside the existing pickup and delivery fields without changing their values or the load-request contract;
- uses a `type="button"` control, so route estimation cannot submit the lead form;
- performs no network request until the visitor presses **Estimate route**;
- validates a U.S. city/state, ZIP, or address before any request;
- accepts only a same-origin HTTPS endpoint, except localhost during development;
- does not request geolocation or load Google client scripts;
- does not send addresses to analytics or append them to the URL;
- does not attach estimate results to the lead payload;
- preserves a direct Logistics Sales fallback.

### Server

`functions/api/route-estimate.ts`

Cloudflare Pages Functions endpoint:

`POST /api/route-estimate`

Required runtime bindings for a future live release:

| Binding | Type | Purpose |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | encrypted secret | Server-only Google Maps Platform key restricted to the Routes API. |
| `ROUTE_LIMITS` | Workers KV namespace | Hashed-IP hourly quota. Raw IP addresses are not stored. |
| `ROUTE_ESTIMATE_ENABLED` | environment variable | Must equal `true`; otherwise the endpoint returns `route_estimate_not_configured`. |
| `ALLOWED_ORIGIN` | environment variable | Exact allowed website origin; defaults to `https://hermeslogisticsus.com`. |

The endpoint:

- requires exact same-origin requests;
- accepts JSON only and limits the body to 4,096 bytes;
- accepts either a Google Place ID or a U.S. address string for each waypoint, never both;
- sends only origin, destination, driving mode, route modifiers, language, and units to Google;
- requests only `routes.distanceMeters` and `routes.duration` through `X-Goog-FieldMask`;
- uses `TRAFFIC_UNAWARE` because this result is general planning context, not a promised ETA;
- applies an hourly KV quota before contacting Google;
- hashes the client address before creating the KV key;
- uses a provider timeout;
- returns numeric distance and duration plus a fixed disclaimer;
- never returns the API key, input addresses, provider payload, or raw provider error;
- sends `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.

## Public build flags

A future approved live build requires:

```text
PUBLIC_ROUTE_ESTIMATE_MODE=live
PUBLIC_ROUTE_ESTIMATE_ENDPOINT=/api/route-estimate
```

Without `PUBLIC_ROUTE_ESTIMATE_MODE=live`, the panel validates locally and states that route estimates are not connected. It makes zero endpoint requests.

## Google request contract

The implementation uses the current Routes API REST method:

```text
POST https://routes.googleapis.com/directions/v2:computeRoutes
```

Request headers:

```text
Content-Type: application/json
X-Goog-Api-Key: <server secret>
X-Goog-FieldMask: routes.distanceMeters,routes.duration
```

The key must remain server-side and must be restricted to the required API. Billing, quota, budget alerts, ownership, key restrictions, and production enablement require separate owner approval.

## Places boundary

Release A does not implement Places Autocomplete. The endpoint already accepts `place_id` so a later separately reviewed release can add the current Places Autocomplete (New) flow without changing the Google Routes waypoint contract.

A future autocomplete release must separately review:

- Google attribution/display requirements;
- session-token and billing behavior;
- delayed requests and minimum-character rules;
- client/server key separation;
- region restriction;
- accessibility and keyboard interaction;
- privacy and retention;
- current Google Maps Platform terms for the billing entity.

## Activation gate

Do not enable live mode until all items are complete:

- [ ] Owner approves Google Cloud project and billing.
- [ ] Routes API is enabled in the approved project.
- [ ] Server API key is created as an encrypted Cloudflare secret.
- [ ] Key is restricted to the Routes API and reviewed for the serverless deployment model.
- [ ] `ROUTE_LIMITS` KV namespace is created and bound separately for preview and production as appropriate.
- [ ] `ALLOWED_ORIGIN` is set to the exact production origin.
- [ ] `ROUTE_ESTIMATE_ENABLED=true` is set only in the approved environment.
- [ ] Public build mode is changed to `live` only after the server bindings exist.
- [ ] Google billing budget and quota alerts are approved.
- [ ] Preview deployment passes endpoint, browser, privacy, accessibility, quota, and fallback tests.
- [ ] Owner reviews wording and confirms that the feature remains non-binding planning context.
- [ ] Production deployment receives explicit owner approval.

## Test contract

Mandatory repository checks cover:

- disabled-by-default behavior;
- same-origin enforcement;
- U.S. address and Place ID validation;
- conflicting and identical waypoints;
- hashed KV quota and TTL;
- exact Google endpoint and minimal field mask;
- provider failure, invalid response, no-route, quota, and offline fallbacks;
- no API key, raw IP, address, or provider detail in public responses;
- Load Board-only rendering;
- zero request before explicit interaction;
- keyboard activation;
- mocked success;
- cross-origin endpoint rejection;
- no form submission or lead-flow mutation.
