import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

const shop = {
  id: "shop-a11y",
  slug: "a11y-auto",
  name: "A11y Auto Care",
  phone: "+14145550100",
  address_line1: "100 Test Way",
  city: "Milwaukee",
  state: "WI",
  postal_code: "53202",
  timezone: "America/Chicago",
};

const availability = Array.from({ length: 7 }, (_, day_of_week) => ({
  day_of_week,
  is_open: true,
  start_time: "09:00",
  end_time: "17:00",
}));

test("public booking announces dynamic slot-state updates without changing the booking flow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/public/repair-shop?slug=a11y-auto", (route) => route.fulfill(ok({
    success: true,
    shop,
    services: [{ id: "svc-a11y", name: "Brake inspection", duration_minutes: 60 }],
    availability,
  })));
  await page.route("**/api/public/repair-booking?shop=a11y-auto&date=*", (route) => route.fulfill(ok({
    success: true,
    shop: { id: shop.id, slug: shop.slug, timezone: shop.timezone },
    date: new URL(route.request().url()).searchParams.get("date"),
    busy: [],
  })));

  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=a11y-auto");
  const slotState = page.locator("#slot-state");
  await expect(slotState).toHaveAttribute("role", "status");
  await expect(slotState).toHaveAttribute("aria-live", "polite");
  await expect(slotState).toHaveAttribute("aria-atomic", "true");

  await page.locator("#service-select").selectOption("svc-a11y");
  const date = await page.locator("#date-select option").nth(1).getAttribute("value");
  expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await page.locator("#date-select").selectOption(date!);
  await expect(slotState).toContainText("live");
  await expect(slotState).toHaveAttribute("role", "status");
  await expect(slotState).toHaveAttribute("aria-live", "polite");
});

test("Repair Shop capability cards guarantee 44px touch targets at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const owner = { success: true, specialist: { id: "owner-a11y", name: "A11y Owner", email: "owner@example.com", role: "Shop Owner" } };

  await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success: true, shop })));
  await page.route("**/api/repair-shop/access", (route) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(ok({ success: true, timezone: shop.timezone, days: availability })));
  await page.route("**/api/services", (route) => route.fulfill(ok({ success: true, services: [] })));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success: true, feedback: [] })));
  await page.route("**/api/repair-shop/capabilities", (route) => route.fulfill(ok({
    success: true,
    capabilities: {
      shop_id: shop.id,
      vehicle_types: ["passenger_light"],
      fleet_service: false,
      mobile_roadside: false,
      emergency_24_7: false,
      parallel_booking_capacity: 1,
      updated_at: null,
    },
  })));

  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-repair-capabilities]");
  await expect(panel).toBeVisible();
  const options = panel.locator(".hc-capability-option");
  await expect(options).toHaveCount(9);

  const geometry = await options.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { left: rect.left, right: rect.right, height: rect.height };
  }));
  for (const option of geometry) {
    expect(option.height).toBeGreaterThanOrEqual(44);
    expect(option.left).toBeGreaterThanOrEqual(0);
    expect(option.right).toBeLessThanOrEqual(390);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
