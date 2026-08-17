import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-1", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const shop = { id: "shop-1", slug: "apex-auto", name: "Apex Auto", phone: "+14145550100", address_line1: "123 Main St", city: "Milwaukee", state: "WI", postal_code: "53202", timezone: "America/Chicago" };
const days = Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, is_open: day >= 1 && day <= 5, start_time: day >= 1 && day <= 5 ? "08:00" : null, end_time: day >= 1 && day <= 5 ? "17:00" : null }));

test("owner configures multilingual shop capabilities without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let savedBody: any = null;

  await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success: true, shop })));
  await page.route("**/api/repair-shop/access", (route) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(ok({ success: true, timezone: "America/Chicago", days })));
  await page.route("**/api/services", (route) => route.fulfill(ok({ success: true, services: [] })));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success: true, feedback: [] })));
  await page.route("**/api/repair-shop/capabilities", async (route) => {
    if (route.request().method() === "PUT") {
      savedBody = route.request().postDataJSON();
      return route.fulfill(ok({ success: true, capabilities: { shop_id: "shop-1", ...savedBody, parallel_booking_capacity: 1, updated_at: "2026-08-17T12:00:00Z" } }));
    }
    return route.fulfill(ok({ success: true, capabilities: { shop_id: "shop-1", vehicle_types: ["passenger_light"], fleet_service: false, mobile_roadside: false, emergency_24_7: false, parallel_booking_capacity: 1, updated_at: null } }));
  });

  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-repair-capabilities]");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Транспорт и возможности СТО" })).toBeVisible();
  await expect(panel.getByText("Коммерческие грузовики")).toBeVisible();

  await panel.locator('[data-capability-vehicle][value="commercial_truck"]').check();
  await panel.locator('[data-capability-flag="fleet_service"]').check();
  await panel.locator('[data-capability-flag="mobile_roadside"]').check();
  await panel.locator('[data-capability-flag="emergency_24_7"]').check();
  await panel.getByRole("button", { name: "Сохранить возможности" }).click();

  await expect.poll(() => savedBody).not.toBeNull();
  expect(savedBody).toEqual({
    vehicle_types: ["passenger_light", "commercial_truck"],
    fleet_service: true,
    mobile_roadside: true,
    emergency_24_7: true,
  });
  await expect(panel.locator("[data-capability-status]")).toContainText("Возможности СТО сохранены");

  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});

test("public booking shows only configured shop capabilities", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const publicPayload = {
    success: true,
    shop,
    services: [{ id: "svc-1", name: "Truck diagnostics", duration_minutes: 45 }],
    availability: days,
    capabilities: {
      vehicle_types: ["commercial_truck", "trailer"],
      fleet_service: true,
      mobile_roadside: true,
      emergency_24_7: false,
    },
  };
  await page.route("**/api/public/repair-shop?*", (route) => route.fulfill(ok(publicPayload)));

  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=apex-auto&lang=ru", { waitUntil: "domcontentloaded" });
  const capabilities = page.locator("[data-public-shop-capabilities]");
  await expect(capabilities).toBeVisible();
  await expect(capabilities).toContainText("Коммерческие грузовики");
  await expect(capabilities).toContainText("Прицепы");
  await expect(capabilities).toContainText("Fleet и корпоративные клиенты");
  await expect(capabilities).toContainText("Мобильный / roadside сервис");
  await expect(capabilities).not.toContainText("Экстренный roadside 24/7");

  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});