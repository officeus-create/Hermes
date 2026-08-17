import { expect, test } from "@playwright/test";

const calculators = [
  {
    route: "/logistics/resources/rpm-calculator/",
    tool: ".rpm-tool-section",
    grid: ".rpm-tool-grid",
    panel: ".rpm-panel",
    resultPanel: ".rpm-result-panel",
    field: ".rpm-field-grid input",
    primaryResult: ".rpm-primary-results > div",
    sensitivity: ".rpm-sensitivity",
  },
  {
    route: "/logistics/resources/factoring-vs-direct-payment-calculator/",
    tool: ".factoring-tool-section",
    grid: ".factoring-tool-grid",
    panel: ".factoring-panel",
    resultPanel: ".factoring-result-panel",
    field: ".factoring-field-grid input",
    primaryResult: ".factoring-primary-results > div",
    sensitivity: ".factoring-sensitivity",
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { sessionStorage.setItem("hermes-intro-seen", "true"); });
});

for (const calculator of calculators) {
  test(`${calculator.route} uses the shared Hermes calculator presentation`, async ({ page }) => {
    const response = await page.goto(calculator.route);
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator(calculator.tool)).toBeVisible();
    await expect(page.locator(calculator.panel).first()).toBeVisible();
    await expect(page.locator(calculator.field).first()).toBeVisible();
    await expect(page.locator(calculator.sensitivity)).toBeVisible();

    const visual = await page.evaluate((selectors) => {
      const tool = document.querySelector<HTMLElement>(selectors.tool);
      const panel = document.querySelector<HTMLElement>(selectors.panel);
      const input = document.querySelector<HTMLInputElement>(selectors.field);
      const primaryResult = document.querySelector<HTMLElement>(selectors.primaryResult);
      const sensitivity = document.querySelector<HTMLElement>(selectors.sensitivity);
      const resultPanel = document.querySelector<HTMLElement>(selectors.resultPanel);
      if (!tool || !panel || !input || !primaryResult || !sensitivity || !resultPanel) return null;
      return {
        toolBackground: getComputedStyle(tool).backgroundColor,
        panelBackground: getComputedStyle(panel).backgroundColor,
        panelRadius: getComputedStyle(panel).borderRadius,
        inputBackground: getComputedStyle(input).backgroundColor,
        inputRadius: getComputedStyle(input).borderRadius,
        primaryRadius: getComputedStyle(primaryResult).borderRadius,
        sensitivityRadius: getComputedStyle(sensitivity).borderRadius,
        sensitivityAccent: getComputedStyle(sensitivity).borderLeftColor,
        resultPosition: getComputedStyle(resultPanel).position,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    }, calculator);

    expect(visual).not.toBeNull();
    expect(visual!.toolBackground).toBe("rgb(247, 246, 243)");
    expect(visual!.panelBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.panelRadius).toBe("22px");
    expect(visual!.inputBackground).toBe("rgb(255, 255, 255)");
    expect(visual!.inputRadius).toBe("12px");
    expect(visual!.primaryRadius).toBe("12px");
    expect(visual!.sensitivityRadius).toBe("12px");
    expect(visual!.sensitivityAccent).toBe("rgb(124, 92, 255)");
    const isNarrow = (page.viewportSize()?.width ?? 1280) <= 860;
    expect(visual!.resultPosition).toBe(isNarrow ? "static" : "sticky");
    expect(visual!.overflow).toBe(false);

    const input = page.locator(calculator.field).first();
    await input.focus();
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("border-color", "rgb(124, 92, 255)");
  });

  test(`${calculator.route} stacks cleanly on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(calculator.route);
    expect(response?.ok()).toBeTruthy();

    const panels = page.locator(calculator.panel);
    expect(await panels.count()).toBeGreaterThanOrEqual(2);
    const first = await panels.nth(0).boundingBox();
    const second = await panels.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(Math.abs((first?.x ?? 0) - (second?.x ?? 0))).toBeLessThan(2);
    expect(second?.y ?? 0).toBeGreaterThan((first?.y ?? 0) + (first?.height ?? 0));

    const mobile = await page.evaluate((selectors) => {
      const resultPanel = document.querySelector<HTMLElement>(selectors.resultPanel);
      return {
        resultPosition: resultPanel ? getComputedStyle(resultPanel).position : null,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    }, calculator);

    expect(mobile.resultPosition).toBe("static");
    expect(mobile.overflow).toBe(false);
  });
}
