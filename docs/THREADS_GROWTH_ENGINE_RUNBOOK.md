# Threads Growth Engine — ProgressoPro

Status: **REVIEW / CONFIGURATION REQUIRED**  
Created: 2026-09-29  
Owner: ProgressoPro / Hermes Technology

## Goal

Turn Threads from a manual posting surface into a measurable acquisition loop:

`post → reply → useful conversation → commercial intent → Hermes website / CRM → measurable lead`

The engine is intentionally fail-closed. It does not publish anything until the required provider credentials are configured and `THREADS_AUTOMATION_MODE=live`.

## What this slice adds

- polling of recent account posts and replies;
- reply deduplication in D1;
- AI reply drafting through the OpenAI Responses API;
- same-language replies;
- deterministic escalation for legal, security, payment-dispute, medical and other sensitive terms;
- dry-run mode that stores reply candidates without publishing;
- live mode that publishes only AI decisions marked `reply`;
- bounded replies per run;
- run-level metrics for posts scanned, comments scanned, replies published, review-required and skipped.

## Required private configuration

Do **not** commit any value below.

- `THREADS_AUTOMATION_MODE=dry_run` for initial verification; switch to `live` only after a successful dry run.
- `THREADS_AUTOMATION_TOKEN` — scoped secret used only by the scheduler calling the Hermes endpoint.
- `THREADS_ACCESS_TOKEN` — Threads API access token.
- `THREADS_USER_ID` — connected Threads user ID.
- `THREADS_USERNAME` — account handle without @, used to avoid replying to the account itself.
- `THREADS_GRAPH_BASE` — exact current Threads Graph API base verified against Meta developer documentation before activation.
- `OPENAI_API_KEY` — project-scoped OpenAI API key.
- `THREADS_AI_MODEL` — optional; defaults to `gpt-5.6-luna`.
- `THREADS_MAX_REPLIES_PER_RUN` — optional; defaults to 8 and hard-caps at 25.

## Endpoint

`POST /api/social/threads/run`

Header:

`Authorization: Bearer <THREADS_AUTOMATION_TOKEN>`

The endpoint is designed for a scheduler (for example every hour or every four hours). It is not a public browser endpoint.

## Activation sequence

1. Connect the ProgressoPro Threads account to the chosen provider/Meta app.
2. Configure all secrets privately.
3. Keep `THREADS_AUTOMATION_MODE=dry_run`.
4. Run the endpoint and inspect D1 `threads_growth_reply_state`.
5. Confirm language matching, tone, claim boundaries and deduplication.
6. Run again and confirm the same comments are not duplicated.
7. Set a conservative scheduler cadence.
8. Only after review, set `THREADS_AUTOMATION_MODE=live`.
9. Verify one real reply in Threads and one matching `published` row.
10. Track Threads UTM traffic and downstream business-lead outcomes; do not treat views alone as revenue.

## Content strategy

Recommended posting mix:

- 30% direct business questions;
- 25% build-in-public product/process observations;
- 20% contrarian but defensible opinions;
- 15% mini case/problem breakdowns using verified evidence only;
- 10% direct low-friction offers.

The engine should optimize for useful replies and qualified conversations rather than raw post count.

## Safety / anti-spam rules

- Never fabricate customer results, rankings, traffic, leads or revenue.
- Do not auto-reply to sensitive legal/security/payment-dispute/medical messages.
- Do not reply repeatedly to the same comment.
- Do not mass-tag or scrape unrelated accounts.
- Do not post credentials or private customer data.
- Keep a low cap per run during the first week.
- A high view count is not a qualified lead or revenue metric.

## Current blocker

Metricool is installed in ChatGPT, but the connected Metricool brand currently has **no social network connected**. Threads must be connected there (or through the Meta app used for direct API publishing) before live scheduling/analytics can be used.


## Official Threads API contract verified 2026-09-29

Before activation, the implementation was checked against current Meta Threads developer documentation.

Current verified API base:
`https://graph.threads.com/v1.0/`

Required permissions for this engine:
- `threads_basic`
- `threads_content_publish`
- `threads_read_replies`
- `threads_manage_replies`
- `threads_manage_insights`

The reply reader uses the owned root post's `/{media-id}/conversation` endpoint so nested conversation replies can also be discovered. Text posts and text replies use the current `auto_publish_text` capability.

## Performance feedback loop

Every four hours the engine refreshes media-level Threads insights for recent published posts:
- views
- likes
- replies
- reposts
- quotes
- shares

Performance is stored by content theme. Once a theme has at least two measured samples, 70% of future slots may exploit the highest-performing measured theme while 30% remain exploratory. This is a lightweight bandit-style loop, not a guarantee that past winners will keep winning.

Primary success hierarchy:
`views → useful replies → profile/link clicks → qualified business inquiry → opportunity → revenue`

Views are an optimization signal, not the final business KPI.
