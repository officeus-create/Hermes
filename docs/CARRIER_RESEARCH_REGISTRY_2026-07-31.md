# Carrier Research Registry

Date: 2026-07-31  
Tracking: Issue #20, draft PR #19, queue tasks 128–138

## Purpose

Define a privacy-safe internal structure for carrier content research after a lane candidate has passed the separate evidence score. This registry does not create carrier profiles, approve carriers, book loads, publish capacity, or generate public pages.

## Carrier research record

Each record contains only controlled research fields:

- synthetic/internal research record ID;
- source/provenance IDs;
- review date;
- evidence mode;
- one approved equipment cluster;
- operating stage;
- one or more approved problem clusters;
- language scope;
- privacy-review state;
- service-scope-review state;
- optional sanitized lane-candidate reference.

The structure has no fields for names, phones, emails, companies, MC/DOT, exact addresses, VINs, orders, invoices, BOL/POD, notes, rates, commissions, identities, live positions, or credentials.

## Equipment clusters

1. `open_car_hauler`
2. `enclosed_car_hauler`
3. `hotshot_car_hauler`
4. `multi_car_trailer`

Every cluster includes required evidence and prohibited assumptions. Capacity, vehicle suitability, current availability, authority, insurance, and unit count cannot be inferred.

## Problem clusters

1. `load_search`
2. `backhaul_deadhead`
3. `documents_setup`
4. `rate_negotiation_support`
5. `direct_shipper_dealer_development`

Each cluster separates allowed coordination or research from prohibited guarantees. Carrier approval remains mandatory for loads, rates, routes, equipment, vendors, and operating decisions.

## Vendor-introduction boundary

Research categories are limited to:

- insurance agents;
- truck listings;
- trailer listings;
- maintenance services;
- compliance services;
- technology and document tools.

Hermes may research public or owner-approved provider information, prepare a comparison, or make a manually approved introduction. The third-party provider controls eligibility, underwriting, financing, pricing, inventory, condition, terms, and service decisions as applicable.

Never claim guaranteed approval, price, availability, financing, inventory, condition, or an undocumented referral/compensation relationship.

## Evaluation states

- `blocked_missing_evidence` — provenance, review date, equipment, problem, language, privacy, or service-scope evidence is incomplete.
- `research_only` — valid synthetic record; useful for testing and structure only.
- `eligible_for_editorial_review` — an owner-approved sanitized or verified-public record passed the required checks.

There is no `published` or `approved_carrier` state. Editorial eligibility never creates a page or public claim.

## Current blocker

No owner-approved sanitized historical carrier/route export is connected. All repository examples and tests remain synthetic. `OFFICE 374 2026` must not be connected or copied into fixtures.
