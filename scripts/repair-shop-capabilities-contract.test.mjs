import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  REPAIR_SHOP_VEHICLE_TYPES,
  defaultRepairShopCapabilities,
  parseRepairShopVehicleTypes,
  serializeRepairShopCapabilities,
} from "../functions/api/_lib/repair-shop-capabilities-schema.mjs";

assert.deepEqual(REPAIR_SHOP_VEHICLE_TYPES, [
  "passenger_light",
  "commercial_truck",
  "trailer",
  "reefer",
  "flatbed_open_deck",
  "other",
]);
assert.deepEqual(parseRepairShopVehicleTypes('["commercial_truck","trailer","commercial_truck","bogus"]'), ["commercial_truck", "trailer"]);
assert.deepEqual(defaultRepairShopCapabilities("shop-1"), {
  shop_id: "shop-1",
  vehicle_types: [],
  fleet_service: false,
  mobile_roadside: false,
  emergency_24_7: false,
  parallel_booking_capacity: 1,
  updated_at: null,
});
assert.equal(serializeRepairShopCapabilities({ shop_id: "shop-1", parallel_booking_capacity: 99 }, "shop-1").parallel_booking_capacity, 10);

const [schemaSource, endpointSource, publicSource, clientSource, componentSource] = await Promise.all([
  readFile(new URL("../functions/api/_lib/repair-shop-capabilities-schema.mjs", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/capabilities.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/public/repair-shop.ts", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-capabilities.js", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
]);

assert.match(schemaSource, /CREATE TABLE IF NOT EXISTS repair_shop_capabilities/);
assert.match(schemaSource, /vehicle_types TEXT NOT NULL DEFAULT '\[\]'/);
assert.match(schemaSource, /fleet_service INTEGER NOT NULL DEFAULT 0/);
assert.match(schemaSource, /mobile_roadside INTEGER NOT NULL DEFAULT 0/);
assert.match(schemaSource, /emergency_24_7 INTEGER NOT NULL DEFAULT 0/);
assert.match(schemaSource, /parallel_booking_capacity INTEGER NOT NULL DEFAULT 1/);

assert.match(endpointSource, /specialist\.role !== "Shop Owner"/);
assert.match(endpointSource, /shop_profile_required/);
assert.match(endpointSource, /invalid_vehicle_types/);
assert.match(endpointSource, /emergency_requires_roadside/);
assert.match(endpointSource, /parallel_booking_capacity/);
assert.doesNotMatch(endpointSource, /client_email|client_phone|vin|sales_rep|commission/i);

assert.match(publicSource, /publicCapabilities/);
assert.match(publicSource, /vehicle_types/);
assert.match(publicSource, /fleet_service/);
assert.match(publicSource, /mobile_roadside/);
assert.match(publicSource, /emergency_24_7/);
assert.doesNotMatch(publicSource, /parallel_booking_capacity:\s*storedCapabilities/);

assert.match(clientSource, /\/api\/repair-shop\/capabilities/);
assert.match(clientSource, /\/api\/public\/repair-shop\?slug=/);
assert.match(clientSource, /data-capability-flag="mobile_roadside"/);
assert.match(clientSource, /data-capability-flag="emergency_24_7"/);
assert.match(clientSource, /if \(!roadside\.checked\) emergency\.checked = false/);
assert.match(clientSource, /strings = \{/);
for (const locale of ["en", "ru", "uk", "es", "it", "fr"]) assert.match(clientSource, new RegExp(`\\b${locale}: \\{`));
assert.doesNotMatch(clientSource, /dataLayer|gtag|client_email|client_phone|vin/i);

assert.match(componentSource, /isRepairShopSurface/);
assert.match(componentSource, /repair-shop-capabilities\.js/);

console.log("Repair Shop capability profile contract passed.");