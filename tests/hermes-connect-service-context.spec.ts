import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const source = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const ok = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

test("shared service context isolates catalogs without coupling generic endpoints to Repair Shop schema", async () => {
  const [
    contextSource,
    requestContextSource,
    repairAdapterSource,
    servicesIndexSource,
    serviceDeleteSource,
    publicShopSource,
    publicBookingSource,
  ] = await Promise.all([
    source("functions/api/_lib/service-context.mjs"),
    source("functions/api/_lib/service-request-context.mjs"),
    source("functions/api/_lib/repair-shop-service-context.mjs"),
    source("functions/api/services/index.ts"),
    source("functions/api/services/[id].ts"),
    source("functions/api/public/repair-shop.ts"),
    source("functions/api/public/repair-booking.ts"),
  ]);

  expect(contextSource).toContain("CREATE TABLE IF NOT EXISTS hermes_business_contexts");
  expect(contextSource).toContain("CREATE TABLE IF NOT EXISTS hermes_service_contexts");
  expect(contextSource).toContain("owner_specialist_id = ?");
  expect(contextSource).toContain("sc.context_id = ? OR (? = 1 AND sc.context_id IS NULL)");
  expect(contextSource).toContain("INSERT INTO hermes_service_contexts");

  expect(requestContextSource).toContain('searchParams.get("context")');
  expect(requestContextSource).toContain("getOwnedBusinessContext(db, ownerId, requestedContextId)");
  expect(requestContextSource).toContain('error: "service_context_not_found"');
  expect(requestContextSource).not.toContain('searchParams.get("owner")');
  expect(requestContextSource).not.toContain('searchParams.get("business")');

  expect(servicesIndexSource).toContain("resolveServiceRequestContext(request, env.DB, specialist.id)");
  expect(servicesIndexSource).toContain("listServicesForContext");
  expect(servicesIndexSource).toContain("createServiceForContext");
  expect(serviceDeleteSource).toContain("serviceHasUsageForContext");
  expect(serviceDeleteSource).not.toContain("repair-shop-bookings-schema");
  expect(serviceDeleteSource).not.toContain("repair_shop_bookings");

  expect(repairAdapterSource).toContain('REPAIR_SHOP_SERVICE_VERTICAL = "repair_shop"');
  expect(repairAdapterSource).toContain("ensureRepairShopBookingsSchema");
  expect(repairAdapterSource).toContain("pending:${ownerId}");

  expect(publicShopSource).toContain("resolveDefaultRepairShopServiceContext");
  expect(publicShopSource).toContain("listServicesForContext");
  expect(publicShopSource).not.toContain("FROM services WHERE owner_specialist_id");

  expect(publicBookingSource).toContain("resolveDefaultRepairShopServiceContext");
  expect(publicBookingSource).toContain("findServiceForContext");
  expect(publicBookingSource).not.toContain("FROM services WHERE id = ? AND owner_specialist_id = ?");
});

test("Repair Shop dashboard stays backward compatible when no context query is supplied", async ({ page }) => {
  const serviceUrls: string[] = [];
  const owner = {
    success: true,
    specialist: { id: "owner-1", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" },
  };
  const shop = {
    id: "shop-1",
    slug: "apex-auto",
    name: "Apex Auto",
    phone: "+14145550100",
    address_line1: "123 Main St",
    city: "Milwaukee",
    state: "WI",
    postal_code: "53202",
    timezone: "America/Chicago",
  };
  const availability = Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,
    is_open: false,
    start_time: null,
    end_time: null,
  }));

  await page.route("**/api/auth/me", (route) => route.fulfill(ok(owner)));
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(ok({ success: true, shop })));
  await page.route("**/api/repair-shop/access", (route) => route.fulfill(ok({
    success: true,
    access: {
      state: "trialing",
      plan_id: "repair_shop_founding",
      plan_name: "Founding Shop Plan",
      current_period_end: null,
      next_action: "choose_plan",
    },
  })));
  await page.route("**/api/repair-shop/availability", (route) => route.fulfill(ok({
    success: true,
    timezone: "America/Chicago",
    days: availability,
  })));
  await page.route("**/api/services**", (route) => {
    serviceUrls.push(route.request().url());
    return route.fulfill(ok({
      success: true,
      services: [{ id: "svc-existing", name: "Tire rotation", duration_minutes: 30, owner_specialist_id: "owner-1" }],
    }));
  });
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(ok({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(ok({ success: true, feedback: [] })));

  await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Tire rotation").first()).toBeVisible();
  await expect.poll(() => serviceUrls.length).toBeGreaterThan(0);
  expect(serviceUrls.every((url) => !new URL(url).searchParams.has("context"))).toBe(true);
});
