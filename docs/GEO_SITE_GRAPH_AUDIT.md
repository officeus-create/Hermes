# GEO Site Graph Audit

Status: `STACKED_PREVIEW — NON-VISUAL`

Backlog: Issue #693 tasks 61–70  
Parent owner-answer audit: PR #698  
Design escalation queue: Issue #694

## Purpose

Audit the links, canonical ownership, structured-data references, semantic parity, language graph and evidence graph around governed GEO owners before making visible navigation or page-design changes.

## Diagnostics

The audit can surface:

- direction hub → canonical owner link gaps;
- supporting resource pages with no backlink to a relevant commercial owner;
- canonical owners with no inbound internal links;
- pages that link more than one owner from an explicitly reviewed competing intent group;
- page path ↔ canonical path mismatches;
- WebPage schema owner-path mismatches;
- publication of entity IDs currently held in the public entity registry;
- Service provider IDs that do not point to an approved published entity;
- visible FAQ/Q&A ↔ FAQ schema parity mismatches;
- breadcrumb terminal path ↔ canonical owner mismatches;
- hreflang target ↔ target canonical mismatches.

The missing-link/orphan diagnostics are evidence for prioritization. They do not automatically rewrite navigation, insert cards, or choose a new visual composition.

## Competing owners

Overlinking is evaluated only against reviewed intent-group conflicts. The audit does not infer competing intent from keyword similarity.

## Entity publication

The public entity registry remains authoritative. Entity records with `schemaPublication: hold` are reported if they appear as published structured-data identities. Service provider IDs must point to an approved published entity.

## FAQ/Q&A parity

Visible and structured FAQ pairs are compared after whitespace normalization. Machine-only questions or answers, and visible FAQ content missing from the structured representation, are both reported.

## Evidence graph

The evidence graph now explicitly emits relationship edges, connected entity IDs, and orphan node IDs. Relationship endpoint validation remains a hard gate: an edge referencing a missing entity fails before a graph is emitted.

Orphan nodes are diagnostics rather than automatic deletion instructions.

## Visual boundary

This slice changes no production navigation or page layout. If a later remediation requires a materially different navigation, card system, answer module, entity diagram, or mobile composition, that implementation must be added to Issue #694 for batch CEO visual review. Minor internal-link fixes remain autonomous.
