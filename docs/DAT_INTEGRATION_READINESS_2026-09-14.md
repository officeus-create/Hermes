# DAT integration readiness — 2026-09-14

## Decision

Do not submit the DAT partnership request or reply that Hermes is integration-ready until the Hermes Load Board is demonstrably operating and the technical certification package below is ready. The current product is live, but the first real freight LOAD source is still the revenue blocker. DAT is the preferred next general-freight candidate after this readiness slice.

## Current Hermes state

- Canonical product: `https://hermeslogisticsus.com/load-board/`.
- Public curtain, Hermes identity/company unlock, D1 normalization, expiry/dedupe/rights gates, protected Request details, and provider source controls are already shipped.
- Production summary on 2026-09-14 showed `0` active freight loads and `13` available trucks; CAPACITY is kept separate from LOAD inventory.
- Hegelmann is a permissioned capacity source. It does not solve the missing freight-load source.
- The provider registry already contains DAT, but the runtime sync endpoint previously executed only Ship.Cars.

## Official DAT requirements captured for the next step

Sources reviewed:
- https://www.dat.com/api-integration
- https://one.support.dat.com/9-troubleshooting-2734b01a/service-accounts-and-restful-api-faq-7c689bc5
- https://www.dat.com/product-and-delivery-schedule
- https://services.dat.com/content/resources/product-sheets/dat-connexion
- https://one.support.dat.com/9-resources-52e74931/dat-partners-123e4752/partner-with-dat-89f3b0bc

DAT states that API access is delivered through the Developer Portal, appropriate subscriptions/seats are required, and an API/interface integration must be certified in a non-production environment before production use. The REST service-account model uses organization-level service-account authentication plus a user identity with the required DAT services/seats. Certification scope controls whether a TMS may search/post loads or trucks and use other DAT functions.

## Hermes fail-closed runtime gates

The `/api/load-board/providers/sync` contract now recognizes DAT as a separate certification path. It performs **zero DAT requests** until these gates are satisfied:

1. `HERMES_DAT_PARTNERSHIP_APPROVED=true`
2. `HERMES_DAT_DATA_RIGHTS_APPROVED=true`
3. Service-account organization identity configured (`DAT_SERVICE_ACCOUNT_EMAIL`, `DAT_SERVICE_ACCOUNT_PASSWORD`)
4. User identity configured (`DAT_USER_EMAIL`) with the DAT seats/services required for the certified functions
5. DAT Developer Portal base URL/contract supplied (`DAT_API_BASE_URL`) — no undocumented endpoint is guessed
6. For production only: `HERMES_DAT_CERTIFIED=true`
7. Public redistribution remains separate: `HERMES_DAT_PUBLIC_DISPLAY_APPROVED=true`; otherwise intended visibility is `carrier_only`

Even after those values exist, runtime returns `dat_endpoint_mapping_pending` until Hermes maps the exact Developer Portal request/response contract received from DAT and passes non-production certification. That is intentional.

## Partnership/certification package to have ready before replying to DAT

- Product URL and screenshots of the live Load Board, desktop and mobile.
- Architecture diagram: DAT -> approved API -> Hermes normalize/dedupe/freshness/rights -> D1 -> authenticated carrier/dispatcher view.
- Exact requested functions: search loads first; search/post trucks or loads only if commercially needed and included in certification. BookNow, Tracking, rates and posting remain separate scopes.
- User authentication model and seat plan: service account for organization + named DAT user(s).
- Data-use statement covering display audience, storage, retention, deletion, aggregation, contact visibility and audit logging.
- Security summary: TLS, secrets in Cloudflare env/secrets, no credentials in HTML/GitHub/analytics, default-deny provider writes.
- Search throttling plan compatible with DAT limits; do not use freight matching APIs for bulk analytics/data mining.
- UI evidence that required DAT search-result fields can be represented without confusing DAT records with Hermes preview rows.
- Failure/revocation behavior: disable source immediately, expire records, preserve audit state, and stop new requests.
- Non-production certification test plan and exact-main production release gate.

## Next execution after DAT grants access

1. Read the current Developer Portal docs supplied to the approved account.
2. Implement the exact auth + load-search endpoint contract in the DAT branch; do not infer endpoint paths from old SDK examples.
3. Normalize only fields DAT permits into the existing canonical opportunity schema.
4. Add pagination/rate-limit handling, freshness/expiry and dedupe.
5. Keep initial visibility `carrier_only` unless DAT explicitly grants broader display/redistribution.
6. Run DAT non-production certification.
7. After certification, release behind exact-head CI and prove production readback with real permitted records.
8. Only then tell DAT that Hermes is ready for production synchronization.
