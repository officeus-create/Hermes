# HAE Runtime Evidence Acceptance

Date: 2026-10-23  
Status: SOURCE QA HELPER / NOT RUNTIME PROOF  
Owner: Hermes Automatic Engineer

## Purpose

Convert the current bounded HAE reliability gate into a deterministic fail-closed evidence check.

This helper does not call Cloudflare, does not read secrets, does not deploy, does not publish, and does not authorize merge/release. It only validates a sanitized evidence package produced by the authorized runtime verification path.

A PASS is named:

`EVIDENCE_COMPLETE_FOR_RELEASE_REVIEW`

It deliberately does **not** output `LIVE_VERIFIED`.

## Required evidence

The input JSON must include:

- exact owner-verified `target_sha`;
- authenticated deployment evidence reference plus exact deployed `source_sha`, matching the target;
- expected runtime mode = `dry_run` and publication explicitly disabled;
- private health evidence reference proving D1 database health, the same source SHA, `dry_run`, publication disabled and a durable cron heartbeat with the same continuity values;
- separate authenticated Cloudflare Queue evidence with existence + known backlog count;
- separate authenticated Cloudflare DLQ evidence with existence + known backlog count;
- if DLQ backlog is nonzero: durable classification evidence proving every item is classified, zero unclassified items, zero current-canary items, and zero blocking items;
- one succeeded generic job whose `job_type` exactly matches the current HAE read-only executor allowlist, with durable receipt reference, explicit idempotency key, READ_ONLY permission class and explicit `external_write=false`;
- replay evidence with the explicit same idempotency key, reused existing logical job, `duplicate_execution_count=0`, and explicit `second_external_side_effect=false`;
- independent QA PASS with reviewer/evidence reference.

The contract test derives the current executor allowlist from `workers/automation-engine/src/index.mjs` plus `HISTORICAL_READ_ONLY_JOB_TYPES` and fails if the checker allowlist drifts.

Negative evidence is fail-closed: missing `external_write` or `second_external_side_effect` is UNKNOWN and blocks the gate; absence is never interpreted as false.

A nonzero DLQ is not automatically a failure when every item is already classified as unrelated/quarantined historical evidence and none blocks the current canary. An unexplained, unclassified, current-canary, or blocking DLQ item fails the gate.

Private health is allowed to report Queue metrics as partial/UNKNOWN when Cloudflare's separate authenticated transport readback supplies the authoritative Queue/DLQ evidence. UNKNOWN is never converted to zero or PASS.

## Usage

`node scripts/hae-runtime-evidence-check.mjs path/to/sanitized-evidence.json`

Exit codes:

- `0` — evidence package is complete for release review;
- `1` — one or more acceptance blockers exist;
- `2` — invalid invocation/input.

## Evidence boundary

The checker validates structure and internal consistency of supplied evidence. It cannot prove that a supplied receipt is authentic by itself.

Runtime truth still comes from the authorized Cloudflare/D1/Queue/DLQ/readback path and independent QA.

The promotion ladder therefore remains:

`CODED -> EXACT_HEAD_CI_GREEN -> MERGED -> DEPLOYED -> LIVE_VERIFIED -> BUSINESS_VERIFIED`

This checker is a guard between runtime evidence collection and the human/protected release decision. It is not a shortcut around any level.
