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

test("repair booking success can create an explicit-consent growth lead without PII analytics", async ({ page }) => {
  let growthPayload: Record<string, any> | null = null;
  let idempotencyKey = "";

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
    growthPayload = route.request().postDataJSON();
    idempotencyKey = route.request().headers()["idempotency-key"] || "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, request_id: growthPayload?.request_id }),
    });
  });

  await page.goto(bookingUrl);
  await expect(page.locator("[data-repair-growth-card]")).toBeHidden();

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
  await expect(page.locator("[data-repair-growth-card]")).toBeVisible();
  await expect(page.locator("[data-growth-form]")).toBeHidden();

  await page.locator("[data-growth-open]").click();
  await expect(page.locator("[data-growth-form]")).toBeVisible();
  await page.locator("[data-growth-service]").selectOption("SEO / Google visibility");
  await page.locator("[data-growth-message]").fill("We want more qualified local calls from Google and a better conversion path.");
  await page.locator("[data-growth-consent]").check();
  await page.locator("[data-growth-submit]").click();

  await expect(page.locator("[data-growth-status]")).toContainText("Request received");
  expect(growthPayload).toMatchObject({
    name: "Jane Growth Test",
    email: "jane.growth@example.com",
    interest: "ProgressoPro",
    consent: true,
    source_path: "/services/hermes-connect/repair-shops/booking/",
    direction_fields: {
      direction: "ProgressoPro",
      fields: {
        service_needed: "SEO / Google visibility",
        primary_goal: "Grow business from Repair Shop booking flow",
      },
    },
  });
  expect(growthPayload?.request_id).toMatch(/^repair_growth_[a-z0-9]+_[a-z0-9]+$/i);
  expect(idempotencyKey).toBe(growthPayload?.request_id);

  const analytics = await page.evaluate(() => (window as any).dataLayer || []);
  const growthEvent = analytics.find((item: any) => item?.event === "connect_hermes_growth_cta_requests");
  expect(growthEvent).toEqual({
    event: "connect_hermes_growth_cta_requests",
    source: "repair_booking_success",
    request_state: "received",
  });

  const analyticsText = JSON.stringify(analytics);
  expect(analyticsText).not.toContain("Jane Growth Test");
  expect(analyticsText).not.toContain("jane.growth@example.com");
  expect(analyticsText).not.toContain("+1 414 555 0199");
  expect(analyticsText).not.toContain("qualified local calls");
});
