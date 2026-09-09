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
    if (path === "/api/repair-shop/staff") return route.fulfill(json({ success: true, staff: [] }));
    if (path === "/api/repair-shop/availability") return route.fulfill(json({ success: true, timezone: "America/Chicago", days: Array.from({ length: 7 }, (_, day_of_week) => ({ day_of_week, is_open: false, start_time: null, end_time: null })) }));
    return route.fulfill(json({ success: true }));
  });
}

test("Repair Shop CRM navigation is one localized context across the private workspace", async ({ page }) => {
  await mockRepairOwner(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  const shell = page.locator("[data-repair-crm-shell]");
  const sidebar = shell.locator(".repair-crm-sidebar");
  await expect(shell).toBeAttached();
  await expect(sidebar).toHaveAttribute("aria-label", "СТО CRM");
  await expect(sidebar.getByRole("link", { name: "Обзор" })).toHaveAttribute("aria-current", "page");
  await expect(sidebar.getByRole("link", { name: "График" })).toHaveAttribute("href", /schedule\/\?lang=ru$/);
  await expect(sidebar.getByRole("link", { name: "Команда" })).toHaveAttribute("href", /team\/\?lang=ru$/);
  await expect(sidebar.getByRole("link", { name: "Компания" })).toHaveAttribute("href", /company\/\?lang=ru$/);
  await expect(sidebar.getByRole("link", { name: "Настройки" })).toHaveAttribute("href", /preferences\/\?lang=ru$/);
  await expect(shell.getByRole("link", { name: "Все продукты" })).toHaveAttribute("href", /services\/hermes-connect\/\?lang=ru$/);
});

test("Repair Shop CRM navigation marks the current section without inventing a second workspace", async ({ page }) => {
  await mockRepairOwner(page);
  await page.goto("/services/hermes-connect/repair-shops/customers/?lang=fr", { waitUntil: "domcontentloaded" });

  const shell = page.locator("[data-repair-crm-shell]");
  const sidebar = shell.locator(".repair-crm-sidebar");
  await expect(shell).toBeAttached();
  await expect(sidebar.getByRole("link", { name: "Clients" })).toHaveAttribute("aria-current", "page");
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1);
});

test("Repair Shop CRM mobile navigation stays usable at 390px without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRepairOwner(page);
  await page.goto("/services/hermes-connect/repair-shops/schedule/?lang=uk", { waitUntil: "domcontentloaded" });

  const shell = page.locator("[data-repair-crm-shell]");
  const menu = shell.locator("[data-repair-crm-menu]");
  const bottomNav = shell.locator(".repair-crm-mobile-quick");
  await expect(shell).toBeAttached();
  await expect(menu).toBeVisible();
  await expect(bottomNav).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Графік" })).toHaveAttribute("aria-current", "page");

  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  const schedule = shell.locator(".repair-crm-sidebar").getByRole("link", { name: "Графік" });
  await expect(schedule).toBeVisible();
  await expect(schedule).toHaveAttribute("aria-current", "page");
  const minHeight = await schedule.evaluate((node) => parseFloat(getComputedStyle(node).minHeight));
  expect(minHeight).toBeGreaterThanOrEqual(44);
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(pageOverflow).toBe(false);
});