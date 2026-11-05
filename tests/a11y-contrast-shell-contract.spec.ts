import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/paths/logistics/",
  "/paths/marketing/",
  "/paths/technology/",
  "/paths/academy/",
  "/services/hermes-connect/repair-shops/",
];

for (const route of routes) {
  test(`public header exposes a deterministic light contrast surface on ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);

    const header = page.locator(".site-header").first();
    await expect(header).toBeVisible();

    const paint = await header.evaluate((node) => {
      const style = getComputedStyle(node);
      const background = style.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
      return {
        opacity: style.opacity,
        backgroundColor: style.backgroundColor,
        backgroundAlpha: background.length >= 4 ? background[3] : 1,
        backdropFilter: style.backdropFilter,
        webkitBackdropFilter: style.getPropertyValue("-webkit-backdrop-filter"),
        color: style.color,
      };
    });

    expect(paint).toMatchObject({
      opacity: "1",
      backgroundAlpha: 1,
    });
    expect([paint.backdropFilter, paint.webkitBackdropFilter].filter((value) => value && value !== "none")).toEqual([]);
    expect(paint.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });
}


test("footer grouped navigation keeps opaque high-contrast computed paint", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const footer = page.locator(".site-footer");
  const heading = page.locator("#footer-directions");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await expect(heading).toBeVisible();

  const paint = await heading.evaluate((node) => {
    const ancestors = [];
    let current: HTMLElement | null = node instanceof HTMLElement ? node : null;
    while (current) {
      const style = getComputedStyle(current);
      ancestors.push({
        tag: current.tagName,
        className: current.className,
        opacity: style.opacity,
        filter: style.filter,
        backdropFilter: style.backdropFilter,
        backgroundColor: style.backgroundColor,
      });
      current = current.parentElement;
    }
    const style = getComputedStyle(node);
    const footerNode = document.querySelector(".site-footer");
    if (!(footerNode instanceof HTMLElement)) throw new Error("Footer is missing from the rendered page");
    const footerStyle = getComputedStyle(footerNode);
    return {
      color: style.color,
      opacity: style.opacity,
      footerBackground: footerStyle.backgroundColor,
      ancestors,
    };
  });

  // Contrast acceptance is assessed against the actual computed background below;
  // do not pin a specific valid design-token RGB value.
  expect(paint.footerBackground).toBe("rgb(5, 11, 43)");
  const foregroundRatios = await footer.evaluate((root) => {
    const selectors = [
      ".footer-brand span",
      ".footer-intro > p:not(.footer-brand)",
      ".footer-link-group h2",
      ".footer-link-group a",
      ".footer-contacts a",
      ".footer-meta > span",
      ".hc-launcher-panel p",
    ];
    const rgb = (text: string) => (text.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
    const luminance = (color: number[]) => {
      const linear = color.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    const bg = luminance(rgb(getComputedStyle(root).backgroundColor));
    return selectors.map((selector) => {
      const element = root.querySelector(selector);
      if (!element) throw new Error(`Footer contrast selector absent: ${selector}`);
      const color = luminance(rgb(getComputedStyle(element).color));
      return { selector, contrast: (Math.max(color, bg) + 0.05) / (Math.min(color, bg) + 0.05) };
    });
  });
  for (const { selector, contrast } of foregroundRatios) {
    expect(contrast, `Computed footer contrast too low at ${selector}`).toBeGreaterThanOrEqual(4.5);
  }

  expect(paint.opacity).toBe("1");
  expect(paint.ancestors.filter((item) => item.opacity !== "1")).toEqual([]);
  expect(paint.ancestors.filter((item) => item.filter !== "none")).toEqual([]);
});
