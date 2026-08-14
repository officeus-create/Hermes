# Carrier Sales Handoff - Agreement v3

Status: COUNSEL-CONFIRMED STANDARD EXECUTION LIVE / CUSTOM TERMS REVIEW ONLY
Primary SMS URL: `https://hermeslogisticsus.com/sign/`  
Detailed proposal URL: `https://hermeslogisticsus.com/carrier/`  
Current execution master: `HERMES-CARRIER-EXECUTION-V2026-08-06`

## Purpose

Give Logistics Sales one consistent phone-friendly path:

1. carrier sees the control, money-flow, and responsibility boundaries in plain English;
2. carrier chooses Dispatch Support, Full Partnership, or Carrier Proposal;
3. carrier confirms the company, authorized signer, and agreed percentage;
4. carrier reviews the exact Appendix A summary;
5. carrier signs and keeps a downloaded PDF execution packet for a standard 6% or 8% selection;
6. equipment, lanes, load boards, credentials, and operating details are collected later through the appropriate secure onboarding process.

The signing form must remain short. Do not turn the agreement into an operational questionnaire.

## Safe SMS link

Send only the clean public handoff:

`https://hermeslogisticsus.com/sign/`

Do not place a percentage, plan, carrier name, email, phone, MC/USDOT, signer identity, representative identity, internal carrier ID, tracking ID, offer code, or private document reference in a public URL.

A future personalized execution link must use an opaque, signed, expiring, single-purpose token resolved by Hermes on the server. Raw commercial terms and personal data must never become URL parameters, identity tokens, authentication tokens, or record-retrieval keys.

## Recommended sales sequence

### 1. Confirm fit privately

Before sending the link, confirm the carrier is operating or preparing to operate, has an authorized business contact, and understands the proposed service model and percentage. Equipment and lane discovery may occur in conversation, but it is not required in the pre-signature web form.

No passwords, bank details, W-9, CDL image, VIN list, or shipment documents in this flow.

Do not request passwords, PINs, recovery codes, API keys, W-9 files, CDL images, bank information, payment credentials, VIN lists, gate codes, release documents, or private shipment records through SMS or the public agreement URL.

### 2. Set the reason for the link

Use a low-pressure explanation:

> I am sending one private Hermes page where you can see the important terms in plain English, understand what stays under your control, and continue from your phone. You approve every load and keep control of the operation. You may review the full agreement or call us before completing the packet.

### 3. Send the link

General SMS:

> Hermes Logistics: here is the private carrier link we discussed. Review the working model, see what stays under your control, and continue from your phone: https://hermeslogisticsus.com/sign/

Follow-up when appropriate:

> Were the control, payment, and percentage terms clear? Tell me which section needs clarification before you continue.

Do not use fake deadlines, false scarcity, guaranteed income, guaranteed loads, hidden conditions, or threatening language.

## Conversation bridge before the CTA

Use questions that reduce uncertainty:

- Which decisions do you want to keep personally? The agreement keeps final load and operating decisions with the carrier.
- Is the percentage in the carrier-specific Appendix A the percentage we discussed?
- Is the signer authorized to act for the legal carrier company?
- Is anything unclear about non-exclusivity, payment flow, invoices, or termination?
- Would you prefer to read the full agreement before completing the three-step packet?

## CTA hierarchy

1. `Continue to carrier packet` - qualified carrier ready to confirm the offer.
2. `Review the agreement first` - carrier wants detailed terms before continuing.
3. `Ask a question` - immediate human fallback.
4. `See what Hermes handles` - carrier needs more value and scope explanation.

Do not make a file download the only next step. Every review screen must provide a clear path back to the carrier-specific Appendix A packet.

## Visual hierarchy

- dark navy: trust, control, and serious business context;
- violet-to-magenta gradient: the primary continuation action;
- green: carrier control, confirmation, and safe payment/data boundaries;
- amber/gold: document status and terms requiring attention;
- red: actual errors, draft status, and legal/security warnings only.

No countdowns, pulsing panic animations, fake availability, aggressive red primary buttons, or unverified time-to-complete claims.

## Three-step signing flow

### Step 1 - Confirm the offer

Required:

- service model;
- exact carrier-specific percentage for Appendix A.

Optional:

- Hermes representative/team code kept inside the submitted record, not the public URL;
- offer code kept inside the submitted record, not the public URL;
- custom scope when Carrier Proposal is selected.

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

The counsel-confirmed repository execution master is:

- version: `HERMES-CARRIER-EXECUTION-V2026-08-06`;
- PDF: `/contracts/Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf`;
- PDF SHA-256: `ac35ae765617010dd7551b4a22537b32715923c49601d9aac1f21bbb5e0904a8`;
- master percentage: blank;
- carrier-specific percentage: signed Appendix A.

Standard execution remains live only while production has all of the following:

- the counsel-confirmed non-review master version;
- immutable approved PDF path and SHA-256;
- `CARRIER_CONTRACT_ALLOWED_PERCENTAGES` containing exactly the supported standard rates `6,8`;
- preview/production binding isolation;
- approved internal recipients and records retention;
- passing automated execution, delivery, retry, and idempotency tests.

A custom proposal never becomes live automatically. The clean `/sign/` URL remains intentionally free of personal or commercial data; the exact terms are entered and confirmed inside the protected form.
