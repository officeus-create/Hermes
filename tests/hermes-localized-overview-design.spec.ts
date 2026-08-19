import { expect, test } from "@playwright/test";

const routes = ["/ua/", "/ru/", "/es/", "/it/", "/fr/"];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

for (const route of routes) {
  test(`${route} uses the shared Hermes localized visual contract`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator(".localized-overview")).toBeVisible();
    await expect(page.locator(".localized-partnership")).toBeVisible();
    await expect(page.locator(".localized-contact")).toBeVisible();

    const visual = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>(".localized-hero");
      const heroPrimary = document.querySelector<HTMLElement>(".localized-hero .button-primary");
      const direction = document.querySelector<HTMLElement>(".localized-direction");
      const media = document.querySelector<HTMLElement>(".localized-direction-media");
      const directionEyebrow = document.querySelector<HTMLElement>(".localized-direction-copy .eyebrow");
      const partnership = document.querySelector<HTMLElement>(".localized-partnership");
      const partnershipCard = document.querySelector<HTMLElement>(".localized-partnership-grid article");
      const capability = document.querySelector<HTMLElement>(".localized-capability-list article");
      const contact = document.querySelector<HTMLElement>(".localized-contact");
      const contactPrimary = document.querySelector<HTMLElement>(".localized-contact .button-primary");
      if (!hero || !heroPrimary || !direction || !media || !directionEyebrow || !partnership || !partnershipCard || !capability || !contact || !contactPrimary) return null;
      const contactRect = contactPrimary.getBoundingClientRect();
      return {
        heroBackground: getComputedStyle(hero).backgroundColor,
        heroPrimaryBackground: getComputedStyle(heroPrimary).backgroundColor,
        heroPrimaryColor: getComputedStyle(heroPrimary).color,
        heroPrimaryRadius: getComputedStyle(heroPrimary).borderRadius,
        directionBackground: getComputedStyle(direction).backgroundColor,
        mediaRadius: getComputedStyle(media).borderRadius,
        eyebrowColor: getComputedStyle(directionEyebrow).color,
        partnershipBackground: getComputedStyle(partnership).backgroundColor,
        partnershipRadius: getComputedStyle(partnershipCard).borderRadius,
        capabilityBackground: getComputedStyle(capability).backgroundColor,
        capabilityRadius: getComputedStyle(capability).borderRadius,
        contactBackground: getComputedStyle(contact).backgroundColor,
        contactPrimaryBackground: getComputedStyle(contactPrimary).backgroundColor,
        contactPrimaryColor: getComputedStyle(contactPrimary).color,
        contactPrimaryRadius: getComputedStyle(contactPrimary).borderRadius,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        contactRight: contactRect.right,
        viewportWidth: document.documentElement.clientWidth,
      };
    });

    expect(visual).not.toBeNull();
    expect(visual!.heroBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.heroPrimaryBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.heroPrimaryColor).toBe("rgb(11, 13, 18)");
    expect(visual!.heroPrimaryRadius).toBe("12px");
    expect(visual!.directionBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.mediaRadius).toBe("22px");
    expect(visual!.eyebrowColor).toBe("rgb(124, 92, 255)");
    expect(visual!.partnershipBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.partnershipRadius).toBe("22px");
    expect(visual!.capabilityBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.capabilityRadius).toBe("22px");
    expect(visual!.contactBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.contactPrimaryBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.contactPrimaryColor).toBe("rgb(11, 13, 18)");
    expect(visual!.contactPrimaryRadius).toBe("12px");
    expect(visual!.overflow).toBe(false);
    expect(visual!.contactRight).toBeLessThanOrEqual(visual!.viewportWidth);
  });
}
