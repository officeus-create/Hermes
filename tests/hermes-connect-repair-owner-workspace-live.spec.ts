import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-1", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const shop = { id: "shop-1", slug: "apex-auto", name: "Apex Auto", phone: "+14145550100", address_line1: "123 Main St", city: "Milwaukee", state: "WI", postal_code: "53202", timezone: "America/Chicago" };
const emptyAvailability = Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, is_open: false, start_time: null, end_time: null }));

async function mockDashboard(page: any) {
  let services = [{ id: "svc-existing", name: "Tire rotation", duration_minutes: 30, owner_specialist_id: "owner-1" }];
  await page.route("**/api/auth/me", (route: any) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill(ok({ success: true, shop })));
  await page.route("**/api/repair-shop/access", (route: any) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route: any) => route.fulfill(ok({ success: true, timezone: "America/Chicago", days: emptyAvailability })));
  await page.route("**/api/services", async (route: any) => {
    if (route.request().method() === "POST") {
      const input = route.request().postDataJSON();
      const service = { id: `svc-${services.length + 1}`, name: input.name, duration_minutes: input.duration_minutes, owner_specialist_id: "owner-1" };
      services = [...services, service];
      return route.fulfill(ok({ success: true, service }));
    }
    return route.fulfill(ok({ success: true, services }));
  });
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill(ok({ success: true, bookings: [{ id: "booking-1", service_name: "Diagnostics", duration_minutes: 45, appointment_date: "2026-08-18", start_time: "09:00", end_time: "09:45", status: "completed", client_name: "Jamie Driver", client_email: "jamie@example.com", client_phone: "+14145550111", vehicle: { year: 2022, make: "Ford", model: "F-150", mileage: 50000, vin: null }, history: [{ id: "h-1", booking_id: "booking-1", from_status: "in_progress", to_status: "completed", changed_at: "2026-08-17T12:00:00Z" }] }] })));
  await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(ok({ success: true, feedback: [] })));
}

async function expectNoPageOverflow(page: any) {
  const result = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(result.scrollWidth, JSON.stringify(result)).toBeLessThanOrEqual(result.width + 1);
}

test.describe("approved Repair Shop Owner OS wired to live dashboard", () => {
  test("desktop derives owner overview from existing live dashboard state and preserves service actions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await mockDashboard(page);
    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

    await expect(page.locator('[data-hc-owner-workspace="live"]')).toBeVisible();
    await expect(page.locator(".hc-owner-live-sidebar")).toBeVisible();
    await expect(page.locator(".hc-owner-live-mobilebar")).toBeHidden();
    await expect(page.locator("[data-hc-owner-greeting]")).toContainText("Alex Owner");
    await expect(page.locator("[data-hc-owner-shop-name]")).toHaveText("Apex Auto");
    await expect(page.locator("[data-hc-owner-location]")).toHaveText("Milwaukee, WI");

    await expect(page.locator("[data-hc-metric-bookings]")).toHaveText("1");
    await expect(page.locator("[data-hc-metric-services]")).toHaveText("1");
    await expect(page.locator("[data-hc-metric-public]")).toHaveText("Ready");
    await expect(page.locator("[data-hc-metric-completed]")).toHaveText("1");
    await expect(page.locator("[data-hc-growth-completed]")).toHaveText("1");
    await expect(page.locator("[data-hc-focus-list]")).toContainText("Shop profile is saved");
    await expect(page.locator("[data-hc-focus-list]")).toContainText("1 service live");
    await expect(page.locator("[data-hc-focus-list]")).toContainText("Review 1 booking");
    await expect(page.locator("[data-hc-intelligence-title]")).toContainText("1 real booking");

    const nav = page.locator(".hc-owner-live-nav");
    await expect(nav).toContainText("Overview");
    await expect(nav).toContainText("Bookings");
    await expect(nav).toContainText("Calendar");
    await expect(nav).toContainText("Customers");
    await expect(nav).toContainText("Services");
    await expect(nav).toContainText("Growth");
    await expect(nav).toContainText("Hermes Intelligence");
    await expect(nav).toContainText("Settings");
    await expect(nav).not.toContainText("Finance");
    await expect(nav).not.toContainText("Academy");
    await expect(nav).not.toContainText("Sales");

    await page.locator("#service-name").fill("Oil change");
    await page.locator("#service-duration").selectOption("60");
    await page.locator("#add-service-btn").click();
    await expect(page.locator("#service-count")).toContainText("2 services");
    await expect(page.locator("[data-hc-metric-services]")).toHaveText("2");
    await expect(page.locator("[data-hc-nav-services]")).toHaveText("2");

    await expect(page.locator(".hc-owner-live-overview")).not.toContainText("Representative data");
    await expectNoPageOverflow(page);
  });

  test("390px uses the approved mobile task shell and preserves real dashboard forms", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockDashboard(page);
    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

    await expect(page.locator('[data-hc-owner-workspace="live"]')).toBeVisible();
    await expect(page.locator(".hc-owner-live-sidebar")).toBeHidden();
    await expect(page.locator(".hc-owner-live-mobilebar")).toBeVisible();
    await expect(page.locator(".hc-owner-live-mobile-nav")).toBeVisible();
    await expect(page.locator(".hc-owner-live-mobile-nav")).toContainText("Overview");
    await expect(page.locator(".hc-owner-live-mobile-nav")).toContainText("Bookings");
    await expect(page.locator(".hc-owner-live-mobile-nav")).toContainText("Calendar");
    await expect(page.locator(".hc-owner-live-mobile-nav")).toContainText("Customers");
    await expect(page.locator(".hc-owner-live-mobile-nav")).toContainText("Services");
    await expect(page.locator("[data-hc-metric-services]")).toHaveText("1");
    await expect(page.locator("#profile-form")).toBeVisible();
    await expect(page.locator("#service-form")).toBeVisible();
    await expect(page.locator("#bookings-list")).toBeVisible();
    await expectNoPageOverflow(page);
  });
});