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
