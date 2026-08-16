import { expect, test } from "@playwright/test";

test("Hermes Connect language switching stays on the same canonical product route", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/?lang=ru");

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("heading", { name: "Подключите свое СТО к логистическим операциям нашего автопарка." })).toBeVisible();

  const languageMenu = page.locator("[data-language-menu]");
  await expect(languageMenu.locator("summary span")).toHaveText("Русский");
  await expect(languageMenu.locator('a[lang="ru"]')).toHaveAttribute("aria-current", "page");

  const ukrainian = languageMenu.locator('a[lang="uk"]');
  await expect(ukrainian).toHaveAttribute("href", /\/services\/hermes-connect\/repair-shops\/\?lang=uk$/);

  const english = languageMenu.locator('a[lang="en"]');
  await expect(english).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
});

test("Repair Shop page uses a clear product context instead of the overlapping back arrow", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const context = page.locator("[data-hc-product-context]");
  await expect(context).toContainText("CURRENT BETA · LIVE PILOT");
  await expect(context.getByRole("link", { name: "Repair Shops" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/");
  await expect(context.getByRole("link", { name: "Owner Login" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/auth/");

  const back = page.locator(".repair-pilot-page .hero-header-nav .back-link");
  await expect(back).toContainText("Hermes Connect / Repair Shops");
  await expect(back.locator("svg")).toHaveCount(0);
  await expect(back).toHaveCSS("position", "static");
});

test("Hermes Connect Hub no longer sends users into the legacy workspace runtime", async ({ page }) => {
  await page.goto("/services/hermes-connect/");

  await expect(page.locator("[data-hc-product-context]")).toContainText("PRODUCT HUB · CURRENT");
  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);

  const rewritten = page.locator('main a[data-hc-legacy-rewritten="true"]');
  expect(await rewritten.count()).toBeGreaterThan(0);
  expect(await page.locator('main a[data-hc-legacy-rewritten="true"][href="/services/hermes-connect/repair-shops/"]').count()).toBeGreaterThan(0);
  expect(await page.locator('main a[data-hc-legacy-rewritten="true"][href="/services/hermes-connect/repair-shops/auth/"]').count()).toBeGreaterThan(0);
});

test("non-primary Hermes Connect feature pages are visibly classified as demo capabilities", async ({ page }) => {
  await page.goto("/services/hermes-connect/ai-command-center/");

  const context = page.locator("[data-hc-product-context]");
  await expect(context).toContainText("DEMO CAPABILITY · NOT PRIMARY RUNTIME");
  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open current Repair Shop beta" }).first()).toHaveAttribute(
    "href",
    "/services/hermes-connect/repair-shops/",
  );
});

test("Hermes Connect product context remains usable on mobile without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/?lang=uk");

  await expect(page.locator("[data-hc-product-context]")).toContainText("ПОТОЧНА БЕТА · ЖИВИЙ ПІЛОТ");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
