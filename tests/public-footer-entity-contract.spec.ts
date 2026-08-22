import { expect, test } from "@playwright/test";

test("English public footer presents Technology as the Hermes direction", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer.site-footer");
  await expect(footer.getByRole("link", { name: "Technology", exact: true })).toHaveAttribute("href", "/paths/technology/");
  await expect(footer.getByRole("link", { name: "Hermes Technology", exact: true })).toHaveAttribute("href", "/paths/technology/");
  await expect(footer).not.toContainText("Hermes IT Development");
});

test("localized public footers use Technology language instead of IT-development as the direction identity", async ({ page }) => {
  for (const [route, label] of [
    ["/ua/", "Технології"],
    ["/ru/", "Технологии"],
    ["/es/", "Tecnología"],
    ["/it/", "Tecnologia"],
    ["/fr/", "Technologie"],
  ] as const) {
    await page.goto(route);
    const footer = page.locator("footer.site-footer");
    await expect(footer.getByRole("link", { name: label, exact: true })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Hermes Technology", exact: true })).toBeVisible();
    await expect(footer).not.toContainText("Hermes IT Development");
  }
});