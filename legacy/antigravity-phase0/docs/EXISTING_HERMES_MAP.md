# Existing Hermes Ecosystem Map — Ingestion & Audit (2026-08-12)

**Source Repository**: `officeus-create/Hermes` (Branch: `main`)  
**Status**: Read-Only Reference  
**New Repository**: `hermes-connect-next` (Standalone Sibling Repository)

---

## 1. Executive Summary & Context

This document maps the state, domain boundaries, APIs, AI frameworks, and maturity levels of the existing Hermes ecosystem to ensure `hermes-connect-next` maintains complete compatibility while building a modular operating platform for service businesses.

### Key Domain & Host Boundaries
- `connect.hermeslogisticsus.com`: Approved Hermes Connect web product surface (routed by Cloudflare `functions/_middleware.js` to `public/demos/hermes-connect/`).
- `app.hermeslogisticsus.com`: Older, separate legacy booking/profile prototype on Cloudflare Pages (`hermes-connect-prototype`). Must NOT be modified or built upon.
- `hermeslogisticsus.com/services/hermes-connect/`: Main site indexed product overview linking to the Connect application.

---

## 2. Key Hermes Connect Files & Architecture

### Funnel & Handoff Documents
- `docs/HERMES_CONNECT_CODEX_HANDOFF.md`: Operating rules for Connect. Strictly desktop/tablet/mobile web browser release. Outlines 6 launch categories: Beauty & wellness, Fitness & coaching, Professional services, Logistics & field services, Education & events, Home & local services.
- `docs/HERMES_CONNECT_API_INVENTORY_2026-08-11.md`: Inventory of existing server endpoints and safety rules for AI discovery.
- `docs/HERMES_CONNECT_AGENT_READINESS_2026-08-11.md`: Baseline Cloudflare Agent Readiness report (4/5 Quick Wins, 0/3 Technical Groundwork, 0/8 Advanced Integration). Explicit rule: NO FAKE PLACEHOLDERS or score-chasing.
- `docs/HERMES_CONNECT_SALES_TEST_PACKAGE.md` & `docs/AI_HANDOFF.md`: Sales test harnesses and AI prompt guidelines.

### Implementation Surfaces in Reference Repo
- `public/demos/hermes-connect/index.html` & `app.mjs`: SPA demo surface for Connect controlled access request.
- `functions/api/connect-lead.ts`: Cloudflare worker adapter forwarding requests from `connect.hermeslogisticsus.com` to protected lead receiver with strict CORS and no-store rules.
- `src/pages/services/hermes-connect/index.astro`: Main Astro marketing overview page.
- `src/data/ai-sales-assistant.ts`: Core AI conversation sales framework, operating loop, claim maturity rules, and prohibited claim matrix.

---

## 3. Existing API & Security Inventory

| Route | Role | Boundary | Classification |
|---|---|---|---|
| `/api/connect-lead` | Connect access-request adapter | `https://connect.hermeslogisticsus.com` Origin required, POST only | Private Product Form Adapter |
| `/api/business-lead` | Marketing lead collection | Origin restricted, rate-limited | Form Delivery Endpoint |
| `/api/logistics-lead` | Logistics lead receiver | Origin restricted, rate-limited | Form Delivery Endpoint |
| `/api/carrier-contract` | Carrier legal signatures | Strict legal/signature controls | Sensitive Transaction Endpoint |
| `/api/route-estimate` | US distance & duration computation | Google Maps API + KV rate limit (10/hr/IP) | Candidate Machine Capability |

---

## 4. AI Sales & Conversation Framework

Hermes uses a structured conversation philosophy defined in `src/data/ai-sales-assistant.ts`:

### Operating Loop
1. `diagnose`: Understand user situation & bottlenecks.
2. `clarify_metrics`: Define concrete success criteria.
3. `smallest_useful_step`: Recommend minimum valuable action.
4. `roadmap`: Show progression path.
5. `cta`: Present clear next step.

### Conversation Sequence
`hook` → `situation` → `problem` → `consequence` → `possibility` → `value` → `application` → `cta`

### Consequential Action Rule
The following actions ALWAYS require human review:
- Booking freight / committing carriers
- Signing contracts / accepting payments
- Hiring or rejecting candidates
- Modifying client programs / workout plans silently
- Publishing external communications

---

## 5. System Maturity Matrix

Hermes Connect strictly enforces 4 maturity tiers:
1. `LIVE_VERIFIED`: Main web app access request form, Cloudflare middleware, Markdown content negotiation.
2. `PREVIEW`: Controlled web access application flow.
3. `CONCEPT`: Multi-agent AI router, science research layer, client/trainer CRM portal.
4. `EVIDENCE_REQUIRED`: Performance/conversion claims, automated booking guarantees, native mobile app stores.

---

## 6. Scope Boundaries for Hermes Connect Next

### Out of Scope (EXCLUDED)
- Freight Load Board / Car-hauling load marketplace
- DAT integration / Load matching
- Refactoring existing load board

### Mandatory Scope (INCLUDED)
- **Modular Core Platform**: Workspace, User, Team, Client, Service, Appointment, Task, Program, Activity, Metric, Document, Consent, Audit Log.
- **First Vertical**: Hermes Connect for Trainers & Coaches (Personal trainer, Online fitness coach, Gym/Studio owner, Client/Student experience).
- **Dual Core UX Questions**:
  - Trainer: *"Who needs my attention today?"*
  - Client: *"What do I do today?"*
- **AI Architecture**: Multi-agent router (Business Copilot, Trainer Copilot, Client Assistant, Science Research Agent, Safety Boundary).
