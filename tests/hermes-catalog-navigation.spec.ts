import { expect, test } from "@playwright/test";

test("Hermes Catalog is separate in the primary header and precedes Hermes Connect", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  const header = page.locator(".site-header");
  const labels = await header.locator(".desktop-nav > a").allTextContents();
  expect(labels.map((label) => label.trim())).toEqual(["Logistics", "IT", "Marketing", "Academy", "Catalog"]);
  await expect(header.locator('.catalog-nav-link[href="/businesses/"]')).toHaveAttribute("aria-current", "page");
  await expect(header.locator('[data-hermes-connect-launcher="header"][href="/services/hermes-connect/"]')).toHaveCount(1);
});

test("Catalog uses the shared horizontal product navigation and connects Hermes directions", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  const nav = page.locator('[data-direction-product-nav="catalog"]');
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Search", exact: true })).toHaveAttribute("href", "/businesses/#catalog-search");
  await expect(page.locator("#catalog-search")).toBeVisible();
  for (const label of ["Search", "Categories", "Locations", "Business Owners", "Hermes Services", "Hermes Connect"]) {
    await expect(nav.getByRole("link", { name: new RegExp(`^${label}$`, "i") })).toBeVisible();
  }
  for (const href of ["/paths/logistics/", "/services/hermes-connect/", "/paths/marketing/", "/paths/academy/"]) {
    await expect(page.locator(`#hermes-ecosystem a[href="${href}"]`)).toBeVisible();
  }
});

test("Catalog search filters the server-rendered evidence-backed profiles", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  const input = page.locator("[data-catalog-input]");
  await input.fill("diesel");
  await expect(page.locator('[data-catalog-card]:not([hidden])')).toHaveCount(2);
  await expect(page.locator("[data-catalog-count]")).toHaveText("2 profiles");
  await input.fill("Sherwood");
  await expect(page.locator('[data-catalog-card]:not([hidden])')).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 3, name: "Sean's AutoPro Mobile" })).toBeVisible();
});

test("Catalog preserves evidence boundaries and free owner activation path", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/expands only when useful source evidence exists/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Add your business free" })).toHaveAttribute("href", /mailto:/);
  await expect(page.getByRole("link", { name: "Connect your business" })).toHaveAttribute("href", "/services/hermes-connect/");
  await expect(page.locator(".catalog-funnel")).toContainText("Free listing");
  await expect(page.locator(".catalog-funnel")).toContainText("Sponsored position");
  await page.goto("/businesses/arkansas/sherwood/seans-autopro-mobile/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".crumb a").first()).toHaveText("Hermes Catalog");
  await expect(page.getByText("Catalog FAQ", { exact: true })).toBeVisible();
});
