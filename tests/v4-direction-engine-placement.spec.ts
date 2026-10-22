import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("hermes-intro-seen", "true"));
});

// Approved Claude Design direction skeleton (2026-10-22) replaced the V4 signature engines:
// every direction opens with one guiding question, then pillars, steps, real-status proof
// and the ecosystem, and ends with FAQ + Insights stories.
const engines = [
  { route: "/paths/logistics/", selector: '[data-direction-story="logistics"]', label: "Who are you today?" },
  { route: "/paths/marketing/", selector: '[data-direction-story="marketing"]', label: "Where do you lose customers?" },
  { route: "/paths/technology/", selector: '[data-direction-story="technology"]', label: "Where does work leak today?" },
  { route: "/paths/academy/", selector: '[data-direction-story="academy"]', label: "What do you want to become?" },
];

for (const engine of engines) {
  test(`${engine.route} presents the approved direction story before FAQ and stories`, async ({ page }) => {
    await page.goto(engine.route);
    const story = page.locator(engine.selector);
    await expect(story).toBeVisible();
    await expect(story.locator("h2").first()).toHaveText(engine.label);

    const order = await page.evaluate(({ selector }) => {
      const story = document.querySelector(selector);
      const bottom = document.querySelector("[data-direction-story-bottom]");
      if (!story || !bottom) return null;
      return Boolean(story.compareDocumentPosition(bottom) & Node.DOCUMENT_POSITION_FOLLOWING);
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

test("Marketing proof cards carry their real status instead of performance claims", async ({ page }) => {
  await page.goto("/paths/marketing/");
  const proof = page.locator('[data-direction-story="marketing"] .ds-proof-card');
  await expect(proof).toHaveCount(3);
  await expect(proof.locator(".ds-status")).toHaveText(["LIVE", "PREVIEW", "LIVE"]);
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
