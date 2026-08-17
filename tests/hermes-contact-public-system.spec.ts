import { expect, test } from "@playwright/test";

const routes = ["/paths/logistics/", "/paths/marketing/"] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

for (const route of routes) {
  test(`${route} uses the shared Hermes contact primitive`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator(".contact-section")).toBeVisible();
    await expect(page.locator(".contact-form")).toBeVisible();
    await expect(page.locator(".contact-form input[name='name']")).toBeVisible();
    await expect(page.locator(".contact-form .button-primary")).toBeVisible();

    const visual = await page.evaluate(() => {
      const section = document.querySelector<HTMLElement>(".contact-section");
      const routesEl = document.querySelector<HTMLElement>(".contact-direct-routes");
      const form = document.querySelector<HTMLElement>(".contact-form");
      const input = document.querySelector<HTMLElement>(".contact-form input[name='name']");
      const primary = document.querySelector<HTMLElement>(".contact-form .button-primary");
      if (!section || !routesEl || !form || !input || !primary) return null;
      return {
        sectionBackground: getComputedStyle(section).backgroundColor,
        sectionColor: getComputedStyle(section).color,
        routesBackground: getComputedStyle(routesEl).backgroundColor,
        routesRadius: getComputedStyle(routesEl).borderRadius,
        formBackground: getComputedStyle(form).backgroundColor,
        formRadius: getComputedStyle(form).borderRadius,
        inputBackground: getComputedStyle(input).backgroundColor,
        inputRadius: getComputedStyle(input).borderRadius,
        primaryBackground: getComputedStyle(primary).backgroundColor,
        primaryColor: getComputedStyle(primary).color,
        primaryRadius: getComputedStyle(primary).borderRadius,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    const expectedFormRadius = viewportWidth <= 900 ? "22px" : "30px";

    expect(visual).not.toBeNull();
    expect(visual!.sectionBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.sectionColor).toBe("rgb(11, 13, 18)");
    expect(visual!.routesBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.routesRadius).toBe("22px");
    expect(visual!.formBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.formRadius).toBe(expectedFormRadius);
    expect(visual!.inputBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.inputRadius).toBe("12px");
    expect(visual!.primaryBackground).toBe("rgb(11, 13, 18)");
    expect(visual!.primaryColor).toBe("rgb(255, 255, 255)");
    expect(visual!.primaryRadius).toBe("12px");
    expect(visual!.overflow).toBe(false);
  });
}

test("shared contact primitive remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/logistics/");

  await expect(page.locator(".contact-form")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const form = document.querySelector<HTMLElement>(".contact-form");
    const primary = document.querySelector<HTMLElement>(".contact-form .button-primary");
    if (!form || !primary) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      formRadius: getComputedStyle(form).borderRadius,
      primaryWidth: primary.getBoundingClientRect().width,
      formWidth: form.getBoundingClientRect().width,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.formRadius).toBe("22px");
  expect(mobile!.primaryWidth).toBeLessThanOrEqual(mobile!.formWidth);
});