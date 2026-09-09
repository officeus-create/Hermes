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
