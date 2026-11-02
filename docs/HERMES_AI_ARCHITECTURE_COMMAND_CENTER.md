# Hermes AI — Architecture & Connections in Owner Command Center

**Canonical owner:** Hermes Business Command Center [issue #2106](https://github.com/officeus-create/Hermes/issues/2106); Hermes Automation Engine [issue #2033](https://github.com/officeus-create/Hermes/issues/2033).

**Scope:** one new **AI System Architecture** section **inside the existing owner-gated Command Center** at `/services/hermes-connect/internal/command-center/?lang=ru`. No new planner, Worker, D1 database, second admin, credentials store, or public LLM endpoint.

**Canonical implementation:** PR [#2236](https://github.com/officeus-create/Hermes/pull/2236) is the single current Command Center release candidate on top of current `main`. It reconciles the former #2159 AI Operations line and its stacked completion children into one release surface. #2159 and #2125 are provenance/superseded only; do not create a competing AI Operations layer.

## The actual control flow

1. Owner instruction or authorized event enters the existing Hermes Connect owner backlog / HAE event intake.
2. HAE remains the **only** authoritative WORK_ID, Cloudflare Worker, Queue/D1 and permission/cost control.
3. Deterministic routing is attempted first; a classifier is optional and must fail closed on uncertainty.
4. Windows YuraValentyuk is the *assigned primary* execution host, not a verified online HAE worker. Mac remains a cold fallback/reference with separate legacy heartbeat telemetry; approved free Workers AI is gated independently.
5. Independent QA / required owner approval precedes any merge, deploy, sending, posting, data transfer or financial action.
6. Only accepted evidence-derived lessons can be proposed for promotion to One Brain in Google Drive.

The Mac is allowed to be offline; it does **not** own a second cloud queue. Local-only jobs remain waiting, with no automatic paid fallback.

## Roles — observed versus candidate

| Component | Responsibility | Evidence state on 27 Oct 2026 |
| --- | --- | --- |
| HAE Worker / Queue / D1 | Canonical scheduler and task authority | Existing production runtime, `dry_run`/publishing OFF; connection observed in Cloudflare |
| Hermes Connect Business Command Center | Owner login, backlog, dispatch, approvals | #2107 and #2198 merged and Cloudflare exact-SHA deployed 31 Oct 2026; authenticated human-owner browser acceptance remains separate |
| Local Hermes AI | Read-only website/CI QA, Ollama, controlled preparation | Local Mac cockpit was reachable; online status fetched only from authenticated `/api/internal-ai/status` |
| Cloudflare Access | Exact-identity gate for `agents.hermeslogisticsus.com` | Self-hosted app + owner-only allowlist created; end-to-end external proof pending |
| Cloudflare Tunnel | Tunnel -> localhost signed-JWT bridge at 8766, never raw 8765 | Named tunnel created; live connector/destination not accepted |
| GLM-4.7-Flash `@cf/zai-org/glm-4.7-flash` | Reasoning and narrow drafts | #2123 source safety gate merged; #2137 runtime Free-plan readback active; **no accepted inference receipt** |
| Clef-flash `@cf/cloudflare/clef-flash` | Typed choice, classification/agent routing | Candidate, no benchmark or production activation |
| Clairic `@cf/cloudflare/clairic` | Typed numeric/document extraction | Candidate, preview; no benchmark or activation |
| Whisper Large V3 Turbo | Permitted audio transcription | Deferred; consent, provider and spend gate |
| One Brain Google Drive | Canonical approved instructions/lessons | Existing single knowledge owner; not directly modified by model output |
| ClickUp | Canonical human/team work | Do not mirror human tasks to Hermes Connect D1 |
| GitHub CI sensor + HAE #2138/#2068/#2069 | Event intake, independent QA activation, bounded repair and lessons | #2090 and #2138 source are merged; live independent-QA D1 receipt remains a separate runtime acceptance gate under #2033; no automatic production activation |

## What the UI actually does

- The **How it works** tab displays the six-stage flow and responsibility boundaries.
- **Models and agents** distinguishes model candidates and bounded draft roles; it never claims a candidate is running.
- **Connections** contains grounded links to the already existing Cloudflare, GitHub and Drive settings. Links are actions; **they do not install or authorize a provider**.
- **Activation plan** offers real owner-work backlog task templates for Access E2E, a synthetic GLM test, held-out model benchmarks and bounded repair/evidence.
- Clicking **Prepare task** fills the *existing* owner D1 backlog form with source, title and instructions. It never submits, dispatches or deploys automatically. The owner must inspect and click **Save to backlog**.
- Online state, heartbeat and permitted operational telemetry come from the authenticated `/api/internal-ai/status` read model. Model/provider availability and historical capability claims remain explicitly dated **27 Oct 2026 evidence snapshots** unless independently reverified.

## Security and acceptance

- The owner AI map stays inside `[data-private]` in the server-gated Command Center. The separate `/services/hermes-connect/internal/team-view/` and direct `index.html` route must pass `requireInternalAiViewer` at the Cloudflare edge, and only its scrubbed status API is visible to an explicitly granted employee.
- No secrets in client HTML, no hardcoded Access JWT, no direct browser calls to Mac 8765 or HAE production.
- Unknown / stale provider state is not CONNECTED. Fail closed, never estimate live costs or task counts.
- AI architecture task presets do not automatically POST, dispatch or approve anything. Team View uses the existing `/api/internal-ai/status` and `/api/internal-command-center/access` endpoints plus two narrowly scoped grant/audit tables in the existing production D1; it creates no second DB, scheduler or identity.
- Desktop/390px mobile, Astro build, command center contract and dedicated architecture interaction test must pass.
- #2236 is the current release candidate; merge requires exact-head CI and independent protected review. Employee grants remain explicit, owner-authorized, logged and revocable; no automatic production access.
- Definition of LIVE_VERIFIED: real authenticated owner-gated page on production domain, anonymous denial, delegated-user denial, tab controls, owner task draft, no unapproved writes, mobile/desktop readback.

## Implementation ownership

- Owner admin: [Command Center #2107](https://github.com/officeus-create/Hermes/pull/2107)
- Command Center / AI Operations release candidate: [#2236](https://github.com/officeus-create/Hermes/pull/2236) — single canonical continuation; #2159 and #2125 are superseded provenance
- Private Mac gateway (separate): [#2088](https://github.com/officeus-create/Hermes/pull/2088)
- HAE canonical runtime and learning: [#2033](https://github.com/officeus-create/Hermes/issues/2033)
- Workers Free runtime readback: [#2137](https://github.com/officeus-create/Hermes/pull/2137) — source safety gate #2123 is merged
- Independent-QA sensor source: [#2138](https://github.com/officeus-create/Hermes/pull/2138) — merged; runtime acceptance remains governed by #2033
- One Brain knowledge document: https://docs.google.com/document/d/1ZhhySXskA7EdC40bWNNzSeMbvVKn7J1FPQOLNE-D98Y/edit

**Rule:** Do not duplicate the Command Center, Cloudflare Worker, Hermes Connect CRM, ClickUp task store, or One Brain.

## Owner operations telemetry

The AI Center reuses the existing authenticated internal-ai-mac-runner heartbeat instead of adding another API, scheduler or database. The runner may attach one bounded telemetry_json envelope to its existing runner-state row. Accepted fields are limited to status, phase, cycle, current task, next action, local model, last training phase/task, and four autonomy counters: cooldown skipped, manifest scanned, external actions, and provider writes.

Every text field passes through the existing execution sanitizer and every counter is bounded. Missing, malformed, or absent values remain UNKNOWN; they are never converted to zero. The owner status endpoint parses and sanitizes the stored envelope again before returning it.

Windows is the assigned primary executor, but its HAE runtime/heartbeat has not been independently accepted. The Mac heartbeat is a separate legacy observation and must not be presented as Windows/HAE readiness. Owner Agents includes a deliberately scrubbed Team View preview. A separate Team View page is available only after explicit server-side employee authorization, and must not expose owner tasks or controls.

This preserves the architecture boundary: one Command Center, one existing runner-state row, one HAE, no second planner, Worker, D1 database, scheduler, or task authority.

## Plugin selection and execution evidence

New owner tasks persist a versioned `plugin_route_json` in the **existing** `hermes_owner_work_items` D1 table. The deterministic route selects a verified registry role and eligible helpers by workstream, with a narrow marketing/search-intent override. Edits reselect; dispatch atomically refreshes the route alongside the existing AI task linkage and adds the route policy to the prompt. Owner cards display the selected role/version and **PLUGIN_SELECTED_NOT_EXECUTED**. No private-plugin tool invocation, actual HAE claim, independent QA, lesson promotion, or provider write is inferred from selection; those need separate runtime receipts. The legacy `software_engineer` internal AI task remains the existing executor and is **not** renamed as a plugin. This source change adds no scheduler, worker, provider access or background job.

## Team View authorization

Windows is assigned primary but not live-verified; Mac legacy heartbeat is not proof of the selected Windows executor. Team View is separately and explicitly granted on an existing Hermes account, never inferred from email/domain/role. An authorized employee sees runner online/heartbeat, an allowlisted status, bounded cycle, masked current-task presence and safe aggregate task counts. Free-form phase, model, raw current task, backlog details, approvals, repo metadata, access controls, credentials, IPs and local endpoints are excluded. Owner grants/revokes are auditable in the existing D1 and become effective immediately.
