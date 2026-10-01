import { expect, test } from "@playwright/test";

const route = "/services/hermes-connect/academy/business-demo/kons-na-bis/";

test.describe("Academy Business CRM KNB demo", () => {
  test("is review-only and never presents fabricated KPI values", async ({ page }) => {
    let apiWrites = 0;
    await page.route("**/api/**", async (requestRoute) => {
      if (requestRoute.request().method() !== "GET") apiWrites += 1;
      await requestRoute.abort();
    });
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
    await expect(page.getByText("No live writes")).toBeVisible();
    await expect(page.getByText("Client data is intentionally blank.")).toBeVisible();
    const metricValues = page.locator(".metric-card > strong");
    await expect(metricValues.first()).toHaveText("—");
    expect(await metricValues.allTextContents()).toEqual(expect.arrayContaining(["—"]));
    expect(apiWrites).toBe(0);
  });

  test("contains the vacancy-derived marketing, sales and HR requirements", async ({ page }) => {
    await page.goto(route);
    await page.getByRole("button", { name: /Marketing & attribution/ }).click();
    await expect(page.getByText("CAC", { exact: true })).toBeVisible();
    await expect(page.getByText("LTV", { exact: true })).toBeVisible();
    await expect(page.getByText("ROMI", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Sales CRM/ }).click();
    await expect(page.getByRole("heading", { name: "Four-level system" })).toBeVisible();
    await expect(page.getByText("Average check", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /HR & vacancies/ }).click();
    await expect(page.getByRole("heading", { name: "Керівник відділу маркетингу" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Керівник відділу продажу" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Рекрутер" })).toBeVisible();
  });

  test("reuses the existing Academy rather than presenting a second runtime", async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "Reuse the existing Hermes Academy engine." })).toBeVisible();
    await page.getByRole("button", { name: /Learning & reviews/ }).click();
    await expect(page.getByRole("heading", { name: "Reuse existing Academy capabilities" })).toBeVisible();
    await expect(page.getByText(/Reviewer and support power remain separate/)).toBeVisible();
  });

  test("works at 390px without horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: /HR & vacancies/ }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});