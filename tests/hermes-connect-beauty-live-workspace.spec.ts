import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const salon = {
  id: "salon-live-1",
  name: "Aurelia Studio",
  slug: "aurelia-studio-live",
  phone: "+13055550148",
  website: "https://example.com/",
  address_line1: "100 Ocean Dr",
  city: "Miami",
  region: "Florida",
  postal_code: "33139",
  country_code: "US",
  timezone: "America/New_York",
};

const context = { id: "ctx-beauty-live-1", vertical_key: "beauty_salon" };

async function mockBeautyApis(page: any) {
  let team = [
    { id: "team-1", display_name: "Leah Morgan", role_label: "Studio Manager", public_title: "Studio Manager", is_public: true, is_active: true },
  ];
  let services = [
    { id: "service-1", name: "Signature Facial", duration_minutes: 60 },
  ];

  await page.route("**/api/beauty-salon/profile", async (route: any) => {
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON();
      Object.assign(salon, body);
      return route.fulfill(json({ success: true, salon, service_context: context }));
    }
    return route.fulfill(json({ success: true, salon, service_context: context }));
  });

  await page.route("**/api/beauty-salon/team", async (route: any) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      const member = { id: "team-2", ...body, is_active: true };
      team = [...team, member];
      return route.fulfill(json({ success: true, member }, 201));
    }
    return route.fulfill(json({ success: true, salon_id: salon.id, team }));
  });

  await page.route("**/api/services?context=ctx-beauty-live-1", async (route: any) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON();
      const service = { id: "service-2", ...body };
      services = [...services, service];
      return route.fulfill(json({ success: true, context, service }, 201));
    }
    return route.fulfill(json({ success: true, context, services }));
  });
}

test("Beauty B1 loads real owner-scoped profile, team and shared services", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await mockBeautyApis(page);
  await page.goto("/services/hermes-connect/beauty/workspace/", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-profile-form] [name="name"]')).toHaveValue("Aurelia Studio");
  await expect(page.locator('[data-profile-form] [name="city"]')).toHaveValue("Miami");
  await expect(page.locator("[data-profile-state]")).toHaveText("Configured");
  await expect(page.locator("[data-team-list]")).toContainText("Leah Morgan");
  await expect(page.locator("[data-services-list]")).toContainText("Signature Facial");

  await page.locator('[data-team-form] [name="display_name"]').fill("Sofia Park");
  await page.locator('[data-team-form] [name="role_label"]').fill("Beauty Specialist");
  await page.locator('[data-team-form] [name="public_title"]').fill("Senior Specialist");
  await page.locator('[data-team-form] [name="is_public"]').check();
  await page.locator('[data-team-form] button[type="submit"]').click();
  await expect(page.locator("[data-team-list]")).toContainText("Sofia Park");

  await page.locator('[data-service-form] [name="name"]').fill("Brow Styling");
  await page.locator('[data-service-form] [name="duration_minutes"]').fill("30");
  await page.locator('[data-service-form] button[type="submit"]').click();
  await expect(page.locator("[data-services-list]")).toContainText("Brow Styling");
});

test("Beauty B1 Russian mobile shell is localized and does not expose deferred modules as product UI", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockBeautyApis(page);
  await page.goto("/services/hermes-connect/beauty/workspace/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("h1")).toContainText("Настройте салон, команду и услуги");
  await expect(page.locator("[data-profile-state]")).toHaveText("Настроено");
  await expect(page.locator("[data-services-list]")).toContainText("Signature Facial");
  await expect(page.locator("[data-beauty-content]")).toContainText("Запись клиентов · позже");
  await expect(page.locator("[data-beauty-content]")).not.toContainText("Revenue dashboard");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
