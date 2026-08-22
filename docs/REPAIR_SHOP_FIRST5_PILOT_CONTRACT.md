# Hermes Connect — First 5 Repair Shops Pilot Contract & Data Layer

## 1. Executive Purpose
This document establishes the canonical pilot tracking model, privacy-safe analytics event schema, monetization upgrade interest capture mechanism, and public business entity contract for Hermes Connect Repair Shops.

---

## 2. First-5 Pilot Lifecycle States
To measure progression from initial onboarding to verified willing-to-pay signal, each shop in the pilot is tracked against 14 deterministic lifecycle states:

1. `SHOP_SIGNED_UP`: Specialist account created via `/api/auth/register`.
2. `PROFILE_COMPLETED`: Shop name, address, city, state, postal code, phone, and timezone saved in D1.
3. `SERVICE_CREATED`: At least 1 active service defined with duration.
4. `AVAILABILITY_CONFIGURED`: Weekly operating hours saved in D1 availability table.
5. `BOOKING_LINK_CREATED`: Public booking URL (`/services/hermes-connect/repair-shops/booking/?shop={slug}`) generated.
6. `BOOKING_LINK_SHARED`: Owner copied or opened public booking link / QR code.
7. `FIRST_REAL_BOOKING`: Customer submitted first live booking through public booking page.
8. `FIRST_BOOKING_COMPLETED`: Owner marked first booking status as `completed`.
9. `SECOND_BOOKING`: Second booking logged for same shop or repeat customer.
10. `OWNER_RETURN_7D`: Owner logged back into workspace within 7 days.
11. `OWNER_RETURN_30D`: Owner logged back into workspace within 30 days.
12. `WILLING_TO_PAY`: Owner indicated explicit upgrade interest or feature value threshold.
13. `PAYMENT_STARTED`: Owner initiated commercial plan sign-up flow.
14. `PAYMENT_COMPLETED`: First paid subscription transaction recorded.

> **Rule**: Unmeasured/pending states default to `DATA_PENDING`. No synthetic or fabricated metric values are permitted.

---

## 3. Value Analytics Event Schema
Privacy-safe value events tracked across the funnel (zero customer PII in analytics payloads):

| Event Name | Trigger Context | Allowed Metadata (No PII) |
|---|---|---|
| `repair_owner_registered` | Account creation | `locale`, `role` |
| `repair_profile_completed` | Profile save | `shop_id`, `state`, `timezone` |
| `repair_service_created` | Service addition | `shop_id`, `duration_minutes` |
| `repair_availability_completed` | Weekly schedule save | `shop_id`, `open_days_count` |
| `repair_booking_link_opened` | Public booking page view | `shop_slug`, `locale` |
| `repair_booking_created` | Customer booking submit | `shop_slug`, `duration_minutes` |
| `repair_booking_status_completed` | Status update to completed | `shop_id`, `status` |
| `repair_customer_repeat_detected` | Repeat client booking | `shop_id` |
| `repair_owner_returned` | Authenticated login | `shop_id`, `days_since_signup` |
| `repair_upgrade_interest` | Upgrade interest submission | `shop_id`, `feature_requested` |

---

## 4. Monetization Data Model & Upgrade Interest Capture Contract
Free Pilot Core vs Paid Value Boundary:

- **Free Core**: Shop Profile, Services, Weekly Availability, Public Booking Link, QR Code, Basic Inbox & Status Updates.
- **Potential Paid Value**: Multi-staff Calendar, CRM History & Client Reminders, Advanced Follow-ups, Fleet Management, AI Repair Intelligence.

### Nullable Customer Value Schema (No Invented Price Signals)
Willingness-to-pay and pricing are provided strictly by real shop interviews, never assumed:

```json
{
  "shop_id": "shop-123",
  "willing_to_pay": "DATA_PENDING",
  "expected_monthly_value": null,
  "price_shown": null,
  "feature_willing_to_pay_for": null,
  "interview_notes": null,
  "price_test_variant": null,
  "captured_at": "2026-08-22T03:56:00Z"
}
```

---

## 5. Canonical Public Business Entity Data Contract (SEO / GEO / AI Layer)
Data flows strictly from application data to canonical entities, never from fabricated SEO text:

`APP DATA → CANONICAL ENTITY → PUBLIC PAGE → SCHEMA.ORG → SEO / GEO`

### Canonical Entity Fields & Attribution
```typescript
export interface CanonicalRepairShopEntity {
  business_name: string;
  slug: string;
  city: string;
  state: string;
  postal_code?: string;
  timezone: string;
  phone?: string;
  services: Array<{ name: string; duration_minutes: number }>;
  service_categories: string[];
  opening_hours: Array<{ day_of_week: number; is_open: boolean; start_time: string; end_time: string }>;
  supported_vehicle_types?: string[];
  languages: string[];
  public_booking_url: string;
  acquisition_source: "google_organic" | "bing_organic" | "chatgpt" | "gemini" | "other_ai" | "direct" | "qr" | "referral" | "hermes_internal";
  booking_source: "google_organic" | "bing_organic" | "chatgpt" | "gemini" | "other_ai" | "direct" | "qr" | "referral" | "hermes_internal";
  last_verified_at: string;
}
```

### Output Validation Rules
- Direct Schema.org mapping: `AutoRepair` / `LocalBusiness` JSON-LD.
- No indexing (`noindex`) for QA shops, unverified profiles, or doorway/city landing pages.
- Supports human web pages, Google/Bing search indexing, and AI answer engine ground-truth queries (ChatGPT, Gemini, Perplexity).
