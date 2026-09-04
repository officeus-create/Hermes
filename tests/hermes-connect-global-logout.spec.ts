import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const account = {
  success: true,
  identity: {
    id: "owner-global-logout-1",
    name: "Office Owner",
    email: "office@example.com",
    role: "owner",
  },
  owned_businesses: [
    {
      key: "repair_shop",
      kind: "owned_business",
      id: "shop-global-logout-1",
      name: "Hermes Test Garage",
      slug: "hermes-test-garage",
      href: "/services/hermes-connect/repair-shops/dashboard/",
      workspace_state: "live",
    },
  ],
  workspaces: [],
  capabilities: { internal_ai: false },
};

test("authenticated Product Hub exposes localized shared-shell logout and reuses Hermes auth logout", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json(account)));
  await page.route("**/api/internal-ai/status", (route) => route.fulfill(json({ success: false, error: "forbidden" }, 403)));

  let logoutMethod = "";
  await page.route("**/api/auth/logout", (route) => {
    logoutMethod = route.request().method();
    return route.fulfill(json({ success: true }));
  });

  await page.goto("/services/hermes-connect/?lang=ru", { waitUntil: "domcontentloaded" });

  const menu = page.locator('header details[data-hc-account-switcher][data-public-safe="true"]');
  await expect(menu).toBeVisible();
  await expect(menu.locator("[data-account-name]")).toHaveText(account.identity.name);
  await menu.locator("summary").click();

  const logout = menu.locator("[data-hc-global-logout]");
  await expect(logout).toBeVisible();
  await expect(logout).toHaveText("Выйти");

  await logout.click();
  await expect.poll(() => logoutMethod).toBe("POST");
  await expect(page).toHaveURL(/\/services\/hermes-connect\/\?lang=ru$/);
});
