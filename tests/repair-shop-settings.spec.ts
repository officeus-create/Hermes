import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

type Staff = { id:string; name:string; role:string; specialties:string[]; active:boolean };
type ScheduleDay = { day_of_week:number; is_working:boolean; start_time:string|null; end_time:string|null; breaks:{start_time:string;end_time:string}[] };

let shop = {
  id: "shop-settings-1",
  slug: "hermes-test-garage",
  name: "Hermes Test Garage",
  phone: "+14145550100",
  address_line1: "123 Main St",
  city: "Milwaukee",
  state: "WI",
  region: "Wisconsin",
  country_code: "US",
  postal_code: "53202",
  timezone: "America/Chicago",
};
let staff:Staff[] = [];
let schedules = new Map<string,ScheduleDay[]>();

const defaultSchedule = ():ScheduleDay[] => Array.from({ length: 7 }, (_, day) => ({
  day_of_week: day,
  is_working: day > 0 && day < 6,
  start_time: day > 0 && day < 6 ? "09:00" : null,
  end_time: day > 0 && day < 6 ? "17:00" : null,
  breaks: day > 0 && day < 6 ? [{ start_time: "12:00", end_time: "12:30" }] : [],
}));

async function mockOwnerApis(page: Page) {
  shop = {
    ...shop,
    name: "Hermes Test Garage",
    city: "Milwaukee",
    state: "WI",
    region: "Wisconsin",
    country_code: "US",
    timezone: "America/Chicago",
  };
  staff = [{ id:"staff-1", name:"Alex Rivera", role:"Technician", specialties:["Brakes","Diagnostics"], active:true }];
  schedules = new Map([["staff-1", defaultSchedule()]]);

  await page.route("**/api/auth/me", (route) => route.fulfill(json({
    success: true,
    specialist: { id: "owner-settings-1", name: "Pilot Owner", email: "owner@example.com", role: "Shop Owner" },
  })));
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json({
    success: true,
    identity: { id: "owner-settings-1", name: "Pilot Owner", email: "owner@example.com", role: "Shop Owner" },
    owned_businesses: [{ key: "repair_shop", kind: "owned_business", id: shop.id, name: shop.name, slug: shop.slug, href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" }],
    workspaces: [],
    capabilities: { internal_ai: false },
  })));
  await page.route("**/api/repair-shop/profile", async (route) => {
    if (route.request().method() === "PUT") {
      const body = JSON.parse(route.request().postData() || "{}");
      const region = String(body.region || body.state || shop.region || "");
      const countryCode = String(body.country_code || shop.country_code || "US").toUpperCase();
      shop = { ...shop, ...body, region, country_code: countryCode, state: region || countryCode };
      return route.fulfill(json({ success: true, shop }));
    }
    return route.fulfill(json({ success: true, shop }));
  });
  await page.route("**/api/repair-shop/staff", async (route) => {
    const method = route.request().method();
    const body = method === "GET" ? {} : JSON.parse(route.request().postData() || "{}");
    if (method === "POST") {
      const id = `staff-${staff.length + 1}`;
      staff.push({ id, name:String(body.name), role:String(body.role || "Technician"), specialties:Array.isArray(body.specialties)?body.specialties:[], active:body.active !== false });
      return route.fulfill(json({ success:true, staff, created_id:id }, 201));
    }
    if (method === "PUT") {
      staff = staff.map((member) => member.id === body.id ? { ...member, ...body } : member);
      return route.fulfill(json({ success:true, staff }));
    }
    if (method === "DELETE") {
      staff = staff.filter((member) => member.id !== body.id);
      schedules.delete(String(body.id));
      return route.fulfill(json({ success:true, staff }));
    }
    return route.fulfill(json({ success:true, shop_id:shop.id, staff }));
  });
  await page.route("**/api/repair-shop/staff-schedule**", async (route) => {
    const method = route.request().method();
    if (method === "PUT") {
      const body = JSON.parse(route.request().postData() || "{}");
      schedules.set(String(body.staff_id), body.days || []);
      return route.fulfill(json({ success:true, staff_id:body.staff_id, timezone:shop.timezone, schedules:body.days || [], calendar_conflicts:[], calendar_conflicts_source:"local_only" }));
    }
    const url = new URL(route.request().url());
    const staffId = url.searchParams.get("staff_id") || staff[0]?.id || "";
    return route.fulfill(json({ success:true, shop_id:shop.id, timezone:shop.timezone, schedules:schedules.get(staffId) || [], calendar_conflicts:[], calendar_conflicts_source:"local_only" }));
  });
}

async function captureEvidence(page: Page, testInfo: TestInfo, name: string, fullPage = true) {
  const directory = path.resolve("artifacts/repair-shop-settings");
  await mkdir(directory, { recursive: true });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.addStyleTag({ content: ".skip-link{display:none!important}" });
  await page.screenshot({ path: path.join(directory, `${name}-${testInfo.project.name}.png`), fullPage, animations: "disabled" });
}

test("Company is a private owner workspace backed by profile, team and schedule APIs", async ({ page }, testInfo) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  await expect(page.locator('[data-i18n="title"]')).toHaveText("Company");
  await expect(page.locator(".repair-crm-nav-item.is-active")).toContainText("Settings");
  await expect(page.locator(".repair-crm-account-slot details[data-hc-account-switcher]")).toHaveCount(1);
  await expect(page.locator("#shop-name")).toHaveValue("Hermes Test Garage");
  await expect(page.locator("#shop-city")).toHaveValue("Milwaukee");
  await expect(page.locator("#shop-region")).toHaveValue("Wisconsin");
  await expect(page.locator("#shop-country")).toHaveValue("US");
  await expect(page.locator("#shop-timezone")).toHaveValue("America/Chicago");
  await expect(page.locator("#profile-state")).toHaveText("Saved");
  await expect(page.locator("#public-booking-card")).toBeVisible();
  await expect(page.locator("#public-booking-link")).toContainText("/services/hermes-connect/repair-shops/booking/?shop=hermes-test-garage");
  await expect(page.locator("#staff-list")).toContainText("Alex Rivera");
  await expect(page.locator("#staff-list")).toContainText("Brakes · Diagnostics");
  await expect(page.locator("#schedule-form")).toBeVisible();
  await expect(page.getByText("Google Calendar", { exact:true })).toBeVisible();
  await expect(page.getByText("Needs authorization", { exact:true })).toBeVisible();

  await page.locator("#shop-name").fill("Hermes Test Garage Updated");
  await page.locator("#shop-city").fill("Little Rock");
  await page.locator("#shop-region").fill("Arkansas");
  await page.locator("#shop-country").fill("us");
  await page.locator("#shop-timezone").fill("America/Chicago");
  await page.locator("#save-profile").click();

  await expect(page.locator("#page-alert")).toContainText("Changes saved.");
  await expect(page.locator("#shop-name")).toHaveValue("Hermes Test Garage Updated");
  await expect(page.locator("#shop-city")).toHaveValue("Little Rock");
  await expect(page.locator("#shop-region")).toHaveValue("Arkansas");
  await expect(page.locator("#shop-country")).toHaveValue("US");
  await captureEvidence(page, testInfo, "company-en-workspace");
});

test("Company can add an employee and save weekly shifts", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });

  await page.locator("#new-staff").click();
  await page.locator("#staff-name").fill("Maya Chen");
  await page.locator("#staff-role").fill("Master Technician");
  await page.locator("#staff-specialties").fill("Electrical, Diagnostics");
  await page.locator("#staff-form button[type=submit]").click();
  await expect(page.locator("#staff-list")).toContainText("Maya Chen");
  await expect(page.locator("#schedule-staff option")).toHaveCount(2);

  await page.locator("#schedule-staff").selectOption({ label:"Maya Chen" });
  await page.locator('.schedule-row[data-day="1"] .start-input').fill("08:00");
  await page.locator('.schedule-row[data-day="1"] .end-input').fill("16:00");
  await page.locator('.schedule-row[data-day="1"] .break-start-input').fill("12:30");
  await page.locator('.schedule-row[data-day="1"] .break-end-input').fill("13:00");
  await page.locator("#schedule-form button[type=submit]").click();
  await expect(page.locator("#page-alert")).toContainText("Changes saved.");
});

test("Company accepts non-US region, country and IANA timezone", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });

  await page.locator("#shop-city").fill("Kyiv");
  await page.locator("#shop-region").fill("Kyiv");
  await page.locator("#shop-country").fill("ua");
  await page.locator("#shop-postal").fill("01001");
  await page.locator("#shop-timezone").fill("Europe/Kyiv");
  await page.locator("#save-profile").click();

  await expect(page.locator("#page-alert")).toContainText("Changes saved.");
  await expect(page.locator("#shop-city")).toHaveValue("Kyiv");
  await expect(page.locator("#shop-region")).toHaveValue("Kyiv");
  await expect(page.locator("#shop-country")).toHaveValue("UA");
  await expect(page.locator("#shop-timezone")).toHaveValue("Europe/Kyiv");
});

test("Company preserves Russian core UX and mobile CRM navigation", async ({ page }, testInfo) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-i18n="title"]')).toHaveText("Компания");
  await expect(page.locator(".repair-crm-nav-item.is-active")).toContainText("Компания");
  await expect(page.locator('[data-i18n="teamTitle"]')).toHaveText("Команда");
  await expect(page.locator('[data-i18n="scheduleTitle"]')).toHaveText("Смены и перерывы");
  await expect(page.locator('[data-i18n="connectionsTitle"]')).toHaveText("Приложения и каналы");
  await expect(page.locator('[data-i18n="needsAuth"]')).toHaveText("Нужна авторизация");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await captureEvidence(page, testInfo, "company-ru-workspace");

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    await page.locator("[data-repair-crm-menu]").click();
    await expect(page.locator(".repair-crm-sidebar")).toBeInViewport();
    await expect(page.getByRole("link", { name: "Компания" })).toHaveAttribute("aria-current", "page");
    await captureEvidence(page, testInfo, "company-ru-mobile-drawer", false);
  }
});

test("Company keeps a working keyboard skip-link target", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });
  const skipLink = page.locator(".skip-link");
  await expect(page.locator("#main-content")).toHaveCount(1);
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
});