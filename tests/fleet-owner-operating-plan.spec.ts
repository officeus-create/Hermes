import { expect, test } from "@playwright/test";

const route = "/logistics/fleet-owner-dispatch-support/";

test("fleet-owner page explains the written operating plan and continuity boundaries", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/Fleet-Owner Dispatch Support/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
  await expect(page.getByRole("heading", { level: 1, name: "Fleet-Owner Dispatch and Operations Support" })).toBeVisible();

  for (const text of [
    "Written Fleet Operating Plan",
    "Operating-plan confirmation",
    "primary fleet contact",
    "backup contact or escalation route",
    "reporting cadence actually included in the agreement",
    "What is included in a Fleet Operating Plan?",
    "What happens if the normal fleet contact is unavailable?",
    "Does every fleet receive daily or weekly reports?",
    "does not automatically create 24/7 staffing or uninterrupted coverage",
    "does not assume permission to commit a truck, change a rate, or accept a load",
  ]) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }

  await expect(page.getByText(/Loads, revenue, utilization, rates, mileage, return loads, lane consistency, response time, and uninterrupted coverage are not guaranteed/i)).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toContainText('"FAQPage"');
});
