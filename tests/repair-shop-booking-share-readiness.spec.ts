import { expect, test } from "@playwright/test";

const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
const closedWeek = () => Array.from({ length: 7 }, (_, day_of_week) => ({
  day_of_week, is_open: false, start_time: null, end_time: null,
}));

test("booking sharing waits for a real service and saved open hours", async ({ page }) => {
  let services: Array<{ id: string; name: string; duration_minutes: number }> = [];
  let days = closedWeek();
  await page.route("**/api/auth/me", (route) => route.fulfill(ok({
    success: true, specialist: { id: "owner-preview", name: "Preview Owner", email: "owner@example.com", role: "Shop Owner" },
  })));
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(ok({
    success: true, identity: { id: "owner-preview", name: "Preview Owner", email: "owner@example.com", role: "Shop Owner" },
    owned_businesses: [{ key: "repair_shop", kind: "owned_business", id: "shop-preview", name: "Preview Garage", slug: "preview-garage", href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" }],
    workspaces: [], capabilities: { internal_ai: false },
  })));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({
    success: true, shop: { id: "shop-preview", slug: "preview-garage", name: "Preview Garage", city: "Milwaukee", state: "WI", timezone: "America/Chicago" },
  })));
  await page.route("**/api/services", (route) => {
    if (route.request().method() === "POST") {
      const input = route.request().postDataJSON();
      const service = { id: "service-preview", name: input.name, duration_minutes: input.duration_minutes };
      services = [service];
      return route.fulfill(ok({ success: true, service }));
    }
    return route.fulfill(ok({ success: true, services }));
  });
  await page.route("**/api/repair-shop/availability", (route) => {
    if (route.request().method() === "PUT") days = route.request().postDataJSON().days;
    return route.fulfill(ok({ success: true, days, timezone: "America/Chicago" }));
  });
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success: true, feedback: [] })));
  await page.route("**/api/repair-shop/staff", (route) => route.fulfill(ok({ success: true, staff: [] })));

  await page.goto("/services/hermes-connect/repair-shops/appointments/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-repair-booking-sharebar]")).toHaveAttribute("data-ready", "false");
  await expect(page.locator("[data-booking-share]")).toBeHidden();
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#copy-booking-link")).toBeDisabled();
  await expect(page.locator("#open-booking-link")).toHaveAttribute("aria-disabled", "true");
  await expect(page.locator("#public-booking-link")).not.toContainText("?shop=");

  await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil: "domcontentloaded" });
  const bar = page.locator("[data-repair-booking-sharebar]");
  const native = page.locator("#public-link-wrap");
  await expect(bar).toHaveAttribute("data-ready", "false");
  await expect(bar).toContainText("Add a real service");
  await expect(bar.locator("[data-repair-copy-booking], [data-repair-share-booking]")).toHaveCount(0);
  await expect(native).toHaveAttribute("data-booking-ready", "false");
  await expect(native.locator("#copy-link-btn")).toBeDisabled();
  await expect(page.locator("[data-web-v1-share]")).toBeDisabled();
  await expect(page.locator("[data-repair-qr-toggle]")).toBeDisabled();
  await expect(bar.getByRole("link", { name: "Preview booking page" })).toBeVisible();

  await page.goto("/services/hermes-connect/repair-shops/services/", { waitUntil: "domcontentloaded" });
  await expect(bar).toHaveAttribute("data-ready", "false");
  await page.locator("#service-name").fill("Brake inspection");
  await page.locator("#service-submit").click();
  await expect(bar).toContainText("Save opening hours");
  await expect(bar.locator("[data-repair-share-booking]")).toHaveCount(0);

  await page.goto("/services/hermes-connect/repair-shops/availability/", { waitUntil: "domcontentloaded" });
  await expect(bar).toHaveAttribute("data-ready", "false");
  await page.getByRole("checkbox", { name: "Monday open" }).check();
  await page.getByRole("button", { name: "Save weekly availability" }).click();
  await expect(bar).toHaveAttribute("data-ready", "true");
  await expect(bar.locator("[data-repair-copy-booking]")).toBeVisible();
  await expect(bar.locator("[data-repair-share-booking]")).toBeVisible();

  await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil: "domcontentloaded" });
  await expect(native).toHaveAttribute("data-booking-ready", "true");
  await expect(native.locator("#copy-link-btn")).toBeEnabled();
  await expect(page.locator("[data-web-v1-share]")).toBeEnabled();
  await expect(page.locator("[data-repair-qr-toggle]")).toBeEnabled();
  await page.goto("/services/hermes-connect/repair-shops/appointments/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-booking-share]")).toBeVisible();
  await page.goto("/services/hermes-connect/repair-shops/settings/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#copy-booking-link")).toBeEnabled();
  await expect(page.locator("#open-booking-link")).toHaveAttribute("aria-disabled", "false");
});

test("booking share fails closed if the services read fails", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill(ok({ success: true, specialist: { id: "owner-preview", name: "Preview Owner", email: "owner@example.com" } })));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success: true, shop: { slug: "preview-garage", name: "Preview Garage", city: "Milwaukee", state: "WI", timezone: "America/Chicago" } })));
  await page.route("**/api/services", (route) => route.fulfill({ status: 503, contentType: "application/json", body: '{"success":false}' }));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(ok({ success: true, days: [{ day_of_week: 1, is_open: true, start_time: "08:00", end_time: "17:00" }] })));
  await page.goto("/services/hermes-connect/repair-shops/availability/", { waitUntil: "domcontentloaded" });
  const bar = page.locator("[data-repair-booking-sharebar]");
  await expect(bar).toHaveAttribute("data-ready", "false");
  await expect(bar).toContainText("Booking readiness could not be checked");
  await expect(bar.locator("[data-repair-copy-booking], [data-repair-share-booking]")).toHaveCount(0);
});
