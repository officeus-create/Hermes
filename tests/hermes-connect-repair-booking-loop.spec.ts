import { expect, test } from "@playwright/test";

const bookingUrl = "/services/hermes-connect/repair-shops/booking/?shop=browser-contract-shop";
const shopPayload = {
  success: true,
  shop: {
    id: "shop-browser-contract",
    name: "Browser Contract Auto Care",
    slug: "browser-contract-shop",
    phone: "+1 414 555 0100",
    address_line1: "100 Test Way",
    city: "Milwaukee",
    state: "WI",
    postal_code: "53202",
    timezone: "America/Chicago",
  },
  services: [
    {
      id: "service-browser-contract",
      owner_specialist_id: "specialist-browser-contract",
      name: "Brake inspection",
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

async function fillVehicleAndContact(page: any, values: { name: string; email: string; phone: string }) {
  await page.locator("#vehicle-year").fill("2021");
  await page.locator("#vehicle-make").fill("Ford");
  await page.locator("#vehicle-model").fill("F-150");
  await page.locator("#vehicle-mileage").fill("84500");
  await page.locator("#client-name").fill(values.name);
  await page.locator("#client-email").fill(values.email);
  await page.locator("#client-phone").fill(values.phone);
}

test.describe("Hermes Connect Repair Shop real booking browser contract", () => {
  test("customer booking is driven by public APIs instead of localStorage demo state", async ({ page }) => {
    let bookingBody: Record<string, unknown> | null = null;

    await page.route("**/api/public/repair-shop?slug=browser-contract-shop", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload) });
    });

    await page.route("**/api/public/repair-booking?shop=browser-contract-shop&date=*", async (route) => {
      const url = new URL(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, shop: { id: shopPayload.shop.id, slug: shopPayload.shop.slug, timezone: shopPayload.shop.timezone }, date: url.searchParams.get("date"), busy: [] }),
      });
    });

    await page.route("**/api/public/repair-booking", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      bookingBody = route.request().postDataJSON();
      const body = bookingBody as Record<string, any>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          booking: {
            id: "repair-booking-browser-contract",
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

    await page.goto(bookingUrl);
    await expect(page.locator("h1")).toHaveText(shopPayload.shop.name);
    await expect(page.locator("body")).not.toContainText("Apex Auto Care");
    await expect(page.locator("body")).not.toContainText("Free during Beta");
    await expect(page.locator("body")).not.toContainText("Bays Open");

    await page.locator("#service-select").selectOption(shopPayload.services[0].id);
    const dateOption = page.locator("#date-select option").nth(1);
    const appointmentDate = await dateOption.getAttribute("value");
    expect(appointmentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await page.locator("#date-select").selectOption(appointmentDate!);
    await expect(page.locator("#slot-state")).toContainText("live");
    await page.locator("#time-select").selectOption("10:00");
    await fillVehicleAndContact(page, { name: "Jane Production Test", email: "jane@example.com", phone: "+1 414 555 0188" });
    await page.locator("#submit-btn").click();

    await expect(page.locator("#success-panel")).toBeVisible();
    await expect(page.locator("#receipt-id")).toHaveText("repair-booking-browser-contract");
    await expect(page.locator("#receipt-service")).toHaveText("Brake inspection");
    await expect(page.locator("#receipt-vehicle")).toContainText("2021 Ford F-150");
    await expect(page.locator("#receipt-vehicle")).toContainText("84,500 mi");
    await expect(page.locator("#receipt-status")).toHaveText("confirmed");

    expect(bookingBody).toMatchObject({
      shop_slug: shopPayload.shop.slug,
      service_id: shopPayload.services[0].id,
      appointment_date: appointmentDate,
      start_time: "10:00",
      client_name: "Jane Production Test",
      client_email: "jane@example.com",
      client_phone: "+1 414 555 0188",
      vehicle_year: 2021,
      vehicle_make: "Ford",
      vehicle_model: "F-150",
      mileage: "84500",
    });

    const legacyStorage = await page.evaluate(() => ({
      bookings: localStorage.getItem("hermes_connect_bookings"),
      leadStore: localStorage.getItem("hermes_lead_store"),
    }));
    expect(legacyStorage).toEqual({ bookings: null, leadStore: null });
  });

  test("server slot conflict stays a failure and never renders fake confirmation", async ({ page }) => {
    await page.route("**/api/public/repair-shop?slug=browser-contract-shop", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload) });
    });

    let availabilityReads = 0;
    await page.route("**/api/public/repair-booking?shop=browser-contract-shop&date=*", async (route) => {
      availabilityReads += 1;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, date: new URL(route.request().url()).searchParams.get("date"), busy: [] }) });
    });

    await page.route("**/api/public/repair-booking", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: "slot_unavailable" }) });
    });

    await page.goto(bookingUrl);
    await page.locator("#service-select").selectOption(shopPayload.services[0].id);
    const appointmentDate = await page.locator("#date-select option").nth(1).getAttribute("value");
    await page.locator("#date-select").selectOption(appointmentDate!);
    await page.locator("#time-select").selectOption("10:00");
    await fillVehicleAndContact(page, { name: "Conflict Customer", email: "conflict@example.com", phone: "+1 414 555 0177" });
    await page.locator("#submit-btn").click();

    await expect(page.locator("#page-alert")).toContainText("just booked");
    await expect(page.locator("#success-panel")).toBeHidden();
    expect(availabilityReads).toBeGreaterThanOrEqual(2);
  });
});
