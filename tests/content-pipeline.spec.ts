import { expect, test } from "@playwright/test";

test("content pipeline workspace is noindex and reports the unfilled 30-asset pilot honestly", async ({ page }) => {
  const response = await page.goto("/demos/content-pipeline/");
  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/Content Pipeline Review Workspace/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow,noarchive");
  await expect(page.getByRole("heading", { level: 1, name: /Social Content.*Website Asset Review Workspace/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Thirty quota slots exist; zero real sources are claimed/ })).toBeVisible();
  await expect(page.getByText("30", { exact: true })).toHaveCount(2);
  await expect(page.getByText("0", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Hermes Logistics" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "ProgressoPro" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Hermes Business Academy" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Hermes IT / Technology" })).toBeVisible();
  await expect(page.locator('[data-content-decision="publish_candidate"]')).toHaveCount(2);
  await expect(page.locator('[data-content-decision="merge_or_expand"]')).toHaveCount(1);
  await expect(page.locator('[data-content-decision="hold"]')).toHaveCount(2);
  await expect(page.locator('[data-content-decision="reject"]')).toHaveCount(2);
  await expect(page.locator('[data-content-decision="awaiting_source"]')).toHaveCount(1);
  await expect(page.locator('a[href="/demos/content-pipeline/insight-preview/"]')).toBeVisible();
});

test("synthetic insight preview uses the reusable template without claiming VideoObject eligibility", async ({ page }) => {
  const response = await page.goto("/demos/content-pipeline/insight-preview/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow,noarchive");
  await expect(page.getByRole("heading", { level: 1, name: "What should a car hauler check before approving a load?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Video schema held" })).toBeVisible();
  await expect(page.getByText(/Synthetic fixture synthetic-logistics-publish/)).toBeVisible();
  await expect(page.locator('a[href="/logistics/car-hauling-dispatch/"]')).toHaveCount(3);
  await expect(page.locator('a[href="/academy/us-logistics-operations/"]')).toBeVisible();

  const schemaText = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(schemaText).toContain('"Article"');
  expect(schemaText).toContain('"Service"');
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"BreadcrumbList"');
  expect(schemaText).not.toContain('"VideoObject"');
  expect(schemaText).not.toContain("example.invalid");
});

test("content pipeline demos are excluded from declared sitemaps", async ({ page }) => {
  const robots = await page.request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const sitemapUrls = (await robots.text())
    .split("\n")
    .filter((line) => line.startsWith("Sitemap:"))
    .map((line) => new URL(line.replace("Sitemap:", "").trim()).pathname);

  for (const sitemapUrl of sitemapUrls) {
    const response = await page.request.get(sitemapUrl);
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).not.toContain("/demos/content-pipeline/");
  }
});
