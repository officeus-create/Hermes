# Hermes Compliance Data Governance

Reviewed: 2026-08-10

## Purpose

This is an engineering and operations release gate for new public forms, CRM connections, analytics, advertising technology, accounts, payments, uploads, and international data flows. It is not a substitute for service-specific legal review.

## Default rule

Collect the minimum information needed for a defined business purpose. Do not retain information merely because it can be collected. Give access only to people and systems that need it, and securely delete or de-identify information when the operational, contractual, security, accounting, dispute, or legal need ends.

## Required inventory before a data flow goes live

For every live collection point document:

1. page / product / form name;
2. responsible Hermes business and contracting entity if known;
3. categories of personal information collected;
4. purpose for each category;
5. whether each field is required or optional;
6. receiving endpoint and system of record;
7. service providers / subprocessors that receive the data;
8. analytics fields and an explicit list of fields prohibited from analytics;
9. access roles;
10. retention or deletion rule;
11. security controls;
12. privacy notice shown at or before collection;
13. request route for access / correction / deletion / applicable opt-out;
14. region-specific review required for the intended audience;
15. owner and review date.

## Prohibited by default

Do not place names, email addresses, phone numbers, VINs, MC/USDOT numbers, identity documents, exact private addresses, free-form messages, passwords, payment credentials, or sensitive records in analytics events, public URLs, query parameters, logs intended for public diagnostics, demo fixtures, or screenshots.

Do not enable a new advertising pixel, remarketing provider, session replay tool, fingerprinting technology, payment processor, document-upload flow, or cross-border audience campaign until the privacy and cookie/tracking impact has been reviewed.

## Retention

Each live workflow must have a written retention rule before launch. “Keep forever” is not an acceptable default. Retention may vary by record type when needed for a legitimate business or legal purpose. When the purpose ends, delete or de-identify the record where feasible and consistent with legal obligations.

## Access and security

Use least-privilege access. Separate public website data from credentials and operational secrets. Prefer role-based accounts over shared credentials. Use MFA where supported for systems holding customer, carrier, applicant, or payment-related information. Review access when roles change or people leave.

## Privacy requests

Public privacy requests route through `/privacy-choices/` and `officeus@hermeslogisticsus.com`. The receiving team must identify the relevant business/system before promising a specific statutory right or response deadline. Verification must be proportionate and should not collect unnecessary sensitive data.

## California / U.S. state privacy gate

Before a workflow subject to a U.S. state privacy law goes live, verify applicability and required notices, request methods, opt-out mechanisms, sensitive-data rules, retention disclosures, and browser-based opt-out signal requirements. Do not assume one state’s rules apply everywhere and do not assume they do not apply without checking the business and processing thresholds.

## International gate

Before intentionally targeting the EEA, UK, or another jurisdiction with additional privacy rules, review lawful basis, cookies/tracking consent, data-subject rights, controller/processor roles, international transfers, retention, and required disclosures. A translated page alone is not treated as proof that a service is legally launched in that market.

## Payment gate

Before accepting payment, publish or attach the applicable contracting entity, exact offer, price, taxes if relevant, delivery/scope, cancellation/refund rules, and recurring-billing terms when applicable. Payment credentials should be handled by an approved payment provider rather than stored directly by the Hermes website unless a separately reviewed architecture requires otherwise.

## Source principles used for this baseline

This operational baseline follows the FTC’s data-minimization/security approach (take stock, scale down, lock it, dispose securely, plan ahead) and the California requirement that an applicable Notice at Collection be presented at or before collection. Legal applicability must still be checked for each business and workflow before relying on this document as a compliance determination.
