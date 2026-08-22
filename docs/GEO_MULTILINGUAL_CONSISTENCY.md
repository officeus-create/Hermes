# Hermes GEO Multilingual Consistency

Status: `IMPLEMENTED_AUDIT — NO AUTO-TRANSLATION`

Backlog: #703 tasks 191–195  
Measurement source of truth: #206  
Design / visual gate: #665 / #694

## Objective

Keep multilingual GEO surfaces consistent without pretending that translated text itself proves factual parity.

The contract stores reviewed structural signatures only:

- surface ID and translation group;
- language tag;
- canonical owner;
- governed AI prompt IDs when a prompt is explicitly mapped to that localized owner;
- hreflang language → canonical-owner evidence;
- stable entity IDs;
- stable claim keys and reviewed source keys.

It does not auto-translate claims, infer equivalent facts from text similarity, or generate localized pages.

## Prompt / page consistency

When a governed AI prompt is explicitly assigned to a localized surface, the audit checks:

- prompt language equals the page language tag;
- prompt canonical owner equals the page canonical owner.

An unknown prompt, language mismatch or owner mismatch remains a review issue rather than being silently reassigned.

## Hreflang consistency

Every surface must have a self hreflang entry pointing to its own canonical owner. Within a translation group, every reviewed language must point to the canonical owner registered for that language.

This catches missing reciprocal targets and language→owner mismatches without manufacturing x-default or locale routes that do not exist.

## Entity identity

Translated variants of one reviewed answer group must preserve the same stable entity ID set. Names and prose may be localized elsewhere, but the identity graph must not create a second Hermes, service or evidence entity merely because the language changes.

## Claim/source parity

Factual parity is represented by stable claim keys and stable reviewed source keys. The audit detects:

- missing/extra claim keys;
- a translated claim pointing to a different reviewed source set.

It does not compare translated prose and does not auto-copy a fact to another locale.

## Locale owner conflicts

A translation group may have only one canonical owner per language tag. Multiple different canonical owners for the same group + locale produce an explicit conflict signal; this is not automatically called cannibalization.

## Privacy / truth boundary

No raw queries, AI-provider conversations, user data, account identifiers or machine translation output are stored in this contract. Language consistency is a governance layer, not evidence that a translation is linguistically correct or commercially justified.

Tests are chained into `npm test`. Full exact-head Website checks are required before tasks 191–195 are marked complete.
