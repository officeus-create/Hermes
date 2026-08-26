# Google Workspace API rollout — owner/admin procedure

## Gate

This procedure is intentionally **not executed** by this repository task. It requires an authorized Workspace administrator, a verified mailbox mapping, and an owner-approved external account action.

## Minimum access

Use an OAuth principal that is authorized to update the target mailbox’s Gmail settings. For an administrator-managed rollout, use a service account with Google Workspace domain-wide delegation **only after** a Workspace super administrator has approved the exact scope and mailbox list.

- Gmail API method: `PATCH https://gmail.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}`
- Request body field: `signature` (the compact HTML string)
- Minimum documented OAuth scope: `https://www.googleapis.com/auth/gmail.settings.basic`
- `userId`: the target mailbox or `me` only for the currently authorized mailbox.

Do not request mail-reading, mail-sending, Drive, Calendar, Admin SDK, or full Gmail scopes for this signature-only rollout unless a separately approved task proves they are required.

## Safe sequence

1. Build the final mailbox inventory from an authorized corporate source. Record only business-safe mapping facts in a private approved system; do not commit them.
2. Validate each selected HTML file with `node scripts/validate-gmail-signatures.mjs`.
3. In a non-production/test mailbox, call `users.settings.sendAs.get` to confirm the target send-as address. Do not print tokens or unrelated mailbox data.
4. Run a dry-run locally: resolve mapping → validate signature file → show only mailbox address + SHA-256 of HTML + selected template. Do not issue a PATCH request.
5. After explicit owner/admin approval, PATCH one verified test mailbox.
6. Re-read only that send-as setting and compare the stored signature hash to the intended HTML hash.
7. Have an authorized human send a test email to an approved internal test recipient and inspect desktop/mobile rendering. This is an external communication gate.
8. Roll out in small batches. Record mailbox, template SHA-256, actor, time, API result, and rollback file in a private access-controlled log.

## Request example (redacted)

```http
PATCH /gmail/v1/users/partnership%40hermeslogisticsus.com/settings/sendAs/partnership%40hermeslogisticsus.com HTTP/1.1
Authorization: Bearer [short-lived-access-token-not-stored-in-repository]
Content-Type: application/json

{"signature":"[validated compact HTML from docs/email-signatures/html/partnerships.html]"}
```

## Rollback

Before every PATCH, retrieve the current signature and store it only in the approved private admin log. Restore it with the same endpoint if verification fails. A repository agent must not perform this external account action without a new explicit owner instruction.
