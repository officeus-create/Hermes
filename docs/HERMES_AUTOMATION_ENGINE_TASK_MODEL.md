# Hermes Automation Engine — Generic Task Model

Date: 2026-10-13  
Owner: #1018 Growth Bridge

The social pilot is only the first workload. The engine must become a generic task motor inside Hermes Connect.

## Core state machine

```
CREATED
  ↓
QUEUED
  ↓
RUNNING
  ├─→ WAITING_EXTERNAL
  ├─→ WAITING_APPROVAL
  ├─→ RETRY_SCHEDULED
  ├─→ BLOCKED
  ├─→ FAILED
  └─→ SUCCEEDED
```

No task disappears because a chat ended.

## Generic job object

Every durable automation job should carry:

```
job_id
job_type
business_lane
account_key
project_key
priority
state
current_step
available_at
attempt_count
max_attempts
idempotency_key
policy_version
payload_json
result_json
last_error_class
created_at
updated_at
completed_at
```

## Immutable job events

Every meaningful transition writes an append-only event:

```
event_id
job_id
event_type
from_state
to_state
step
evidence_ref
provider_ref
error_class
created_at
```

The CRM UI can then reconstruct exactly what happened without relying on chat history.

## Task definitions

A task definition contains:
- trigger;
- allowed business lanes;
- input schema;
- ordered/conditional steps;
- retry policy;
- timeout;
- approval gates;
- provider capability requirements;
- cost policy;
- truth/safety policy;
- completion evidence.

Examples:

```
social.publish
social.reply
history.ingest
history.coverage.audit
experiment.evaluate
news.ingest
news.publish
telegram.digest
seo.monitor
lead.qualify
crm.followup.prepare
carrier.source.refresh
catalog.profile.refresh
website.health.check
invoice.reconcile
```

## Progressive execution

A job may run one small step, persist state, then stop.

Example:

```
news.ingest
1. FETCH_SOURCE         → SUCCEEDED
2. NORMALIZE            → SUCCEEDED
3. DEDUPE               → SUCCEEDED
4. FACT_GATE            → SUCCEEDED
5. WEBSITE_CANDIDATE    → WAITING_APPROVAL
6. DISTRIBUTE_SOCIAL    → not yet eligible
```

When approval arrives, execution resumes from step 5. It never restarts from zero.

## Historical learning is evidence, not runtime authority

HAE must reuse Hermes' existing historical corpora instead of creating another memory system.

The canonical contract is:
[`HERMES_AUTOMATION_ENGINE_HISTORICAL_LEARNING.md`](./HERMES_AUTOMATION_ENGINE_HISTORICAL_LEARNING.md).

Historical jobs are allowed to:
- ingest/index existing evidence;
- preserve provenance and content hashes;
- deduplicate without deleting provenance;
- classify CURRENT/SUPERSEDED/ERROR/RESULT/EXPERIMENT/IDEA/SKILL_SIGNAL;
- build explicit source/time coverage maps;
- normalize social observations;
- propose hypotheses and versioned experiments.

Historical jobs are not allowed to:
- authorize credentials or provider writes;
- turn stale/superseded instructions into current policy;
- self-enable an automation;
- substitute missing data with zero;
- optimize only for vanity metrics when qualified downstream evidence exists.

Any adaptive policy change must have a `policy_version`, explicit hypothesis, sample gate, guardrails and rollback target. Historical analysis proposes policy; current gates activate policy.

## Read-only generic executor V1

The first generic executor implementation is intentionally narrower than the final capability list.

It reuses the same canonical Cloudflare Queue and Hermes Connect D1 and currently accepts only:

- `system.health.snapshot`
- `history.coverage.audit`

Private job submission requires:
- explicit `job_type`;
- `business_lane`;
- explicit `idempotency_key`;
- optional account/project/policy/payload;
- existing private HAE bearer authorization.

Runtime behavior:
1. persist job in `hermes_automation_jobs`;
2. append immutable job event;
3. enqueue `job.execute` on the existing HAE Queue;
4. atomically claim QUEUED or due RETRY_SCHEDULED work;
5. execute a bounded read-only capability;
6. persist SUCCEEDED / RETRY_SCHEDULED / FAILED plus result/error;
7. recover lost queue messages and stale RUNNING leases from durable D1 state.

The historical coverage audit is deliberately fail-closed: until the Historical Evidence Ingestor tables and classified source rows exist, it reports `complete=false` and the missing runtime pieces. It cannot publish, email, DM, mutate provider policy, or self-enable a live action.

This source delta proves the generic task schema is becoming executable without weakening the current Threads provider gate. It does **not** by itself prove deployed runtime.

## CRM Automation Center

Hermes Connect should eventually expose:

### Overview
- running jobs;
- waiting jobs;
- blocked jobs;
- failures;
- DLQ;
- provider health;
- last success per automation.

### Automation definitions
- enabled/disabled;
- trigger;
- account/project;
- policy;
- schedule;
- cost mode;
- approval mode.

### Job detail
- current step;
- full event timeline;
- evidence;
- provider receipt;
- retry count;
- exact blocker;
- next trigger.

### Historical evidence
- source family and trust tier;
- coverage start/end and gaps;
- CURRENT vs SUPERSEDED classification;
- unresolved conflicts;
- experiment/policy lineage;
- downstream outcome evidence;
- last metrics observation timestamp.

### Brand/account policy
- allowed topics;
- forbidden topics;
- allowed destinations;
- locale;
- cadence;
- provider account;
- claim rules.

### Cost control
Per automation:
- deterministic only;
- local model allowed;
- Workers AI free-envelope allowed;
- paid model disabled by default;
- monthly hard cap.

## Ownership rule

There is one canonical Automation Engine.

Hermes Connect is the control UI and business context layer.
Cloudflare/runtime is the execution layer.
The existing canonical Hermes Connect D1 is durable execution state; HAE must not create a parallel database.
Provider systems are external side effects.
GitHub is source/release history.
ChatGPT can design, debug and improve the engine, but is not the scheduler.

Historical evidence is another input to this same engine, not a separate scheduler, database or control plane.

## First migration sequence

1. Threads carrier-only publishing.
2. Threads owned-comment replies.
3. Website Insights/news ingestion.
4. Telegram distribution.
5. Instagram/Facebook.
6. LinkedIn.
7. X.
8. Other Hermes business lanes.
9. Non-marketing operational automations.

Historical Evidence Ingestor may be developed read-only in parallel when runtime progress is blocked, but it must not delay or bypass the acceptance gate for the current Threads pilot.

Each migration must end with:
`SOURCE → LIVE → READBACK → HEALTH → OWNER-INDEPENDENT RUN`.
