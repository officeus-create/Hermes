# Issue #510: [HC-REPAIR-BETA] Repair Shop / Truck Repair Partner Pilot

**Owner:** `Hermes Connect - Автономная Разработка`  
**Reviewer:** `Синхронизация Базы Знаний Агентов`  
**Status:** `IN_PROGRESS`  

---

## 1. Goal & Product Vision
Establish a high-converting, compliant B2B relationship-building intake, booking, retention, and repeat-revenue architecture for Truck Repair Shops, parts suppliers, and mobile roadside services in the U.S. 

Instead of just offering a basic calendar, Hermes Connect integrates the entire loop to drive maximum repeat business and technician utilization:
```
Shop Profile ➔ Shareable Link/QR ➔ Customer Selects Service ➔ Availability/Technician ➔ Booking ➔ Reminder ➔ Service ➔ Vehicle/Service History ➔ Follow-up ➔ Repeat Booking ➔ Additional Service ➔ Long-term Relationship
```

---

## 2. Expanded Repair Beta Roadmap

### A. MVP / FIRST REAL USERS (CURRENT PRIORITY)
These features represent the absolute priority for the initial Repair Beta release to gather immediate feedback:
* **Repair Shop Public/Business Profile:** A sleek, dark-themed obsidian dashboard representing the provider's specialties.
* **Services Catalog:** Core maintenance offerings (oil change, diagnostics, brakes, tires, transmission, engine, truck repair, trailer repair, roadside, custom services).
* **Supported Vehicle/Equipment Types:** Specific configurations for cars, commercial trucks, trailers, reefers, flatbeds, etc.
* **Shareable Shop Link and QR Code:** A unique public URL and downloadable QR image that shops can share on Google Business Profiles, SMS, WhatsApp, or business cards.
* **Customer Service-Request / Booking Flow:** Seamless step-by-step guest booking request (Select service ➔ Choose date/time slot ➔ Select vehicle ➔ Confirm).
* **Shop Availability:** Simple operational hours and active technician capacity rules.
* **Technician Concept & Availability Model:** Allocation of jobs to active technicians based on availability slots.
* **Vehicle Profile Basics:** Make, model, year, and mileage (optional VIN field for private records only).
* **Basic Appointment/Customer CRM Statuses:** Simple workflow tracker (`NEW` ➔ `CONTACTED/BOOKED` ➔ `CONFIRMED` ➔ `IN SERVICE` ➔ `COMPLETED` ➔ `FOLLOW-UP` ➔ `REPEAT` | `CANCELLED/NO-SHOW`).
* **Calendar-Add Foundation:** Standard high-compatibility `.ics` (Add to Calendar) generation on booking confirmation.
* **Reminder Foundation:** Email/SMS reminder rules for bookings.
* **Corporate/Fleet Profile:** Custom layouts for fleet/commercial accounts (managing multiple vehicles, trailers, mobile/roadside 24/7 service).
* **Mobile/Roadside/24-7 Attributes:** Toggle parameters for emergency dispatching.
* **Partner Candidate / Corporate Offer Flow:** Standard corporate registration and discount quote saver.
* **Beta Feedback Module:** Interactive in-app feedback collection.
* **"Grow My Business / Talk to Hermes" Opt-in CTA:** Non-intrusive card offering custom web, SEO, and marketing services.

*Privacy Rule:* Customer PII and free-text feedback must remain private and must NOT be transmitted to GA4.

### B. NEXT ITERATION (NOT BLOCKING FIRST-USER RELEASE)
* Individual technician schedules and shift calendars.
* Estimated service duration profiles.
* Comprehensive vehicle and service history logs.
* Advanced automated repeat-service reminders based on past shop rules.
* Customer segmentation (e.g., active vs. inactive, fleet vs. owner-operator).
* Waitlist management & cancelled-slot recovery notifications.
* Unified Inbox: Consolidating bookings, inquiries, and custom quote requests in one panel.
* Granular customer notification preferences.
* Targeted new-service announcements to relevant opted-in segments.
* Fleet multi-vehicle bulk management portals.

### C. FUTURE / DEFERRED (MONETIZATION DEFERRED)
* Booking deposits and preauthorizations.
* Automated no-show fees.
* Payment gateway integrations (No payment/card UI during early-access).
* Advanced AI predictive maintenance recommendations.
* Parts marketplace & vehicle sales portals.
* Public discovery/matching marketplace routing.
* Automated load-board dispatch routing to nearest registered provider.

---

## 3. Customer-to-Hermes Growth Loop
A high-yield, non-intrusive viral conversion mechanism is integrated into the workspace context:
* **The Context:** A customer (vehicle owner) uses Hermes Connect to book a service at an onboarding СТО, but they themselves own a business (e.g., freight brokerage, manufacturing company, or private fleet).
* **The Interaction:** Inside the customer-facing booking dashboard, a discrete, premium option is visible:
  * *CTA:* `For Business Owners / Grow Your Business`
  * *Services Offered:* Custom Websites, SEO / Google Visibility, Social Media Management, Targeted Advertising, and CRM / Workflow Automation.
  * *Mechanism:* Clicking `Talk to Hermes` triggers a consent confirmation and forwards a warm lead to our internal sales team. 
* *Rule:* Never use forced overlays or unsolicited unsolicited advertising; entry is entirely opt-in.

---

## 4. Sales Attribution
* Originating-salesperson codes must be tracked and preserved in private partner profiles to credit active outreach personnel.
* *Rule:* Salesperson identities, codes, and private commission rates must never be sent to GA4 or exposed to public browser scripts.

---

## 5. Sales Bridge V1 Contract
* **Workbook Rule:** The existing Codex Excel workbook (`US_Repair_Shops_Sales_Intake_Vadym_Acheme.xlsx`) remains the sole authority for prospecting records. Do not alter its structure, and do not attempt automatic two-way write-back or forced schema merges.
* **Sync Rule:** Once every 24 hours, a read-only snapshot is loaded from the workbook into a staging/mirror layer in the Hermes Connect database to populate preview entries.
* **DNC Integrity:** Prospects marked as `Do Not Contact` / `DNC` or paused on `Duplicate Hold` must be absolutely filtered out during import and never contacted.

---

## 6. Product Key Performance Indicators (KPIs)
To track loop efficiency, the following custom events are integrated securely (ensuring zero PII is sent to public telemetry):
* `connect_shop_link_opens`
* `connect_booking_start`
* `connect_booking_completion`
* `connect_booking_confirmation`
* `connect_cancellation_no_show`
* `connect_completed_service`
* `connect_repeat_booking`
* `connect_reminder_conversion`
* `connect_customer_retention`
* `connect_fleet_inquiries`
* `connect_hermes_growth_cta_requests`
* `connect_shop_growth_cta_requests`

---

## 7. Operating Rules

### A. Release Priority
We operate under a strict release rule:
`SHIP ➔ USERS ➔ FEEDBACK ➔ FIX WEEKLY`
Getting the first 5 to 10 real repair shops utilizing the profile and shareable booking link is exponentially more valuable than attempting to complete the entire master architecture upfront. 

### B. Distribution Clarification (Phase 1)
* **Web:** Production site at `hermeslogisticsus.com`.
* **iPhone PWA:** Safari Guided PWA installation (Simulated device mockup). Native Xcode `ios/` folder is NOT a Phase 1 requirement.
* **Android APK:** Direct, signed `.apk` bundle download on the website via Capacitor wrapper.
* *Note:* App Store and Google Play submissions belong to Phase 2 (Deferred for developer-account funding).

### C. Issue #509 Integration
* PR #509 is currently in a conflict state. The implementation owner must resolve conflicts in an isolated, clean worktree before PR #509 can be merged.
* **Autonomy Rule:** Development of the Repair booking system, direct APK building, and PWA simulation **must NOT be held up** by PR #509. Active design, preparation, and component mockups can proceed safely in a parallel, isolated worktree.

---

## 8. Links & References
* **Canonical Specification:** [ISSUE_HC_REPAIR_BETA_TRUCK_REPAIR_PARTNER.md](file:///Users/progressopro/Projects/hermes-connect-next/docs/ISSUE_HC_REPAIR_BETA_TRUCK_REPAIR_PARTNER.md)
* **Project State Tracker:** [ai-project-state.json](file:///Users/progressopro/Projects/hermes-connect-next/docs/ai-project-state.json)
* **Mobile Release Tracker:** [ISSUE_511_MOBILE_RELEASE.md](file:///Users/progressopro/Projects/hermes-connect-next/docs/ISSUE_511_MOBILE_RELEASE.md)
