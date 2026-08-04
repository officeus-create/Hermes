import { expect, test } from "@playwright/test";

const route = "/logistics/resources/new-authority-car-hauler-readiness-checklist/";

test("new authority readiness checklist is useful, indexable, and connected to carrier intake", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle(/New Authority Car Hauler Readiness Checklist/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${route}`);
  await expect(page.getByRole("heading", { level: 1, name: "New Authority Car Hauler Readiness Checklist" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eight checks before active load review." })).toBeVisible();
  await expect(page.getByText("Authority status and age", { exact: true })).toBeVisible();
  await expect(page.getByText("Insurance readiness", { exact: true })).toBeVisible();
  await expect(page.getByText("Carrier control", { exact: true })).toBeVisible();
  await expect(page.getByText(/completed checklist is not a promise of loads or income/i)).toBeVisible();

  const decisionTree = page.locator("[data-readiness-decision-tree]");
  await expect(decisionTree).toBeVisible();
  await expect(decisionTree.getByRole("heading", { name: "Choose the next review state from the facts available now." })).toBeVisible();
  await expect(decisionTree.locator('[data-readiness-state="ready"]')).toContainText("Ready for dispatch review");
  await expect(decisionTree.locator('[data-readiness-state="clarify"]')).toContainText("Needs clarification");
  await expect(decisionTree.locator('[data-readiness-state="not-ready"]')).toContainText("Not ready for active load review");
  await expect(decisionTree).toContainText("None of the three states guarantees broker acceptance, a load, a rate, payment, revenue, or a booking.");
  await expect(page.locator("summary", { hasText: "How do I know which readiness state applies?" })).toBeVisible();

  const primaryCtas = page.getByRole("link", { name: /carrier readiness review|open carrier intake/i });
  await expect(primaryCtas).toHaveCount(2);
  for (let index = 0; index < 2; index += 1) {
    await expect(primaryCtas.nth(index)).toHaveAttribute(
      "href",
      "/load-board/?role=carrier&equipment=car_hauler#carrier-access",
    );
  }

  await expect(page.getByRole("link", { name: "Review new-authority support" })).toHaveAttribute(
    "href",
    "/logistics/new-authority-car-hauler-support/",
  );
  const schemaText = (await page.locator('script[type="application/ld+json"]').textContent()) || "";
  expect(schemaText).toContain("New Authority Car Hauler Readiness Checklist");
  expect(schemaText).toContain('"FAQPage"');
  expect(schemaText).toContain('"Service"');
  expect(schemaText).toContain("How do I know which readiness state applies?");
});

test("new authority commercial owner links to the readiness checklist", async ({ page }) => {
  await page.goto("/logistics/new-authority-car-hauler-support/");
  await expect(page.getByRole("link", { name: "New Authority Readiness Checklist" })).toHaveAttribute("href", route);
});
