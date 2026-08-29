import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-locale", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };

async function mockSecondaryOwnerApis(page: import("@playwright/test").Page) {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill(json(owner));
    if (path === "/api/repair-shop/availability") {
      return route.fulfill(json({
        success: true,
        timezone: "America/Chicago",
        days: Array.from({ length: 7 }, (_, day_of_week) => ({ day_of_week, is_open: day_of_week >= 1 && day_of_week <= 5, start_time: "08:00", end_time: "17:00" })),
      }));
    }
    if (path === "/api/repair-shop/customers") {
      return route.fulfill(json({
        success: true,
        customers: [{
          id: "customer-1",
          name: "Maria Rivera",
          email: "maria@example.com",
          phone: "+14145550111",
          total_bookings: 2,
          completed_visits: 1,
          cancelled_bookings: 0,
          last_activity_at: "2026-08-22T12:00:00Z",
          last_service_date: "2026-08-20",
          next_appointment: { booking_id: "booking-2", appointment_date: "2026-08-25", start_time: "10:00", service_name: "Brake inspection", status: "confirmed" },
          services: ["Brake inspection"],
          vehicles: [{ year: 2021, make: "Toyota", model: "Camry", mileage: null, vin: "4T1G11AK1MU123456", last_seen_date: "2026-08-20" }],
        }],
      }));
    }
    if (path === "/api/repair-shop/profile") {
      return route.fulfill(json({ success: true, shop: null }));
    }
    if (path === "/api/services") {
      return route.fulfill(json({ success: true, services: [{ id: "service-1", name: "Brake inspection", duration_minutes: 30, owner_specialist_id: "owner-locale" }] }));
    }
    if (path === "/api/repair-shop/bookings") {
      return route.fulfill(json({
        success: true,
        bookings: [{
          id: "booking-1",
          service_name: "Brake inspection",
          duration_minutes: 30,
          appointment_date: "2026-08-25",
          start_time: "10:00",
          end_time: "10:30",
          status: "confirmed",
          client_name: "Maria Rivera",
          client_email: "maria@example.com",
          client_phone: "+14145550111",
          vehicle: null,
          history: [],
        }],
      }));
    }
    if (path === "/api/repair-shop/feedback") {
      return route.fulfill(json({ success: true, feedback: [] }));
    }
    return route.fulfill(json({ success: true }));
  });
}

test("401 owner redirect recovers the selected Repair locale on auth", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(json({ success: false, error: "not_authenticated" }, 401)));
  await page.goto("/services/hermes-connect/repair-shops/availability/?lang=ru", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/auth\/\?lang=ru$/);
  await expect(page.locator("#auth-forms .auth-header h1")).toContainText(/СТО|владельца/i);
});

test("availability renders operational copy in Spanish", async ({ page }) => {
  await mockSecondaryOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/availability/?lang=es", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".availability-page h1")).toHaveText("Disponibilidad semanal");
  await expect(page.locator('.day-row[data-day="1"] strong')).toHaveText("Lunes");
  await expect(page.locator("#save-availability-btn")).toHaveText("Guardar disponibilidad");
});

test("customers renders static and dynamic owner copy in French", async ({ page }) => {
  await mockSecondaryOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/customers/?lang=fr", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".customers-page h1")).toHaveText("Clients");
  await expect(page.locator("#customer-search")).toHaveAttribute("placeholder", /Rechercher par nom/);
  await expect(page.locator("#customer-count")).toContainText("1 client");
  await expect(page.locator(".customer-header .muted.small")).toContainText("2 réservations · 1 terminées");
  await expect(page.locator(".customer-header .pill")).toHaveText("Prochain rendez-vous");
  await expect(page.locator(".next-appointment")).toContainText("Prochain:");
  await expect(page.locator(".vehicle-card strong")).toContainText("Kilométrage non indiqué");
  await expect(page.locator(".vehicle-card span")).toContainText("Dernière visite");
});

test("dashboard renders Russian static and API-backed owner workspace copy", async ({ page }) => {
  await mockSecondaryOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".workspace-page h1")).toHaveText(/Рабочее пространство.*СТО/);
  await expect(page.locator("#profile-state")).toHaveText("Не настроено");
  await expect(page.locator("#service-count")).toHaveText("1 услуга");
  await expect(page.locator(".status-pill")).toHaveText("Подтверждено");
  await expect(page.locator(".status-select")).toHaveAttribute("aria-label", /Изменить статус/);
  await expect(page.locator(".vehicle-line")).toHaveText("Данные автомобиля для этой записи не сохранены.");
  await expect(page.locator(".history")).toContainText("История статусов");
  await expect(page.locator(".history")).toContainText("История пока не записана.");
  await expect(page.locator("#feedback-empty")).toContainText("Отзывов пока нет");
  await expect(page.locator(".workspace-page")).not.toContainText("Change status…");
  await expect(page.locator(".workspace-page")).not.toContainText("Vehicle details were not captured for this booking.");
});
