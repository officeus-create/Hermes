# ProgressoPro Telegram cloud cutover

This Worker replaces the Mac-hosted outbound sender for the **existing** `progressopro1_BOT` in the existing Marketing IT group. It creates no bot or Telegram account. The existing owner approval, PII, pause and dedupe contracts must be preserved before switching production. The Google Sheet Bot Inventory and GitHub #1293 remain the ownership/operating record; this README is the deployment procedure, not a new board.

## Current status

Review code only. No live endpoint, webhook, bot token, owner ID, group write, or message receipt has been verified from this branch. Do not switch off an operating Mac process just because this code passes unit tests. Other bots (Marketing AI's Make.com webhook, Academy AI, private Sales Coach, Hermes Connect) remain separate consumers and are **not migrated by this Worker**.

## Private cutover (requires owner-approved account/secret/deploy action)

1. Identify the **existing** Cloudflare account and approved Hermes D1. Do not create a duplicate database or deploy from the retired Mac. Check #932: rotate/revoke any historically exposed bot token in BotFather privately; never put a token in GitHub, Drive, issue comments, logs or a ChatGPT prompt. Coordinate the token change with the old bot owner before switching. Stop its old `getUpdates` poller; verify no second poller/webhook is consuming the same bot. Do not change the separate Make.com owned Marketing AI webhook.
2. Confirm privately the owner numeric Telegram user ID and the target group ID against the canonical Bot Inventory and `getChat`/`getChatMember`; historic membership alone is insufficient. The existing bot must be an administrator in this group. Restrict inbound producer to the authenticated Hermes source that produces the reviewed per-client reports. Do not publish CRM credentials, client PII or unverified outcomes.
3. Review/apply `migrations/0001_outbox.sql` against the approved existing D1; wire its `database_id` in a private Wrangler config. Set `OWNER_USER_ID`, `GROUP_CHAT_ID`, `EXPECTED_BOT_USERNAME`; leave `TELEGRAM_SEND_ENABLED=false` and `GROUP_PAUSED=true`. Store `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `PRODUCER_SECRET` as **Cloudflare secrets**. Keep the production route's hostname private in operations and protect the proposal endpoint with the producer secret. If this account is not already approved for this worker, obtain the owner account/deploy decision before connecting it.
4. Deploy through the approved CI/release path, then call Telegram `setWebhook` for this bot with the HTTPS `/telegram/webhook` URL, `secret_token`, and `allowed_updates=["callback_query"]`. Check `getWebhookInfo` and bot identity. Owner must first open the bot in a private Telegram chat so it can send preview DMs. Keep group sending paused. Test a single credential-free synthetic proposal: exact owner preview, one approval callback, replay no-op and rejection no-op. Test a second synthetic approved proposal outside Chicago working hours: zero group sends. Remove/cancel synthetic approved entries before enabling group sends.
5. Only after approval and explicit release decision, set `TELEGRAM_SEND_ENABLED=true`, `GROUP_PAUSED=false`. Submit one separately approved non-sensitive group canary in Mon–Fri 09:00–17:45 America/Chicago. Check `telegram_outbox.telegram_message_id`, the returned destination, **independent Telegram group readback**, and no duplicate on the next scheduled trigger. Mark a real report delivered only with this evidence. Record the exact deployed SHA, URL, message ID and readback in #1293 / Bot Inventory without secrets or PII.
6. For rollback set `GROUP_PAUSED=true` first; preserve outbox rows and receipts. Do not resume a second poller or requeue `sending`/`ambiguous` rows without manually reading the target group and reconciling by message ID/content. If the Worker fails, the safe state is pending reporting, not invisible replay.

The Worker accepts only `client_progress` proposals: `{ "id": "stable_source_event_id", "kind": "client_progress", "text": "verified non-private report" }` with `Authorization: Bearer <PRODUCER_SECRET>`. One stable ID per intended report. A `409 duplicate_id` means an existing row owns that ID; inspect its state before acting. A `502 preview_unconfirmed` leaves a pending row; reconcile the owner DM and row rather than blindly retrying with a new ID. Review receipts in D1 without printing message text or secrets to logs. Owner-only incident alerts and the other four bot workloads are tracked in #1293; this group-specific Worker does not claim to replace TaskNotify for private alerts.

## Operational limits

- The Bot API `sendMessage` response provides a Telegram message ID but does not prove a human saw the post; use an independent group readback.
- Claim-before-send prevents concurrent duplicate attempts. If Telegram accepts a request but the network fails before the response, the row becomes `ambiguous` and requires manual reconciliation.
- Cron runs in UTC; delivery uses `America/Chicago` with daylight-saving awareness. The fail-closed configuration starts paused and disarmed.
- The regular expression is a basic credential guard, not a full privacy scanner. The source must supply a redacted report and the owner must review it before approval.
- This Worker has no automatic producer for CRM status; integration with an authorized cloud producer is required before customer reports become automatic.

Run focused tests: `node --test workers/telegram-gateway/test/gateway.test.mjs`.
