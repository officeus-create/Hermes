import { expect, test } from "@playwright/test";

const resourcePath = "/resources/search-to-inquiry-conversion-checklist/";
const seoIntakeHref = "/paths/marketing/?service=seo#contact";
const websiteBriefHref = "/paths/technology/?project=website_development#project-brief";

test("search-to-inquiry checklist connects discovery, qualification, and handoff", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page).toHaveTitle(/Search-to-Inquiry Conversion Checklist/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Search-to-Inquiry Conversion Checklist" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ten areas to review before buying more traffic." })).toBeVisible();
  await expect(page.getByText("Immediate clarity", { exact: true })).toBeVisible();
  await expect(page.getByText("Privacy-safe measurement", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connect discovery, decision, qualification, and follow-up." })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Connect the website, social distribution, CRM, and human follow-up." }),
  ).toBeVisible();
  await expect(page.getByText("Social distribution", { exact: true })).toBeVisible();
  await expect(page.getByText("CRM or review queue", { exact: true })).toBeVisible();
  await expect(page.getByText("Should social media replace the business website?", { exact: true })).toBeVisible();
  await expect(page.getByText(/does not automatically create a contract/i)).toHaveCount(0);
  await expect(page.getByText(/Submitted website URLs, access status, budgets, problems, and messages are not added to analytics/i)).toBeVisible();

  await expect(page.locator(`main a[href="${seoIntakeHref}"]`)).toHaveCount(2);
  await expect(page.locator(`main a[href="${websiteBriefHref}"]`)).toHaveCount(1);
  await expect(page.locator('main a[href="/resources/technical-seo-checklist/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/resources/website-project-brief-template/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/services/website-development/"]')).toHaveCount(2);
  await expect(page.locator('main a[href="/paths/marketing/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/paths/technology/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/academy/marketing/"]')).toHaveCount(1);
});

test("search-to-inquiry checklist exposes canonical structured data and sitemap ownership", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/resources/search-to-inquiry-conversion-checklist/",
  );

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"Article"');
  expect(schemaText).toContain('"Service"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');
  expect(schemaText).toContain('"dateModified":"2026-08-04"');

  const sitemapResponse = await page.request.get("/sitemap-digital-services.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).toContain(
    "https://hermeslogisticsus.com/resources/search-to-inquiry-conversion-checklist/",
  );
});

test("commercial owners link to the new and existing planning resources", async ({ page }) => {
  await page.goto("/services/seo/");
  await expect(page.locator('main a[href="/resources/search-to-inquiry-conversion-checklist/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/resources/technical-seo-checklist/"]')).toHaveCount(1);

  await page.goto("/services/website-development/");
  await expect(page.locator('main a[href="/resources/search-to-inquiry-conversion-checklist/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/resources/website-project-brief-template/"]')).toHaveCount(1);
});