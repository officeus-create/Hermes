import { expect, test } from "@playwright/test";

const productRoute = "/services/hermes-connect/";
const pilotRoute = "/services/hermes-connect/repair-shops/";
const ownerAuthRoute = "/services/hermes-connect/repair-shops/auth/";

test("Hermes Connect has one indexed adaptive product-family overview and one current live product", async ({ page }) => {
  await page.goto(productRoute);

  await expect(page).toHaveTitle("Hermes Connect | AI Operating System for Business");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${productRoute}`);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("heading", { name: /Run your business with AI\./ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One system. Different business realities." })).toBeVisible();

  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  expect(await page.locator(`main a[href="${pilotRoute}"]`).count()).toBeGreaterThan(0);
  expect(await page.locator(`a[href="${ownerAuthRoute}"]`).count()).toBeGreaterThan(0);
  await expect(page.getByText("LIVE PRODUCT", { exact: true }).first()).toBeVisible();
  expect(await page.getByText("PREVIEW CONFIGURATION", { exact: true }).count()).toBeGreaterThanOrEqual(7);
  expect(await page.locator(".hc-lab-links a").count()).toBeGreaterThanOrEqual(7);
  await expect(page.getByText("WORKSPACE PREVIEW · SAMPLE DATA", { exact: true })).toBeVisible();

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"@type":"WebApplication"');
  expect(schemaText).toContain("https://hermeslogisticsus.com/services/hermes-connect/");
  expect(schemaText).not.toContain("connect.hermeslogisticsus.com/workspace");
  expect(schemaText).not.toMatch(/\"price\":(99|299|799)/);
});

test("the shared site shell keeps one manager-ready Hermes Connect Repair Shop entry on desktop and mobile", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");

  const desktopEntry = page.locator(`.header-actions a[href="${pilotRoute}"]`);
  await expect(desktopEntry).toHaveCount(1);
  await expect(desktopEntry).toContainText("Hermes Connect");
  await expect(desktopEntry).not.toContainText(/Realtime/i);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();

  const mobileEntry = page.locator(`#mobile-menu a[href="${pilotRoute}"]`);
  await expect(mobileEntry).toHaveCount(1);
  await expect(mobileEntry).toContainText("Hermes Connect");
});

test("the IT Development section routes visitors into the current Hermes Connect product family", async ({ page }) => {
  await page.goto("/paths/technology/");

  const connectPrototype = page.locator("[data-connect-prototype]");
  await expect(connectPrototype).toContainText("Hermes Connect");
  await expect(connectPrototype).toContainText("Reference capability");
  await expect(connectPrototype.locator('a[href="/services/hermes-connect/"]')).toContainText("Explore Hermes Connect Hub");
  await expect(connectPrototype.locator(`a[href="${pilotRoute}"]`)).toContainText("Open current Repair Shop product");
  await expect(connectPrototype.locator(`a[href="${ownerAuthRoute}"]`)).toContainText("Open profile & availability workspace");
  await expect(connectPrototype.locator('a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
});

test("the homepage presents Hermes Connect as a first-class Web App product", async ({ page }) => {
  await page.goto("/");

  const card = page.locator(".home-connect-product-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Hermes Connect");
  await expect(card).toContainText("category-aware Web App");
  await expect(card.locator('a[href="/services/hermes-connect/"]')).toContainText("Explore Hermes Connect");
});
