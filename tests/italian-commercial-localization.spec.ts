import { expect, test } from "@playwright/test";

const localizedRoutes = [
  {
    path: "/it/marketing/",
    englishPath: "/paths/marketing/",
    h1: "Marketing digitale costruito come un sistema di crescita.",
  },
  {
    path: "/it/tecnologia/",
    englishPath: "/paths/technology/",
    h1: "Software, CRM e AI costruiti intorno al modo in cui lavora l'azienda.",
  },
] as const;

for (const route of localizedRoutes) {
  test(`${route.path} is a real Italian commercial owner with reciprocal hreflang`, async ({ page }) => {
    await page.goto(route.path);

    await expect(page.locator("html")).toHaveAttribute("lang", "it-IT");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(route.h1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route.path.replaceAll("/", "\\/")}$`));
    await expect(page.locator('link[rel="alternate"][hreflang="it"]')).toHaveAttribute("href", new RegExp(`${route.path.replaceAll("/", "\\/")}$`));
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", new RegExp(`${route.englishPath.replaceAll("/", "\\/")}$`));
    const schemaText = await page.locator('script[type="application/ld+json"]').textContent();
    expect(schemaText).toContain('"@type":"Service"');
    expect(schemaText).toContain('"@type":"FAQPage"');
  });

  test(`${route.englishPath} points back to its Italian owner`, async ({ page }) => {
    await page.goto(route.englishPath);
    await expect(page.locator('link[rel="alternate"][hreflang="it"]')).toHaveAttribute("href", new RegExp(`${route.path.replaceAll("/", "\\/")}$`));
  });
}

test("Italian overview routes Marketing and Technology into the localized commercial layer", async ({ page }) => {
  await page.goto("/it/");
  await expect(page.locator('a[href="/it/marketing/"]')).toBeVisible();
  await expect(page.locator('a[href="/it/tecnologia/"]')).toBeVisible();
});

test("primary sitemap contains the two Italian commercial owners", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const xml = await response.text();
  expect(xml).toContain("https://hermeslogisticsus.com/it/marketing/");
  expect(xml).toContain("https://hermeslogisticsus.com/it/tecnologia/");
});

test("Marketing service group uses marketing copy instead of logistics copy", async ({ page }) => {
  await page.goto("/paths/marketing/");
  await expect(page.getByRole("heading", { name: "The services behind a measurable growth system." })).toBeVisible();
  await expect(page.getByText("The operating support behind every load.")).toHaveCount(0);
});
