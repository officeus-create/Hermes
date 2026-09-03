# Hermes AI Control Center — Local Operations Runbook

**Scope:** local owner-Mac operations for the FCC/Codex control plane used by Hermes.

**Canonical launcher:** `Open_Hermes_AI_Control_Center.command`

**Canonical admin URL:** `http://127.0.0.1:8082/admin`

This runbook documents the existing local control-center behavior. It does not authorize deployment, credential changes, external communications, destructive cleanup, or production mutations.

## Architecture boundary

The control center is a local interface over the isolated FCC/Codex runtime:

- repo launcher: `Open_Hermes_AI_Control_Center.command`
- server launcher: `scripts/ai/codex-hermes-server`
- Codex launcher: `scripts/ai/codex-hermes`
- doctor: `scripts/ai/codex-hermes-doctor`
- FCC home: `~/.hermes-ai/`
- isolated Codex state: `~/.codex-hermes/`
- FCC managed configuration: `~/.fcc/.env`
- admin URL: `http://127.0.0.1:8082/admin`
- default server log: `~/.hermes-ai/fcc-server.log`

The local FCC/Codex environment is intentionally separate from the owner's ordinary Codex state. Do not merge `~/.codex-hermes` into `~/.codex`.

## Start the control center

From Finder, double-click:

```text
Open_Hermes_AI_Control_Center.command
```

Or from Terminal:

```bash
cd ~/Hermes
./Open_Hermes_AI_Control_Center.command
```

The launcher first checks the local Admin URL. If it is not responding, it starts `scripts/ai/codex-hermes-server` with `nohup`, writes output to `~/.hermes-ai/fcc-server.log`, waits up to about 20 seconds for readiness, then opens the Admin UI.

## Read-only status check

```bash
cd ~/Hermes
./Open_Hermes_AI_Control_Center.command --status
```

This runs `scripts/ai/codex-hermes-doctor` and separately checks whether the local Admin URL responds.

A successful doctor receipt proves local bootstrap/runtime prerequisites only. It does not prove that a provider request succeeds, that a fallback chain works, or that an Internal AI browser task can execute.

## Verify the listener boundary

The intended owner-Mac configuration is localhost-only:

```bash
lsof -nP -iTCP:8082 -sTCP:LISTEN
```

Expected listener:

```text
127.0.0.1:8082
```

A wildcard listener such as `*:8082` or `0.0.0.0:8082` should be treated as a configuration/process discrepancy and reconciled before relying on the local-only boundary.

Verify the Admin UI:

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:8082/admin
```

Expected result:

```text
HTTP 200
```

## Verify the isolated Codex runtime

```bash
cd ~/Hermes
./scripts/ai/codex-hermes-doctor
```

The doctor should verify that:

- official Codex remains independently available;
- FCC is pinned to the reviewed version;
- Hermes Codex state is isolated under `~/.codex-hermes`;
- FCC managed provider configuration exists;
- the FCC proxy/Codex launcher preflight succeeds.

Warnings that model and fallback selection are managed by FCC mean the model configuration still needs runtime verification through a bounded smoke request.

## Provider smoke test

After the Admin UI shows the intended primary/fallback model configuration, run one bounded non-mutating request through the Hermes Codex wrapper and record the actual model/fallback evidence.

Example:

```bash
cd ~/Hermes
./scripts/ai/codex-hermes exec 'Reply exactly: HERMES_FCC_SMOKE_OK'
```

A local doctor PASS without a successful provider request is not sufficient evidence that inference is working.

## Logs

Default server log:

```text
~/.hermes-ai/fcc-server.log
```

Inspect recent lines without changing state:

```bash
tail -100 ~/.hermes-ai/fcc-server.log
```

Do not paste credential-bearing environment values into issues, PRs, chat, or logs.

## Stop/restart behavior

If the server is running in a foreground Terminal, stop that foreground process with `Ctrl+C`.

If a background FCC process was started previously, first identify the exact process/listener before terminating anything:

```bash
lsof -nP -iTCP:8082 -sTCP:LISTEN
ps aux | grep '[f]cc-server'
```

Terminate only the verified stale FCC process. Do not use broad `pkill python`, `killall python`, or similar commands because other Hermes runtimes and Telegram bots may use separate Python processes.

After reconciling the process, restart through the canonical launcher or `scripts/ai/codex-hermes-server` and re-run the listener, Admin, and doctor checks.

## Internal AI runner is a separate gate

The Control Center does not itself prove or authorize the browser-to-Mac Internal AI runner. That path is governed separately by:

```text
docs/HERMES_CONNECT_AI_INTERNAL_RUNNER.md
```

Before any Internal AI activation or live proof, use the dedicated read-only preflight:

```bash
cd ~/Hermes
./scripts/ai/codex-hermes-doctor --internal-ai
```

A PASS still leaves `REMOTE_BROWSER_TO_CODEX=UNVERIFIED` until the first bounded end-to-end proof is completed.

## Security rules

- Keep the FCC listener local to `127.0.0.1` unless a separately reviewed requirement explicitly changes that boundary.
- Keep FCC/Codex state isolated from ordinary Codex state.
- Never print or commit provider keys, runner tokens, OAuth credentials, Telegram sessions, or `.env` contents.
- Do not merge or deploy merely because the Control Center is healthy.
- Do not treat a successful local doctor or Admin HTTP 200 as provider or production evidence.
- Prefer exact-process termination over broad process-kill commands.

## Evidence checklist

For an owner-Mac local-runtime receipt, record only non-secret evidence:

```text
FCC_LISTENER=127.0.0.1:8082
FCC_ADMIN_HTTP=200
CODEX_HERMES_DOCTOR=PASS
FCC_PROVIDER_SMOKE=PASS|FAIL|NOT_RUN
INTERNAL_AI_PREFLIGHT=PASS|FAIL|NOT_RUN
REMOTE_BROWSER_TO_CODEX=UNVERIFIED|VERIFIED
```

Keep provider/model names only when they are not credentials. Never include tokens or key values.
