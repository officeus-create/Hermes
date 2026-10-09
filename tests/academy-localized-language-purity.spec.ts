import { expect, test } from "@playwright/test";

const cases = [
  {
    path: "/ua/academy/marketing/",
    lang: "uk",
    required: ["супровід продажів", "Контент із сайтом як канонічною основою"],
    forbidden: ["follow-up", "website-first", "sales follow-up", "social media", "employment", "future paid work"],
  },
  {
    path: "/ua/academy/us-logistics-operations/",
    lang: "uk",
    required: ["подальший супровід", "передача задач", "Програма маркетингу українською", "супроводу продажів"],
    forbidden: ["follow-up", "handoff", "team leads", "feedback", "website-first", "lead journey", "Marketing program"],
  },
  {
    path: "/ru/academy/us-logistics-operations/",
    lang: "ru",
    required: ["рабочий процесс", "проверки качества", "Каноническая русскоязычная страница"],
    forbidden: ["workflow", "handoff", "reviewer", "owner обучения", "live-упражнения"],
  },
  {
    path: "/es/academy/us-logistics-operations/",
    lang: "es",
    required: ["flujo de trabajo", "controles de calidad", "Página canónica en español"],
    forbidden: ["workflow", "handoffs", "reviewer", "Owner general", "quality checks"],
  },
  {
    path: "/it/academy/us-logistics-operations/",
    lang: "it",
    required: ["flusso di lavoro", "controlli qualità", "Pagina canonica in italiano"],
    forbidden: ["workflow", "handoff", "reviewer", "Owner generale", "quality check", "comunicazione live"],
  },
  {
    path: "/fr/academy/us-logistics-operations/",
    lang: "fr",
    required: ["flux de travail", "contrôles qualité", "Page canonique francophone"],
    forbidden: ["workflow", "handoffs", "reviewer", "Owner général", "quality checks", "communication live"],
  },
] as const;

for (const entry of cases) {
  test(`${entry.path} keeps its public Academy owner language-consistent`, async ({ page }) => {
    await page.goto(entry.path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", entry.lang);

    const body = await page.locator("main").innerText();
    for (const phrase of entry.required) expect(body).toContain(phrase);
    for (const phrase of entry.forbidden) expect(body.toLowerCase()).not.toContain(phrase.toLowerCase());

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe(`https://hermeslogisticsus.com${entry.path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,follow/);
  });
}

for (const width of [390, 1024, 1180, 1440]) {
  test(`Italian Academy participation heading fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/it/academy/us-logistics-operations/');
    await page.evaluate(() => document.fonts.ready);
    const heading = page.locator('.academy-public-page .resource-safety-card h2');
    await expect(heading).toHaveText('Prima, un ambito di partecipazione chiaro.');
    await expect(heading).toBeVisible();
    const sizes = await heading.evaluate(node=>({scroll:node.scrollWidth,client:node.clientWidth,overflow:getComputedStyle(node).overflowX}));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client+1);
    expect(sizes.overflow).toBe('visible');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
