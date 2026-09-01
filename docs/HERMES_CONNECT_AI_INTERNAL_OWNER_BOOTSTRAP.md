# Hermes Connect Internal AI — one-time owner activation

## Purpose

Hermes Internal AI must not infer privileged access from a person's email, name, role text, Repair Shop ownership, Academy access, or any client-side flag.

The canonical authorization remains an active server-side row in `hermes_internal_owner_access` with capability `HERMES_INTERNAL_OWNER`.

This bootstrap exists only to bind the **first** internal owner to the **currently authenticated Hermes session** without manually copying a specialist ID into D1.

## Required server secret

Configure a high-entropy Cloudflare environment secret named:

`HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN`

Requirements:

- at least 32 characters;
- random/high entropy;
- never commit it to GitHub;
- never store it in Google Docs/Sheets, task prompts, screenshots, logs, or analytics;
- share it only through the approved secret boundary;
- remove/rotate the Cloudflare secret immediately after the first successful owner activation.

The bootstrap token is **not** an identity. It only authorizes the current authenticated Hermes session to claim the first internal-owner capability.

## Activation flow

1. Merge/deploy the AI Control Center and owner-bootstrap code.
2. Configure `HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN` in the production Cloudflare environment.
3. Sign in to the exact Hermes account that should own Internal AI.
4. Open `/services/hermes-connect/internal/ai-connect/?lang=ru` (or without `?lang=ru`).
5. If the session is authenticated but has no internal-owner capability, the private page shows the one-time activation form.
6. Enter the bootstrap token. It is submitted by same-origin HTTPS POST to `/api/internal-ai/bootstrap-owner`; it is never placed in a URL.
7. The server binds `HERMES_INTERNAL_OWNER` only to the authenticated `specialist.id` from the Hermes session.
8. The page reloads; `/api/internal-ai/status` must now succeed and the AI navigation/Control Center becomes visible.
9. Remove/rotate `HERMES_INTERNAL_OWNER_BOOTSTRAP_TOKEN` from the Cloudflare environment.
10. Verify that an ordinary Hermes account still receives `403 hermes_internal_owner_required` and no internal AI navigation.

## One-time safety rules

The endpoint:

- requires a valid Hermes session;
- rejects cross-site mutations;
- requires a separate strong server-side bootstrap secret;
- compares the supplied secret in constant-time style;
- never accepts `specialist_id`, email, role, or owner identity from the request body;
- is idempotent for the already-active current internal owner;
- refuses to provision a second active internal owner through bootstrap;
- returns `Cache-Control: no-store`;
- returns no secret value.

If another active internal owner already exists, bootstrap returns `internal_owner_already_provisioned`. Additional owners, revocation, or transfer require a separately reviewed administrative procedure; they must not reuse first-owner bootstrap.

## What this does not configure

Owner activation does **not** make the execution runner online by itself.

Real browser-to-Codex execution still requires the separately scoped `HERMES_INTERNAL_AI_RUNNER_TOKEN` in the Cloudflare environment and on the outbound-only Mac runner. The owner capability and runner secret must remain separate credentials.

## Post-activation proof

The first production proof must use a harmless repository-only task and demonstrate:

`owner session → AI Control Center → queued task → outbound Mac runner → isolated task branch → Codex → sanitized events/result → branch/PR/evidence`

No merge, deploy, credential access, external communication, billing action, destructive database action, or remote shell is required for this proof.
