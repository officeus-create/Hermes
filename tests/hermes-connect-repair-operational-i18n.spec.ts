import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
const shop = { id:"shop-i18n", slug:"apex-auto", name:"Apex Auto", phone:"+14145550100", address_line1:"123 Main St", city:"Milwaukee", state:"WI", postal_code:"53202", timezone:"America/Chicago" };
const services = [{ id:"svc-1", name:"Diagnostics", duration_minutes:45, owner_specialist_id:"owner-i18n" }];
const bookings = [{
  id:"booking-i18n", service_name:"Diagnostics", duration_minutes:45, appointment_date:"2026-08-20", start_time:"09:00", end_time:"09:45", status:"confirmed",
  client_name:"Jamie Driver", client_email:"jamie@example.com", client_phone:"+14145550111",
  vehicle:{ year:2022, make:"Ford", model:"F-150", mileage:50000, vin:null },
  history:[{ id:"h-1", booking_id:"booking-i18n", from_status:null, to_status:"confirmed", changed_at:"2026-08-19T12:00:00Z" }]
}];

async function mockDashboard(page: any) {
  await page.route("**/api/auth/me", (route: any) => route.fulfill(ok({ success:true, specialist:{ id:"owner-i18n", name:"Alex Owner", email:"owner@example.com", role:"Shop Owner" } })));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill(ok({ success:true, shop })));
  await page.route("**/api/repair-shop/access", (route: any) => route.fulfill(ok({ success:true, access:{ state:"trialing", plan_id:"repair_shop_founding", plan_name:"Founding Shop Plan", next_action:"choose_plan" } })));
  await page.route("**/api/repair-shop/availability", (route: any) => route.fulfill(ok({ success:true, timezone:"America/Chicago", days:[] })));
  await page.route("**/api/services", (route: any) => route.fulfill(ok({ success:true, services })));
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill(ok({ success:true, bookings })));
  await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(ok({ success:true, feedback:[] })));
}

const cases = [
  ["ru", "Профиль СТО", "Услуги", "Входящие записи", "Подтверждено", "Изменить статус…"],
  ["uk", "Профіль СТО", "Послуги", "Вхідні записи", "Підтверджено", "Змінити статус…"],
  ["es", "Perfil del taller", "Servicios", "Bandeja de reservas", "Confirmada", "Cambiar estado…"],
  ["it", "Profilo officina", "Servizi", "Prenotazioni", "Confermata", "Cambia stato…"],
  ["fr", "Profil de l’atelier", "Services", "Boîte de réservations", "Confirmée", "Changer le statut…"],
] as const;

test.describe("Repair Shop operational dashboard localization", () => {
  for (const [locale, profile, servicesTitle, bookingsTitle, confirmed, changeStatus] of cases) {
    test(`${locale} localizes static and dynamic owner operations`, async ({ page }) => {
      await page.setViewportSize({ width:390, height:844 });
      await mockDashboard(page);
      await page.goto(`/services/hermes-connect/repair-shops/dashboard/?lang=${locale}`, { waitUntil:"domcontentloaded" });

      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("#profile-title")).toHaveText(profile);
      await expect(page.locator("#services-title")).toHaveText(servicesTitle);
      await expect(page.locator("#bookings-title")).toHaveText(bookingsTitle);
      await expect(page.locator("#bookings-list .status-pill")).toHaveText(confirmed);
      await expect(page.locator("#bookings-list .status-select option").first()).toHaveText(changeStatus);

      await expect(page.locator('a[href*="/customers/"]')).toHaveAttribute("href", new RegExp(`lang=${locale}`));
      await expect(page.locator('a[href*="/availability/"]')).toHaveAttribute("href", new RegExp(`lang=${locale}`));
      await expect(page.locator("#open-link-btn")).toHaveAttribute("href", new RegExp(`lang=${locale}`));

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow).toBe(false);
    });
  }

  test("English stays the default operational language without lang", async ({ page }) => {
    await mockDashboard(page);
    await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil:"domcontentloaded" });
    await expect(page.locator("#profile-title")).toHaveText("Shop profile");
    await expect(page.locator("#bookings-list .status-pill")).toHaveText("Confirmed");
    await expect(page.locator("#open-link-btn")).not.toHaveAttribute("href", /lang=/);
  });

  test("Spanish status change produces a localized success alert", async ({ page }) => {
    await mockDashboard(page);
    await page.route("**/api/repair-shop/bookings/*/status", (route: any) => route.fulfill(ok({ success:true, booking:{ ...bookings[0], status:"in_progress" }, history:[] })));
    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=es", { waitUntil:"domcontentloaded" });

    const select = page.locator("#bookings-list .status-select");
    await expect(select).toBeVisible();
    await select.selectOption("in_progress");
    await expect(page.locator("#workspace-alert")).toHaveText("Estado de la reserva cambiado a En curso.");
    await expect(page.locator("#workspace-alert")).not.toContainText("Booking moved to");
  });

  test("Owner OS enhancers do not duplicate core owner GET requests", async ({ page }) => {
    const reads = { profile:0, services:0, bookings:0 };
    await page.route("**/api/auth/me", (route: any) => route.fulfill(ok({ success:true, specialist:{ id:"owner-i18n", name:"Alex Owner", email:"owner@example.com", role:"Shop Owner" } })));
    await page.route("**/api/repair-shop/profile", (route: any) => { reads.profile += 1; return route.fulfill(ok({ success:true, shop })); });
    await page.route("**/api/services", (route: any) => { if (route.request().method() === "GET") reads.services += 1; return route.fulfill(ok({ success:true, services })); });
    await page.route("**/api/repair-shop/bookings", (route: any) => { reads.bookings += 1; return route.fulfill(ok({ success:true, bookings })); });
    await page.route("**/api/repair-shop/access", (route: any) => route.fulfill(ok({ success:true, access:{ state:"trialing", plan_id:"repair_shop_founding", plan_name:"Founding Shop Plan", next_action:"choose_plan" } })));
    await page.route("**/api/repair-shop/availability", (route: any) => route.fulfill(ok({ success:true, timezone:"America/Chicago", days:[] })));
    await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(ok({ success:true, feedback:[] })));

    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil:"networkidle" });
    await expect(page.locator('[data-hc-owner-workspace="live"]')).toBeVisible();
    expect(reads).toEqual({ profile:1, services:1, bookings:1 });
  });
});