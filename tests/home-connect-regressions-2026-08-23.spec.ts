import { expect, test } from "@playwright/test";

test("mobile homepage keeps Four directions visible after load", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const title = page.locator(".home-rooms-display");
  await expect(title).toHaveText("Four directions.");
  await expect(title).toBeVisible();

  const paint = await title.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      opacity: style.opacity,
      visibility: style.visibility,
      color: style.color,
      webkitTextFillColor: style.getPropertyValue("-webkit-text-fill-color"),
    };
  });

  expect(paint.opacity).toBe("1");
  expect(paint.visibility).toBe("visible");
  expect(paint.webkitTextFillColor).not.toContain("transparent");
});

test("homepage contact shell has a dark corner backdrop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const shell = page.locator(".home-contact-shell");
  await shell.scrollIntoViewIfNeeded();
  await expect(shell).toBeVisible();

  const background = await shell.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(background).not.toBe("rgb(255, 255, 255)");
});

test("Hermes Connect Russian selection persists across product-family navigation", async ({ page }) => {
  await page.goto("/services/hermes-connect/?lang=ru");

  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("[data-language-menu] summary span")).toHaveText("Русский");

  const repairLink = page.locator('.hc-family-nav a[href*="repair-shops"]').first();
  await expect(repairLink).toHaveAttribute("href", /repair-shops\/\?lang=ru$/);

  await repairLink.click();
  await expect(page).toHaveURL(/\/services\/hermes-connect\/repair-shops\/\?lang=ru$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});

test("Hermes Connect restores the saved Russian locale when query is missing", async ({ page }) => {
  await page.goto("/services/hermes-connect/?lang=ru");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  await page.goto("/services/hermes-connect/");
  await expect(page).toHaveURL(/\/services\/hermes-connect\/\?lang=ru$/);
  await expect(page.locator("[data-language-menu] summary span")).toHaveText("Русский");
});
