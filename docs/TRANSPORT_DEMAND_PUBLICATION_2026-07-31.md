# Transport Demand Publication Gate

Date: 2026-07-31  
Tracking: Issue #20, draft PR #19, queue tasks 161–170

## Purpose

Require confirmed carrier-fit evidence, dated demand and competition evidence, unique operational value, privacy review, and claims review before a customer-demand candidate may reach editorial review.

This gate does not publish pages, create bookings, assign carriers, or claim live capacity.

## Required evidence

A candidate must include:

- controlled candidate and lane references;
- carrier-capacity source IDs and review date;
- manual capacity confirmation for review;
- a valid capacity-confirmation expiry date;
- capacity basis other than a current load-board offer observation;
- dated local-demand source IDs;
- dated competition-research source IDs;
- at least three unique operational guidance points;
- existing carrier and demand page paths;
- an approved dealer, shipper, broker, or private-customer CTA;
- privacy and claims review.

Synthetic candidates remain `research_only`. Missing evidence produces `blocked_missing_evidence`. An approved sanitized or verified-public candidate can reach only `eligible_for_editorial_review`.

## Capacity boundary

Manual capacity confirmation is internal, time-limited, and specific to the reviewed context. It is not a public promise of availability, rate, timing, acceptance, equipment, or recurring volume.

Current load-board offers are private observations and cannot confirm capacity.

## CTA families

- Dealer: vehicle details, pickup market, destination, condition, release status, and ready date.
- Shipper: vehicle types, estimated frequency, common markets, timing, and operating requirements.
- Broker: route, vehicle/commodity, equipment requirement, timing, and verification details.
- Private customer: pickup/delivery markets, condition, equipment preference, and ready date.

Every CTA begins a manual review only. It does not create a booking or guarantee a carrier, capacity, rate, pickup, delivery, recurring volume, or acceptance.

## Lane-pair linking

Carrier and demand pages may be paired only when they share reviewed route/corridor, equipment or vehicle category, market/service area, dated carrier evidence, and dated demand evidence.

Required crawl paths include hub-to-carrier, hub-to-demand, reciprocal carrier/demand links, direct contact/intake, and relevant checklist support.

Links are navigation, not proof of live capacity or current demand.

## Measurement boundary

Use Search Console impressions, clicks, CTR, average position, query family, canonical page, and competing Hermes pages. Use existing privacy-safe GA4 `logistics_cta_click` and `contact_click` events.

A click is not qualified demand. Count qualified demand only from an approved internal aggregate after manual review of intent, route, equipment, timing, consent, and business fit.

Never send names, contacts, companies, exact addresses, VINs, gate codes, account/order numbers, free-form messages, individual rates, shipment documents, or customer/broker/carrier identities to analytics.
