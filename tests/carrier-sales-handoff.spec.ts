import { expect, test } from "@playwright/test";

const offerRoute = "/logistics/carrier-offer/";
const agreementRoute = "/logistics/carrier-agreement/";

test("carrier sales handoff starts with two clear choices and no data collection", async ({ page }) => {
  await page.goto(offerRoute);

  await expect(page).toHaveTitle("Carrier Partnership Options | Hermes Logistics");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.getByRole("heading", { name: /Keep control of your operation/i })).toBeVisible();
  await expect(page.getByText("You approve every load", { exact: true }).first()).toBeVisible();

  const primaryChoices = page.locator("[data-primary-choice]");
  await expect(primaryChoices).toHaveCount(2);
  await expect(page.locator('[data-primary-choice="agreement"]')).toHaveAttribute("href", agreementRoute);
  await expect(page.locator('[data-primary-choice="learn"]')).toHaveAttribute("href", "#learn-more");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator("input, textarea, select")).toHaveCount(0);
});

test("learn-more path reveals responsibilities, plans, and company branches", async ({ page }) => {
  await page.goto(offerRoute);
  await page.locator('[data-primary-choice="learn"]').click();

  await expect(page).toHaveURL(/\/logistics\/carrier-offer\/#learn-more$/);
  await expect(page.getByRole("heading", { name: /You keep the decisions/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Essential Dispatch" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hermes Pro" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Custom Cooperation" })).toBeVisible();
  await expect(page.getByText("6%", { exact: true })).toBeVisible();
  await expect(page.getByText("8%", { exact: true })).toBeVisible();
  await expect(page.getByText(/custom proposal is non-binding/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hermes Connect & IT" })).toBeVisible();
});

test("agreement choice reaches the existing draft review boundary", async ({ page }) => {
  await page.goto(offerRoute);
  await page.locator('[data-primary-choice="agreement"]').click();

  await expect(page).toHaveURL(new RegExp(`${agreementRoute.replaceAll("/", "\\/")}$`));
  await expect(page.getByRole("heading", { name: /Review the Carrier Dispatch Agreement/i })).toBeVisible();
  await expect(page.getByText("Draft for attorney review", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
});
