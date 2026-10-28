# HAE Threads: optional direct Meta transport (2026-10-28)

Canonical owners: GitHub #1018 Growth Bridge; HAE #2033. This is a narrow transport option **inside the existing** Cloudflare Cron → Queue → D1 pipeline. It does **not** create an additional scheduler, publisher, social profile, author identity, local token file or ledger. Existing `Hermes Social Publisher` ChatGPT task must remain disabled; do not operate two writers.

## Existing connected account and failure

- Target: `@hermes.logistics`, Threads account ID `28419597014385166`. Content is exclusively U.S. car-hauling carriers/owner-operators/small fleets, not generic IT/SEO/marketing.
- Windsor.ai profile `officeus@hermeslogisticsus.com` has 3 connected accounts and FREE allows 1. A real authenticated 2026-10-28 data read returned a synthetic account-limit warning **in the post fields** instead of posts. Do not publish/assume readback with that result.
- Existing canonical Google Sheet: `HERMES SOCIAL — ORGANIC DISTRIBUTION LEDGER — CURRENT`, with PUBLISH_LEDGER and out-of-band post/repost reconciliation. Before any provider canary, reconcile all owned/out-of-band posts and any unresolved D1 publications. No blind re-send.
- Cloudflare Wrangler on inspected Mac had no authenticated session; the existence of code is not evidence of live Cloudflare secrets or a deployed worker. Do not mark production as running based on local tests.

## Runtime config

The opt-in transport requires, **only when owner-authorized Meta OAuth tokens are proven working**, private env/secret values in the existing HAE Worker:

```text
HERMES_THREADS_PROVIDER=meta_direct
HERMES_THREADS_META_ACCOUNT_ID=28419597014385166
HERMES_THREADS_ACCESS_TOKEN=<Threads USER token from official Meta OAuth, secret binding only>
```

The token must have `threads_basic` + `threads_content_publish` and be valid for `@hermes.logistics`. Do not confuse IG, FB Page and Threads tokens; never store it in Git, README, local test fixtures or log files. Manage expiration/refresh with the existing approved Meta social credentials lifecycle; this patch does not invent a second token manager. The default provider stays Windsor when `HERMES_THREADS_PROVIDER` is absent. The other Hermes/ProgressoPro/Academy brand connectors remain unchanged and still disallow Hermes Logistics duplication.

Existing HAE production publication guards must remain separate and disabled by default:

```text
HERMES_AUTOMATION_MODE=dry_run
HERMES_AUTOMATION_PUBLISH=disabled
```

**No one should flip them until** explicit independent QA/owner release, fresh Cloudflare Cron → Queue → D1 evidence, Meta exact-account authenticated readback of newest >=30 (API limit 50), reconciliation of all ambiguous/out-of-band posts, zero unresolved HAE publication rows, a scoped canary with exact provider ID/permalink, and correct no-duplicate replay across the cutover.

## Exact semantics

- Before a provider write, HAE calls `GET /me?fields=id,username` and `GET /me/threads?fields=id,text,permalink,timestamp,media_type&limit=50` against the Meta Threads Graph API. Any wrong identity, malformed feed, token error, identical recent content, future timestamp or 3h15m recent own-post cooldown blocks the slot **before** the D1 provider claim.
- A successful preflight is not enough by itself. Existing D1 claim and same-slot idempotency are mandatory. Any unresolved prior D1 provider write blocks switching provider.
- Successful provider dispatch uses the documented 2-step Meta Threads API `/{user_id}/threads` TEXT media container then `/{user_id}/threads_publish`. Provider publication is **never blindly retried**, including 5xx/connection uncertainty.
- Existing D1 lifecycle schedules bounded `publication.readback` rechecks using native authenticated feed; only exact post text + numeric provider ID + valid Threads permalink can mark `published_verified`.
- Readback of REPOST_FACADE may have null text; valid ID and timestamp are still required and its recency still blocks a new authored post.
- All errors return bounded error classes, never tokens or raw OAuth responses.

## Test instructions

```bash
node --check workers/automation-engine/src/meta-threads.mjs
node --check workers/automation-engine/src/index.mjs
node scripts/hae-meta-threads-transport.test.mjs
node scripts/hae-windsor-plan-gate.test.mjs
node scripts/hae-threads-schedule-contract.test.mjs
node scripts/automation-engine-contract.test.mjs
```

Recorded Mac tests: native **19 mocked cases PASS**, Windsor plan-limit **7 cases PASS**, cadence **20 hourly Chicago slots with 4 quiet slots PASS**, HAE base contract PASS. No actual Threads provider post, no Cloudflare secret changes, no deployment. A controlled production canary remains an independent owner-gated step.

## Roles and ownership

Claude: site design, load-board, SEO/GEO — untouched. Codex: Command Center PR #2107/#2159 — untouched. HAE Threads #2167 only: readback-safe optional provider transport under Growth Bridge #1018. Do not create a second owner issue/brain or a duplicate public publishing queue.