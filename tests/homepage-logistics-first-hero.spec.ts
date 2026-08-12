import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("homepage starts with the visitor's job instead of one business direction", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Start with what you need. Go straight to the right team." })).toBeVisible();
  await expect(page.getByText("Logistics · Marketing · Academy · Technology")).toBeVisible();
  await expect(
    page.getByText(
      "Need to move a vehicle, keep a truck working, bring in more customers, build a website or automation, learn a practical skill, or work with Hermes? Choose the situation and go straight to the next step.",
    ),
  ).toBeVisible();

  const start = page.getByRole("link", { name: "Choose what you need", exact: true }).first();
  const directions = page.getByRole("link", { name: "See all four directions" });

  await expect(start).toHaveAttribute("href", "#start");
  await expect(directions).toHaveAttribute("href", "#paths");
  await expect(page.getByRole("link", { name: "Choose what you need from Hermes" })).toHaveAttribute("href", "#start");
});
