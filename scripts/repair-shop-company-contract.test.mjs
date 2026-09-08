import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const staffApi = readFileSync("functions/api/repair-shop/staff.ts", "utf8");
const scheduleApi = readFileSync("functions/api/repair-shop/staff-schedule.ts", "utf8");
const scheduleSchema = readFileSync("functions/api/_lib/repair-shop-staff-schedule-schema.mjs", "utf8");
const page = readFileSync("src/pages/services/hermes-connect/repair-shops/settings.astro", "utf8");

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

assert.match(page, />Company</);
assert.match(page, />Компания</);
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

assert.doesNotMatch(page, /client[_-]?id\s*[:=]/i, "no OAuth client IDs may be invented in Company UI");
assert.doesNotMatch(page, /Google Calendar[^\n]{0,200}>Connected</i, "Calendar must not be presented as connected");
assert.doesNotMatch(page, /publish(?:ed|ing)? automatically/i, "Company UI must not claim automatic publishing");

console.log("Repair Shop company/team/schedule contract passed.");
