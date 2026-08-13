// Browser-safe copy of the availability slot catalog. Must stay in sync with
// schema.sql's seed data — this file exists only because static assets
// outside prototype/ aren't servable by `wrangler pages dev prototype`
// (pages_build_output_dir), so the shared src/ module can't be imported
// directly from client-side code.
//
// Services are no longer listed here — each specialist's own service catalog
// (shared + custom) is fetched live from GET /api/services.

export const availabilityCatalog = [
  "Tue · 10:30 AM",
  "Tue · 2:00 PM",
  "Wed · 9:00 AM",
  "Wed · 1:30 PM",
  "Thu · 11:00 AM",
];
