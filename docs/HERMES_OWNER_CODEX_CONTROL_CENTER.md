# Hermes Owner Codex Control Center

Status: implementation branch for issue #864. No production deploy, credential provisioning, or merge is implied by repository implementation.

## Goal

Give the authenticated Hermes owner a browser/mobile control surface for the existing routed Hermes Codex runtime without exposing a remote shell or opening an inbound port on the owner Mac.

Canonical owner route:

`/services/hermes-connect/owner/`

The page presents three owner destinations:

1. Repair Shops
2. Academy
3. Hermes Codex

The existing direct `codex` command and `./scripts/ai/codex-hermes` launcher remain unchanged.

## Architecture

```text
owner browser / phone
        |
Hermes session + explicit owner binding
        |
/api/owner-codex/*
        |
D1 task queue + sanitized event records
        ^
        | outbound HTTPS polling only
Mac runner: python3 scripts/ai/hermes-owner-codex-runner.py
        |
./scripts/ai/codex-hermes exec <prompt-as-argument>
        |
FCC -> primary -> ordered fallback models
```

The Mac runner does not open an HTTP server, SSH listener, local tunnel, or arbitrary-command API. Custom task text is passed as one process argument to `codex-hermes exec`; it is never interpolated into a shell command.

## Server-side configuration gates

The API fails closed until the production environment has an explicit owner identity binding and a scoped runner credential.

Configure exactly one or both owner identity bindings:

- `HERMES_OWNER_SPECIALIST_ID`
- `HERMES_OWNER_EMAIL`

Configure the local runner credential server-side:

- `HERMES_CODEX_RUNNER_TOKEN`

The runner uses the same token from local environment only. Do not commit it, paste it into GitHub, include it in screenshots, or expose it to the browser.

These production environment changes are owner-gated. Repository code may be reviewed and tested before they are provisioned.

## Local runner

After the production API is deployed and the scoped credential is provisioned locally, run from the Hermes Mac:

```bash
cd ~/Hermes
export HERMES_OWNER_CODEX_API="https://hermeslogisticsus.com"
export HERMES_OWNER_CODEX_RUNNER_TOKEN="<local-only scoped token>"
python3 scripts/ai/hermes-owner-codex-runner.py
```

Optional process-only route labels may be supplied through the existing Hermes runtime variables:

```bash
export HERMES_CODEX_MODEL="<provider>/<model>"
export HERMES_CODEX_FALLBACKS="<provider>/<model>,<provider>/<model>"
```

The UI only receives provider/model names reported by the runner. It never receives provider secrets.

## Queue semantics

Owner browser endpoints:

- `GET /api/owner-codex/status`
- `GET /api/owner-codex/tasks`
- `POST /api/owner-codex/tasks`
- `GET /api/owner-codex/tasks/:id`
- `PATCH /api/owner-codex/tasks/:id` with `{ "action": "cancel" }`

Runner-only endpoints:

- `POST /api/owner-codex/runner/claim`
- `GET /api/owner-codex/runner/task?id=...`
- `POST /api/owner-codex/runner/event`
- `POST /api/owner-codex/runner/complete`

Only one queued/running task is allowed at a time. This is an execution safety control, not a replacement for HOS/HUEG one-writer governance.

## Data boundary

Task records contain only bounded operational metadata:

- task id/type/prompt;
- status and timestamps;
- repo SHA / branch / PR URL;
- provider/model route names;
- evidence class;
- sanitized output summary;
- cancellation state.

Do not store credentials, cookies, OAuth tokens, provider secrets, private customer data, contracts, or unrelated private records in this queue.

Execution output is length-bounded and server-side sanitized for common credential patterns before persistence. The local runner also applies a conservative redaction pass before upload.

## Cancellation

A browser cancellation request changes only the target task. The Mac runner polls task state and sends `SIGTERM` only to the process group it created for that task. It does not kill unrelated Codex, Terminal, FCC, browser, or repository processes.

## Acceptance before production use

Repository gate:

```bash
npm run build
node scripts/owner-codex-control-center-contract.test.mjs
npx playwright test tests/owner-hermes-codex-control-center.spec.ts --project=chromium
```

Then full Hermes gate before merge:

```bash
npm run build
npm test
npm run test:e2e
```

Production proof remains separate and owner-gated:

1. configure explicit owner identity binding;
2. configure scoped runner token in the server environment;
3. deploy the reviewed PR;
4. configure the same scoped token locally without exposing it;
5. start the outbound runner;
6. open `/services/hermes-connect/owner/` from desktop and phone;
7. submit a harmless read-only task;
8. prove browser -> queue -> Mac runner -> routed Hermes Codex -> sanitized browser result;
9. verify direct `codex` remains independent;
10. keep merge/deploy/DNS/credential/external-action owner gates intact.

Until the production proof exists, `REMOTE_BROWSER_TO_CODEX` remains `UNVERIFIED`.
