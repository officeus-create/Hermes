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

test("only the existing v3 CEO QA owner can hydrate the synthetic month workspace", async () => {
  const runtime = await source("public/repair-owner-runtime-fixes.js");
  const endpoint = await source("functions/api/repair-shop/ceo-qa-seed.ts");
  const demo = await source("functions/api/_lib/repair-shop-office-demo.mjs");

  expect(runtime).toContain('/api/repair-shop/ceo-qa-seed');
  expect(runtime).toContain('officeus+hc-owner-qa-v3-20260818@hermeslogisticsus.com');
  expect(endpoint).toContain('getAuthenticatedSpecialist');
  expect(endpoint).toContain('specialist.role !== "Shop Owner"');
  expect(endpoint).toContain('ensureRepairShopSyntheticDemoData');
  expect(endpoint).toContain('synthetic: true');
  expect(demo).toContain('const START_DATE = "2026-09-05"');
  expect(demo).toContain('const END_DATE = "2026-12-31"');
  expect(demo).toContain('INSERT INTO repair_shop_staff');
  expect(demo).toContain('INSERT OR IGNORE INTO repair_shop_bookings');
});
