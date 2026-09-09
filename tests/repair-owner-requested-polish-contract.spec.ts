import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path: string) => readFile(resolve(process.cwd(), path), "utf8");

test("owner shell restores saved locale instead of leaving SSR English labels behind", async () => {
  const runtime = await source("public/repair-owner-runtime-fixes.js");
  expect(runtime).toContain('localStorage.getItem("hermes-connect-language")');
  expect(runtime).toContain('localStorage.setItem("hermes-connect-language", locale)');
  expect(runtime).toContain('ru: { context: "Кабинет владельца", overview: "Обзор"');
  expect(runtime).toContain('.repair-crm-nav-item, .repair-crm-mobile-quick a');
  expect(runtime).toContain('.repair-crm-language a[lang]');
});

test("dashboard context shows a real localized date and time rather than Today", async () => {
  const runtime = await source("public/repair-owner-runtime-fixes.js");
  expect(runtime).toContain("new Intl.DateTimeFormat");
  expect(runtime).toContain('weekday: "short"');
  expect(runtime).toContain('hour: "2-digit"');
  expect(runtime).toContain('minute: "2-digit"');
  expect(runtime).not.toContain('title.textContent = "Today"');
});

test("owner controls keep capacity and driver-discount layouts compact", async () => {
  const runtime = await source("public/repair-owner-runtime-fixes.js");
  expect(runtime).toContain(".hc-capacity-control .secondary-btn");
  expect(runtime).toContain("height:42px!important");
  expect(runtime).toContain(".hc-driver-discount-v2>.panel-heading");
  expect(runtime).toContain("grid-template-columns:46px minmax(0,1fr)!important");
});

test("the explicit Officea Baka test shop hydrates through the existing additive synthetic lane", async () => {
  const runtime = await source("public/repair-owner-runtime-fixes.js");
  const synthetic = await source("functions/api/_lib/repair-shop-synthetic-demo.mjs");
  const demo = await source("functions/api/_lib/repair-shop-office-demo.mjs");

  expect(runtime).not.toContain('/api/repair-shop/ceo-qa-seed');
  expect(runtime).not.toContain('hc-owner-qa-v3');
  expect(synthetic).toContain('EXPLICIT_SYNTHETIC_TEST_SHOP_NAMES = new Set(["officea baka"])');
  expect(synthetic).toContain('SELECT name FROM repair_shops WHERE owner_specialist_id = ? LIMIT 1');
  expect(synthetic).toContain('const explicitShop = await isExplicitSyntheticTestShop(db, specialist)');
  expect(synthetic).toContain('if (!explicitOwner && !explicitShop) return false');
  expect(synthetic).toContain('ensureOfficeRepairDemoData');
  expect(synthetic).toContain('fillSyntheticStaffSchedules');
  expect(demo).toContain('const DEMO_OPEN_HOUR = 7');
  expect(demo).toContain('const DEMO_CLOSE_HOUR = 19');
  expect(demo).toContain('const DEMO_HISTORY_DAYS = 7');
  expect(demo).toContain('const DEMO_FORWARD_DAYS = 30');
  expect(demo).toContain('currentDemoWindow');
  expect(demo).toContain('end.setUTCDate(end.getUTCDate() + DEMO_FORWARD_DAYS - 1)');
  expect(demo).toContain('officea?');
  expect(demo).toContain('INSERT INTO repair_shop_staff');
  expect(demo).toContain('INSERT OR IGNORE INTO repair_shop_bookings');
});


test("owner CRM keeps the customer booking link visible and pulses only actionable missing setup", async () => {
  const activation = await source("public/repair-shop-activation.js");
  const enhancer = await source("src/components/RepairShopActivationEnhancer.astro");

  expect(activation).toContain("ownerWorkspacePaths");
  expect(activation).toContain("mountBookingShareBar");
  expect(activation).toContain("Send this link to customers so they can choose an available service time.");
  expect(activation).toContain("data-repair-booking-sharebar");
  expect(activation).toContain("data-needs-attention");
  expect(activation).toContain("navigator.clipboard.writeText");
  expect(enhancer).toContain("repair-booking-sharebar");
  expect(enhancer).toContain("repairAttentionPulse");
  expect(enhancer).toContain("prefers-reduced-motion:reduce");
});
