import { expect, test } from "@playwright/test";

const homeRoutes = {
  en: "/",
  uk: "/ua/",
  ru: "/ru/",
  es: "/es/",
  it: "/it/",
  fr: "/fr/",
} as const;
const directions = ["logistics", "marketing", "technology", "academy"] as const;
const evidenceRoutes = {
  logistics: "/company-information/",
  marketing: "/case/appleton-vehicle-transport-seo/",
  technology: "/case/it-development/",
  academy: "/academy/resources/",
} as const;
const directionRoutes = {
  en: ["/paths/logistics/", "/paths/marketing/", "/paths/technology/", "/paths/academy/"],
  uk: ["/ua/logistics/", "/ua/marketing/", "/ua/technology/", "/ua/academy/"],
  ru: ["/ru/logistics/", "/ru/marketing/", "/ru/technology/", "/ru/academy/"],
  es: ["/es/logistica/", "/es/marketing/", "/es/tecnologia/", "/es/academia/"],
  it: ["/it/logistica/", "/it/marketing/", "/it/tecnologia/", "/it/academy/"],
  fr: ["/fr/logistique/", "/fr/marketing/", "/fr/technologie/", "/fr/academie/"],
} as const;

// These are real existing canonical owner/evidence URLs, not new thin pages.
// Explicitly preserve the existing six-language self-canonical/hreflang system.
for (const [locale, home] of Object.entries(homeRoutes)) {
  test(`value, proof and next action stay available on the ${locale} homepage`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(home);
    const section = page.locator("[data-home-proof-decision]");
    await expect(section).toHaveCount(1);
    await expect(section).toHaveAttribute("data-proof-locale", locale);
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(section.locator("[data-proof-direction]")).toHaveCount(4);
    for (const [index, direction] of directions.entries()) {
      const card = section.locator(`[data-proof-direction="${direction}"]`);
      await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(card.locator("p")).not.toBeEmpty();
      await expect(card.locator("[data-proof-evidence]")).toHaveAttribute("href", evidenceRoutes[direction]);
      await expect(card.locator("[data-proof-service]")).toHaveAttribute("href", directionRoutes[locale as keyof typeof directionRoutes][index]);
      const links = card.locator("a");
      await expect(links).toHaveCount(2);
      for (const link of await links.all()) {
        expect(await link.evaluate((node) => node.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      }
    }
    await expect(section.locator("[data-proof-contact]")).toHaveAttribute("href", "/contacts/");
    // Localized proof links are visibly marked as English-language sources.
    if (locale !== "en") await expect(section.locator("[data-proof-evidence]").first()).toContainText(/англ|english|ingl|anglais/i);
    const proofFits = await section.evaluate((node) =>
      node.scrollWidth <= node.clientWidth + 1);
    expect(proofFits, `${locale} evidence band must fit 390px without horizontal clipping`).toBe(true);
  });
}

test("evidence links and local direction route work before any analytics consent", async ({ page }) => {
  await page.goto("/");
  const proof = page.locator("[data-home-proof-decision]");
  await proof.locator('[data-proof-direction="marketing"] [data-proof-evidence]').click();
  await expect(page).toHaveURL(/\/case\/appleton-vehicle-transport-seo\/$/);
  await page.goBack();
  await proof.locator('[data-proof-direction="technology"] [data-proof-service]').click();
  await expect(page).toHaveURL(/\/paths\/technology\/$/);
});

test("evidence-first decision band is accessible without scripts", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: testInfo.project.use.baseURL,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/ru/");
    const section = page.locator("[data-home-proof-decision]");
    await expect(section.locator("[data-proof-evidence]")).toHaveCount(4);
    await expect(section.locator("[data-proof-service]")).toHaveCount(4);
    await section.locator('[data-proof-direction="logistics"] [data-proof-service]').click();
    await expect(page).toHaveURL(/\/ru\/logistics\/$/);
  } finally {
    await context.close();
  }
});
