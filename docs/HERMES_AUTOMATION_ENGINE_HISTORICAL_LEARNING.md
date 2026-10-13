# Hermes Automation Engine — Historical Learning Contract

Date: 2026-10-13  
Owner: #1018 Growth Bridge  
Status: **SPEC / SOURCE-ONLY — NO RUNTIME POLICY MUTATION**

## Purpose

HAE must learn from Hermes' accumulated operating history without creating a third brain, treating stale material as current policy, or optimizing from one viral post.

The historical layer is an evidence system. Runtime authority remains:
- current owner policy / current One Brain;
- current GitHub source and protected release state;
- live provider/runtime evidence;
- canonical Hermes Connect D1 state.

Historical chats, Drive documents, social metrics and legacy branches may suggest hypotheses. They never authorize credentials, external writes, production policy changes or provider actions by themselves.

## Existing evidence to reconcile, not duplicate

Known current evidence families include:
- the existing ChatGPT / Digital CEO evidence lake with conversation-level provenance;
- persisted Claude semantic extraction batches;
- current One Brain CURRENT/SUPERSEDED records;
- GitHub issues, PRs, commits and release receipts;
- provider histories such as Threads post/reply/insight data;
- approved CRM / Hermes Connect outcomes;
- future Facebook, Instagram, Search, telephony and operational histories where access is legitimate.

A source family is not "complete" just because an export exists. Coverage must be explicit.

## Source record

Every ingested source must preserve:

```text
source_id
source_family
source_class
source_uri_or_ref
source_owner
source_created_at
source_modified_at
ingested_at
content_hash
trust_tier
freshness_class
current_status = CURRENT | SUPERSEDED | UNKNOWN
coverage_start
coverage_end
coverage_limit_reason
parent_source_id?
```

Trust rules:
1. LIVE/provider/current canonical evidence outranks historical summaries.
2. Current owner policy outranks older instructions.
3. Anonymous-writable, superseded or legacy sources are hypothesis-only.
4. Missing data is UNKNOWN, never zero.
5. Provider/API retention limits are stored as coverage gaps, never silently ignored.

## Knowledge candidate

Historical source material becomes a candidate before it can become policy:

```text
candidate_id
source_id
business_lane
project_key
candidate_type =
  DECISION | ERROR | RESULT | EXPERIMENT | IDEA | SKILL_SIGNAL | PROCESS | METRIC
claim
context_json
evidence_refs_json
conflict_refs_json
confidence
current_status
created_at
updated_at
```

Promotion ladder:

```text
RAW_SOURCE
→ EXTRACTED_CANDIDATE
→ DEDUPED
→ VERIFIED_OR_FRESH
→ OWNER_APPROVED        (only where action/policy requires it)
→ CURRENT_CANONICAL
→ IMPLEMENTED
→ MEASURED
```

No stage may be skipped by wording a summary more confidently.

## Coverage map

For every source family and business lane track:

```text
coverage_id
source_family
business_lane
expected_start
observed_start
observed_end
items_seen
items_classified
items_unclassified_relevant
known_gaps_json
gap_reason_json
last_scan_at
status = COMPLETE | PARTIAL | BLOCKED | UNKNOWN
```

Completion gate:
- `UNCLASSIFIED_RELEVANT = 0`, or
- every residual gap has an explicit reason and owner.

This prevents narrow-window analysis from being reported as historical truth.

## Social observation object

Each historical social publication must be normalized independently of provider:

```text
observation_id
account_key
platform
provider_post_id
permalink
published_at_utc
target_market
locale
market_local_hour
weekday
media_type
is_root
is_own_reply
is_repost
normalized_body_hash
duplicate_family
topic_cluster
cta_class
link_state
link_domain
campaign_phase
prior_1h_count
prior_6h_count
prior_24h_count
account_regime
views
likes
inbound_replies
own_replies
reposts
shares
quotes
qualified_actions
revenue_evidence
metrics_observed_at
source_id
```

Rules:
- REPOST_FACADE is not scored as a failed editorial post.
- OWN_REPLY and INBOUND_REPLY are separate metrics.
- Direct @ outreach is separated from root/editorial distribution.
- Exact/near duplicate bodies remain linked so repeated-copy variance can be studied.
- Local hour is computed for the intended market, not only the account timezone.
- Metrics are append-only snapshots; later insight refreshes do not erase earlier observations.

## Historical Threads evidence already established

Authenticated provider history available to the current Hermes account is bounded by provider/API coverage; pre-boundary history must be recovered from other evidence families rather than fabricated.

Current dated corpus evidence recorded in #1018:
- 571 unique post rows;
- 338 root/editorial rows after excluding repost facades and direct @ outreach;
- root/editorial median 25 views, mean 110.5;
- major regime shifts between 2025, 2026 Q1/Q2 and October 2026;
- Vietnam-localized content produced extreme outliers, but repeated identical/near-identical copy produced materially different results;
- follower geography and content-market alignment are useful context dimensions, not automatic targeting authorization;
- historical reply data proves OWN_REPLY / INBOUND_REPLY separation is mandatory.

These findings are hypotheses/evidence, not hard-coded production policy.

## Experiment contract

Historical analysis proposes an experiment; it does not directly rewrite a live policy.

```text
experiment_id
policy_version
business_lane
account_key
hypothesis
eligible_population
control_definition
variant_definition
allocation_mode = EXPLOIT | EXPLORE | CONTROLLED_MIX
primary_metric
diagnostic_metrics
minimum_sample
minimum_duration
guardrails_json
rollback_policy_version
started_at
ended_at
decision
decision_evidence_refs_json
```

Promotion requirements:
1. explicit hypothesis;
2. minimum sample/duration;
3. time/regime normalization when history spans materially different periods;
4. downstream metric preferred over reach;
5. no promotion from a single viral observation;
6. rollback target exists before activation;
7. external-write policy still passes current owner/provider gates.

## Objective hierarchy

For carrier acquisition, optimize toward:

```text
VIEW / REACH
→ ENGAGED VISIT / PROFILE
→ VALID ATTRIBUTED SITE SESSION
→ CARRIER CTA / FORM / MESSAGE
→ VERIFIED CARRIER IDENTITY
→ QUALIFIED
→ ONBOARDED / ACTIVE
→ ATTRIBUTABLE GROSS / REVENUE
```

Views are diagnostic when stronger evidence exists. Missing downstream attribution is a measurement gap, not permission to call reach "business success."

## Automation Candidate Detector

Historical evidence can nominate repeatable work for HAE when it can quantify:

```text
candidate_automation_id
task_family
business_lane
observed_frequency
estimated_human_minutes
error_rate_or_risk
external_side_effects
required_provider_capabilities
current_manual_owner
evidence_count
known_failures
expected_value
implementation_cost
confidence
recommended_action = IGNORE | DOCUMENT | ASSIST | AUTOMATE_READ_ONLY | AUTOMATE_WITH_GATE
```

Ranking principle:
`frequency × time saved × error reduction × business value ÷ implementation/operational risk`.

No candidate can self-enable production writes.

## Runtime boundary

Historical ingestion and analytics may run read-only while HAE provider publishing remains blocked.

They must not:
- introduce a second scheduler or database;
- store provider secrets in history records;
- reactivate superseded instructions;
- bypass current business/account policy;
- use ChatGPT as required production scheduler;
- publish, email, DM, reply or spend money merely because historical evidence suggests it.

## Acceptance gate

Historical Learning V1 is complete only when:
1. existing evidence lakes are indexed rather than re-created;
2. coverage map exposes every known source/time gap;
3. duplicated/conflicting facts retain provenance;
4. Threads history can be reconstructed into normalized observations;
5. OWN_REPLY / INBOUND_REPLY and root/repost/direct-outreach are separated;
6. repeated-copy/context analysis is reproducible;
7. at least one hypothesis can be converted into a versioned experiment with rollback;
8. no historical record can mutate live policy or cause an external action without current gates.
