import { expect, test } from "@playwright/test";

test("Catalog Ukraine cards render English by default and Ukrainian on request", async ({ page }) => {
  await page.goto("/businesses/", { waitUntil: "domcontentloaded" });
  const section = page.locator("#international-businesses");
  await expect(section.getByRole("heading", { name: "Mangal i Kazan" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Kons na Bis" })).toBeVisible();
  await expect(section).toContainText("Chaiky, Kyiv Oblast");
  await expect(section).toContainText("Lula kebab");
  await expect(page.locator('[data-language-menu] a[lang="uk"]')).toHaveAttribute("href", "/businesses/?lang=uk");
  await page.goto("/businesses/?lang=uk", { waitUntil: "domcontentloaded" });
  await expect(section.getByRole("heading", { name: "Мангал і Казан" })).toBeVisible();
  await expect(section).toContainText("Люля-кебаб");
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});

test("International concept profile preserves canonical URL when switching to Ukrainian", async ({ page }) => {
  const route = "/businesses/ukraine/chaiky/mangal-i-kazan/";
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Mangal i Kazan" })).toBeVisible();
  await expect(page.getByText("Daily 10:00–20:00")).toBeVisible();
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  await page.goto(route + "?lang=uk", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Мангал і Казан" })).toBeVisible();
  await expect(page.getByText("Щодня 10:00–20:00")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical!);
  await expect(page.locator('[data-language-menu] a[lang="en"]')).toHaveAttribute("href", route);
});

test("Kons na Bis defaults to English and keeps original Ukrainian client copy", async ({ page }) => {
  const route = "/businesses/ukraine/bila-tserkva/kons-na-bis/";
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".catalog-concept h1")).toContainText("Kons na Bis");
  await expect(page.locator(".catalog-concept")).toContainText("Bila Tserkva");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto(route + "?lang=uk", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".catalog-concept h1")).toContainText("Конс на Бі$");
  await expect(page.locator(".catalog-concept")).toContainText("Біла Церква");
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});

test("Ukraine collection cards render translated services for both languages", async ({ page }) => {
  const route = "/businesses/ukraine/chaiky/";
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main .grid")).toContainText("TRIMMO II Barbershop");
  await expect(page.locator("main .grid")).toContainText("Men's haircut");
  await page.goto(route + "?lang=uk", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main .grid")).toContainText("TRIMMO II барбершоп");
  await expect(page.locator("main .grid")).toContainText("Чоловіча стрижка");
});

test("Ukraine collection and business FAQ translate beyond names and services", async ({ page }) => {
  await page.goto("/businesses/ukraine/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main.intl-collection h1")).toContainText("Selected Businesses in Ukraine");
  await page.goto("/businesses/ukraine/?lang=uk", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main.intl-collection h1")).toHaveText("Компанії України");
  await expect(page.locator("main.intl-collection .boundary")).toContainText("безкоштовні публічні профілі");
  await page.goto("/businesses/ukraine/chaiky/mangal-i-kazan/?lang=uk", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main .faq")).toContainText("Це офіційний профіль клієнта Hermes?");
  await expect(page.locator("main .faq")).toContainText("Чи може компанія підключити Hermes Connect?");
  await expect(page.locator('html')).toHaveAttribute("lang", "uk");
});

test("Chayka FAQ English SSR, JSON-LD and Ukrainian switch stay aligned", async ({ page }) => {
  const route = "/businesses/ukraine/chaiky/chayka-store/";
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const faq = page.locator(".catalog-concept .faq");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(faq).toContainText("Can I ask about phone repairs through this page?");
  await expect(faq).toContainText("Is this the official Chayka Store website?");
  await expect(faq).not.toContainText("Чи можна уточнити ремонт телефону");
  const schema = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ");
  expect(schema).toContain("Can I ask about phone repairs through this page?");
  expect(schema).not.toContain("Чи можна уточнити ремонт телефону");
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  await page.goto(route + "?lang=uk", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(faq).toContainText("Чи можна уточнити ремонт телефону через цю сторінку?");
  await expect(faq).toContainText("Це офіційний сайт Чайка Store?");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical!);
});

test("All Ukrainian Catalog profiles stay English-only by default", async ({ page }) => {
  const routes = [
    "/businesses/ukraine/chaiky/chayka-store/",
    "/businesses/ukraine/chaiky/mangal-i-kazan/",
    "/businesses/ukraine/chaiky/trimmo-ii/",
    "/businesses/ukraine/irpin/cvit-vyshni/",
    "/businesses/ukraine/bila-tserkva/kons-na-bis/",
  ];
  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const visible = await page.locator("main").innerText();
    expect(visible, route).not.toMatch(/[А-Яа-яІіЇїЄє]/);
  }
});
