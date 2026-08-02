import { expect, test } from "@playwright/test";

const route = "/resources/technical-seo-checklist/";
const intakeHref = "/paths/marketing/?service=seo#contact";

test("technical SEO checklist is useful, indexable, and connected to SEO intake", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/Free Technical SEO Checklist/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/resources/technical-seo-checklist/",
  );
  await expect(page.getByRole("heading", { level: 1, name: "Free Technical SEO Checklist" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ten areas to review." })).toBeVisible();
  await expect(page.getByText("Crawl access", { exact: true })).toBeVisible();
  await expect(page.getByText("Canonical ownership", { exact: true })).toBeVisible();
  await expect(page.getByText("Measurement", { exact: true })).toBeVisible();

  const intakeLinks = page.locator(`a[href="${intakeHref}"]`);
  await expect(intakeLinks).toHaveCount(2);
  await expect(page.getByText(/does not guarantee crawling, indexation, rankings/i)).toBeVisible();

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"Article"');
  expect(schemaText).toContain('"Service"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');
});
