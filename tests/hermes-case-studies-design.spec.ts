import { expect, test } from "@playwright/test";

const routes = [
  {
    route: "/case/",
    root: ".case-hub",
    hero: ".case-hub-hero",
    primary: ".case-hub-hero .button-primary",
    surface: ".case-grid article",
    radius: ".case-grid article",
    accent: ".case-card-top",
    dark: ".case-hub-hero",
  },
  {
    route: "/case/appleton-vehicle-transport-seo/",
    root: ".seo-case-page",
    hero: ".seo-case-hero",
    primary: ".seo-case-hero .button-primary",
    surface: ".measurement-grid article",
    radius: ".measurement-grid article",
    accent: ".measurement-grid svg",
    dark: ".case-boundaries",
  },
  {
    route: "/case/it-development/",
    root: ".case-study-page",
    hero: ".case-study-hero",
    primary: ".case-study-hero .button-primary",
    surface: ".case-study-brief",
    radius: ".case-study-product-shot > a",
    accent: ".case-stage-list li > span",
    dark: ".case-study-qa",
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

for (const config of routes) {
  test(`${config.route} uses the shared Hermes case-study visual contract`, async ({ page }) => {
    const response = await page.goto(config.route);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator(config.root)).toBeVisible();
    await expect(page.locator(config.surface).first()).toBeVisible();
    await expect(page.locator(config.dark).first()).toBeVisible();

    const visual = await page.evaluate((selectors) => {
      const root = document.querySelector<HTMLElement>(selectors.root);
      const hero = document.querySelector<HTMLElement>(selectors.hero);
      const primary = document.querySelector<HTMLElement>(selectors.primary);
      const surface = document.querySelector<HTMLElement>(selectors.surface);
      const radius = document.querySelector<HTMLElement>(selectors.radius);
      const accent = document.querySelector<HTMLElement>(selectors.accent);
      const dark = document.querySelector<HTMLElement>(selectors.dark);
      if (!root || !hero || !primary || !surface || !radius || !accent || !dark) return null;
      const rootRect = root.getBoundingClientRect();
      return {
        rootBackground: getComputedStyle(root).backgroundColor,
        heroBackground: getComputedStyle(hero).backgroundColor,
        primaryBackground: getComputedStyle(primary).backgroundColor,
        primaryColor: getComputedStyle(primary).color,
        primaryRadius: getComputedStyle(primary).borderRadius,
        surfaceBackground: getComputedStyle(surface).backgroundColor,
        radiusValue: getComputedStyle(radius).borderRadius,
        accentColor: getComputedStyle(accent).color,
        darkBackground: getComputedStyle(dark).backgroundColor,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        rootRight: rootRect.right,
        viewportWidth: document.documentElement.clientWidth,
      };
    }, config);

    expect(visual).not.toBeNull();
    expect(visual!.rootBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.heroBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.primaryBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.primaryColor).toBe("rgb(11, 13, 18)");
    expect(visual!.primaryRadius).toBe("12px");
    expect(visual!.surfaceBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.radiusValue).toBe("22px");
    expect(visual!.accentColor).toBe("rgb(124, 92, 255)");
    expect(visual!.darkBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.overflow).toBe(false);
    expect(visual!.rootRight).toBeLessThanOrEqual(visual!.viewportWidth);
  });
}
