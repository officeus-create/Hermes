import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

test("Repair Shop appointments exposes Day Week Month Agenda and Google Calendar", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill(json({ success:true, specialist:{ id:"owner-1", role:"Shop Owner" } }));
    if (path === "/api/repair-shop/profile") return route.fulfill(json({ success:true, shop:{ id:"shop-1", slug:"calendar-test-shop", name:"Calendar Test Shop", address_line1:"100 Main St", city:"Little Rock", state:"AR", postal_code:"72201", timezone:"America/Chicago" } }));
    if (path === "/api/repair-shop/bookings") return route.fulfill(json({ success:true, bookings:[
      { id:"b1", service_name:"Brake Service", duration_minutes:60, appointment_date:"2026-09-09", start_time:"09:00", end_time:"10:00", status:"confirmed", client_name:"Alex Driver", client_email:"alex@example.com", client_phone:"5015550101", technician:{id:"t1",name:"Marcus Johnson"}, vehicle:{year:2022,make:"Ford",model:"F-150",mileage:44000,vin:null}, history:[] },
      { id:"b2", service_name:"Diagnostics", duration_minutes:60, appointment_date:"2026-09-10", start_time:"11:00", end_time:"12:00", status:"in_progress", client_name:"Sam Owner", client_email:"sam@example.com", client_phone:"5015550102", technician:{id:"t2",name:"Ethan Walker"}, vehicle:{year:2021,make:"Toyota",model:"Camry",mileage:55000,vin:null}, history:[] }
    ] }));
    return route.fulfill(json({ success:true }));
  });
  await page.goto("/services/hermes-connect/repair-shops/appointments/?lang=ru", { waitUntil:"domcontentloaded" });
  const calendar = page.locator("[data-hc-calendar]");
  await expect(calendar).toBeVisible();
  await expect(calendar.getByRole("button", { name:"Неделя" })).toBeVisible();
  await expect(page.locator("#appointment-technician")).toContainText("Marcus Johnson");
  await expect(calendar.getByRole("link", { name:"Google Календарь" }).first()).toHaveAttribute("href", /calendar\.google\.com\/calendar\/render/);
  await calendar.getByRole("button", { name:"Месяц" }).click();
  await expect(calendar.locator(".hc-cal-month")).toBeVisible();
  await calendar.getByRole("button", { name:"Список" }).click();
  await expect(page.locator("#appointments-list")).toBeVisible();
});

test("Business directory profile stays unclaimed and indexable", async ({ page }) => {
  await page.goto("/businesses/arkansas/sherwood/seans-autopro-mobile/", { waitUntil:"domcontentloaded" });
  await expect(page.getByRole("heading", { level:1, name:"Sean's AutoPro Mobile", exact:true })).toBeVisible();
  await expect(page.getByText("Unclaimed profile", { exact:true })).toBeVisible();
  await expect(page.getByText("Not a Hermes customer", { exact:true })).toBeVisible();
  await expect(page.getByText("Off until owner verification", { exact:true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/businesses/arkansas/sherwood/seans-autopro-mobile/");
  const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schema.join("\n")).toContain("AutoRepair");
});

test("Business directory exposes a 50-state coverage map without empty state links", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil:"domcontentloaded" });
  await expect(page.getByRole("heading", { level:2, name:"U.S. repair shop coverage map" })).toBeVisible();
  await expect(page.locator('a[href="/businesses/arkansas/"]')).toBeVisible();
  await expect(page.locator('a[href="/businesses/california/"]')).toHaveCount(0);
  await expect(page.locator('.state-tile.pending[aria-label="California: research queue"]')).toBeVisible();
});

test("Business directory has a state landing before city and profile routes", async ({ page }) => {
  await page.goto("/businesses/arkansas/", { waitUntil:"domcontentloaded" });
  await expect(page.getByRole("heading", { level:1, name:"Auto repair businesses in Arkansas" })).toBeVisible();
  await expect(page.locator('a[href="/businesses/arkansas/sherwood/"]')).toBeVisible();
  await expect(page.getByText("1 business profile", { exact:true })).toBeVisible();
});
