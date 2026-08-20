import { expect, test } from "@playwright/test";

const routes = [
  "/logistics/resources/",
  "/logistics/resources/dispatch-service-vs-self-dispatch/",
  "/logistics/resources/new-authority-car-hauler-readiness-checklist/",
  "/logistics/resources/rpm-calculator/",
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

for (const route of routes) {
  test(`${route} uses the shared Hermes resource shell`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator(".logistics-resource-page")).toBeVisible();
    await expect(page.locator(".resource-hero")).toBeVisible();
    await expect(page.locator(".resource-safety-card")).toBeVisible();
    await expect(page.locator(".resource-related-grid > a").first()).toBeVisible();
    await expect(page.locator(".capacity-example")).toBeVisible();
    await expect(page.locator(".resource-final-card")).toBeVisible();

    const visual = await page.evaluate(() => {
      const root = document.querySelector<HTMLElement>(".logistics-resource-page");
      const hero = document.querySelector<HTMLElement>(".resource-hero");
      const heroPrimary = document.querySelector<HTMLElement>(".resource-hero .button-primary");
      const safety = document.querySelector<HTMLElement>(".resource-safety-card");
      const related = document.querySelector<HTMLElement>(".resource-related-grid > a");
      const accent = document.querySelector<HTMLElement>(".resource-lead > svg");
      const darkSection = document.querySelector<HTMLElement>(".capacity-example");
      const darkRow = document.querySelector<HTMLElement>(".capacity-example dl > div");
      const finalCard = document.querySelector<HTMLElement>(".resource-final-card");
      const finalPrimary = document.querySelector<HTMLElement>(".resource-final-card .button-primary");
      if (!root || !hero || !heroPrimary || !safety || !related || !accent || !darkSection || !darkRow || !finalCard || !finalPrimary) return null;
      return {
        rootBackground: getComputedStyle(root).backgroundColor,
        heroBackground: getComputedStyle(hero).backgroundColor,
        heroPrimaryBackground: getComputedStyle(heroPrimary).backgroundColor,
        heroPrimaryColor: getComputedStyle(heroPrimary).color,
        heroPrimaryRadius: getComputedStyle(heroPrimary).borderRadius,
        safetyRadius: getComputedStyle(safety).borderRadius,
        relatedBackground: getComputedStyle(related).backgroundColor,
        relatedRadius: getComputedStyle(related).borderRadius,
        accentColor: getComputedStyle(accent).color,
        darkSectionBackground: getComputedStyle(darkSection).backgroundColor,
        darkRowRadius: getComputedStyle(darkRow).borderRadius,
        finalBackground: getComputedStyle(finalCard).backgroundColor,
        finalRadius: getComputedStyle(finalCard).borderRadius,
        finalPrimaryBackground: getComputedStyle(finalPrimary).backgroundColor,
        finalPrimaryColor: getComputedStyle(finalPrimary).color,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    expect(visual).not.toBeNull();
    expect(visual!.rootBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.heroBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.heroPrimaryBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.heroPrimaryColor).toBe("rgb(11, 13, 18)");
    expect(visual!.heroPrimaryRadius).toBe("12px");
    expect(visual!.safetyRadius).toBe("22px");
    expect(visual!.relatedBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.relatedRadius).toBe("22px");
    expect(visual!.accentColor).toBe("rgb(124, 92, 255)");
    expect(visual!.darkSectionBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.darkRowRadius).toBe("12px");
    expect(visual!.finalBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.finalRadius).toBe("30px");
    expect(visual!.finalPrimaryBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.finalPrimaryColor).toBe("rgb(11, 13, 18)");
    expect(visual!.overflow).toBe(false);
  });
}
