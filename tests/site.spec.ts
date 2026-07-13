import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/paths/logistics/",
  "/paths/marketing/",
  "/paths/academy/",
  "/paths/technology/",
  "/privacy/",
];

for (const route of routes) {
  test(`${route} renders without broken layout`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("#main-content")).toBeVisible();

    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
    }));

    expect(result.overflow).toBe(false);
    expect(result.brokenImages).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("direction card opens the matching page and preselects the form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore IT Development: IT Development" }).click();
  await expect(page).toHaveURL(/\/paths\/technology\/$/);
  await expect(page.locator('select[name="path"]')).toHaveValue("IT Development");
});

test("preview contact workflow validates and sends no request", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/#contact");
  await page.locator('input[name="name"]').fill("Test User");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('select[name="path"]').selectOption("Hermes Logistics");
  await page.locator('textarea[name="message"]').fill("I would like to discuss a logistics workflow.");
  await page.locator('input[name="consent"]').check();
  await page.locator('button[type="submit"]').click();

  await expect(page.locator("[data-form-status]")).toContainText("Your information was not sent or stored");
  expect(posts).toEqual([]);
});

test("mobile menu supports keyboard close", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only behavior");
  await page.goto("/");
  const button = page.locator("[data-menu-button]");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
});

test("academy program chooser switches accessible panels", async ({ page }) => {
  await page.goto("/paths/academy/");
  const tab = page.getByRole("tab", { name: "03 COO / Director" });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "03 COO / Director" })).toContainText("Operational leadership capability");
});

test("marketing growth flow supports click and keyboard navigation", async ({ page }) => {
  await page.goto("/paths/marketing/");
  const contentTab = page.getByRole("tab", { name: "02 Content" });
  await contentTab.click();
  await expect(contentTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "02 Content" })).toContainText("Message system and content direction");

  await contentTab.press("ArrowRight");
  const distributionTab = page.getByRole("tab", { name: "03 Distribution" });
  await expect(distributionTab).toBeFocused();
  await expect(distributionTab).toHaveAttribute("aria-selected", "true");
});
