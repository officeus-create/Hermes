# Hermes AI — Architecture & Connections in Owner Command Center

**Canonical owner:** Hermes Business Command Center [issue #2106](https://github.com/officeus-create/Hermes/issues/2106); Hermes Automation Engine [issue #2033](https://github.com/officeus-create/Hermes/issues/2033).

**Scope:** one new **AI System Architecture** section **inside the existing owner-gated Command Center** at `/services/hermes-connect/internal/command-center/?lang=ru`. No new planner, Worker, D1 database, second admin, credentials store, or public LLM endpoint.

## The actual control flow

1. Owner instruction or authorized event enters the existing Hermes Connect owner backlog / HAE event intake.
2. HAE remains the **only** authoritative WORK_ID, Cloudflare Worker, Queue/D1 and permission/cost control.
3. Deterministic routing is attempted first; a classifier is optional and must fail closed on uncertainty.
4. For approved, bounded tasks: local Hermes AI (Mac + Ollama Qwen 3.5 4B) or an approved free Workers AI model.
5. Independent QA / required owner approval precedes any merge, deploy, sending, posting, data transfer or financial action.
6. Only accepted evidence-derived lessons can be proposed for promotion to One Brain in Google Drive.

The Mac is allowed to be offline; it does **not** own a second cloud queue. Local-only jobs remain waiting, with no automatic paid fallback.

## Roles — observed versus candidate

| Component | Responsibility | Evidence state on 27 Oct 2026 |
| --- | --- | --- |
| HAE Worker / Queue / D1 | Canonical scheduler and task authority | Existing production runtime, `dry_run`/publishing OFF; connection observed in Cloudflare |
| Hermes Connect Business Command Center | Owner login, backlog, dispatch, approvals | PR #2107 in review, not accepted live |
| Local Hermes AI | Read-only website/CI QA, Ollama, controlled preparation | Local Mac cockpit was reachable; online status fetched only from authenticated `/api/internal-ai/status` |
| Cloudflare Access | Exact-identity gate for `agents.hermeslogisticsus.com` | Self-hosted app + owner-only allowlist created; end-to-end external proof pending |
| Cloudflare Tunnel | Tunnel -> localhost signed-JWT bridge at 8766, never raw 8765 | Named tunnel created; live connector/destination not accepted |
| GLM-4.7-Flash `@cf/zai-org/glm-4.7-flash` | Reasoning and narrow drafts | #2123 source safety gate merged; #2137 runtime Free-plan readback active; **no accepted inference receipt** |
| Clef-flash `@cf/cloudflare/clef-flash` | Typed choice, classification/agent routing | Candidate, no benchmark or production activation |
| Clairic `@cf/cloudflare/clairic` | Typed numeric/document extraction | Candidate, preview; no benchmark or activation |
| Whisper Large V3 Turbo | Permitted audio transcription | Deferred; consent, provider and spend gate |
| One Brain Google Drive | Canonical approved instructions/lessons | Existing single knowledge owner; not directly modified by model output |
| ClickUp | Canonical human/team work | Do not mirror human tasks to Hermes Connect D1 |
| GitHub CI sensor + HAE #2138/#2068/#2069 | Event intake, independent QA activation, bounded repair and lessons | #2090 source merged; #2138 is the active QA-sensor release lane; no automatic production activation |

## What the UI actually does

- The **How it works** tab displays the six-stage flow and responsibility boundaries.
- **Models and agents** distinguishes model candidates and bounded draft roles; it never claims a candidate is running.
- **Connections** contains grounded links to the already existing Cloudflare, GitHub and Drive settings. Links are actions; **they do not install or authorize a provider**.
- **Activation plan** offers real owner-work backlog task templates for Access E2E, a synthetic GLM test, held-out model benchmarks and bounded repair/evidence.
- Clicking **Prepare task** fills the *existing* owner D1 backlog form with source, title and instructions. It never submits, dispatches or deploys automatically. The owner must inspect and click **Save to backlog**.
- Only the local runner's online/last heartbeat values come from an authenticated live API request. All other source statuses are explicitly marked a dated **27 Oct 2026 evidence snapshot** until an authorized read model is implemented.

## Security and acceptance

- Must remain inside `[data-private]` in the owner Command Center, and `/api/internal-ai/status` must confirm `HERMES_INTERNAL_OWNER` before private data is shown.
- No secrets in client HTML, no hardcoded Access JWT, no direct browser calls to Mac 8765 or HAE production.
- Unknown / stale provider state is not CONNECTED. Fail closed, never estimate live costs or task counts.
- No direct `fetch POST` in the diagram. No new endpoints or Cloudflare/D1 migrations.
- Desktop/390px mobile, Astro build, command center contract and dedicated architecture interaction test must pass.
- The architecture PR is intentionally stacked on active Command Center #2107; rebase onto main **only after** #2107 merges. No automatic production release or access grants.
- Definition of LIVE_VERIFIED: real authenticated owner-gated page on production domain, anonymous denial, delegated-user denial, tab controls, owner task draft, no unapproved writes, mobile/desktop readback.

## Implementation ownership

- Owner admin: [Command Center #2107](https://github.com/officeus-create/Hermes/pull/2107)
- Private Mac gateway (separate): [#2088](https://github.com/officeus-create/Hermes/pull/2088)
- HAE canonical runtime and learning: [#2033](https://github.com/officeus-create/Hermes/issues/2033)
- Workers Free runtime readback: [#2137](https://github.com/officeus-create/Hermes/pull/2137) — source safety gate #2123 is merged
- Independent-QA sensor activation: [#2138](https://github.com/officeus-create/Hermes/pull/2138) — source sensor #2090 is merged
- One Brain knowledge document: https://docs.google.com/document/d/1ZhhySXskA7EdC40bWNNzSeMbvVKn7J1FPQOLNE-D98Y/edit

**Rule:** Do not duplicate the Command Center, Cloudflare Worker, Hermes Connect CRM, ClickUp task store, or One Brain.

## Owner operations telemetry

The AI Center reuses the existing authenticated internal-ai-mac-runner heartbeat instead of adding another API, scheduler or database. The runner may attach one bounded telemetry_json envelope to its existing runner-state row. Accepted fields are limited to status, phase, cycle, current task, next action, local model, last training phase/task, and four autonomy counters: cooldown skipped, manifest scanned, external actions, and provider writes.

Every text field passes through the existing execution sanitizer and every counter is bounded. Missing, malformed, or absent values remain UNKNOWN; they are never converted to zero. The owner status endpoint parses and sanitizes the stored envelope again before returning it.

Mac is the current primary executor. Windows is deferred by the owner and must not be represented as connected. The Team View in the owner UI is only a safe preview of a future read-only employee surface; employee authorization remains a separate gate and must not expose sensitive infrastructure or owner controls.

This preserves the architecture boundary: one Command Center, one existing runner-state row, one HAE, no second planner, Worker, D1 database, scheduler, or task authority.
