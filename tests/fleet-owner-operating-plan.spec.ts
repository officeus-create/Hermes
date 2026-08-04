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
  ]) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  }

  const planFaq = page.locator("details", { hasText: "What is included in a Fleet Operating Plan?" });
  await expect(planFaq.locator("summary")).toBeVisible();
  await expect(planFaq).toContainText("does not automatically create 24/7 staffing or uninterrupted coverage");

  const unavailableFaq = page.locator("details", { hasText: "What happens if the normal fleet contact is unavailable?" });
  await expect(unavailableFaq.locator("summary")).toBeVisible();
  await expect(unavailableFaq).toContainText("does not assume permission to commit a truck, change a rate, or accept a load");

  const reportingFaq = page.locator("details", { hasText: "Does every fleet receive daily or weekly reports?" });
  await expect(reportingFaq.locator("summary")).toBeVisible();
  await expect(reportingFaq).toContainText("Not automatically");

  await expect(page.getByText(/Loads, revenue, utilization, rates, mileage, return loads, lane consistency, response time, and uninterrupted coverage are not guaranteed/i)).toBeVisible();

  const schemaText = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
    nodes.map((node) => node.textContent ?? "").join("\n"),
  );
  expect(schemaText).toContain('"FAQPage"');
});
