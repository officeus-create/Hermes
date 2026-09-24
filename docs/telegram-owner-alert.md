# Hermes private owner alerts

Scope: a server-to-server path for private operational alerts to Vladimir. This is a proposed replacement for TaskNotify's two-message daily quota. It does not publish to any group, read Telegram history, bypass the Telegram Approval Gateway, or provide a ChatGPT connector by itself.

Endpoint: POST /api/internal/owner-alert

Protected environment bindings (never commit values):
- DB: existing D1 binding.
- HERMES_OWNER_ALERT_SERVICE_TOKEN: random high-entropy service bearer token, at least 32 characters.
- HERMES_OWNER_ALERT_BOT_TOKEN: a verified Hermes-owned Telegram bot token from the approved secret store. Rotate/revoke the historical exposed credential under #932 first; do not reuse it.
- HERMES_OWNER_ALERT_CHAT_ID: verified numeric private owner DM, not a group.

JSON payload: source (email | telegram | hermes_connect | system); code (REPLY_DUE | FOLLOW_UP_DUE | SERVICE_FAILURE | APPROVAL_PENDING); reference (non-PII opaque 8–80-character identifier); idempotency_key (unique non-PII opaque 16–128-character identifier). No free-form message or recipient field is accepted. The server constructs the text and sends only to the configured private owner chat.

The DB records each idempotency key before the network call. A duplicate never sends again. If Telegram's response is ambiguous, the record stays uncertain for operator reconciliation; an automatic retry could duplicate the notification. A successful Bot API message_id is stored privately in D1; the HTTP response contains no token, chat ID or message ID. Keep the bearer token solely in a secured internal caller, never browser JavaScript, a URL, or a public document.

This route is an internal DM delivery primitive. The existing approval system still owns all group, campaign, commercial, financial, client-facing and other outbound publications. Never route those categories through this endpoint.

Before activating:
1. Close #932 with private provider-side credential rotation evidence and confirm ownership of the selected bot and owner DM.
2. Set protected bindings in the authorized production environment, under the existing account/permission gate.
3. Connect the existing approved ChatGPT-to-Hermes transport or other authorized internal alert producers. TaskNotify cannot be redirected just by deploying this endpoint.
4. Run `node --experimental-strip-types scripts/owner-alert.test.mjs`, current-head CI, and a controlled private owner-DM canary. Verify Bot API message_id, private readback and duplicate suppression; confirm zero group posts.
5. Record the deployed revision, DM receipt and any uncertain rows in the current Telegram closure board. Only then migrate alert producers and stop using TaskNotify for those alerts.

Never send the bot token, service token, or chat ID in a task description, GitHub issue, or chat transcript.