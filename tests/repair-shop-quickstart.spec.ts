import { expect, test } from "@playwright/test";

const owner = { name: "Quick Start Owner", email: "owner@example.test", role: "Shop Owner" };
const shop = {
  id: "shop-quickstart",
  name: "Quick Start Auto",
  slug: "quick-start-auto",
  phone: "+1 414 555 0100",
  address_line1: "100 Test Ave",
  city: "Milwaukee",
  state: "WI",
  postal_code: "53202",
  timezone: "America/Chicago",
};

function emptyWeek() {
  return Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, is_open: false, start_time: null, end_time: null }));
}

async function mockSharedOwnerApis(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, specialist: owner }) }),
  );
  await page.route("**/api/repair-shop/profile", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, shop }) }),
  );
  await page.route("**/api/repair-shop/bookings", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, bookings: [] }) }),
  );
  await page.route("**/api/repair-shop/feedback", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, feedback: [] }) }),
  );
}

test("one click adds only missing starter services and becomes idempotent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSharedOwnerApis(page);

  const services: Array<{ id:string; name:string; duration_minutes:number; owner_specialist_id:string }> = [];
  let postCount = 0;
  await page.route("**/api/services", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, services }) });
    }
    if (route.request().method() === "POST") {
      postCount += 1;
      const payload = route.request().postDataJSON() as { name:string; duration_minutes:number };
      const existing = services.find((item) => item.name.toLowerCase() === payload.name.toLowerCase());
      if (existing) return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: "service_already_exists" }) });
      const service = { id: `svc-${services.length + 1}`, name: payload.name, duration_minutes: payload.duration_minutes, owner_specialist_id: "owner-1" };
      services.push(service);
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, service }) });
    }
    return route.continue();
  });
  await page.route("**/api/repair-shop/availability", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, timezone: shop.timezone, days: emptyWeek() }) }),
  );

  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });
  const quick = page.locator("[data-service-quickstart]");
  await expect(quick).toBeVisible();
  await expect(quick).toContainText("Добавьте 3 популярные услуги одним нажатием");

  await quick.getByRole("button", { name: "Добавить стартовые услуги" }).click();
  await expect.poll(() => services.length).toBe(3);
  await expect.poll(() => postCount).toBe(3);
  expect(services.map((item) => [item.name, item.duration_minutes])).toEqual([
    ["Oil change", 30],
    ["Diagnostics", 45],
    ["Brake inspection", 45],
  ]);

  await page.waitForLoadState("domcontentloaded");
  const reloadedQuick = page.locator("[data-service-quickstart]");
  await expect(reloadedQuick.getByRole("button", { name: "Добавить стартовые услуги" })).toBeDisabled();
  await expect(reloadedQuick).toContainText("Стартовые услуги уже настроены");
  expect(postCount).toBe(3);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("weekday preset fills the existing availability form but does not save until owner confirms", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSharedOwnerApis(page);

  let putCount = 0;
  let savedPayload: any = null;
  await page.route("**/api/repair-shop/availability", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, timezone: shop.timezone, days: emptyWeek() }) });
    }
    if (route.request().method() === "PUT") {
      putCount += 1;
      savedPayload = route.request().postDataJSON();
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, timezone: shop.timezone, days: savedPayload.days }) });
    }
    return route.continue();
  });

  await page.goto("/services/hermes-connect/repair-shops/availability/?lang=ru", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#timezone-pill")).toContainText("America/Chicago");

  const quick = page.locator("[data-hours-quickstart]");
  await expect(quick).toBeVisible();
  await expect(quick).toContainText("Заполнить стандартные часы по будням");
  await quick.getByRole("button", { name: "Пн–Пт · 8:00–17:00" }).click();

  for (const day of [1, 2, 3, 4, 5]) {
    const row = page.locator(`.day-row[data-day="${day}"]`);
    await expect(row.locator('input[type="checkbox"]')).toBeChecked();
    await expect(row.locator('input[type="time"]').nth(0)).toHaveValue("08:00");
    await expect(row.locator('input[type="time"]').nth(1)).toHaveValue("17:00");
  }
  for (const day of [0, 6]) await expect(page.locator(`.day-row[data-day="${day}"] input[type="checkbox"]`)).not.toBeChecked();
  expect(putCount).toBe(0);
  await expect(quick).toContainText("Ничего не сохранится");

  await page.locator("#save-availability-btn").click();
  await expect.poll(() => putCount).toBe(1);
  expect(savedPayload.days.filter((day: any) => day.is_open).map((day: any) => day.day_of_week).sort()).toEqual([1, 2, 3, 4, 5]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
