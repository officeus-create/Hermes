import { expect, test } from "@playwright/test";

// Pa11y 2026-11-02: /businesses/ still has 135 contrast findings after #2245,
// with 18 first-party Catalog service cards and repeated text findings.
// Check final browser paint rather than trusting a source HEX token.
for (const width of [390, 1280]) {
  test(`all 18 Catalog service cards have solid backing and readable computed text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/businesses/");
    const cards = page.locator("#hermes-services .service-card");
    await expect(cards).toHaveCount(18);

    const readings = await cards.evaluateAll((elements) => {
      const toRgb = (raw: string): number[] => {
        const rgb = (raw.match(/[0-9.]+/g) || []).map(Number);
        if (rgb.length < 3 || rgb.slice(0, 3).some((n) => !Number.isFinite(n))) {
          throw new Error(`Cannot parse computed color: ${raw}`);
        }
        return rgb;
      };
      const luminance = (color: string): number => {
        const channels = toRgb(color).slice(0, 3).map((value) => {
          const channel = value / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      };
      return elements.map((card, index) => {
        const cardStyle = getComputedStyle(card);
        const sample = card.querySelectorAll(
          ":scope > .service-card__top span, :scope > h3, :scope > p, :scope > small, :scope > a, :scope > .service-tags span"
        );
        return {
          index,
          background: cardStyle.backgroundColor,
          backgroundImage: cardStyle.backgroundImage,
          opacity: cardStyle.opacity,
          filter: cardStyle.filter,
          readings: Array.from(sample).map((el) => {
            const style = getComputedStyle(el);
            const ownBg = toRgb(style.backgroundColor);
            const solid = ownBg.length < 4 || ownBg[3] === 1;
            const background = solid ? style.backgroundColor : cardStyle.backgroundColor;
            const foreL = luminance(style.color);
            const backL = luminance(background);
            return {
              tag: el.tagName,
              text: el.textContent?.trim().slice(0, 52) || "",
              contrast: (Math.max(foreL, backL) + 0.05) / (Math.min(foreL, backL) + 0.05),
            };
          }),
        };
      });
    });

    for (const card of readings) {
      expect(card.background, `Card ${card.index} lacks opaque white paint`).toBe("rgb(255, 255, 255)");
      expect(card.backgroundImage, `Card ${card.index} retains a gradient masking text contrast`).toBe("none");
      expect(card.opacity).toBe("1");
      expect(card.filter).toBe("none");
      expect(card.readings.length).toBeGreaterThanOrEqual(6);
      for (const item of card.readings) {
        expect(item.contrast, `Card ${card.index}, ${item.tag} ${item.text}: insufficient contrast`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
