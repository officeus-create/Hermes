import { expect, test } from "@playwright/test";

const offerRoute = "/logistics/carrier-offer/";
const onboardingRoute = "/logistics/carrier-onboarding/";

test("carrier sales handoff starts with two clear choices and no data collection", async ({ page }) => {
  await page.goto(offerRoute);

  await expect(page).toHaveTitle("Carrier Support Options | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { name: /You keep the decisions/i })).toBeVisible();
  await expect(page.getByText("Non-exclusive", { exact: true })).toBeVisible();
  await expect(page.getByText("No minimum volume", { exact: true })).toBeVisible();

  const primaryChoices = page.locator("[data-primary-choice]");
  await expect(primaryChoices).toHaveCount(2);
  await expect(page.locator('[data-primary-choice="agreement"]')).toHaveAttribute("href", onboardingRoute);
  await expect(page.locator('[data-primary-choice="learn"]')).toHaveAttribute("href", "#learn-more");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator("input, textarea, select")).toHaveCount(0);
});

test("learn-more path reveals responsibilities, plan-specific onboarding, and company branches", async ({ page }) => {
  await page.goto(offerRoute);
  await page.locator('[data-primary-choice="learn"]').click();

  await expect(page).toHaveURL(/\/logistics\/carrier-offer\/#learn-more$/);
  await expect(page.getByRole("heading", { name: /Limited support authority/i })).toBeVisible();
  await expect(page.getByText("Dispatch Support", { exact: true })).toBeVisible();
  await expect(page.getByText("Full Partnership", { exact: true })).toBeVisible();
  await expect(page.getByText("Carrier Proposal", { exact: true })).toBeVisible();
  await expect(page.getByText("6%", { exact: true })).toBeVisible();
  await expect(page.getByText("8%", { exact: true })).toBeVisible();
  await expect(page.getByText(/custom proposal is non-binding/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hermes Connect & IT" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Choose Dispatch Support/i })).toHaveAttribute("href", `${onboardingRoute}?plan=essential`);
  await expect(page.getByRole("link", { name: /Choose Full Partnership/i })).toHaveAttribute("href", `${onboardingRoute}?plan=pro`);
  await expect(page.getByRole("link", { name: /Submit a carrier proposal/i })).toHaveAttribute("href", `${onboardingRoute}?plan=custom`);
});

test("primary sales choice reaches the carrier onboarding engine", async ({ page }) => {
  await page.goto(offerRoute);
  await page.locator('[data-primary-choice="agreement"]').click();

  await expect(page).toHaveURL(/\/logistics\/carrier-onboarding\/$/);
  await expect(page.getByRole("heading", { name: /Review the exact terms\. Sign from your phone\./i })).toBeVisible();
  await expect(page.locator("#carrier-onboarding-form")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
});
