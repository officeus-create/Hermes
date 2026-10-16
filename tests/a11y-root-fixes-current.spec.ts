import { expect, test } from "@playwright/test";

const parseRgb = (value: string) => (value.match(/[0-9.]+/g) ?? []).map(Number);

test("shared accessibility semantics survive on current design", async ({ page }) => {
  await page.goto("/paths/academy/");
  await expect(page.getByRole("group", { name: "Academy pathway progress" })).toHaveCount(1);
  await expect(page.getByRole("group", { name: "Academy learning method" })).toHaveCount(1);

  await page.goto("/businesses/");
  const map = page.getByRole("group", { name: "United States tile map showing active Hermes Catalog states" });
  await expect(map).toHaveCount(1);
  await expect(page.locator(".tile-map[role='img']")).toHaveCount(0);
  await expect(map.locator("a.state-tile.active").first()).toHaveAttribute("href", /^\/businesses\/[a-z-]+\/$/);
  await expect(map.locator("span.state-tile.pending").first()).toHaveAttribute("role", "img");

  await page.goto("/carrier/");
  await expect(page.getByRole("group", { name: "Carrier agreement commitments" })).toHaveCount(1);

  await page.goto("/sign/");
  await expect(page.getByRole("group", { name: "Carrier control commitments" })).toHaveCount(1);
});

test("footer labels and localized proof arrows keep readable contrast", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paths/logistics/");
  const labels = page.locator(".footer-contacts-label");
  expect(await labels.count()).toBeGreaterThan(0);

  const ratios = await labels.evaluateAll((nodes) => {
    const parse = (input: string) => (input.match(/[0-9.]+/g) ?? []).map(Number);
    const luminance = (rgb: number[]) => {
      const linear = rgb.slice(0, 3).map((v) => {
        const c = v / 255;
        return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
      });
      return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
    };
    const bg = parse(getComputedStyle(document.querySelector(".site-footer")!).backgroundColor);
    return nodes.map((node) => {
      const fg = parse(getComputedStyle(node).color);
      const alpha = fg[3] ?? 1;
      const composite = [0, 1, 2].map((i) => fg[i] * alpha + bg[i] * (1 - alpha));
      const a = luminance(composite);
      const b = luminance(bg);
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    });
  });
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);

  await page.goto("/ru/");
  const arrows = page.locator("[data-home-proof-decision] [data-proof-service] span[aria-hidden='true']");
  expect(await arrows.count()).toBeGreaterThan(0);
  const opacity = await arrows.first().evaluate((node) => getComputedStyle(node).opacity);
  expect(Number(opacity)).toBe(1);
});
