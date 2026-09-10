import { expect, test } from "@playwright/test";

const payload = {
  success: true,
  shop: { id: "shop-dedupe", slug: "dedupe-shop", name: "Dedupe Auto", phone: "+15015550123", address_line1: "100 Main St", city: "Sherwood", state: "AR", postal_code: "72120", timezone: "America/Chicago" },
  services: [{ id: "svc-oil", name: "Oil change", duration_minutes: 30 }],
  availability: [{ day_of_week: 1, is_open: true, start_time: "07:00", end_time: "19:00" }],
  capabilities: { vehicle_types: ["passenger_light", "commercial_truck"], fleet_service: true, mobile_roadside: true, emergency_24_7: false },
  driver_discount: { enabled: true, service_discount_percent: 10, service_scope: "all", service_ids: [], service_names: [], materials_discount_percent: 5, materials_scope: "all", materials_items: [] },
};

test("public booking shares one public-shop read across booking enhancers", async ({ page }) => {
  let publicShopReads = 0;
  await page.route("**/api/public/repair-shop?slug=dedupe-shop", async (route) => {
    publicShopReads += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) });
  });

  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=dedupe-shop", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Dedupe Auto" })).toBeVisible();
  await expect(page.locator("[data-public-shop-capabilities]")).toBeVisible();
  await expect(page.locator("[data-driver-discount-public]")).toBeVisible();
  await page.waitForTimeout(250);
  expect(publicShopReads).toBe(1);
});
