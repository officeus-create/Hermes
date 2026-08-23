# Active AI Workstreams

These folders mirror the six active Hermes AI conversations. They are routing views over one repository, not separate projects or copies.

## 01 HERMES CORE

Global architecture, canonical state, cross-workstream contracts, AI coordination, data boundaries, ownership and sequencing.

## 02 WEB

Website implementation, performance, release engineering, CI, accessibility, browser behavior, production readiness and visual integration after approval.

## 03 HERMES CONNECT

Hermes Connect product and revenue system: repair-shop onboarding, access/activation, booking, CRM, customer history, mobile/PWA, localization and product growth.

Canonical product runtime remains in the main Hermes repository. Do not create a separate Connect clone.

## 04 SEO

Technical SEO, indexing, search measurement, internal linking, content ownership, schema, authority/backlinks and organic conversion paths.

Use the existing SEO collaboration documents as domain memory.

## 05 GEO

Public AI visibility, entity consistency, citations, answer-engine evidence, source coverage, factual error tracking, competitor share and AI referral measurement.

GEO must not silently change SEO title/meta/canonical ownership or publish unsupported facts.

## 06 AUDIT

Independent QA and decision review. Verify current-head state, regressions, evidence freshness, branch overlap, stale assumptions and release blockers. AUDIT should not become a parallel feature owner unless explicitly reassigned.

## Shared rules

Every workstream:

- opens the same local root: `~/Hermes`;
- reads `docs/AI_START_HERE.md` and `docs/ai-project-state.json` first;
- uses a bounded feature branch;
- checks open PRs and current-head CI before implementing;
- updates canonical handoff/error/state files only when their state materially changes;
- never creates a second Hermes repository to gain isolation.
