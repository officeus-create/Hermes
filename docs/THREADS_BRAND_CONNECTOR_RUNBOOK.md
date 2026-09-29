# Threads Brand Connector — Hermes Connect

Status: **REVIEW-ONLY / OWNER OAUTH REQUIRED / PUBLISH FAIL-CLOSED**

Canonical owner: GitHub #1018 — Growth Bridge.

## Architecture

Hermes Logistics stays on the verified Windsor.ai connection. This adapter exists only for:

- `office_test` — first live canary;
- `progressopro` — secondary Marketing / Technology lane;
- `business_academy` — secondary Academy lane.

`hermes_logistics` is deliberately not an allowed brand key, so this adapter cannot become a second publisher for the logistics account.

The adapter adds no scheduler. The existing `Hermes Social Publisher` remains the orchestration surface.

## Official Threads contracts checked 2026-09-29

- OAuth authorization: https://developers.facebook.com/documentation/threads/get-started/get-access-tokens-and-permissions
- Long-lived tokens: https://developers.facebook.com/documentation/threads/get-started/long-lived-tokens
- Publishing: https://developers.facebook.com/documentation/threads/reference/publishing
- User/profile readback: https://developers.facebook.com/documentation/threads/reference/user
- Media readback: https://developers.facebook.com/documentation/threads/reference/media-retrieval
- Insights: https://developers.facebook.com/documentation/threads/insights
- Keyword search: https://developers.facebook.com/documentation/threads/keyword-search

## Private runtime configuration

Required Cloudflare runtime secrets/variables:

```text
THREADS_BRAND_APP_ID
THREADS_BRAND_APP_SECRET
THREADS_BRAND_REDIRECT_URI=https://hermeslogisticsus.com/api/internal/social/threads/callback
THREADS_BRAND_TOKEN_KEY=<base64 32-byte AES key>
```

Default scopes:

```text
threads_basic
threads_content_publish
threads_read_replies
threads_manage_replies
threads_manage_insights
```

Optional scope override may include `threads_keyword_search`, but public keyword search is not considered live until the Meta permission/app-review gate is actually verified.

Optional exact identity expectations:

```text
THREADS_OFFICE_TEST_EXPECTED_USERNAME=<exact Office username>
THREADS_PROGRESSOPRO_EXPECTED_USERNAME=progressopro
THREADS_BUSINESS_ACADEMY_EXPECTED_USERNAME=<exact Academy username after owner verification>
```

Publishing remains independently fail-closed:

```text
THREADS_OFFICE_TEST_PUBLISH_ENABLED=false
THREADS_PROGRESSOPRO_PUBLISH_ENABLED=false
THREADS_BUSINESS_ACADEMY_PUBLISH_ENABLED=false
THREADS_SECONDARY_BRAND_PUBLISH_ENABLED=false
```

## Owner workspace

Private route:

```text
/services/hermes-connect/internal/social-connections/
```

The route is `noindex,nofollow,noarchive`. Provider state APIs require the existing server-side `HERMES_INTERNAL_OWNER` capability.

On Repair Shop owner pages the **Social connections** navigation entry is inserted only after the server confirms that capability. Ordinary Repair Shop owners do not receive the entry.

## OAuth and token handling

Flow:

```text
internal owner session
→ POST /api/internal/social/threads/start
→ Meta Threads OAuth
→ /api/internal/social/threads/callback
→ one-use authorization-code exchange
→ server-side long-lived-token exchange
→ provider profile readback
→ AES-GCM encrypted token persistence
→ explicit exact-profile verification
```

Security boundaries:

- OAuth state is random, stored only as a SHA-256 digest, expires after 10 minutes, and is consumed once.
- The callback must run under the same `HERMES_INTERNAL_OWNER` identity that initiated OAuth.
- Threads user tokens are never returned by the private status API.
- Long-lived token payloads are AES-GCM encrypted before private D1 persistence.
- App secret remains server-side only.
- Local disconnect removes the encrypted Hermes-side token record; provider-side Meta revocation is a separate action.
- Active accounts attempt token refresh as validity approaches the final seven days. An already expired or provider-revoked token fails closed and requires OAuth again.

## Identity truth

Current repository truth confirms ProgressoPro Threads as `@progressopro`.

Office and Hermes Business Academy remain fail-closed until Meta returns the real profile and the owner verifies the exact username. Runtime expected-username variables can then lock those identities.

## Publishing and Office gate

A post can publish only when:

1. the brand is allowlisted;
2. its exact connection is owner-verified;
3. its private per-brand publish flag is on;
4. the token is usable;
5. text is non-empty and within the conservative 500 UTF-8-byte guard;
6. a valid idempotency key is supplied.

Secondary brand publishing additionally requires:

- `THREADS_SECONDARY_BRAND_PUBLISH_ENABLED=true`; and
- at least one verified Office publication receipt with provider media ID and public permalink.

## Idempotency

Every publication reserves a unique idempotency key in D1 before the provider write.

Reservation uses atomic `INSERT OR IGNORE`. A simultaneous duplicate reads the existing publication state rather than overwriting the first request. Provider/network ambiguity is never auto-retried.

Receipts preserve:

- brand;
- `AUTHORED_POST` object type;
- idempotency key;
- text fingerprint;
- provider media ID;
- permalink;
- provider timestamp;
- metrics snapshot;
- last error class.

## Metrics

Owner-only endpoint:

```text
GET /api/internal/social/threads/metrics?brand=office_test
```

With `media_id`, it performs provider media + insights readback and stores aggregate owned-media metrics when available.

This evidence is for social optimization. Views, likes, replies, or reach are not leads or revenue.

## Activation order

```text
DEPLOY CODE WITH PUBLISH OFF
→ PRIVATE META CONFIG
→ OFFICE OAUTH
→ EXACT OFFICE PROFILE VERIFY
→ ENABLE OFFICE PUBLISH
→ ONE OFFICE CANARY
→ PROVIDER MEDIA ID + PERMALINK READBACK
→ METRICS READBACK / PRECISE PERMISSION BLOCKER
→ PROGRESSOPRO OAUTH + VERIFY
→ BUSINESS ACADEMY OAUTH + VERIFY
→ ONLY THEN CONSIDER SECONDARY PUBLISH ENABLE
```

No code readiness claim equals production activation.
