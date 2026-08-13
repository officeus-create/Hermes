# Hermes Connect — first working prototype

This project now contains a real-account product flow:

`Sign up / sign in → Specialist profile → Services → Availability → Test booking`

v0.3 adds real authentication and persistence, running on Cloudflare Pages
Functions + D1 (local dev database, not yet deployed to a live Cloudflare
account):

- email + password accounts (PBKDF2-hashed, httpOnly session cookie);
- profile, services, and availability persisted in D1, not just in-memory;
- test bookings are validated against the specialist's own saved services
  and availability, then written to D1;
- multiple specialists can register — the interface is no longer a single
  hardcoded demo profile.

## Current boundary

Still true even with real accounts and a real database:

- no real calendar event;
- no payment;
- no email, SMS, or Telegram message;
- no external API integration;
- no live/deployed Cloudflare account — D1 only runs locally via `wrangler`.

Bookings remain explicitly marked `mode: "simulation"` /
`test_booking_created` end to end.

## Running it

```
npm install
npx wrangler d1 execute DB --local --file=schema.sql   # first time only
npx wrangler pages dev
```

Then open the printed `http://localhost:8788` URL. `npm test` runs the
static/unit test suite (auth hashing, session logic, and the original
booking/profile validation rules) without needing the dev server running.

## Architecture

- `schema.sql` — D1 schema (specialists, services, availability, sessions,
  bookings), seeded with the same service/availability catalog the UI shows.
- `src/auth.mjs` — password hashing (PBKDF2 via Web Crypto), session tokens,
  cookie helpers. Runs identically in Node (for tests) and the Workers
  runtime (for the deployed functions).
- `functions/api/auth/{register,login,logout,me}.ts` — Cloudflare Pages
  Functions handling account creation, sign-in, sign-out, and session check.
- `functions/api/profile.ts` — get/update the signed-in specialist's profile,
  services, and availability.
- `functions/api/booking.ts` — create/list test bookings, validated against
  the specialist's own saved services and availability.
- `prototype/` — the static frontend (`index.html`, `styles.css`,
  `app.mjs`). `prototype/catalog.mjs` is a browser-safe copy of the service/
  availability catalog — it has to duplicate `src/profile-workspace.mjs`
  because `wrangler pages dev prototype` only serves files inside
  `prototype/`, not the project root.
- `src/profile-workspace.mjs` / `src/booking-prototype.mjs` — the original
  v0.2 pure in-memory validation logic. No longer wired into the UI, kept
  (and still tested) as the reference validation rules the server-side
  functions follow.

The next development decision is whether to deploy this to a real Cloudflare
account (D1 database + Pages project) or keep iterating locally first. Real
calendars, payments, and notifications remain separate, explicit decisions.
