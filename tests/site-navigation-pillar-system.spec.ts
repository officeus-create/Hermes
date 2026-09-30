import { expect, test } from "@playwright/test";

test("global header separates four primary directions from secondary discovery links", async ({ page, isMobile }) => {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "unauthorized" }),
  }));
  await page.goto("/");

  const primary = page.locator(".desktop-nav > .nav-primary-link");
  await expect(primary).toHaveCount(4);
  expect(await primary.evaluateAll((links) => links.map((link) => link.getAttribute("data-nav-tone")))).toEqual([
    "logistics",
    "marketing",
    "technology",
    "academy",
  ]);

  const secondary = page.locator(".desktop-nav > .nav-secondary-link");
  await expect(secondary).toHaveCount(3);
  expect(await secondary.evaluateAll((links) => links.map((link) => link.getAttribute("data-nav-tone")))).toEqual([
    "insights",
    "connect",
    "catalog",
  ]);

  if (isMobile) {
    await page.locator("[data-menu-button]").click();
    const signIn = page.locator('#mobile-menu [data-hermes-sign-in]');
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/services/hermes-connect/access/");
  } else {
    const signIn = page.locator('.header-actions > [data-hermes-sign-in]');
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/services/hermes-connect/access/");
  }
});

test("authorized account menu replaces the public sign-in fallback", async ({ page, isMobile }) => {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      identity: { id: "owner-nav-1", name: "Owner", email: "owner@example.com", role: "owner" },
      owned_businesses: [{
        key: "repair_shop",
        kind: "owned_business",
        id: "shop-nav-1",
        name: "Owner Shop",
        slug: "owner-shop",
        href: "/services/hermes-connect/repair-shops/dashboard/",
        workspace_state: "live",
      }],
      workspaces: [],
      capabilities: { internal_ai: false },
    }),
  }));

  await page.goto("/", { waitUntil: "domcontentloaded" });

  if (isMobile) {
    await page.locator("[data-menu-button]").click();
    const portfolio = page.locator("#mobile-menu .hc-mobile-account-panel [data-hc-account-switcher]");
    await expect(portfolio).toBeVisible();
    await expect(page.locator('#mobile-menu [data-hermes-sign-in]')).toBeHidden();
  } else {
    const account = page.locator('header details[data-hc-account-switcher][data-public-safe="true"]');
    await expect(account).toBeVisible();
    await expect(page.locator('.header-actions > [data-hermes-sign-in]')).toBeHidden();
  }
});

test("shared Hermes account access is noindex and uses the canonical auth service", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "unauthorized" }),
  }));
  await page.goto("/services/hermes-connect/access/");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
  await expect(page.getByRole("heading", { name: "One account across Hermes." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.locator('form[data-access-form] input[name="email"]')).toBeVisible();
  await expect(page.locator('form[data-access-form] input[name="password"]')).toBeVisible();
});
