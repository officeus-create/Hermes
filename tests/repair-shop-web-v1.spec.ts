import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

const owner = { success: true, specialist: { id: "owner-1", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const shop = { id: "shop-1", slug: "apex-auto", name: "Apex Auto", phone: "+14145550100", address_line1: "123 Main St", city: "Milwaukee", state: "WI", postal_code: "53202", timezone: "America/Chicago" };
const emptyAvailability = Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, is_open: false, start_time: null, end_time: null }));

async function mockDashboard(page: any) {
  let services = [{ id: "svc-existing", name: "Tire rotation", duration_minutes: 30, owner_specialist_id: "owner-1" }];
  await page.route("**/api/auth/me", (route: any) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill(ok({ success: true, shop })));
  await page.route("**/api/repair-shop/access", (route: any) => route.fulfill(ok({ success: true, access: { state: "trialing", plan_id: "repair_shop_founding", plan_name: "Founding Shop Plan", current_period_end: null, next_action: "choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route: any) => route.fulfill(ok({ success: true, timezone: "America/Chicago", days: emptyAvailability })));
  await page.route("**/api/services", async (route: any) => {
    if (route.request().method() === "POST") {
      const input = route.request().postDataJSON();
      const service = { id: `svc-${services.length + 1}`, name: input.name, duration_minutes: input.duration_minutes, owner_specialist_id: "owner-1" };
      services = [...services, service];
      return route.fulfill(ok({ success: true, service }));
    }
    return route.fulfill(ok({ success: true, services }));
  });
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill(ok({ success: true, bookings: [{ id: "booking-1", service_name: "Diagnostics", duration_minutes: 45, appointment_date: "2026-08-18", start_time: "09:00", end_time: "09:45", status: "completed", client_name: "Jamie Driver", client_email: "jamie@example.com", client_phone: "+14145550111", vehicle: { year: 2022, make: "Ford", model: "F-150", mileage: 50000, vin: null }, history: [{ id: "h-1", booking_id: "booking-1", from_status: "in_progress", to_status: "completed", changed_at: "2026-08-17T12:00:00Z" }] }] })));
  await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(ok({ success: true, feedback: [] })));
}

test("owner dashboard exposes access, quick start, share, QR, customer contact and completion feedback at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => undefined });
  });

  let qrRequests = 0;
  let lastQrUrl = "";
  await page.route("https://quickchart.io/qr**", (route) => {
    qrRequests += 1;
    lastQrUrl = route.request().url();
    return route.fulfill({ status: 200, contentType: "image/png", body: "" });
  });
  await mockDashboard(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator("[data-web-v1-access]")).toContainText("Бесплатный стартовый доступ");
  await expect(page.locator("[data-web-v1-service-presets]")).toBeVisible();
  await expect(page.getByRole("button", { name: /Замена масла/ })).toBeVisible();
  await page.getByRole("button", { name: /Замена масла/ }).click();
  await expect(page.locator("#service-count")).toContainText("2 services");

  await expect(page.locator("[data-web-v1-share]")).toBeVisible();
  expect(qrRequests).toBe(0);
  await page.locator("[data-repair-qr-toggle]").click();
  await expect(page.locator("[data-repair-qr-panel]")).toBeVisible();
  await expect(page.locator("[data-repair-qr-image]")).toHaveAttribute("src", /quickchart\.io\/qr/);
  await expect.poll(() => qrRequests).toBe(1);
  const parsedQr = new URL(lastQrUrl);
  expect(parsedQr.searchParams.get("text")).toBe("http://localhost:4321/services/hermes-connect/repair-shops/booking/?shop=apex-auto");

  const contact = page.locator("[data-web-v1-contact]");
  await expect(contact.locator('a[href^="mailto:"]')).toHaveAttribute("href", /jamie%40example\.com|jamie@example\.com/);
  await expect(contact.locator('a[href^="tel:"]')).toHaveAttribute("href", "tel:+14145550111");
  await expect(contact.locator('a[href^="sms:"]')).toHaveAttribute("href", "sms:+14145550111");
  await expect(page.locator("[data-web-v1-feedback-nudge]")).toContainText("Первая работа завершена");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("weekday quick start fills Mon-Fri 8-5 without saving", async ({ page }) => {
  let putCount = 0;
  await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/availability", (route) => {
    if (route.request().method() === "PUT") putCount += 1;
    return route.fulfill(ok({ success: true, timezone: "America/Chicago", days: emptyAvailability }));
  });
  await page.goto("/services/hermes-connect/repair-shops/availability/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Mon–Fri|Пн–Пт|Lun–Vie|Lun–Ven/ }).click();

  const monday = page.locator('.day-row[data-day="1"]');
  const sunday = page.locator('.day-row[data-day="0"]');
  const mondayTimes = monday.locator('input[type="time"]');
  await expect(monday.locator('input[type="checkbox"]')).toBeChecked();
  await expect(mondayTimes.nth(0)).toHaveValue("08:00");
  await expect(mondayTimes.nth(1)).toHaveValue("17:00");
  await expect(sunday.locator('input[type="checkbox"]')).not.toBeChecked();
  expect(putCount).toBe(0);
});

test("booking confirmation offers a second service without clearing customer and vehicle details", async ({ page }) => {
  await page.route("**/api/public/repair-shop**", (route) => route.fulfill(ok({ success: true, shop, services: [{ id: "svc-1", name: "Oil change", duration_minutes: 30 }], availability: [{ day_of_week: 1, is_open: true, start_time: "08:00", end_time: "17:00" }] })));
  await page.goto("/services/hermes-connect/repair-shops/booking/?shop=apex-auto", { waitUntil: "domcontentloaded" });

  await page.locator("#client-name").fill("Jamie Driver");
  await page.locator("#client-email").fill("jamie@example.com");
  await page.locator("#vehicle-make").fill("Ford");
  await page.evaluate(() => document.getElementById("success-panel")?.classList.remove("hidden"));

  const again = page.locator("[data-web-v1-book-again]");
  await expect(again).toBeVisible();
  await again.click();
  await expect(page.locator("#booking-panel")).toBeVisible();
  await expect(page.locator("#client-name")).toHaveValue("Jamie Driver");
  await expect(page.locator("#client-email")).toHaveValue("jamie@example.com");
  await expect(page.locator("#vehicle-make")).toHaveValue("Ford");
});
