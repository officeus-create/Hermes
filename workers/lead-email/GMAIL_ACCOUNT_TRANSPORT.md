# Password-reset Gmail account transport

Purpose: free-only outbound transport for Hermes Repair Shop password-reset mail without creating a second Worker or auth stack.

## Boundary

The existing private `hermes-lead-email` Worker remains the only mail-delivery Worker.
Only `/v1/send-account` may opt into Gmail API.
Lead, inquiry and carrier-contract mail stays on the existing Cloudflare `EMAIL` binding.

Activation is OFF by default.

## Required Google authorization

Use one owner-approved Google Workspace OAuth client/principal for the Hermes mailbox with only:

`https://www.googleapis.com/auth/gmail.send`

Do not request Gmail read, modify, Drive, Calendar or Admin SDK scopes for this transport.

The authorized mailbox must be allowed to send as the configured `SALES_SENDER` address. If `website@hermeslogisticsus.com` is used, verify it is an approved Workspace send-as alias before activation.

## Worker secrets

Store these only as Cloudflare Worker secrets:

- `GMAIL_OAUTH_CLIENT_ID`
- `GMAIL_OAUTH_CLIENT_SECRET`
- `GMAIL_OAUTH_REFRESH_TOKEN`

Never commit, log, paste into issues, or expose these values.

## Activation

Set Worker variable:

`ACCOUNT_EMAIL_TRANSPORT=gmail_api`

Keep `SALES_SENDER` at the approved aligned Hermes sender.

The Worker exchanges the refresh token at Google's OAuth token endpoint and sends the RFC822 message through Gmail API `users/me/messages/send`.

## Production proof required for #611

1. Send one explicitly synthetic forgot-password request for a controlled Shop Owner account.
2. Confirm the reset email arrives in the controlled inbox.
3. Verify SPF/DKIM/DMARC alignment on the received message.
4. Use the reset link exactly once.
5. Confirm prior authenticated sessions are invalidated.
6. Confirm a second token use fails.
7. Clean synthetic reset state.
8. Confirm unknown-account acknowledgement/timing remains indistinguishable.

## Rollback

Remove or change `ACCOUNT_EMAIL_TRANSPORT` from `gmail_api`.
No lead/contract delivery path changes are required for rollback.
Do not delete the existing Cloudflare `EMAIL` binding.
