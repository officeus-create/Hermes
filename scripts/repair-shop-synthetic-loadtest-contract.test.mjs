import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [syntheticSource, officeSeedSource, staffSource, bookingsSource, customersSource, vehiclesSource] = await Promise.all([
  readFile(new URL("../functions/api/_lib/repair-shop-synthetic-demo.mjs", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/_lib/repair-shop-office-demo.mjs", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/staff.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/bookings.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/customers.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/vehicles.ts", import.meta.url), "utf8"),
]);

assert.match(syntheticSource, /return "office"/);
assert.match(syntheticSource, /return "volkogon"/);
assert.match(syntheticSource, /syncSyntheticFlagForAccount/);
assert.match(syntheticSource, /Number\(flag\?\.synthetic\) === 1/);
assert.match(syntheticSource, /ensureOfficeRepairDemoData/);
assert.match(syntheticSource, /ensureRepairShopStaffScheduleSchema/);
assert.match(syntheticSource, /INSERT OR IGNORE INTO repair_shop_staff_schedule/);
assert.match(syntheticSource, /\[0, 0, null, null, \[\]\]/);
assert.match(syntheticSource, /\[1, 1, "07:30", "18:30"/);
assert.match(syntheticSource, /start_time: "12:00", end_time: "12:30"/);
assert.match(syntheticSource, /\[6, 1, "08:30", "15:30"/);
assert.match(syntheticSource, /start_time: "11:30", end_time: "12:00"/);
assert.match(syntheticSource, /Office Complete Auto & Fleet Test Center/);
assert.match(syntheticSource, /Volkogon Complete Auto & Fleet Test Center/);
assert.match(syntheticSource, /Tire Rotation/);
assert.match(syntheticSource, /Flat Tire Repair/);
assert.match(syntheticSource, /TPMS Inspection & Sensor Service/);
assert.match(syntheticSource, /Brake Fluid Exchange/);
assert.match(syntheticSource, /Complete Vehicle Inspection/);
assert.match(syntheticSource, /Engine Tune-Up & Spark Plug Service/);
assert.match(syntheticSource, /Wiper Blade Replacement/);
assert.match(syntheticSource, /ABS Diagnostic & Service/);
assert.match(syntheticSource, /benchmark_service_count: benchmarkServiceCount/);
assert.match(syntheticSource, /schedule_rows: scheduleCount/);
assert.match(syntheticSource, /synthetic: true/);

assert.match(officeSeedSource, /const START_DATE = "2026-09-05"/);
assert.match(officeSeedSource, /const END_DATE = "2026-12-31"/);
assert.match(officeSeedSource, /parallel_booking_capacity,updated_at\)[\s\S]*VALUES \(\?, \?,1,1,0,10,\?\)/);
assert.match(officeSeedSource, /staff_count: STAFF\.length/);
assert.match(officeSeedSource, /service_count: SERVICES\.length/);
assert.match(officeSeedSource, /appointment_count: appointmentCount/);
assert.match(officeSeedSource, /client_email,client_phone,technician_id,technician_name/);
assert.match(officeSeedSource, /repair_shop_booking_vehicles/);
assert.match(officeSeedSource, /repair_shop_booking_history/);

for (const source of [staffSource, bookingsSource, customersSource, vehiclesSource]) {
  assert.match(source, /ensureRepairShopSyntheticDemoData/);
}
assert.match(staffSource, /demo_seed: demoSeed\.eligible \? demoSeed : undefined/);
assert.match(bookingsSource, /demo_seed: demoSeed\.eligible \? demoSeed : undefined/);
assert.match(customersSource, /demo_seed: demoSeed\.eligible \? demoSeed : undefined/);
assert.match(vehiclesSource, /demo_seed: demoSeed\.eligible \? demoSeed : undefined/);
assert.doesNotMatch(syntheticSource, /firestone|midas/i, "synthetic tenants must not impersonate real repair brands");

console.log("Repair Shop Office/Volkogon synthetic load-test contract passed.");