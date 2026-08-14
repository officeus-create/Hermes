# [HC-REPAIR-BETA] Repair Shop / Truck Repair Partner Pilot

**Status:** `PRE-IMPLEMENTATION KNOWLEDGE SYNC`  
**Date:** 2026-08-14  
**Primary Implementation Owner:** `Hermes Connect - Автономная Разработка`  
**Technical Reviewer / Sync Owner:** `Синхронизация Базы Знаний Агентов`  
**Final Reviewer & Approver:** Vladimir (CEO)  

---

## 1. Context & Business Model

Hermes Logistics outreach is the initial relationship hook. Sales reps contact U.S. repair shops, truck repair shops, parts suppliers, and adjacent businesses while Hermes builds a comprehensive database of high-quality service partners.

Initial engagement is conducted using a multi-outcome relationship pipeline. The objective is not to monetize every single call immediately, but rather to establish a durable connection.

```mermaid
graph TD
    A["Outbound Outreach (Logistics Hook)"] --> B{"Technical Knowledge Sufficient?"}
    B -- No --> C["Technical Fallback (Ask for Service List / Website Discovery)"]
    B -- Yes --> D["Direct Qualification"]
    C --> E["Secondary Diagnostic Opportunity"]
    D --> E
    E --> F{"Identify Relationship Opportunities"}
    F --> G["Repair Partner"]
    F --> H["Hermes Connect SaaS"]
    F --> I["Website / SEO Services"]
    F --> J["Social Media / CRM Automation"]
    F --> K["Long-Term Follow-Up / Referral"]
```

### Initial Diagnostic Questions:
1. *Do you work with the specific truck/equipment types Hermes Logistics utilizes (e.g., Car Haulers, Hotshots, Box Trucks, Reefers)?*
2. *Do you provide corporate or fleet discounts?*
3. *Do you provide special rates or programs for companies sending drivers directly?*
4. *What repairs and services do you provide (e.g., mobile/roadside, heavy engine, trailer maintenance)?*

---

## 2. Sales Playbook (Natural & Conversational)

Reps must avoid sounding like robotic call centers. Tone must be warm, peer-to-peer, and consultative.

### Sales Flow Structure:
```
Entry Point / Hook ➔ Situation ➔ Guided Questions ➔ Problem ➔ Consequence ➔ Value ➔ Offer ➔ CTA ➔ Follow-Up
```

### Script Elements:

* **Opening / The Hook:**
  > *"Hi, I'm calling from the corporate partner-development side of Hermes Logistics. We're a nationwide freight transport network, and we are currently selecting trusted local truck and equipment repair facilities to add to our private directory for our fleet and owner-operator network in [State]."*

* **Situation / Guided Questions:**
  > *"We want to make sure that if our trucks or owner-operators are in your area, we route them to high-quality facilities. Do you guys specialize in heavy duty transport, commercial haulers, or light/medium hotshots? Do you have fleet programs or corporate dispatch rates?"*

* **Technical Fallback (When technical knowledge is insufficient):**
  > *[If the prospect asks deep diesel technical questions the rep cannot answer]*  
  > *"To be completely honest with you, I'm on the corporate partner-development side rather than the shop floor, so I'm still learning the finer technical specifications of complex diesel rigs. I'd love to review your full service list and equipment capacities. Is that something I can find on your website or social media profile?"*

* **Website / SEO / Social Media Discovery (The secondary diagnostic opportunity):**
  > *[If the website is slow, missing mobile optimization, or lacks active social presence]*  
  > *"I was looking over your website, and I noticed it takes a few seconds to load on mobile, and the booking form is a bit tricky to fill out on a phone. When drivers are broken down on the road, they need to find you instantly on their screens. We actually help our approved repair partners optimize their search presence so drivers in distress see them first. Is your search visibility something you’ve actively looked at recently?"*

* **Hermes Connect Early Access Offer:**
  > *"For a select group of repair partners, we are providing early access to Hermes Connect — our new central operational inbox. It allows you to manage incoming driver inquiries, coordinate repair estimates, send direct proposals, and track customer communication in one place. While it is in Beta, we are offering early registration and system access for free to our key partner candidates so you can test it out and help us shape the platform."*

* **Partner-Offer CTA:**
  > *"I’d like to register your shop as a Partner Candidate in our database and submit your details to our review board. While they look over the application, I can send you a secure login to the Hermes Connect early-access workspace so you can set up your shop profile. Does that sound like a fair starting point?"*

* **Objections & Solutions:**
  * *Objection: "We don't need more customers, our bays are full."*  
    * *Response:* *"That’s the best problem to have! In that case, we're not just looking to send random volume; we're looking to establish a pre-approved commercial fleet relationship so that when we do have a breakdown nearby, we are already in your system as an approved corporate account."*
  * *Objection: "Is this going to cost me a commission or a monthly fee?"*  
    * *Response:* *"Right now, Hermes Connect is in early-access Beta, and there's no fee to register as a partner candidate. We want your honest feedback as we refine the platform. Any future commercial terms or partner economics will be finalized once the pilot phase is complete."*

* **Follow-Up & Monthly Feedback Loop:**
  * Schedule a brief monthly 10-minute check-in call to review platform ease-of-use, lead flow quality, and feature suggestions.

---

## 3. Hermes Connect Early Access Offer Policy

* **Adoption and Testing Focus:** The early-access program is strictly designed to build adoption, collect feedback, test live-market workflows, and build long-term relationships.
* **No Permanent Free Guarantees:** Do **not** promise permanent free access. State clearly that the platform is free during the Beta/pilot phase.
* **No Invented Pricing:** Do not make up future subscription pricing.
* **No Invented Commissions:** Do not commit to specific future transaction referral or commission fees. CEO intent is to preserve relationship attribution now and calculate compensation economics later.

---

## 4. Partner Truth & Legal Boundary

* **Registration ≠ Approved Partner:** Submitting an offer or registering on the platform does **not** constitute becoming an approved Hermes Logistics partner.
* **No Volume Guarantees:** Hermes Logistics does not guarantee:
  - Truck or driver volume
  - Customer or lead volume
  - Weekly/monthly revenue
  - Job or repair referrals
  - Exclusive geographical territory
  - Future sales commissions
* **Explicit Status Workflow:**
  1. `Partner Candidate` (Default upon registration)
  2. `Offer Submitted` (Candidate submits corporate/fleet discount program details)
  3. `Under Review` (Internal team reviews capacity, alignment, and equipment compatibility)
  4. `Approved Partner` (Requires explicit human review and system approval)

---

## 5. Data Model & Knowledge Schema

All stored partner details must be highly structured. Private commercial agreements, corporate rates, and discount metrics are **confidential** and must never be exposed to public analytics.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "HermesConnectPartnerCandidate",
  "type": "object",
  "properties": {
    "partner_id": { "type": "string", "format": "uuid" },
    "business_name": { "type": "string" },
    "repair_subtype": { "type": "string", "enum": ["truck_repair", "trailer_service", "parts_supplier", "mobile_roadside", "auto_body", "general_auto"] },
    "state_code": { "type": "string", "minLength": 2, "maxLength": 2 },
    "services_offered": { "type": "array", "items": { "type": "string" } },
    "equipment_specialties": { "type": "array", "items": { "type": "string", "enum": ["car_hauler", "hotshot", "box_truck", "reefer", "dry_van", "heavy_equipment"] } },
    "corporate_program_status": { "type": "boolean" },
    "discount_available_pct": { "type": "number", "minimum": 0, "maximum": 100 },
    "has_mobile_roadside": { "type": "boolean" },
    "has_24_7_emergency": { "type": "boolean" },
    "website_url": { "type": "string", "format": "uri" },
    "social_profile_url": { "type": "string", "format": "uri" },
    "relationship_status": { "type": "string", "enum": ["Candidate", "Offer Submitted", "Under Review", "Approved"] },
    "opportunity_types": { "type": "array", "items": { "type": "string", "enum": ["Repair Partner", "SaaS Subscriber", "Website Development", "SEO Optimization", "Social Management", "CRM Automation"] } },
    "follow_up_status": { "type": "string", "enum": ["PENDING_CONTACT", "CONTACTED", "FOLLOW_UP_SCHEDULED", "ONBOARDED", "CLOSED_LOST"] },
    "lead_source": { "type": "string" },
    "sales_rep_code": { "type": "string", "pattern": "^[A-Z]{2,4}-[0-9]{3}$" }
  },
  "required": ["business_name", "repair_subtype", "state_code", "relationship_status", "sales_rep_code"]
}
```

---

## 6. U.S. Territory Ownership System

The sales team divides the U.S. map and works state-by-state to eliminate overlap. Reps work systematically in a structured geographical traversal order instead of random outbound selection.

### State Territory Record Schema:
```json
{
  "state_code": "IL",
  "territory_owner_rep_code": "REP-204",
  "status": "ACTIVE_PROSPECTING",
  "prospecting_started": "2026-08-14T00:00:00Z",
  "last_activity": "2026-08-14T10:15:00Z",
  "next_review": "2026-09-14T00:00:00Z",
  "prospect_count": 42
}
```

### Logical Geographical Traversal Order (State-by-State):
Reps should expand outward from the core operational hubs to maintain high logistics routing efficiency:

1. **Midwest Core (Hub):** Wisconsin (`WI`) ➔ Illinois (`IL`) ➔ Michigan (`MI`) ➔ Indiana (`IN`) ➔ Ohio (`OH`)
2. **Central Corridors:** Minnesota (`MN`) ➔ Iowa (`IA`) ➔ Missouri (`MO`) ➔ Kentucky (`KY`)
3. **South-Central & Gulf:** Texas (`TX`) ➔ Louisiana (`LA`) ➔ Oklahoma (`OK`)
4. **Southeast Transit:** Georgia (`GA`) ➔ Florida (`FL`) ➔ Tennessee (`TN`) ➔ North Carolina (`NC`)
5. **Northeast Corridors:** Pennsylvania (`PA`) ➔ New York (`NY`) ➔ New Jersey (`NJ`)
6. **West Coast Hubs:** California (`CA`) ➔ Washington (`WA`) ➔ Oregon (`OR`)

---

## 7. Sales Attribution & Confidentiality

* **Attribution fields:** Must be maintained through a secure, private `sales_rep_code` (e.g. `REP-101`) to trace relationships cleanly back to the originating salesperson.
* **Rep Identities:** Do **not** pass real salesperson names, salaries, or target commissions to public sitemaps, front-door code, or Google Analytics 4 (GA4).
* **Policy Note:** All commission structures, percentages, and performance payouts are labeled clearly as: **COMMISSION POLICY: NOT YET FINALIZED**.

---

## 8. Cross-Direction Product Logic Matrix

Every AI agent and sales rep must use this unified framing when discussing the value proposition of Hermes Connect across the four canonical business directions:

| Direction | Focus / Target Audience | Hermes Connect Value Proposition |
| :--- | :--- | :--- |
| **Logistics** | Fleet Owners, Carriers, Owner-Operators, Repair Partners | Operational dispatch flow, interactive B2B load board, AI freight-rate negotiation, direct maintenance partner mapping. |
| **Marketing** | Small/Medium Service Businesses, Retailers, Agencies | Unified Command Center Inbox, client lead intake qualification, conversational CRM, instant ROI calculation, auto-generated proposals. |
| **Academy** | Students, Career Switchers, Dispatcher Candidates | Interactive simulation, roleplay training tools, load board scenarios, automated practice inbox evaluation. |
| **IT Development** | Enterprise Clients, Technology Partners | Central API integration platform, zero-dependency client logic, offline PWAs, custom CRM integrations, conversational AI brains. |

---

## 9. Analytics, Telemetry & Privacy

* **Strict Privacy Rules:**
  - **No second GA4/GTM installation.** All events must flow through the existing canonical dataLayer and event registry.
  - **NO PII TRANSMISSION:** Never send names, emails, phone numbers, exact physical addresses, private commercial discounts, specific partner rates, or sales rep names to public analytics.
* **Approved Partner Beta Events:**
  - `partner_onboarding_started` (Attributes: `vertical: "repair"`, `rep_code: "[MASKED_REP_CODE]"`)
  - `partner_onboarding_completed` (Attributes: `vertical: "repair"`, `subtype: "[SUBTYPE]"`, `has_discount: [boolean]`)
  - `partner_estimate_calculated` (Attributes: `service: "[SERVICE_TYPE]"`, `duration_minutes: [number]`)
  - `partner_proposal_generated` (Attributes: `saas_tier: "starter"|"pro"|"enterprise"`, `export_format: "html"|"pdf"`)

---

## 10. State Reconciliation & Warnings

* **Direction Integration Stale Statement:** Current repository files (specifically the default welcome statements) still contain references stating that *"Beauty & Wellness is the first active-development category."* This is now **stale**.
* **New Priority Alignment:** Repair Shops / Truck Repair Partner Beta is the **first focused outbound outbound pilot**.
* **Coexistence Rule:** Do **not** delete Beauty, Auto Repair, or other active verticals. They must coexist side-by-side, but all outbound outreach focus redirects immediately to the Repair Shop pilot.
* **Hermes Connect Exposure:** Currently, Hermes Connect is not promoted prominently from every sub-direction page. This will be addressed in a subsequent release to ensure discoverability.

---

## 11. Coordination & Quality Control Checklist

Before the synchronization agent appends an entry to the AI handoff, they must review the implementation chat's HEAD against this business brief:

- [x] **No Automation Bypass:** Verify that `workspace.js` does not use `navigator.webdriver` or user-agent checks to skip onboarding. (Resolved in `fab64e3b`).
- [x] **Identical Behavior:** Ensure human visitors and automation see identical HTML, layout classes, and scripts. (Resolved in `fab64e3b`).
- [x] **Seeded Test State:** Verify non-onboarding tests pre-seed `localStorage.hermes_business_type` rather than bypassing the overlay. (Resolved in `fab64e3b`).
- [x] **Explicit Onboarding Coverage:** Verify that `tests/hermes-connect-onboarding.spec.ts` covers first-visit, viewport scaling, mobile visibility, value persistence, and deep-linking. (Resolved in `fab64e3b`).
- [x] **Privacy Check:** Ensure no private rate discounts or sales rep names are pushed to telemetry.
- [x] **Truth Check:** Ensure sitemaps do not claim guaranteed freight volumes or exclusive territory for candidates.
- [ ] **Next Action Hand-Off:** Provide the clean green-light code to the implementation owner for the Repair Shop Pilot feature cycle.
