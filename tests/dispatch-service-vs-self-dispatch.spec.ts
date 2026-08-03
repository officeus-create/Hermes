import { expect, test } from "@playwright/test";

const resourcePath = "/logistics/resources/dispatch-service-vs-self-dispatch/";
const intakeHref = "/load-board/?role=carrier&equipment=car_hauler#carrier-access";

test("dispatch comparison explains both operating models and routes carriers to review", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page).toHaveTitle(/Dispatch Service vs Self-Dispatch/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Dispatch Service vs Self-Dispatch for Car Haulers" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Six responsibilities to assign clearly." })).toBeVisible();
  await expect(page.getByText("Load search coverage", { exact: true })).toBeVisible();
  await expect(page.getByText("Control over booking", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A hybrid workflow can preserve control while delegating repeatable work." })).toBeVisible();
  await expect(page.getByText(/does not automatically assign a dispatcher/i)).toBeVisible();

  await expect(page.locator(`main a[href="${intakeHref}"]`)).toHaveCount(2);
  await expect(page.locator('main a[href="/logistics/car-hauling-dispatch/"]')).toHaveCount(2);
  await expect(page.locator('main a[href="/paths/academy/"]')).toHaveCount(1);
});

test("dispatch comparison exposes canonical structured data and sitemap ownership", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/",
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
    "https://hermeslogisticsus.com/logistics/resources/dispatch-service-vs-self-dispatch/",
  );
});

test("commercial dispatch owner links back to the comparison guide", async ({ page }) => {
  await page.goto("/logistics/car-hauling-dispatch/");
  await expect(
    page.locator('main a[href="/logistics/resources/dispatch-service-vs-self-dispatch/"]'),
  ).toHaveCount(1);
  await expect(page.getByText("Dispatch Service vs Self-Dispatch", { exact: true })).toBeVisible();
});