import { expect, test } from "@playwright/test";

const productRoute = "/services/hermes-connect/";
const pilotRoute = "/services/hermes-connect/repair-shops/";
const ownerAuthRoute = "/services/hermes-connect/repair-shops/auth/";

test("Hermes Connect product hub describes the current Repair Shop beta", async ({ page }) => {
  await page.goto(productRoute);

  await expect(page).toHaveTitle("Hermes Connect | Repair Shop Partner Beta & Product Hub");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://hermeslogisticsus.com${productRoute}`,
  );
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("heading", { level: 1, name: /One Hermes Connect\. One current live pilot: Repair Shops/i })).toBeVisible();

  const categoryCards = page.locator(".connect-service-category-grid article");
  await expect(categoryCards).toHaveCount(10);
  await expect(categoryCards.filter({ hasText: "Auto service & repair" })).toHaveCount(1);
  await expect(categoryCards.filter({ hasText: "Truck & car-hauler repair" })).toHaveCount(1);

  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  expect(await page.locator(`main a[href="${pilotRoute}"]`).count()).toBeGreaterThan(0);
  expect(await page.locator(`main a[href="${ownerAuthRoute}"]`).count()).toBeGreaterThan(0);

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schemas.join("\n")).toContain('"@type":"WebApplication"');
  expect(schemas.join("\n")).toContain("https://hermeslogisticsus.com/services/hermes-connect/");
  expect(schemas.join("\n")).toContain("Any modern web browser");
});

test("the shared site shell keeps one manager-ready Hermes Connect Repair Shop entry on desktop and mobile", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");

  const desktopEntry = page.locator(`.header-actions a[href="${pilotRoute}"]`);
  await expect(desktopEntry).toHaveCount(1);
  await expect(desktopEntry).toContainText("Hermes Connect");
  await expect(desktopEntry).toHaveAttribute("aria-label", /Repair Shop Partner Beta/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();

  const mobileEntry = page.locator(`#mobile-menu a[href="${pilotRoute}"]`);
  await expect(mobileEntry).toHaveCount(1);
  await expect(mobileEntry).toContainText("Hermes Connect");
  await expect(mobileEntry).toContainText("Repair Shop Partner Beta");
});

test("the IT Development section classifies its Hermes Connect preview as demo and routes to current product", async ({ page }) => {
  await page.goto("/paths/technology/");

  const connectPrototype = page.locator("[data-connect-prototype]");
  await expect(connectPrototype).toContainText("Hermes Connect");
  await expect(connectPrototype).toContainText("Demo capability");
  await expect(connectPrototype).toContainText("Repair Shop Partner Beta is the current live Hermes Connect pilot");
  await expect(connectPrototype.locator(`a[href="${productRoute}"]`)).toContainText("Explore Hermes Connect Hub");
  await expect(connectPrototype.locator(`a[href="${pilotRoute}"]`)).toContainText("Open Repair Shop Partner Beta");
  await expect(connectPrototype.locator('a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  await expect(connectPrototype).not.toContainText(/iPhone|Android|App Store|Google Play/i);
});

test("the homepage presents Hermes Connect as a first-class Web App product", async ({ page }) => {
  await page.goto("/");

  const card = page.locator(".home-connect-product-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Hermes Connect");
  await expect(card).toContainText("category-aware Web App");
  await expect(card.locator('a[href="/services/hermes-connect/"]')).toContainText("Explore Hermes Connect");
});
