import { expect, test } from "@playwright/test";

test("approved mobile homepage hides the title treatment and separates direction cards", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const visual = await page.evaluate(() => {
    const heading = document.querySelector<HTMLElement>(".home-rooms-intro h1");
    const note = document.querySelector<HTMLElement>(".home-rooms-ink-note");
    const grid = document.querySelector<HTMLElement>(".home-rooms-grid");
    const card = document.querySelector<HTMLElement>(".home-room");
    if (!heading || !note || !grid || !card) return null;

    const gridStyle = getComputedStyle(grid);
    const cardStyle = getComputedStyle(card);

    return {
      headingOpacity: getComputedStyle(heading).opacity,
      noteOpacity: getComputedStyle(note).opacity,
      gridGap: gridStyle.rowGap,
      gridBorderTop: gridStyle.borderTopWidth,
      cardRadius: cardStyle.borderRadius,
      cardBorderTop: cardStyle.borderTopWidth,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.headingOpacity).toBe("0");
  expect(visual!.noteOpacity).toBe("0");
  expect(visual!.gridGap).not.toBe("1px");
  expect(visual!.gridBorderTop).toBe("0px");
  expect(visual!.cardRadius).not.toBe("0px");
  expect(visual!.cardBorderTop).not.toBe("0px");
  expect(visual!.overflow).toBe(false);
});

test("contact transition uses a dark backing and luminous top handoff", async ({ page }) => {
  await page.goto("/");

  const visual = await page.evaluate(() => {
    const contact = document.querySelector<HTMLElement>("#contact.home-contact-shell");
    if (!contact) return null;

    return {
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      contactShadow: getComputedStyle(contact).boxShadow,
      transitionBackground: getComputedStyle(contact, "::after").backgroundImage,
    };
  });

  expect(visual).not.toBeNull();
  expect(visual!.bodyBackground).not.toBe("rgb(255, 255, 255)");
  expect(visual!.contactShadow).not.toBe("none");
  expect(visual!.transitionBackground).toContain("gradient");
});
