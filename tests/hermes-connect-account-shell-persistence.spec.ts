import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const account = {
  success: true,
  identity: {
    id: "owner-shell-persistence-1",
    name: "Office Owner",
    email: "office@example.com",
    role: "owner",
  },
  owned_businesses: [
    {
      key: "repair_shop",
      kind: "owned_business",
      id: "shop-shell-persistence-1",
      name: "Hermes Test Garage",
      slug: "hermes-test-garage",
      href: "/services/hermes-connect/repair-shops/dashboard/",
      workspace_state: "live",
    },
  ],
  workspaces: [],
  capabilities: { internal_ai: false },
};

test("authenticated owner identity persists from Product Hub onto the public Repair Shop surface", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json(account)));
  await page.route("**/api/internal-ai/status", (route) => route.fulfill(json({ success: false, error: "forbidden" }, 403)));

  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });

  const menu = page.locator('header details[data-hc-account-switcher][data-public-safe="true"]');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("data-current", "repair");
  await expect(menu.locator("[data-account-name]")).toHaveText(account.identity.name);
  await expect(menu.locator("[data-account-email]")).toHaveText(account.identity.email);

  await menu.locator("summary").click();
  await expect(menu.locator('[data-hc-workspace-link="repair"]')).toContainText(account.owned_businesses[0].name);
});

test("public Repair Shop shell stays anonymous when no Hermes account is authorized", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json({ success: false, error: "unauthorized" }, 401)));
  await page.route("**/api/internal-ai/status", (route) => route.fulfill(json({ success: false, error: "forbidden" }, 403)));

  await page.goto("/services/hermes-connect/repair-shops/?lang=ru", { waitUntil: "domcontentloaded" });
  await expect(page.locator('header details[data-hc-account-switcher][data-public-safe="true"]')).toBeHidden();
});
