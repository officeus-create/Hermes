import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Marketing uses Pearl capability cards with one Obsidian growth console", async ({ page }) => {
  await page.goto("/paths/marketing/");

  await expect(page.locator(".marketing-service-system")).toBeVisible();
  await expect(page.locator(".marketing-service-rails article").first()).toBeVisible();
  await expect(page.locator(".growth-console")).toBeVisible();

  const visual = await page.evaluate(() => {
    const services = document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-system");
    const card = document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-rails article");
    const consoleEl = document.querySelector<HTMLElement>(".detail-page-marketing .growth-console");
    const selected = document.querySelector<HTMLElement>(".detail-page-marketing .growth-stage-list button[aria-selected='true']");
    const panelHeading = document.querySelector<HTMLElement>(".detail-page-marketing .growth-stage-panels h3");
    if (!services || !card || !consoleEl || !selected || !panelHeading) return null;

    return {
      serviceBackground: getComputedStyle(services).backgroundColor,
      cardBackground: getComputedStyle(card).backgroundColor,
      cardColor: getComputedStyle(card).color,
      cardRadius: getComputedStyle(card).borderRadius,
      consoleBackground: getComputedStyle(consoleEl).backgroundColor,
      consoleColor: getComputedStyle(consoleEl).color,
      consoleRadius: getComputedStyle(consoleEl).borderRadius,
      selectedColor: getComputedStyle(selected).color,
      headingColor: getComputedStyle(panelHeading).color,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  const viewportWidth = page.viewportSize()?.width ?? 1440;
  const expectedConsoleRadius = viewportWidth <= 900 ? "22px" : "30px";

  expect(visual).not.toBeNull();
  expect(visual!.serviceBackground).toBe("rgb(247, 246, 243)");
  expect(visual!.cardBackground).toBe("rgb(255, 255, 255)");
  expect(visual!.cardColor).toBe("rgb(11, 13, 18)");
  expect(visual!.cardRadius).toBe("22px");
  expect(visual!.consoleBackground).toBe("rgb(11, 13, 18)");
  expect(visual!.consoleColor).toBe("rgb(255, 255, 255)");
  expect(visual!.consoleRadius).toBe(expectedConsoleRadius);
  expect(visual!.selectedColor).toBe("rgb(255, 255, 255)");
  expect(visual!.headingColor).toBe("rgb(255, 255, 255)");
  expect(visual!.overflow).toBe(false);
});

test("Marketing public system remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/marketing/");

  await expect(page.locator(".marketing-service-rails article").first()).toBeVisible();
  await expect(page.locator(".growth-console")).toBeVisible();

  const mobile = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-rails article");
    const consoleEl = document.querySelector<HTMLElement>(".detail-page-marketing .growth-console");
    if (!card || !consoleEl) return null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      cardRadius: getComputedStyle(card).borderRadius,
      consoleRadius: getComputedStyle(consoleEl).borderRadius,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.cardRadius).toBe("22px");
  expect(mobile!.consoleRadius).toBe("22px");
});

const growthRoutes = ["/business-growth/", "/ru/business-growth/", "/ua/business-growth/"] as const;

for (const route of growthRoutes) {
  test(`${route} uses the Hermes public Marketing inquiry system`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("#business-growth-title")).toBeVisible();
    await expect(page.locator("#business-lead .contact-form")).toBeVisible();

    const visual = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>(".site-header");
      const hero = document.querySelector<HTMLElement>(".detail-overview");
      const form = document.querySelector<HTMLElement>("#business-lead .contact-form");
      const interest = document.querySelector<HTMLInputElement>('#business-lead input[name="interest"]');
      if (!header || !hero || !form || !interest) return null;
      return {
        headerColor: getComputedStyle(header).color,
        heroColor: getComputedStyle(hero).color,
        formBackground: getComputedStyle(form).backgroundColor,
        formRadius: getComputedStyle(form).borderRadius,
        interest: interest.value,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    expect(visual).not.toBeNull();
    expect(visual!.headerColor).toBe("rgb(11, 13, 18)");
    expect(visual!.heroColor).toBe("rgb(11, 13, 18)");
    expect(visual!.formBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.formRadius).toBe("22px");
    expect(visual!.interest).toBe("ProgressoPro");
    expect(visual!.overflow).toBe(false);
  });
}

test("English growth roadmap uses canonical Paper cards", async ({ page }) => {
  await page.goto("/business-growth/");
  const card = page.locator(".business-growth-roadmap-grid li").first();
  await expect(card).toBeVisible();
  const visual = await card.evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    radius: getComputedStyle(node).borderRadius,
  }));
  expect(visual.background).toBe("rgb(255, 255, 255)");
  expect(visual.radius).toBe("22px");
});

test("Marketing inquiry remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/business-growth/");
  await expect(page.locator("#business-lead .contact-form")).toBeVisible();
  const mobile = await page.evaluate(() => {
    const form = document.querySelector<HTMLElement>("#business-lead .contact-form");
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      formWidth: form?.getBoundingClientRect().width ?? 0,
      viewport: document.documentElement.clientWidth,
    };
  });
  expect(mobile.overflow).toBe(false);
  expect(mobile.formWidth).toBeLessThanOrEqual(mobile.viewport);
});
