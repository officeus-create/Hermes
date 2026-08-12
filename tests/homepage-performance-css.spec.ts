import { expect, test } from "@playwright/test";

test("homepage performance CSS preserves the approved intro and hero cascade", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const intro = page.locator("[data-site-intro]");
  await expect(intro).toBeVisible();

  const inactiveVerb = intro.locator('[data-intro-verb][data-active="false"]').first();
  await expect(inactiveVerb).toHaveCSS("color", "rgba(255, 255, 255, 0.55)");

  const activeRail = intro.locator('[data-intro-rail][data-active="true"]');
  await expect(activeRail).toHaveCSS("filter", "none");

  const railTransition = await intro.locator('[data-intro-rail="marketing"]').evaluate((element) =>
    getComputedStyle(element).transitionProperty.split(",").map((value) => value.trim()),
  );
  expect(railTransition).not.toContain("filter");

  const storyTransition = await intro.locator('[data-intro-rail="marketing"] [data-intro-story-line]').first().evaluate((element) =>
    getComputedStyle(element).transitionProperty.split(",").map((value) => value.trim()),
  );
  expect(storyTransition).not.toContain("max-height");

  await expect(intro.locator("[data-intro-sound-icon]")).toHaveCSS("animation-name", "intro-sound-pulse-composite");

  await page.getByRole("button", { name: /Open Home/ }).click();
  await expect(page.locator("[data-site-intro]")).toHaveCount(0);
  await expect(page.locator(".hero-title-script")).toHaveCSS("animation-name", "hero-script-arrive-composite");
  await expect(page.locator(".product-showcase")).toHaveCSS("content-visibility", "auto");
});
