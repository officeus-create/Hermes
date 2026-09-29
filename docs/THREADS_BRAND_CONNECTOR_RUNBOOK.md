# Threads Brand Connector — Hermes Connect

Status: **REVIEW-ONLY / OWNER OAUTH REQUIRED / PUBLISH FAIL-CLOSED**

Canonical owner: GitHub #1018 — Growth Bridge.

## Why this exists

Hermes Logistics remains on the currently verified Windsor.ai connection. This adapter exists only for:
- `office_test` — first canary;
- `progressopro` — secondary brand lane after Office canary;
- `business_academy` — secondary brand lane after Office canary.

`hermes_logistics` is deliberately **not** an allowed brand key so this adapter cannot become a second publisher for the logistics account.

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

Default requested scopes:

```text
threads_basic
threads_content_publish
threads_read_replies
threads_manage_replies
threads_manage_insights
```

Optional explicit override:

```text
THREADS_BRAND_SCOPES="threads_basic threads_content_publish threads_read_replies threads_manage_replies threads_manage_insights threads_keyword_search"
```

Do not request `threads_keyword_search` in production until the Meta app/account has the required permission approval. Without approval, public search is not a proven capability.

Publishing is separately fail-closed by brand:

```text
THREADS_OFFICE_TEST_PUBLISH_ENABLED=false
THREADS_PROGRESSOPRO_PUBLISH_ENABLED=false
THREADS_BUSINESS_ACADEMY_PUBLISH_ENABLED=false
THREADS_SECONDARY_BRAND_PUBLISH_ENABLED=false
```

The first controlled activation sets only:

```text
THREADS_OFFICE_TEST_PUBLISH_ENABLED=true
```

Secondary brand publishing remains blocked until:
1. Office OAuth succeeds;
2. exact profile identity is read back;
3. an internal owner verifies the username shown in Hermes Connect;
4. one Office text canary publishes;
5. provider media ID + public permalink read back;
6. metrics endpoint reads the canary or records a precise permission blocker.

Only after that evidence should `THREADS_SECONDARY_BRAND_PUBLISH_ENABLED` and an individual secondary-brand publish flag be considered.

## Private workspace

```text
/services/hermes-connect/social-connections/
```

The page is `noindex,nofollow,noarchive`. API state is protected by the existing `HERMES_INTERNAL_OWNER` capability.

Flow:

```text
internal owner session
→ POST /api/internal/social/threads/start
→ Meta Threads Authorization Window
→ /api/internal/social/threads/callback
→ short-lived token exchange
→ server-side long-lived token exchange
→ exact profile readback
→ encrypted token persistence
→ manual exact-username verification
→ brand publish gate
→ idempotent publish
→ media/permalink readback
→ insights readback
```

## Token and state handling

- OAuth state is random, stored only as a SHA-256 digest, and expires after 10 minutes.
- Threads user access tokens are never returned by internal status APIs.
- Long-lived token payloads are AES-GCM encrypted before D1 storage.
- App secret is server-side only.
- Connection/profile metadata can be returned to the private internal-owner workspace.
- If token refresh fails, the connection moves to `needs_authorization` and publishing fails closed.
- The private workspace exposes a local disconnect action that deletes the encrypted Hermes-side connection record and immediately blocks publishing for that brand.
- Local disconnect does not claim to revoke the authorization grant at Meta; use the Meta/Threads account authorization controls when full provider-side revocation is required.

## Idempotency and ambiguous provider outcomes

Every publish request requires a unique `Idempotency-Key` / `idempotency_key`.

Publication receipts preserve:
- brand;
- object type;
- idempotency key;
- text fingerprint;
- provider media ID;
- permalink;
- provider timestamp;
- metrics snapshot;
- error class.

A reused key never publishes a second post.

If the provider request has an ambiguous network outcome, the publication is marked `unknown_outcome`. The connector does **not** blindly retry.

## Text limit

The connector enforces at most **500 UTF-8 bytes** for a Threads text post. This is intentionally conservative because Meta counts emoji according to UTF-8 bytes for the post limit.

## Current identity truth

Current website source confirms ProgressoPro:
- Instagram: `@progressopro`
- Threads: `@progressopro`

The exact Hermes Business Academy Instagram/Threads handle is not canonical in the repository. Do not guess it. Let Meta OAuth return the profile and require owner verification.

## Scheduler boundary

This connector does **not** create a scheduler.

The existing ChatGPT automation `Hermes Social Publisher` remains the current social scheduling surface. It must not call this adapter for Hermes Logistics.

After Office canary + secondary account verification, #1018 can decide how the existing orchestration invokes the ProgressoPro and Academy adapters without creating a competing recurring job.

## DONE evidence

Code readiness is not production activation.

The Office connector is only LIVE_VERIFIED after:
- runtime secrets exist;
- redirect URI is accepted by Meta;
- Office tester/profile authorization succeeds;
- identity is manually verified;
- one Office canary is published;
- media ID + permalink read back;
- no duplicate on idempotent replay;
- metrics readback is verified or the exact missing permission is recorded.

ProgressoPro / Business Academy publishing stays OFF until that Office evidence exists.
