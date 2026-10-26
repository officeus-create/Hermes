import { expect, test } from "@playwright/test";

// London pages follow the family of the direction they sell; the multi-direction hubs stay neutral.
const families: Array<[string, string]> = [
  ["/gb/london/meta-ads/", "marketing"],
  ["/gb/london/dental-clinic-marketing/", "marketing"],
  ["/ru/gb/london/marketing/", "marketing"],
  ["/gb/london/crm-automation/", "technology"],
  ["/gb/london/landing-page-development/", "technology"],
  ["/ua/gb/london/it-web-development/", "technology"],
  ["/gb/london/guides/training-curriculum/", "academy"],
  ["/ru/gb/london/us-logistics-training/", "academy"],
];

for (const [path, family] of families) {
  test(`London ${path} uses the ${family} family`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("body")).toHaveAttribute("data-direction-family", family);
  });
}

for (const path of ["/gb/london/", "/ru/gb/london/", "/ua/gb/london/"]) {
  test(`London hub ${path} keeps neutral eyebrows`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("body")).not.toHaveAttribute("data-direction-family", /.+/);
    const colors = await page.locator("main p.eyebrow").evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color));
    expect(colors.length).toBeGreaterThan(0);
    for (const color of colors) expect(color).not.toBe("rgb(100, 70, 230)");
  });
}

test("London hub direction cards open their owner from anywhere on the card", async ({ page }) => {
  await page.goto("/gb/london/");
  const card = page.locator("main .cards article").first();
  await card.click({ position: { x: 12, y: 12 } });
  await expect(page).toHaveURL(/\/gb\/london\/marketing\/$/);
});
