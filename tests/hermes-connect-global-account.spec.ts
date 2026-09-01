import { expect, test } from "@playwright/test";

const portfolio = {
  success: true,
  identity: { id: "owner-global-1", name: "Office Owner", email: "office@example.com", role: "owner" },
  owned_businesses: [
    { key: "repair_shop", kind: "owned_business", id: "shop-1", name: "Hermes Test Garage", href: "/services/hermes-connect/repair-shops/dashboard/", workspace_state: "live" },
    { key: "beauty_salon", kind: "owned_business", id: "beauty-1", name: "Aurelia Studio", href: "/services/hermes-connect/beauty/workspace/", workspace_state: "private_foundation" },
  ],
  workspaces: [
    { key: "academy", kind: "shared_workspace", href: "/services/hermes-connect/academy/dashboard/", available: true },
  ],
  capabilities: { internal_ai: false },
};

async function mockPortfolio(page: import("@playwright/test").Page) {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(portfolio) }));
  await page.route("**/api/auth/me", (route) => route.abort("failed"));
  await page.route("**/api/repair-shop/profile", (route) => route.abort("failed"));
  await page.route("**/api/internal-ai/status", (route) => route.abort("failed"));
}

test("signed-in Hermes account is visible in the global desktop header on a normal website page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockPortfolio(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const account = page.locator("details[data-hc-global-account]");
  await expect(account).toBeVisible();
  await expect(account.locator("[data-hc-global-name]").first()).toHaveText("Office Owner");
  await expect(account.locator("[data-hc-global-signed]").first()).toHaveText("Signed in");

  await account.locator("summary").click();
  await expect(account.locator("[data-hc-global-email]")).toHaveText("office@example.com");
  await expect(account.getByRole("link", { name: /Hermes Test Garage/ })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/");
  await expect(account.getByRole("link", { name: /Aurelia Studio/ })).toHaveAttribute("href", "/services/hermes-connect/beauty/workspace/");
  await expect(account.getByRole("link", { name: /Academy/ })).toHaveAttribute("href", "/services/hermes-connect/academy/dashboard/");
  await expect(account.getByRole("link", { name: /AI Connect/ })).toHaveCount(0);
});

test("Russian public site keeps the signed-in account visible on mobile and preserves RU workspace links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockPortfolio(page);
  await page.goto("/ru", { waitUntil: "domcontentloaded" });
  await page.locator("[data-menu-button]").click();

  const account = page.locator("[data-mobile-menu] [data-hc-global-account]");
  await expect(account).toBeVisible();
  await expect(account.locator("[data-hc-global-name]")).toHaveText("Office Owner");
  await expect(account.locator("[data-hc-global-signed]")).toHaveText("Вы вошли");
  await expect(account.getByRole("link", { name: /Hermes Test Garage/ })).toHaveAttribute("href", /\/repair-shops\/dashboard\/\?lang=ru$/);
  await expect(account.getByRole("link", { name: /Aurelia Studio/ })).toHaveAttribute("href", /\/beauty\/workspace\/\?lang=ru$/);
  await expect(account.getByRole("link", { name: /Академия/ })).toHaveAttribute("href", /\/academy\/dashboard\/\?lang=ru$/);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("global account presence stays hidden when there is no authenticated Hermes session", async ({ page }) => {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const accounts = page.locator("[data-hc-global-account]");
  await expect(accounts).toHaveCount(2);
  await expect(accounts.nth(0)).toBeHidden();
  await expect(accounts.nth(1)).toBeHidden();
});