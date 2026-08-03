import { expect, test } from "@playwright/test";

const hubPath = "/logistics/resources/";
const intakeHref = "/load-board/?role=carrier&equipment=car_hauler#carrier-access";
const coreGuides = [
  "/logistics/resources/dispatch-service-vs-self-dispatch/",
  "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
  "/logistics/resources/broker-setup-packet-checklist/",
];
const servicePaths = [
  "/logistics/car-hauling-dispatch/",
  "/logistics/owner-operator-dispatch-support/",
  "/logistics/fleet-owner-dispatch-support/",
  "/logistics/new-authority-car-hauler-support/",
];

test("carrier knowledge hub organizes reviewed guides and controlled next steps", async ({ page }) => {
  await page.goto(hubPath);

  await expect(page).toHaveTitle(/Carrier Knowledge Hub for Car Haulers/);
  await expect(page.getByRole("heading", { level: 1, name: "Carrier Knowledge Hub for Car Haulers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Three practical resources to review first." })).toBeVisible();
  await expect(page.getByText("Dispatch Service vs Self-Dispatch", { exact: true })).toBeVisible();
  await expect(page.getByText("Car Hauler Readiness Checklist", { exact: true })).toBeVisible();
  await expect(page.getByText("Broker Setup Packet Checklist", { exact: true })).toBeVisible();
  await expect(page.getByText("The carrier keeps final control.", { exact: true })).toBeVisible();
  await expect(page.getByText(/does not guarantee acceptance, a dispatcher, loads, rates, lanes, utilization, payment, profit, or revenue/i)).toBeVisible();

  for (const href of coreGuides) await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
  for (const href of servicePaths) await expect(page.locator(`main a[href="${href}"]`)).toHaveCount(1);
  await expect(page.locator(`main a[href="${intakeHref}"]`)).toHaveCount(3);
  await expect(page.locator('main a[href="/academy/us-logistics-operations/"]')).toHaveCount(1);
});

test("carrier knowledge hub is indexable with one sitemap owner and matching schema", async ({ page }) => {
  await page.goto(hubPath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index,follow,max-image-preview:large",
  );

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"CollectionPage"');
  expect(schemaText).toContain('"ItemList"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');
  for (const href of coreGuides) expect(schemaText).toContain(`https://hermeslogisticsus.com${href}`);

  const sitemapResponse = await page.request.get("/sitemap-services.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).toContain("https://hermeslogisticsus.com/logistics/resources/");
});

test("main Logistics hub exposes the canonical Carrier Knowledge Hub", async ({ page }) => {
  await page.goto("/paths/logistics/");
  await expect(page.locator('a[href="/logistics/resources/"]')).toHaveCount(1);
  await expect(page.getByText("Carrier Knowledge Hub", { exact: true })).toBeVisible();
});
