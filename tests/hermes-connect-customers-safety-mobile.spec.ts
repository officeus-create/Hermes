import { expect, test } from "@playwright/test";

const hostileService = `<img src=x onerror="window.__hcCustomerXss=1">Brake service with an intentionally very long mobile-safe label`;
const hostileVehicle = `<svg onload="window.__hcCustomerXss=2"></svg>UltraLongVehicleModelWithoutNaturalBreakPoints1234567890`;

async function mockCustomerWorkspace(page: import("@playwright/test").Page) {
  await page.addInitScript(() => { (window as Window & { __hcCustomerXss?: number }).__hcCustomerXss = 0; });
  await page.route("**/api/auth/me", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { name: "Owner", email: "owner@example.com", role: "Shop Owner" } }),
  }));
  await page.route("**/api/repair-shop/customers", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      customers: [{
        id: "customer-1",
        name: "Test Customer",
        email: "very-long-customer-address-for-mobile-testing@example.com",
        phone: "+1-414-555-0100-extension-123456789",
        total_bookings: 2,
        completed_visits: 1,
        cancelled_bookings: 0,
        last_activity_at: "2026-09-01T12:00:00Z",
        last_service_date: "2026-08-30",
        next_appointment: {
          booking_id: "booking-2",
          appointment_date: "2026-09-05",
          start_time: "10:00",
          service_name: hostileService,
          status: "confirmed",
        },
        services: [hostileService],
        vehicles: [{
          year: 2024,
          make: "TestMake",
          model: hostileVehicle,
          mileage: 12000,
          vin: "1HERMESCONNECTVERYLO1234567890",
          last_seen_date: "2026-08-30",
        }],
      }],
    }),
  }));
}

test("Customers renders booking-derived service and vehicle strings as text only", async ({ page }) => {
  await mockCustomerWorkspace(page);
  await page.goto("/services/hermes-connect/repair-shops/customers/");

  const card = page.locator(".customer-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Brake service with an intentionally very long mobile-safe label");
  await expect(card).toContainText("UltraLongVehicleModelWithoutNaturalBreakPoints1234567890");
  await expect(card.locator("img")).toHaveCount(0);
  await expect(card.locator("svg")).toHaveCount(0);
  const marker = await page.evaluate(() => (window as Window & { __hcCustomerXss?: number }).__hcCustomerXss ?? 0);
  expect(marker).toBe(0);
});

test("Customers remains contained and readable at 390px with long CRM values", async ({ page }) => {
  await mockCustomerWorkspace(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/customers/");

  const card = page.locator(".customer-card");
  await expect(card).toBeVisible();
  const geometry = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const card = document.querySelector<HTMLElement>(".customer-card");
    const email = document.querySelector<HTMLElement>(".contact-link");
    const service = document.querySelector<HTMLElement>(".stats strong:last-child");
    const vehicle = document.querySelector<HTMLElement>(".vehicle-card");
    if (!card || !email || !service || !vehicle) throw new Error("Customer mobile geometry targets are missing");
    const rect = (node: HTMLElement) => {
      const box = node.getBoundingClientRect();
      return { left: box.left, right: box.right, width: box.width };
    };
    return {
      overflow: document.documentElement.scrollWidth > viewportWidth,
      card: rect(card),
      email: rect(email),
      service: rect(service),
      vehicle: rect(vehicle),
    };
  });

  expect(geometry.overflow).toBe(false);
  for (const target of [geometry.card, geometry.email, geometry.service, geometry.vehicle]) {
    expect(target.left).toBeGreaterThanOrEqual(0);
    expect(target.right).toBeLessThanOrEqual(390);
  }
});
