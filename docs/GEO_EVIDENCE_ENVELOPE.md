# Hermes GEO Evidence Envelope

Status: `IMPLEMENTED_CONTRACT — EXTERNAL EVIDENCE GATED`

Backlog: #703 tasks 101–115  
Measurement source of truth: #206  
Design contract: #665  
CEO visual queue: #694

## Objective

Wrap a validated secure GEO operational scorecard in one deterministic evidence envelope so operators can answer:

- which sanitized evidence receipts were reviewed;
- which evidence class each receipt belongs to;
- which canonical owner/window it applies to;
- whether a comparable receipt is active, superseded or withdrawn;
- whether multiple active comparable receipts disagree;
- whether the underlying report changed;
- which evidence chains remain incomplete.

The envelope does **not** authenticate Google, Bing, GA4 or private operations by itself. Evidence class and reviewed receipt provenance remain authoritative. The deterministic fingerprint is for change detection only.

## Version

- envelope schema: `geo_evidence_envelope_v1`;
- fingerprint algorithm: `fnv1a64-noncryptographic`;
- operational report remains independently versioned by the scorecard compiler.

Changing the report evidence or normalized receipt set changes the envelope ID. Reordering equivalent sanitized input rows does not.

## Receipt contract

Every receipt contains only:

- opaque `reference_id`;
- controlled evidence `layer`;
- controlled `evidence_class`;
- clean site-relative `canonical_owner`;
- `window_days` = `7 | 28 | 90 | null`;
- timezone-explicit `observed_at`;
- opaque sanitized `evidence_fingerprint`;
- declared status `active | superseded | withdrawn`;
- optional `supersedes_reference_id`.

No account/property/container IDs, raw queries, lead rows, names, email, phone, credentials, full AI responses or private operational values are accepted.

## Supersession

Supersession must be explicit and comparable:

`new receipt → supersedes_reference_id → older receipt`

Both receipts must share the same layer, evidence class, canonical owner and window. A newer receipt cannot silently supersede a different owner/window/class. A superseding receipt cannot be older than the receipt it replaces.

## Conflicts

If two or more effective-active receipts share the same comparable key but contain different evidence fingerprints, the envelope emits:

`multiple_active_comparable_receipts_disagree`

The system does not select a winner automatically.

## Withdrawn evidence

`withdrawn` is separate from:

- stale;
- missing;
- superseded;
- unverified.

A withdrawn receipt remains in provenance but is not active evidence.

## Incomplete chains

The envelope carries through held evidence from the secure operational report, including:

- non-standard exact search windows;
- incomplete canonical funnel event families.

It does not convert held evidence into zeroes or complete conversions.

## Output formats

### Machine JSON

`serializeGeoEvidenceEnvelopeJson()` uses canonical key ordering and normalized receipt ordering.

### Human Markdown

`serializeGeoEvidenceEnvelopeMarkdown()` exposes the same envelope ID, report fingerprint, receipt states, conflicts and incomplete chains in a compact review format.

Both formats pass the existing GEO output privacy scan.

## Truth boundary

A matching fingerprint proves only that the sanitized payload is unchanged under this deterministic algorithm. It is **not** a cryptographic signature, platform authentication, indexing proof, GA4 receipt proof, receiver proof or qualification proof.

External evidence remains gated until the corresponding authenticated or private-safe review is performed.

## Verification

The contract test covers:

- deterministic envelope/report fingerprints;
- row-order independence;
- report-change fingerprint changes;
- explicit supersession;
- active conflict detection;
- withdrawn evidence;
- future-date rejection;
- missing/cross-owner supersession rejection;
- duplicate receipt rejection;
- JSON/Markdown parity;
- privacy fail-closed behavior.

The test is chained into the repository `npm test` path. Full exact-head build/test/e2e remains required before tasks 101–115 can be marked complete.
