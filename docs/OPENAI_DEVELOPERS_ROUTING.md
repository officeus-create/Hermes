# OpenAI Developers routing for Hermes

Reviewed: 2026-09-05

This document defines where the OpenAI Developers specialist belongs in Hermes and where it does not. It is a routing contract, not a new source of business truth and not authorization to bypass existing Hermes approval gates.

## Purpose

Use OpenAI Developers when a Hermes task specifically needs current OpenAI platform expertise or implementation support for:

- OpenAI API architecture and model/tool calling;
- OpenAI Agents SDK applications, handoffs, structured outputs, tracing and evals;
- ChatGPT Apps / Apps SDK when Hermes intentionally exposes a ChatGPT-native surface;
- OpenAI API runtime troubleshooting;
- OpenAI platform configuration and credential setup through approved provider-side flows.

Do not use it as a generic replacement for Codex, ChatGPT, Claude, Antigravity, SEO/GEO specialists, or product owners.

## Canonical precedence

OpenAI Developers must obey the same Hermes source precedence as every other agent:

1. current production-safe code and tests on `main`;
2. current owner instruction and accepted bounded issue;
3. `docs/ai-project-state.json`;
4. `AGENTS.md` and `docs/AI_START_HERE.md`;
5. the relevant department current-state and domain runbooks;
6. newest relevant handoff only when historical context is needed.

OpenAI documentation can define current OpenAI API/SDK semantics, but it does not override Hermes business priorities, privacy rules, approval gates, branch ownership, or current product truth.

## Current Hermes AI baseline

Hermes already has an owner-only Internal AI Assistant path and an outbound local runner. The runner:

- claims tasks from the Hermes API;
- creates an isolated non-`main` branch per task;
- delegates bounded repository work through the Hermes Codex launcher;
- sanitizes streamed evidence and secret-like values;
- stops at documented approval gates;
- does not itself justify replacing the existing runtime with a second agent stack.

Therefore the default OpenAI Developers rule is **augment first, replace only with evidence**.

## Routing by Hermes direction

### 1. Hermes Connect Internal AI — HIGH PRIORITY

Use OpenAI Developers for:

- evaluating whether a focused Agents SDK layer adds measurable value around the existing Internal AI workflow;
- structured task/result contracts where free-form text is too weak;
- trace/eval design for task quality, tool use, approval-gate compliance and regression testing;
- model/tool-routing review against current official OpenAI guidance;
- a small isolated prototype before any runtime migration.

Do not:

- replace the existing Codex runner merely because Agents SDK exists;
- weaken `workspace-write`, branch isolation, sanitization or approval gates;
- expose the owner-only assistant to ordinary customers without a separate product/security decision;
- put provider secrets in repository files, fixtures, screenshots, prompts or public evidence.

### 2. Hermes One Brain / AI infrastructure — HIGH PRIORITY

Use OpenAI Developers for:

- agent orchestration patterns;
- evals and trace-quality design;
- OpenAI-specific API reliability patterns;
- structured tool contracts for approved connected sources.

One Brain remains vendor-neutral. OpenAI-specific implementation knowledge is a specialist input, not the canonical business memory.

### 3. Hermes Connect customer AI features — MEDIUM/HIGH PRIORITY

Use OpenAI Developers when a specific product owner has accepted a bounded AI feature, for example:

- repair-shop service intake assistant;
- customer-support assistant;
- vehicle/service-history summarization;
- logistics explanation or recommendation surfaces;
- sales/marketing coaching inside private authenticated workspaces.

Every such feature needs an explicit input/output contract, privacy boundary, tool list, failure behavior and eval cases before live API use.

### 4. Load Board / Carrier Intelligence — CONDITIONAL

Use OpenAI Developers for analysis, ranking, summarization and operator assistance only after the load-board product owner defines the deterministic data/tool boundary.

AI must not silently book freight, change carrier/customer records, send external communications, or perform commercial commitments. Those remain explicit action gates.

### 5. SEO/GEO, Marketing, Academy — SPECIALIST ONLY

Do not route ordinary SEO pages, design, outreach or course-content production through OpenAI Developers merely because AI can generate text.

Use it only when the work is specifically about an OpenAI-powered product capability, API integration, agent workflow, eval, or ChatGPT-native application.

## Credential rule

- Live OpenAI secrets stay at the provider or in the approved runtime secret store.
- Drive/One Brain keeps only ownership/status/source pointers, never plaintext secret values.
- Public Git contains environment-variable names/placeholders only.
- A secret pasted into chat is not a source-of-truth credential record and must not be propagated into repository history.

## First bounded OpenAI Developers package

The first implementation package should target **Hermes Connect Internal AI quality/evals**, not a runtime rewrite.

Acceptance target:

1. inventory the existing Internal AI task contract, runner events, result states and approval gates;
2. define a small eval matrix covering happy path, missing evidence, forbidden action, required approval gate, secret redaction, branch isolation and cancellation;
3. determine whether the current Codex path already exposes enough structured evidence to grade those cases;
4. only if there is a concrete gap, prototype the smallest Agents SDK component that closes that gap without replacing the current runner;
5. keep all live credentials out of the PR;
6. require normal Hermes build/test/e2e and exact-head CI before promotion;
7. merge/deploy remains a separate owner gate.

## Reuse rule

Whenever a Hermes task mentions OpenAI API, Agents SDK, ChatGPT Apps, model/tool calling, OpenAI evals, or OpenAI runtime errors, route the OpenAI-specific subproblem to OpenAI Developers while keeping one active Hermes task owner and one branch writer.

If the task is ordinary product, SEO, design, research, sales, operations, or connected-data work with no OpenAI-specific implementation need, use the normal Hermes specialist instead.
