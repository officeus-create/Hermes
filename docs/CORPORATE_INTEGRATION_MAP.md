# Hermes Corporate Integration Map

## Current integration truth
| From → To | Exists | Direction / trigger | Evidence / limitation | Decision |
|---|---|---|---|---|
| Website forms → lead-email Worker | PARTIAL | approved POST only when live env bindings exist | Code verified; live configuration not inspected | KEEP; verify receiver delivery before KPI claims. |
| Website → GA4 | PARTIAL | consent-gated controlled events | repository contract verified, actual stream receipt blocked | CONNECT after existing-property access is restored; never create replacement. |
| Website → GSC/Bing | PARTIAL | sitemap/index/measurement | owner-provided handoff only | CONNECT measurement evidence to page owners. |
| Connect → D1 | EXISTS | authenticated product requests | code and production-smoke contracts present; database itself not read | KEEP, least privilege, audit access. |
| Academy → shared auth/D1 | EXISTS | learner/reviewer workflows | code inspected | KEEP; separate candidate/training data from sales CRM. |
| Repair Shops → logistics lead receiver | PARTIAL | paid-activation request / manual close | documented and code-supported | CONNECT to private CRM with idempotency/outcome reconciliation. |
| Carrier contract → email/PDF | PARTIAL | gated legal workflow | repository contract; legal/live state conflicting | OWNER-GATED; legal approval/version/hash precede promotion. |
| GitHub → One Brain | PARTIAL | issue/PR/CI evidence | repository refs plus GitHub read-only API metadata inspected; no write scope used | CONNECT via read-only event ingestion, no credential sharing. |
| Drive/Gmail → knowledge/task graph | MISSING | email/doc changes | no connector available | DESIGN read-only ingestion with provenance/redaction. |
| Telegram → identity/event layer | PARTIAL | auth endpoint and separate operational runtime | token/operations intentionally uninspected | OWNER-GATED; isolate bot credentials and event contract. |
| AI workers → router | PARTIAL | local Codex/FCC and agent state | provider fallback unproven | CONNECT only through skill/cost/risk router + HUEG. |
| Legacy bridge → command execution | SHOULD_NOT_EXIST | legacy command queue/tunnel | current runtime status documents public-write + arbitrary-command risk, dormant | CONTAIN/RETIRE under #566 before pilot outreach. |

## Access-gate register
| Source | Access attempted / evidence | Status | What is required | What remains safe without it |
|---|---|---|---|---|
| GitHub | Read-only API and remote `main` checked 2026-08-25 | AVAILABLE_READ_ONLY | Existing authenticated `gh` session; write/merge remains separately gated | ownership map, CI/PR inventory, repository evidence. |
| Public Hermes web | Public HTTPS probes checked 2026-08-25 | AVAILABLE_PUBLIC_READ_ONLY | No account access required | canonical/reachability audit only. |
| Gmail | No approved Gmail connector in this runtime; local mail workspace deliberately not read | BLOCKED_BY_ACCESS | Scoped read-only connector/search with data-minimization policy | source map and connector design. |
| Google Drive | No approved Drive connector; no private docs or permissions read | BLOCKED_BY_ACCESS | Read-only metadata/content scope, owner-approved retention/redaction and separate admin flow for permission corrections | source classification and evidence model. |
| GA4/GSC/Bing | No authenticated provider surface verified in this runtime | BLOCKED_BY_ACCESS | Existing-property read access and aggregate-only receipt workflow | code/event-contract and measurement-plan review. |
| Cloudflare/D1 | No account binding, Worker log, database or deployment console inspected | BLOCKED_BY_ACCESS | Least-privilege read role and synthetic/non-PII verification plan | repository deployment/config contract review. |
| CRM / Database Carrier / Digital CEO Bridge | Explicit repository boundary; no approved connector used | PROTECTED / NOT_READ | Task-specific approved connector plus owner/data-class approval | schema/relationship design with synthetic examples only. |
| Local AI sessions/auth | Structure only; auth/session files intentionally not opened | PROTECTED / NOT_READ | No access is needed or desired for One Brain | sanitized handoffs and explicit registries. |

## Priority connection order
1. Secure #566 containment and establish a single owner-approved command/event ingress.
2. Restore **read-only** access to existing GA4/GSC/Bing/Cloudflare/GitHub views; ingest aggregate evidence with source/time/revision.
3. Establish private CRM/system-of-record reconciliation for delivered → reviewed → qualified → won, with no PII in GA4/Git.
4. Ingest Drive and Gmail metadata/content through scoped connectors into a provenance-aware knowledge layer.
5. Link GitHub work graph, release evidence, and HOS routing.
6. Add event adapters for Connect booking/Academy state only after data-retention/role approval.

## Boundary rule
Every connector declares: source owner, data class, read/write permission, trigger, idempotency key, retention, audit log, failure behavior, human escalation and rollback. Knowledge retrieval never grants credential access.
