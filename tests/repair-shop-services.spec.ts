import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

let services = [
  { id: "svc-brake", name: "Brake inspection", duration_minutes: 60 },
  { id: "svc-oil", name: "Oil change", duration_minutes: 30 },
];

async function mockOwnerApis(page: Page) {
  services = [
    { id: "svc-brake", name: "Brake inspection", duration_minutes: 60 },
    { id: "svc-oil", name: "Oil change", duration_minutes: 30 },
  ];
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true, account: { role: "Shop Owner" } }) });
  });
  await page.route("**/api/services", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, context: { id: "repair", vertical_key: "repair_shop" }, services }) });
    }
    if (method === "POST") {
      const body = JSON.parse(route.request().postData() || "{}");
      if (services.some((item) => item.name.toLowerCase() === String(body.name || "").toLowerCase())) {
        return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: "service_already_exists" }) });
      }
      const created = { id: "svc-created", name: body.name, duration_minutes: body.duration_minutes };
      services.push(created);
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, service: created }) });
    }
    return route.fallback();
  });
  await page.route("**/api/services/*", async (route) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    const id = decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop() || "");
    if (id === "svc-brake") {
      return route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: "service_has_bookings" }) });
    }
    services = services.filter((item) => item.id !== id);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, deleted: id }) });
  });
}

async function captureEvidence(page: Page, testInfo: TestInfo, name: string) {
  const directory = path.resolve("artifacts/repair-shop-services");
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, `${name}-${testInfo.project.name}.png`),
    fullPage: true,
    animations: "disabled",
  });
}

async function expectLayout(page: Page) {
  await expect(page.locator(".service-card").first()).toHaveCSS("display", "grid");
  const heroHeight = await page.locator("#services-workspace .services-hero").evaluate((element) => element.getBoundingClientRect().height);
  expect(heroHeight).toBeLessThan(240);
}

test("Services is a private owner workspace using the existing service API", async ({ page }, testInfo) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/services/", { waitUntil: "domcontentloaded" });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  await expect(page.locator('[data-i18n="servicesTitle"]')).toHaveText("Services");
  await expect(page.locator(".repair-crm-nav-item.is-active")).toContainText("Services");
  await expect(page.locator(".service-card")).toHaveCount(2);
  await expect(page.locator(".service-card").first()).toContainText("Brake inspection");
  await expectLayout(page);

  await page.locator("#service-name").fill("Wheel alignment");
  await page.locator("#service-duration").selectOption("90");
  await page.locator("#service-submit").click();
  await expect(page.locator(".service-card")).toHaveCount(3);
  await expect(page.locator("#page-alert")).toContainText("Service added.");

  await page.getByRole("button", { name: "Delete: Oil change" }).click();
  await expect(page.locator(".service-card")).toHaveCount(2);
  await expect(page.locator("#page-alert")).toContainText("Service deleted.");

  await page.getByRole("button", { name: "Delete: Brake inspection" }).click();
  await expect(page.locator("#page-alert")).toContainText("already has bookings");
  await expect(page.locator(".service-card").filter({ hasText: "Brake inspection" })).toHaveCount(1);
  await captureEvidence(page, testInfo, "services-en-catalog");
});

test("Services preserves Russian UX and mobile CRM navigation", async ({ page }, testInfo) => {
  await mockOwnerApis(page);
  await page.goto("/services/hermes-connect/repair-shops/services/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-i18n="servicesTitle"]')).toHaveText("Услуги");
  await expect(page.locator(".repair-crm-nav-item.is-active")).toContainText("Услуги");
  await expect(page.locator("#service-search")).toHaveAttribute("placeholder", "Поиск услуг");
  await expect(page.locator(".service-card").first()).toContainText("Brake inspection");
  await expectLayout(page);
  await captureEvidence(page, testInfo, "services-ru-catalog");

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 760) {
    await page.locator("[data-repair-crm-menu]").click();
    await expect(page.locator(".repair-crm-sidebar")).toBeVisible();
    await captureEvidence(page, testInfo, "services-ru-mobile-drawer");
  }
});
