import { expect, test } from "@playwright/test";

const demo = "/services/hermes-connect/repair-shops/customers/?demo=1&lang=ru";

test.describe("Repair Shop local demonstration mode", () => {
  test("renders a complete synthetic Russian workspace without a real session", async ({ page }) => {
    await page.goto(demo, { waitUntil: "domcontentloaded" });

    await expect(page.getByText("LOCAL DEMO · synthetic data")).toBeVisible();
    await expect(page.locator("#customer-count")).toHaveText("12 клиентов");
    await expect(page.getByRole("button", { name: "Открыть клиента" }).first()).toBeVisible();
    await expect(page.locator(".customer-card")).toHaveCount(12);

    const menu = page.locator("[data-repair-crm-menu]");
    if (await menu.isVisible()) await menu.click();
    await page.getByRole("link", { name: "График" }).click();
    await expect(page).toHaveURL(/availability\/\?lang=ru&demo=1/);
    await expect(page.getByRole("button", { name: "Сохранить недельный график" })).toBeVisible();
    await expect(page.locator('input[type="time"]')).toHaveCount(14);
  });

  test("does not activate synthetic data without the explicit local demo flag", async ({ page }) => {
    await page.goto("/services/hermes-connect/repair-shops/customers/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-local-demo-badge]")).toHaveCount(0);
  });
});
