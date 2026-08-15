# Repair Booking Growth Bridge — Acceptance Gate

The change is ready for merge only when all of the following are true:

- Existing Repair Shop booking creation remains unchanged and green.
- Growth CTA is visible only in the confirmed-booking success state.
- Growth form stays closed until the customer explicitly opens it.
- Separate consent is required before booking name/email can be reused for the growth inquiry.
- The inquiry uses the existing private `/api/logistics-lead` receiver and `ProgressoPro` routing.
- Idempotency key equals the generated request ID.
- A successful private delivery emits `connect_hermes_growth_cta_requests`.
- Analytics event contains no booking name, email, phone, free-text note, or other PII.
- A failed growth-lead delivery does not change or invalidate the already-confirmed repair appointment.
- No payment, pricing, subscription, or forced advertising is introduced during free beta.
