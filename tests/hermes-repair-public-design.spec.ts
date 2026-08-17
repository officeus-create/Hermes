import { expect, test } from "@playwright/test";

// Shared across the stacked design branches so Repair public cascade regressions fail browser CI.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Repair Shops landing keeps Pearl background and readable public launch offer", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/");

  const visual = await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(".repair-pilot-page");
    const heading = document.querySelector<HTMLElement>(".repair-pilot-page .repair-live-hero h1");
    const launchHeading = document.querySelector<HTMLElement>(".repair-free-launch h2");
    const launchCta = document.querySelector<HTMLElement>(".repair-free-launch .launch-cta");
    if (!root || !heading || !launchHeading || !launchCta) return null;
    return {
      rootBackgroundColor: getComputedStyle(root).backgroundColor,
      headingColor: getComputedStyle(heading).color,
      launchHeadingColor: getComputedStyle(launchHeading).color,
      launchCtaBackground: getComputedStyle(launchCta).backgroundColor,
      launchCtaColor: getComputedStyle(launchCta).color,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.rootBackgroundColor).toBe("rgb(247, 246, 243)");
  expect(visual!.headingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.launchHeadingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.launchCtaBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.launchCtaColor).toBe("rgb(255, 255, 255)");
});

test("Founding Plan does not inherit the legacy full-screen dark hero", async ({ page }) => {
  await page.goto("/services/hermes-connect/repair-shops/plan/");

  const visual = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>(".plan-page .hero");
    const heading = document.querySelector<HTMLElement>(".plan-page .hero h1");
    const priceCard = document.querySelector<HTMLElement>(".plan-page .price-card");
    const launchHeading = document.querySelector<HTMLElement>(".repair-free-launch h2");
    if (!hero || !heading || !priceCard || !launchHeading) return null;
    const heroRect = hero.getBoundingClientRect();
    const heroStyle = getComputedStyle(hero);
    return {
      heroHeight: heroRect.height,
      heroMinHeight: heroStyle.minHeight,
      heroBackgroundImage: heroStyle.backgroundImage,
      heroColor: heroStyle.color,
      headingColor: getComputedStyle(heading).color,
      priceCardBackground: getComputedStyle(priceCard).backgroundColor,
      launchHeadingColor: getComputedStyle(launchHeading).color,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.heroMinHeight).toBe("0px");
  expect(visual!.heroBackgroundImage).toBe("none");
  expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
  expect(visual!.headingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.priceCardBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.launchHeadingColor).toBe("rgb(11, 13, 18)");
  expect(visual!.heroHeight).toBeLessThan(950);
});

test("Repair Shop public shell stays within the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/hermes-connect/repair-shops/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.locator(".repair-free-launch h2")).toBeVisible();
});
