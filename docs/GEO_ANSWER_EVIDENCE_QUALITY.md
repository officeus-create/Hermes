# Hermes GEO Answer / Entity / Evidence Quality

Status: `IMPLEMENTED_AUDIT — EVIDENCE FIRST`

Backlog: #703 tasks 176–190  
Measurement source of truth: #206  
Design / visual gate: #665 / #694

## Objective

A canonical answer owner is not GEO-ready merely because it has correct headings, JSON-LD, FAQ markup or a polished visual composition. Readiness requires reviewed evidence, governed entity identity, canonical ownership and human/machine semantic parity.

## Public source review

Public-source evidence receives an explicit review record:

- evidence ID;
- exact HTTPS source URL;
- reviewed timestamp;
- `approved | hold | withdrawn` state.

A missing, held, withdrawn or URL-mismatched source blocks evidence readiness. The audit does not silently replace a missing review with the presence of a URL.

## Claim and entity evidence

The audit reports:

- claim → reviewed-source completeness;
- source records that are present but unused;
- entity → claim evidence coverage;
- Service ↔ governed Organization/provider relationship completeness;
- held public-entity leaks.

The existing public entity registry remains authoritative. Entities with `schemaPublication: hold` must not become publishable organization nodes simply because an answer surface references them.

## Canonical owner / audience / use case

Each reviewed answer candidate can be checked against an explicit owner expectation:

- exact surface ID;
- canonical owner path;
- intended audience;
- intended use case.

This prevents a structurally valid answer from drifting onto an adjacent Hermes owner or audience.

## Visible answer ↔ JSON-LD parity

The generated schema is checked against the governed human-readable surface for:

- question name;
- accepted short answer;
- entity names and IDs;
- public citation URL set.

The machine layer must not say something materially different from the visible answer.

## Q&A duplicate / conflict diagnostic

Reviewed question variants are normalized only for duplicate/conflict detection. The system distinguishes:

- same normalized question + same reviewed answer fingerprint → duplicate;
- same normalized question + different reviewed answer fingerprint → conflict.

It does not rewrite or auto-merge facts.

## Evidence freshness

Evidence freshness is separate from provenance. Based on `verifiedAt`, supporting evidence becomes:

- `fresh`;
- `aging`;
- `stale`;
- `undated`.

A stale or undated source can block answer readiness without changing its original truth/evidence class.

## Evidence-first remediation

Remediation priority is intentionally ordered toward:

1. missing/held/withdrawn reviewed sources;
2. incomplete claim evidence and held entity leaks;
3. stale/undated evidence;
4. owner/audience/use-case mismatches;
5. entity relationship problems;
6. visible/schema parity;
7. unused structural evidence.

Cosmetic redesign is not a substitute for any of these evidence gaps.

## Readiness semantics

`evidenceReady` requires reviewed supporting sources, complete claim/source coverage and non-stale dated evidence.

`structureReady` requires canonical owner alignment, no held entity leak, required service/provider relationship consistency and visible/schema parity.

`ready = evidenceReady && structureReady`.

Therefore structure alone cannot make a page GEO-ready.

## Privacy / truth boundary

The audit stores no raw search queries, provider conversations, user data, account IDs, credentials or private lead evidence. Public source reviews use only public URLs, opaque evidence IDs, review timestamps and controlled states.

Tests are chained into `npm test`. Full exact-head Website checks are required before tasks 176–190 are marked complete.
