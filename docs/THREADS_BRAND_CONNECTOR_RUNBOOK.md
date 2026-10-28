# Threads Brand Connector — Hermes Connect

Status: **REVIEW-ONLY / OWNER OAUTH REQUIRED / PUBLISH FAIL-CLOSED**

Canonical owner: GitHub #1018 — Growth Bridge.

## Architecture

This connector is now a **donor/read surface**, not a production writer owner.

Current commercial social lanes are:
- **HERMES_LOGISTICS** — all logistics activity, including carriers, owner-operators, small fleets, dispatch/load-board, shippers/dealers and car hauling. Logistics writes converge through HAE + the shared Meta provider; this legacy connector must not become a second Hermes Logistics publisher.
- **PROGRESSOPRO** — marketing, IT/software/Hermes Connect and Academy/training. Existing `progressopro` and `business_academy` connector keys remain compatibility identities inside this one business lane.
- `office_test` remains a technical canary identity only.

The connector adds no scheduler. **HAE #2033 is the only recurring/autonomous orchestration runtime.**

## Official Threads contracts

Fresh 2026-10-29 verification uses Meta’s current official Threads workspace with `api_host=https://graph.threads.net`; repository `.com` constants are provider-drift candidates and must not be copied into new shared-provider code.

### Historical contracts checked 2026-09-29

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
threads_manage_mentions
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


## 2026-10-26 — read-only discovery draft PR #2092 (NOT MERGED / NOT LIVE)

**Owner:** GitHub issue #1018. Reuse the encrypted native secondary-brand connection (Office Test / ProgressoPro / Academy), not Windsor's Hermes Logistics connection and not a second publisher.

Draft endpoint (internal owner only, noindex/no-store):
- \`GET /api/internal/social/threads/read?brand=progressopro&mode=owned\`
- \`GET /api/internal/social/threads/read?brand=progressopro&mode=search&q=website%20design&search_type=RECENT&limit=25\`
- \`GET /api/internal/social/threads/read?brand=progressopro&mode=thread&thread_id=PROVIDER_VERIFIED_NUMERIC_ID\`
- \`GET /api/internal/social/threads/read?brand=progressopro&mode=thread&post_url=ENCODED_PUBLIC_THREADS_URL\`

**Meta permission gates:**
- Own posts: \`threads_basic\`.
- Search other public accounts: app-reviewed \`threads_keyword_search\` plus \`threads_basic\`.
- Read a known ID's conversation: \`threads_read_replies\` plus \`threads_basic\`; third-party eligibility must be validated with the actual provider readback.
- Resolve a public permalink from an author's visible profile: \`threads_profile_discovery\` additionally. It is *allowlisted but not a default OAuth scope*. Request app review, set \`THREADS_BRAND_SCOPES\`, reconnect the exact brand, and inspect the stored \`granted_scope\` before testing.
- Meta may restrict access to third-party conversations even with scopes, and search ranking is not exhaustive; a \`complete=false\` result is not all comments.

**One-post acceptance target:** \`https://www.threads.com/@tsapushel_olena/post/De6z1w-iAC5\`. Do not claim competitors' prices were collected until provider returns the author's post, accessible comment pages, stable IDs, and a bounded coverage record. There is no third-party cookie/anti-bot bypass.

**Commercial follow-up:** Treat raw quotes as proposals (not verified prices). Human review -> compare scope/currency/delivery/hosting/SEO/design -> optional approved reply -> tracked CTA -> human-qualified CRM opportunity -> revenue receipt. The private reply endpoint `POST /api/internal/social/threads/reply` now performs owner/scopes/target/owned-root proof only and then submits an idempotent `social.reply` job to HAE. It does **not** write Meta directly and does not maintain a second publication lifecycle. Until HAE independently enables and accepts `social.reply`, the endpoint fails closed with `hae_social_reply_capability_not_ready`. Never bulk unsolicited comments, scraped-profile messaging, automated posting on outside discussions, or blind retries after ambiguous provider outcomes.

**Status gates:** CODED \`#2092\` does not mean CI_GREEN, MERGED, LIVE_VERIFIED, META_SCOPE_APPROVED, or SOURCE_COMPLETE. The Threads contract unit tests run inside \`scripts/threads-brand-connector.test.mjs\`; owner and release gates are unchanged.


## 2026-10-29 — Social Acquisition supersession

This runbook is no longer authority for an independent brand publisher. The canonical execution model is `VIKTOR/content policy -> HAE #2033 -> shared Meta provider -> provider receipt/readback -> Unified Inbox/Command Center`. Current read modes include owned posts, conversations, keyword-search candidates and mentions. Keyword results never authorize replies. Threads DMs remain manual until an official API endpoint and exact app/account entitlement are freshly proven.


### HAE reply handoff configuration
The owner-only reply gateway requires server-side Pages/Worker secrets/variables:

```text
HERMES_AUTOMATION_BASE_URL=https://<authorized-hae-host>
HERMES_AUTOMATION_TOKEN=<server-side bearer secret; never exposed to browser>
```

The endpoint submits `POST /v1/jobs` with `job_type=social.reply` and `max_attempts=1`. Missing configuration, an unavailable HAE endpoint, or `job_type_not_allowed` all fail closed with `provider_write_performed=false`.
