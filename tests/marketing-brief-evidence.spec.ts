import { test, expect } from "@playwright/test";

const screenshotPath = (projectName: string) =>
  projectName === "mobile"
    ? "docs/screenshots/intake02-marketing-mobile.png"
    : "docs/screenshots/intake02-marketing-desktop.png";

test("capture clean Marketing Brief visual evidence", async ({ page }, testInfo) => {
  await page.goto("/paths/marketing/#contact");

  const path = page.locator('select[name="path"]');
  await path.selectOption("ProgressoPro");

  await page.locator('input[name="platforms"][value="SEO / Google Search"]').check();
  await page.locator('input[name="platforms"][value="Instagram"]').check();
  await page.locator('select[name="planning_horizon"]').selectOption("6 months");
  await page.locator('input[name="primary_goal"]').fill("Increase qualified leads");
  await page.locator('input[name="target_audience"]').fill("U.S. service businesses");
  await page.locator('textarea[name="current_channels_results"]').fill("Organic social and search are active; the funnel needs clearer qualification and follow-up.");
  await page.locator('input[name="monthly_budget_range"]').fill("Budget to be reviewed during discovery");

  const fields = page.locator("[data-direction-fields]");
  await expect(fields).toBeVisible();
  await expect(fields.getByText("Marketing details", { exact: true })).toBeVisible();
  await expect(fields.getByText("Primary goal", { exact: true })).toBeVisible();

  // Fixed chrome is real UI, but it is unrelated to this section-level evidence.
  // Hide it only inside this screenshot capture so it cannot overlap the locator crop.
  await page.addStyleTag({
    content: `
      [data-header],
      [data-consent-settings],
      [data-consent-banner] {
        visibility: hidden !important;
      }
    `,
  });

  await fields.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await fields.screenshot({ path: screenshotPath(testInfo.project.name) });
});
