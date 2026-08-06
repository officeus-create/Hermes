# Hermes Connect — Sales Test Package

Status: READY FOR CONTROLLED SALES TESTING  
Owner: Hermes IT Development + Sales  
Release surface: responsive Web App  
Last updated: 2026-08-05

## Purpose

Give every sales representative the same short, honest product demonstration and capture comparable feedback before a prospect is promised access, integrations, pricing, or delivery timing.

This package tests product-market language and the access-request funnel. It does not create an account, booking, payment, subscription, calendar event, CRM record, or guaranteed implementation commitment.

## Approved links

- Product Web App: `https://connect.hermeslogisticsus.com/`
- Hermes overview: `https://hermeslogisticsus.com/services/hermes-connect/`
- Access form: `https://connect.hermeslogisticsus.com/#apply`
- Privacy notice: `https://hermeslogisticsus.com/privacy/`

Do not use preview-deployment URLs with prospects. Do not submit real client, patient, shipment, payment, credential, VIN, or protected operational data during testing.

## Supported sales categories

1. Beauty & wellness
2. Fitness & coaching
3. Professional services
4. Logistics & field services
5. Auto service & repair
6. Truck & car-hauler repair
7. Heavy equipment service
8. Oversize & specialty equipment
9. Education & events
10. Home & local services

## 60-second product explanation

> Hermes Connect gives a service business one professional web path where a client can understand the offer, choose the right service or request type, see controlled availability, and send a structured request. The current release works in a browser on a phone or computer. Access is reviewed by Hermes; it does not automatically create a paid account, booking, calendar connection, payment, or guaranteed custom build.

## Discovery questions

Ask these in order and record only business-safe answers:

1. What service do clients request most often?
2. Where do requests arrive today: phone, messages, website, calendar, or CRM?
3. What information must your team know before responding?
4. What repeated question wastes the most time?
5. What should a client be able to complete in under two minutes?
6. Which employees need to see or handle the request?
7. Which integration is truly required, and which would only be convenient?

Do not ask the prospect to provide passwords, payment details, medical information, private shipment records, VIN lists, gate codes, CDL images, W-9s, or client/customer identities during the sales test.

## Live demonstration sequence

1. Open the Web App on desktop.
2. Select the prospect's closest category.
3. Show how the business name, service examples, request language, and preview change.
4. Explain the four foundation capabilities: profile, service catalog, availability windows, and structured client intake.
5. Open the same page on a phone or responsive mobile browser.
6. Scroll to the access form and show the minimum fields without submitting real data.
7. State the controlled-release boundary before discussing future integrations.
8. Ask the prospect to describe one must-have workflow in one sentence.

Target demonstration time: 4–7 minutes.

## Category-specific examples

### Beauty & wellness

- service selection;
- specialist or location choice;
- availability request;
- basic preparation instructions.

### Fitness & coaching

- consultation or session type;
- in-person versus remote;
- preferred schedule;
- program goal stated without medical records.

### Professional services

- discovery call type;
- project category;
- qualification questions;
- preferred meeting window.

### Logistics & field services

- carrier, transport, or operations request type;
- service area or general operating region;
- equipment category;
- next review step without private load data.

### Auto service & repair

- vehicle class;
- diagnostic, maintenance, or repair request;
- general symptom description;
- shop or mobile-service preference.

### Truck & car-hauler repair

- truck, trailer, or car-hauler category;
- operating versus disabled status;
- shop or field-service request;
- urgency without passwords, documents, VIN lists, or load details.

### Heavy equipment service

- equipment class;
- inspection, maintenance, or field-service need;
- general location;
- safe callback and review step.

### Oversize & specialty equipment

- specialty equipment category;
- service or coordination need;
- general dimensions/classification only when appropriate;
- specialist review before private documents are exchanged.

### Education & events

- program or workshop;
- schedule preference;
- application or registration path;
- prerequisite questions.

### Home & local services

- service type;
- service area;
- one-time versus recurring need;
- estimate or visit request.

## Test personas

Run at least one test for each group:

- solo owner/operator;
- 2–5 person team;
- 6–20 person team;
- manager evaluating the product for multiple employees;
- prospect currently using only phone/social messages;
- prospect already using a calendar, CRM, or website form.

For automotive/equipment categories, include one repair shop, one mobile service provider, one commercial truck/car-hauler service operation, and one heavy/specialty equipment operation.

## Desktop and mobile checklist

For both desktop and mobile, verify:

- the page opens without an app installation;
- all ten category cards are visible and selectable;
- the preview changes to the selected category;
- the selected category appears in the access form;
- keyboard focus and labels remain usable;
- the mobile access button does not cover required content;
- no account, booking, payment, or calendar event is created by browsing;
- no private value is placed in the URL or analytics dimensions;
- validation blocks an incomplete request;
- a synthetic request uses obviously fake, non-production data;
- delivery success is not claimed unless the approved receiver confirms it.

## Synthetic test data

Use only obvious test values, for example:

- Name: `Hermes Connect Test`
- Email: an approved test inbox controlled by Hermes
- Business: `TEST — Category Review`
- Role: `Sales QA`
- Must-have workflow: `TEST ONLY: client chooses a service and sends a structured request.`

Never use a real prospect's details to prove the form works.

## Pass/fail scorecard

A test passes only when all required items below are true:

| Area | Pass condition |
| --- | --- |
| Category fit | Prospect can identify a suitable category without explanation longer than 30 seconds |
| Value clarity | Prospect can repeat the product's purpose in their own words |
| Mobile usability | Category selection and form review can be completed on a phone |
| Request clarity | Prospect can describe one must-have workflow in one sentence |
| Boundary clarity | Prospect understands that access, integrations, price, and timing require review |
| Privacy | No sensitive or client-level data is requested during the test |
| Sales accuracy | Representative makes no guarantee of acceptance, integrations, results, or launch date |

Recommended internal score:

- 7/7: ready for follow-up;
- 5–6/7: clarify objections before follow-up;
- below 5/7: do not advance; record the language or workflow mismatch.

This score is an internal diagnostic, not a conversion, revenue, product-success, or market-demand claim.

## Required feedback record

Record the following in the approved internal system, not in public GitHub issues:

- test date;
- representative;
- business category;
- device tested;
- current request method;
- must-have workflow;
- most important objection;
- pass/fail score;
- next action;
- whether the prospect gave permission for future follow-up.

Do not record client identities, medical information, credentials, private rates, shipment details, VINs, payment information, or unapproved documents in the sales-test record.

## Approved objection responses

### “Is this already a full booking system?”

The current controlled release provides the web profile, service/request structure, availability presentation, and access-request path. Calendar, payment, CRM, and automated reminder integrations require separate review and verification.

### “Is there an iPhone or Android app?”

The approved product is currently a responsive Web App that works in a modern phone browser. Native app-store releases are not being promised in this sales test.

### “How much does it cost?”

Pricing is not represented as universal on this test. Hermes reviews the category, team size, workflow, and required integrations before issuing a commercial proposal.

### “How fast can you launch it?”

No universal launch time is promised. Hermes first reviews fit, privacy, integrations, and the bounded first workflow.

### “Will it integrate with everything we use?”

No integration is assumed. Required systems must be named and verified before they are included in scope.

## Sales handoff rule

Advance the prospect only when:

1. the category is selected;
2. one must-have workflow is written clearly;
3. the prospect understands the controlled-release boundary;
4. a safe contact path and permission to follow up exist;
5. no unsupported integration, result, price, or deadline was promised.

The next step is a human Hermes review, not automatic account creation.
