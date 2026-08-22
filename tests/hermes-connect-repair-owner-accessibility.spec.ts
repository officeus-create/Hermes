import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status:200, contentType:"application/json", body:JSON.stringify(body) });

async function mockDashboard(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill(ok({ success:true, specialist:{ id:"owner-1", name:"Owner", email:"owner@example.com", role:"Shop Owner" } })));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success:true, shop:{ id:"shop-1", slug:"apex-auto", name:"Apex Auto", city:"Milwaukee", state:"WI", timezone:"America/Chicago" } })));
  await page.route("**/api/repair-shop/access", (route) => route.fulfill(ok({ success:true, access:{ state:"trialing", plan_id:"repair_shop_founding", plan_name:"Founding Shop Plan", next_action:"choose_plan" } })));
  await page.route("**/api/services", (route) => route.fulfill(ok({ success:true, services:[{ id:"svc-1", name:"Diagnostics", duration_minutes:45 }] })));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(ok({ success:true, timezone:"America/Chicago", days:[] })));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success:true, bookings:[] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success:true, feedback:[] })));
}

test("Repair Shop Owner OS exposes main landmark, keyboard focus and 44px mobile controls", async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await mockDashboard(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=uk", { waitUntil:"domcontentloaded" });
  await expect(page.locator('[data-hc-owner-workspace="live"]')).toBeVisible();
  await expect(page.locator("#main-content")).toBeVisible();

  const controls = page.locator(".hc-owner-live-mobile-nav a");
  expect(await controls.count()).toBeGreaterThanOrEqual(5);
  for (let index = 0; index < await controls.count(); index += 1) {
    const box = await controls.nth(index).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  const first = controls.first();
  await first.focus();
  const focusStyle = await first.evaluate((node) => {
    const style = getComputedStyle(node);
    return { width:style.outlineWidth, style:style.outlineStyle, color:style.outlineColor };
  });
  expect(focusStyle.width).not.toBe("0px");
  expect(focusStyle.style).not.toBe("none");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("Repair Shop Owner OS honors reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion:"reduce" });
  await mockDashboard(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil:"domcontentloaded" });
  await expect(page.locator('[data-hc-owner-workspace="live"]')).toBeVisible();
  const duration = await page.locator(".hc-owner-live-intelligence").evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(duration === "0.01ms" || duration === "0s").toBe(true);
});
