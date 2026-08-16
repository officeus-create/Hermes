import { expect, test } from "@playwright/test";

const bookingUrl = "/services/hermes-connect/repair-shops/booking/?shop=growth-contract-shop";
const shopPayload = {
  success: true,
  shop: {
    id: "shop-growth-contract",
    name: "Growth Contract Auto Care",
    slug: "growth-contract-shop",
    phone: "+1 414 555 0100",
    address_line1: "100 Growth Way",
    city: "Milwaukee",
    state: "WI",
    postal_code: "53202",
    timezone: "America/Chicago",
  },
  services: [
    {
      id: "service-growth-contract",
      owner_specialist_id: "specialist-growth-contract",
      name: "Diagnostics",
      duration_minutes: 60,
    },
  ],
  availability: Array.from({ length: 7 }, (_, day_of_week) => ({
    day_of_week,
    is_open: true,
    start_time: "09:00",
    end_time: "17:00",
  })),
};

test("repair booking success stays customer-focused and does not reuse customer PII for unrelated growth marketing", async ({ page }) => {
  let unrelatedGrowthRequestCount = 0;

  await page.addInitScript(() => {
    (window as any).dataLayer = [];
  });

  await page.route("**/api/public/repair-shop?slug=growth-contract-shop", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload) });
  });

  await page.route("**/api/public/repair-booking?shop=growth-contract-shop&date=*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, shop: { id: shopPayload.shop.id, slug: shopPayload.shop.slug, timezone: shopPayload.shop.timezone }, busy: [] }),
    });
  });

  await page.route("**/api/public/repair-booking", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const body = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        booking: {
          id: "repair-booking-growth-contract",
          shop_id: shopPayload.shop.id,
          shop_name: shopPayload.shop.name,
          service_id: shopPayload.services[0].id,
          service_name: shopPayload.services[0].name,
          duration_minutes: 60,
          appointment_date: body.appointment_date,
          start_time: body.start_time,
          end_time: "11:00",
          status: "confirmed",
          client_name: body.client_name,
          client_email: body.client_email,
          client_phone: body.client_phone,
          vehicle: {
            year: body.vehicle_year,
            make: body.vehicle_make,
            model: body.vehicle_model,
            mileage: Number(body.mileage),
            vin: null,
          },
          timezone: shopPayload.shop.timezone,
        },
      }),
    });
  });

  await page.route("**/api/logistics-lead", async (route) => {
    unrelatedGrowthRequestCount += 1;
    await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false }) });
  });

  await page.goto(bookingUrl);
  await expect(page.locator("[data-repair-growth-card]")).toHaveCount(0);

  await page.locator("#service-select").selectOption(shopPayload.services[0].id);
  const appointmentDate = await page.locator("#date-select option").nth(1).getAttribute("value");
  await page.locator("#date-select").selectOption(appointmentDate!);
  await page.locator("#time-select").selectOption("10:00");
  await page.locator("#vehicle-year").fill("2022");
  await page.locator("#vehicle-make").fill("Ford");
  await page.locator("#vehicle-model").fill("Transit");
  await page.locator("#vehicle-mileage").fill("42000");
  await page.locator("#client-name").fill("Jane Growth Test");
  await page.locator("#client-email").fill("jane.growth@example.com");
  await page.locator("#client-phone").fill("+1 414 555 0199");
  await page.locator("#submit-btn").click();

  await expect(page.locator("#success-panel")).toBeVisible();
  await expect(page.locator("[data-repair-growth-card]")).toHaveCount(0);
  expect(unrelatedGrowthRequestCount).toBe(0);

  const analytics = await page.evaluate(() => (window as any).dataLayer || []);
  const analyticsText = JSON.stringify(analytics);
  expect(analyticsText).not.toContain("Jane Growth Test");
  expect(analyticsText).not.toContain("jane.growth@example.com");
  expect(analyticsText).not.toContain("+1 414 555 0199");
});
