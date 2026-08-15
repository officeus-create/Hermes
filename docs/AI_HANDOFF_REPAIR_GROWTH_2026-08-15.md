# Repair Shop Booking → Hermes Growth Lead Handoff

Date: 2026-08-15
Branch: `feature/repair-booking-growth-lead`
Parent: Issue #510

## Goal

Close the next revenue-loop gap after private beta feedback by giving a customer who has just completed a Repair Shop booking an explicit, optional path to request Hermes business-growth help.

## Delivered

- Adds `Grow My Business / Talk to Hermes` only on the Repair Shop public booking route.
- Keeps the card inside the confirmed-booking success state; it does not interrupt booking or appear as a forced overlay.
- Requires explicit consent before reusing the booking name/email for a separate business-growth inquiry.
- Reuses the existing `/api/logistics-lead` delivery path with `interest: ProgressoPro` instead of creating a second sales receiver.
- Supports website/conversion, SEO/Google visibility, social media, paid advertising, CRM/workflow automation, or recommendation-needed intent.
- Emits `connect_hermes_growth_cta_requests` only after the private lead endpoint confirms receipt.
- Sends no name, email, phone, message, or other booking PII into the analytics event.
- Does not add pricing, payment collection, or alter the confirmed repair appointment.

## Validation

- Static contract: `scripts/repair-shop-growth-cta-contract.test.mjs` wired into `npm test`.
- Browser contract: `tests/hermes-connect-repair-growth-cta.spec.ts` verifies booking → explicit opt-in → private lead delivery → zero-PII analytics.
- Full build/test execution delegated to PR CI.
