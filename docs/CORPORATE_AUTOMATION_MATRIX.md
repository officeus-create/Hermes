# Corporate Automation Matrix

| Workflow | Automation class | AI-safe action | Prohibited / owner gate | Evidence required |
|---|---|---|---|---|
| Security incident / credentials | HUMAN_ONLY | detect, redact, open internal task | credential handling, permission changes, remediation | owner/security receipt |
| Gmail/Drive intake | AI_ASSISTED | metadata classification, draft links, duplicate detection | send/archive/delete/share/export private content | source revision + human review |
| GitHub work intake | AUTONOMOUS_WITH_EVIDENCE | read PR/CI/issues, stale-branch scoring, draft task | merge, close/delete, external comment without authorization | SHA/run/issue receipt |
| Website/SEO | LOW_RISK_AUTONOMOUS | audit links/schema/contracts, draft content briefs | publish/deploy, claims, mass page creation | build/test + source evidence |
| Analytics | AI_ASSISTED | aggregate anomaly report | create property/tag, inspect person data | authenticated aggregate receipt |
| Repair booking / Academy | OWNER_APPROVAL | private workflow QA with synthetic records | outreach, commercial decision, learner progression decision | scoped production/synthetic evidence |
| Sales/recruiting | AI_ASSISTED | summarize permitted records, draft next step | send outreach, hire/reject, pricing/contract | owner approval + CRM evidence |
| Finance | NEVER_AUTOMATE | variance draft from approved aggregates | payments, invoices, pricing, account access | owner approval |
| AI routing | LOW_RISK_AUTONOMOUS | choose verified executor under budget | credential switching, high-risk action, recursive task generation | route/cost/result ledger |
| Legacy bridge | SHOULD_NOT_AUTOMATE | read-only containment audit | command dispatch/tunnel restart | security closure receipt |
