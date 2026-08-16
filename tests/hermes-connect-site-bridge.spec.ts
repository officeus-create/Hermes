import { expect, test } from "@playwright/test";

const productRoute = "/services/hermes-connect/";
const connectUrl = "https://connect.hermeslogisticsus.com/#apply";
const pilotRoute = "/services/hermes-connect/repair-shops/";
const ownerAuthRoute = "/services/hermes-connect/repair-shops/auth/";

test("Hermes Connect has an indexed product overview connected to the current Repair Shop product", async ({ page }) => {
  await page.goto(productRoute);

  await expect(page).toHaveTitle("Hermes Connect Web App for Service Businesses");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://hermeslogisticsus.com${productRoute}`,
  );
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("heading", { name: /Give clients one clear place/i })).toBeVisible();

  const categoryCards = page.locator(".connect-service-category-grid article");
  await expect(categoryCards).toHaveCount(10);
  await expect(categoryCards.filter({ hasText: "Auto service & repair" })).toHaveCount(1);
  await expect(categoryCards.filter({ hasText: "Truck & car-hauler repair" })).toHaveCount(1);
  await expect(categoryCards.filter({ hasText: "Heavy equipment service" })).toHaveCount(1);
  await expect(categoryCards.filter({ hasText: "Oversize & specialty equipment" })).toHaveCount(1);

  await expect(page.locator('main a[href^="https://connect.hermeslogisticsus.com"]')).toHaveCount(0);
  expect(await page.locator(`main a[href="${pilotRoute}"]`).count()).toBeGreaterThan(0);
  expect(await page.locator(`main a[href="${ownerAuthRoute}"]`).count()).toBeGreaterThan(0);

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schemas.join("\n")).toContain('"@type":"WebApplication"');
  expect(schemas.join("\n")).toContain("https://connect.hermeslogisticsus.com/");
  expect(schemas.join("\n")).toContain("Any modern web browser");
});

test("the shared site shell keeps one manager-ready Hermes Connect Repair Shop entry on desktop and mobile", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");

  const desktopEntry = page.locator(`.header-actions a[href="${pilotRoute}"]`);
  await expect(desktopEntry).toHaveCount(1);
  await expect(desktopEntry).toContainText("Hermes Connect");
  await expect(desktopEntry).toHaveAttribute("aria-label", /Repair Shop Partner Beta/);
  await expect(desktopEntry).not.toContainText(/Live|Connected|Realtime/i);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();

  const mobileEntry = page.locator(`#mobile-menu a[href="${pilotRoute}"]`);
  await expect(mobileEntry).toHaveCount(1);
  await expect(mobileEntry).toContainText("Hermes Connect");
  await expect(mobileEntry).toContainText("Repair Shop Partner Beta");
});

test("the IT Development section routes visitors into the current Hermes Connect product", async ({ page }) => {
  await page.goto("/paths/technology/");

  const connectPrototype = page.locator("[data-connect-prototype]");
  await expect(connectPrototype).toContainText("Hermes Connect");
  await expect(connectPrototype).toContainText("Web App");
  await expect(connectPrototype).toContainText("category");
  await expect(connectPrototype.locator('a[href="/services/hermes-connect/"]')).toContainText("Explore Hermes Connect");
  await expect(connectPrototype.locator(`a[href="${connectUrl}"]`)).toContainText("Request Web App access");
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
