import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const shop = {
  id: "shop-driver-benefit-1",
  slug: "driver-benefit-garage",
  name: "Driver Benefit Garage",
  phone: "+15015550123",
  address_line1: "100 Main St",
  city: "Little Rock",
  state: "AR",
  postal_code: "72201",
  timezone: "America/Chicago",
};

const services = [
  { id: "svc-diagnostics", name: "Диагностика", duration_minutes: 30 },
  { id: "svc-oil", name: "Замена масла", duration_minutes: 45 },
  { id: "svc-brakes", name: "Тормозная система", duration_minutes: 60 },
];

test("repair shop owner can publish a scoped Hermes Connect driver discount", async ({ page }) => {
  let savedBody: any = null;

  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json({
    success: true,
    identity: { id: "owner-driver-benefit", name: "Shop Owner", email: "owner@example.com", role: "Shop Owner" },
    owned_businesses: [{ key: "repair_shop", kind: "owned_business", id: shop.id, name: shop.name, slug: shop.slug, href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" }],
    workspaces: [],
    capabilities: { internal_ai: false, hr_review: false },
  })));
  await page.route("**/api/auth/me", (route) => route.fulfill(json({ success: true, specialist: { id: "owner-driver-benefit", name: "Shop Owner", email: "owner@example.com", role: "Shop Owner" } })));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(json({ success: true, shop })));
  await page.route("**/api/services", (route) => route.fulfill(json({ success: true, context: { id: "ctx-repair", vertical_key: "repair_shop" }, services })));
  await page.route("**/api/repair-shop/capabilities", (route) => route.fulfill(json({ success: true, capabilities: { vehicle_types: ["commercial_truck"], fleet_service: true, mobile_roadside: false, emergency_24_7: false } })));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(json({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(json({ success: true, feedback: [] })));
  await page.route("**/api/repair-shop/driver-discount", async (route) => {
    if (route.request().method() === "PUT") {
      savedBody = route.request().postDataJSON();
      return route.fulfill(json({ success: true, discount: { ...savedBody, shop_id: shop.id } }));
    }
    return route.fulfill(json({
      success: true,
      discount: {
        shop_id: shop.id,
        enabled: false,
        service_discount_percent: 0,
        service_scope: "all",
        service_ids: [],
        materials_discount_percent: 0,
        materials_scope: "all",
        materials_items: [],
      },
    }));
  });

  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  const panel = page.locator("[data-driver-discount-owner]");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Скидка для водителей Hermes Connect");
  await expect(panel.locator(".hc-driver-discount-dollar")).toHaveText("$");

  await panel.locator("[data-discount-enabled]").check();
  await panel.locator("[data-service-percent]").fill("15");
  await panel.locator('input[name="hc-service-scope"][value="selected"]').check();
  await panel.locator('[data-discount-service][value="svc-brakes"]').check();
  await panel.locator("[data-materials-percent]").fill("10");
  await panel.locator('input[name="hc-materials-scope"][value="selected"]').check();
  await panel.locator("[data-materials-list]").fill("Фильтры, Тормозные колодки");
  await panel.getByRole("button", { name: "Сохранить скидку" }).click();

  await expect(panel.locator("[data-discount-status]")).toContainText("сохранена");
  expect(savedBody).toEqual({
    enabled: true,
    service_discount_percent: 15,
    service_scope: "selected",
    service_ids: ["svc-brakes"],
    materials_discount_percent: 10,
    materials_scope: "selected",
    materials_items: ["Фильтры", "Тормозные колодки"],
  });
});

test("public mobile booking shows the green Hermes Connect driver benefit before booking", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/public/repair-shop?*", (route) => route.fulfill(json({
    success: true,
    shop,
    services,
    availability: [],
    capabilities: { vehicle_types: ["commercial_truck"], fleet_service: true, mobile_roadside: false, emergency_24_7: false },
    driver_discount: {
      enabled: true,
      service_discount_percent: 15,
      service_scope: "selected",
      service_names: ["Диагностика", "Замена масла"],
      materials_discount_percent: 10,
      materials_scope: "all",
      materials_items: [],
    },
  })));

  await page.goto(`/services/hermes-connect/repair-shops/booking/?shop=${shop.slug}&lang=ru`, { waitUntil: "domcontentloaded" });

  const banner = page.locator("[data-driver-discount-public]");
  await expect(banner).toBeVisible();
  await expect(banner.locator(".hc-driver-discount-dollar")).toHaveText("$");
  await expect(banner).toContainText("СКИДКА ДЛЯ ВОДИТЕЛЕЙ HERMES CONNECT");
  await expect(banner).toContainText("Скидка 15% на выбранные услуги: Диагностика, Замена масла");
  await expect(banner).toContainText("Скидка 10% на все запчасти и материалы");
  const background = await banner.evaluate((node) => getComputedStyle(node).backgroundImage);
  expect(background).toContain("linear-gradient");

  const bannerBox = await banner.boundingBox();
  const bookingBox = await page.locator("#booking-panel").boundingBox();
  expect(bannerBox && bookingBox && bannerBox.y < bookingBox.y).toBeTruthy();
});

test("public booking does not invent a discount when the shop has not enabled it", async ({ page }) => {
  await page.route("**/api/public/repair-shop?*", (route) => route.fulfill(json({
    success: true,
    shop,
    services,
    availability: [],
    capabilities: {},
    driver_discount: { enabled: false },
  })));

  await page.goto(`/services/hermes-connect/repair-shops/booking/?shop=${shop.slug}&lang=en`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-driver-discount-public]")).toHaveCount(0);
});
