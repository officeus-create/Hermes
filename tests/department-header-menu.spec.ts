import { expect, test } from "@playwright/test";

const order = ["logistics", "marketing", "technology", "academy"] as const;

const requiredLinks: Record<(typeof order)[number], string[]> = {
  logistics: ["Load Board", "Agreement", "Dispatch & Back Office"],
  marketing: ["Websites", "SEO & GEO", "Social Media"],
  technology: ["Hermes Connect", "Load Board", "IT Development"],
  academy: ["Logistics", "Marketing", "How Training Works", "Resources", "Apply"],
};

test("English desktop header exposes ordered current-truth department dropdowns", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/paths/logistics/");

  const header = page.locator(".site-header");
  const subnav = page.locator('[data-direction-product-nav="logistics"]');
  await expect(header).toBeVisible();
  await expect(subnav).toBeVisible();

  const headerBox = await header.boundingBox();
  const subnavBox = await subnav.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(subnavBox).not.toBeNull();
  expect(subnavBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);

  const xPositions: number[] = [];
  for (const id of order) {
    const menu = page.locator(`[data-department-menu="${id}"]`);
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    xPositions.push(box!.x);

    await menu.hover();
    const panel = menu.locator(`[data-department-panel="${id}"]`);
    await expect(panel).toBeVisible();
    for (const label of requiredLinks[id]) {
      await expect(panel.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  }

  const academy = page.locator('[data-department-panel="academy"]');
  await expect(academy.getByRole("link", { name: "IT & AI", exact: true })).toHaveCount(0);
  await expect(academy.getByRole("link", { name: "Sales", exact: true })).toHaveCount(0);
  await expect(academy.getByRole("link", { name: "COO / Operations", exact: true })).toHaveCount(0);

  expect(xPositions[0]).toBeLessThan(xPositions[1]);
  expect(xPositions[1]).toBeLessThan(xPositions[2]);
  expect(xPositions[2]).toBeLessThan(xPositions[3]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
});

test("English mobile hamburger exposes the same current departments as accordions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/marketing/");

  await page.locator("[data-menu-button]").click();
  const mobile = page.locator("[data-mobile-menu]");
  await expect(mobile).toBeVisible();

  const yPositions: number[] = [];
  for (const id of order) {
    const details = mobile.locator(`[data-mobile-department-menu="${id}"]`);
    await expect(details).toBeVisible();
    const box = await details.boundingBox();
    expect(box).not.toBeNull();
    yPositions.push(box!.y);
    await details.locator("summary").click();
    for (const label of requiredLinks[id]) {
      await expect(details.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await details.locator("summary").click();
  }

  expect(yPositions[0]).toBeLessThan(yPositions[1]);
  expect(yPositions[1]).toBeLessThan(yPositions[2]);
  expect(yPositions[2]).toBeLessThan(yPositions[3]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("localized primary navigation is not rewritten into English department dropdowns", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru/");
  await page.locator("[data-menu-button]").click();
  await expect(page.locator("[data-mobile-department-menu]")).toHaveCount(0);
  await expect(page.locator('[data-mobile-menu] > a[href="/ru/#logistics"]')).toBeVisible();
});

test("mobile first-visit consent starts below the direction subnav", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => window.localStorage.removeItem("hermes-analytics-consent"));
  await page.goto("/paths/logistics/");

  const subnav = page.locator('[data-direction-product-nav="logistics"]');
  const consent = page.locator("[data-consent-banner]");
  await expect(subnav).toBeVisible();
  await expect(consent).toBeVisible();
  const subnavBox = await subnav.boundingBox();
  const consentBox = await consent.boundingBox();
  expect(subnavBox).not.toBeNull();
  expect(consentBox).not.toBeNull();
  expect(consentBox!.y).toBeGreaterThanOrEqual(subnavBox!.y + subnavBox!.height - 1);
});
