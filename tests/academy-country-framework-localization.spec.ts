import { expect, test } from "@playwright/test";

const localizedRoutes = [
  { route: "/academy/countries/vietnam/", publicEntry: "Lối vào công khai của Hermes Academy" },
  { route: "/academy/countries/philippines/", publicEntry: "Pampublikong entry sa Hermes Academy" },
  { route: "/academy/countries/tajikistan/", publicEntry: "Вуруди оммавии Hermes Academy" },
  { route: "/academy/countries/morocco/", publicEntry: "مدخل عام إلى Hermes Academy" },
  { route: "/academy/countries/moldova/", publicEntry: "Intrare publică în Hermes Academy" },
  { route: "/academy/countries/romania/", publicEntry: "Intrare publică în Hermes Academy" },
];

const forbiddenEnglishFramework = [
  "Public Academy entry",
  "Commercial terms: confirmed after application review",
  "No local-office claim",
  "Future pathway",
  "Country gate",
  "This page is an informational/recruitment entry",
  "One Academy truth, localized for",
  "Approved source",
  "Privacy & rights",
  "Current-fact review",
  "Native-language QA",
  "Publication approval",
];

test("public-localized Academy country owners do not leak shared English framework copy", async ({ page }) => {
  for (const item of localizedRoutes) {
    await page.goto(item.route, { waitUntil: "domcontentloaded" });
    const main = page.locator("main[data-academy-country]");
    await expect(main).toBeVisible();
    await expect(main).toContainText(item.publicEntry);
    const text = await main.innerText();
    for (const phrase of forbiddenEnglishFramework) {
      expect(text, `${item.route} must localize shared framework phrase: ${phrase}`).not.toContain(phrase);
    }
  }
});

test("English country alternative preserves the English framework and locale contract", async ({ page }) => {
  await page.goto("/academy/countries/moldova/en/", { waitUntil: "domcontentloaded" });
  const main = page.locator("main[data-academy-country]");
  await expect(main).toContainText("Public Academy entry");
  await expect(main).toContainText("Country gate");
  await expect(main).toContainText("Approved source");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/academy/countries/moldova/en/",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="ro"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/academy/countries/moldova/",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    "href",
    "https://hermeslogisticsus.com/academy/countries/moldova/en/",
  );
});
