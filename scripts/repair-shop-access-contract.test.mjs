import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  REPAIR_SHOP_ACCESS_STATES,
  REPAIR_SHOP_PLAN_ID,
  REPAIR_SHOP_PLAN_NAME,
  isRepairShopAccessState,
  nextRepairShopCommercialAction,
} from "../functions/api/_lib/repair-shop-access.mjs";

assert.deepEqual(REPAIR_SHOP_ACCESS_STATES, [
  "trialing",
  "founding",
  "active",
  "past_due",
  "cancelled",
  "comped",
]);
assert.equal(REPAIR_SHOP_PLAN_ID, "repair_shop_founding");
assert.equal(REPAIR_SHOP_PLAN_NAME, "Founding Shop Plan");

for (const state of REPAIR_SHOP_ACCESS_STATES) assert.equal(isRepairShopAccessState(state), true);
for (const invalid of ["", "paid", "pending", "free", "expired", null, undefined]) {
  assert.equal(isRepairShopAccessState(invalid), false);
}

assert.equal(nextRepairShopCommercialAction("trialing"), "choose_plan");
assert.equal(nextRepairShopCommercialAction("past_due"), "contact_billing");
assert.equal(nextRepairShopCommercialAction("cancelled"), "renew");
for (const state of ["founding", "active", "comped"]) {
  assert.equal(nextRepairShopCommercialAction(state), "none");
}

const [helperSource, endpointSource] = await Promise.all([
  readFile(new URL("../functions/api/_lib/repair-shop-access.mjs", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/repair-shop/access.ts", import.meta.url), "utf8"),
]);

assert.match(helperSource, /CREATE TABLE IF NOT EXISTS repair_shop_access/);
assert.match(helperSource, /shop_id TEXT PRIMARY KEY/);
assert.match(helperSource, /INSERT OR IGNORE INTO repair_shop_access/);
assert.match(helperSource, /"trialing"/);
assert.match(helperSource, /const startedAt = typeof shopCreatedAt === "string"/);
assert.match(endpointSource, /getAuthenticatedSpecialist/);
assert.match(endpointSource, /SELECT id,created_at FROM repair_shops WHERE owner_specialist_id = \? LIMIT 1/);
assert.match(endpointSource, /shop_profile_required/);
assert.match(endpointSource, /ensureDefaultRepairShopAccess\(env\.DB, shop\.id, shop\.created_at\)/);
assert.match(endpointSource, /current_period_end:\s*access\.current_period_end \?\? null/);
assert.match(endpointSource, /next_action:\s*nextRepairShopCommercialAction/);
assert.doesNotMatch(endpointSource, /invoice|payment_provider|commission|sales_rep|internal_note/i);
assert.doesNotMatch(endpointSource, /searchParams\.get\(["']shop|request\.json\(\)/);

console.log("Repair Shop persisted access-state contract passed.");
