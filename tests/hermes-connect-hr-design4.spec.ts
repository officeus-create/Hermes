import { expect, test } from "@playwright/test";

const widths = [390, 430, 768, 1024, 1440] as const;

async function expectNoHorizontalOverflow(page: any, width: number) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll, `HR candidate shell must not overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function expectMinHeight(locator: any, label: string, width: number) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} must have a measurable box at ${width}px`).not.toBeNull();
  if (box) expect(box.height, `${label} must remain at least 44px at ${width}px`).toBeGreaterThanOrEqual(44);
}

test("HR candidate shell stays private, localized and responsive across five widths", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("hermes-connect-hr-pilot-v1");
  });

  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    await page.goto("/demos/hermes-connect/hr.html?lang=ru", { waitUntil: "domcontentloaded" });

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.getByRole("heading", { name: "Покажите, как вы думаете, учитесь и применяете знания." })).toBeVisible();
    await expect(page.locator('[name="language"]')).toHaveValue("ru");
    await expect(page.getByRole("link", { name: "Начать интервью" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Начать структурированное интервью →" })).toBeVisible();
    await expect(page.locator('a[href*="hr-admin"]')).toHaveCount(0);
    await expect(page.locator('.hero-links .btn.primary')).toHaveCount(1);
    await expect(page.locator('[data-intake-panel] .btn.primary')).toHaveCount(1);
    await expectNoHorizontalOverflow(page, width);
    await expectMinHeight(page.getByRole("link", { name: "Начать интервью" }), "HR hero primary action", width);
    await expectMinHeight(page.getByRole("button", { name: "Начать структурированное интервью →" }), "HR intake primary action", width);

    await page.locator('[name="language"]').selectOption("uk");
    await expect(page).toHaveURL(/\/demos\/hermes-connect\/hr\.html\?lang=uk$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(page.getByRole("heading", { name: "Покажіть, як ви думаєте, навчаєтесь і застосовуєте знання." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Почати інтерв’ю" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Почати структуроване інтерв’ю →" })).toBeVisible();
    await expect(page.locator('a[href*="hr-admin"]')).toHaveCount(0);
    await expectNoHorizontalOverflow(page, width);
  }
});

test("HR candidate route never exposes reviewer navigation or an automatic employment decision", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("hermes-connect-hr-pilot-v1"));
  await page.goto("/demos/hermes-connect/hr.html?lang=ru", { waitUntil: "domcontentloaded" });

  const body = page.locator("body");
  await expect(page.locator('a[href*="hr-admin"]')).toHaveCount(0);
  await expect(body).not.toContainText(/auto-hire|auto-reject|guaranteed employment|guaranteed income/i);
  await expect(body).toContainText("авторизованным человеком");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex,nofollow/);
});
