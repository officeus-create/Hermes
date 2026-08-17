import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Hermes homepage uses the Pearl public shell and Obsidian primary action", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Four directions. One way forward." })).toBeVisible();
  await expect(page.locator(".home-hero-stage")).toBeVisible();
  await expect(page.locator(".home-intelligence-knot")).toHaveCount(1);
  await expect(page.locator(".home-hero-system-card")).toContainText("One Hermes ecosystem");

  const visual = await page.evaluate(() => {
    const home = document.querySelector<HTMLElement>(".hermes-home-page");
    const hero = document.querySelector<HTMLElement>(".hermes-home-page .hero");
    const stage = document.querySelector<HTMLElement>(".home-hero-stage");
    const primary = document.querySelector<HTMLElement>(".hermes-home-page .hero .button-primary");
    const roleCard = document.querySelector<HTMLElement>(".hermes-home-page .home-role-card");
    const pillars = document.querySelector<HTMLElement>(".hermes-home-page .path-pillars");
    if (!home || !hero || !stage || !primary || !roleCard || !pillars) return null;

    const heroStyle = getComputedStyle(hero);
    const primaryStyle = getComputedStyle(primary);
    const roleStyle = getComputedStyle(roleCard);
    const pillarStyle = getComputedStyle(pillars);
    return {
      heroBackground: heroStyle.backgroundColor,
      primaryBackground: primaryStyle.backgroundColor,
      primaryColor: primaryStyle.color,
      primaryRadius: primaryStyle.borderRadius,
      roleRadius: roleStyle.borderRadius,
      pillarsRadius: pillarStyle.borderRadius,
      stageHeight: stage.getBoundingClientRect().height,
    };
  });

  const viewportWidth = page.viewportSize()?.width ?? 1440;
  const isMobile = viewportWidth <= 720;

  expect(visual).not.toBeNull();
  expect(visual!.heroBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.primaryBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.primaryColor).toBe("rgb(255, 255, 255)");
  expect(visual!.primaryRadius).toBe("999px");
  expect(visual!.roleRadius).toBe("22px");
  expect(visual!.pillarsRadius).toBe(isMobile ? "22px" : "30px");
  expect(visual!.stageHeight).toBeGreaterThanOrEqual(isMobile ? 400 : 500);
});

test("Hermes Pearl homepage stays usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Four directions. One way forward." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore your path" })).toBeVisible();
  await expect(page.locator(".home-intelligence-knot")).toHaveCount(1);

  const geometry = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>(".home-hero-stage");
    const media = document.querySelector<HTMLElement>(".hero-media");
    if (!stage || !media) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      stageHeight: stage.getBoundingClientRect().height,
      mediaRadius: getComputedStyle(media).borderRadius,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.overflow).toBe(false);
  expect(geometry!.stageHeight).toBeGreaterThanOrEqual(400);
  expect(geometry!.mediaRadius).toBe("22px");
});
