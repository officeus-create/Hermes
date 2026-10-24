import { expect, test } from "@playwright/test";

test.describe("Hermes Investor Relations bilingual public preview", () => {
  for (const locale of [
    { path: "/investors/", lang: "en", title: /Real operations/ },
    { path: "/ru/investors/", lang: "ru", title: /Реальный бизнес/ },
  ]) {
    test(`${locale.lang}: real investor narrative, internal links, privacy and viewport`, async ({ page }) => {
      const response = await page.goto(locale.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(locale.title);
      await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/investors\/$/);
      await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute("href", /\/ru\/investors\/$/);
      await expect(page.locator("main .investor-card")).toHaveCount(7);
      await expect(page.locator("main .investor-ladder > li")).toHaveCount(5);
      await expect(page.locator('main [data-investor-ladder-step="asset"]')).toBeVisible();
      const publicLinks = await page.locator(".investor-card .investor-explore").count();
      expect(publicLinks).toBe(7);
      const hrefs = await page.locator(".investor-card .investor-explore").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(hrefs).toEqual([
        "/paths/logistics/",
        "/load-board/",
        "/services/hermes-connect/",
        "/paths/marketing/",
        "/paths/academy/",
        "/paths/technology/",
        "/businesses/",
      ]);
      const body = await page.locator("main").innerText();
      expect(body).not.toMatch(/\$\s*1,?000,?000\s*(?:raised|revenue)/i);
      await expect(page.locator('main a[href^="mailto:officeus@hermeslogisticsus.com"]').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    });
  }
  test("English/Russian navigation is discoverable without browser translations", async ({ page }) => {
    await page.goto("/investors/");
    await page.locator('.investor-languages a[href="/ru/investors/"]').click();
    await expect(page).toHaveURL(/\/ru\/investors\/$/);
    await expect(page.getByRole("heading", { name: /Реальный бизнес/ })).toBeVisible();
    await page.locator('.investor-languages a[href="/investors/"]').click();
    await expect(page).toHaveURL(/\/investors\/$/);
  });
});
