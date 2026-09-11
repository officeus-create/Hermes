import { expect, test } from "@playwright/test";

const portfolio = {
  success: true,
  identity: { id: "owner-sitewide-1", name: "Office Owner", email: "office@example.com", role: "owner" },
  owned_businesses: [
    {
      key: "repair_shop",
      kind: "owned_business",
      id: "shop-sitewide-1",
      name: "Hermes Test Garage",
      slug: "hermes-test-garage",
      href: "/services/hermes-connect/repair-shops/dashboard/",
      workspace_state: "live",
    },
  ],
  workspaces: [
    {
      key: "academy",
      kind: "shared_workspace",
      href: "/services/hermes-connect/academy/dashboard/",
      available: true,
      state: { profile_exists: true, enrollments: [], reviewer_access: { active: false, program_scope: null } },
    },
  ],
  capabilities: { internal_ai: false },
};

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

test("signed-in Hermes identity remains visible from the public site header", async ({ page }) => {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json(portfolio)));
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const account = page.locator('.header-actions details[data-hc-account-switcher][data-public-safe="true"]');
  await expect(account).toBeVisible();
  await expect(account.locator("[data-account-name]")).toHaveText("Office Owner");
  await expect(account.locator("[data-account-email]")).toHaveText("office@example.com");

  await account.locator("summary").click();
  await expect(account.getByText("Hermes Test Garage", { exact: true })).toBeVisible();
  await expect(account.getByText("Academy", { exact: true })).toBeVisible();
  await expect(account.getByText("AI Connect", { exact: true })).toHaveCount(0);
});

test("anonymous visitor does not see an account control on the public site", async ({ page }) => {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json({ success: false, error: "not_authenticated" }, 401)));
  await page.goto("/paths/logistics/", { waitUntil: "domcontentloaded" });

  await expect(page.locator('[data-hc-account-switcher][data-public-safe="true"]')).toBeHidden();
});

test("mobile site menu shows the same signed-in Hermes identity", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json(portfolio)));
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobile = page.locator('#mobile-menu [data-hc-account-switcher][data-public-safe="true"]');
  await expect(mobile).toBeVisible();
  await expect(mobile.locator("[data-account-name]")).toHaveText("Office Owner");
  await expect(mobile.locator("[data-account-email]")).toHaveText("office@example.com");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
