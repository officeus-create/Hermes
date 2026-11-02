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

    expect(paint.opacity).toBe("1");
    expect(paint.backgroundAlpha).toBe(1);
    expect(paint.backdropFilter === "none" || paint.backdropFilter === "").toBe(true);
    expect(paint.webkitBackdropFilter === "none" || paint.webkitBackdropFilter === "").toBe(true);
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
    let current = node;
    while (current && current instanceof HTMLElement) {
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
    const footerStyle = getComputedStyle(document.querySelector(".site-footer"));
    return {
      color: style.color,
      opacity: style.opacity,
      footerBackground: footerStyle.backgroundColor,
      ancestors,
    };
  });

  expect(paint.color).toBe("rgb(217, 220, 227)");
  expect(paint.footerBackground).toBe("rgb(5, 11, 43)");
  expect(paint.opacity).toBe("1");
  expect(paint.ancestors.every((item) => item.opacity === "1")).toBe(true);
  expect(paint.ancestors.every((item) => item.filter === "none")).toBe(true);
});
