import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Hermes homepage uses a commercial hierarchy instead of competing first-screen choices", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Four directions. One way forward." })).toBeVisible();
  await expect(page.locator(".home-hero-stage")).toBeVisible();
  await expect(page.locator(".home-intelligence-knot")).toHaveCount(1);
  await expect(page.locator(".home-hero-system-card")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Find the right next step" })).toHaveAttribute("href", "#start");
  await expect(page.locator(".hero-scroll-cue")).toHaveAttribute("href", "#start");
  await expect(page.locator("[data-role-priority='commercial']")).toHaveCount(3);
  await expect(page.locator("[data-role-priority='opportunity']")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Looking for an opportunity with Hermes?" })).toBeVisible();
  await expect(page.locator(".advantage-signal")).toHaveCount(0);
  await expect(page.locator(".advantage-card")).toHaveCount(4);

  const visual = await page.evaluate(() => {
    const home = document.querySelector<HTMLElement>(".hermes-home-page");
    const hero = document.querySelector<HTMLElement>(".hermes-home-page .hero");
    const stage = document.querySelector<HTMLElement>(".home-hero-stage");
    const primary = document.querySelector<HTMLElement>(".hermes-home-page .hero .button-primary");
    const role = document.querySelector<HTMLElement>(".home-role-router");
    const advantages = document.querySelector<HTMLElement>(".advantage-section");
    const paths = document.querySelector<HTMLElement>(".paths-section");
    const roleCard = document.querySelector<HTMLElement>(".hermes-home-page [data-role-priority='commercial']");
    const opportunityCard = document.querySelector<HTMLElement>(".hermes-home-page [data-role-priority='opportunity']");
    const pillars = document.querySelector<HTMLElement>(".hermes-home-page .path-pillars");
    if (!home || !hero || !stage || !primary || !role || !advantages || !paths || !roleCard || !opportunityCard || !pillars) return null;

    const heroStyle = getComputedStyle(hero);
    const primaryStyle = getComputedStyle(primary);
    const roleStyle = getComputedStyle(roleCard);
    const opportunityStyle = getComputedStyle(opportunityCard);
    const pillarStyle = getComputedStyle(pillars);
    return {
      heroBackground: heroStyle.backgroundColor,
      primaryBackground: primaryStyle.backgroundColor,
      primaryColor: primaryStyle.color,
      primaryRadius: primaryStyle.borderRadius,
      roleRadius: roleStyle.borderRadius,
      opportunityRadius: opportunityStyle.borderRadius,
      opportunityShadow: opportunityStyle.boxShadow,
      pillarsRadius: pillarStyle.borderRadius,
      stageHeight: stage.getBoundingClientRect().height,
      roleTop: role.getBoundingClientRect().top,
      advantagesTop: advantages.getBoundingClientRect().top,
      pathsTop: paths.getBoundingClientRect().top,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
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
  expect(visual!.opportunityRadius).toBe("22px");
  expect(visual!.opportunityShadow).toBe("none");
  expect(visual!.pillarsRadius).toBe(isMobile ? "22px" : "30px");
  expect(visual!.stageHeight).toBeGreaterThanOrEqual(isMobile ? 400 : 500);
  expect(visual!.roleTop).toBeLessThan(visual!.advantagesTop);
  expect(visual!.advantagesTop).toBeLessThan(visual!.pathsTop);
  expect(visual!.overflow).toBe(false);
});

test("Hermes Pearl homepage stays usable without horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Four directions. One way forward." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Find the right next step" })).toBeVisible();
  await expect(page.locator(".home-intelligence-knot")).toHaveCount(1);
  await expect(page.locator("[data-role-priority='commercial']")).toHaveCount(3);
  await expect(page.locator("[data-role-priority='opportunity']")).toHaveCount(2);

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
