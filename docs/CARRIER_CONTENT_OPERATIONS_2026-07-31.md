# Carrier Content Operations

Date: 2026-07-31  
Tracking: Issue #20, draft PR #19, queue tasks 145–150

## Purpose

Provide reusable, claims-safe carrier content operations without publishing new pages or inventing performance data.

## CTA variants

The registry defines CTA variants for:

- open car haulers;
- enclosed car haulers;
- hotshot car haulers;
- multi-car trailers;
- new authorities;
- active owner-operators;
- small fleets;
- growth-stage carriers.

Every CTA starts a review only. It does not create an account, approve a carrier, book a load, or guarantee rates, revenue, mileage, capacity, or direct freight.

## Problem-to-hub linking

Carrier problems map only to existing, indexable Hermes routes:

- load search;
- backhaul and deadhead;
- documents and setup;
- rate-negotiation support;
- direct shipper and dealer development.

The registry does not create lane pages or claim current availability. Build-time tests verify that every destination exists in generated output.

## FAQ boundary

The reusable FAQ language states that:

- loads, rates, mileage, revenue, and results are not guaranteed;
- the motor carrier makes final load and operating decisions;
- a new authority review is not approval or a first-load guarantee;
- third-party insurance, financing, truck, and trailer decisions remain with providers;
- direct-freight development does not guarantee responses, agreements, recurring volume, or loads.

## Qualification and onboarding

The controlled qualification fields cover authority stage, insurance status, equipment cluster, operating area, availability window, operating constraints, and the communication/approval workflow.

Sensitive values are `private_intake_only`. MC/DOT, live truck position, exact address, contacts, free-form notes, rates, and shipment details must not enter public content or analytics.

Carrier approval is required before booking. Automatic negotiation and messaging remain disabled.

## Refresh schedule

- Monthly: Search Console query/page performance, privacy-safe GA4 clicks, internal links, cannibalization, claims, FAQ, CTA, and contact accuracy.
- Quarterly: equipment/stage taxonomy, qualification guidance, direct-freight/vendor boundaries, and language research capacity.
- Event-triggered: unsupported claims, privacy defects, broken SEO/conversion paths, owner corrections, or failed regression tests.

## Measurement contract

Use only current privacy-safe signals:

- Search Console: impressions, clicks, CTR, average position, query family, canonical page, and competing Hermes pages;
- GA4 `logistics_cta_click`: CTA type, audience role, page cluster, page path, and destination path;
- GA4 `contact_click`: contact method, page cluster, and page path.

A click is not a qualified inquiry. Qualified inquiry counts may be added only from an approved internal aggregate after manual qualification. Never send names, phones, emails, companies, MC/DOT, addresses, messages, equipment identifiers, rates, shipment details, or customer information to analytics.

No Search Console, GA4, or inquiry values are guessed or populated by this registry.
