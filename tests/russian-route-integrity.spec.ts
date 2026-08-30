import { expect, test } from "@playwright/test";

test.describe("Russian route integrity", () => {
  test("Russian homepage keeps Russian when entering Hermes Connect", async ({ page }) => {
    await page.goto("/ru/");

    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator("[data-language-menu] summary span")).toHaveText("Русский");
    await expect(page.locator(".site-header .wordmark")).toHaveAttribute("href", "/ru/#top");

    const connect = page.locator('[data-hermes-connect-launcher="header"]');
    await expect(connect).toHaveAttribute("href", /\/services\/hermes-connect\/repair-shops\/\?lang=ru$/);
    await connect.click();

    await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/\?lang=ru$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator(".repair-live-hero h1")).toHaveText("Дайте клиентам одну ссылку для записи в ваш автосервис.");
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
      await expect(page.locator('[data-hermes-connect-launcher="header"]')).toHaveAttribute("href", /\?lang=ru$/);
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
  });
});