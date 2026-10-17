import { expect, test } from "@playwright/test";

test("Academy keeps the human artwork primary and replays reviewed progression", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  const route = page.locator('[data-route-id="academy"]');
  const proof = route.locator('[data-home-pillar-proof="progress"]');
  const human = route.locator("[data-home-academy-human]");
  await route.scrollIntoViewIfNeeded();

  await expect(human).toBeVisible();
  await expect(human).toHaveAttribute("data-home-academy-human-kind", "owner-reference-derivative");
  const learnerImage = human.locator("img");
  await expect(learnerImage).toBeVisible();
  await expect(learnerImage).toHaveAttribute("src", "/images/home-20261001/academy-learner-owner-reference.webp");
  await expect(human.locator("svg")).toHaveCount(0);
  await expect(route.locator(".home-portal-art img")).toHaveCount(0);
  await expect(route.locator('img[src*="/images/home-20261001/academy-512"]')).toHaveCount(0);
  await expect(route.locator('img[src*="/images/home-20261001/academy-887"]')).toHaveCount(0);
  const geometry = await route.evaluate((node) => {
    const routeRect = node.getBoundingClientRect();
    const humanRect = node.querySelector("[data-home-academy-human]")?.getBoundingClientRect();
    const workflowRect = node.querySelector(".home-academy-workflow")?.getBoundingClientRect();
    return {
      routeWidth: routeRect.width,
      humanWidth: humanRect?.width ?? 0,
      humanHeight: humanRect?.height ?? 0,
      workflowLeft: workflowRect?.left ?? 0,
      humanRight: humanRect?.right ?? 0,
    };
  });
  expect(geometry.humanWidth).toBeGreaterThan(geometry.routeWidth * 0.3);
  expect(geometry.humanHeight).toBeGreaterThan(120);
  expect(geometry.workflowLeft).toBeGreaterThan(geometry.humanRight - 8);
  await expect(proof).toHaveAttribute("data-academy-source", "/services/hermes-connect/academy/");
  await expect(proof).toHaveAttribute("data-motion-state", "running");
  await expect(proof.locator(".home-academy-state")).toHaveCount(4);
  await expect(route.locator(".home-academy-book")).toHaveCount(0);
  await expect(route.locator(".home-portal-art img")).toHaveCount(0);
  await expect(proof).toContainText("Practice before consequence");
  await expect(proof).toContainText("HUMAN FEEDBACK");
  await expect(proof).toContainText("RETRY");
  await expect(proof).toContainText("Human decision");
  await expect(proof).toContainText("not automatic");
  await expect(proof.locator(".home-academy-state").first()).toHaveCSS("animation-name", "home-academy-focus");
  await expect(human).toHaveCSS("animation-name", "home-academy-human-breathe");
  await expect(proof).toContainText("ILLUSTRATIVE LEARNER · ACTIVE TASK");
  await expect(proof).toContainText("Practice → correction → retry");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test("Academy reduced-motion 390px keeps all progression states readable without fake motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const route = page.locator('[data-route-id="academy"]');
  const proof = route.locator('[data-home-pillar-proof="progress"]');
  const human = route.locator("[data-home-academy-human]");
  await route.scrollIntoViewIfNeeded();

  await expect(proof).toBeVisible();
  await expect(human).toBeVisible();
  await expect(proof).toHaveAttribute("data-motion-state", "reduced");
  await expect(proof.locator(".home-academy-state")).toHaveCount(4);
  await expect(proof.locator(".home-academy-state").first()).toHaveCSS("animation-name", "none");
  await expect(human).toHaveCSS("animation-name", "none");
  await expect(proof).toContainText("NEXT STEP");
  await expect(route.locator(".home-academy-book")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
