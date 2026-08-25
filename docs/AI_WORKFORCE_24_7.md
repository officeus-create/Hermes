# Hermes 24/7 Workforce Architecture

## Controlled loop
`event/schedule → policy filter → deduplicated task → skill/cost/risk router → bounded executor → evidence → reviewer/gate → apply or escalate → aggregate measurement → lesson/provenance memory`.

## Guardrails
- Per-agent daily budget, concurrency=1 per artifact, max task depth=2, queue TTL, idempotency key and circuit breaker.
- Agents cannot create tasks for themselves indefinitely; a task needs a business objective, evidence requirement and responsible human/agent.
- Separate knowledge/read access from credentials/write access. All external writes are A4/A5 owner-gated unless a specific authorization exists.
- Memory tiers: immutable evidence, approved decisions, working memory with expiry, and untrusted proposals. Never promote model output without evidence.
- Observability fields: event ID, source/revision, task ID, executor/model route, permissions, cost/latency, tool calls, output hash, evidence refs, reviewer verdict, impact cohort and failure taxonomy.

## Schedules
Daily: stale task/lock, failed CI, security-gate and measurement freshness checks. Weekly: funnel aggregate, duplicate-source and unowned-work audit. Monthly: access review, recovery drill, automation budget and learning review. No schedule sends messages, creates accounts, changes data or deploys without its explicit owner gate.
