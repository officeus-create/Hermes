# Repair Shop Private Sales Attribution

Date: 2026-08-15
Parent: Issue #510

## Revenue objective

Measure which sales source creates an actual Repair Shop owner account without exposing salesperson identities, salesperson codes, or commission data to public HTML, JavaScript, GA4, or customer-facing URLs.

## Flow

1. Sales operations creates a high-entropy opaque referral token outside the public codebase.
2. The token is mapped to a private salesperson code in the protected Cloudflare environment variable `REPAIR_SHOP_REFERRAL_MAP_JSON`.
3. The prospect opens `/api/repair-shop/referral?ref=<opaque-token>`.
4. The server validates the opaque token against the private map, writes only the opaque token into a `Secure; HttpOnly; SameSite=Lax` cookie, and redirects to `/services/hermes-connect/repair-shops/auth/?mode=register&referral=captured` with the token removed from the destination URL.
5. On `Shop Owner` registration, `/api/auth/register` reads the HttpOnly cookie server-side, resolves the private salesperson code from the protected map, hashes the opaque token, and stores attribution in `repair_shop_sales_attribution` keyed by the new owner specialist ID.
6. The referral cookie is cleared after registration. The registration JSON exposes only `attribution_captured: true|false`, never the private code or token.

## Environment contract

Example structure only — real tokens and salesperson codes must be configured as secrets and must not be committed:

```json
{
  "<high-entropy-opaque-token>": {
    "salesperson_code": "<private-code>",
    "source": "repair-shop-outbound"
  }
}
```

## Private D1 record

`repair_shop_sales_attribution` stores:

- `owner_specialist_id`
- `salesperson_code`
- SHA-256 `referral_token_hash` (never the raw token)
- `source`
- `captured_at`
- `registered_at`

## Privacy boundaries

- No salesperson code in referral URLs.
- No salesperson code in public browser JavaScript.
- No salesperson code or commission data in GA4/dataLayer.
- No salesperson code or raw referral token in registration JSON.
- No raw referral token persisted in D1.
- Invalid/unknown referral tokens never set an attribution cookie.

## KPI chain

Private source → Shop Owner registration → active shop/profile → first booking → repeat booking → partner offer / Hermes growth lead.

The first operational target remains 5–10 real Repair Shop pilots before adding deferred monetization/payment features.
