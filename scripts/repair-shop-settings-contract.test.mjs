import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/repair-shop/profile.ts", "utf8");
const schema = readFileSync("functions/api/_lib/repair-shop-schema.mjs", "utf8");
const publicApi = readFileSync("functions/api/public/repair-shop.ts", "utf8");
const staffApi = readFileSync("functions/api/repair-shop/staff.ts", "utf8");
const scheduleApi = readFileSync("functions/api/repair-shop/staff-schedule.ts", "utf8");
const scheduleSchema = readFileSync("functions/api/_lib/repair-shop-staff-schedule-schema.mjs", "utf8");
const publicBookingApi = readFileSync("functions/api/public/repair-booking.ts", "utf8");
const page = readFileSync("src/pages/services/hermes-connect/repair-shops/settings.astro", "utf8");
const nav = readFileSync("src/components/RepairShopOwnerNavEnhancer.astro", "utf8");

assert.match(api, /getAuthenticatedSpecialist/);
assert.match(api, /WHERE owner_specialist_id = \? LIMIT 1/);
assert.match(api, /export async function onRequestGet/);
assert.match(api, /export async function onRequestPut/);
assert.match(api, /region\?: unknown/);
assert.match(api, /country_code\?: unknown/);
assert.match(api, /Intl\.DateTimeFormat\("en-US", \{ timeZone: value \}\)/);
assert.match(api, /invalid_country_code/);
assert.match(api, /region=\?,country_code=\?/);
assert.doesNotMatch(api, /US_TIMEZONES/, "Repair Shop profile must accept valid global IANA timezones");
assert.doesNotMatch(api, /onRequestPost|onRequestDelete/, "Company profile must reuse the existing profile GET/PUT contract only");

assert.match(schema, /ensureOptionalColumn\(db, "region", "region TEXT"\)/);
assert.match(schema, /ensureOptionalColumn\(db, "country_code", "country_code TEXT"\)/);
assert.match(schema, /SET country_code = 'US'/, "Legacy US rows need a deterministic country backfill");
assert.match(publicApi, /city,state,region,country_code,postal_code,timezone/);

for (const method of ["onRequestGet", "onRequestPost", "onRequestPut", "onRequestDelete"]) {
  assert.match(staffApi, new RegExp(`export async function ${method}`), `staff API must expose ${method}`);
}
assert.match(staffApi, /shop_owner_required/);
assert.match(staffApi, /owner_specialist_id/);
assert.match(staffApi, /specialties/);

assert.match(scheduleSchema, /repair_shop_staff_schedule/);
assert.match(scheduleSchema, /PRIMARY KEY \(staff_id, day_of_week\)/);
assert.match(scheduleApi, /seven_days_required/);
assert.match(scheduleApi, /overlapping_breaks/);
assert.match(scheduleApi, /break_outside_shift/);
assert.match(scheduleApi, /calendar_conflicts_source:\s*"local_only"/);

assert.match(publicBookingApi, /ensureRepairShopStaffScheduleSchema/);
assert.match(publicBookingApi, /staff_scheduling/);
assert.match(publicBookingApi, /teamUnavailableIntervals/);
assert.match(publicBookingApi, /technician_id/);
assert.match(publicBookingApi, /legacy_shop_capacity/);
assert.match(publicBookingApi, /slot_unavailable/);

assert.match(page, /robots="noindex,nofollow"/);
assert.match(page, /requestJson\("\/api\/repair-shop\/profile"\)/);
assert.match(page, /requestJson\("\/api\/repair-shop\/profile",\{method:"PUT"/);
assert.match(page, /HermesConnectAccountSwitcher current="repair" mode="menu"/);
assert.match(page, /id="shop-region"/);
assert.match(page, /id="shop-country"/);
assert.match(page, /id="shop-timezone"/);
assert.match(page, /Europe\/Kyiv/);
assert.match(page, /country_code:/);
assert.match(page, /title:"Company"/);
assert.match(page, /title:"Компания"/);
assert.match(page, /\/api\/repair-shop\/staff/);
assert.match(page, /\/api\/repair-shop\/staff-schedule/);
assert.match(page, /Shifts & breaks/);
assert.match(page, /Смены и перерывы/);
assert.match(page, /Google Calendar/);
assert.match(page, /privacy-minimal free\/busy/);
assert.match(page, /Needs authorization/);
assert.match(page, /Нужна авторизация/);
assert.match(page, /Instagram · Facebook · Threads · LinkedIn · X/);
assert.match(page, /Website & brandbook/);
assert.match(page, /Vacancy synchronization/);
assert.doesNotMatch(page, /<select id="shop-timezone"/, "Timezone must not be restricted to a US-only select");
assert.doesNotMatch(page, /CREATE TABLE|INSERT INTO repair_shops|UPDATE repair_shops/i, "Company UI must not own storage semantics");
assert.doesNotMatch(page, /client[_-]?id\s*[:=]/i, "No OAuth client IDs may be invented in Company UI");
assert.doesNotMatch(page, /Google Calendar[^\n]{0,200}>Connected</i, "Calendar must not be presented as connected");

assert.match(nav, /`\$\{repairShopRoot\}\/settings`/);
assert.match(nav, /href:withLocale\(`\$\{repairShopRoot\}\/settings\/`\)/);
assert.match(nav, /active:normalizedPath === `\$\{repairShopRoot\}\/settings`/);
assert.doesNotMatch(nav, /settings, href:withLocale\(`\$\{repairShopRoot\}\/dashboard\/`, "#profile-title"\)/);

console.log("Repair Shop Company / Team / Schedules contract OK");