import { expect, test } from "@playwright/test";

const repairRoot = "/services/hermes-connect/repair-shops/";

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
  await expect(family).toContainText("СТО");
  await expect(family).toContainText("ИИ-командный центр");
  await expect(family).not.toContainText("Repair Shops");
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
