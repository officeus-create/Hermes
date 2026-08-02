import { expect, test } from "@playwright/test";

const resourcePath = "/resources/website-project-brief-template/";
const projectBriefHref = "/paths/technology/?project=website_development#project-brief";

test("website project brief template provides a useful planning resource and commercial handoff", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page).toHaveTitle(/Website Project Brief Template/);
  await expect(page.getByRole("heading", { level: 1, name: "Website Project Brief Template" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ten decisions to prepare before scope review." })).toBeVisible();
  await expect(page.getByText("Business objective", { exact: true })).toBeVisible();
  await expect(page.getByText("SEO and migration", { exact: true })).toBeVisible();
  await expect(page.getByText("Analytics and qualification", { exact: true })).toBeVisible();

  const intakeLinks = page.locator(`a[href="${projectBriefHref}"]`);
  await expect(intakeLinks).toHaveCount(2);
  await expect(page.getByText(/does not automatically create a contract/i)).toBeVisible();
  await expect(page.getByText(/rankings, traffic, leads, and revenue are not guaranteed/i)).toBeVisible();
});

test("website project brief template exposes canonical and structured data", async ({ page }) => {
  await page.goto(resourcePath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/resources/website-project-brief-template/",
  );

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemaText = schemas.join("\n");
  expect(schemaText).toContain('"Article"');
  expect(schemaText).toContain('"Service"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');
});
