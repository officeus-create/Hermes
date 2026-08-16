import { expect, test } from "@playwright/test";

const owner = { name: "Retention Owner", email: "owner@example.test", role: "Shop Owner" };
const shop = {
  id: "shop-retention",
  name: "Retention Auto",
  slug: "retention-auto",
  phone: "+1 414 555 0100",
  address_line1: "100 Test Ave",
  city: "Milwaukee",
  state: "WI",
  postal_code: "53202",
  timezone: "America/Chicago",
};
const services = [
  { id:"svc-1", name:"Oil change", duration_minutes:30, owner_specialist_id:"owner-1" },
  { id:"svc-2", name:"Diagnostics", duration_minutes:45, owner_specialist_id:"owner-1" },
  { id:"svc-3", name:"Brake inspection", duration_minutes:45, owner_specialist_id:"owner-1" },
];
const openWeek = Array.from({ length:7 }, (_, day) => ({ day_of_week:day, is_open:day >= 1 && day <= 5, start_time:day >= 1 && day <= 5 ? "08:00" : null, end_time:day >= 1 && day <= 5 ? "17:00" : null }));
const completedBooking = {
  id:"booking-1",
  service_name:"Diagnostics",
  duration_minutes:45,
  appointment_date:"2026-08-18",
  start_time:"09:00",
  end_time:"09:45",
  status:"completed",
  client_name:"Customer",
  client_email:"customer@example.test",
  client_phone:"+1 414 555 0111",
  vehicle:{ year:2022, make:"Ford", model:"Transit", mileage:24000, vin:null },
  history:[],
};

async function mockDashboard(page: import("@playwright/test").Page, feedback: any[] = []) {
  await page.route("**/api/auth/me", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, specialist:owner }) }));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, shop }) }));
  await page.route("**/api/services", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, services }) }));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, timezone:shop.timezone, days:openWeek }) }));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, bookings:[completedBooking] }) }));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ success:true, feedback }) }));
}

test("owner can use native share for the canonical booking link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable:true,
      value:async (payload: unknown) => { (window as any).__sharedPayload = payload; },
    });
  });
  await mockDashboard(page);
  await page.setViewportSize({ width:390, height:844 });
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil:"domcontentloaded" });

  const share = page.getByRole("button", { name:"Поделиться" });
  await expect(share).toBeVisible();
  await share.click();
  const payload = await page.evaluate(() => (window as any).__sharedPayload);
  expect(payload.title).toBe("Запись в моё СТО");
  expect(payload.url).toBe("http://127.0.0.1:4321/services/hermes-connect/repair-shops/booking/?shop=retention-auto");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("first completed booking prompts private feedback once per session", async ({ page }) => {
  await mockDashboard(page);
  await page.setViewportSize({ width:390, height:844 });
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil:"domcontentloaded" });

  const nudge = page.locator("[data-first-completion-feedback]");
  await expect(nudge).toBeVisible();
  await expect(nudge).toContainText("Вы завершили первую запись");
  await nudge.getByRole("button", { name:"Оставить приватный отзыв" }).click();
  await expect(page.locator("#feedback-category")).toHaveValue("booking");
  await expect(page.locator("#feedback-message")).toBeFocused();

  await nudge.getByRole("button", { name:"Не сейчас" }).click();
  await expect(nudge).toHaveCount(0);
  await page.reload({ waitUntil:"domcontentloaded" });
  await expect(page.locator("[data-first-completion-feedback]")).toHaveCount(0);
});

test("existing booking feedback suppresses the first-completion nudge", async ({ page }) => {
  await mockDashboard(page, [{ id:"feedback-1", category:"booking", rating:5, message:"Worked well", created_at:"2026-08-16T10:00:00Z", retention_until:"2027-02-12T10:00:00Z" }]);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil:"domcontentloaded" });
  await expect(page.locator("[data-first-completion-feedback]")).toHaveCount(0);
});
