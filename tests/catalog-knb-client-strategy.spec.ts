import { expect, test } from "@playwright/test";

test("KNB canonical Catalog profile exposes the reusable client strategy", async ({ page }) => {
  await page.goto("/businesses/ukraine/bila-tserkva/kons-na-bis/", { waitUntil: "domcontentloaded" });
  const strategy = page.locator('[data-client-strategy="catalog-ua-kons-na-bis-bila-tserkva"]');
  await expect(strategy).toBeVisible();
  await expect(strategy.getByRole("heading", { name: "Повна логіка роботи з клієнтом" })).toBeVisible();
  await expect(strategy).toContainText("Organic Programming");
  await expect(strategy).toContainText("Controlled Paid Learning");
  await expect(strategy).toContainText("Signal Gate");
  await expect(strategy).toContainText("11 блоків стратегії");
  await expect(strategy).toContainText("Instagram / TikTok / YouTube");
  await expect(strategy).toContainText("source_channel");
  await expect(strategy).toContainText("Усвідомлення");
  await expect(strategy).toContainText("Unknown ≠ zero");
});
