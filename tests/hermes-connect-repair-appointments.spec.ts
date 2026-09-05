import { expect, test } from "@playwright/test";

const booking = {
  id: "demo-booking-1",
  service_name: "Heavy Truck Air Brake Service",
  duration_minutes: 180,
  appointment_date: "2026-09-08",
  start_time: "08:00",
  end_time: "11:00",
  status: "confirmed",
  client_name: "James Anderson",
  client_email: "office.demo.001@example.com",
  client_phone: "+1 202-555-0100",
  technician: { id: "tech-1", name: "Daniel Foster" },
  vehicle: { year: 2022, make: "Freightliner", model: "Cascadia", mileage: 48125, vin: "DEMO0000000000001" },
  history: [{ id: "history-1", from_status: null, to_status: "confirmed", changed_at: "2026-09-05T12:00:00.000Z" }],
};

async function mockOwner(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { id: "owner-1", name: "Office Demo", email: "office.demo@example.com", role: "Shop Owner" } }),
  }));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, bookings: [booking] }),
  }));
}

test("Appointments shows the assigned technician separately from the service and can search by technician", async ({ page }) => {
  await mockOwner(page);
  await page.goto("/services/hermes-connect/repair-shops/appointments/");

  await expect(page.getByRole("heading", { name: "Appointments", exact: true })).toBeVisible();
  const card = page.locator('[data-booking-id="demo-booking-1"]');
  await expect(card).toContainText("Heavy Truck Air Brake Service");
  await expect(card).toContainText("Technician: Daniel Foster");
  await expect(card).toContainText("2022 Freightliner Cascadia");

  await page.locator("#appointment-search").fill("Daniel Foster");
  await expect(card).toBeVisible();
  await page.locator("#appointment-search").fill("Sophia Martinez");
  await expect(card).toBeHidden();
  await expect(page.getByText("No appointments found", { exact: true })).toBeVisible();
});

test("Russian Appointments keeps the technician label localized on mobile", async ({ page }) => {
  await mockOwner(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/appointments/?lang=ru");

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator('[data-booking-id="demo-booking-1"]')).toContainText("Мастер: Daniel Foster");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
