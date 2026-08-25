# Hermes Codex Routed Runtime

Adopted: 2026-08-25
Status: implementation branch; local provider smoke required before declaring the routed runtime operational
Owner: Hermes / Vladimir

## Goal

Keep the ordinary official `codex` installation untouched while giving Hermes a separate working Codex runtime that can route through Free Claude Code (FCC) and use an ordered provider fallback chain.

This is a runtime adapter only. It does not replace Hermes One Brain, HOS, HUEG, `AGENTS.md`, task ownership, branch rules, or evidence gates.

## Runtime separation

```text
ordinary codex
  -> command: codex
  -> state:   ~/.codex
  -> direct official runtime

Hermes Codex
  -> command: ./scripts/ai/codex-hermes
  -> state:   ~/.codex-hermes
  -> isolated FCC package: ~/.hermes-ai/fcc-venv
  -> FCC local proxy
  -> primary provider/model
  -> fallback provider/model #1
  -> fallback provider/model #2
  -> ...
```

The Hermes wrapper fails closed when its FCC runtime is unavailable. It does **not** silently fall back to the ordinary `codex` command, so paid/direct usage is never consumed merely because the router is down.

## Reviewed upstream boundary

The first Hermes adapter is pinned to:

- repository: `Alishahryar1/free-claude-code`
- revision: `8b312c3a18279466732c3942d7e9246a75725d51`
- package version: `5.14.5`
- inspected date: `2026-08-25`

That upstream revision includes `fcc-codex`, an ephemeral Codex `model_provider = "fcc"` configuration, OpenAI Responses wire support, a generated Codex model catalog, `MODEL` primary routing and ordered `MODEL_FALLBACKS` handling. The same upstream revision was selected deliberately after its maintainers reverted a larger protocol refactor and restored the prior protocol-specific paths.

Do not float Hermes automatically to upstream `main`. Upgrade the pinned revision only after review and a fresh local smoke.

## Files

- `scripts/ai/setup-codex-hermes.sh` — creates the isolated FCC Python environment without touching the ordinary Codex install.
- `scripts/ai/codex-hermes-server` — starts the Hermes FCC server.
- `scripts/ai/codex-hermes` — launches Codex through FCC with separate `CODEX_HOME`.
- `scripts/ai/codex-hermes-doctor` — checks separation, pinned FCC version and proxy/launcher readiness without printing provider secrets.

## Bootstrap on the Hermes Mac

From the current Hermes repository:

```bash
cd ~/Hermes
./scripts/ai/setup-codex-hermes.sh
```

The setup requires:

- the official `codex` command already installed;
- `uv` available (`brew install uv` on the current macOS setup if it is missing).

The setup creates only:

```text
~/.hermes-ai/fcc-venv
~/.codex-hermes
```

FCC itself stores its managed provider configuration under `~/.fcc`. Provider keys/tokens must stay there or in the provider's approved authentication flow. Never write them into this repository, GitHub issues, handoffs, screenshots, prompts, or committed `.env` files.

## Start the router

Terminal 1:

```bash
cd ~/Hermes
./scripts/ai/codex-hermes-server
```

Use the FCC Admin UI opened by the server to configure the providers you actually have access to. Configure a primary `MODEL` and an ordered **Fallback Models** list.

Current upstream examples include provider/model refs such as:

```text
nvidia_nim/nvidia/nemotron-3-super-120b-a12b
open_router/openrouter/free
gemini/models/gemini-3.1-flash-lite
```

These are examples, not a Hermes claim that the corresponding accounts, free tiers, quotas, latency, quality or keys are currently available. Availability must be verified locally.

## Verify separation and preflight

Terminal 2:

```bash
cd ~/Hermes
./scripts/ai/codex-hermes-doctor
```

Expected structural result:

- ordinary `codex` still resolves normally;
- Hermes FCC is version `5.14.5` in `~/.hermes-ai/fcc-venv`;
- Hermes `CODEX_HOME` is not `~/.codex`;
- FCC server + `fcc-codex` preflight succeeds once the server is running.

A doctor PASS is **not** provider evidence. It proves only the bootstrap/router boundary.

## Launch Hermes Codex

```bash
cd ~/Hermes
./scripts/ai/codex-hermes
```

Arguments pass through to `fcc-codex`, so non-interactive Codex use is also possible, for example:

```bash
./scripts/ai/codex-hermes exec "Read docs/AI_START_HERE.md and report only the current sync handshake fields."
```

## Per-run route overrides

Normally FCC Admin owns the primary and fallback chain for every Hermes Codex session. For a bounded task, the wrapper also supports process-only overrides without editing FCC's managed config:

```bash
HERMES_CODEX_MODEL="<provider>/<model>" \
HERMES_CODEX_FALLBACKS="<provider>/<model>,<provider>/<model>" \
./scripts/ai/codex-hermes
```

The wrapper maps those to FCC's `MODEL` and `MODEL_FALLBACKS`. Process values take precedence for that run only.

Do not hard-code provider credentials into the wrapper or route variables.

## First live smoke gate

After at least one provider and one fallback are configured, perform one bounded request:

```bash
./scripts/ai/codex-hermes exec "Reply exactly with HERMES_CODEX_ROUTER_OK"
```

Then perform a controlled fallback test only when it can be done without risking paid usage, account lockout or production work. The evidence should record:

- FCC revision/version;
- Codex version;
- primary model ref;
- fallback order (provider/model names only, never tokens);
- whether the primary request succeeded;
- whether a deliberately exercised safe fallback succeeded;
- observed time;
- any quota/rate-limit behavior.

Until that evidence exists, status is:

```text
BOOTSTRAP_IMPLEMENTED
PROVIDER_ROUTE_UNVERIFIED
AUTOMATIC_FALLBACK_UNVERIFIED
```

## Governance

1. Hermes One Brain still chooses the task and required skill.
2. FCC chooses the configured model route and provider fallback for the Codex runtime.
3. A provider/model is a replaceable executor, not a source of truth.
4. Repository `main`, current task source of truth, owner decisions and HUEG evidence outrank model output.
5. One task / one artifact / one active writer remains mandatory.
6. A successful fallback does not authorize merge, deployment, credentials, external messaging or another owner-gated action.
7. Never claim `SYNC_VERIFIED`, `PASS`, `DONE`, `LIVE_VERIFIED` or provider availability from configuration alone.

## Rollback

The adapter is additive. To stop using it, stop `codex-hermes-server` and use the ordinary `codex` command. No repository source code, website runtime, Hermes Connect API, database, auth, SEO page, DNS or production configuration is changed by this adapter.
