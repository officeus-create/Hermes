# Carrier Sales Handoff - Agreement v3

Status: SALES AND REVIEW FLOW READY / PRODUCTION EXECUTION STILL GATED  
Primary short URL: `https://hermeslogisticsus.com/carrier/`  
Current review master: `ATTORNEY-REVIEW-V3-2026-08-06`

## Purpose

Give Logistics Sales one consistent phone-friendly path:

1. carrier understands control and value in about 60 seconds;
2. carrier chooses Dispatch Support, Operations + Growth, or Custom Cooperation;
3. carrier confirms the company, signer, and agreed percentage;
4. carrier reviews the exact Appendix A summary;
5. carrier signs and keeps a PDF review packet;
6. equipment, lanes, load boards, credentials, and operating details are collected later through the appropriate secure onboarding process.

The signing form must remain short. Do not turn the agreement into an operational questionnaire.

## Safe SMS links

Base link:

`https://hermeslogisticsus.com/carrier/`

A prepared commercial link may contain only:

- `plan=essential|pro|custom`;
- `rate=1-15` with up to two decimals;
- `rep=<public-safe representative/team code>`;
- `offer=<public-safe offer code>`.

Example:

`https://hermeslogisticsus.com/carrier/?plan=pro&rate=8&rep=Assistant%20107&offer=PRO-AUG`

Never place carrier name, email, phone, MC/USDOT, signer identity, internal carrier ID, tracking ID, or private document reference in the URL.

The canonical SMS link must remain usable without query parameters. Prepared links are optional context only and must never become identity, authentication, or record-retrieval tokens.

## Recommended sales sequence

### 1. Confirm fit privately

Before sending the link, confirm the carrier is operating or preparing to operate, has an authorized business contact, and understands the proposed service model and percentage. Equipment and lane discovery may occur in conversation, but it is not required in the pre-signature web form.

Do not request passwords, PINs, W-9 files, CDL images, bank information, VIN lists, gate codes, or private shipment records through SMS or the public agreement URL.

### 2. Set the reason for the link

Use a low-pressure explanation:

> I am sending one Hermes page where you can see the important terms in plain English, confirm the exact percentage we discussed, and complete the agreement packet from your phone. You continue approving every load and keeping control of the operation.

### 3. Send the link

General SMS:

> Hermes carrier agreement: review the simple terms, keep control of every load, and complete the signature packet from your phone. https://hermeslogisticsus.com/carrier/

Prepared-offer SMS:

> I prepared the Hermes carrier agreement link with the service model and percentage we discussed. Review the summary first, then confirm the company and signer. Questions can be resolved before the signature: [PREPARED LINK]

Follow-up after 15-30 minutes when appropriate:

> Were the control, payment, and percentage terms clear? Tell me which section needs clarification before you sign.

Do not use fake deadlines, false scarcity, guaranteed income, guaranteed loads, or hidden conditions.

## Conversation bridge before the CTA

Use questions that reduce uncertainty:

- Which decisions do you want to keep personally? The agreement keeps final load and operating decisions with the carrier.
- Is the percentage shown in your private link the percentage we discussed?
- Is the signer authorized to act for the legal carrier company?
- Is anything unclear about non-exclusivity, payment flow, invoices, or termination?
- Would you prefer to read the full PDF/HTML before completing the three-step packet?

## CTA hierarchy

1. `Review and sign` - for a qualified carrier with a confirmed rate.
2. `See what Hermes handles` - when value or responsibility boundaries need explanation.
3. `Read the full agreement` - when the carrier wants detailed legal review.
4. `Call Logistics Sales` - immediate human fallback.

Do not make a file download the only next step. Every review screen must provide a clear path back to the carrier-specific Appendix A packet.

## Visual hierarchy

- dark navy: trust, control, and serious business context;
- amber/gold: primary action and the exact next step;
- green: carrier control, confirmation, and safe payment/data boundaries;
- violet: Hermes product structure and secondary navigation;
- red: draft status, security boundaries, and legal warnings only.

No countdowns, pulsing panic animations, fake availability, or aggressive red primary buttons.

## Three-step signing flow

### Step 1 - Confirm the offer

Required:

- service model;
- exact carrier-specific percentage for Appendix A.

Optional:

- Hermes representative/team code;
- offer code;
- custom scope when Custom Cooperation is selected.

### Step 2 - Company and signer

Required:

- legal company name;
- MC or USDOT;
- authorized signer name/title;
- business email;
- mobile or business phone.

Optional:

- DBA;
- company website.

Do not request a full street address before signature. The company is identified by legal name and authority number; counsel may later require a notice address in the approved execution package or private records system.

### Step 3 - Review and sign

Show before signature:

- legal company;
- selected model;
- exact percentage;
- signer;
- carrier-control boundary;
- freight-payment boundary;
- no-guarantee boundary;
- current document status.

Require affirmative electronic-record consent, signer-authority confirmation, document review, selected-scope confirmation, typed name, and drawn signature.

## Current execution boundary

The repository review master is:

- version: `ATTORNEY-REVIEW-V3-2026-08-06`;
- PDF: `/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf`;
- PDF SHA-256: `9d26436b95b63610179f3af9ac4cddf5df59a1610e402bad2162ef394951d5cb`;
- master percentage: blank;
- carrier-specific percentage: signed Appendix A.

The endpoint must remain in review mode until production has all of the following:

- counsel-approved non-review master version;
- immutable approved PDF path and SHA-256;
- `CARRIER_CONTRACT_ALLOWED_PERCENTAGES` containing the exact supported rates;
- preview/production binding isolation;
- approved internal recipients and records retention;
- successful synthetic phone execution.

A custom proposal never becomes live automatically.