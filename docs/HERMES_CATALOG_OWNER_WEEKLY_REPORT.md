# Hermes Catalog owner Friday report (HAE, Command Center only)

Owner configuration: every Friday 12:00 Europe/Kyiv; first target 2026-11-06. No ChatGPT/Codex scheduled task, no email/Telegram and no paid AI. Canonical issue: https://github.com/officeus-create/Hermes/issues/2209.

This is a distinct internal development audit, not the existing Catalog performance email for consenting Repair Shop business owners (#1545).

## Runtime — reuse existing HAE

The existing Hermes Automation Engine Cloudflare Worker remains the only scheduler, and existing Hermes Connect D1 remains the source of truth. Two Friday 09:00/10:00 UTC cron wakeups are added to the SAME Worker, with a Europe/Kyiv local-time guard selecting the single correct 12:00 tick across DST. These two wakeups skip all other HAE jobs. The existing :17 hourly HAE cron provides a 12:17 recovery opportunity, not another agent or service.

One D1 hermes_catalog_owner_weekly_reports row per local Friday (catalog-owner:YYYY-MM-DD), protected by atomic lease. One successful immutable weekly receipt. Failed execution can retry on the existing HAE tick. Every report records source_sha, checked_at, evidence and gaps. Private API requires HERMES_INTERNAL_OWNER. Private Command Center Today view displays report; public static content never embeds business counts.

## Evidence and truth boundaries

- /businesses/: current HTTP status, robots, canonical; live only if production 200, indexable, self-canonical.
- Profiles: existing hermes_company_profiles D1; catalog_opt_in and catalog_status explicitly separated. verified_public is not the same as self_submitted.
- Free/claimed: absent a verified tier/claim ledger, report UNKNOWN rather than inventing a free-plan or ownership claim.
- Repair Shop: existing repair_shops measured separately, not silently added to company-profile totals.
- Hermes Connect: public catalog opt-in != independently verified inquiry or booking handoff. Keep end-to-end status UNVERIFIED until matched CRM evidence.
- SEO: detect exact duplicate URL locations in the live Catalog sitemap; semantic overlap and competing client-owned city/service landing pages still require a source comparison.
- GitHub progress: bounded Catalog-title issue/open-PR/merged-PR search, linked sources. Merged PR = SOURCE_ONLY, not deployed or live verified. Unknown source is not zero.
- Exactly one deterministic next action and explicit DONE criterion.

No external sends, no visitor personal identifiers, no ChatGPT, Codex, Workers AI or paid LLM invocation.

## Release gates

1. Run winter/summer DST, wrong-time, duplicate-run, missing-source, zero-AI and anonymous-auth tests.
2. Require exact-head CI and independent code review, protected merge.
3. Perform separate reviewed HAE release, preserving publication OFF and exact production source SHA.
4. Read actual Friday Cloudflare scheduled execution + D1 report + authenticated Command Center UI, verify no second delivery/queue.
5. Until these pass: SOURCE_IMPLEMENTED, NOT_LIVE_VERIFIED.
