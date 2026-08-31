import { expect, test } from "@playwright/test";

const representativeRoutes = [
  "/gb/london/",
  "/gb/london/seo-services/",
  "/gb/london/it-web-development/",
  "/gb/london/us-logistics-training/",
  "/gb/london/academy/",
  "/gb/london/academy/freight-dispatcher-training/",
  "/ru/gb/london/",
  "/ru/gb/london/marketing/",
  "/ua/gb/london/",
  "/ua/gb/london/marketing/",
];

for (const route of representativeRoutes) {
  test(`London mobile layout has no horizontal overflow and images are accessible: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route, { waitUntil: "domcontentloaded" });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);

    const images = page.locator("img");
    const imageCount = await images.count();
    for (let index = 0; index < imageCount; index += 1) {
      await expect(images.nth(index)).toHaveAttribute("alt", /\S/);
    }

    const primaryCtas = page.locator("a.button-primary:visible, button.button-primary:visible");
    const ctaCount = await primaryCtas.count();
    for (let index = 0; index < ctaCount; index += 1) {
      const box = await primaryCtas.nth(index).boundingBox();
      expect(box, `visible primary CTA should have a measurable box on ${route}`).not.toBeNull();
      if (box) expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });
}

test("Russian London hub keeps its core navigation inside the Russian market routes", async ({ page }) => {
  await page.goto("/ru/gb/london/", { waitUntil: "domcontentloaded" });
  for (const href of [
    "/ru/gb/london/marketing/",
    "/ru/gb/london/it-web-development/",
    "/ru/gb/london/us-logistics-training/",
  ]) {
    await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
  }

  for (const section of ["marketing", "it-web-development", "us-logistics-training"]) {
    await page.goto(`/ru/gb/london/${section}/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/ru/gb/london/"]')).toBeVisible();
  }
});

test("Ukrainian London hub keeps its core navigation inside the Ukrainian market routes", async ({ page }) => {
  await page.goto("/ua/gb/london/", { waitUntil: "domcontentloaded" });
  for (const href of [
    "/ua/gb/london/marketing/",
    "/ua/gb/london/it-web-development/",
    "/ua/gb/london/us-logistics-training/",
  ]) {
    await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
  }

  for (const section of ["marketing", "it-web-development", "us-logistics-training"]) {
    await page.goto(`/ua/gb/london/${section}/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/ua/gb/london/"]')).toBeVisible();
  }
});

test("London business conversion observer only emits after confirmed form delivery state", async ({ page }) => {
  await page.goto(
    "/business-growth/?utm_source=london&utm_medium=organic&utm_campaign=london-services&utm_content=seo-services&service=seo",
    { waitUntil: "domcontentloaded" },
  );

  const events = await page.evaluate(() => {
    const captured: Array<Record<string, unknown>> = [];
    window.addEventListener("hermes:analytics", (event) => {
      if (event instanceof CustomEvent && event.detail?.name === "london_business_inquiry_submitted") {
        captured.push(event.detail);
      }
    });

    const form = document.querySelector<HTMLFormElement>("[data-business-lead-form]");
    const status = form?.querySelector<HTMLElement>("[data-form-status]");
    if (!form || !status) throw new Error("business lead form status unavailable");
    status.textContent = form.dataset.received || "Request received. We will use the contact channel and time window you provided.";
    return new Promise<Array<Record<string, unknown>>>((resolve) => window.setTimeout(() => resolve(captured), 0));
  });

  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({
    name: "london_business_inquiry_submitted",
    market: "london",
    service_intent: "SEO",
    campaign: "london-services",
    content: "seo-services",
  });
});
