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
D1 is durable execution state.
Provider systems are external side effects.
GitHub is source/release history.
ChatGPT can design, debug and improve the engine, but is not the scheduler.

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

Each migration must end with:
`SOURCE → LIVE → READBACK → HEALTH → OWNER-INDEPENDENT RUN`.
