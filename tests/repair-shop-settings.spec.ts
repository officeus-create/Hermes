import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

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

test("Settings is a private owner workspace backed by the existing profile API", async ({ page }, testInfo) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  await expect(page.locator('[data-i18n="title"]')).toHaveText("Settings");
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

  await page.locator("#shop-name").fill("Hermes Test Garage Updated");
  await page.locator("#shop-city").fill("Little Rock");
  await page.locator("#shop-region").fill("Arkansas");
  await page.locator("#shop-country").fill("us");
  await page.locator("#shop-timezone").fill("America/Chicago");
  await page.locator("#save-profile").click();

  await expect(page.locator("#page-alert")).toContainText("Shop settings saved.");
  await expect(page.locator("#shop-name")).toHaveValue("Hermes Test Garage Updated");
  await expect(page.locator("#shop-city")).toHaveValue("Little Rock");
  await expect(page.locator("#shop-region")).toHaveValue("Arkansas");
  await expect(page.locator("#shop-country")).toHaveValue("US");
  await captureEvidence(page, testInfo, "settings-en-profile");
});

test("Settings accepts non-US region, country and IANA timezone", async ({ page }) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });

  await page.locator("#shop-city").fill("Kyiv");
  await page.locator("#shop-region").fill("Kyiv");
  await page.locator("#shop-country").fill("ua");
  await page.locator("#shop-postal").fill("01001");
  await page.locator("#shop-timezone").fill("Europe/Kyiv");
  await page.locator("#save-profile").click();

  await expect(page.locator("#page-alert")).toContainText("Shop settings saved.");
  await expect(page.locator("#shop-city")).toHaveValue("Kyiv");
  await expect(page.locator("#shop-region")).toHaveValue("Kyiv");
  await expect(page.locator("#shop-country")).toHaveValue("UA");
  await expect(page.locator("#shop-timezone")).toHaveValue("Europe/Kyiv");
});

test("Settings preserves Russian UX and mobile CRM navigation", async ({ page }, testInfo) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/settings/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-i18n="title"]')).toHaveText("Настройки");
  await expect(page.locator(".repair-crm-nav-item.is-active")).toContainText("Настройки");
  await expect(page.locator('[data-i18n="profileTitle"]')).toHaveText("Профиль СТО");
  await expect(page.locator('[data-i18n="region"]')).toHaveText("Регион / штат");
  await expect(page.locator('[data-i18n="country"]')).toHaveText("Код страны");
  await expect(page.locator("#save-profile")).toHaveText("Сохранить профиль СТО");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await captureEvidence(page, testInfo, "settings-ru-profile");

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    await page.locator("[data-repair-crm-menu]").click();
    await expect(page.locator(".repair-crm-sidebar")).toBeInViewport();
    await expect(page.getByRole("link", { name: "Настройки" })).toHaveAttribute("aria-current", "page");
    await captureEvidence(page, testInfo, "settings-ru-mobile-drawer", false);
  }
});

test("Settings keeps a working keyboard skip-link target", async ({ page }) => {
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