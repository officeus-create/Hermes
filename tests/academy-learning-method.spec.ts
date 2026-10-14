import { expect, test } from "@playwright/test";

// Completion-director exact-heading guard.
test("Academy method distinguishes learner levels and a repeatable practice loop", async ({ page }) => {
  await page.goto("/academy/how-training-works/");

  await expect(page.getByRole("heading", { name: "The goal is usable ability, not just completed lessons." })).toBeVisible();
  await expect(page.getByText("I am starting from the beginning", { exact: true })).toBeVisible();
  await expect(page.getByText("I understand the basics and need practice", { exact: true })).toBeVisible();
  await expect(page.getByText("I already work in the field", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Explain → Practice → Self-review → Feedback → Retry → Transfer" })).toBeVisible();
  for (const stage of ["Explain", "Practice", "Self-review", "Human feedback", "Retry", "Transfer"]) {
    await expect(page.getByRole("heading", { level: 3, name: stage, exact: true })).toBeVisible();
  }

  for (const pattern of ["Explain back before speed", "Review immediately after the attempt", "Deconstruct the decisive moment", "Change the scenario before progression"]) {
    await expect(page.getByRole("heading", { level: 3, name: pattern })).toBeVisible();
  }

  await expect(page.getByText(/A certificate or finished module is not treated as proof/i)).toBeVisible();
  await expect(page.getByText(/Completion, certification, employment, income, promotion, access to live operations, and a fixed timeline are not automatic/i)).toBeVisible();
});
