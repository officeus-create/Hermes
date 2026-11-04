import { expect, test } from "@playwright/test";

// Repair Shop currently has 111 Pa11y color-contrast findings on the 12-route sample.
// Its Pearl hero and Obsidian workflow preview must expose opaque computed paint.
for (const width of [390, 1280]) {
  test(`Repair Shop primary surfaces expose WCAG-readable computed contrast at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/services/hermes-connect/repair-shops/");
    const root = page.locator(".repair-pilot-page");
    const card = page.locator(".repair-live-card").first();
    await expect(root).toBeVisible();
    await expect(card).toBeVisible();

    const samples = await page.evaluate(() => {
      const rgb = (raw: string): number[] => {
        const channels = (raw.match(/[0-9.]+/g) ?? []).map(Number);
        if (channels.length < 3 || channels.slice(0, 3).some((n) => !Number.isFinite(n))) {
          throw new Error(`Invalid computed color: ${raw}`);
        }
        return channels;
      };
      const luminance = (raw: string): number => {
        const channels = rgb(raw).slice(0, 3).map((n) => {
          const c = n / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      };
      const paint = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) throw new Error(`Missing repair contrast target: ${selector}`);
        const style = getComputedStyle(el);
        return { bg: style.backgroundColor, image: style.backgroundImage, opacity: style.opacity, filter: style.filter };
      };
      const contrast = (selector: string, parent: string) => {
        const child = document.querySelector(selector);
        const backing = document.querySelector(parent);
        if (!child || !backing) throw new Error(`Missing repair text or paint: ${selector}, ${parent}`);
        const l1 = luminance(getComputedStyle(child).color);
        const l2 = luminance(getComputedStyle(backing).backgroundColor);
        return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
      };
      return {
        root: paint(".repair-pilot-page"),
        preview: paint(".repair-live-card"),
        heroH1: contrast(".repair-live-hero h1", ".repair-pilot-page"),
        heroLead: contrast(".repair-lead", ".repair-pilot-page"),
        liveStrong: contrast(".repair-live-card-head strong", ".repair-live-card"),
        stepStrong: contrast(".repair-preview-step strong", ".repair-live-card"),
        stepSmall: contrast(".repair-preview-step small", ".repair-live-card"),
      };
    });

    expect(samples.root.bg).toBe("rgb(247, 246, 243)");
    expect(samples.root.image).toBe("none");
    expect(samples.preview.bg).toBe("rgb(23, 32, 51)");
    expect(samples.preview.image).toBe("none");
    for (const backing of [samples.root, samples.preview]) {
      expect(backing.opacity).toBe("1");
      expect(backing.filter).toBe("none");
    }
    for (const [name, ratio] of Object.entries({
      heroH1: samples.heroH1, heroLead: samples.heroLead,
      liveStrong: samples.liveStrong, stepStrong: samples.stepStrong, stepSmall: samples.stepSmall,
    })) {
      expect(ratio, `Repair Shop ${name} computed contrast too low`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
