import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizeRepairShopCapacity, saturatedRepairShopIntervals } from "../functions/api/_lib/repair-shop-capacity.mjs";

assert.equal(normalizeRepairShopCapacity(undefined), 1);
assert.equal(normalizeRepairShopCapacity(0), 1);
assert.equal(normalizeRepairShopCapacity(2), 2);
assert.equal(normalizeRepairShopCapacity(99), 10);

const overlaps = [
  { start_time: "09:00", end_time: "10:00" },
  { start_time: "09:30", end_time: "10:30" },
];
assert.deepEqual(saturatedRepairShopIntervals(overlaps, 1), [{ start_time: "09:00", end_time: "10:30" }]);
assert.deepEqual(saturatedRepairShopIntervals(overlaps, 2), [{ start_time: "09:30", end_time: "10:00" }]);
assert.deepEqual(saturatedRepairShopIntervals([
  ...overlaps,
  { start_time: "09:45", end_time: "10:15" },
], 2), [{ start_time: "09:30", end_time: "10:15" }]);
assert.deepEqual(saturatedRepairShopIntervals([
  { start_time: "09:00", end_time: "09:30" },
  { start_time: "09:30", end_time: "10:00" },
], 2), []);

const [bookingSource, bookingSchemaSource, capacityEndpointSource, capabilitiesSource, clientSource] = await Promise.all([
  readFile(new URL("../functions/api/public/repair-booking.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/_lib/repair-shop-bookings-schema.mjs", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/capacity.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/capabilities.ts", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-capacity.js", import.meta.url), "utf8"),
]);

assert.match(bookingSchemaSource, /DROP INDEX IF EXISTS idx_repair_shop_bookings_active_exact_slot/);
assert.match(bookingSchemaSource, /idx_repair_shop_bookings_active_window/);
assert.doesNotMatch(bookingSchemaSource, /CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_shop_bookings_active_exact_slot/);

assert.match(bookingSource, /saturatedRepairShopIntervals\(activeIntervals, capacity\)/);
assert.match(bookingSource, /parallel_booking_capacity/);
assert.match(bookingSource, /SELECT COUNT\(\*\) FROM repair_shop_bookings/);
assert.match(bookingSource, /start_time < \?/);
assert.match(bookingSource, /end_time > \?/);
assert.match(bookingSource, /\) < \?/);
assert.match(bookingSource, /const inserted = Number\(results\?\.\[0\]\?\.meta\?\.changes/);
assert.match(bookingSource, /if \(inserted !== 1\) return jsonResponse\(409, \{ success: false, error: "slot_unavailable" \}\)/);
assert.match(bookingSource, /INSERT INTO repair_shop_booking_history[\s\S]*SELECT \?,id,owner_specialist_id,NULL,'confirmed'/);
assert.match(bookingSource, /INSERT INTO repair_shop_booking_vehicles[\s\S]*SELECT id,owner_specialist_id/);

assert.match(capacityEndpointSource, /capacity >= 1 && capacity <= 10/);
assert.match(capacityEndpointSource, /specialist\.role !== "Shop Owner"/);
assert.match(capacityEndpointSource, /parallel_booking_capacity = \?/);
assert.match(capabilitiesSource, /body\.parallel_booking_capacity === undefined \? existingCapacity/);

assert.match(clientSource, /\/api\/repair-shop\/capacity/);
assert.match(clientSource, /parallel_booking_capacity/);
assert.match(clientSource, /Array\.from\(\{ length: 10 \}/);
for (const locale of ["en", "ru", "uk", "es", "it", "fr"]) assert.match(clientSource, new RegExp(`\\b${locale}: \\{`));
assert.doesNotMatch(clientSource, /client_email|client_phone|vin|dataLayer|gtag/i);

console.log("Repair Shop capacity-aware booking contract passed.");