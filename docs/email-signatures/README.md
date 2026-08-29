# Hermes Gmail signature rollout package

**Status:** `SIGNATURES_CREATED = COMPLETE`

**Deployment status:** `SIGNATURES_DEPLOYED = BLOCKED_BY_ACCESS`

This package is a compact, Gmail-safe signature set for Hermes corporate mailboxes. It is a rollout package only: it does not connect to Google Workspace, inspect mail, send mail, or modify a mailbox.

## Canonical source and safety boundary

- The HTML files in `html/` are the canonical copy/paste artifacts for this rollout.
- `mailbox-mapping.schema.json` is a data contract, **not** an inventory of real people or mailboxes.
- Only the Partnerships shared mailbox, phone, and website listed in `mailbox-mapping.example.json` are confirmed for this task.
- Do not invent a name, role, phone, mailbox owner, department logo, or office address. Leave unknown fields blank and use the generic department template.
- No separate approved email-ready department logos were recovered from the current repository. The approved fallback is the compact text-only Hermes master branding plus a department label; no emoji, external logo URL, base64 image, tracking pixel, JavaScript, form, or interactive control is used.

## Files

| Path | Purpose |
| --- | --- |
| `html/master-compact.html` | Shared compact markup contract and styling reference. |
| `html/personal-template.html` | Use only after name, role, department, and contact details are confirmed. |
| `html/generic-template.html` | Shared mailbox template without an invented person. |
| `html/partnerships.html` | Ready-to-use confirmed Partnerships signature. |
| `html/{logistics,marketing,academy,technology-it,hermes-connect,hr-recruiting,general-office}.html` | Department-specific generic variants requiring only verified mapping data before installation. |
| `mailbox-mapping.schema.json` | Machine-readable validation contract. |
| `mailbox-mapping.example.json` | Redacted/example rollout inventory; not a source of identity facts. |
| `WORKSPACE_API_ROLLOUT.md` | Least-privilege Google Workspace deployment procedure. |
| `../../scripts/validate-gmail-signatures.mjs` | Offline safety/HTML/link validator. |

## Installation without API access

1. Open the applicable HTML file in a browser or text editor.
2. Copy the rendered signature, then paste it into Gmail Settings → **See all settings** → **General** → **Signature**.
3. Assign it to the correct sending address and set the desired defaults for new messages/replies.
4. Send a test message only when an authorized human approves that external communication.
5. Confirm links, mobile wrapping, and the selected department against the verified mailbox mapping.

The text is deliberately short so generic addresses remain useful on narrow screens. It must not be expanded with unverified claims, employee data, or tracking.

## API route

For an authorized Workspace administrator, use the Gmail API `users.settings.sendAs.update` endpoint. The endpoint’s `signature` field is HTML. The exact least-privilege prerequisites, dry-run procedure, scope, and post-install verification are in [`WORKSPACE_API_ROLLOUT.md`](./WORKSPACE_API_ROLLOUT.md).

Never paste an OAuth token, service-account key, API key, or mailbox password into this repository, a mapping file, a PR, an issue, or an agent prompt.
