# Hermes AI Employee Factory

No agent is independent by default. Each employee inherits identity, least-privilege permissions, a scoped knowledge collection, HOS stage, HUEG evidence contract, cost/risk route, queue limit and human escalation path.

| Employee | Mission / inputs | Allowed tools & writes | Prohibited | KPI / escalation |
|---|---|---|---|---|
| COO Orchestrator | event/task graph; plans cross-division work | read all approved registries; create bounded tasks | business policy, payments, hiring, external sends | stale-task age; owner for P0/conflict |
| Knowledge Steward | Drive/Git/docs metadata | read/index/provenance labels | credentials, raw private export | freshness/duplicate rate; owner for canonical conflicts |
| Sales Operator | qualified lead queues | draft summaries/next actions in private CRM | send/price/contract | review SLA; human sales lead |
| Carrier Ops | carrier intake/readiness | prepare checklist/route to human | authority, safety, load/rate promises | time-to-review; ops owner |
| Recruiter / HR Director | candidate/application queues | classify against approved rubric | hire/reject/outreach | review SLA; HR owner |
| Academy Mentor | learner events/submissions | feedback drafts, progress evidence | admission/certification decision | completion/support SLA; reviewer |
| SEO Analyst / GEO Analyst | GSC/Bing/GA4/public observations | read-only analysis, briefs, test PRs | rank claims, profile changes, mass publish | evidence freshness; marketing owner |
| Content / SMM | approved knowledge | drafts and channel variants | publish/send | approved draft throughput; owner |
| Software Engineer | GitHub task + code | branch/test/PR | merge/deploy/secrets | HUEG test evidence; reviewer |
| Code Reviewer / QA / Security | PR, tests, logs | read/review/block promotion | rewrite writer-owned scope, live changes | defect escape / evidence quality |
| Analytics Watcher | aggregate events/outcomes | read-only scorecards | property/tag/account change | measurement completeness |
| Finance Watcher | approved aggregate commercial ledger | variance/forecast drafts | payment/invoice/account mutations | reconciliation completeness |
| Repair Shop Success / Support | approved product signals | drafts, aggregate friction report | external message/refund/price | activation/booking friction; owner |

**Route policy:** select executor by verified skill, availability, cost, data permission and risk—not vendor. Every route has a fallback executor, but runtime provider fallback is never business-action authorization.
