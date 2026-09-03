import { expect, test } from "@playwright/test";

const dashboardUrl = "/services/hermes-connect/repair-shops/dashboard/";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

async function routeStableWorkspace(page: any, serviceResponder?: (route: any) => Promise<void> | void) {
  await page.route("**/api/auth/me", (route: any) => route.fulfill(json({
    success: true,
    specialist: { id: "owner-resilience", name: "Resilience Owner", email: "owner@example.com", role: "Shop Owner" },
  })));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill(json({ success: true, shop: null })));
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill(json({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(json({ success: true, feedback: [] })));
  await page.route("**/api/services", async (route: any) => {
    if (serviceResponder) return serviceResponder(route);
    return route.fulfill(json({ success: true, services: [] }));
  });
}

test("Repair owner sees section-local recovery and can retry a failed services load", async ({ page }) => {
  let serviceAttempts = 0;
  await routeStableWorkspace(page, (route) => {
    serviceAttempts += 1;
    if (serviceAttempts === 1) return route.fulfill(json({ success: false }, 503));
    return route.fulfill(json({ success: true, services: [] }));
  });

  await page.goto(dashboardUrl);

  const recovery = page.locator("#hc-services-recovery");
  await expect(recovery).toBeVisible();
  await expect(recovery).toContainText("Services are temporarily unavailable");
  await expect(recovery).toContainText("Unable to load services");
  await expect(page.locator("#bookings-empty")).toBeVisible();
  await expect(page.locator("#feedback-empty")).toBeVisible();

  await recovery.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator("#services-empty")).toBeVisible();
  await expect(page.locator("#hc-services-recovery")).toBeHidden();
  expect(serviceAttempts).toBeGreaterThanOrEqual(2);
});

test("Repair owner gets an offline status and a connection-restored state without losing empty data", async ({ page, context }) => {
  await routeStableWorkspace(page);
  await page.goto(dashboardUrl);

  await expect(page.locator("#services-empty")).toBeVisible();
  await expect(page.locator("#bookings-empty")).toBeVisible();
  const connectivity = page.locator("#hc-workspace-connectivity");
  await expect(connectivity).toBeHidden();

  await context.setOffline(true);
  await expect(connectivity).toBeVisible();
  await expect(connectivity).toContainText("You’re offline");
  await expect(page.locator("#services-empty")).toBeVisible();

  await context.setOffline(false);
  await expect(connectivity).toBeVisible();
  await expect(connectivity).toContainText("Connection restored");
});

test("Repair resilience states preserve Russian workspace context", async ({ page }) => {
  await routeStableWorkspace(page, (route) => route.fulfill(json({ success: false }, 503)));
  await page.goto(`${dashboardUrl}?lang=ru`);

  await expect(page.locator("#hc-services-recovery")).toBeVisible();
  await expect(page.locator("#hc-services-recovery")).toContainText("Сервисы временно недоступны");
  await expect(page.locator("#hc-services-recovery").getByRole("button", { name: "Повторить" })).toBeVisible();
});
