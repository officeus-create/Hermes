# Google Access Governor

Status: canonical cross-agent Google access policy for Hermes.

## Goal

Hermes can use many AI agents, plugins and connectors internally without turning Google access into duplicate polling, competing writes, quota evasion or ambiguous evidence.

Core rule:

`many agents -> one Google resource owner -> cached evidence -> shared readback`

This document governs Google Search Console, Google Analytics 4, Google Business Profile and other Google resources reached through Hermes agents/connectors.

## Resource identity

Before a Google call, define one resource key:

`provider + company/client + resource type + resource id/property/site`

Examples:

- `google:gsc:hermes:sc-domain:hermeslogisticsus.com`
- `google:ga4:hermes:property:547903956`
- `google:gbp:mzm:<authorized-location-id>`

Never treat “Google” as one undifferentiated connector.

## One primary reader

Each resource key has one primary recurring reader.

Use fresh cached/readback evidence instead of having every agent query Google again. A second connector is allowed only when it supplies a distinct capability or a bounded independent verification that the primary connector cannot provide.

Example:

- routine Hermes GSC performance -> current primary GSC reader;
- exact URL Inspection -> specialized connected reader only when needed;
- do not run both as permanent duplicate pollers.

A second connector is not a quota-evasion mechanism.

## One write owner

For each Google resource, only one connector/agent owns live writes at a time.

Other agents may:

- analyze;
- recommend;
- prepare a verified field delta;
- review evidence.

They must not independently execute the same live mutation.

Before a Google write require:

1. exact resource identity;
2. verified management right/business relationship;
3. current connector authorization and capability;
4. current-state readback;
5. duplicate/idempotency guard;
6. bounded intended mutation;
7. post-write readback.

## Quota/throttle behavior

On quota, throttle or rate-limit errors:

- do not fan the same request out through another plugin, Google account, OAuth project or user;
- do not create a replacement property/account to work around access/quota;
- reuse cache where valid;
- reduce duplicate reads;
- batch when the provider supports it;
- back off and classify `THROTTLED / RETRY_LATER`.

Missing rows after a bounded/throttled read remain UNKNOWN or NOT_OBSERVED_IN_AVAILABLE_WINDOW as appropriate. They are not automatically zero.

## OAuth and least privilege

Use the least-privileged connector/scope that can perform the task.

Keep these states separate:

`ACCOUNT_AUTHENTICATED != RESOURCE_VISIBLE != READ_ALLOWED != WRITE_ALLOWED != BUSINESS_AUTHORIZED != OPERATION_VERIFIED`

Do not connect multiple Google accounts “just in case”.

## Gmail + ChatGPT low-friction fast path (CEO direction, 2026-10-15)

Goal: security must not unnecessarily slow the CEO's normal work with the separately authorized executive and office mailboxes or ChatGPT. **This is a workflow policy and acceptance contract, not a changed Google permission or a working latency guarantee.** Do not publish private mailbox identifiers, OAuth grants, message contents or account membership lists in GitHub.

### Separate risk tiers, not a universal login bypass

| Tier | User action | Required control | UX objective |
| --- | --- | --- | --- |
| FAST_READ | Search/list/read approved mail and threads; inspect authorized attachments; summarize; classify; compare against project context | Existing valid provider OAuth connection and per-mailbox read scope, provider authorization, privacy and tenant isolation | No repeated owner approvals or extra sign-in on each ordinary read while the authorized session and grants remain valid |
| FAST_PREPARE | Compose a *local* proposed response, decision note, or unsent draft when the connector exposes the authorized capability | Verified mailbox identity, supported draft scope for Gmail draft writes, distinguish draft creation from local text; no send; no implicit external recipients | One bounded preparation step; avoid duplicated searches and redundant full-inbox scans |
| CONTROLLED_WRITE | Send/reply/forward externally; modify labels/archive/trash/delete; share/forward private mail content into another system; change mail routing | Exact mailbox, action, target, explicit applicable owner permission, correct provider scopes, independent authorization and recipient/suppression gates | Confirm only the consequential requested action rather than re-authorizing unrelated reads |
| STEP_UP | New mailbox/plugin/scope, sensitive access, cross-tenant or new staff delegation, account recovery, MFA/security configuration, tokens, automatic sending rules | Strong provider authentication/consent as necessary, least privilege, per-operation review and audit/revocation | Challenge only for genuine changed risk; never weaken provider MFA or authorization |

**Standing external-email rule:** AI agents, ChatGPT, plugins and automations must not send emails from any Hermes/CEO/office mailbox without a new explicit authorization for the **specific send**. This includes replies, forwards, scheduled sends and internal dispatcher mail. Do not contact current dispatchers or use their inboxes for tests. Read-only analysis and local drafting do not require send permission. Creating a draft in the mailbox (unlike drafting text in chat) is a separate Gmail write and needs an existing authorized draft capability.

**Per-mailbox identity:** executive and office mailboxes are distinct resources. A connected ChatGPT/Gmail plugin may access only mailboxes actually exposed by its authorized grant; user statements, an email string, a repository role, a Hermes account session or access to one mailbox do not imply rights over another. Do not share login sessions, passwords, raw refresh tokens, impersonation or global superadmin access across accounts or agents.

### Performance architecture (reuse existing connectors)

1. Route a request to exactly one already-connected provider/reader **per authorized mailbox**. Do not open more OAuth dialogs or ask for existing permissions again for every read. If absent, report `ACCESS_GAP` once with a precise action instead of retrying other identities.
2. Prefer targeted `threadId` reads, filters/search and Gmail incremental change sync (`users.history.list`) over repeated full-mailbox fetches. Keep provider history cursor per mailbox and recover a stale/invalid cursor with a bounded resync, never silently treat missing history as empty.
3. Cache only authorized, minimum-necessary readback/results with owner-defined freshness/retention; keep private email bodies and attachments within the authorized platform context. Do not make a cross-agent public cache, D1 mirror or second inbox by default. On revocation, scope change or expiry invalidate dependent cache and stop reads.
4. Use bounded batching, dedupe, and provider-compliant backoff; no quota bypass through other OAuth clients or plugins. Avoid duplicate summaries/LLM passes if one fresh source-backed answer is adequate.
5. Keep read/prepare paths independent of live send gates: a disabled sender must not disable legitimate incoming email, search, reading or the user's own Gmail UI. Never block owner manual Gmail actions by changing transport, MFA, DNS, Workspace admin policy or inbox rules under this documentation change.
6. Before any real write, apply mailbox-specific scopes and controls **once for that requested action**; no hidden bulk/standing send permissions. Existing authentication expiration or high-risk provider step-up still takes precedence over latency.
7. If a mailbox connection is unavailable, operate on already-provided information where lawful and label the mailbox state UNKNOWN. Do not claim that editing this policy activates an app integration.

### Acceptance and measurement (proposed, not yet measured)

- Authenticated read test per approved mailbox: routine search -> targeted thread read -> relevant brief without another unnecessary login prompt; record observed wall time and requests, with no PII copied into telemetry.
- Cache hit / incremental sync tested separately; source timestamp and account boundary remain visible. Provider error/rate limit triggers accurate `THROTTLED` or `ACCESS_GAP`, not identity switching.
- Draft request produces only clearly marked unsent text or an explicitly permitted provider draft; any external send from ChatGPT/agents remains **ZERO** until a particular approved send.
- Revoked scope/user/membership -> immediate fail-closed read/write on new requests. Cross-mailbox access and stale session are denied.
- Measure p50/p95 end-to-end time for FAST_READ and FAST_PREPARE over representative authorized cases, plus login prompts, duplicate calls, rate limits and false blocks. Optimize measured bottlenecks; do not claim a target is achieved without live authorized telemetry.
- Distinguish `POLICY_DEFINED`, `CONNECTED_AUTH_VERIFIED`, `MEASURED_FAST_PATH` and `PRODUCTION_VERIFIED`. This document is **POLICY_DEFINED** only.

Primary vendor references: [Gmail incremental history API](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list); [Google Workspace OAuth app access controls](https://support.google.com/a/answer/7281227). Google scopes and authorization must be verified in the specific owner-managed account, not inferred from these docs.

### Bounded authorized baseline — 2026-10-15 (metadata only)

An existing connected Gmail plugin performed one **read-only targeted message-ID search per independently selected executive and office connection**, in parallel. Both calls returned normally; recorded connector-call wall times were approximately 510 ms each. No message bodies/subjects, message IDs, raw account grants, private addresses, labels, or recipients were copied into this public artifact. No mail was sent, drafted, marked, or moved; no account settings were changed.

Classification: `METADATA_SEARCH_AUTH_VERIFIED` **for the two tested connections in this session only**. This confirms neither ongoing access nor actual message-body reading, permission to send, p50/p95 latency, history-sync support, provider session expiry behavior or production SLA. Follow with consented, bounded first-party thread-read performance samples and explicit account isolation/expired-session tests when those are the active task. Do not repeatedly probe either account solely to increase a performance sample.

## Google Business Profile

Google Business Profile management access is for businesses Hermes is authorized to manage.

Do not use GBP management connectors/APIs as a bulk prospecting crawler for unrelated businesses.

For an authorized client profile:

- read before writing;
- reconcile conflicts against dated first-party facts;
- preserve disagreement/UNKNOWN rather than synthesizing a value;
- one write owner only;
- update only verified fields;
- read back after the write.

A public listing, client website, public email, CRM row or Hermes relationship does not by itself prove GBP management authorization.

## Current Hermes defaults

Until superseded by newer evidence:

| Resource | Primary lane |
|---|---|
| Hermes GSC routine performance | existing connected GSC reader |
| Exact GSC URL Inspection | specialized connector only for the inspection task, when connected |
| Hermes GA4 | Windsor connected Hermes property |
| Authorized client GBP read/write | Windsor Google Business Profile connector |
| Other agents/plugins | consume normalized receipts instead of re-polling Google |

## MZM-specific current boundary

As of 2026-10-10:

- MZM GA4 measurement code is publicly visible on the client site, but the current authenticated Google Analytics session exposes no MZM property;
- do not create a replacement GA4 account and do not rotate through multiple Google accounts to search for it;
- Windsor supports Google Business Profile read/write operations, but the actual MZM GBP account/location is not connected yet;
- do not mutate MZM GBP until the real location is authorized and read back;
- missing Google access remains ACCESS_GAP, not zero traffic/leads/revenue.

## Required access receipt

Before repeated Google work, record:

`RESOURCE_KEY | PRIMARY_CONNECTOR | OPERATION | CACHE_STATE | AUTH_STATE | QUOTA_STATE | ACTION`

Allowed actions:

- `USE_CACHED_EVIDENCE`
- `PRIMARY_READ`
- `SPECIALIZED_READ`
- `AUTHORIZED_WRITE`
- `BACKOFF_RETRY_LATER`
- `ACCESS_GAP`
- `HOLD_NO_BUSINESS_AUTHORIZATION`

## Do not

- use a second plugin to bypass a quota;
- run duplicate recurring GSC/GA4 scans by default;
- let multiple agents race the same GBP write;
- create replacement Analytics/Search/Business resources because the real client resource is unavailable;
- infer management rights from public data;
- convert missing/blocked evidence into zero;
- expose OAuth credentials, cookies, tokens or secrets in repository artifacts.

The governor coordinates access. It does not create a second analytics/search/profile system.
