import { expect, test } from "@playwright/test";

const referenceRoutes = [
  { route: "/services/hermes-connect/ai-command-center/", robots: "noindex,follow" },
  { route: "/services/hermes-connect/unified-inbox/", robots: "noindex,follow" },
  { route: "/services/hermes-connect/load-analyzer/", robots: "index,follow" },
];

test.describe("Hermes Connect reference capability GEO hierarchy", () => {
  for (const { route, robots } of referenceRoutes) {
    test(`${route} preserves its declared search ownership boundary`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", robots);
      await expect(page.locator("[data-hc-capability-page]")).toHaveAttribute("data-hc-live-status", "reference");
      await expect(page.locator(".hc-reference-badge")).toContainText("not current live pilot");

      const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
      const json = payloads.join("\n");
      expect(json).toContain('"@type":"WebPage"');
      expect(json).toContain('"isPartOf"');
      expect(json).toContain('"name":"Hermes Connect"');
      expect(json).toContain('"url":"https://hermeslogisticsus.com/services/hermes-connect/"');
    });
  }
});
