import { expect, test } from "@playwright/test";

const publicDirections = [
  { slug: "marketing", publicName: "Hermes Marketing", legacyValue: "ProgressoPro", directLabel: "Email Marketing" },
  { slug: "academy", publicName: "Hermes Academy", legacyValue: "Hermes Business Academy", directLabel: "Email the Academy" },
  { slug: "technology", publicName: "Hermes Technology", legacyValue: "IT Development", directLabel: "Email IT Development" },
] as const;

test("public direction contacts show canonical entity names while preserving compatibility routing values", async ({ page }) => {
  for (const direction of publicDirections) {
    await page.goto(`/paths/${direction.slug}/#contact`);

    const select = page.locator('select[name="path"]');
    await expect(select).toHaveValue(direction.legacyValue);
    await expect(select.locator("option:checked")).toHaveText(direction.publicName);
    await expect(page.getByRole("link", { name: direction.directLabel })).toBeVisible();
  }
});

test("public contact chooser does not expose legacy direction names as option labels", async ({ page }) => {
  await page.goto("/paths/marketing/#contact");

  const optionLabels = await page.locator('select[name="path"] option').allTextContents();
  expect(optionLabels).toContain("Hermes Logistics");
  expect(optionLabels).toContain("Hermes Marketing");
  expect(optionLabels).toContain("Hermes Academy");
  expect(optionLabels).toContain("Hermes Technology");
  expect(optionLabels).not.toContain("ProgressoPro");
  expect(optionLabels).not.toContain("Hermes Business Academy");
  expect(optionLabels).not.toContain("IT Development");
});