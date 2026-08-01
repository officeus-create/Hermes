# Carrier claims and value boundary

Date reviewed: 2026-07-31
Queue scope: Issue #20 tasks 111–115
Status: internal release-control document; not public marketing copy

## Purpose

Define which carrier-facing value statements are supported by current repository content and which statements remain blocked pending signed service-scope evidence. This prevents coordination and information support from being presented as guaranteed freight, operating authority, income, capacity, or business control.

## Current source set

Reviewed against current `main`:

- `src/pages/logistics/car-hauling-dispatch/index.astro`
- `src/pages/logistics/owner-operator-dispatch-support/index.astro`
- `src/pages/logistics/new-authority-car-hauler-support/index.astro`
- `src/pages/logistics/fleet-owner-dispatch-support/index.astro`
- `src/pages/logistics/resources/car-hauler-capacity-checklist/index.astro`
- `src/pages/paths/logistics/carriers/owner-operators/index.html` generated from the current logistics path engine

Historical AI notes, PR descriptions, private operations records, load-board observations, and `OFFICE 374 2026` are not evidence for public claims.

## Approved carrier value categories

The current repository supports the following twenty categories as coordination, review, organization, or communication assistance. Each category remains subject to actual authority, insurance, equipment, geography, timing, broker requirements, available information, and carrier approval.

1. Load-search support.
2. Route review.
3. Equipment-fit review.
4. Pickup and delivery requirement review.
5. Deadhead awareness.
6. Broker communication support.
7. Rate-discussion support without a promised result.
8. Broker setup-packet coordination.
9. Insurance-certificate coordination.
10. Rate-confirmation organization.
11. Pickup and delivery document organization.
12. Invoice preparation or organization support.
13. Accounts-receivable follow-up support.
14. Carrier operating-profile documentation.
15. Capacity and equipment-restriction documentation.
16. Preferred-region and lane-preference documentation.
17. Availability and communication-rule documentation.
18. Authority, insurance, and readiness review using available information.
19. Direct-freight relationship research and development as a separate long-term process.
20. Structured operating communication and back-office follow-through.

These are capability categories, not promises that every service is available in every engagement. A signed agreement or owner-approved service description remains authoritative for a specific carrier.

## Required control language

Carrier-facing content must preserve all of the following:

- the motor carrier controls the truck, driver, safety, compliance, and transportation service;
- the carrier reviews and approves each load before booking;
- the carrier makes the final decision on rates, routes, timing, equipment use, insurance, and operating commitments;
- Hermes provides information, communication, dispatch, coordination, and back-office support within the agreed scope;
- no page may imply that Hermes owns or operates a carrier's equipment unless separately verified for a specific transaction;
- no automatic booking, negotiation, messaging, or operational commitment is authorized by the website or synthetic prototypes.

## Outcome claims that are prohibited

Do not promise or imply:

- guaranteed loads or load volume;
- guaranteed rates, revenue, profit, or weekly gross;
- guaranteed mileage, lane consistency, return loads, or backhauls;
- guaranteed direct customers, dealer relationships, or broker approval;
- immediate readiness for a new authority;
- guaranteed insurance, truck, trailer, financing, or vendor approval;
- confirmed public capacity based on current load-board observations;
- confirmed historical routes based on observed offers;
- that a completed or verified internal record is automatically approved for publication.

## Two-department positioning gate

Any statement that Hermes provides two distinct departments, teams, or service lines for one carrier is **blocked for new public copy** unless the exact structure and responsibilities are supported by:

1. an owner-approved current service description or signed agreement;
2. a clear separation of responsibilities;
3. confirmation that the structure is currently deliverable;
4. claims review for every public page using the statement.

Existing generic references to dispatch and back-office support do not by themselves authorize a public claim that two dedicated departments are assigned to every carrier.

## Direct-freight timeline boundary

Direct-freight development may be described only as a separate, long-term research and relationship-development process. Public language must:

- avoid a fixed completion date;
- avoid promising a direct shipper, dealer, broker, lane, or volume;
- state that timing depends on market fit, outreach, qualification, response, service history, capacity, and commercial approval;
- keep any internal planning estimate out of public copy unless separately approved and evidenced;
- distinguish relationship development from currently available loads.

Approved baseline wording:

> Direct-freight development is a separate long-term process for researching and building repeat dealer, auction, broker, or shipper relationships. Timing and results are not guaranteed.

## Data and privacy boundary

This document does not authorize use of real shipment rows, private marketplace observations, customer or carrier identities, MC/DOT values, exact addresses, order or document identifiers, notes, rates, commissions, live positions, credentials, or `OFFICE 374 2026` data in fixtures or public content.

Current load-board offers remain private observations. They are not evidence of completed transportation, public capacity, repeat lanes, or future availability.

## Release gate for carrier copy

Before publishing or materially changing carrier-facing copy, record:

- source file or approved business document;
- exact claim being made;
- whether it is coordination, review, communication, or an outcome;
- carrier-control language present;
- no-guarantee language present;
- direct-freight wording reviewed when applicable;
- privacy review complete;
- reviewer and review date;
- result: `APPROVED`, `HOLD FOR EVIDENCE`, or `REJECT`.

## Queue result

- Task 111: twenty current carrier value categories recorded from repository-supported scope.
- Task 112: coordination/support language separated from prohibited outcome claims.
- Task 113: carrier control over loads, rates, equipment, insurance, safety, and business decisions preserved.
- Task 114: two-department positioning placed behind an explicit evidence gate.
- Task 115: direct-freight timelines restricted to approximate, non-guaranteed, long-term language.

Next independent queue work may proceed to synthetic normalization, dedupe, provenance, and scoring tasks using synthetic or owner-approved sanitized data only. Locating or connecting a real historical export remains blocked until a separately approved source is provided.