import { expect, test } from "@playwright/test";

const routes = [
  { path: "/it/padova/", lang: "it", heading: "Siti web, SEO e social media marketing per aziende di Padova." },
  { path: "/it/padova/realizzazione-siti-web/", lang: "it", heading: "Realizzazione siti web per aziende di Padova." },
  { path: "/it/padova/seo/", lang: "it", heading: "SEO e visibilità AI/GEO per aziende di Padova." },
  { path: "/it/padova/social-media/", lang: "it", heading: "Social media marketing organico e Meta Ads per Padova." },
  { path: "/es/madrid/", lang: "es", heading: "Diseño web, SEO y redes sociales para empresas de Madrid." },
  { path: "/es/madrid/diseno-web/", lang: "es", heading: "Diseño y desarrollo web para empresas de Madrid." },
  { path: "/es/madrid/seo/", lang: "es", heading: "SEO y visibilidad GEO/IA para empresas de Madrid." },
  { path: "/es/madrid/redes-sociales/", lang: "es", heading: "Contenido orgánico, redes sociales y Meta Ads para Madrid." },
];

for (const item of routes) {
  test(`${item.path} is a distinct canonical local marketing owner`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(item.path, { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("lang", item.lang);
    await expect(page.getByRole("heading", { level: 1, name: item.heading })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hermeslogisticsus.com${item.path}`);
    await expect(page.locator("body")).not.toContainText("guaranteed rankings");

    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport + 1);
  });
}

test("London SEO owner adds GEO/AI visibility without a second London GEO page", async ({ page }) => {
  await page.goto("/gb/london/seo-services/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/SEO Services London \| Local SEO & AI Search Visibility \| Hermes/);
  await expect(page.getByRole("heading", { name: "Make London services understandable to both search engines and AI systems." })).toBeVisible();
  await expect(page.locator("body")).toContainText("ChatGPT, Gemini, Copilot, Perplexity and Google AI");
  await expect(page.locator("body")).not.toContainText("59 Lafone Street");
  await expect(page.locator("body")).not.toContainText("North London office");
});
