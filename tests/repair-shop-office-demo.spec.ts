import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const demo = readFileSync("functions/api/_lib/repair-shop-office-demo.mjs", "utf8");
const syntheticDemo = readFileSync("functions/api/_lib/repair-shop-synthetic-demo.mjs", "utf8");
const registrationOps = readFileSync("functions/api/_lib/registration-ops.mjs", "utf8");
const staffSchema = readFileSync("functions/api/_lib/repair-shop-staff-schema.mjs", "utf8");
const bookingSchema = readFileSync("functions/api/_lib/repair-shop-bookings-schema.mjs", "utf8");
const bookingsApi = readFileSync("functions/api/repair-shop/bookings.ts", "utf8");
const customersApi = readFileSync("functions/api/repair-shop/customers.ts", "utf8");
const vehiclesApi = readFileSync("functions/api/repair-shop/vehicles.ts", "utf8");

const syntheticSeeder = "ensureRepairShopSyntheticDemoData";

test("Office Repair demo is synthetic-only, additive and keeps a rolling 12-hour monthly load", async () => {
  expect(registrationOps).toContain("HERMES_SYNTHETIC_ACCOUNT_EMAILS");
  expect(demo).toContain("syncSyntheticFlagForAccount");
  expect(demo).toContain("hermes_registration_flags");
  expect(demo).toContain("Shop Owner");
  expect(demo).toContain("office");
  expect(demo).toContain("const DEMO_OPEN_HOUR = 7");
  expect(demo).toContain("const DEMO_CLOSE_HOUR = 19");
  expect(demo).toContain("const DEMO_HISTORY_DAYS = 7");
  expect(demo).toContain("const DEMO_FORWARD_DAYS = 30");
  expect(demo).toContain("currentDemoWindow");
  expect(demo).toContain("end.setUTCDate(end.getUTCDate() + DEMO_FORWARD_DAYS - 1)");
  expect(demo).toContain("DEMO_CLOSE_HOUR - DEMO_OPEN_HOUR");
  expect(demo).toContain("INSERT OR IGNORE INTO repair_shop_bookings");
  expect(demo).toContain("INSERT OR IGNORE INTO repair_shop_booking_vehicles");
  expect(demo).toContain("INSERT OR IGNORE INTO repair_shop_booking_history");
  expect(demo).not.toMatch(/DELETE\s+FROM\s+repair_shop_bookings/i);
  expect(demo).not.toMatch(/DELETE\s+FROM\s+services/i);
  expect(demo).not.toMatch(/DELETE\s+FROM\s+repair_shop_staff/i);
  expect(demo).toContain("@example.com");
  expect(demo).toContain("202-555-");
});

test("verified synthetic Officea owner aliases hydrate through the existing Office seed", async () => {
  expect(syntheticDemo).toContain("officea");
  expect(syntheticDemo).toContain("^officea\\b");
  expect(syntheticDemo).toContain("hermes_registration_flags");
  expect(syntheticDemo).toContain("Shop Owner");
  expect(syntheticDemo).toContain("ensureOfficeRepairDemoData");
});

test("the explicitly confirmed Officea Baka test workspace can self-classify by owner or exact shop name", async () => {
  expect(syntheticDemo).toContain('EXPLICIT_SYNTHETIC_TEST_OWNER_NAMES = new Set(["officea baka", "волкогон в.", "volkogon v."])');
  expect(syntheticDemo).toContain('EXPLICIT_SYNTHETIC_TEST_SHOP_NAMES = new Set(["officea baka"])');
  expect(syntheticDemo).toContain("isExplicitSyntheticTestOwner");
  expect(syntheticDemo).toContain("isExplicitSyntheticTestShop");
  expect(syntheticDemo).toContain('SELECT name FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1');
  expect(syntheticDemo).toContain('specialist.role !== "Shop Owner"');
  expect(syntheticDemo).toContain('const explicitShop = await isExplicitSyntheticTestShop(db, specialist)');
  expect(syntheticDemo).toContain('const kind = demoAccountKind(specialist) || (explicitShop ? "office" : null)');
  expect(syntheticDemo).toContain('explicitShop\n      ? { ...specialist, name: "Officea Baka" }');
  expect(syntheticDemo).toContain("if (!explicitOwner && !explicitShop) return false");
  expect(syntheticDemo).toContain("explicitTestEnv");
  expect(syntheticDemo).toContain("syncSyntheticFlagForAccount");
});

test("demo coverage spans motorcycles through heavy and oversized equipment", async () => {
  for (const phrase of [
    "Motorcycle Oil & Filter Service",
    "EV High-Voltage System Diagnostics",
    "Diesel Engine Diagnostics",
    "Heavy Truck Air Brake Service",
    "Trailer DOT Inspection",
    "Bus / Coach Preventive Maintenance",
    "Heavy Equipment Diagnostics",
    "Oversize / Specialized Equipment Repair",
    "Collision Damage Estimate",
    "Towing / Recovery",
    "Reefer Unit Diagnostics & Repair",
    "Welding & Fabrication",
  ]) expect(demo).toContain(phrase);
  expect(demo).toContain("Daniel Foster");
  expect(demo).toContain("Sophia Martinez");
  expect(demo).toContain("Benjamin Clark");
});

test("technicians are first-class booking data and synthetic tenants hydrate every core CRM read path", async () => {
  expect(staffSchema).toContain("CREATE TABLE IF NOT EXISTS repair_shop_staff");
  expect(bookingSchema).toContain("technician_id TEXT");
  expect(bookingSchema).toContain("technician_name TEXT");
  expect(bookingsApi).toContain(syntheticSeeder);
  expect(bookingsApi).toContain("technician_id,technician_name");
  expect(customersApi).toContain(syntheticSeeder);
  expect(vehiclesApi).toContain(syntheticSeeder);
});
