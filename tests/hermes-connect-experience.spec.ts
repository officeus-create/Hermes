import { expect, test } from "@playwright/test";

const localeCases = [
  ["en", "/services/hermes-connect/repair-shops/"],
  ["es", "/services/hermes-connect/repair-shops/?lang=es"],
  ["fr", "/services/hermes-connect/repair-shops/?lang=fr"],
  ["uk", "/services/hermes-connect/repair-shops/?lang=uk"],
  ["it", "/services/hermes-connect/repair-shops/?lang=it"],
  ["ru", "/services/hermes-connect/repair-shops/?lang=ru"],
] as const;

test("Hermes Connect language switching stays on the equivalent product route", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru");

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("heading", { name: "Run the Repair Shop flow from one product." })).toBeVisible();
  await expect(page.locator("[data-hc-english-only]")).toContainText("страница пока доступна только на английском");

  const languageMenu = page.locator("[data-language-menu]");
  await expect(languageMenu.locator("summary span")).toHaveText("Русский");
  await expect(languageMenu.locator('a[lang="ru"]')).toHaveAttribute("aria-current", "page");

  for (const [locale, expectedHref] of localeCases) {
    await expect(languageMenu.locator(`a[lang="${locale}"]`)).toHaveAttribute("href", expectedHref);
  }
});

test("Hermes Connect product family navigation replaces the old Repair Shop back arrow", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const context = page.locator("[data-hc-product-context]");
  await expect(context).toContainText("CURRENT LIVE PILOT");
  await expect(context.getByRole("link", { name: "Repair Shops" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
  await expect(context.getByRole("link", { name: "AI Command Center" })).toHaveAttribute("href", "/services/hermes-connect/ai-command-center/");
  await expect(page.locator(".repair-pilot-page .hero-header-nav")).toHaveCount(0);
});

test("Hermes Connect Hub presents one live product and reference capabilities", async ({ page }) => {
  await page.goto("/services/hermes-connect/");

  await expect(page.locator("[data-hc-product-context]")).toContainText("PRODUCT FAMILY · CURRENT");
  await expect(page.getByRole("heading", { name: "One product family. One current live pilot." })).toBeVisible();
  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  await expect(page.getByText("Current live pilot", { exact: true }).first()).toBeVisible();
  expect(await page.getByText("Reference capability", { exact: true }).count()).toBeGreaterThan(0);
});

test("non-live Hermes Connect modules are reference capabilities without legacy pricing or workspace CTA", async ({ page }) => {
  await page.goto("/services/hermes-connect/proposal-builder/");

  const context = page.locator("[data-hc-product-context]");
  await expect(context).toContainText("REFERENCE CAPABILITY · NOT CURRENT LIVE PILOT");
  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  await expect(page.getByText("$99", { exact: false })).toHaveCount(0);
  await expect(page.getByText("$299", { exact: false })).toHaveCount(0);
  await expect(page.getByText("$799", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Open current Repair Shop product/ })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
});

test("live Corporate Offer runtime removes the legacy browser-only form handler surface", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const form = page.locator("#partner-beta-form");
  await expect(form).toHaveAttribute("data-live-partner-offer", "true");
  await expect(form).not.toHaveAttribute("data-demo-form", /.*/);
});

test("Hermes Connect family navigation remains usable on mobile without horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=uk");

  await expect(page.locator("[data-hc-product-context]")).toContainText("ПОТОЧНИЙ ЖИВИЙ ПІЛОТ");
  await expect(page.locator("[data-hc-english-only]")).toBeVisible();
  await expect(page.locator(".hc-family-nav")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
