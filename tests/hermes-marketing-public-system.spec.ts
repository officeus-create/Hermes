import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("hermes-intro-seen", "true");
  });
});

test("Marketing uses Pearl capability cards with one Obsidian growth console", async ({ page }) => {
  await page.goto("/paths/marketing/");

  await expect(page.locator(".marketing-service-system")).toBeVisible();
  await expect(page.locator(".detail-page-marketing .detail-offerings")).toHaveCount(0);
  await expect(page.locator(".detail-page-marketing .detail-process")).toHaveCount(0);
  await expect(page.locator(".detail-page-marketing .service-group-grid")).toHaveCount(0);
  await expect(page.locator(".marketing-service-rails article").first()).toBeVisible();
  await expect(page.locator(".growth-console")).toBeVisible();
  const signal = page.locator("[data-marketing-demand-signal]");
  await expect(signal).toBeVisible();
  await expect(signal).toHaveAttribute("role", "group");
  await expect(signal.locator("li")).toHaveCount(5);
  await expect(signal).toContainText("Content");
  await expect(signal).toContainText("Qualified next step");
  await expect(signal).toContainText("CRM / evidence");
  await expect(signal).toHaveAttribute("data-active-step", "0");

  const signalContrast = await signal.evaluate((root) => {
    const parseRgb = (value: string) => {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) throw new Error(`Unsupported color: ${value}`);
      return [Number(match[1]), Number(match[2]), Number(match[3])];
    };
    const luminance = (rgb: number[]) => {
      const channels = rgb.map((value) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const ratio = (foreground: string, background: string) => {
      const lighter = Math.max(luminance(parseRgb(foreground)), luminance(parseRgb(background)));
      const darker = Math.min(luminance(parseRgb(foreground)), luminance(parseRgb(background)));
      return (lighter + 0.05) / (darker + 0.05);
    };
    return [...root.querySelectorAll<HTMLElement>("li")].flatMap((card) => {
      const background = getComputedStyle(card).backgroundColor;
      return [...card.querySelectorAll<HTMLElement>("span,strong,small")].map((child) =>
        ratio(getComputedStyle(child).color, background),
      );
    });
  });
  expect(Math.min(...signalContrast)).toBeGreaterThanOrEqual(4.5);

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
      serviceColumns: getComputedStyle(document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-rails")!).gridTemplateColumns.split(" ").length,
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
  const width = page.viewportSize()?.width ?? 1440;
  expect(visual!.serviceColumns).toBe(width <= 620 ? 1 : 2);
  expect(visual!.overflow).toBe(false);

  // Verify the new causal path after the existing settled visual contract so
  // the intentional tab color transition cannot create a timing-dependent snapshot.
  await page.locator("#growth-tab-3").click();
  await expect(signal).toHaveAttribute("data-active-step", "3");
  await expect(page.locator("#growth-tab-3")).toHaveAttribute("aria-selected", "true");
  await expect.poll(async () =>
    page.locator("#growth-tab-3").evaluate((el) => getComputedStyle(el).color),
  ).toBe("rgb(255, 255, 255)");
});

test("Marketing public system remains usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/marketing/");

  await expect(page.locator(".marketing-service-rails article").first()).toBeVisible();
  await expect(page.locator(".growth-console")).toBeVisible();
  const mobileSignal = page.locator("[data-marketing-demand-signal]");
  await expect(mobileSignal).toBeVisible();
  await expect(mobileSignal.locator("li")).toHaveCount(5);

  const mobile = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-rails article");
    const consoleEl = document.querySelector<HTMLElement>(".detail-page-marketing .growth-console");
    if (!card || !consoleEl) return null;
    return {
      serviceColumns: getComputedStyle(document.querySelector<HTMLElement>(".detail-page-marketing .marketing-service-rails")!).gridTemplateColumns.split(" ").length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      cardRadius: getComputedStyle(card).borderRadius,
      consoleRadius: getComputedStyle(consoleEl).borderRadius,
    };
  });

  expect(mobile).not.toBeNull();
  expect(mobile!.overflow).toBe(false);
  expect(mobile!.serviceColumns).toBe(1);
  expect(mobile!.cardRadius).toBe("22px");
  expect(mobile!.consoleRadius).toBe("22px");
});
