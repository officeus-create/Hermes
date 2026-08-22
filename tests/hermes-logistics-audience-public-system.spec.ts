import { expect, test } from "@playwright/test";

const routes = ["/logistics/carrier/", "/logistics/shipper-dealer/", "/logistics/careers/", "/logistics/agency/"] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

for (const route of routes) {
  test(`${route} uses the Hermes public Logistics audience system`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator(".logistics-audience-page")).toBeVisible();

    const visual = await page.evaluate(() => {
      const root=document.querySelector<HTMLElement>(".logistics-audience-page");
      const header=document.querySelector<HTMLElement>(".logistics-audience-page .site-header");
      const hero=document.querySelector<HTMLElement>(".logistics-audience-hero");
      const finalCard=document.querySelector<HTMLElement>(".logistics-audience-final-card");
      if(!root||!header||!hero||!finalCard)return null;
      return {
        rootBackground:getComputedStyle(root).backgroundColor,
        headerColor:getComputedStyle(header).color,
        heroColor:getComputedStyle(hero).color,
        finalBackground:getComputedStyle(finalCard).backgroundColor,
        finalRadius:getComputedStyle(finalCard).borderRadius,
        overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      };
    });

    const expectedFinalRadius=(page.viewportSize()?.width ?? 1440) <= 760 ? "22px" : "30px";
    expect(visual).not.toBeNull();
    expect(visual!.rootBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.headerColor).toBe("rgb(11, 13, 18)");
    expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
    expect(visual!.finalBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.finalRadius).toBe(expectedFinalRadius);
    expect(visual!.overflow).toBe(false);
  });
}

test("Shipper/dealer mode and FAQ cards use canonical 22px Paper cards", async ({ page }) => {
  await page.goto("/logistics/shipper-dealer/");
  const cards=await page.evaluate(() => {
    const mode=document.querySelector<HTMLElement>(".shipper-service-mode-grid article");
    const faq=document.querySelector<HTMLElement>(".logistics-audience-faq-list details");
    if(!mode||!faq)return null;
    return {
      modeBackground:getComputedStyle(mode).backgroundColor,
      modeRadius:getComputedStyle(mode).borderRadius,
      faqBackground:getComputedStyle(faq).backgroundColor,
      faqRadius:getComputedStyle(faq).borderRadius,
    };
  });
  expect(cards).not.toBeNull();
  expect(cards!.modeBackground).toBe("rgb(255, 255, 255)");
  expect(cards!.modeRadius).toBe("22px");
  expect(cards!.faqBackground).toBe("rgb(255, 255, 255)");
  expect(cards!.faqRadius).toBe("22px");
});
