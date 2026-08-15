# Hermes Connect — Product Implementation Roadmap V1

Status: `OWNER-APPROVED DIRECTION / ACTIVE IMPLEMENTATION`
Date: 2026-08-13

## Product north star

Hermes Connect is an **AI Operating System for Business**. The product should feel like one calm business command center in which a single **Hermes Intelligence** understands context across customer communication, CRM, scheduling, sales, marketing, finance, operations, integrations, training and industry-specific workflows.

The approved visual system remains **Pearl + Obsidian**, with the compact interconnected-loop / intelligent-knot mark and the Hermes flow-wave motif.

## Approved delivery sequence

1. **Desktop Web Product** — build and visually validate the complete operating-system experience.
2. **Mobile Web** — adapt the approved information architecture and interaction model to phone-browser use.
3. **Native Mobile Apps** — after Web and Mobile Web are stable, implement iOS and Android against the same backend contracts and design tokens.

Native-app work must not force the Web product to fork into a different product model.

## Source-of-truth boundary during transition

The current controlled-access production funnel remains in `public/demos/hermes-connect/` until a reviewed migration is approved.

The new product-design and interaction incubator lives in:

- `public/demos/hermes-connect/review.html`
- `public/demos/hermes-connect/workspace.html`
- `public/demos/hermes-connect/workspace.css`
- `public/demos/hermes-connect/workspace.js`

Do not overwrite the current production funnel with the incubator in one step. Migrate product surfaces module-by-module with tests and privacy boundaries.

## Product modules

### 1. Owner Command Center

Purpose: show what changed, what Hermes completed, what needs human attention, and what actions are most likely to create value.

Core contracts:
- business KPI summary;
- AI action summary;
- human approval queue;
- opportunity/recovery summary;
- activity evidence feed.

### 2. Unified Inbox

Purpose: one conversation layer across approved communication channels.

Core contracts:
- conversation list;
- contact and CRM context;
- AI-drafted replies;
- response state;
- escalation to human;
- channel provenance;
- no silent autonomous external send without the approved action policy.

### 3. Customers / CRM

Purpose: relationship memory rather than isolated contact records.

Core contracts:
- customer profile;
- lifecycle stage;
- activity timeline;
- value / LTV signals;
- owner/team notes;
- next-best action;
- duplicate resolution;
- retention and churn signals.

### 4. Calendar / Booking

Purpose: availability, booking requests and schedule optimization.

Core contracts:
- business calendar;
- team/resource availability;
- booking/request state;
- schedule gaps;
- rebooking suggestions;
- reminder state;
- approval rules for changes.

### 5. Sales

Purpose: convert qualified demand into measurable opportunity and revenue.

Core contracts:
- lead/opportunity pipeline;
- stage history;
- AI confidence / qualification evidence;
- next action;
- proposal/quote state;
- follow-up;
- won/lost reason;
- attribution and revenue evidence.

### 6. Marketing / Content Engine

Purpose: turn business knowledge and successful messages into repeatable acquisition and retention campaigns.

Core contracts:
- campaign registry;
- content assets;
- channel plans;
- approved audience definitions;
- performance evidence;
- winning-hook reuse;
- reactivation campaigns;
- human approval before external launch when required.

### 7. Finance

Purpose: operational financial visibility, not unverified accounting claims.

Core contracts:
- revenue events;
- invoices / receivables;
- expense categories;
- cash-flow view;
- margin signals;
- forecast with provenance;
- anomaly and overdue alerts;
- approval-gated refunds/discounts.

### 8. Operations / Agent Work

Purpose: show the work Hermes is performing and preserve human control.

Core contracts:
- task queue;
- status and owner;
- source context;
- tool/action evidence;
- retry/failure state;
- human approval gates;
- audit history;
- background-work summary.

The customer-facing model remains **one Hermes Intelligence** even when internal specialist agents or services execute subtasks.

### 9. Integrations

Purpose: make external systems available through governed connections rather than one-off code paths.

Initial priority set:
- Gmail;
- Google Calendar;
- GitHub;
- Slack;
- Notion;
- Linear;
- approved messaging / telephony;
- payments;
- analytics;
- logistics data sources.

Each integration must expose explicit states such as `available`, `connection_required`, `connected`, `permission_required`, `degraded`, and `disabled`.

### 10. Hermes Academy / AI Sales Coach

Purpose: train employees and partners with AI roleplay before real customer interactions.

Core contracts:
- scenario library;
- persona and objective;
- live transcript / voice session;
- trust / progress / pressure state;
- objection handling;
- compliance checks;
- post-session scoring;
- coaching recommendations;
- readiness state.

The AWS sample AI sales-roleplay project may inform this module under its compatible license, but Hermes owns the product UX, domain logic, data contracts and implementation decisions.

## Industry adaptation

One product architecture serves multiple industries. Industry choice changes terminology, KPIs, workflows and recommended automations without creating disconnected products.

Initial demo contexts:
- Beauty & wellness;
- Logistics;
- Fitness & coaching;
- Marketing / agency;
- Real estate.

The public category catalog may remain broader and can be reconciled during migration.

## Web implementation waves

### Wave A — Clickable Product Shell
Status: `IN PROGRESS`

- full navigation;
- all core module screens;
- global Hermes Intelligence;
- industry switching;
- responsive navigation;
- visual approval.

### Wave B — Shared Product Data Model

Define stable typed contracts for:
- workspace;
- user/team;
- contact/customer;
- conversation;
- appointment/request;
- lead/opportunity;
- campaign/content;
- invoice/payment event;
- operation/task;
- approval;
- integration;
- AI evidence/audit event.

Use synthetic fixtures first, then adapters. UI components must not depend directly on provider-specific payloads.

### Wave C — Identity, Workspace and Permissions

- authentication;
- workspace membership;
- role-based permissions;
- owner/admin/member boundaries;
- integration connection permissions;
- audit trail.

### Wave D — Working Core Workflow

First production workflow should connect at least:

`Lead / message → customer context → Hermes qualification → human/AI next action → booking or sales opportunity → measurable outcome`

This should become the template for later vertical workflows.

### Wave E — Integrations and Execution

Add external connectors behind explicit scopes, approvals and failure states. Never treat provider connectivity as proof an action succeeded; store action evidence and provider response state.

### Wave F — Intelligence and Automation

- next-best action;
- summaries;
- recovery opportunities;
- scheduling optimization;
- campaign suggestions;
- finance/operations alerts;
- background task orchestration;
- explainable evidence.

### Wave G — Mobile Web Hardening

- one-hand navigation;
- condensed owner dashboard;
- full Inbox / CRM / Calendar critical paths;
- Hermes Intelligence as primary mobile interaction surface;
- push-ready notification model;
- offline/degraded-state design;
- accessibility and browser coverage.

### Wave H — Native iOS / Android

Only after shared contracts are stable:
- native shell;
- secure authentication and device binding;
- push notifications;
- biometric unlock where appropriate;
- voice / microphone workflows;
- camera / QR where justified;
- native share sheet and deep links;
- mobile approval flows;
- same Hermes Intelligence and backend contracts as Web.

## Technical architecture principles

1. **Provider adapters, not provider-shaped UI.**
2. **One Hermes Intelligence, many internal capabilities.**
3. **Human approval for consequential actions until a policy explicitly permits automation.**
4. **Evidence before success claims.**
5. **Privacy by default and minimal data collection.**
6. **No PII in analytics dimensions or URLs.**
7. **Every external action has a state, provenance and error path.**
8. **Synthetic demo data is clearly separated from production records.**
9. **Web and mobile share domain contracts and design tokens.**
10. **Third-party code is adopted only after license, maintenance, security and architecture review.**

## Immediate implementation queue

1. Finish Web Product V1 preview and visual QA.
2. Add automated smoke coverage for the new `review.html` and `workspace.html` routes.
3. Reconcile the approved workspace UX with the existing controlled-access Connect funnel.
4. Extract shared design tokens and domain fixtures from the prototype.
5. Define the typed shared data contracts for Wave B.
6. Select the first real end-to-end working workflow for production implementation.
7. Add mobile-web test coverage against the same workspace.
8. Begin native architecture only after Web contracts and mobile-web UX stabilize.

## Release rule

The new workspace remains `noindex,nofollow` and synthetic until its real data/action boundaries are reviewed. A successful visual prototype is not proof that a connector, booking, payment, message, finance or AI action is live.
