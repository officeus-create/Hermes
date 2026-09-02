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

The Cloudflare environment must have the corresponding server-side runner token. Provisioning the capability binding, secret, or external runner is an owner/security action and is intentionally out of scope for this contract.

The runner:

- polls outbound over HTTPS only;
- starts from exact `origin/main` with a clean tracked worktree;
- creates an isolated non-main task branch;
- invokes `scripts/ai/codex-hermes` through an argument array (no shell interpolation);
- enters a dedicated Internal-AI wrapper path only when the parent runner context is present;
- re-execs that trusted wrapper through a minimal `env -i` allowlist before any model-controlled command runs, so unrelated shell credentials and agent sockets are not forwarded into the browser-queued Codex process;
- accepts only the exact reviewed runner argv shape and fails closed on unexpected permission flags;
- normalizes the effective Codex invocation to `codex --sandbox workspace-write --ask-for-approval never exec <bounded prompt>` through FCC; routine workspace-local work may proceed, but sandbox escalation is not sent to automatic review and must fail instead of silently widening authority;
- keeps shell-command network access restricted by the Codex workspace sandbox unless a separately reviewed configuration explicitly changes that boundary;
- streams FCC/Codex output through `scripts/ai/hermes-internal-ai-sanitize.py` before it reaches the Python runner;
- applies the existing runner-side sanitizer again before server event/result upload;
- redacts common credential-shaped output including bearer values, sensitive assignments/query parameters, JWT-like values, common GitHub/OpenAI-style/AWS key shapes and private-key blocks;
- fails closed if the streaming sanitizer is unavailable or fails;
- preserves the non-secret `HERMES_INTERNAL_APPROVAL_GATE=<gate>` marker so consequential stops remain visible after redaction;
- fails closed when an earlier running task needs reconciliation;
- does not expose an inbound listener, browser shell, remote terminal, automatic merge, or deployment.

Ordinary/manual `scripts/ai/codex-hermes` usage remains on its direct execution path. The stricter environment, no-escalation policy and streaming evidence sanitizer apply specifically to browser-queued Internal AI runner execution.

`REMOTE_BROWSER_TO_CODEX = UNVERIFIED` until this contract is configured and independently proven in an approved environment.

## Read-only Mac preflight — required before activation

Before starting, scheduling, claiming, or extending any Internal AI runner task, run:

```bash
cd ~/Hermes
./scripts/ai/codex-hermes-doctor --internal-ai
```

This is a **read-only readiness receipt**, not an activator. It checks:

- the normal isolated Codex/FCC runtime boundary;
- the Hermes repository boundary and canonical `main` branch;
- a clean tracked working tree without deleting or interpreting untracked local state;
- local `HEAD` against `origin/main` using `git ls-remote` rather than `git fetch`, reset, checkout, pull, merge, or another repository mutation;
- trusted wrapper shell syntax plus runner/sanitizer Python syntax without writing `__pycache__` into the repository;
- an HTTPS Internal AI API value without query/fragment credential material;
- presence and a 32-character minimum readiness floor for the scoped runner token without printing its value;
- absence of the one-time owner bootstrap token from the local runner environment.

The doctor must not start/stop local services, claim a task, contact Telegram, touch Carrier Database, merge, deploy, or modify Git state. Its successful receipt ends with:

```text
INTERNAL_AI_PREFLIGHT=PASS
LOCAL_HEAD_SHA=<exact local main SHA>
REMOTE_MAIN_SHA=<same exact origin/main SHA>
REMOTE_BROWSER_TO_CODEX=UNVERIFIED
```

Any `FAIL` remains a blocker to the first browser-runner proof. A `PASS` proves only that the local prerequisites are structurally ready at that moment. It does **not** prove a provider request, runner scheduler, browser queue, production API binding, Cloudflare deployment, or live task execution.

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

## First live proof boundary

Only after a fresh `INTERNAL_AI_PREFLIGHT=PASS`, the first live proof must remain harmless and repository-only:

`owner browser session → queued task → outbound Mac runner → isolated branch → Hermes Codex → sanitized evidence receipt`

It must not require merge, deployment, credential access, billing, external communication, destructive database work, Telegram, Carrier Database, or another production mutation. Any need to cross those boundaries is evidence of a blocked pilot, not authorization to widen the runner.
