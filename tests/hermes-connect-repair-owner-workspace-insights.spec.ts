import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

async function mockWorkspace(page: any) {
  const maliciousService = `<img src=x onerror="window.__hcOwnerPwned=1"> Diagnostics`;
  const maliciousCustomer = `<svg onload="window.__hcOwnerPwned=2"></svg> Customer`;
  await page.route("**/api/auth/me", (route: any) => route.fulfill(ok({ success: true, specialist: { id: "owner-1", name: "Owner", email: "owner@example.com", role: "Shop Owner" } })));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill(ok({ success: true, shop: { id: "shop-1", slug: "safe-shop", name: "Safe Shop", city: "Milwaukee", state: "WI", timezone: "America/Chicago" } })));
  await page.route("**/api/repair-shop/access", (route: any) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route: any) => route.fulfill(ok({ success: true, timezone: "America/Chicago", days: [] })));
  await page.route("**/api/services", (route: any) => route.fulfill(ok({ success: true, services: [{ id: "svc-1", name: maliciousService, duration_minutes: 30 }] })));
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill(ok({ success: true, bookings: [{ id: "booking-xss", service_name: maliciousService, duration_minutes: 30, appointment_date: "2026-08-19", start_time: "10:00", end_time: "10:30", status: "completed", client_name: maliciousCustomer, client_email: "safe@example.com", client_phone: "+14145550111", vehicle: { year: 2022, make: "Toyota", model: "Camry", mileage: 1000, vin: null }, history: [] }] })));
  await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(ok({ success: true, feedback: [] })));
  return { maliciousService, maliciousCustomer };
}

test("booking-derived schedule and customer insights never reinterpret stored text as markup", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  const payload = await mockWorkspace(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  const schedule = page.locator("[data-hc-live-schedule]");
  const customers = page.locator("[data-hc-live-customers]");
  await expect(schedule).toBeVisible();
  await expect(customers).toBeVisible();
  await expect(schedule).toContainText(payload.maliciousService);
  await expect(customers).toContainText(payload.maliciousCustomer.replace(/<[^>]+>/g, "").trim());
  await expect(page.locator("[data-hc-live-opportunity-copy]")).toContainText("Завершённых визитов: 1");

  expect(await schedule.locator("img").count()).toBe(0);
  expect(await schedule.locator("svg").count()).toBe(0);
  expect(await customers.locator("svg").count()).toBe(0);
  const executed = await page.evaluate(() => (window as any).__hcOwnerPwned ?? null);
  expect(executed).toBeNull();
});
