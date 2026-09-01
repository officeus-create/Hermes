import { expect, test } from "@playwright/test";

const root = "/services/hermes-connect/repair-shops/";

test("existing Repair Shop owner sees a prominent sign-in action on the first screen", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "not_authenticated" }),
  }));

  await page.goto(root);

  const login = page.getByRole("link", { name: "Sign in to my shop" });
  await expect(login).toBeVisible();
  await expect(login).toHaveAttribute("href", "/services/hermes-connect/repair-shops/auth/?mode=login");
  await expect(page.getByRole("link", { name: "Register free" })).toBeVisible();
});

test("Russian first screen exposes the owner login without scrolling to workspace links", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: "not_authenticated" }),
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${root}?lang=ru`);

  const login = page.getByRole("link", { name: "Войти в кабинет СТО" });
  await expect(login).toBeVisible();
  await expect(login).toHaveAttribute("href", "/services/hermes-connect/repair-shops/auth/?mode=login&lang=ru");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("active owner session turns the same first-screen action into direct dashboard access", async ({ page }) => {
  await page.route("**/api/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true, specialist: { id: "owner-1", name: "Owner", email: "owner@example.com", role: "Shop Owner" } }),
  }));

  await page.goto(root);

  const dashboard = page.getByRole("link", { name: "Open my dashboard" });
  await expect(dashboard).toBeVisible();
  await expect(dashboard).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/");
  await expect(dashboard).toHaveAttribute("data-session-active", "true");
});
