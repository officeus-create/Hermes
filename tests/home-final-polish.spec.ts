import { expect, test } from "@playwright/test";

test("homepage keeps four architectural master scene and shared direction signals", async ({ page }) => {
  await page.goto("/");

  const heading = page.getByRole("heading", { name: /Four directions\./ });
  await expect(heading).toBeVisible();
  await expect(page.locator(".home-master-route")).toHaveCount(4);
  await expect(page.locator(".home-master-core")).toHaveCount(0);

  const polish = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const stage = document.querySelector<HTMLElement>(".home-master-stage");
    const routes = [...document.querySelectorAll<HTMLElement>(".home-master-route")];
    const contact = document.querySelector<HTMLElement>("#contact.home-contact-shell");
    if (!header || !stage || routes.length !== 4 || !contact) return null;

    return {
      headerRadius: getComputedStyle(header).borderRadius,
      stageRadius: getComputedStyle(stage).borderRadius,
      accents: routes.map((route) => route.style.getPropertyValue("--route-accent")),
      portalWidth: routes[0].getBoundingClientRect().width,
      footerBackground: getComputedStyle(contact).backgroundImage,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });

  expect(polish).not.toBeNull();
  expect(polish!.headerRadius).not.toBe("0px");
  const viewportWidth = page.viewportSize()?.width ?? 1280;
  const expectedStageRadius = viewportWidth <= 700 ? "26px" : "34px";
  expect(polish!.stageRadius).toBe(expectedStageRadius);
  expect(new Set(polish!.accents).size).toBe(4);
  expect(polish!.portalWidth).toBeGreaterThan(90);
  expect(polish!.footerBackground).toContain("gradient");
  expect(polish!.overflow).toBe(false);
});

test("homepage contact finish keeps one primary route plus office-email fallback without a form wall", async ({ page }) => {
  await page.goto("/");

  const contactOptions = page.getByLabel("Hermes contact options");
  await expect(contactOptions.getByRole("link")).toHaveCount(2);
  await expect(contactOptions.getByRole("link", { name: /Talk to Hermes/i })).toHaveAttribute("href", "/contacts/");
  await expect(page.locator("[data-home-contact-fallback]")).toHaveAttribute(
    "href",
    "mailto:officeus@hermeslogisticsus.com",
  );
  await expect(contactOptions.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator("#contact form")).toHaveCount(0);
});
