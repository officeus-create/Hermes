import { expect, test } from "@playwright/test";

const localizedHubCases = [
  ["ru", "Управляйте бизнесом с AI.", "Язык контента: русский"],
  ["uk", "Керуйте бізнесом з AI.", "Мова контенту: українська"],
  ["es", "Dirige tu empresa con IA.", "Idioma del contenido: español"],
  ["it", "Gestisci la tua azienda con l’AI.", "Lingua dei contenuti: italiano"],
  ["fr", "Pilotez votre entreprise avec l’IA.", "Langue du contenu : français"],
] as const;

test("clean Hermes Connect hub remains canonical English even after another locale was stored", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("hermes-connect-language", "ru");
  });
  await page.goto("/services/hermes-connect/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".hc-copy h1")).toHaveText("Run your business with AI.");
  await expect(page).toHaveURL(/\/services\/hermes-connect\/$/);
  await expect(page.locator('main a[href="/services/hermes-connect/access/"]')).toBeVisible();
  await expect(page.locator('.hc-actions a[href="/services/hermes-connect/academy/"]')).toBeVisible();
});

test("explicit Hermes Connect query locales translate the hub without creating SEO language URLs", async ({ page }) => {
  for (const [locale, hero, contentLabel] of localizedHubCases) {
    await page.goto(`/services/hermes-connect/?lang=${locale}`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".hc-copy h1")).toHaveText(hero);
    await expect(page.locator(".hc-content-language")).toHaveText(contentLabel);
    await expect(page.locator("[data-hc-product-context] [data-hc-english-only]")).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/services/hermes-connect/");
    await expect(page.locator('link[hreflang][href*="?lang="]')).toHaveCount(0);

    const accessHref = await page.locator('main a[href*="/services/hermes-connect/access/"]').first().getAttribute("href");
    expect(accessHref).toContain(`lang=${locale}`);
  }
});

test("Connect query language shell agrees with hub content and preserves private noindex", async ({ page }) => {
  await page.goto('/services/hermes-connect/?lang=UK');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.locator('[data-language-menu] summary span')).toHaveText('Українська');
  await expect(page.locator('.hc-content-language')).toHaveText('Мова контенту: українська');
  await expect(page.locator('.hc-copy h1')).toHaveText('Керуйте бізнесом з AI.');
  await page.goto('/services/hermes-connect/?lang=unsupported');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.hc-copy h1')).toHaveText('Run your business with AI.');
  await page.goto('/services/hermes-connect/access/?lang=uk');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hermeslogisticsus.com/services/hermes-connect/access/');
});


test("Connect header switches languages instead of rewriting every choice to the current locale", async ({ page }) => {
  await page.goto("/services/hermes-connect/", { waitUntil: "domcontentloaded" });
  for (const [locale, hero] of [["uk", "Керуйте бізнесом з AI."], ["fr", "Pilotez votre entreprise avec l’IA."], ["en", "Run your business with AI."]]) {
    const mobileToggle = page.locator("[data-menu-button]");
    const isMobileMenu = await mobileToggle.isVisible();
    if (isMobileMenu) await mobileToggle.click();
    const menu = isMobileMenu
      ? page.locator("[data-mobile-menu] .mobile-language-switcher")
      : page.locator("[data-language-menu]:visible").first();
    if (!isMobileMenu) await menu.locator("summary").click();
    const choice = menu.locator('a[lang="' + locale + '"]');
    await expect(choice).toHaveAttribute("href", locale === "en" ? "/services/hermes-connect/" : "/services/hermes-connect/?lang=" + locale);
    await choice.click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".hc-copy h1")).toHaveText(hero);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/services/hermes-connect/");
  }
});
