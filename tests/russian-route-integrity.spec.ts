import { expect, test } from "@playwright/test";

test.describe("Russian route integrity", () => {
  test("Russian homepage keeps Russian when entering Hermes Connect", async ({ page }) => {
    await page.goto("/ru/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator("[data-language-menu] summary span")).toHaveText("Русский");
    await expect(page.locator(".site-header .wordmark")).toHaveAttribute("href", "/ru/#top");

    // Hermes Connect lives in Products: the desktop dropdown or the opened mobile menu.
    const desktopProducts = page.locator(".desktop-nav .desktop-products-menu");
    let connect = desktopProducts.locator('a[data-product="connect"]');

    if (await desktopProducts.locator("summary").isVisible()) {
      await desktopProducts.locator("summary").click();
    } else {
      await page.locator("[data-menu-button]").click();
      await expect(page.locator("[data-mobile-menu]")).toBeVisible();
      // Products is the canonical mobile secondary navigation; keep the selected language.
      const products = page.locator("#mobile-menu .mobile-products-menu");
      await products.locator("summary").click();
      connect = products.locator('a[data-product="connect"]');
    }

    await expect(connect).toBeVisible();
    await expect(connect).toHaveAttribute("href", /\/services\/hermes-connect\/\?lang=ru$/);
    await connect.click();

    await expect(page).toHaveURL(/\/services\/hermes-connect\/\?lang=ru$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator(".hc-copy h1")).toContainText("Управляйте бизнесом");
    await expect(page.locator(".site-header .wordmark")).toHaveAttribute("href", "/ru/#top");

    // Product Hub owns discovery first; the live Repair product remains available from the Hub with locale preserved.
    const repairEntry = page.locator('main a[href="/services/hermes-connect/repair-shops/?lang=ru"]').first();
    await expect(repairEntry).toBeVisible();
    await expect(repairEntry).toContainText(/СТО|автосервис|Repair/i);

    await expect(page.locator(".site-footer")).toContainText("Выбрать направление обращения");
    await expect(page.locator(".site-footer")).toContainText("Открыть центр Hermes Connect");
    await expect(page.locator('.site-footer a[href="/ru/privacy/"]')).toContainText("Конфиденциальность");
  });

  test("Russian business growth hub keeps a Russian shell and form UI", async ({ page }) => {
    await page.goto("/ru/business-growth/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator(".desktop-nav")).toContainText("Логистика");
    await expect(page.locator(".desktop-nav")).toContainText("Маркетинг");
    await expect(page.locator(".site-footer")).toContainText("Выбрать направление обращения");
    await expect(page.locator(".footer-location")).toHaveText("Логистика в США · международная координация по электронной почте");

    const budgets = page.locator('select[name="planning_budget"] option');
    await expect(budgets.first()).toHaveText("Пока не определён");
    await expect(budgets.nth(1)).toHaveText("До $1 000");

    const horizons = page.locator('select[name="planning_horizon"] option');
    await expect(horizons.first()).toHaveText("Пока не определён");
    await expect(horizons.nth(1)).toHaveText("3 месяца");

    await expect(page.locator('input[name="telegram"]')).toHaveAttribute("placeholder", "@username или t.me/...");
    await expect(page.getByRole("link", { name: "Политика конфиденциальности" })).toHaveAttribute("href", "/ru/privacy/");
  });

  test("all Russian paid-search service pages retain Russian navigation", async ({ page }) => {
    for (const slug of ["website", "seo", "advertising", "social-media", "ai-automation"]) {
      await page.goto(`/ru/business-growth/${slug}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", "ru");
      await expect(page.locator("[data-language-menu] summary span")).toHaveText("Русский");
      await expect(page.locator(".site-header .wordmark")).toHaveAttribute("href", "/ru/#top");
      await expect(page.locator('.desktop-products-menu a[data-product="connect"]')).toHaveAttribute("href", /\?lang=ru$/);
      await expect(page.getByRole("link", { name: "Политика конфиденциальности" })).toHaveAttribute("href", "/ru/privacy/");
    }
  });

  test("Russian privacy notice is a real localized destination", async ({ page }) => {
    await page.goto("/ru/privacy/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Политика конфиденциальности");
    await expect(page.getByRole("link", { name: "Главная" })).toHaveAttribute("href", "/ru/");
    await expect(page.locator(".site-header .wordmark")).toHaveAttribute("href", "/ru/#top");
    await expect(page.locator(".site-footer")).toContainText("Конфиденциальность");
    const structuredData = page.locator('script[type="application/ld+json"]');
    await expect(structuredData).toHaveCount(2);
    const jsonLd = await structuredData.evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent || "{}")));
    expect(jsonLd.some((item) => item["@type"] === "WebPage" && item.url === "https://hermeslogisticsus.com/ru/privacy/" && item.inLanguage === "ru")).toBeTruthy();
    expect(jsonLd.some((item) => item["@type"] === "BreadcrumbList")).toBeTruthy();
  });
});
