import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status:200, contentType:"application/json", body:JSON.stringify(body) });
const services = [
  { id:"svc-1", name:"Diagnostics", duration_minutes:45, owner_specialist_id:"owner-1" },
  { id:"svc-2", name:"Oil change", duration_minutes:30, owner_specialist_id:"owner-1" },
  { id:"svc-3", name:"Brakes", duration_minutes:60, owner_specialist_id:"owner-1" },
];
const completed = {
  id:"booking-1", service_name:"Diagnostics", duration_minutes:45, appointment_date:"2026-08-18", start_time:"09:00", end_time:"09:45", status:"completed",
  client_name:"Jamie Driver", client_email:"jamie@example.com", client_phone:"+14145550111",
  vehicle:{ year:2022, make:"Ford", model:"F-150", mileage:50000, vin:null }, history:[]
};

async function mock(page: any, bookingRows: any[]) {
  await page.route("**/api/auth/me", (route: any) => route.fulfill(ok({ success:true, specialist:{ id:"owner-1", name:"Owner", email:"owner@example.com", role:"Shop Owner" } })));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill(ok({ success:true, shop:{ id:"shop-1", slug:"apex-auto", name:"Apex Auto", city:"Milwaukee", state:"WI", timezone:"America/Chicago" } })));
  await page.route("**/api/services", (route: any) => route.fulfill(ok({ success:true, services })));
  await page.route("**/api/repair-shop/availability", (route: any) => route.fulfill(ok({ success:true, timezone:"America/Chicago", days:[{ day_of_week:1, is_open:true, start_time:"09:00", end_time:"17:00" }] })));
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill(ok({ success:true, bookings:bookingRows })));
  await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(ok({ success:true, feedback:[] })));
  await page.route("**/api/repair-shop/access", (route: any) => route.fulfill(ok({ success:true, access:{ state:"trialing", plan_id:"repair_shop_founding", plan_name:"Founding Shop Plan", next_action:"choose_plan" } })));
}

test.describe("Repair Shop activation retention milestone", () => {
  test("first completed visit is 6/7 while plan decision stays available", async ({ page }) => {
    await mock(page, [completed]);
    await page.setViewportSize({ width:390, height:844 });
    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil:"networkidle" });

    const activation = page.locator("[data-repair-activation]");
    await expect(activation.locator(".repair-activation-progress")).toContainText("6/7");
    await expect(activation.locator("[data-repair-repeat-step]")).toHaveAttribute("data-complete", "false");
    await expect(activation.locator("[data-repair-repeat-step]")).toContainText("Повторная запись");
    await expect(activation.locator("[data-repair-next]")).toHaveAttribute("href", /\/services\/hermes-connect\/repair-shops\/plan\/\?lang=ru/);
    await expect(activation.locator("[data-repair-repeat-action]")).toContainText("Пригласить клиента записаться снова");
  });

  test("second persisted booking for the same customer makes retention milestone 7/7", async ({ page }) => {
    await mock(page, [completed, {
      ...completed,
      id:"booking-2",
      appointment_date:"2026-08-27",
      start_time:"11:00",
      end_time:"11:45",
      status:"confirmed",
      service_name:"Oil change",
      vehicle:{ ...completed.vehicle, mileage:51000 },
    }]);
    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=en", { waitUntil:"networkidle" });

    const activation = page.locator("[data-repair-activation]");
    await expect(activation.locator(".repair-activation-progress")).toContainText("7/7");
    await expect(activation.locator("[data-repair-repeat-step]")).toHaveAttribute("data-complete", "true");
    await expect(activation.locator("[data-repair-repeat-step]")).toContainText("Repeat booking");
    await expect(activation.locator("[data-repair-repeat-action]")).toHaveCount(0);
  });

  test("two different customers never count as repeat booking", async ({ page }) => {
    await mock(page, [completed, { ...completed, id:"booking-2", client_name:"Morgan Fleet", client_email:"morgan@example.com", client_phone:"+14145550122", status:"confirmed" }]);
    await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=es", { waitUntil:"networkidle" });

    const activation = page.locator("[data-repair-activation]");
    await expect(activation.locator(".repair-activation-progress")).toContainText("6/7");
    await expect(activation.locator("[data-repair-repeat-step]")).toHaveAttribute("data-complete", "false");
  });
});
