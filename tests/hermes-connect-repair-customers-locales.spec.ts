import { expect, test } from "@playwright/test";

const cases = [
  ["en", "Customers", "Customer search"],
  ["ru", "Клиенты", "Поиск клиентов"],
  ["uk", "Клієнти", "Пошук клієнтів"],
  ["es", "Clientes", "Buscar clientes"],
  ["it", "Clienti", "Cerca clienti"],
  ["fr", "Clients", "Rechercher des clients"],
] as const;

const customerPayload = {
  success: true,
  customers: [{
    id: "customer-1",
    name: "Alex Morgan",
    email: "alex@example.com",
    phone: "+1 414 555 0112",
    total_bookings: 2,
    completed_visits: 1,
    cancelled_bookings: 0,
    last_activity_at: "2026-08-18T15:00:00Z",
    last_service_date: "2026-08-18",
    next_appointment: { booking_id:"booking-2", appointment_date:"2026-08-25", start_time:"10:30", service_name:"Diagnostics", status:"confirmed" },
    services: ["Oil change", "Diagnostics"],
    vehicles: [{ year:2021, make:"Ford", model:"F-150", mileage:84500, vin:"1FTFW1E50MFA12345", last_seen_date:"2026-08-18" }],
  }],
};

test("Repair Shop customer CRM keeps six-language parity and 390px fit", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, specialist:{ id:"owner-1", name:"Owner" } }) }));
  await page.route("**/api/repair-shop/customers", async (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify(customerPayload) }));
  await page.setViewportSize({ width:390, height:844 });

  for (const [locale, heading, searchLabel] of cases) {
    const suffix = locale === "en" ? "" : `?lang=${locale}`;
    await page.goto(`/services/hermes-connect/repair-shops/customers/${suffix}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByRole("region", { name: searchLabel })).toBeVisible();
    await expect(page.getByText("Alex Morgan")).toBeVisible();
    await expect(page.getByText("1FTFW1E50MFA12345", { exact:false })).toBeVisible();
    const dashboardHref = locale === "en" ? "/services/hermes-connect/repair-shops/dashboard/" : `/services/hermes-connect/repair-shops/dashboard/?lang=${locale}`;
    await expect(page.locator(".back-link")).toHaveAttribute("href", dashboardHref);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  }
});

test("Repair Shop customer CRM preserves locale when authentication expires", async ({ page }) => {
  await page.route("**/api/auth/me", async (route) => route.fulfill({ status:401, contentType:"application/json", body:JSON.stringify({ success:false, error:"not_authenticated" }) }));
  await page.goto("/services/hermes-connect/repair-shops/customers/?lang=fr");
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/auth\/\?lang=fr$/);
});
