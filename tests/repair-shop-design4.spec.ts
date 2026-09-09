import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType:"application/json", body:JSON.stringify(body) });

const shop = {
  id:"shop-design4-1", slug:"northstar-auto-care", name:"Northstar Auto Care", phone:"+1 414 555 0100",
  address_line1:"102 Test Way", city:"Milwaukee", state:"WI", region:"Wisconsin", country_code:"US",
  postal_code:"53202", timezone:"America/Chicago",
};
const staff = [
  { id:"staff-1", name:"Alex Rivera", role:"Lead Technician", specialties:["Brakes","Diagnostics"], active:true },
  { id:"staff-2", name:"Maya Chen", role:"Technician", specialties:["Electrical","Inspections"], active:true },
];
const services = [
  { id:"svc-1", name:"Brake inspection", duration_minutes:30 },
  { id:"svc-2", name:"Fleet diagnostic", duration_minutes:60 },
  { id:"svc-3", name:"Oil service", duration_minutes:45 },
];
const shopDays = Array.from({ length:7 }, (_, day) => ({
  day_of_week:day, is_open:day>0&&day<6, start_time:day>0&&day<6?"08:00":null, end_time:day>0&&day<6?"17:00":null,
}));
const staffDays = Array.from({ length:7 }, (_, day) => ({
  day_of_week:day, is_working:day>0&&day<6, start_time:day>0&&day<6?"09:00":null, end_time:day>0&&day<6?"17:00":null,
  breaks:day>0&&day<6?[{ start_time:"12:00", end_time:"12:30" }]:[],
}));

async function mockDesign4Apis(page: Page) {
  await page.route("**/api/auth/me", (route) => route.fulfill(json({ success:true, specialist:{ id:"owner-design4", name:"Pilot Owner", email:"owner@example.com", role:"Shop Owner" } })));
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json({
    success:true,
    identity:{ id:"owner-design4", name:"Pilot Owner", email:"owner@example.com", role:"Shop Owner" },
    owned_businesses:[{ key:"repair_shop", kind:"owned_business", id:shop.id, name:shop.name, slug:shop.slug, href:"/services/hermes-connect/repair-shops/dashboard/", workspace_state:"live" }],
    workspaces:[], capabilities:{ internal_ai:false },
  })));
  await page.route("**/api/auth/logout", (route) => route.fulfill(json({ success:true })));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(json({ success:true, shop })));
  await page.route("**/api/repair-shop/staff", (route) => route.fulfill(json({ success:true, shop_id:shop.id, staff })));
  await page.route("**/api/repair-shop/staff-schedule**", (route) => {
    const url = new URL(route.request().url());
    const staffId = url.searchParams.get("staff_id") || staff[0].id;
    return route.fulfill(json({ success:true, shop_id:shop.id, staff_id:staffId, timezone:shop.timezone, schedules:staffDays, calendar_conflicts:[], calendar_conflicts_source:"local_only" }));
  });
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(json({ success:true, timezone:shop.timezone, days:shopDays })));
  await page.route("**/api/services", (route) => route.fulfill(json({ success:true, services })));
  await page.route("**/api/repair-shop/driver-discount", (route) => route.fulfill(json({
    success:true,
    discount:{ enabled:true, service_discount_percent:10, service_scope:"selected", service_ids:["svc-1","svc-2"], materials_discount_percent:5, materials_scope:"all", materials_items:[] },
  })));
  await page.route("**/api/repair-shop/access", (route) => route.fulfill(json({ success:true, access:{ state:"trialing", plan_id:"repair_shop_founding", plan_name:"Founding Shop Plan", current_period_end:null, next_action:"choose_plan" } })));
  await page.route("**/api/repair-shop/capabilities", (route) => route.fulfill(json({ success:true, capabilities:{} })));
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const dir = path.resolve("artifacts/repair-shop-design4");
  await mkdir(dir, { recursive:true });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    window.scrollTo(0,0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.addStyleTag({ content:".skip-link{display:none!important}" });
  await page.screenshot({ path:path.join(dir, `${name}-${testInfo.project.name}.png`), fullPage:true, animations:"disabled" });
}

const screens = [
  { slug:"company", heading:/Company|Компания/ },
  { slug:"team", heading:/Team|Команда/ },
  { slug:"schedule", heading:/Schedule|График/ },
  { slug:"driver-benefits", heading:/Driver Benefits|Льготы водителям/ },
  { slug:"preferences", heading:/Settings|Настройки/ },
] as const;

for (const screen of screens) {
  test(`Design 4 ${screen.slug} is a separate responsive CRM screen`, async ({ page }, testInfo) => {
    await mockDesign4Apis(page);
    const mobile = (page.viewportSize()?.width || 9999) <= 780;
    const suffix = mobile ? "?lang=ru" : "";
    await page.goto(`/services/hermes-connect/repair-shops/${screen.slug}/${suffix}`, { waitUntil:"domcontentloaded" });

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
    await expect(page.locator("[data-repair-crm-shell]")).toBeAttached();
    await expect(page.locator(".hc4-page-head h1")).toHaveText(screen.heading);
    await expect(page.locator(".repair-crm-sidebar")).toHaveCount(1);

    const active = page.locator(".repair-crm-sidebar .repair-crm-nav-item[aria-current='page']");
    await expect(active).toHaveCount(1);

    const geometry = await page.evaluate(() => ({
      viewport:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,
      bottomNav:document.querySelector<HTMLElement>(".repair-crm-mobile-quick")?.getBoundingClientRect() || null,
      mainBottom:document.querySelector<HTMLElement>("main")?.getBoundingClientRect().bottom || 0,
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);

    if (mobile) {
      const bottomNav = page.locator(".repair-crm-mobile-quick");
      await expect(bottomNav).toBeVisible();
      const navBox = await bottomNav.boundingBox();
      expect(navBox).not.toBeNull();
      expect(navBox!.height).toBeGreaterThanOrEqual(56);
      const mainPaddingBottom = await page.locator("main").evaluate((node) => Number.parseFloat(getComputedStyle(node).paddingBottom));
      expect(mainPaddingBottom).toBeGreaterThanOrEqual(80);
    } else {
      await expect(page.locator(".repair-crm-mobile-quick")).toBeHidden();
      await expect(page.locator("[data-repair-crm-date]")).not.toHaveText("");
      await expect(page.locator("[data-repair-crm-time]")).not.toHaveText("");
    }

    if (screen.slug === "team") {
      await expect(page.locator(".hc4-team-card")).toHaveCount(2);
      const teamLayout = await page.locator(".hc4-team-card").first().evaluate((node) => ({
        display:getComputedStyle(node).display,
        gap:getComputedStyle(node).gap,
        infoDisplay:getComputedStyle(node.querySelector(".hc4-team-info") as HTMLElement).display,
      }));
      expect(teamLayout.display).toBe("flex");
      expect(Number.parseFloat(teamLayout.gap)).toBeGreaterThan(0);
      expect(teamLayout.infoDisplay).toBe("grid");
    }

    await capture(page, testInfo, `design4-${screen.slug}`);
  });
}

test("Design 4 mobile Schedule edits one day at a time instead of seven stacked cards", async ({ page }) => {
  test.skip((page.viewportSize()?.width || 9999) > 780, "mobile-only schedule density check");
  await mockDesign4Apis(page);
  await page.goto("/services/hermes-connect/repair-shops/schedule/?lang=ru", { waitUntil:"domcontentloaded" });
  await expect(page.locator("#shop-day-tabs")).toBeVisible();
  await expect(page.locator("#shop-hours-list .hc4-schedule-row.is-mobile-selected")).toHaveCount(1);
  await expect(page.locator("#shop-hours-list .hc4-schedule-row:visible")).toHaveCount(1);
  await page.locator("#shop-day-tabs button").nth(3).click();
  await expect(page.locator("#shop-hours-list .hc4-schedule-row.is-mobile-selected")).toHaveCount(1);
  await expect(page.locator("#shop-hours-list .hc4-schedule-row:visible")).toHaveCount(1);
});
