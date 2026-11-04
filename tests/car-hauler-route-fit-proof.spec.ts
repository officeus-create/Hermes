import { expect, test } from "@playwright/test";

test("car-hauler hub replays route-fit research without presenting live freight", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/logistics/car-hauler-loads/");

  const proof = page.locator("[data-car-hauler-route-fit-proof]");
  await proof.scrollIntoViewIfNeeded();
  await expect(proof).toBeVisible();
  await expect(proof.locator("[data-route-fit-stage]")).toHaveCount(5);
  await expect(proof).toContainText("RESEARCH REPLAY");
  await expect(proof).toContainText("NOT LIVE FREIGHT");
  await expect(proof).toContainText("Western / Upstate New York");
  await expect(proof).toContainText("Georgia · Atlanta / North Georgia · North Carolina · South Carolina");
  await expect(proof).toContainText("Equipment · open spaces · deadhead · timing · destination");
  await expect(proof).toContainText("Candidate ≠ booked load");
  await expect(proof).toContainText("The carrier remains the operating decision-maker.");

  await expect(proof.locator(".route-fit-packet")).toHaveCSS("animation-name", "route-fit-packet");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/logistics/car-hauler-loads/",
  );
});

test("car-hauler route-fit proof stays static and readable at 390px reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/logistics/car-hauler-loads/");

  const proof = page.locator("[data-car-hauler-route-fit-proof]");
  await proof.scrollIntoViewIfNeeded();
  await expect(proof).toBeVisible();
  await expect(proof.locator("[data-route-fit-stage]")).toHaveCount(5);
  await expect(proof.locator(".route-fit-packet")).toHaveCSS("animation-name", "none");
  await expect(proof.locator(".route-fit-line")).toBeHidden();
  await expect(proof).toContainText("NOT LIVE FREIGHT");
  await expect(proof).toContainText("Carrier approval");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
