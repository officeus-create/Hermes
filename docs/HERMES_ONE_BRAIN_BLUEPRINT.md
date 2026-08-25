# Hermes One Brain Blueprint

## Target architecture
1. **Identity:** humans, roles, agents, machines, service accounts and approvals; least privilege.
2. **Knowledge:** source registry, chunks/facts, provenance, classification, retention and conflict status.
3. **Memory:** immutable evidence + approved decisions + expiring work memory; no secret store.
4. **Event bus:** normalized email/lead/PR/CI/booking/candidate/analytics/payment events with idempotency.
5. **Task graph:** objective, owner, lifecycle, dependency, budget, writer lock and required evidence.
6. **Router:** verified skill + access + cost + risk + availability, with backup executor.
7. **Execution:** sandboxes/connectors scoped to task; default read-only.
8. **Governance:** existing HOS/HUEG and owner gates—not a replacement board.
9. **Observability:** route/reason/cost/result/error/evidence/impact.
10. **Learning:** reviewed aggregate outcome → lesson → versioned knowledge/decision update.

## Canonical entities
`Company, Brand, Division, Product, Service, Person, Role, Lead, Candidate, Partner, Client, Document, Repository, Issue, PR, Task, Workflow, Dataset, EmailThread, WebsitePage, AnalyticsEvent, AIAgent, Tool, Account, Decision, Error, Evidence`.

## Minimum implementation contracts
- `source_registry`: source, owner, class, canonical status, retention, connector/access state, last observed.
- `evidence_registry`: claim, evidence class, source revision/time, verifier, limitation.
- `task_registry`: HOS stage, A0–A5 tier, writer lock, input/output/evidence/owner gate.
- `agent_registry`: skills, read/write scope, prohibited actions, budget, fallback, memory scope.
- `event_envelope`: event ID, type, source ref, subject class, timestamp, dedupe key, privacy level.

## 30/90 day outcome
**30 days:** contain P0 bridge, reconcile canonical state, restore read-only platform access, register sources/tasks/evidence, prove aggregate funnel path. **90 days:** event/task graph runs read-only/assisted workflows; 3–5 AI employees operate within budgets and HUEG; the owner sees a single evidence-backed corporate queue rather than scattered chats, folders and branches.
