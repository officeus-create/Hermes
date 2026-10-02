import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hermes-intro-seen", "true"));
});

const engines = [
  { route: "/paths/logistics/", selector: "[data-logistics-spatial-operations]", label: "Spatial Operations" },
  { route: "/paths/marketing/", selector: "[data-marketing-flow]", label: "Attention & Demand" },
  { route: "/paths/technology/", selector: ".technology-build-pulse", label: "Digital Systems" },
  { route: "/paths/academy/", selector: "[data-academy-flow]", label: "Human Progress" },
];

for (const engine of engines) {
  test(`${engine.route} presents its V4 signature engine before the generic overview`, async ({ page }) => {
    await page.goto(engine.route);
    const signature = page.locator(engine.selector);
    const overview = page.locator(".detail-overview");
    await expect(signature).toBeVisible();
    await expect(signature).toContainText(engine.label);

    const order = await page.evaluate(({ selector }) => {
      const signature = document.querySelector(selector);
      const overview = document.querySelector(".detail-overview");
      if (!signature || !overview) return null;
      return Boolean(signature.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING);
    }, { selector: engine.selector });

    expect(order).toBe(true);
  });
}

test("Marketing labels its signature scene as illustrative rather than live performance data", async ({ page }) => {
  await page.goto("/paths/marketing/");
  await expect(page.locator("[data-marketing-flow]")).toContainText(
    "Illustrative workflow — not live reach, ad spend, lead, conversion, attribution, or revenue data.",
  );
});

for (const route of ["/services/website-development/", "/services/website-redesign/"]) {
  test(`${route} keeps the approved Pearl/light capability-showroom header`, async ({ page }) => {
    await page.goto(route);
    const header = page.locator(".site-header");
    await expect(header).toHaveClass(/site-header-light/);
    const visual = await header.evaluate((node) => ({
      background: getComputedStyle(node).backgroundColor,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    expect(visual.background).not.toBe("rgb(7, 16, 56)");
    expect(visual.overflow).toBe(false);
  });
}

test("all four direction engines remain within the 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const engine of engines) {
    await page.goto(engine.route);
    await expect(page.locator(engine.selector)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
