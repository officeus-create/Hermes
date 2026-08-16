import { expect, test } from "@playwright/test";

const owner = { name: "Synthetic Owner", email: "owner@example.test" };
const shop = {
  id: "shop_test_1",
  name: "Synthetic Repair",
  slug: "synthetic-repair",
  phone: "+1 414 555 0100",
  address_line1: "100 Test Ave",
  city: "Milwaukee",
  state: "WI",
  postal_code: "53202",
  timezone: "America/Chicago",
};

async function mockOwnerApis(page: import("@playwright/test").Page, configured: boolean) {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, specialist: owner }) }));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, shop: configured ? shop : null }) }));
  await page.route("**/api/services", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      services: configured
        ? [
            { id: "svc_1", name: "Diagnostics", duration_minutes: 30, owner_specialist_id: "owner_1" },
            { id: "svc_2", name: "Brake inspection", duration_minutes: 45, owner_specialist_id: "owner_1" },
            { id: "svc_3", name: "Oil service", duration_minutes: 30, owner_specialist_id: "owner_1" },
          ]
        : [],
    }),
  }));
  await page.route("**/api/repair-shop/availability", (route) => {
    if (!configured) return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: "shop_profile_required" }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, timezone: "America/Chicago", days: [{ day_of_week: 1, is_open: true, start_time: "08:00", end_time: "17:00" }] }) });
  });
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      bookings: configured
        ? [{
            id: "booking_1",
            service_name: "Diagnostics",
            duration_minutes: 30,
            appointment_date: "2026-08-18",
            start_time: "09:00",
            end_time: "09:30",
            status: "completed",
            client_name: "Synthetic Customer",
            client_email: "customer@example.test",
            client_phone: "+1 414 555 0111",
            vehicle: { year: 2022, make: "Ford", model: "Transit", mileage: 24000, vin: null },
            history: [],
          }]
        : [],
    }),
  }));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, feedback: [] }) }));
}

test("new repair shop owner sees a zero-state activation path to profile setup", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockOwnerApis(page, false);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("[data-activation-panel]")).toBeVisible();
  await expect(page.locator("#activation-percent")).toHaveText("0%");
  await expect(page.locator("#activation-count")).toHaveText("0 of 6 complete");
  await expect(page.locator("#activation-next-label")).toHaveText("Finish shop profile");
  await expect(page.locator("#activation-next-btn")).toHaveAttribute("href", "#profile-title");
  await expect(page.locator("#activation-plan-link")).toHaveAttribute("href", "/services/hermes-connect/repair-shops/plan/");
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("configured owner reaches 100% after sharing and gets the paid-plan decision CTA", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockOwnerApis(page, true);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#activation-title")).toHaveText("Подготовьте СТО к приёму клиентов");
  await expect(page.locator("#activation-percent")).toHaveText("83%");
  await expect(page.locator('[data-activation-step="profile"]')).toHaveClass(/is-complete/);
  await expect(page.locator('[data-activation-step="services"]')).toHaveClass(/is-complete/);
  await expect(page.locator('[data-activation-step="availability"]')).toHaveClass(/is-complete/);
  await expect(page.locator('[data-activation-step="booking"]')).toHaveClass(/is-complete/);
  await expect(page.locator('[data-activation-step="completed"]')).toHaveClass(/is-complete/);
  await expect(page.locator('[data-activation-step="shared"]')).not.toHaveClass(/is-complete/);

  const popupPromise = page.waitForEvent("popup");
  await page.locator("#open-link-btn").click();
  const popup = await popupPromise;
  await popup.close();

  await expect(page.locator("#activation-percent")).toHaveText("100%");
  await expect(page.locator('[data-activation-step="shared"]')).toHaveClass(/is-complete/);
  await expect(page.locator("#activation-next-btn")).toHaveAttribute("href", "/services/hermes-connect/repair-shops/plan/");
  await expect(page.locator("#activation-next-btn")).toHaveText("Посмотреть тариф");
  await expect(page.locator("#activation-plan-link")).toHaveText("Тариф Founding Shop — $99/месяц");
});
