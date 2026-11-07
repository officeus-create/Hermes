# VIKTOR Windows runtime recovery source

This directory is an off-host recovery copy of the source-only files that currently run Hermes AI / VIKTOR on the Windows host.

## Purpose
- eliminate the Windows disk as the only source copy;
- preserve the watchdog, worker, dashboard, evidence factory, policy engine, task executor and dormant HAE node client;
- give Technology/QA a versioned recovery reference.

## Explicit non-goals
This directory is **not** a second runtime, scheduler, queue, D1 store or One Brain.
It is not imported by production code and must not be treated as deployed HAE source.

## Excluded on purpose
Do not commit:
- `viktor_live/` runtime state, receipts, chats or logs;
- Windows user profile data;
- Ollama model files;
- credentials, cookies, API tokens, vault values or environment-variable values;
- recovery files that contain operational history rather than source.

A local source scan on 2026-11-02 checked 52 source/config files for common literal secret patterns and found no matches before this recovery copy was created.

## Current truth gates
- Windows VIKTOR is local-live but session-guarded; the current watchdog scheduled task uses an interactive logon token.
- `hermes_internal_ai_windows_heartbeat.py` is heartbeat-only and requires a dedicated `HERMES_INTERNAL_AI_WINDOWS_RUNNER_TOKEN`; the Mac runner token must never be reused for the Windows identity.
- `hermes_hae_windows_node.py` is dormant/fail-closed until reviewed server support, scoped API/token configuration and an authorized READ_ONLY canary.
- Development regression can be green without proving independent generalization.
- The canonical production HAE remains the Cloudflare/D1/Queue runtime.

## Recovery acceptance
A restore is not accepted merely because files exist. Re-validate:
1. Python syntax/self-tests;
2. loopback-only dashboard/Ollama binding;
3. zero unauthorized provider/production writes;
4. exact current plugin/HAE contracts;
5. watchdog/process recovery;
6. current GitHub/release state before any activation.
