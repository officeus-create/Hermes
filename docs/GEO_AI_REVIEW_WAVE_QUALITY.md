# Hermes GEO AI Review-Wave Quality

Status: `IMPLEMENTED_CONTRACT — MANUAL REVIEW ONLY`

Backlog: #703 tasks 161–175  
Measurement source of truth: #206  
Design / visual gate: #665 / #694

## Objective

Turn manual AI visibility reviews into comparable, privacy-safe evidence waves without storing provider conversation text.

A review wave records only:

- versioned wave ID and exact date window;
- governed prompt-registry fingerprint;
- reviewed provider receipts with pseudonymous reviewer labels and opaque evidence references;
- observation IDs already accepted by the sanitized AI observation boundary;
- controlled factual-error severity;
- controlled evidence-support state;
- indexes of governed prohibited claims observed by the reviewer.

It never stores full ChatGPT/Gemini/Copilot/Perplexity/Google AI Mode responses, prompts copied from provider UI, accounts, cookies, tokens, emails, phones, session IDs or user-level identifiers.

## Quality metrics

Per reviewed provider, the report keeps separate:

- canonical-owner citation match rate;
- wrong-Hermes-owner citation rate;
- unmapped-Hermes-path citation rate;
- brand mention without citation rate;
- factual-error count and severity score;
- evidence-supported answer rate;
- prohibited-claim occurrence count;
- competitor inclusion rate within the reviewed wave only;
- entity accuracy and description accuracy.

None of these metrics is market share, Google ranking, provider ranking or share of search.

## Registry fingerprint

The prompt registry fingerprint covers prompt ID, direction, language, geography, intent, canonical owner, cadence, expected facts and prohibited claims. It uses the existing non-cryptographic FNV-1a convention for deterministic change detection only. It is not proof of provider authenticity.

## Provider coverage debt

For every governed canonical owner, the report compares reviewed prompt × provider pairs against the providers declared for the wave. Missing pairs remain explicit coverage debt; they are never converted to zero performance.

## Stale-evidence remediation

The remediation queue combines:

- prompt cadence age;
- wrong/unmapped/no canonical citation risk;
- factual-error severity;
- unsupported/partial evidence state;
- prohibited-claim occurrences.

It prioritizes review work, not cosmetic redesign.

## Comparable waves

Trend comparison is allowed only when both waves have:

- the same governed prompt-registry fingerprint;
- the same exact window length;
- the same provider set;
- the same prompt × provider coverage keys;
- non-overlapping chronological windows.

Only then are competitor inclusion, entity accuracy, description accuracy and citation-match deltas produced. A provider-set or coverage change returns `not_comparable` with explicit reasons instead of a misleading trend.

## Truth boundary

Synthetic observations cannot satisfy real wave evidence. A factual-error severity cannot exist without `factualError=true`, and a factual error cannot be marked with severity `none`. Prohibited claims are referenced by their governed prompt index, not by storing arbitrary provider-response text.

Tests are chained into the repository AI visibility contract. Full exact-head build/test/e2e is required before tasks 161–175 are marked complete.
