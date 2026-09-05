import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const demo = readFileSync("functions/api/_lib/repair-shop-office-demo.mjs", "utf8");
const registrationOps = readFileSync("functions/api/_lib/registration-ops.mjs", "utf8");
const staffSchema = readFileSync("functions/api/_lib/repair-shop-staff-schema.mjs", "utf8");
const bookingSchema = readFileSync("functions/api/_lib/repair-shop-bookings-schema.mjs", "utf8");
const bookingsApi = readFileSync("functions/api/repair-shop/bookings.ts", "utf8");
const customersApi = readFileSync("functions/api/repair-shop/customers.ts", "utf8");

test("Office Repair demo is synthetic-only, additive and seeded through year end", async () => {
  expect(registrationOps).toContain("HERMES_SYNTHETIC_ACCOUNT_EMAILS");
  expect(demo).toContain("syncSyntheticFlagForAccount");
  expect(demo).toContain("hermes_registration_flags");
  expect(demo).toContain("Shop Owner");
  expect(demo).toContain("office");
  expect(demo).toContain('const END_DATE = "2026-12-31"');
  expect(demo).toContain('const START_DATE = "2026-09-05"');
  expect(demo).toContain("INSERT OR IGNORE INTO repair_shop_bookings");
  expect(demo).toContain("INSERT OR IGNORE INTO repair_shop_booking_vehicles");
  expect(demo).toContain("INSERT OR IGNORE INTO repair_shop_booking_history");
  expect(demo).not.toMatch(/DELETE\s+FROM\s+repair_shop_bookings/i);
  expect(demo).not.toMatch(/DELETE\s+FROM\s+services/i);
  expect(demo).not.toMatch(/DELETE\s+FROM\s+repair_shop_staff/i);
  expect(demo).toContain("@example.com");
  expect(demo).toContain("202-555-");
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
  ]) expect(demo).toContain(phrase);
  expect(demo).toContain("Daniel Foster");
  expect(demo).toContain("Sophia Martinez");
  expect(demo).toContain("Benjamin Clark");
});

test("technicians are first-class booking data and Office demo hydrates real CRM APIs", async () => {
  expect(staffSchema).toContain("CREATE TABLE IF NOT EXISTS repair_shop_staff");
  expect(bookingSchema).toContain("technician_id TEXT");
  expect(bookingSchema).toContain("technician_name TEXT");
  expect(bookingsApi).toContain("ensureOfficeRepairDemoData");
  expect(bookingsApi).toContain("technician_id,technician_name");
  expect(customersApi).toContain("ensureOfficeRepairDemoData");
});
