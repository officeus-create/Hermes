import { expect, test, type Page } from "@playwright/test";

const vehiclePayload = {
  success: true,
  vehicles: [
    {
      id: "vin:1HGCM82633A004352",
      year: 2022,
      make: "Ford",
      model: "F-150",
      vin: "1HGCM82633A004352",
      mileage: 48210,
      total_bookings: 3,
      completed_visits: 2,
      cancelled_bookings: 0,
      last_seen_date: "2026-09-05",
      last_completed_visit: "2026-08-21",
      next_appointment: {
        booking_id: "booking-3",
        appointment_date: "2026-09-08",
        start_time: "10:00",
        service_name: "Brake inspection",
        status: "confirmed",
      },
      current_customer: { name: "Alex Morgan", email: "alex@example.com", phone: "202-555-0188" },
      services: ["Brake inspection", "Oil change"],
      customers: [
        { name: "Alex Morgan", email: "alex@example.com", phone: "202-555-0188", last_seen_date: "2026-09-05" },
        { name: "Jordan Lee", email: "jordan@example.com", phone: "202-555-0102", last_seen_date: "2026-04-11" },
      ],
      history: [
        { booking_id: "booking-3", appointment_date: "2026-09-08", start_time: "10:00", service_name: "Brake inspection", status: "confirmed", mileage: 48210, customer: { name: "Alex Morgan", email: "alex@example.com", phone: "202-555-0188" } },
        { booking_id: "booking-2", appointment_date: "2026-08-21", start_time: "09:00", service_name: "Oil change", status: "completed", mileage: 47640, customer: { name: "Alex Morgan", email: "alex@example.com", phone: "202-555-0188" } },
      ],
    },
  ],
};

async function mockOwnerApis(page: Page) {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true, account: { role: "Shop Owner" } }) });
  });
  await page.route("**/api/repair-shop/vehicles", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(vehiclePayload) });
  });
}

test("Vehicles is a private owner workspace backed by the shared CRM shell", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/vehicles/", { waitUntil: "domcontentloaded" });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  await expect(page.locator('[data-i18n="vehiclesTitle"]')).toHaveText("Vehicles");
  await expect(page.locator(".repair-crm-nav-item.is-active")).toContainText("Vehicles");
  await expect(page.locator(".vehicle-card")).toContainText("2022 Ford F-150");
  await expect(page.locator(".vehicle-card")).toContainText("Alex Morgan");
  await expect(page.locator(".vehicle-card")).toContainText("48210");

  await page.locator(".vehicle-card").click();
  await expect(page.locator("#vehicle-detail")).toBeVisible();
  await expect(page.locator("#detail-vehicle")).toHaveText("2022 Ford F-150");
  await expect(page.locator("#detail-vin")).toContainText("1HGCM82633A004352");
  await expect(page.locator("#detail-customer-name")).toHaveText("Alex Morgan");
  await expect(page.locator("#detail-customers")).toContainText("Jordan Lee");
  await expect(page.locator("#detail-history")).toContainText("Oil change");
  await expect(page.locator("#detail-next")).toContainText("Brake inspection");

  const customersHref = await page.locator("#detail-customers-link").getAttribute("href");
  const appointmentsHref = await page.locator("#detail-appointments-link").getAttribute("href");
  expect(customersHref).not.toContain("alex@example.com");
  expect(customersHref).not.toContain("1HGCM82633A004352");
  expect(appointmentsHref).not.toContain("alex@example.com");
  expect(appointmentsHref).not.toContain("1HGCM82633A004352");
});

test("Vehicles preserves Russian owner UX and mobile-safe navigation", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/vehicles/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-i18n="vehiclesTitle"]')).toHaveText("Автомобили");
  await expect(page.locator(".repair-crm-nav-item.is-active")).toContainText("Автомобили");
  await expect(page.locator("#vehicle-search")).toHaveAttribute("placeholder", "VIN, автомобиль, клиент или услуга");
  await expect(page.locator(".vehicle-card")).toContainText("Alex Morgan");

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    const menu = page.locator("[data-repair-crm-menu]");
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.locator(".repair-crm-sidebar")).toBeVisible();
  }
});
