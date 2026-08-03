import { expect, test } from "@playwright/test";

const workspacePath = "/demos/ai-visibility-scorecard/";

test("AI visibility workspace is noindex and starts with an honest empty baseline", async ({ page }) => {
  await page.goto(workspacePath);

  await expect(page).toHaveTitle(/AI Brand Visibility Scorecard/);
  await expect(page.getByRole("heading", { level: 1, name: "AI Brand Visibility and Citation Scorecard" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow,noarchive");
  await expect(page.getByText("Zero observations means zero measured visibility—not zero market visibility.")).toBeVisible();
  await expect(page.locator('[data-real-metrics] [data-metric="total"]')).toHaveText("0");
  await expect(page.locator("[data-query-card]")).toHaveCount(48);
  await expect(page.getByText("Fixture metrics prove the calculation contract—not Hermes visibility.")).toBeVisible();
  await expect(page.getByText("No automated provider checks.")).toBeVisible();

  const sitemapResponse = await page.request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(await sitemapResponse.text()).not.toContain(workspacePath);
});

test("query filters separate direction, language, and intent without external requests", async ({ page }) => {
  await page.goto(workspacePath);

  await page.locator('select[data-query-filter="direction"]').selectOption("academy");
  await expect(page.locator("[data-query-card]:visible")).toHaveCount(12);
  await expect(page.locator("[data-query-count]")).toHaveText("12 prompts visible.");

  await page.locator('select[data-query-filter="language"]').selectOption("ru");
  const russianAcademyCount = await page.locator("[data-query-card]:visible").count();
  expect(russianAcademyCount).toBeGreaterThan(0);
  expect(russianAcademyCount).toBeLessThan(12);

  await page.locator('select[data-query-filter="intent"]').selectOption("commercial");
  await expect(page.locator("[data-query-card]:visible").first()).toBeVisible();
});

test("manual observation remains local and validates linked citation paths", async ({ page }) => {
  await page.goto(workspacePath);

  const form = page.locator("[data-ai-observation-form]");
  await form.locator('input[name="observedAt"]').fill("2026-08-03T18:00");
  await form.locator('select[name="brandMentioned"]').selectOption("true");
  await form.locator('select[name="linkedCitation"]').selectOption("true");
  await form.locator('input[name="citedPath"]').fill("https://example.com/not-a-hermes-path");
  await form.getByRole("button", { name: "Prepare local observation" }).click();
  await expect(page.locator("[data-observation-status]")).toHaveText("A linked Hermes citation requires a site path beginning with /.");

  await form.locator('input[name="citedPath"]').fill("/academy/us-logistics-operations/");
  await form.locator('select[name="recommendation"]').selectOption("considered_option");
  await form.locator('select[name="entityAccuracy"]').selectOption("accurate");
  await form.locator('select[name="descriptionAccuracy"]').selectOption("accurate");
  await form.getByRole("button", { name: "Prepare local observation" }).click();

  await expect(page.locator("[data-observation-status]")).toHaveText("Observation prepared locally. No storage or external action occurred.");
  await expect(page.locator("[data-observation-preview]")).toBeVisible();
  await expect(page.locator("[data-local-observations] article")).toHaveCount(1);
  await expect(page.locator("[data-local-observations]")).toContainText("LOG-01 · chatgpt");
  await expect(page.locator("[data-observation-preview] pre")).toContainText('"id": "LOCAL-001"');
  await expect(page.locator("[data-observation-preview] pre")).toContainText('"linkedCitation": true');
});
