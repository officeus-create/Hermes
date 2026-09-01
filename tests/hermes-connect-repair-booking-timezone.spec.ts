import { expect, test } from "@playwright/test";

const shop = {
  id: "shop-timezone-contract",
  name: "Timezone Contract Auto Care",
  slug: "timezone-contract-shop",
  phone: "+1 212 555 0100",
  address_line1: "100 Timezone Test Way",
  city: "New York",
  state: "NY",
  postal_code: "10001",
  timezone: "America/New_York",
};

const service = {
  id: "service-timezone-contract",
  owner_specialist_id: "specialist-timezone-contract",
  name: "Timezone-safe inspection",
  duration_minutes: 60,
};

test("public booking keeps the shop calendar date when the customer is a day behind", async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: "Pacific/Honolulu" });
  const page = await context.newPage();

  // 2026-09-02 00:30 in New York, while Honolulu is still 2026-09-01 18:30.
  await page.clock.setFixedTime(new Date("2026-09-02T04:30:00.000Z"));

  let postedBody: Record<string, unknown> | null = null;
  await page.route("**/api/public/repair-shop?slug=timezone-contract-shop", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        shop,
        services: [service],
        availability: Array.from({ length: 7 }, (_, day_of_week) => ({
          day_of_week,
          is_open: true,
          start_time: "09:00",
          end_time: "17:00",
        })),
      }),
    });
  });

  await page.route("**/api/public/repair-booking?shop=timezone-contract-shop&date=*", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, shop: { id: shop.id, slug: shop.slug, timezone: shop.timezone }, date: url.searchParams.get("date"), busy: [] }),
    });
  });

  await page.route("**/api/public/repair-booking", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    postedBody = route.request().postDataJSON();
    const body = postedBody as Record<string, any>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        booking: {
          id: "repair-booking-timezone-contract",
          shop_id: shop.id,
          shop_name: shop.name,
          service_id: service.id,
          service_name: service.name,
          duration_minutes: service.duration_minutes,
          appointment_date: body.appointment_date,
          start_time: body.start_time,
          end_time: "10:00",
          status: "confirmed",
          client_name: body.client_name,
          client_email: body.client_email,
          client_phone: body.client_phone,
          vehicle: { year: 2022, make: "Honda", model: "Civic", mileage: null, vin: null },
          timezone: shop.timezone,
        },
      }),
    });
  });

  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=timezone-contract-shop");
  await expect(page.locator("#timezone-pill")).toHaveText("America/New_York");

  await page.locator("#service-select").selectOption(service.id);
  const firstDate = page.locator("#date-select option").nth(1);
  await expect(firstDate).toHaveAttribute("value", "2026-09-02");
  await page.locator("#date-select").selectOption("2026-09-02");
  await page.locator("#time-select").selectOption("09:00");

  await page.locator("#vehicle-year").fill("2022");
  await page.locator("#vehicle-make").fill("Honda");
  await page.locator("#vehicle-model").fill("Civic");
  await page.locator("#client-name").fill("Timezone Customer");
  await page.locator("#client-email").fill("timezone@example.com");
  await page.locator("#client-phone").fill("+1 808 555 0100");
  await page.locator("#submit-btn").click();

  await expect(page.locator("#success-panel")).toBeVisible();
  await expect(page.locator("#receipt-date")).toHaveText("2026-09-02");
  expect(postedBody).toMatchObject({
    shop_slug: shop.slug,
    service_id: service.id,
    appointment_date: "2026-09-02",
    start_time: "09:00",
  });

  await context.close();
});
