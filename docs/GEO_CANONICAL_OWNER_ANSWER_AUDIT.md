# GEO Canonical Owner & Answer Audit

Status: `STACKED_PREVIEW — NON-VISUAL`

Backlog: Issue #693 tasks 46–60  
Measurement source of truth: Issue #206  
Parent AI-operations slice: PR #697

## Purpose

Make canonical ownership and answer-surface readiness auditable before Hermes creates or redesigns production pages.

The audit answers four questions:

1. does every governed AI-visibility owner resolve to a real production route and, where appropriate, a sitemap-backed indexable URL;
2. are reviewed prompt intents accidentally assigned to competing canonical owners;
3. does an existing reviewed answer candidate contain the answer, evidence, entities, safe-claim coverage, and machine/human semantic parity required by the GEO contract;
4. which owner should be remediated first based on evidence/truth gaps rather than design preference.

## Route and sitemap ownership

The built-output audit now requires every non-demo prompt owner to:

- exist in `dist` after the production build;
- remain indexable (no accidental `noindex`);
- appear in built sitemap XML output.

Preview-only `/demos/` owners must remain outside the production sitemap and cannot carry weekly monitoring dependency.

This keeps `built route`, `indexable route`, and `sitemap-backed route` as separate checks.

## Reviewed prompt-intent conflicts

Intent conflicts are not guessed from keyword similarity.

`detectReviewedPromptIntentOwnerConflicts` accepts only reviewed opaque `intentGroupKey` mappings. Each mapping must use the canonical owner already governed by the prompt registry. If one reviewed intent group maps to more than one canonical owner, the conflict is surfaced for review.

No owner is automatically reassigned.

## Production answer candidates

`geoProductionAnswerCandidates` is intentionally small and review-first. It currently contains the already reviewed car-hauling candidate only.

Missing candidates remain explicit `answer_surface_missing` gaps. The audit does not mass-generate pages to make the score look complete.

## Expected facts and prohibited claims

Fact coverage is explicit review evidence, not semantic guesswork.

A `GeoReviewedPromptFactCoverage` record may mark only exact expected facts and prohibited claims already registered for that prompt. Unknown facts/claims are rejected. The record also requires a valid review timestamp and opaque reviewer label.

The first reviewed mapping covers `LOG-01` against the car-hauling production candidate.

## Answer completeness contract

For each canonical owner the audit reports:

- surface present / valid;
- expected-fact coverage;
- prohibited-claim coverage;
- entity-definition completeness;
- evidence/source-module completeness;
- comparison-surface completeness where a governed prompt has comparison intent;
- question-answer completeness for educational/problem-solving intent;
- concise-answer readiness;
- long-form supporting explanation readiness;
- schema ↔ human answer semantic parity.

## Concise answer

The current machine-readable extraction guard requires a non-empty answer of 40–520 characters ending as a sentence. This is a structural extraction guard, not a claim that one word count ranks better in AI search.

## Long-form support

A complete supporting surface requires multiple `why`, `what it means for you`, and `how to apply` items. This prevents a one-paragraph answer from being treated as a complete evidence-backed decision surface.

## Machine/human semantic parity

`checkGeoAnswerSchemaSemanticParity` builds the governed schema and verifies that:

- page/question name matches the visible question;
- `acceptedAnswer.text` exactly matches the visible short answer;
- schema `about` entity names match the governed visible entity set.

The test prevents a machine-only claim from diverging from what a person can read.

## Remediation order

`buildGeoAnswerOwnerRemediation` sorts unresolved owners by evidence/review gap count first, then total structural gaps. Design preference is not a priority input.

A missing visual module is never allowed to outrank an unresolved truth/evidence gap simply because it looks more noticeable.

## Visual boundary

This package audits existing surfaces and produces no new production-page composition. It therefore does not add a CEO visual approval item. Any later implementation that materially changes layout, hero, cards, evidence modules, navigation or mobile composition must be added to Issue #694 before production adoption.
