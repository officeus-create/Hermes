# GEO AI Visibility Operations

Status: `STACKED_PREVIEW — NON-VISUAL`

Backlog: Issue #693 tasks 31–45  
Measurement source of truth: Issue #206  
Parent search-intelligence slice: PR #696

## Purpose

Turn reviewed, privacy-safe AI visibility observations into an operating queue: what has been checked, what is stale or missing, what needs factual/citation remediation, and which canonical owners have enough current observation coverage to support decision-making.

This layer does not automate provider scraping, store full answers, or claim an external ranking.

## Observation freshness and cadence

The existing prompt registry remains authoritative for cadence:

- weekly prompts: 7-day review period;
- monthly prompts: 28-day review period.

The operations layer reuses the existing review-plan states:

- `never_observed`
- `overdue`
- `due_soon`
- `current`

Coverage is calculated per `prompt × provider`, not from the mere existence of one observation for a canonical owner.

## Provider coverage

Default reviewed providers remain:

- ChatGPT
- Gemini
- Copilot
- Perplexity
- Google AI Mode

For each provider the report exposes expected checks, observed checks, current checks, overdue checks, never-observed checks, coverage percentage, and current percentage.

Synthetic QA observations never count toward business coverage.

## Remediation queues

A real observation can enter one or more queues:

- factual error;
- brand mention without linked citation;
- linked citation without considered/explicit recommendation;
- cited path differs from the prompt's governed canonical owner;
- entity accuracy is partial/inaccurate;
- description accuracy is partial/inaccurate.

These signals identify review work. They do not automatically rewrite production pages.

## Competitor frequency and entity mention share

Competitor labels remain public business labels only. The report aggregates:

- occurrence count;
- providers where the competitor appeared;
- canonical owners whose reviewed observations included it.

Provider-level `entityMentionShare` is intentionally limited to the supplied reviewed observation set:

`Hermes mentions / (Hermes mentions + competitor mention occurrences)`

It is **not** market share, search share-of-voice, provider ranking, traffic share, or a claim about all answers on the provider.

## Accuracy windows

For each provider and 7 / 28 / 90-day window the report records:

- reviewed observation count;
- brand mentions;
- eligible entity-accuracy observations and exact-accurate rate;
- eligible description-accuracy observations and exact-accurate rate;
- factual-error count.

Synthetic observations are excluded.

## Citation ownership

The existing citation-alignment contract remains authoritative. A linked citation that does not point at the governed canonical owner is surfaced as a cited-path mismatch and enters remediation.

The layer does not infer that an alternative Hermes page should become the owner merely because a provider cited it.

## Evidence-reference freshness

`evidenceReference` remains an opaque reference, never full answer text. Its health is derived from the observation timestamp and the governed prompt cadence:

- `current` while the observation remains inside its review period;
- `stale` after that review period.

The reference itself is not parsed for private data or provider response content beyond the existing strict import boundary.

## Owner readiness

Each canonical owner receives a neutral operating readiness record:

- expected prompt-provider checks;
- observed prompt-provider checks;
- current prompt-provider checks;
- coverage percentage;
- current percentage;
- factual-error count;
- citation-mismatch count;
- remediation-item count.

This is an observation-completeness/readiness score only. It is not a provider ranking, search ranking, business quality score, or guarantee of visibility.

## Privacy boundary

The layer accepts only the existing structured observation fields. It does not store:

- response text;
- raw provider conversations;
- user prompts outside the governed public prompt registry;
- emails or phones;
- account/session IDs;
- cookies/tokens/credentials.

## Visual boundary

No UI, production layout, navigation, color, typography, animation or page composition changes are included. No CEO visual approval is required for this slice.
