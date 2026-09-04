import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [schema, endpoint, publicEndpoint, runtime, enhancer] = await Promise.all([
  readFile(new URL("../functions/api/_lib/repair-shop-driver-discount-schema.mjs", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/driver-discount.ts", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/public/repair-shop.ts", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-driver-discount.js", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairPartnerOfferEnhancer.astro", import.meta.url), "utf8"),
]);

assert.match(schema, /CREATE TABLE IF NOT EXISTS repair_shop_driver_discounts/);
assert.match(schema, /service_discount_percent INTEGER NOT NULL DEFAULT 0/);
assert.match(schema, /materials_discount_percent INTEGER NOT NULL DEFAULT 0/);
assert.match(schema, /service_scope IN \('all','selected'\)/);
assert.match(schema, /materials_scope IN \('all','selected'\)/);
assert.match(endpoint, /getAuthenticatedSpecialist/);
assert.match(endpoint, /shop_profile_required/);
assert.match(endpoint, /selected_services_required/);
assert.match(endpoint, /selected_materials_required/);
assert.match(endpoint, /invalid_selected_service/);
assert.match(endpoint, /ON CONFLICT\(shop_id\) DO UPDATE SET/);
assert.match(publicEndpoint, /driver_discount: driverDiscount/);
assert.match(publicEndpoint, /service_names:/);
assert.match(enhancer, /repair-shop-driver-discount\.js/);
assert.match(runtime, /HERMES CONNECT DRIVER BENEFIT/);
assert.match(runtime, /СКИДКА ДЛЯ ВОДИТЕЛЕЙ HERMES CONNECT/);
assert.match(runtime, /ЗНИЖКА ДЛЯ ВОДІЇВ HERMES CONNECT/);
assert.match(runtime, /BENEFICIO PARA CONDUCTORES HERMES CONNECT/);
assert.match(runtime, /VANTAGGIO AUTISTI HERMES CONNECT/);
assert.match(runtime, /AVANTAGE CONDUCTEURS HERMES CONNECT/);
assert.match(runtime, /data-driver-discount-owner/);
assert.match(runtime, /data-driver-discount-public/);
assert.match(runtime, /#22c55e/);
assert.doesNotMatch(runtime, /innerHTML\s*\+=\s*.*service\.name/);

console.log("repair-shop-driver-discount contract: OK");
