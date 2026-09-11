import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const helper = read("functions/api/_lib/repair-shop-google-calendar.mjs");
const owner = read("functions/api/_lib/repair-shop-google-calendar-owner.mjs");
const start = read("functions/api/repair-shop/google-calendar/start.ts");
const callback = read("functions/api/repair-shop/google-calendar/callback.ts");
const status = read("functions/api/repair-shop/google-calendar/status.ts");
const disconnect = read("functions/api/repair-shop/google-calendar/disconnect.ts");
const booking = read("functions/api/public/repair-booking.ts");
const company = read("src/pages/services/hermes-connect/repair-shops/settings.astro");

assert.match(helper, /https:\/\/www\.googleapis\.com\/auth\/calendar\.freebusy/);
assert.doesNotMatch(helper, /include_granted_scopes/);
assert.doesNotMatch(helper, /auth\/calendar\.events/);
assert.doesNotMatch(helper, /auth\/calendar\.readonly/);
assert.match(helper, /AES-GCM/);
assert.match(helper, /hashGoogleCalendarState/);
assert.match(helper, /repair_shop_calendar_connections/);
assert.match(helper, /repair_shop_calendar_oauth_states/);
assert.match(helper, /google_degraded_local_only/);
assert.match(helper, /provider_unavailable/);
assert.match(helper, /authorization_required/);
assert.doesNotMatch(helper, /event_title|event_description|attendee|meeting_notes/i);

assert.match(owner, /getAuthenticatedSpecialist/);
assert.match(owner, /specialist\.role !== "Shop Owner"/);
assert.match(owner, /owner_specialist_id/);
assert.match(owner, /state_hash/);
assert.match(owner, /STATE_TTL_MS = 10 \* 60 \* 1000/);
assert.match(owner, /encryptGoogleCalendarTokenPayload/);
assert.match(owner, /token_ciphertext/);
assert.match(owner, /revokeGoogleCalendarConnection/);
assert.doesNotMatch(owner, /provider_email|provider_name|event_title|attendee/i);

assert.match(start, /googleCalendarSameOriginError/);
assert.match(start, /active_staff_required/);
assert.match(start, /authorization_url/);
assert.match(start, /state: "authorizing"/);
assert.doesNotMatch(start, /client_secret|token_ciphertext|refresh_token/);

assert.match(callback, /consumeGoogleCalendarOAuthState/);
assert.match(callback, /owner_context_mismatch/);
assert.match(callback, /GOOGLE_CALENDAR_FREEBUSY_SCOPE/);
assert.match(callback, /freebusy_scope_not_granted/);
assert.match(callback, /saveGoogleCalendarConnection/);
assert.doesNotMatch(callback, /access_token|refresh_token|token_ciphertext/);

assert.match(status, /requireGoogleCalendarOwner/);
assert.match(status, /configuration_required/);
assert.match(status, /connections/);
assert.doesNotMatch(status, /token_ciphertext|access_token|refresh_token/);

assert.match(disconnect, /googleCalendarSameOriginError/);
assert.match(disconnect, /disconnectGoogleCalendar/);
assert.match(disconnect, /conflict_source: "local_only"/);
assert.doesNotMatch(disconnect, /access_token|refresh_token|token_ciphertext/);

assert.match(booking, /readGoogleBusyIntervalsForDate/);
assert.match(booking, /staffBusyIntervals/);
assert.match(booking, /googleBusyIntervals/);
assert.match(booking, /calendar_conflicts_source/);
assert.match(booking, /capacityIsBusy\(activeIntervals, capacity/);
assert.doesNotMatch(booking, /capacityIsBusy\(googleBusyIntervals/);
assert.match(booking, /technicianIsBusy\(googleBusyIntervals, member\.id/);

assert.match(company, /id="google-calendar-staff"/);
assert.match(company, /\/api\/repair-shop\/google-calendar\/status/);
assert.match(company, /\/api\/repair-shop\/google-calendar\/start/);
assert.match(company, /\/api\/repair-shop\/google-calendar\/disconnect/);
assert.match(company, /calendarGooglePolicy/);
assert.match(company, /configurationRequired/);

const credentialLiterals = [
  "GOOGLE_CALENDAR_CLIENT_SECRET =",
  "GOOGLE_CALENDAR_CLIENT_ID =",
  "GOOGLE_CALENDAR_TOKEN_KEY =",
];
for (const literal of credentialLiterals) {
  assert.equal([helper, owner, start, callback, status, disconnect].some((source) => source.includes(literal)), false);
}

console.log("Repair Shop Google Calendar privacy/OAuth contract: PASS");
