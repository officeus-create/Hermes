import { expect, test } from "@playwright/test";

const authPath = "/services/hermes-connect/repair-shops/auth/?mode=register";
const owner = {
  name: "Analytics QA Shop Owner",
  email: "analytics-qa-owner@example.com",
  password: "TestPassword123!",
};

type AnalyticsPayload = Record<string, unknown>;

const fillRegistration = async (page: any) => {
  await page.locator("#reg-name").fill(owner.name);
  await page.locator("#reg-email").fill(owner.email);
  await page.locator("#reg-password").fill(owner.password);
  await page.locator("#reg-password-confirm").fill(owner.password);
};

const installAnalyticsCapture = async (page: any, payloads: AnalyticsPayload[]) => {
  await page.exposeFunction("__captureRepairAnalytics", (payload: AnalyticsPayload) => {
    payloads.push(payload);
  });
  await page.evaluate(() => {
    const dataLayer = ((window as any).dataLayer = (window as any).dataLayer || []);
    const originalPush = dataLayer.push.bind(dataLayer);
    dataLayer.push = (...items: any[]) => {
      for (const item of items) void (window as any).__captureRepairAnalytics(item);
      return originalPush(...items);
    };
  });
};

const eventPayloads = (payloads: AnalyticsPayload[], name: string) =>
  payloads.filter((entry) => entry?.event === name);

test("successful Repair registration emits one privacy-safe completion event", async ({ page }) => {
  let registered = false;
  const payloads: AnalyticsPayload[] = [];

  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: registered ? 200 : 401,
    contentType: "application/json",
    body: JSON.stringify(registered
      ? { success: true, specialist: { name: owner.name, email: owner.email, role: "Shop Owner" } }
      : { success: false, error: "not_authenticated" }),
  }));
  await page.route("**/api/auth/register", (route) => {
    registered = true;
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ success: true, specialist: { id: "synthetic-owner" } }),
    });
  });

  await page.goto(authPath);
  await installAnalyticsCapture(page, payloads);
  await fillRegistration(page);
  const [registeredResponse] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/api/auth/register") && response.request().method() === "POST"),
    page.locator("#register-form button[type='submit']").click(),
  ]);
  expect(registeredResponse.status()).toBe(201);

  await expect.poll(() => eventPayloads(payloads, "repair_shop_registration_complete").length).toBe(1);
  expect(eventPayloads(payloads, "repair_shop_registration_start")).toHaveLength(1);

  const events = eventPayloads(payloads, "repair_shop_registration_complete");
  expect(events[0]).toEqual({
    event: "repair_shop_registration_complete",
    audience_type: "repair_business",
    page_group: "hermes_connect_repair",
    service_group: "repair_shop_software",
    page_path: "/services/hermes-connect/repair-shops/auth/",
    destination_path: "/services/hermes-connect/repair-shops/dashboard/",
  });
  const serialized = JSON.stringify(events);
  expect(serialized).not.toContain(owner.email);
  expect(serialized).not.toContain(owner.name);
  expect(serialized).not.toContain(owner.password);
  expect(serialized).not.toContain("synthetic-owner");
});

test("failed Repair registration never emits completion", async ({ page }) => {
  const payloads: AnalyticsPayload[] = [];

  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "not_authenticated" }),
  }));
  await page.route("**/api/auth/register", (route) => route.fulfill({
    status: 409,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "account_exists" }),
  }));

  await page.goto(authPath);
  await installAnalyticsCapture(page, payloads);
  await fillRegistration(page);
  const [registeredResponse] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/api/auth/register") && response.request().method() === "POST"),
    page.locator("#register-form button[type='submit']").click(),
  ]);
  expect(registeredResponse.status()).toBe(409);
  await expect(page.locator("#alert-box")).toContainText("already exists");

  expect(eventPayloads(payloads, "repair_shop_registration_start")).toHaveLength(1);
  expect(eventPayloads(payloads, "repair_shop_registration_complete")).toHaveLength(0);
});

test("failed registration followed by login is not misclassified as registration completion", async ({ page }) => {
  let authenticated = false;
  const payloads: AnalyticsPayload[] = [];

  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: authenticated ? 200 : 401,
    contentType: "application/json",
    body: JSON.stringify(authenticated
      ? { success: true, specialist: { name: owner.name, email: owner.email, role: "Shop Owner" } }
      : { success: false, error: "not_authenticated" }),
  }));
  await page.route("**/api/auth/register", (route) => route.fulfill({
    status: 409,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "account_exists" }),
  }));
  await page.route("**/api/auth/login", (route) => {
    authenticated = true;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto(authPath);
  await installAnalyticsCapture(page, payloads);
  await fillRegistration(page);
  const [failedRegistration] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/api/auth/register") && response.request().method() === "POST"),
    page.locator("#register-form button[type='submit']").click(),
  ]);
  expect(failedRegistration.status()).toBe(409);
  await expect(page.locator("#alert-box")).toContainText("already exists");
  expect(eventPayloads(payloads, "repair_shop_registration_complete")).toHaveLength(0);

  await page.locator('[data-tab="login"]').click();
  await page.locator("#login-email").fill(owner.email);
  await page.locator("#login-password").fill(owner.password);
  const [loginResponse] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith("/api/auth/login") && response.request().method() === "POST"),
    page.locator("#login-form button[type='submit']").click(),
  ]);
  expect(loginResponse.status()).toBe(200);
  await page.waitForTimeout(300);

  expect(eventPayloads(payloads, "repair_shop_registration_start")).toHaveLength(1);
  expect(eventPayloads(payloads, "repair_shop_registration_complete")).toHaveLength(0);
});
