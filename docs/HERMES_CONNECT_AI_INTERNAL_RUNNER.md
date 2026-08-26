# Hermes Connect AI Assistant — Internal Runner Contract

**Status:** implementation-ready, intentionally not configured or deployed.

## Canonical integration

The only UI destination introduced by this slice is the nested internal route:

`/services/hermes-connect/internal/ai-assistant/`

It uses the existing Hermes Connect page shell and `HermesConnectExperience` presentation grammar. It is `noindex,nofollow`, omitted from public navigation, and must not be linked from Repair Shop customer workspace navigation.

The existing shared Hermes Connect product navigation conditionally adds the
native `AI Assistant` entry only after `/api/internal-ai/status` has verified
the server-side `HERMES_INTERNAL_OWNER` capability. Anonymous, ordinary,
Repair Shop Owner, and Academy sessions receive no entry node at all.

The route is not a second Owner Control Center and does not revive `/services/hermes-connect/owner/`.

## Authorization and tenant boundary

A session must satisfy both conditions server-side:

1. be a current Hermes session (`hermes_session`); and
2. have an active `hermes_internal_owner_access` row with capability `HERMES_INTERNAL_OWNER`.

The table is a distinct capability binding. It does not derive access from customer role text, repair-shop ownership, Academy reviewer access, email domain, or a hard-coded personal identity.

All task, event, and runner-state data has the fixed tenant scope `hermes_internal`. Every internal-owner endpoint filters this scope. Unauthenticated and ordinary authenticated sessions receive `401` or `403`; no internal task receipt is returned.

### D1 schema convention

The current Hermes repository intentionally creates bounded D1 tables through
idempotent `ensure…Schema` runtime helpers (the established Academy, Repair
Shop, Beauty, service-context, and password-reset pattern). It has no separate
canonical D1 migration directory or migration runner for these product tables.
`ensureInternalAiSchema` follows that existing pattern; it is not a second
schema system.

## Runner setup — owner-only external gate

The local outbound runner is:

```text
scripts/ai/hermes-internal-ai-runner.py
```

It requires locally configured values that must never be committed:

```text
HERMES_INTERNAL_AI_API=https://<approved HTTPS Hermes origin>
HERMES_INTERNAL_AI_RUNNER_TOKEN=<scoped runner secret>
```

The Cloudflare environment must have the corresponding server-side runner token. Provisioning the capability binding, secret, or external runner is an owner/security action and is intentionally out of scope for this PR.

The runner:

- polls outbound over HTTPS only;
- starts from exact `origin/main` with a clean tracked worktree;
- creates an isolated non-main task branch;
- invokes `scripts/ai/codex-hermes` through an argument array (no shell interpolation);
- invokes `codex exec --sandbox workspace-write --approve-for-me <bounded prompt>` through that wrapper; the installed CLI's `exec --help` confirms this supported option order, so routine approval prompts remain inside safe automatic review rather than hanging the unattended runner;
- streams bounded sanitized evidence;
- fails closed when an earlier running task needs reconciliation;
- does not expose an inbound listener, browser shell, remote terminal, automatic merge, or deployment.

`REMOTE_BROWSER_TO_CODEX = UNVERIFIED` until this contract is configured and independently proven in an approved environment.

## Real approval state

The UI shows `Needs approval` only when a runner completes a task as `needs_approval` with one of these documented gates:

- `delete_archive`
- `credentials_secrets`
- `merge_deploy`
- `billing_permissions`
- `external_communication`
- `legal_commercial`
- `destructive_database`
- `material_scope_expansion`
- `unresolvable_evidence`

This state records the evidence but does not authorize the consequential action.

When Codex reaches one of those gates, its bounded runner prompt requires an
exact `HERMES_INTERNAL_APPROVAL_GATE=<gate>` marker on its own output line.
The local runner accepts only the listed gate values and reports the task as
`needs_approval`; it never performs the gated action itself.
