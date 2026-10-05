import { expect, test } from "@playwright/test";

test("KNB canonical Catalog profile exposes the complete reusable client strategy and correct public paths", async ({ page }) => {
  await page.goto("/businesses/ukraine/bila-tserkva/kons-na-bis/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.getByText("Hermes Catalog · Стратегія клієнта", { exact: true })).toBeVisible();

  const officialProgram = page.getByRole("link", { name: "Перейти до програми", exact: true }).first();
  await expect(officialProgram).toHaveAttribute("href", "https://biznes-club-knb.com/zrostannia-u-biznesi");
  await expect(page.getByRole("link", { name: "Запросити повний аудит Hermes", exact: true })).toHaveAttribute("href", /type=marketing-package/);
  await expect(page.getByRole("link", { name: "Зареєструвати Academy workspace →", exact: true })).toHaveAttribute("href", /\/services\/hermes-connect\/academy\/business\/auth\//);

  const strategy = page.locator('[data-client-strategy="catalog-ua-kons-na-bis-bila-tserkva"]');
  await expect(strategy).toBeVisible();
  await expect(strategy.getByRole("heading", { name: "Повна логіка роботи з клієнтом" })).toBeVisible();
  await expect(strategy).toContainText("Organic Programming");
  await expect(strategy).toContainText("Controlled Paid Learning");
  await expect(strategy).toContainText("Signal Gate");
  await expect(strategy).toContainText("11 блоків стратегії");
  await expect(strategy).toContainText("Instagram / TikTok / YouTube");
  await expect(strategy).toContainText("120 short-form відео на місяць");
  await expect(strategy).toContainText("Reels, Stories і каруселі");
  await expect(strategy).toContainText("10–15 publishing/test actions");
  await expect(strategy).toContainText("2.5–3.5");
  await expect(strategy).toContainText("Meta account status/verification");
  await expect(strategy).toContainText("next_action");
  await expect(strategy).toContainText("outcome");
  await expect(strategy).toContainText("organic_state");
  await expect(strategy).toContainText("audience_geo");
  await expect(strategy).toContainText("Усвідомлення");
  await expect(strategy).toContainText("Unknown ≠ zero");

  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("Hermes Catalog · Client Strategy", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Managed Business Growth Strategy", exact: true })).toBeVisible();
  await expect(strategy.getByRole("heading", { name: "Full client strategy" })).toBeVisible();
  await expect(strategy).toContainText("120 short-form videos per month");
  await expect(page.getByRole("heading", { name: "What has Hermes prepared for KNB?", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register Academy workspace →", exact: true })).toBeVisible();
});
