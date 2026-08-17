import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-1", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const shop = { id: "shop-1", slug: "apex-auto", name: "Apex Auto", phone: "+14145550100", address_line1: "123 Main St", city: "Milwaukee", state: "WI", postal_code: "53202", timezone: "America/Chicago" };
const emptyAvailability = Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, is_open: false, start_time: null, end_time: null }));
const capabilities = { shop_id: "shop-1", vehicle_types: ["passenger_light"], fleet_service: false, mobile_roadside: false, emergency_24_7: false, parallel_booking_capacity: 2, updated_at: null };

test("owner can set real simultaneous-job capacity at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let savedCapacity: any = null;

  await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success: true, shop })));
  await page.route("**/api/repair-shop/access", (route) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(ok({ success: true, timezone: "America/Chicago", days: emptyAvailability })));
  await page.route("**/api/services", (route) => route.fulfill(ok({ success: true, services: [] })));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success: true, feedback: [] })));
  await page.route("**/api/repair-shop/capabilities", (route) => route.fulfill(ok({ success: true, capabilities })));
  await page.route("**/api/repair-shop/capacity", async (route) => {
    savedCapacity = route.request().postDataJSON();
    return route.fulfill(ok({ success: true, capabilities: { ...capabilities, parallel_booking_capacity: savedCapacity.parallel_booking_capacity } }));
  });

  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });
  const control = page.locator("[data-repair-capacity-control]");
  await expect(control).toBeVisible();
  await expect(control.getByText("Параллельная загрузка СТО")).toBeVisible();
  const select = control.locator("[data-capacity-select]");
  await expect(select).toHaveValue("2");
  await select.selectOption("3");
  await control.getByRole("button", { name: "Сохранить загрузку" }).click();

  await expect.poll(() => savedCapacity).not.toBeNull();
  expect(savedCapacity).toEqual({ parallel_booking_capacity: 3 });
  await expect(control.locator("[data-capacity-status]")).toContainText("Параллельная загрузка сохранена");

  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});