import { expect, test } from "@playwright/test";

const json = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

async function mockRepairOwner(page: import("@playwright/test").Page) {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill(json({ success: true, specialist: { id: "owner-nav", name: "Owner", email: "owner@example.com", role: "Shop Owner" } }));
    if (path === "/api/hermes-connect/account") return route.fulfill(json({ success: true, identity: { name: "Owner", email: "owner@example.com" }, businesses: [], workspaces: [] }));
    if (path === "/api/repair-shop/profile") return route.fulfill(json({ success: true, shop: { id: "shop-nav", name: "Apex Auto", slug: "apex-auto", city: "Milwaukee", state: "WI", timezone: "America/Chicago" } }));
    if (path === "/api/services") return route.fulfill(json({ success: true, services: [] }));
    if (path === "/api/repair-shop/bookings") return route.fulfill(json({ success: true, bookings: [] }));
    if (path === "/api/repair-shop/feedback") return route.fulfill(json({ success: true, feedback: [] }));
    if (path === "/api/repair-shop/customers") return route.fulfill(json({ success: true, customers: [] }));
    if (path === "/api/repair-shop/availability") return route.fulfill(json({ success: true, timezone: "America/Chicago", days: Array.from({ length: 7 }, (_, day_of_week) => ({ day_of_week, is_open: false, start_time: null, end_time: null })) }));
    return route.fulfill(json({ success: true }));
  });
}

test("Repair Shop owner nav is one localized context across the private workspace", async ({ page }) => {
  await mockRepairOwner(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  const nav = page.locator("[data-repair-owner-nav]");
  await expect(nav).toBeVisible();
  await expect(nav).toHaveAttribute("aria-label", "Навигация кабинета СТО");
  await expect(nav.locator('[data-owner-nav-item="dashboard"]')).toHaveText("Главная");
  await expect(nav.locator('[data-owner-nav-item="availability"]')).toHaveText("Доступность");
  await expect(nav.locator('[data-owner-nav-item="customers"]')).toHaveText("Клиенты");
  await expect(nav.locator('[data-owner-nav-item="repairShops"]')).toHaveText("СТО");
  await expect(nav.locator('[data-owner-nav-item="dashboard"]')).toHaveAttribute("aria-current", "page");
  await expect(nav.locator('[data-owner-nav-item="availability"]')).toHaveAttribute("href", /availability\/\?lang=ru$/);
  await expect(nav.locator('[data-owner-nav-item="customers"]')).toHaveAttribute("href", /customers\/\?lang=ru$/);
  await expect(nav.locator('[data-owner-nav-item="repairShops"]')).toHaveAttribute("href", /repair-shops\/\?lang=ru$/);
});

test("Repair Shop owner nav marks the current section without inventing a second workspace", async ({ page }) => {
  await mockRepairOwner(page);
  await page.goto("/services/hermes-connect/repair-shops/customers/?lang=fr", { waitUntil: "domcontentloaded" });

  const nav = page.locator("[data-repair-owner-nav]");
  await expect(nav).toBeVisible();
  await expect(nav.locator('[data-owner-nav-item="customers"]')).toHaveText("Clients");
  await expect(nav.locator('[data-owner-nav-item="customers"]')).toHaveAttribute("aria-current", "page");
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
});

test("Repair Shop owner nav stays usable at 390px without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRepairOwner(page);
  await page.goto("/services/hermes-connect/repair-shops/availability/?lang=uk", { waitUntil: "domcontentloaded" });

  const nav = page.locator("[data-repair-owner-nav]");
  await expect(nav).toBeVisible();
  await expect(nav.locator('[data-owner-nav-item="availability"]')).toHaveText("Доступність");
  const minHeight = await nav.locator("a").first().evaluate((node) => parseFloat(getComputedStyle(node).minHeight));
  expect(minHeight).toBeGreaterThanOrEqual(44);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(pageOverflow).toBe(false);
});
