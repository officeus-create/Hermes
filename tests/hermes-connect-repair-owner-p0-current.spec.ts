import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

const owner = { success: true, specialist: { id: "owner-p0", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const shop = {
  id: "shop-p0",
  owner_specialist_id: "owner-p0",
  name: "Apex Auto",
  slug: "apex-auto",
  phone: "+14145550100",
  address_line1: "123 Main St",
  city: "Milwaukee",
  state: "WI",
  postal_code: "53202",
  timezone: "America/Chicago",
};

async function mockOwnerApis(page: import("@playwright/test").Page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (path === "/api/auth/me") return route.fulfill(ok(owner));
    if (path === "/api/repair-shop/profile") return route.fulfill(ok({ success: true, shop }));
    if (path === "/api/services") return route.fulfill(ok({ success: true, services: [] }));
    if (path === "/api/repair-shop/bookings") return route.fulfill(ok({ success: true, bookings: [] }));
    if (path === "/api/repair-shop/feedback") return route.fulfill(ok({ success: true, feedback: [] }));
    if (path === "/api/repair-shop/customers") return route.fulfill(ok({ success: true, customers: [] }));
    if (path === "/api/repair-shop/availability") {
      return route.fulfill(ok({
        success: true,
        timezone: "America/Chicago",
        days: Array.from({ length: 7 }, (_, day_of_week) => ({ day_of_week, is_open: false, start_time: null, end_time: null })),
      }));
    }
    return route.fulfill(ok({ success: true }));
  });
}

test("Repair owner flow preserves the selected locale across owner and booking links", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#open-link-btn")).toHaveAttribute("href", /booking\/\?shop=apex-auto&lang=ru/);
  await expect(page.locator('a[href*="/customers/"]').first()).toHaveAttribute("href", /customers\/?\?lang=ru/);
  await expect(page.locator('a[href*="/availability/"]').first()).toHaveAttribute("href", /availability\/?\?lang=ru/);
});

test("Repair owner surfaces replace raw backend error codes with user-safe copy", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill(ok(owner));
    if (path === "/api/repair-shop/availability") {
      return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, error: "database_not_configured" }) });
    }
    return route.fulfill(ok({ success: true }));
  });

  await page.goto("/services/hermes-connect/repair-shops/availability/?lang=fr", { waitUntil: "domcontentloaded" });
  const alert = page.locator("#availability-alert");
  await expect(alert).toBeVisible();
  await expect(alert).not.toContainText("database_not_configured");
  await expect(alert).toContainText("Impossible de terminer la demande");
});

test("Repair owner mobile controls keep a 44px minimum target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/availability/?lang=uk", { waitUntil: "domcontentloaded" });

  const minHeight = await page.locator("#save-availability-btn").evaluate((node) => getComputedStyle(node).minHeight);
  expect(parseFloat(minHeight)).toBeGreaterThanOrEqual(44);
});
