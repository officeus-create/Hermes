import { expect, test } from "@playwright/test";

const tools = [
  ["load_analyzer", "https://connect.hermeslogisticsus.com/load-analyzer/", "Analyze a load"],
  ["search_opportunity_radar", "https://connect.hermeslogisticsus.com/search-opportunity-radar/", "Open search radar"],
  ["revenue_dashboard", "https://connect.hermeslogisticsus.com/revenue-dashboard/", "Open dashboard"],
  ["multi_car_planner", "https://connect.hermeslogisticsus.com/multi-car-planner/", "Plan a movement"],
  ["logistics_seo_analyzer", "https://connect.hermeslogisticsus.com/logistics-seo-analyzer/", "Run guided analysis"],
] as const;

test("Hermes Connect root surfaces all production Wave 1 tools", async ({ page }) => {
  await page.goto("/demos/hermes-connect/");

  await expect(page.locator("#live-tools")).toBeVisible();
  await expect(page.locator("[data-live-tool-grid]")).toBeVisible();

  for (const [id, href, label] of tools) {
    const link = page.locator(`[data-connect-tool="${id}"]`);
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toContainText(label);
  }
});

test("public intent owners deep-link to the relevant live Connect tools", async ({ page }) => {
  await page.goto("/logistics/multi-car-transport/");
  await expect(page.locator('a[href="https://connect.hermeslogisticsus.com/multi-car-planner/"]')).toBeVisible();

  await page.goto("/services/seo-for-logistics-companies/");
  await expect(page.locator('a[href="https://connect.hermeslogisticsus.com/logistics-seo-analyzer/"]')).toBeVisible();
});
