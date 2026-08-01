# Vehicle Transport Demand Registry

Date: 2026-07-31  
Tracking: Issue #20, draft PR #19, queue tasks 151–160

## Purpose

Define privacy-safe dealer, shipper, broker, auction, and private-customer demand research that may link only to verified carrier-lane evidence.

A demand record is not a shipment, booking, customer commitment, recurring-volume commitment, or public capacity statement. A link between demand and a carrier lane does not prove live availability, price, timing, or acceptance.

## Supported demand intents

1. Independent dealer transport
2. Dealer-group relocation
3. Auction pickup
4. Remarketing volume
5. Classic and luxury vehicle transport
6. Port, terminal, yard, or storage pickup
7. Private-customer qualification
8. Broker opportunity qualification
9. Recurring-volume shipper qualification

Each intent has required evidence, allowed coordination/research scope, and prohibited claims.

## Verified-lane link gate

A demand record must have:

- controlled source IDs;
- valid review date;
- supported intent;
- sanitized lane-candidate ID;
- carrier-lane evidence status `verified`;
- normalized origin and destination at city/state resolution;
- dated demand-evidence review;
- privacy review.

`missing` and `research_only` carrier-lane evidence are blocked. Current load-board observations do not meet this gate.

Synthetic records remain `research_only` even when every structural field is complete. Owner-approved sanitized or verified-public evidence can reach only `eligible_for_editorial_review`.

There is no automatic `published`, `capacity_confirmed`, or `booked` state.

## Port and storage boundary

Hermes may coordinate transport information involving a third-party port, terminal, auction, yard, or storage facility. Hermes must not claim to own or operate the facility, provide warehousing/storage, or control facility release, fees, rules, or availability.

## Recurring-volume boundary

Customer-provided estimates are not verified recurring volume. Classification as `verified_recurring_pattern` requires reviewed evidence. No capacity, price, service-level, or recurring-load guarantee is allowed.

## Privacy boundary

The controlled record excludes names, phones, emails, companies, MC/DOT, exact addresses, VINs, gate codes, account numbers, orders, invoices, BOL/POD, free-form notes, individual rates, commissions, customer/broker/carrier identities, live positions, and credentials.

`OFFICE 374 2026` must not be connected or copied. Repository tests use synthetic source IDs, lane IDs, cities, and states only.
