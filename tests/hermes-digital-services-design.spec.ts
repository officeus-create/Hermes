import { expect, test } from "@playwright/test";

const routes = [
  "/services/seo/",
  "/services/local-seo/",
  "/services/seo-for-logistics-companies/",
  "/services/seo-for-independent-auto-dealers/",
  "/services/website-development/",
  "/services/website-redesign/",
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

for (const route of routes) {
  test(`${route} uses the shared Hermes Digital Services visual contract`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator(".digital-service-page")).toBeVisible();
    await expect(page.locator(".digital-project-cta")).toBeVisible();

    const visual = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(".site-header");
      const hero = document.querySelector<HTMLElement>(".digital-service-hero");
      const primary = document.querySelector<HTMLElement>(".digital-service-actions .button-primary");
      const card = document.querySelector<HTMLElement>(".digital-card-grid article");
      const boundary = document.querySelector<HTMLElement>(".digital-boundary-section");
      const faq = document.querySelector<HTMLElement>(".digital-faq-list details");
      const project = document.querySelector<HTMLElement>(".digital-project-cta");
      if (!header || !hero || !primary || !card || !boundary || !faq || !project) return null;
      const primaryRect = primary.getBoundingClientRect();
      return {
        headerColor: getComputedStyle(header).color,
        heroBackground: getComputedStyle(hero).backgroundColor,
        heroColor: getComputedStyle(hero).color,
        primaryBackground: getComputedStyle(primary).backgroundColor,
        primaryColor: getComputedStyle(primary).color,
        primaryRadius: getComputedStyle(primary).borderRadius,
        cardBackground: getComputedStyle(card).backgroundColor,
        cardRadius: getComputedStyle(card).borderRadius,
        boundaryBackground: getComputedStyle(boundary).backgroundColor,
        faqBackground: getComputedStyle(faq).backgroundColor,
        faqRadius: getComputedStyle(faq).borderRadius,
        projectBackground: getComputedStyle(project).backgroundColor,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        primaryRight: primaryRect.right,
        viewportWidth: document.documentElement.clientWidth,
      };
    });

    expect(visual).not.toBeNull();
    expect(visual!.headerColor).toBe("rgb(11, 13, 18)");
    expect(visual!.heroBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
    expect(visual!.primaryBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.primaryColor).toBe("rgb(255, 255, 255)");
    expect(visual!.primaryRadius).toBe("12px");
    expect(visual!.cardBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.cardRadius).toBe("22px");
    expect(visual!.boundaryBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.faqBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.faqRadius).toBe("22px");
    expect(visual!.projectBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.overflow).toBe(false);
    expect(visual!.primaryRight).toBeLessThanOrEqual(visual!.viewportWidth);
  });
}
