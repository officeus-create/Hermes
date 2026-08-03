import { expect, test } from "@playwright/test";

const resourcePath = "/logistics/resources/broker-setup-packet-checklist/";
const intakeHref = "/load-board/?role=carrier&equipment=car_hauler#carrier-access";

test("broker setup checklist prepares carrier documents without exposing credentials", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page).toHaveTitle(/Broker Setup Packet Checklist/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Broker Setup Packet Checklist for Carriers" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eight areas to verify before submission." })).toBeVisible();
  await expect(page.getByText("Business identity", { exact: true })).toBeVisible();
  await expect(page.getByText("Payment and factoring", { exact: true })).toBeVisible();
  await expect(page.getByText(/Passwords, API keys, security questions/i)).toBeVisible();
  await expect(page.getByText(/does not automatically approve a setup/i)).toBeVisible();

  await expect(page.locator(`main a[href="${intakeHref}"]`)).toHaveCount(2);
  await expect(page.locator('main a[href="/logistics/new-authority-car-hauler-support/"]')).toHaveCount(1);
});

test("broker setup checklist exposes canonical structured data and sitemap ownership", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/broker-setup-packet-checklist/",
  );

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"Article"');
  expect(schemaText).toContain('"Service"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');

  const sitemapResponse = await page.request.get("/sitemap-services.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).toContain(
    "https://hermeslogisticsus.com/logistics/resources/broker-setup-packet-checklist/",
  );
});

test("new-authority commercial owner links to the broker setup checklist", async ({ page }) => {
  await page.goto("/logistics/new-authority-car-hauler-support/");
  await expect(
    page.locator('main a[href="/logistics/resources/broker-setup-packet-checklist/"]'),
  ).toHaveCount(1);
  await expect(page.getByText("Broker Setup Packet Checklist", { exact: true })).toBeVisible();
});