# Codex takeover — Claude website, SEO, and Lane Intelligence handoff

Date: 2026-07-31
Owner: Codex implementation lane
Tracking: GitHub Issue #20 and draft PR #19

## Purpose

Finish the technically safe work described in the Claude handoff, preserve already merged SEO improvements, complete website development and internal logistics prototypes, and then continue the 200-task growth queue.

This document does not authorize production merge, deployment, DNS, billing, secrets, paid integrations, or publication of private operational data.

## 1. Source-of-truth order

Use the following order when claims conflict:

1. current `main` source and generated output;
2. current GitHub Actions results;
3. merged PRs and their verified tests;
4. current Search Console/GA4 data when connected and explicitly retrieved;
5. owner-approved sanitized operational exports;
6. historical reports and Claude notes as leads to revalidate, not current truth.

The old Claude report mentions different sitemap/Search Console states at different times. Revalidate rather than copying old page counts.

## 2. Existing public SEO resources to verify

Verify against current `main`, built HTML, sitemap, live canonical URL, schema, internal links, and forms:

- Appleton vehicle transport;
- Auction Vehicle Pickup Checklist;
- Car Hauler Capacity Checklist.

Required result for each:

- source path;
- canonical URL;
- sitemap inclusion;
- HTTP result when live verification is available;
- one title, description, and visible H1;
- schema validity;
- useful internal links;
- no private operational details;
- working direct contact fallback;
- test coverage status.

Do not republish or duplicate a page that already exists.

## 3. Open PR reconciliation

### PR #7 — `#journey` anchor

- compare the patch with current `main`;
- confirm the anchor is still missing before porting;
- preserve the existing `#why` section and analytics behavior;
- run build, static/unit tests, and Playwright;
- provide a merge recommendation, but do not merge without owner approval;
- do not reintroduce malformed `docs/AI_HANDOFF.md` formatting.

### PR #9 — old commercial logistics branch

Classify every changed file as:

- already superseded by merged PR #13;
- still useful and safe to port;
- obsolete;
- conflicting;
- requires business evidence.

Do not merge the branch wholesale.

### PR #19 — growth branch

- synchronize with current `main` without force-pushing;
- preserve merged PRs #13 and #15–#17;
- reconcile `package.json`, sitemap, CI, and any shared application files deliberately;
- run the complete CI suite after reconciliation;
- keep PR draft until owner review.

## 4. Shipment History data boundary

Completed transportation history is the primary internal source for confirmed lanes.

Current load-board offers are private observations only. They are not completed routes and cannot prove public availability, rates, capacity, or SEO claims.

### Allowed initial inputs

- synthetic fixtures;
- an owner-approved sanitized CSV;
- manually prepared samples containing no real PII or confidential commercial data.

### Prohibited direct input

The `OFFICE 374 2026` Google Sheet must not be connected directly to the public site or copied into public fixtures. It is an internal structure example only.

Never expose:

- names;
- phones or emails;
- company identities when not approved for publication;
- MC/DOT;
- exact addresses;
- customer, broker, dealer, shipper, or carrier identities;
- order IDs;
- invoices;
- BOL/POD;
- notes and call comments;
- individual posted, negotiated, or booked rates;
- commissions;
- live vehicle positions;
- credentials or access tokens.

## 5. Required lifecycle states

The internal model must distinguish:

- `observed` — offer or record was seen;
- `booked` — load was booked;
- `completed` — transportation was reported complete;
- `verified` — completion evidence passed review;
- `published` — a separate privacy/content review approved a sanitized public research fact.

No automatic transition from `completed` or `verified` to `published` is allowed.

## 6. Import-preview contract

Before any write, show a preview with:

- normalized origin and destination at the approved geographic resolution;
- equipment class;
- event date and freshness;
- source/provenance identifier;
- current lifecycle state;
- duplicate candidates;
- missing required fields;
- privacy-risk flags;
- quarantine reason;
- proposed action: accept, update, hold, reject, or needs review.

The first implementation must be read-only or preview-only.

## 7. Validation and quarantine

Quarantine examples:

- missing origin or destination;
- impossible or malformed date;
- unknown equipment;
- conflicting lifecycle states;
- completed without approved proof;
- duplicate with materially different rates or dates;
- PII present in a public-safe export;
- exact address where only city/state is allowed;
- unapproved company/customer identity;
- stale observed offer;
- no provenance;
- unsupported publication flag.

Never delete raw source records automatically while deduplicating.

## 8. Rate and offer metrics

Keep separate:

- posted rate;
- negotiated rate;
- booked rate.

Transparent derived metrics may include, on approved internal or synthetic data only:

- gross;
- loaded RPM;
- total-mile RPM;
- deadhead miles;
- deadhead percentage;
- fuel estimate inputs;
- toll estimate inputs;
- variable cost inputs;
- contribution after declared variable costs;
- offer freshness;
- travel-time estimate;
- home-time/equipment constraints;
- historical return-lane sample size.

Do not publish a hidden AI score. Every recommendation card must explain its inputs and limitations.

Suggested internal cards:

- Best Overall;
- Highest Gross;
- Best Total-Mile RPM;
- Lowest Deadhead;
- Best Return Probability.

These labels must not promise income, availability, booking, or a return load.

## 9. Internal interface boundary

Build the dispatcher/carrier workspace with synthetic data first.

Initial capabilities:

- read-only unified offer/history view;
- filters by status, equipment, origin, destination, and freshness;
- duplicate grouping without raw-record deletion;
- transparent metric explanation;
- quarantine review;
- manual handoff to booking;
- no automatic negotiation or messaging;
- no public export;
- no production real-data connection.

Before real data, document authentication, authorization, role boundaries, audit logs, retention, export, and revocation.

## 10. Load-board integration research

Research only current official channels for:

- DAT;
- Truckstop;
- Central Dispatch;
- Super Dispatch;
- Ship.Cars;
- other relevant providers discovered from official sources.

For each provider record:

- official API availability;
- CSV/export support;
- webhook support;
- email ingestion support;
- TMS/partner integration;
- OAuth/API-key/authentication model;
- commercial plan or permission requirements;
- rate limits;
- storage/retention conditions;
- whether closed-dashboard aggregation is allowed;
- redistribution/publication restrictions;
- data-deletion requirements;
- status: Verified, Needs Review, or Not Available.

Prohibited:

- scraping;
- bypassing protection;
- asking the user for credentials in code or issues;
- buying subscriptions;
- contacting providers;
- claiming an integration is connected before it is verified.

Use a manual/sanitized CSV adapter for the first technical prototype.

## 11. SEO publication boundary

Operational history generates research candidates, not automatic pages.

A public route/location record requires:

- approved source evidence;
- privacy-safe geographic resolution;
- verified Hermes service fit;
- actual demand evidence;
- weak-competition evidence;
- unique local or lane value;
- non-duplicative query-to-page mapping;
- internal links and a useful CTA;
- reviewer and review date;
- score of at least 7/10;
- explicit `published` status.

Do not create hundreds of city pages, private-data pages, or pages claiming live capacity.

## 12. Search Console and measurement

The historical notes contain changing Search Console statements. Retrieve the current property state before making claims.

Continue with:

- sitemap status;
- discovered versus indexed URLs;
- URL Inspection for priority pages;
- query/page exports;
- CTR opportunities;
- cannibalization review;
- privacy-safe GA4 events without names, email, phone, addresses, free text, MC/DOT, or shipment identifiers.

## 13. Codex immediate execution sequence

1. Read project AI role and handoff files.
2. Inspect current `main` and open PRs #7, #9, and #19.
3. Produce a reconciliation matrix.
4. Verify or port the `#journey` fix.
5. Run full tests and document exact results.
6. Synchronize PR #19 or prepare a clean replacement branch when safer.
7. Implement the synthetic Shipment History import-preview model and tests.
8. Implement quarantine and lifecycle-state tests.
9. Implement the private synthetic read-only interface.
10. Research official load-board integration paths.
11. Revalidate the three existing SEO resources.
12. Continue the 200-task queue, skipping only documented blockers.

## 14. Owner approval gates

Separate owner approval remains required for:

- merge to `main`;
- production deployment;
- DNS or Cloudflare account changes;
- billing or paid services;
- API keys, credentials, or secrets;
- connecting the real Google Sheet, CRM, TMS, or load boards;
- publishing Academy pricing;
- publishing unverified locations, routes, language markets, salaries, or hiring claims;
- destructive file/data changes.
