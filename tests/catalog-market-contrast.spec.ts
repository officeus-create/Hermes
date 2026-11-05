import { expect, test } from "@playwright/test";

// Exact Pa11y failure cluster on /businesses/ (12-route 2026-11-02 baseline).
// Test rendered CSS (not just hex tokens) at desktop and narrow mobile sizes.
// These small 9-12px labels must meet WCAG AA normal-text contrast (4.5:1).
const affectedSelectors = [
  ".market-panels > article > p",
  ".academy-country-contract > div > p",
  ".localized-country-grid article > div > small",
  ".localized-country-grid article > p",
  ".localized-country-grid article footer span",
  ".country-source-note",
] as const;

for (const width of [390, 1280]) {
  test(`Catalog global market labels meet computed WCAG AA contrast at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/businesses/");
    const findings = await page.locator("#global-markets").evaluate((root, selectors) => {
      function rgb(raw: string): number[] {
        const values = (raw.match(/[0-9.]+/g) ?? []).map(Number);
        if (values.length < 3 || values.slice(0, 3).some((value) => !Number.isFinite(value))) {
          throw new Error(`Unparseable computed CSS color: ${raw}`);
        }
        return values;
      }
      function luminance(raw: string): number {
        const channels = rgb(raw).slice(0, 3).map((n) => {
          const c = n / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      }
      function effectiveBackground(element: Element): string {
        let current: Element | null = element;
        while (current) {
          const background = getComputedStyle(current).backgroundColor;
          const channels = rgb(background);
          if ((channels[3] ?? 1) === 1) return background;
          current = current.parentElement;
        }
        throw new Error("No opaque background found for Catalog label");
      }
      return selectors.map((selector) => {
        const elements = Array.from(root.querySelectorAll(selector));
        return {
          selector,
          ratios: elements.map((node) => {
            const fore = luminance(getComputedStyle(node).color);
            const back = luminance(effectiveBackground(node));
            return (Math.max(fore, back) + 0.05) / (Math.min(fore, back) + 0.05);
          }),
        };
      });
    }, [...affectedSelectors]);

    for (const group of findings) {
      expect(group.ratios.length, `Missing Catalog coverage: ${group.selector}`).toBeGreaterThan(0);
      for (const ratio of group.ratios) {
        expect(ratio, `Low computed contrast: ${group.selector}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
