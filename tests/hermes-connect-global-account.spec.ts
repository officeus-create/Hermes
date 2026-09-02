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
    { key: "internal_ai", kind: "internal_capability", href: "/services/hermes-connect/internal/ai-connect/", available: true },
  ],
};

async function mockPortfolio(page: import("@playwright/test").Page) {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(portfolio) }));
}

test("signed-in Hermes account is visible in the global desktop header with one business portfolio", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockPortfolio(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const account = page.locator("details[data-hc-global-account]");
  await expect(account).toBeVisible();
  await expect(account.locator("[data-hc-global-name]").first()).toHaveText("Office Owner");
  await expect(account.locator("[data-hc-global-signed]").first()).toHaveText("Signed in");

  await account.locator("summary").click();
  await expect(account.locator("[data-hc-global-email]")).toHaveText("office@example.com");
  await expect(account.locator("[data-hc-global-count]")).toHaveText("4 workspaces");
  await expect(account.getByRole("link", { name: /Hermes Test Garage/ })).toHaveAttribute("href", "/services/hermes-connect/repair-shops/dashboard/");
  await expect(account.getByRole("link", { name: /Aurelia Studio/ })).toHaveAttribute("href", "/services/hermes-connect/beauty/workspace/");
  await expect(account.getByRole("link", { name: /Academy/ })).toHaveAttribute("href", "/services/hermes-connect/academy/dashboard/");
  await expect(account.getByRole("link", { name: /AI Connect/ })).toHaveAttribute("href", "/services/hermes-connect/internal/ai-connect/");
});

test("Russian public site keeps the account portfolio visible on mobile and preserves locale", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockPortfolio(page);
  await page.goto("/ru", { waitUntil: "domcontentloaded" });
  await page.locator("[data-menu-button]").click();

  const account = page.locator("[data-mobile-menu] [data-hc-global-account]");
  await expect(account).toBeVisible();
  await expect(account.locator("[data-hc-global-name]")).toHaveText("Office Owner");
  await expect(account.locator("[data-hc-global-signed]")).toHaveText("Вы вошли");
  await expect(account.locator("[data-hc-global-count]")).toHaveText("4 пространств");
  await expect(account.getByRole("link", { name: /Hermes Test Garage/ })).toHaveAttribute("href", /\/repair-shops\/dashboard\/\?lang=ru$/);
  await expect(account.getByRole("link", { name: /Aurelia Studio/ })).toHaveAttribute("href", /\/beauty\/workspace\/\?lang=ru$/);
  await expect(account.getByRole("link", { name: /Академия/ })).toHaveAttribute("href", /\/academy\/dashboard\/\?lang=ru$/);
  await expect(account.getByRole("link", { name: /AI Connect/ })).toHaveAttribute("href", /\/internal\/ai-connect\/\?lang=ru$/);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test("global account stays hidden when there is no authenticated Hermes session", async ({ page }) => {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: "not_authenticated" }) }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const accounts = page.locator("[data-hc-global-account]");
  await expect(accounts).toHaveCount(2);
  await expect(accounts.nth(0)).toBeHidden();
  await expect(accounts.nth(1)).toBeHidden();
});

test("private workspace does not duplicate the global account switcher", async ({ page }) => {
  await mockPortfolio(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-hc-global-account]")).toHaveCount(0);
  await expect(page.locator("[data-hc-account-switcher]").first()).toBeAttached();
});