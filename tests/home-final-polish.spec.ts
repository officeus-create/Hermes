import { expect, test } from "@playwright/test";

test("homepage keeps a restrained four-pillar entrance and shared direction colors", async ({ page }) => {
  await page.goto("/");

  const heading = page.getByRole("heading", { name: /Four directions\. Choose yours\./ });
  await expect(heading).toBeVisible();
  await expect(page.locator(".home-room")).toHaveCount(4);

  const polish = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const grid = document.querySelector<HTMLElement>(".home-rooms-grid");
    const rooms = [...document.querySelectorAll<HTMLElement>(".home-room")];
    const contact = document.querySelector<HTMLElement>("#contact.home-contact-shell");
    if (!header || !grid || rooms.length !== 4 || !contact) return null;

    return {
      headerRadius: getComputedStyle(header).borderRadius,
      gridRadius: getComputedStyle(grid).borderRadius,
      imageDisplay: rooms.map((room) => getComputedStyle(room.querySelector<HTMLElement>(".home-room-image")!).display),
      topBorders: rooms.map((room) => getComputedStyle(room).borderTopWidth),
      accents: rooms.map((room) => room.style.getPropertyValue("--room-accent")),
      footerBackground: getComputedStyle(contact).backgroundImage,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(polish).not.toBeNull();
  expect(polish!.headerRadius).not.toBe("0px");
  expect(polish!.gridRadius).toBe("32px");
  expect(polish!.imageDisplay).toEqual(["none", "none", "none", "none"]);
  expect(polish!.topBorders.every((value) => parseFloat(value) >= 6)).toBe(true);
  expect(new Set(polish!.accents).size).toBe(4);
  expect(polish!.footerBackground).toContain("gradient");
  expect(polish!.overflow).toBe(false);
});

test("homepage contact finish keeps one primary route plus office-email fallback without a form wall", async ({ page }) => {
  await page.goto("/");

  const contactOptions = page.getByLabel("Hermes contact options");
  await expect(contactOptions.getByRole("link")).toHaveCount(2);
  await expect(contactOptions.getByRole("link", { name: /Choose a contact route/i })).toHaveAttribute("href", "/contacts/");
  await expect(contactOptions.getByRole("link", { name: /officeus@hermeslogisticsus\.com/i })).toHaveAttribute(
    "href",
    "mailto:officeus@hermeslogisticsus.com",
  );
  await expect(contactOptions.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator("#contact form")).toHaveCount(0);
});
