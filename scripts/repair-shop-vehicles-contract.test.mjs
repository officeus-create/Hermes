import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const api = readFileSync("functions/api/repair-shop/vehicles.ts", "utf8");
const page = readFileSync("src/pages/services/hermes-connect/repair-shops/vehicles.astro", "utf8");
const nav = readFileSync("src/components/RepairShopOwnerNavEnhancer.astro", "utf8");

assert.match(api, /getAuthenticatedSpecialist/);
assert.ok((api.match(/WHERE owner_specialist_id = \?/g) || []).length >= 2, "bookings and vehicles must both be owner scoped");
assert.match(api, /repair_shop_booking_vehicles/);
assert.doesNotMatch(api, /CREATE TABLE/i, "Vehicles must derive from existing storage, not create another vehicle database");
assert.match(api, /vin:\$\{vin\}/, "VIN must be the primary cross-customer vehicle identity");
assert.match(api, /customer:\$\{customer\}\|ymm:/, "fallback identity must include customer to avoid merging identical YMM vehicles");
assert.match(api, /current_customer/);
assert.match(api, /last_completed_visit/);
assert.match(api, /next_appointment/);
assert.match(api, /mileage/);
assert.match(api, /history/);

assert.match(page, /robots="noindex,nofollow"/);
assert.match(page, /fetch\("\/api\/repair-shop\/vehicles"/);
assert.match(page, /fetch\("\/api\/auth\/me"/);
assert.doesNotMatch(page, /customer=\$\{/i, "customer PII must not be put in navigation URLs");
assert.doesNotMatch(page, /vin=\$\{/i, "VIN must not be put in navigation URLs");
assert.match(page, /vehiclesTitle:"Vehicles"/);
assert.match(page, /vehiclesTitle:"Автомобили"/);

assert.match(nav, /repairShopRoot\}\/vehicles/);
assert.match(nav, /vehicles:"Vehicles"/);
assert.match(nav, /vehicles:"Автомобили"/);

console.log("Repair Shop Vehicles contract OK");
