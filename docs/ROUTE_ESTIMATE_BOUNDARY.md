# Route Estimate Security and Release Boundary

Date established: 2026-08-01  
Status: implemented in the repository, disabled by default in production

## Purpose

Provide an optional general driving-distance and duration estimate for the public Load Board form without exposing a Google Maps key, turning the website into a navigation product, or implying truck-specific routing, legal access, timing, price, or carrier availability.

The estimate is planning context only. It does not publish a load, submit a lead, book a carrier, calculate a transport rate, or change the final carrier decision.

## Architecture

Browser:

1. The visitor enters pickup and delivery locations in the existing Load Board form.
2. No route request occurs while typing.
3. The visitor presses **Estimate route**.
4. In preview mode, the panel explains that live estimates are not connected.
5. In live mode, the browser sends only the two normalized locations to the same-origin `/api/route-estimate` endpoint.

Cloudflare Pages Function:

1. Enforces the approved origin.
2. Requires the feature flag, encrypted Google secret, and Cloudflare KV binding.
3. Validates body size and accepts either a Google Place ID or a U.S. address/city-state/ZIP string for each endpoint.
4. Applies a Cloudflare-backed hourly quota by hashed client address.
5. Calls Google Routes API `computeRoutes` with `DRIVE`, `TRAFFIC_UNAWARE`, no alternatives, and the minimal field mask `routes.distanceMeters,routes.duration`.
6. Returns numeric distance and duration plus a fixed disclaimer.
7. Never returns the API key, submitted addresses, Place IDs, provider error body, or Google response metadata.

## Current feature gates

Build-time public variables:

- `PUBLIC_ROUTE_ESTIMATE_MODE=live` enables the browser request. Any other value keeps the panel in preview mode.
- `PUBLIC_ROUTE_ESTIMATE_ENDPOINT=/api/route-estimate` selects the same-origin endpoint. The component rejects a cross-origin endpoint.

Runtime Cloudflare bindings:

- encrypted secret `GOOGLE_MAPS_API_KEY`;
- environment variable `ROUTE_ESTIMATE_ENABLED=true`;
- KV namespace binding `ROUTE_LIMITS`;
- environment variable `ALLOWED_ORIGIN=https://hermeslogisticsus.com`.

The browser flag alone cannot enable the integration. The server also fails closed unless the runtime flag, secret, and KV binding are present.

## Google Cloud setup checklist

Account-level work, not performed by repository code:

1. Select the approved Google Cloud project.
2. Confirm billing and a monthly budget alert.
3. Enable Routes API.
4. Create a dedicated server key for the Cloudflare Function.
5. Restrict the key to Routes API and the approved server-side usage model available for the account.
6. Store the key only as the encrypted Cloudflare secret `GOOGLE_MAPS_API_KEY`.
7. Configure an operational quota low enough for the public pilot.
8. Review current Google Maps Platform terms, including any region-specific terms.
9. Test in a Cloudflare preview environment before enabling the production build flag.

Do not commit the key to GitHub, a public build variable, Astro source, JavaScript, HTML, a fixture, a screenshot, or an issue comment.

## Address and Place ID policy

The function supports:

- Google Place IDs, preferred when a reviewed Places Autocomplete layer is added later;
- U.S. city/state, ZIP, or full U.S. address strings.

Phase 1 does not load Google Maps JavaScript or Places Autocomplete in the browser. A future autocomplete release requires a separate browser-restricted key, Google attribution/branding review, session-token handling, cost review, accessibility testing, and a current official-doc check. It must not reuse the server secret.

## Data handling

- Request and response use `Cache-Control: no-store`.
- The function does not persist origin or destination.
- KV stores only a hashed client rate-limit key and a numeric count with expiration.
- Successful responses do not echo addresses or Place IDs.
- The route estimate is not automatically inserted into or sent with the logistics lead.
- Any future attachment to a lead requires explicit consent, final review, and separate regression coverage.

## Failure behavior

- missing runtime configuration: `503 route_estimate_not_configured`;
- invalid origin or content type: rejected before provider access;
- invalid/ambiguous U.S. location: `400 invalid_location`;
- same origin and destination: `400 origin_destination_must_differ`;
- local hourly quota: `429 rate_limit_exceeded`;
- no usable route: `422 route_not_found`;
- provider quota, network, or transient failure: generic `503 estimate_temporarily_unavailable`;
- malformed provider response: `502 invalid_provider_response`.

Provider error bodies and secret values are never forwarded.

## User-facing disclaimer

> General driving estimate for planning only. It is not truck-specific and does not confirm access, legal routing, tolls, pickup timing, delivery timing, price, or carrier availability.

## Official references checked for this implementation

- Google Routes API — Get a route: `https://developers.google.com/maps/documentation/routes/compute_route_directions`
- Google Routes API — Specify locations: `https://developers.google.com/maps/documentation/routes/specify_location`
- Google Routes API — Waypoint reference: `https://developers.google.com/maps/documentation/routes/reference/rest/v2/Waypoint`
- Google Places API — Autocomplete (New): `https://developers.google.com/maps/documentation/places/web-service/place-autocomplete`
- Cloudflare Pages Functions: `https://developers.cloudflare.com/pages/functions/`
- Cloudflare Pages bindings and secrets: `https://developers.cloudflare.com/pages/functions/bindings/`

## Production release gate

Do not enable the two live flags until all are true:

- current `main` is deployed to the intended Cloudflare Pages project;
- Google account, billing, key restrictions, and quota are reviewed;
- Cloudflare secret and KV bindings are configured in preview and production separately;
- preview deployment returns a successful estimate without exposing the key;
- invalid, quota, offline, and timeout states are verified;
- production hostname and same-origin CORS behavior are verified;
- analytics, consent, and lead-attachment decisions are explicitly approved.
