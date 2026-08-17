import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-1", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const shop = { id: "shop-1", slug: "apex-auto", name: "Apex Auto", phone: "+14145550100", address_line1: "123 Main St", city: "Milwaukee", state: "WI", postal_code: "53202", timezone: "America/Chicago" };
const emptyAvailability = Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, is_open: false, start_time: null, end_time: null }));
const capabilityState = { shop_id: "shop-1", vehicle_types: ["passenger_light"], fleet_service: false, mobile_roadside: false, emergency_24_7: false, parallel_booking_capacity: 1, updated_at: null };

test("owner can mark no-show and manage completed follow-up at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let noShowBody: any = null;
  const followupBodies: any[] = [];

  await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success: true, shop })));
  await page.route("**/api/repair-shop/access", (route) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(ok({ success: true, timezone: "America/Chicago", days: emptyAvailability })));
  await page.route("**/api/services", (route) => route.fulfill(ok({ success: true, services: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success: true, feedback: [] })));
  await page.route("**/api/repair-shop/capabilities", (route) => route.fulfill(ok({ success: true, capabilities: capabilityState })));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success: true, bookings: [
    { id: "booking-confirmed", service_name: "Diagnostics", duration_minutes: 45, appointment_date: "2026-08-18", start_time: "09:00", end_time: "09:45", status: "confirmed", client_name: "Jamie Driver", client_email: "jamie@example.com", client_phone: "+14145550111", vehicle: null, history: [{ id: "h1", booking_id: "booking-confirmed", from_status: null, to_status: "confirmed", changed_at: "2026-08-17T12:00:00Z" }] },
    { id: "booking-completed", service_name: "Oil change", duration_minutes: 30, appointment_date: "2026-08-17", start_time: "10:00", end_time: "10:30", status: "completed", client_name: "Morgan Fleet", client_email: "morgan@example.com", client_phone: "+14145550122", vehicle: null, history: [{ id: "h2", booking_id: "booking-completed", from_status: "in_progress", to_status: "completed", changed_at: "2026-08-17T11:00:00Z" }] },
    { id: "booking-no-show", service_name: "Brake inspection", duration_minutes: 30, appointment_date: "2026-08-16", start_time: "08:00", end_time: "08:30", status: "no_show", client_name: "Taylor Driver", client_email: "taylor@example.com", client_phone: "+14145550133", vehicle: null, history: [{ id: "h4", booking_id: "booking-no-show", from_status: "confirmed", to_status: "no_show", changed_at: "2026-08-16T08:05:00Z" }] },
  ] })));
  await page.route("**/api/repair-shop/followups", async (route) => {
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON();
      followupBodies.push(body);
      return route.fulfill(ok({ success: true, booking_id: body.booking_id, follow_up_needed: body.needed, updated_at: "2026-08-17T12:00:00Z" }));
    }
    return route.fulfill(ok({ success: true, followups: [] }));
  });
  await page.route("**/api/repair-shop/bookings/booking-confirmed/status", async (route) => {
    noShowBody = route.request().postDataJSON();
    return route.fulfill(ok({ success: true, booking: { id: "booking-confirmed", status: "no_show" }, history: [
      { id: "h1", booking_id: "booking-confirmed", from_status: null, to_status: "confirmed", changed_at: "2026-08-17T12:00:00Z" },
      { id: "h3", booking_id: "booking-confirmed", from_status: "confirmed", to_status: "no_show", changed_at: "2026-08-18T09:05:00Z" },
    ] }));
  });

  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  const persistedNoShow = page.locator('.booking-card[data-booking-id="booking-no-show"]');
  await expect(persistedNoShow.locator(".status-pill")).toHaveText("Неявка");
  await expect(persistedNoShow.locator(".history")).toContainText("Неявка");
  await expect(persistedNoShow.locator(".history")).not.toContainText("no show");

  const confirmed = page.locator('.booking-card[data-booking-id="booking-confirmed"]');
  await expect(confirmed.getByRole("button", { name: "Отметить неявку" })).toBeVisible();
  await confirmed.getByRole("button", { name: "Отметить неявку" }).click();
  await expect.poll(() => noShowBody).not.toBeNull();
  expect(noShowBody).toEqual({ status: "no_show" });
  await expect(confirmed.locator(".status-pill")).toHaveText("Неявка");
  await expect(confirmed.locator("[data-booking-action-status]")).toContainText("Запись отмечена как неявка");
  await expect(confirmed.locator(".history")).toContainText("Неявка");

  const completed = page.locator('.booking-card[data-booking-id="booking-completed"]');
  const follow = completed.getByRole("button", { name: "Запланировать follow-up" });
  await expect(follow).toBeVisible();
  await follow.click();
  await expect.poll(() => followupBodies.length).toBe(1);
  expect(followupBodies[0]).toEqual({ booking_id: "booking-completed", needed: true });
  await expect(completed.getByRole("button", { name: /Follow-up нужен/ })).toBeVisible();
  await completed.getByRole("button", { name: /Follow-up нужен/ }).click();
  await expect.poll(() => followupBodies.length).toBe(2);
  expect(followupBodies[1]).toEqual({ booking_id: "booking-completed", needed: false });
  await expect(completed.locator("[data-booking-action-status]")).toContainText("Follow-up выполнен");

  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
});
