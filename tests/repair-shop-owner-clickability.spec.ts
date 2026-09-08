import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

const shop = {
  id: "shop-clickability",
  slug: "officea-baka-test",
  name: "Officea Baka Test Center",
  phone: "+15015550100",
  address_line1: "1000 Test Service Dr",
  city: "Little Rock",
  state: "AR",
  postal_code: "72201",
  timezone: "America/Chicago",
};

test("Repair Shop owner dashboard exposes real actions instead of visible dead controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let profileWrites = 0;
  let serviceWrites = 0;
  let feedbackWrites = 0;
  let services = [{ id: "svc-existing", name: "Diagnostics", duration_minutes: 30, owner_specialist_id: "owner-officea" }];
  let feedback: any[] = [];

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/api/auth/me") return route.fulfill(json({ success: true, specialist: { id: "owner-officea", name: "Officea Baka", email: "officea@example.com", role: "Shop Owner" } }));
    if (path === "/api/hermes-connect/account") return route.fulfill(json({ success: true, identity: { id: "owner-officea", name: "Officea Baka", email: "officea@example.com", role: "Shop Owner" }, owned_businesses: [{ key: "repair_shop", kind: "owned_business", id: shop.id, name: shop.name, slug: shop.slug, href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" }], workspaces: [], capabilities: {} }));
    if (path === "/api/repair-shop/profile") {
      if (method === "PUT") profileWrites += 1;
      return route.fulfill(json({ success: true, shop }));
    }
    if (path === "/api/services") {
      if (method === "POST") {
        serviceWrites += 1;
        const body = request.postDataJSON();
        const created = { id: `svc-${serviceWrites}`, name: body.name, duration_minutes: body.duration_minutes, owner_specialist_id: "owner-officea" };
        services = [...services, created];
        return route.fulfill(json({ success: true, service: created }));
      }
      return route.fulfill(json({ success: true, context: { id: "ctx-repair", vertical_key: "repair_shop" }, services }));
    }
    if (path === "/api/repair-shop/bookings") return route.fulfill(json({ success: true, bookings: [] }));
    if (path === "/api/repair-shop/feedback") {
      if (method === "POST") {
        feedbackWrites += 1;
        const body = request.postDataJSON();
        feedback = [{ id: `feedback-${feedbackWrites}`, ...body, created_at: new Date().toISOString(), retention_until: "2027-03-07T00:00:00.000Z" }, ...feedback];
        return route.fulfill(json({ success: true, feedback: feedback[0] }));
      }
      return route.fulfill(json({ success: true, feedback }));
    }
    if (path === "/api/repair-shop/capabilities") return route.fulfill(json({ success: true, capabilities: { vehicle_types: ["passenger_vehicle"], fleet_service: true, mobile_roadside: false, emergency_24_7: false } }));
    if (path === "/api/repair-shop/driver-discount") return route.fulfill(json({ success: true, discount: { shop_id: shop.id, enabled: false, service_discount_percent: 0, service_scope: "all", service_ids: [], materials_discount_percent: 0, materials_scope: "all", materials_items: [] } }));
    if (path === "/api/repair-shop/capacity") return route.fulfill(json({ success: true, capacity: { daily_capacity: 10 } }));
    return route.fulfill(json({ success: true }));
  });

  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#profile-state")).toHaveText(/Saved|Сохранено/);
  const openBooking = page.locator("#open-link-btn");
  await expect(openBooking).toBeVisible();
  await expect(openBooking).toHaveAttribute("href", /\/services\/hermes-connect\/repair-shops\/booking\/\?shop=officea-baka-test/);
  await expect(page.locator('a[href="#"]:visible')).toHaveCount(0);

  await page.locator("#shop-name").fill("Officea Baka Test Center");
  await page.locator("#save-profile-btn").click();
  await expect.poll(() => profileWrites).toBe(1);
  await expect(page.locator("#workspace-alert")).toContainText(/saved|сохранён/i);

  await page.locator("#service-name").fill("Brake inspection");
  await page.locator("#service-duration").selectOption("45");
  await page.locator("#add-service-btn").click();
  await expect.poll(() => serviceWrites).toBe(1);
  await expect(page.locator("#services-list")).toContainText("Brake inspection");

  await page.locator("#feedback-message").fill("The dashboard controls are now usable on mobile.");
  await page.locator("#submit-feedback-btn").click();
  await expect.poll(() => feedbackWrites).toBe(1);
  await expect(page.locator("#feedback-list")).toContainText("The dashboard controls are now usable on mobile.");

  await expect(page.getByRole("link", { name: /Customers|Клиенты/ }).first()).toHaveAttribute("href", /\/services\/hermes-connect\/repair-shops\/customers\//);
  await expect(page.getByRole("link", { name: /Manage availability|Доступность|Расписание/ }).first()).toHaveAttribute("href", /\/services\/hermes-connect\/repair-shops\/availability\//);

  const enabledVisibleButtons = page.locator("button:visible:not(:disabled)");
  expect(await enabledVisibleButtons.count()).toBeGreaterThan(4);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("planned Repair Shop connections look like pending status instead of a clickable action", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill(json({ success: true, specialist: { id: "owner-officea", name: "Officea Baka", email: "officea@example.com", role: "Shop Owner" } }));
    if (path === "/api/hermes-connect/account") return route.fulfill(json({ success: true, identity: { id: "owner-officea", name: "Officea Baka", email: "officea@example.com", role: "Shop Owner" }, owned_businesses: [{ key: "repair_shop", kind: "owned_business", id: shop.id, name: shop.name, slug: shop.slug, href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" }], workspaces: [], capabilities: {} }));
    if (path === "/api/repair-shop/profile") return route.fulfill(json({ success: true, shop }));
    if (path === "/api/repair-shop/staff") return route.fulfill(json({ success: true, staff: [] }));
    return route.fulfill(json({ success: true, days: [] }));
  });

  await page.goto("/services/hermes-connect/repair-shops/settings/?lang=ru", { waitUntil: "domcontentloaded" });
  const pending = page.locator(".connection-card button:disabled").first();
  await expect(pending).toBeVisible();
  await expect(pending).toHaveAttribute("data-hc-pending-action", "true");
  const cursor = await pending.evaluate((node) => getComputedStyle(node).cursor);
  expect(cursor).toBe("default");
});
