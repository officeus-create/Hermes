import { expect, test } from "@playwright/test";

async function mockAvailabilityWorkspace(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      specialist: { name: "Owner", email: "owner@example.com", role: "Shop Owner" },
    }),
  }));

  await page.route("**/api/repair-shop/availability", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      timezone: "America/Chicago",
      days: [
        { day_of_week: 1, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 2, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 3, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 4, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 5, is_open: true, start_time: "09:00", end_time: "17:00" },
        { day_of_week: 6, is_open: false, start_time: null, end_time: null },
        { day_of_week: 0, is_open: false, start_time: null, end_time: null },
      ],
    }),
  }));
}

function chicagoDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function mockDashboardWorkspace(page: import("@playwright/test").Page) {
  const appointmentDate = chicagoDate();
  await page.route("**/api/auth/me", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { name: "Owner", email: "owner@example.com", role: "Shop Owner" } }),
  }));
  await page.route("**/api/repair-shop/profile", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, shop: { id: "shop-1", name: "Northstar Auto Care", slug: "northstar-auto-care", phone: "+1 414 555 0100", address_line1: "102 Test Way", city: "Milwaukee", state: "WI", postal_code: "53202", timezone: "America/Chicago" } }),
  }));
  await page.route("**/api/services", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, services: [
      { id: "s1", name: "Brake inspection", duration_minutes: 30, owner_specialist_id: "owner-1" },
      { id: "s2", name: "Oil service", duration_minutes: 45, owner_specialist_id: "owner-1" },
      { id: "s3", name: "Fleet diagnostic", duration_minutes: 60, owner_specialist_id: "owner-1" },
    ] }),
  }));
  await page.route("**/api/repair-shop/bookings", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, bookings: [{
      id: "booking-today",
      service_name: "Brake inspection",
      duration_minutes: 30,
      appointment_date: appointmentDate,
      start_time: "10:00",
      end_time: "10:30",
      status: "confirmed",
      client_name: "Test Customer",
      client_email: "customer@example.com",
      client_phone: "+1 414 555 0199",
      vehicle: null,
      history: [],
    }] }),
  }));
  await page.route("**/api/repair-shop/feedback", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, feedback: [] }),
  }));
  return appointmentDate;
}

test("Repair Shop owner availability uses the shared Pearl-first workspace grammar", async ({ page }) => {
  await mockAvailabilityWorkspace(page);
  await page.goto("/services/hermes-connect/repair-shops/availability/");

  await expect(page.getByRole("heading", { name: "Weekly availability" })).toBeVisible();
  await expect(page.locator("#timezone-pill")).toContainText("America/Chicago");
  await expect(page.locator(".day-row")).toHaveCount(7);

  const visual = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(".availability-page");
    const panel = document.querySelector<HTMLElement>(".availability-page .panel");
    const button = document.querySelector<HTMLElement>("#save-availability-btn");
    if (!root || !panel || !button) return null;

    const pearlProbe = document.createElement("div");
    pearlProbe.style.backgroundColor = "var(--hermes-pearl)";
    document.body.appendChild(pearlProbe);

    const rootStyle = getComputedStyle(root);
    const panelStyle = getComputedStyle(panel);
    const buttonStyle = getComputedStyle(button);
    const canonicalPearl = getComputedStyle(pearlProbe).backgroundColor;
    pearlProbe.remove();

    return {
      rootBackgroundColor: rootStyle.backgroundColor,
      rootBackgroundImage: rootStyle.backgroundImage,
      rootUsesCanonicalPearl: rootStyle.backgroundColor === canonicalPearl,
      panelRadius: panelStyle.borderRadius,
      buttonBackground: buttonStyle.backgroundColor,
      buttonBackgroundImage: buttonStyle.backgroundImage,
      buttonColor: buttonStyle.color,
      buttonRadius: buttonStyle.borderRadius,
    };
  });

  const viewportWidth = page.viewportSize()?.width ?? 1440;
  const expectedPanelRadius = viewportWidth <= 720 ? "18px" : "22px";

  expect(visual).not.toBeNull();
  expect(visual!.rootBackgroundColor).toBe("rgb(247, 246, 243)");
  expect(visual!.rootBackgroundImage).toMatch(/(?:linear|radial)-gradient\(/);
  expect(visual!.rootUsesCanonicalPearl).toBe(true);
  expect(visual!.panelRadius).toBe(expectedPanelRadius);
  expect(visual!.buttonBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.buttonBackgroundImage).toBe("none");
  expect(visual!.buttonColor).toBe("rgb(255, 255, 255)");
  expect(visual!.buttonRadius).toBe("12px");
});

test("Repair Shop owner availability remains usable on mobile after workspace convergence", async ({ page }) => {
  await mockAvailabilityWorkspace(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/availability/");

  await expect(page.getByRole("heading", { name: "Weekly availability" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save weekly availability" })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("Repair Shop owner dashboard derives a useful Today overview from existing rendered state", async ({ page }) => {
  const appointmentDate = await mockDashboardWorkspace(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/");

  const today = page.locator("[data-hc-today-overview]");
  await expect(today).toBeVisible();
  await expect(today.getByRole("heading", { name: "What needs attention now" })).toBeVisible();
  await expect(today.locator("[data-hc-today-bookings]")).toHaveText("1");
  await expect(today.locator("[data-hc-active-bookings]")).toHaveText("1");
  await expect(today.locator("[data-hc-service-total]")).toHaveText("3");
  await expect(today.locator("[data-hc-next-booking]")).toContainText(appointmentDate);
  await expect(today.locator("[data-hc-today-ready]")).toHaveText("Profile ready");
});

test("Repair Shop Today overview remains compact at 390px", async ({ page }) => {
  await mockDashboardWorkspace(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru");

  const today = page.locator("[data-hc-today-overview]");
  await expect(today).toBeVisible();
  await expect(today.getByRole("heading", { name: "Что требует внимания сейчас" })).toBeVisible();
  const columns = await today.locator(".hc-today-grid").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
  expect(columns).toBe(1);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
