import { expect, test } from "@playwright/test";

const ok = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-1", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const shop = { id: "shop-1", slug: "apex-auto", name: "Apex Auto", phone: "+14145550100", address_line1: "123 Main St", city: "Milwaukee", state: "WI", postal_code: "53202", timezone: "America/Chicago" };
const emptyAvailability = Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, is_open: false, start_time: null, end_time: null }));

test.describe("Repair Shop first-10-minute quick start", () => {
  test("owner can add a common service with one tap at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const services: Array<{ id: string; name: string; duration_minutes: number; owner_specialist_id: string }> = [];
    let created: any = null;

    await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
    await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success: true, shop })));
    await page.route("**/api/repair-shop/access", (route) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
    await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success: true, bookings: [] })));
    await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success: true, feedback: [] })));
    await page.route("**/api/repair-shop/capabilities", (route) => route.fulfill(ok({ success: true, capabilities: { shop_id: "shop-1", vehicle_types: [], fleet_service: false, mobile_roadside: false, emergency_24_7: false, parallel_booking_capacity: 1 } })));
    await page.route("**/api/services", async (route) => {
      if (route.request().method() === "POST") {
        created = route.request().postDataJSON();
        const service = { id: "service-1", ...created, owner_specialist_id: "owner-1" };
        services.push(service);
        return route.fulfill(ok({ success: true, service }, 201));
      }
      return route.fulfill(ok({ success: true, services }));
    });

    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=en", { waitUntil: "domcontentloaded" });
    const quick = page.locator("[data-repair-service-presets]");
    await expect(quick).toBeVisible();

    const oil = quick.locator('[data-preset-id="oil_change"]');
    await expect(oil).toContainText("Oil change");
    await oil.click();

    await expect.poll(() => created).toEqual({ name: "Oil change", duration_minutes: 30 });
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator('[data-preset-id="oil_change"]')).toBeDisabled();

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });

  test("weekday preset fills Mon-Fri 8-5 without saving until owner submits", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let putCount = 0;
    let savedDays: any[] | null = null;

    await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
    await page.route("**/api/repair-shop/availability", async (route) => {
      if (route.request().method() === "PUT") {
        putCount += 1;
        const payload = route.request().postDataJSON();
        savedDays = payload.days;
        return route.fulfill(ok({ success: true, timezone: "America/Chicago", days: payload.days }));
      }
      return route.fulfill(ok({ success: true, timezone: "America/Chicago", days: emptyAvailability }));
    });

    await page.goto("/services/hermes-connect/repair-shops/availability/?lang=en", { waitUntil: "domcontentloaded" });
    const preset = page.locator("[data-repair-weekday-preset]");
    await expect(preset).toBeVisible();
    await preset.getByRole("button", { name: "Use Mon–Fri · 8:00 AM–5:00 PM" }).click();

    expect(putCount).toBe(0);
    for (const day of [1, 2, 3, 4, 5]) {
      const row = page.locator(`.day-row[data-day="${day}"]`);
      await expect(row.locator('input[type="checkbox"]')).toBeChecked();
      await expect(row.locator('input[type="time"]').nth(0)).toHaveValue("08:00");
      await expect(row.locator('input[type="time"]').nth(1)).toHaveValue("17:00");
    }
    for (const day of [0, 6]) {
      await expect(page.locator(`.day-row[data-day="${day}"] input[type="checkbox"]`)).not.toBeChecked();
    }

    await page.getByRole("button", { name: "Save weekly availability" }).click();
    await expect.poll(() => putCount).toBe(1);
    expect(savedDays).not.toBeNull();
    expect(savedDays?.filter((day) => day.is_open).map((day) => day.day_of_week)).toEqual([1, 2, 3, 4, 5]);

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });
});
