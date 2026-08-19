import { expect, test } from "@playwright/test";

const shopPayload = {
  success: true,
  shop: {
    id: "shop-browser-p0",
    name: "Browser P0 Auto Care",
    slug: "browser-p0-shop",
    phone: "+1 414 555 0100",
    address_line1: "100 Test Way",
    city: "Milwaukee",
    state: "WI",
    postal_code: "53202",
    timezone: "America/Chicago",
  },
  services: [{ id: "service-browser-p0", name: "Brake inspection", duration_minutes: 60 }],
  availability: Array.from({ length: 7 }, (_, day_of_week) => ({
    day_of_week,
    is_open: true,
    start_time: "09:00",
    end_time: "17:00",
  })),
  capabilities: {
    vehicle_types: ["passenger_light"],
    fleet_service: false,
    mobile_roadside: false,
    emergency_24_7: false,
  },
};

const stubOwnerWorkspaceApis = async (page: any) => {
  await page.route("**/api/repair-shop/profile", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success:true, shop:null }) });
  });
  await page.route("**/api/services", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success:true, services:[] }) });
  });
  await page.route("**/api/repair-shop/bookings", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success:true, bookings:[] }) });
  });
  await page.route("**/api/repair-shop/feedback", async (route: any) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success:true, feedback:[] }) });
  });
  await page.route("**/api/repair-shop/capabilities", async (route: any) => {
    await route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success:false, error:"shop_profile_required" }) });
  });
};

test.describe("Hermes Connect Repair Shop P0 production-flow regressions", () => {
  test("booking uses one public shop read, localizes Russian content, and keeps 390px usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let publicShopReads = 0;

    await page.route("**/api/public/repair-shop?slug=browser-p0-shop", async (route) => {
      publicShopReads += 1;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(shopPayload) });
    });

    await page.goto("/services/hermes-connect/repair-shops/booking/?shop=browser-p0-shop&lang=ru");

    await expect(page.locator("#shop-title")).toHaveText("Browser P0 Auto Care");
    await expect(page.locator("#booking-title")).toHaveText("Записаться на услугу");
    await expect(page.locator("[data-hc-english-only]")).toHaveCount(0);
    await expect(page.locator(".hc-content-language")).toContainText("русский");

    const familyNav = page.locator(".hc-family-nav");
    await expect(familyNav).toContainText("СТО");
    await expect(familyNav).toContainText("Все продукты");
    await expect(familyNav).not.toContainText("Load Analyzer");
    await expect(familyNav).not.toContainText("Rate Negotiator");

    await page.waitForTimeout(150);
    expect(publicShopReads).toBe(1);

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("booking 503 never exposes raw backend codes and keeps the error card inside 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/api/public/repair-shop?slug=preview-db-missing", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ success:false, error:"database_not_configured" }),
      });
    });

    await page.goto("/services/hermes-connect/repair-shops/booking/?shop=preview-db-missing&lang=ru");

    await expect(page.locator("#shop-title")).toHaveText("Онлайн-запись временно недоступна.");
    await expect(page.locator("#shop-meta")).toContainText("Попробуйте ещё раз через несколько минут");
    await expect(page.locator("#page-alert")).not.toContainText("database_not_configured");
    await expect(page.locator(".booking-page .hero")).toHaveAttribute("data-hc-booking-error", "true");
    await expect(page.locator("body")).not.toContainText("database_not_configured");

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("successful owner login enters the dashboard and preserves locale", async ({ page }) => {
    let authenticated = false;

    await page.route("**/api/auth/me", async (route) => {
      if (!authenticated) {
        await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success:false, error:"unauthorized" }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success:true, specialist:{ id:"owner-p0", name:"QA Owner", email:"owner@example.com", role:"Shop Owner" } }) });
    });
    await page.route("**/api/auth/login", async (route) => {
      authenticated = true;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success:true }) });
    });
    await stubOwnerWorkspaceApis(page);

    await page.goto("/services/hermes-connect/repair-shops/auth/?mode=login&lang=ru");
    await page.locator("#login-email").fill("owner@example.com");
    await page.locator("#login-password").fill("test-password");
    await page.locator("#login-form button[type='submit']").click();

    await page.waitForURL(/\/services\/hermes-connect\/repair-shops\/dashboard\/\?lang=ru$/);
    await expect(page.locator(".workspace-page")).toBeVisible();
    await expect(page.locator(".hc-family-nav")).not.toContainText("Load Analyzer");
  });

  test("successful owner registration enters the dashboard and preserves locale", async ({ page }) => {
    let authenticated = false;

    await page.route("**/api/auth/me", async (route) => {
      if (!authenticated) {
        await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success:false, error:"unauthorized" }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success:true, specialist:{ id:"owner-new", name:"New Owner", email:"new@example.com", role:"Shop Owner" } }) });
    });
    await page.route("**/api/auth/register", async (route) => {
      authenticated = true;
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success:true }) });
    });
    await stubOwnerWorkspaceApis(page);

    await page.goto("/services/hermes-connect/repair-shops/auth/?mode=register&lang=ru");
    await page.locator("#reg-name").fill("New Owner");
    await page.locator("#reg-email").fill("new@example.com");
    await page.locator("#reg-password").fill("test-password");
    await page.locator("#register-form button[type='submit']").click();

    await page.waitForURL(/\/services\/hermes-connect\/repair-shops\/dashboard\/\?lang=ru$/);
    await expect(page.locator(".workspace-page")).toBeVisible();
  });
});
