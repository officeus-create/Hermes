import { expect, test } from "@playwright/test";

// Test the rendered colors, not just a source CSS literal. This does not replace
// Pa11y/axe or a real user's readability evaluation.
const locations = ["/paths/logistics/", "/ru/"] as const;
for (const path of locations) {
  test(`footer contact text is readable against its dark surface at ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const footer = page.locator(".site-footer");
    await expect(footer).toBeVisible();
    const samples = footer.locator(".footer-contacts-label, .footer-contacts a span");
    expect(await samples.count()).toBeGreaterThan(0);
    const ratios = await samples.evaluateAll((nodes) => {
      const rgba = (input: string) => {
        const nums = input.match(/[0-9.]+/g)?.map(Number) ?? [];
        return [nums[0], nums[1], nums[2], nums[3] ?? 1];
      };
      const surface = rgba(getComputedStyle(document.querySelector(".site-footer")!).backgroundColor);
      const combine = (foreground: number[], background: number[]) =>
        [0, 1, 2].map((i) => (foreground[i] * foreground[3] + background[i] * (1 - foreground[3])) / 255);
      const lightness = (color: number[]) => {
        const linear = color.map((component) =>
          component <= .04045 ? component / 12.92 : ((component + .055) / 1.055) ** 2.4);
        return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
      };
      return nodes.map((node) => {
        const fg = rgba(getComputedStyle(node).color);
        const bg = surface.slice(0, 3).map((v) => v / 255);
        const actual = lightness(combine(fg, surface));
        const base = lightness(bg);
        return { selector: (node as HTMLElement).className || node.nodeName, ratio: (Math.max(actual, base) + .05) / (Math.min(actual, base) + .05) };
      });
    });
    for (const { selector, ratio } of ratios) {
      expect(ratio, `${path} footer ${selector} must meet WCAG AA normal text 4.5:1`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
