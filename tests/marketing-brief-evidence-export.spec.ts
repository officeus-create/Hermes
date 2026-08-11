import { expect, test } from "@playwright/test";

test("QA export Marketing Brief visual evidence", async ({ page }, testInfo) => {
  const externalPosts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && !request.url().includes("google-analytics.com") && !request.url().includes("/g/collect")) {
      externalPosts.push(request.url());
    }
  });

  await page.goto("/paths/marketing/#contact");
  await page.locator('select[name="path"]').selectOption("ProgressoPro");
  await page.locator('input[name="platforms"][value="SEO / Google Search"]').check();
  await page.locator('input[name="platforms"][value="Google Ads / Paid Search"]').check();
  await page.locator('select[name="planning_horizon"]').selectOption("6 months");
  await page.locator('input[name="primary_goal"]').fill("More qualified leads for a service business");
  await page.locator('input[name="target_audience"]').fill("U.S. service businesses");
  await page.locator('textarea[name="current_channels_results"]').fill("Organic search and social media are active; qualification is the next priority.");
  await page.locator('input[name="monthly_budget_range"]').fill("Budget to be discussed after scope review");

  // These two fixed controls can visually overlap a locator screenshot even though
  // the actual page scroll/interaction is correct. Hide them only for evidence capture.
  await page.addStyleTag({
    content: "[data-header], [data-consent-settings] { visibility: hidden !important; }",
  });

  const group = page.locator("[data-direction-fields]");
  await expect(group).toBeVisible();
  await group.scrollIntoViewIfNeeded();
  const png = await group.screenshot({ animations: "disabled" });

  expect(externalPosts).toEqual([]);
  console.log(`MARKETING_BRIEF_EVIDENCE_${testInfo.project.name.toUpperCase()}=${png.toString("base64")}`);
});
