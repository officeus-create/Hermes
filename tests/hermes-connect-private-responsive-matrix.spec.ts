import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-wide", width: 430, height: 932 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 900 },
  { name: "desktop", width: 1440, height: 1200 },
] as const;

const json = (body: unknown, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const specialist = {
  id: "responsive-owner-1",
  name: "Office Owner",
  email: "office@example.com",
  role: "owner",
  location: "Kyiv",
};

const repairShop = {
  id: "responsive-repair-1",
  slug: "hermes-responsive-garage",
  name: "Hermes Responsive Garage",
  phone: "+14145550100",
  address_line1: "123 Main St",
  city: "Milwaukee",
  state: "WI",
  postal_code: "53202",
  timezone: "America/Chicago",
};

const beautySalon = {
  id: "responsive-beauty-1",
  slug: "aurelia-beauty-wellness",
  name: "Aurelia Beauty & Wellness Studio",
  phone: "+13055550148",
  website: "https://example.com/",
  address_line1: "100 Ocean Dr",
  city: "Miami",
  region: "Florida",
  postal_code: "33139",
  country_code: "US",
  timezone: "America/New_York",
};

const beautyContext = { id: "responsive-beauty-context-1", vertical_key: "beauty_salon" };

const accountPortfolio = {
  success: true,
  identity: specialist,
  owned_businesses: [
    {
      key: "repair_shop",
      kind: "owned_business",
      id: repairShop.id,
      name: repairShop.name,
      slug: repairShop.slug,
      href: "/services/hermes-connect/repair-shops/dashboard/",
      workspace_state: "live",
    },
    {
      key: "beauty_salon",
      kind: "owned_business",
      id: beautySalon.id,
      name: beautySalon.name,
      slug: beautySalon.slug,
      href: "/services/hermes-connect/beauty/workspace/",
      workspace_state: "private_foundation",
    },
  ],
  workspaces: [
    {
      key: "academy",
      kind: "shared_workspace",
      href: "/services/hermes-connect/academy/dashboard/",
      available: true,
      state: {
        profile_exists: true,
        preferred_language: "ru",
        timezone: "Europe/Kyiv",
        enrollments: [],
        reviewer_access: { active: false, program_scope: null },
      },
    },
    {
      key: "internal_ai",
      kind: "capability_workspace",
      href: "/services/hermes-connect/internal/ai-connect/",
      available: true,
      state: { capability: "HERMES_INTERNAL_OWNER" },
    },
  ],
  capabilities: { internal_ai: true },
};

async function mockSharedAccount(page: Page) {
  await page.route("**/api/hermes-connect/account", (route) => route.fulfill(json(accountPortfolio)));
  await page.route("**/api/auth/me", (route) => route.fulfill(json({ success: true, specialist })));
}

async function expectNoHorizontalOverflow(page: Page, surface: string, width: number) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.scrollWidth,
    `${surface} must not horizontally overflow at ${width}px`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function expectControlHeight(page: Page, selector: string, surface: string, width: number) {
  const control = page.locator(selector).first();
  await control.scrollIntoViewIfNeeded();
  await expect(control, `${surface} primary control must be visible at ${width}px`).toBeVisible();
  const box = await control.boundingBox();
  expect(box, `${surface} primary control must have a measurable box at ${width}px`).not.toBeNull();
  if (box) {
    expect(box.height, `${surface} primary control must remain at least 44px at ${width}px`).toBeGreaterThanOrEqual(44);
  }
}

async function expectHermesAccountContext(page: Page) {
  const standalone = page.locator("main [data-hc-account-switcher]").first();
  if (await standalone.count()) {
    await expect(standalone).toBeVisible();
    await expect(standalone.locator("[data-account-name]")).toHaveText(specialist.name);
    await expect(standalone.locator("[data-account-email]")).toHaveText(specialist.email);
    return;
  }

  const desktopMenu = page.locator("header details[data-hc-account-switcher]").first();
  if (await desktopMenu.isVisible()) {
    await expect(desktopMenu.locator("[data-account-name]")).toHaveText(specialist.name);
    await expect(desktopMenu.locator("[data-account-email]")).toHaveText(specialist.email);
    return;
  }

  const menuButton = page.locator("[data-menu-button]").first();
  await expect(menuButton).toBeVisible();
  if ((await menuButton.getAttribute("aria-expanded")) !== "true") await menuButton.click();
  const mobileAccount = page.locator("[data-mobile-menu] .hc-mobile-account-panel [data-hc-account-switcher]").first();
  await expect(mobileAccount).toBeVisible();
  await expect(mobileAccount.locator("[data-account-name]")).toHaveText(specialist.name);
  await expect(mobileAccount.locator("[data-account-email]")).toHaveText(specialist.email);
}

async function exerciseViewports(
  page: Page,
  {
    surface,
    url,
    readySelector,
    primarySelector,
    extraControlSelector,
  }: {
    surface: string;
    url: string;
    readySelector: string;
    primarySelector: string;
    extraControlSelector?: string;
  },
) {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await expect(page.locator(readySelector).first(), `${surface} must load real private content at ${viewport.width}px`).toBeVisible();
    await expectHermesAccountContext(page);
    await expectNoHorizontalOverflow(page, surface, viewport.width);
    await expectControlHeight(page, primarySelector, surface, viewport.width);
    if (extraControlSelector) await expectControlHeight(page, extraControlSelector, `${surface} input`, viewport.width);
  }
}

test("Repair owner workspace keeps authenticated Design OS ergonomics at all five widths", async ({ page }) => {
  await mockSharedAccount(page);
  await page.route("**/api/repair-shop/profile", (route) => route.fulfill(json({ success: true, shop: repairShop })));
  await page.route("**/api/services", (route) => route.fulfill(json({
    success: true,
    services: [
      { id: "service-1", name: "Diagnostic inspection and electrical troubleshooting", duration_minutes: 60 },
      { id: "service-2", name: "Brake inspection", duration_minutes: 45 },
    ],
  })));
  await page.route("**/api/repair-shop/bookings", (route) => route.fulfill(json({ success: true, bookings: [] })));
  await page.route("**/api/repair-shop/feedback", (route) => route.fulfill(json({ success: true, feedback: [] })));

  await exerciseViewports(page, {
    surface: "Repair owner workspace",
    url: "/services/hermes-connect/repair-shops/dashboard/?lang=ru",
    readySelector: "main.workspace-page h1",
    primarySelector: "#save-profile-btn",
  });
});

test("Academy learner workspace keeps authenticated Design OS ergonomics at all five widths", async ({ page }) => {
  await mockSharedAccount(page);
  await page.route("**/api/academy/profile", (route) => route.fulfill(json({
    success: true,
    learner: {
      id: "responsive-learner-1",
      email: specialist.email,
      name: specialist.name,
      identity_role: specialist.role,
      location: specialist.location,
      preferred_language: "ru",
      timezone: "Europe/Kyiv",
    },
    enrollments: [],
    reviewer_access: { active: false, program_scope: null },
  })));

  await exerciseViewports(page, {
    surface: "Academy learner workspace",
    url: "/services/hermes-connect/academy/dashboard/?lang=ru",
    readySelector: "[data-dashboard-content] h1",
    primarySelector: ".academy-app-button.primary",
  });
});

test("Beauty owner workspace keeps authenticated Design OS ergonomics at all five widths", async ({ page }) => {
  await mockSharedAccount(page);
  await page.route("**/api/beauty-salon/profile", (route) => route.fulfill(json({ success: true, salon: beautySalon, service_context: beautyContext })));
  await page.route("**/api/beauty-salon/team", (route) => route.fulfill(json({ success: true, salon_id: beautySalon.id, team: [] })));
  await page.route(/\/api\/services\?context=/, (route) => route.fulfill(json({ success: true, context: beautyContext, services: [] })));

  await exerciseViewports(page, {
    surface: "Beauty owner workspace",
    url: "/services/hermes-connect/beauty/workspace/?lang=ru",
    readySelector: "[data-beauty-content]",
    primarySelector: "[data-profile-form] .beauty-b1-button.primary",
    extraControlSelector: "[data-profile-form] input[name=\"name\"]",
  });
});

test("Internal AI control center keeps authorized account context and ergonomics at all five widths", async ({ page }) => {
  await mockSharedAccount(page);
  await page.route("**/api/internal-ai/status", (route) => route.fulfill(json({
    success: true,
    runtime: { online: true, repo_sha: "responsive-matrix-sha", runtime_version: "responsive-matrix" },
    active_task: null,
    latest_task: null,
  })));

  await exerciseViewports(page, {
    surface: "Internal AI control center",
    url: "/services/hermes-connect/internal/ai-connect/?lang=ru",
    readySelector: "[data-content] .task-console",
    primarySelector: "[data-start]",
  });
});
