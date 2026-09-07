import { expect, test } from "@playwright/test";

const slug = "i18n-contract-shop";
const shopPayload = {
  success: true,
  shop: {
    id: "shop-i18n-contract",
    name: "I18n Contract Auto Care",
    slug,
    phone: "+1 414 555 0100",
    address_line1: "100 Locale Way",
    city: "Milwaukee",
    state: "WI",
    postal_code: "53202",
    timezone: "America/Chicago",
  },
  services: [{ id: "service-i18n-contract", name: "Diagnostics", duration_minutes: 60 }],
  availability: Array.from({ length: 7 }, (_, day_of_week) => ({
    day_of_week,
    is_open: true,
    start_time: "09:00",
    end_time: "17:00",
  })),
};

const localeExpectations = [
  { lang: "en", title: "Book a service", select: "Select a service", confirm: "Confirm appointment" },
  { lang: "ru", title: "Записаться на услугу", select: "Выберите услугу", confirm: "Подтвердить запись" },
  { lang: "uk", title: "Записатися на послугу", select: "Оберіть послугу", confirm: "Підтвердити запис" },
  { lang: "es", title: "Reservar un servicio", select: "Selecciona un servicio", confirm: "Confirmar cita" },
  { lang: "it", title: "Prenota un servizio", select: "Seleziona un servizio", confirm: "Conferma appuntamento" },
  { lang: "fr", title: "Réserver un service", select: "Sélectionnez un service", confirm: "Confirmer le rendez-vous" },
] as const;

async function mockShop(page: any) {
  await page.route(`**/api/public/repair-shop?slug=${slug}`, async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload) });
  });
  await page.route(`**/api/public/repair-booking?shop=${slug}&date=*`, async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, shop: { id: shopPayload.shop.id, slug, timezone: shopPayload.shop.timezone }, busy: [] }),
    });
  });
}

for (const sample of localeExpectations) {
  test(`repair booking renders core UI in ${sample.lang}`, async ({ page }) => {
    await mockShop(page);
    const langQuery = sample.lang === "en" ? "" : `&lang=${sample.lang}`;
    await page.goto(`/services/hermes-connect/repair-shops/booking/?shop=${slug}${langQuery}`);

    await expect(page.locator("#booking-title")).toHaveText(sample.title);
    await expect(page.locator("#service-select option").first()).toHaveText(sample.select);
    await expect(page.locator("#submit-btn")).toHaveText(sample.confirm);
    expect(new URL(page.url()).searchParams.get("shop")).toBe(slug);
    expect(new URL(page.url()).searchParams.get("lang")).toBe(sample.lang === "en" ? null : sample.lang);

    await page.locator("#service-select").selectOption(shopPayload.services[0].id);
    const appointmentDate = await page.locator("#date-select option").nth(1).getAttribute("value");
    expect(appointmentDate).toBeTruthy();
    await page.locator("#date-select").selectOption(appointmentDate!);
    await expect(page.locator("#time-select option")).toHaveCount(16);
  });
}

test("repair booking never exposes unknown backend error codes to customers", async ({ page }) => {
  await page.route(`**/api/public/repair-shop?slug=${slug}`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload) });
  });
  await page.route(`**/api/public/repair-booking?shop=${slug}&date=*`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "internal_database_secret" }),
    });
  });

  await page.goto(`/services/hermes-connect/repair-shops/booking/?shop=${slug}&lang=ru`);
  await page.locator("#service-select").selectOption(shopPayload.services[0].id);
  const appointmentDate = await page.locator("#date-select option").nth(1).getAttribute("value");
  await page.locator("#date-select").selectOption(appointmentDate!);

  await expect(page.locator("#slot-state")).toHaveText("Не удалось загрузить актуальное свободное время.");
  await expect(page.locator("body")).not.toContainText("internal_database_secret");
});

test("repair booking localizes confirmed receipt and status", async ({ page }) => {
  await mockShop(page);
  await page.route("**/api/public/repair-booking", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const body = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        booking: {
          id: "repair-booking-i18n-contract",
          shop_id: shopPayload.shop.id,
          shop_name: shopPayload.shop.name,
          service_id: shopPayload.services[0].id,
          service_name: shopPayload.services[0].name,
          duration_minutes: 60,
          appointment_date: body.appointment_date,
          start_time: body.start_time,
          end_time: "11:00",
          status: "confirmed",
          client_name: body.client_name,
          client_email: body.client_email,
          client_phone: body.client_phone,
          vehicle: { year: body.vehicle_year, make: body.vehicle_make, model: body.vehicle_model, mileage: Number(body.mileage), vin: null },
          timezone: shopPayload.shop.timezone,
        },
      }),
    });
  });

  await page.goto(`/services/hermes-connect/repair-shops/booking/?shop=${slug}&lang=fr`);
  await page.locator("#service-select").selectOption(shopPayload.services[0].id);
  const appointmentDate = await page.locator("#date-select option").nth(1).getAttribute("value");
  await page.locator("#date-select").selectOption(appointmentDate!);
  await page.locator("#time-select").selectOption("10:00");
  await page.locator("#vehicle-year").fill("2022");
  await page.locator("#vehicle-make").fill("Ford");
  await page.locator("#vehicle-model").fill("Transit");
  await page.locator("#vehicle-mileage").fill("42000");
  await page.locator("#client-name").fill("Jean Test");
  await page.locator("#client-email").fill("jean@example.com");
  await page.locator("#client-phone").fill("+1 414 555 0199");
  await page.locator("#submit-btn").click();

  await expect(page.locator("#success-panel")).toBeVisible();
  await expect(page.locator("#success-panel h2")).toHaveText("Rendez-vous confirmé");
  await expect(page.locator("#receipt-status")).toHaveText("Confirmé");
  await expect(page.locator("#success-summary")).toContainText("votre rendez-vous");
  await expect(page.locator("#calendar-btn")).toContainText("Ajouter au calendrier");
});

test("repair booking defaults to English when lang is unsupported", async ({ page }) => {
  await mockShop(page);
  await page.goto(`/services/hermes-connect/repair-shops/booking/?shop=${slug}&lang=de`);
  await expect(page.locator("#booking-title")).toHaveText("Book a service");
  await expect(page.locator("#submit-btn")).toHaveText("Confirm appointment");
});
