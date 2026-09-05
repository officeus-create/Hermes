import { expect, test } from "@playwright/test";

const repairRoot = "/services/hermes-connect/repair-shops/";

test("Product Hub Russian locale translates the shared Hermes Connect module strip", async ({ page }) => {
  await page.goto("/services/hermes-connect/?lang=ru");

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  const family = page.locator(".hc-family-nav");
  await expect(family).toHaveAttribute("aria-label", "Модули Hermes Connect");
  const links = family.locator(":scope > a");
  await expect(links.nth(0)).toHaveText("Центр продуктов");
  await expect(links.nth(1)).toHaveText("СТО");
  await expect(links.nth(2)).toHaveText("Load Board");
  await expect(links.nth(3)).toHaveText("ИИ-командный центр");
  await expect(links.nth(4)).toHaveText("Академия");
  await expect(links.nth(0)).toHaveAttribute("aria-current", "page");
  await expect(family).toContainText("Единый центр сообщений");
  await expect(family).toContainText("Анализатор грузов");
  await expect(family).toContainText("Переговорщик по ставкам");
  await expect(family).toContainText("Конструктор предложений");
  await expect(family).toContainText("Калькулятор ROI");
  await expect(family).toContainText("Автоматизация бизнеса");
  await expect(family).not.toContainText("Product Hub");
  await expect(family).not.toContainText("AI Command Center");
  await expect(family).not.toContainText("Unified Inbox");
  await expect(family).not.toContainText("Load Analyzer");
  await expect(family).not.toContainText("Rate Negotiator");
});

test("Repair Shops Russian locale translates the mobile landing surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${repairRoot}?lang=ru`);

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("[data-language-menu] summary span")).toHaveText("Русский");
  await expect(page.locator(".hc-content-language")).toHaveText("Язык контента: русский");
  await expect(page.locator("[data-hc-english-only]")).toHaveCount(0);

  await expect(page.locator(".repair-live-hero h1")).toHaveText("Дайте клиентам одну ссылку для записи в ваш автосервис.");
  await expect(page.locator(".repair-live-hero .repair-lead")).toContainText("Hermes Connect для СТО помогает независимым автосервисам");
  await expect(page.locator(".repair-live-hero")).not.toContainText("Give customers one link to book your repair shop.");

  const family = page.locator(".hc-family-nav");
  const links = family.locator(":scope > a");
  await expect(links).toHaveCount(5);
  await expect(links.nth(0)).toHaveText("Центр продуктов");
  await expect(links.nth(1)).toHaveText("СТО");
  await expect(links.nth(2)).toHaveText("Load Board");
  await expect(links.nth(3)).toHaveText("ИИ-командный центр");
  await expect(links.nth(4)).toHaveText("Академия");
  await expect(links.nth(1)).toHaveAttribute("aria-current", "page");
  await expect(family).not.toContainText("Repair Shops");
  await expect(family).not.toContainText("Анализатор грузов");
  await expect(family).not.toContainText("Переговорщик по ставкам");
});

test("Repair Shop family navigation stays task-focused in English", async ({ page }) => {
  await page.goto(repairRoot);

  const family = page.locator(".hc-family-nav");
  const links = family.locator(":scope > a");
  await expect(links).toHaveCount(5);
  await expect(links.nth(0)).toHaveText("Product Hub");
  await expect(links.nth(1)).toHaveText("Repair Shops");
  await expect(links.nth(2)).toHaveText("Load Board");
  await expect(links.nth(3)).toHaveText("AI Command Center");
  await expect(links.nth(4)).toHaveText("Academy");
  await expect(links.nth(1)).toHaveAttribute("aria-current", "page");
  await expect(family).not.toContainText("Unified Inbox");
  await expect(family).not.toContainText("Load Analyzer");
  await expect(family).not.toContainText("Rate Negotiator");
});

test("Russian locale reaches the repair-shop authentication flow", async ({ page }) => {
  await page.goto(`${repairRoot}auth/?lang=ru`);

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("[data-hc-english-only]")).toHaveCount(0);
  await expect(page.locator("#auth-forms h1")).toHaveText("Доступ владельца СТО");
  await expect(page.locator('[data-tab="login"]')).toHaveText("Войти");
  await expect(page.locator('[data-tab="register"]')).toHaveText("Зарегистрировать СТО");
  await expect(page.locator('label[for="login-password"]')).toHaveText("Пароль");
});

test("Russian locale translates the Founding Shop plan surface", async ({ page }) => {
  await page.goto(`${repairRoot}plan/?lang=ru`);

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("[data-hc-english-only]")).toHaveCount(0);
  await expect(page.locator(".plan-page .hero h1")).toHaveText("Активируйте Hermes Connect для своего СТО.");
  await expect(page.locator("#activate-title")).toHaveText("Запросить тариф Founding Shop за $99 в месяц.");
  await expect(page.locator("#paid-plan-form")).toContainText("Название СТО");
  await expect(page.locator("#paid-plan-form")).not.toContainText("Repair shop name");
});

test("Russian locale translates the public booking labels and missing-shop state", async ({ page }) => {
  await page.goto(`${repairRoot}booking/?lang=ru`);

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("[data-hc-english-only]")).toHaveCount(0);
  await expect(page.locator(".booking-page .hero .eyebrow")).toHaveText("Hermes Connect · публичная запись");
  await expect(page.locator("#shop-title")).toHaveText("Загружаем СТО…");
  await expect(page.locator("#page-alert")).toContainText("В ссылке отсутствует идентификатор СТО");
});
