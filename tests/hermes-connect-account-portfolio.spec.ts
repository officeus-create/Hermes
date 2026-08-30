import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const identity = {
  success: true,
  specialist: {
    id: "owner-portfolio-1",
    name: "Office Owner",
    email: "office@example.com",
    role: "owner",
  },
};

const shop = {
  id: "shop-portfolio-1",
  slug: "hermes-test-garage",
  name: "Hermes Test Garage",
  phone: "+14145550100",
  address_line1: "123 Main St",
  city: "Milwaukee",
  state: "WI",
  postal_code: "53202",
  timezone: "America/Chicago",
};

async function mockSharedPortfolio(page: any) {
  await page.route("**/api/auth/me", (route: any) => route.fulfill(json(identity)));
  await page.route("**/api/repair-shop/profile", (route: any) => route.fulfill(json({ success: true, shop })));
  await page.route("**/api/internal-ai/status", (route: any) => route.fulfill(json({ success: false, error: "forbidden" }, 403)));
}

async function mockRepairWorkspace(page: any) {
  await mockSharedPortfolio(page);
  await page.route("**/api/services", (route: any) => route.fulfill(json({ success: true, services: [] })));
  await page.route("**/api/repair-shop/bookings", (route: any) => route.fulfill(json({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route: any) => route.fulfill(json({ success: true, feedback: [] })));
}

async function mockAcademyWorkspace(page: any) {
  await mockSharedPortfolio(page);
  await page.route("**/api/academy/profile", (route: any) => route.fulfill(json({
    success: true,
    learner: {
      id: "learner-portfolio-1",
      email: identity.specialist.email,
      name: identity.specialist.name,
      identity_role: "owner",
      location: "Kyiv",
      preferred_language: "ru",
      timezone: "Europe/Kyiv",
    },
    enrollments: [],
    reviewer_access: { active: false, program_scope: null },
  })));
}

test("private Repair Shop header exposes one Hermes identity and honest workspace portfolio", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await mockRepairWorkspace(page);
  await page.goto("/services/hermes-connect/repair-shops/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  const menu = page.locator("details[data-hc-account-switcher]");
  await expect(menu).toBeVisible();
  await expect(menu.locator("[data-account-name]")).toHaveText(identity.specialist.name);
  await expect(menu.locator("[data-account-email]")).toHaveText(identity.specialist.email);

  await menu.locator("summary").click();

  const repair = menu.locator("[data-workspace-repair]");
  const academy = menu.locator('.hc-account-workspace.academy');
  const ai = menu.locator("[data-workspace-ai]");

  await expect(repair).toBeVisible();
  await expect(repair.locator("[data-repair-name]")).toHaveText(shop.name);
  await expect(repair).toHaveClass(/is-current/);
  await expect(repair).toHaveAttribute("href", /\/repair-shops\/dashboard\/\?lang=ru$/);

  await expect(academy).toBeVisible();
  await expect(academy).toContainText("Общее пространство Hermes");
  await expect(academy).toHaveAttribute("href", /\/academy\/dashboard\/\?lang=ru$/);

  await expect(ai).toBeHidden();
});

test("mobile Academy navigation shows the same identity and full portfolio without inventing AI access", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAcademyWorkspace(page);
  await page.goto("/services/hermes-connect/academy/dashboard/?lang=ru", { waitUntil: "domcontentloaded" });

  await page.locator("[data-menu-button]").click();
  const mobileMenu = page.locator("[data-mobile-menu]");
  await expect(mobileMenu).toBeVisible();

  const portfolio = mobileMenu.locator(".hc-mobile-account-panel [data-hc-account-switcher]");
  await expect(portfolio).toBeVisible();
  await expect(portfolio.locator("[data-account-name]")).toHaveText(identity.specialist.name);
  await expect(portfolio.locator("[data-account-email]")).toHaveText(identity.specialist.email);

  const repair = portfolio.locator("[data-workspace-repair]");
  const academy = portfolio.locator('.hc-account-workspace.academy');
  const ai = portfolio.locator("[data-workspace-ai]");

  await expect(repair).toBeVisible();
  await expect(repair.locator("[data-repair-name]")).toHaveText(shop.name);
  await expect(repair).toHaveAttribute("href", /\/repair-shops\/dashboard\/\?lang=ru$/);

  await expect(academy).toBeVisible();
  await expect(academy).toHaveClass(/is-current/);
  await expect(academy).toContainText("Общее пространство Hermes");
  await expect(academy).toHaveAttribute("href", /\/academy\/dashboard\/\?lang=ru$/);

  await expect(ai).toBeHidden();
});
