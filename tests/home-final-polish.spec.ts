import { expect, test } from "@playwright/test";

test("final homepage polish keeps the focused entrance and adds living Hermes effects", async ({ page }) => {
  await page.goto("/");

  const heading = page.getByRole("heading", { name: /Four directions\. Choose yours\./ });
  await expect(heading).toBeVisible();
  await expect(page.locator(".home-room")).toHaveCount(4);

  const polish = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const title = document.querySelector<HTMLElement>(".home-rooms-intro h1");
    const handwritten = document.querySelector<HTMLElement>(".home-rooms-intro h1 em");
    const note = document.querySelector<HTMLElement>(".home-rooms-intro > p:last-child");
    const action = document.querySelector<HTMLElement>(".home-room-arrow");
    const contact = document.querySelector<HTMLElement>("#contact.home-contact-shell");
    if (!header || !title || !handwritten || !note || !action || !contact) return null;

    return {
      headerRadius: getComputedStyle(header).borderRadius,
      titleBackground: getComputedStyle(title).backgroundImage,
      handwrittenAnimation: getComputedStyle(handwritten).animationName,
      noteAnimation: getComputedStyle(note).animationName,
      actionMark: getComputedStyle(action, "::before").backgroundImage,
      footerBackground: getComputedStyle(contact).backgroundImage,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(polish).not.toBeNull();
  expect(polish!.headerRadius).not.toBe("0px");
  expect(polish!.titleBackground).toContain("linear-gradient");
  expect(polish!.handwrittenAnimation).toContain("handwritten-reveal");
  expect(polish!.noteAnimation).toContain("home-ink-write");
  expect(polish!.actionMark).toContain("hermes-connect-mark.svg");
  expect(polish!.actionMark).not.toContain("/demos/");
  expect(polish!.footerBackground).toContain("gradient");
  expect(polish!.overflow).toBe(false);
});

test("homepage contact finish exposes office email and phone without a form wall", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /Office email officeus@hermeslogisticsus\.com/i })).toHaveAttribute(
    "href",
    "mailto:officeus@hermeslogisticsus.com",
  );
  await expect(page.getByRole("link", { name: /U\.S\. Logistics \+1 \(262\) 302-3626/i })).toHaveAttribute(
    "href",
    "tel:+12623023626",
  );
  await expect(page.getByRole("link", { name: /Choose a contact route/i })).toHaveAttribute("href", "/contacts/");
  await expect(page.locator("#contact form")).toHaveCount(0);
});
