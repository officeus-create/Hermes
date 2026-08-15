import { expect, test } from "@playwright/test";

const customersUrl = "/services/hermes-connect/repair-shops/customers/";

const customerPayload = {
  success: true,
  customers: [
    {
      id: "customer-jane-example-com",
      name: "Jane Driver",
      email: "jane@example.com",
      phone: "+1 414 555 0188",
      total_bookings: 2,
      completed_visits: 1,
      cancelled_bookings: 0,
      last_activity_at: "2026-08-15T08:00:00.000Z",
      last_service_date: "2026-08-12",
      next_appointment: {
        booking_id: "booking-next",
        appointment_date: "2026-08-22",
        start_time: "10:00",
        service_name: "Brake inspection",
        status: "confirmed",
      },
      services: ["Oil change", "Brake inspection"],
      vehicles: [
        {
          year: 2022,
          make: "Toyota",
          model: "Camry",
          mileage: 48210,
          vin: "4T1G11AK0NU123456",
          last_seen_date: "2026-08-12",
        },
      ],
    },
  ],
};

test.describe("Hermes Connect Repair Shop customer CRM browser contract", () => {
  test("owner can view and search booking-derived customer history without mobile overflow", async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, specialist: { id: "owner-1", name: "Shop Owner", email: "owner@example.com", role: "Shop Owner" } }),
      });
    });

    await page.route("**/api/repair-shop/customers", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(customerPayload) });
    });

    await page.goto(customersUrl);

    await expect(page.locator("h1")).toHaveText("Customers");
    await expect(page.locator("#customer-count")).toHaveText("1 customer");
    await expect(page.getByText("Jane Driver")).toBeVisible();
    await expect(page.getByText("jane@example.com")).toBeVisible();
    await expect(page.getByText("+1 414 555 0188")).toBeVisible();
    await expect(page.getByText(/2022 Toyota Camry/)).toBeVisible();
    await expect(page.getByText(/48,210 mi/)).toBeVisible();
    await expect(page.getByText(/VIN 4T1G11AK0NU123456/)).toBeVisible();
    await expect(page.getByText(/Oil change, Brake inspection/)).toBeVisible();
    await expect(page.getByText(/Next:/)).toContainText("Brake inspection");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.locator("#customer-search").fill("4T1G11AK0NU123456");
    await expect(page.getByText("Jane Driver")).toBeVisible();
    await expect(page.locator("#customer-count")).toHaveText("1 customer");

    await page.locator("#customer-search").fill("does-not-exist");
    await expect(page.locator("#customer-count")).toHaveText("0 customers");
    await expect(page.getByText("Jane Driver")).toBeHidden();
  });

  test("unauthenticated owner is redirected to Repair Shop auth", async ({ page }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) });
    });

    await page.goto(customersUrl);
    await page.waitForURL("**/services/hermes-connect/repair-shops/auth/**");
    expect(page.url()).toContain("/services/hermes-connect/repair-shops/auth/");
  });
});
