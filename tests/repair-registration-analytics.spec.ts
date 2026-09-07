import { expect, test } from "@playwright/test";

const authPath = "/services/hermes-connect/repair-shops/auth/?mode=register";
const owner = {
  name: "Analytics QA Shop Owner",
  email: "analytics-qa-owner@example.com",
  password: "TestPassword123!",
};

const fillRegistration = async (page: any) => {
  await page.locator("#reg-name").fill(owner.name);
  await page.locator("#reg-email").fill(owner.email);
  await page.locator("#reg-password").fill(owner.password);
  await page.locator("#reg-password-confirm").fill(owner.password);
};

const completionCount = (page: any) => page.evaluate(() => ((window as any).dataLayer || [])
  .filter((entry: any) => entry?.event === "repair_shop_registration_complete").length);

test("successful Repair registration emits one privacy-safe completion event", async ({ page }) => {
  let registered = false;
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
  await fillRegistration(page);
  await page.locator("#register-form button[type='submit']").click();
  await expect(page.locator("#auth-authenticated")).toHaveClass(/active/);

  const events = await page.evaluate(() => ((window as any).dataLayer || [])
    .filter((entry: any) => entry?.event === "repair_shop_registration_complete"));

  expect(events).toHaveLength(1);
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
});

test("failed Repair registration never emits completion", async ({ page }) => {
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
  await fillRegistration(page);
  await page.locator("#register-form button[type='submit']").click();
  await expect(page.locator("#alert-box")).toContainText("already exists");

  const counts = await page.evaluate(() => {
    const entries = (window as any).dataLayer || [];
    return {
      start: entries.filter((entry: any) => entry?.event === "repair_shop_registration_start").length,
      complete: entries.filter((entry: any) => entry?.event === "repair_shop_registration_complete").length,
    };
  });
  expect(counts.start).toBe(1);
  expect(counts.complete).toBe(0);
});

test("failed registration followed by login is not misclassified as registration completion", async ({ page }) => {
  let authenticated = false;
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
  await fillRegistration(page);
  await page.locator("#register-form button[type='submit']").click();
  await expect(page.locator("#alert-box")).toContainText("already exists");
  expect(await completionCount(page)).toBe(0);

  await page.locator('[data-tab="login"]').click();
  await page.locator("#login-email").fill(owner.email);
  await page.locator("#login-password").fill(owner.password);
  await page.locator("#login-form button[type='submit']").click();
  await expect(page.locator("#auth-authenticated")).toHaveClass(/active/);
  expect(await completionCount(page)).toBe(0);
});
