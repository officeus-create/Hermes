import { expect, test } from "@playwright/test";

const trustRoutes = ["/accessibility/", "/data-security/"] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

for (const route of trustRoutes) {
  test(`${route} uses the shared Pearl trust system`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator(".trust-page")).toBeVisible();
    await expect(page.locator(".trust-hero h1")).toBeVisible();
    await expect(page.locator(".trust-content article").first()).toBeVisible();
    await expect(page.locator(".trust-contact")).toBeVisible();

    const visual = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(".site-header");
      const hero = document.querySelector<HTMLElement>(".trust-hero");
      const card = document.querySelector<HTMLElement>(".trust-content article");
      const contact = document.querySelector<HTMLElement>(".trust-contact");
      const action = document.querySelector<HTMLElement>(".trust-contact .button-primary");
      if (!header || !hero || !card || !contact || !action) return null;
      return {
        headerColor: getComputedStyle(header).color,
        heroBackground: getComputedStyle(hero).backgroundColor,
        heroColor: getComputedStyle(hero).color,
        cardBackground: getComputedStyle(card).backgroundColor,
        cardRadius: getComputedStyle(card).borderRadius,
        contactBackground: getComputedStyle(contact).backgroundColor,
        contactColor: getComputedStyle(contact).color,
        contactRadius: getComputedStyle(contact).borderRadius,
        actionBackground: getComputedStyle(action).backgroundColor,
        actionColor: getComputedStyle(action).color,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    const expectedContactRadius = viewportWidth <= 760 ? "22px" : "30px";

    expect(visual).not.toBeNull();
    expect(visual!.headerColor).toBe("rgb(11, 13, 18)");
    expect(visual!.heroBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
    expect(visual!.cardBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.cardRadius).toBe("22px");
    expect(visual!.contactBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.contactColor).toBe("rgb(255, 255, 255)");
    expect(visual!.contactRadius).toBe(expectedContactRadius);
    expect(visual!.actionBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.actionColor).toBe("rgb(11, 13, 18)");
    expect(visual!.overflow).toBe(false);
  });
}

test("Trust family remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/accessibility/");

  await expect(page.locator(".trust-hero h1")).toBeVisible();
  await expect(page.locator(".trust-contact .button-primary")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const contact = document.querySelector<HTMLElement>(".trust-contact");
    const action = document.querySelector<HTMLElement>(".trust-contact .button-primary");
    if (!contact || !action) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      contactRadius: getComputedStyle(contact).borderRadius,
      actionWidth: action.getBoundingClientRect().width,
      contactWidth: contact.getBoundingClientRect().width,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.contactRadius).toBe("22px");
  expect(mobile!.actionWidth).toBeLessThanOrEqual(mobile!.contactWidth);
});