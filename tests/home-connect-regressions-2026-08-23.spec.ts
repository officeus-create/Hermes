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

test("homepage contact shell is square outside and rounded only on the inner contact surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const shell = page.locator("#contact.home-contact-shell");
  const contact = shell.locator(".home-final-contact");
  await shell.scrollIntoViewIfNeeded();
  await expect(shell).toBeVisible();
  await expect(contact).toBeVisible();

  const shellPaint = await shell.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      topLeft: style.borderTopLeftRadius,
      topRight: style.borderTopRightRadius,
      backgroundColor: style.backgroundColor,
      overflow: style.overflow,
    };
  });
  expect(shellPaint.topLeft).toBe("0px");
  expect(shellPaint.topRight).toBe("0px");
  expect(shellPaint.backgroundColor).not.toBe("rgb(255, 255, 255)");
  expect(shellPaint.overflow).toBe("hidden");

  const contactPaint = await contact.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      topLeft: style.borderTopLeftRadius,
      topRight: style.borderTopRightRadius,
    };
  });
  expect(contactPaint.topLeft).not.toBe("0px");
  expect(contactPaint.topRight).not.toBe("0px");
});

for (const width of [360, 390, 412, 768]) {
  test(`homepage uses mobile header contract at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    await expect(page.locator(".site-header .desktop-nav")).toBeHidden();
    await expect(page.locator(".site-header .header-actions")).toBeHidden();
    await expect(page.locator(".site-header .menu-button")).toBeVisible();
  });
}

for (const width of [1024, 1280]) {
  test(`homepage keeps desktop header contract at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    await expect(page.locator(".site-header .desktop-nav")).toBeVisible();
    await expect(page.locator(".site-header .header-actions")).toBeVisible();
    await expect(page.locator(".site-header .menu-button")).toBeHidden();
  });
}

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
