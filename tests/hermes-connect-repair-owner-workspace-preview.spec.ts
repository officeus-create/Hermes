import { expect, test } from "@playwright/test";

const route = "/services/hermes-connect/repair-shops/workspace-preview/";

const expectNoHorizontalOverflow = async (page: any) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
};

test.describe("Hermes Connect Repair Shop owner workspace CEO preview", () => {
  test("desktop keeps the canonical Repair Shop information architecture", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(route);

    await expect(page.locator(".hc-owner-preview__truth")).toContainText("CEO PREVIEW");
    await expect(page.locator(".hc-owner-topbar h1")).toContainText("Владимир");
    await expect(page.locator(".hc-owner-sidebar")).toBeVisible();
    await expect(page.locator(".hc-owner-mobilebar")).toBeHidden();

    const nav = page.locator(".hc-owner-nav");
    await expect(nav).toContainText("Обзор");
    await expect(nav).toContainText("Записи");
    await expect(nav).toContainText("Календарь");
    await expect(nav).toContainText("Клиенты");
    await expect(nav).toContainText("Услуги");
    await expect(nav).toContainText("Рост");
    await expect(nav).toContainText("Hermes Intelligence");
    await expect(nav).toContainText("Настройки");
    await expect(nav).not.toContainText("Finance");
    await expect(nav).not.toContainText("Academy");
    await expect(nav).not.toContainText("Sales");

    await expect(page.getByText("Representative data", { exact: true })).toBeVisible();
    await expect(page.getByText("Recommendation only", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Текущий рабочий кабинет/ })).toHaveAttribute("href", /hermeslogisticsus\.com\/services\/hermes-connect\/repair-shops\/dashboard/);
    await expectNoHorizontalOverflow(page);
  });

  test("mobile uses a dedicated task navigation without squeezing the desktop sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);

    await expect(page.locator(".hc-owner-sidebar")).toBeHidden();
    await expect(page.locator(".hc-owner-mobilebar")).toBeVisible();
    await expect(page.locator(".hc-owner-mobile-nav")).toBeVisible();
    await expect(page.locator(".hc-owner-mobile-nav")).toContainText("Обзор");
    await expect(page.locator(".hc-owner-mobile-nav")).toContainText("Записи");
    await expect(page.locator(".hc-owner-mobile-nav")).toContainText("Календарь");
    await expect(page.locator(".hc-owner-mobile-nav")).toContainText("Клиенты");
    await expect(page.locator(".hc-owner-mobile-nav")).toContainText("Услуги");
    await expect(page.locator(".hc-owner-intelligence-card h2")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
