import { expect, test } from "@playwright/test";

async function mockOwner(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { name: "Pilot Owner", email: "owner@example.com", role: "Shop Owner" } }),
  }));
}

test("Repair Shop private workspace reads as a full CRM app instead of the public website", async ({ page }) => {
  await mockOwner(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/services/hermes-connect/repair-shops/dashboard/");

  const crm = page.locator("[data-repair-crm-shell]");
  await expect(crm).toBeVisible();
  await expect(crm.locator(".repair-crm-topbar")).toBeVisible();
  await expect(crm.locator(".repair-crm-sidebar")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/hc-repair-crm/);
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".hc-product-context")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();

  const frame = await crm.boundingBox();
  expect(frame).not.toBeNull();
  expect(frame!.width).toBeGreaterThanOrEqual(1270);
  expect(frame!.height).toBeGreaterThanOrEqual(890);

  const nav = crm.locator(".repair-crm-nav");
  await expect(nav.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Appointments" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/#bookings-title");
  await expect(nav.getByRole("link", { name: "Customers" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/customers/");
  await expect(nav.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/#services-title");
  await expect(nav.getByRole("link", { name: "Availability" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/availability/");
  await expect(nav.getByRole("link", { name: "Feedback" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/#feedback-title");
  await expect(nav.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/#profile-title");
  await expect(crm.locator(".repair-crm-topbar .repair-crm-logout")).toBeVisible();

  await expect(crm.getByText("Work Orders", { exact: true })).toHaveCount(0);
  await expect(crm.getByText("Analytics", { exact: true })).toHaveCount(0);
  await expect(crm.getByText("Team", { exact: true })).toHaveCount(0);
});

test("Repair Shop CRM keeps the same app navigation and logout on a 390px phone", async ({ page }) => {
  await mockOwner(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/customers/?lang=ru");

  const crm = page.locator("[data-repair-crm-shell]");
  await expect(crm).toBeVisible();
  await expect(crm.locator(".repair-crm-topbar")).toBeVisible();
  const frame = await crm.boundingBox();
  expect(frame).not.toBeNull();
  expect(frame!.width).toBeGreaterThanOrEqual(385);
  expect(frame!.height).toBeGreaterThanOrEqual(839);

  const menu = crm.locator("[data-repair-crm-menu]");
  await expect(menu).toBeVisible();
  await expect(crm.locator(".repair-crm-sidebar")).not.toBeInViewport();
  await expect(crm.locator(".repair-crm-topbar .repair-crm-logout")).toBeHidden();

  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(crm.locator(".repair-crm-sidebar")).toBeInViewport();
  await expect(crm.getByRole("link", { name: "Клиенты" })).toHaveAttribute("aria-current", "page");
  await expect(crm.getByRole("link", { name: "Все продукты" })).toHaveAttribute("href", "/services/hermes-connect/?lang=ru");
  await expect(crm.locator(".repair-crm-mobile-logout")).toBeVisible();
  await expect(crm.locator(".repair-crm-mobile-logout")).toHaveText("Выйти");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
