import { expect, test } from "@playwright/test";

const concept = "/businesses/concepts/i-am/";
const note = "/insights/technology/i-am-vision/";

test("I am concept is honest, local-only, noindex, and links to its source-backed product note", async ({page}) => {
  await page.goto(concept, {waitUntil:"domcontentloaded"});
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", {level:1})).toContainText("Here. There. Everywhere.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/businesses/concepts/i-am/");
  await expect(page.getByText("I am is not yet an incorporated or licensed service", {exact:false})).toBeVisible();
  await expect(page.locator('a[href="/insights/technology/i-am-vision/"]').first()).toBeVisible();
  await expect(page.locator("img[src='/images/i-am-concept-globe.svg']")).toHaveCount(1);
  await expect(page.locator("#iam-result")).toContainText("No text is sent to Hermes or saved");
});

test("I am local intent simulator suggests a conditional workflow, not an actual transaction", async ({page}) => {
  await page.goto(concept, {waitUntil:"domcontentloaded"});
  await page.getByRole("textbox", {name:"What would you like to do?"}).fill("I want to buy clothes in Italy and learn about Tax Free");
  await page.getByRole("button", {name:"Create an example plan"}).click();
  await expect(page.locator("#iam-result")).toContainText("Italy · Tax Free guidance");
  await expect(page.locator("#iam-result")).toContainText("No payment, invoice, or tax refund is performed");
  await expect(page.locator("#iam-result")).toContainText("no AI call, account or data storage");
  await page.getByRole("button", {name:"Business formation"}).click();
  await page.getByRole("button", {name:"Create an example plan"}).click();
  await expect(page.locator("#iam-result")).toContainText("Cross-border business journey");
  await expect(page.locator("#iam-result")).toContainText("not available services");
});

test("I am has one canonical Technology development announcement, correct NewsArticle schema and no securities offer", async ({page}) => {
  await page.goto(note, {waitUntil:"domcontentloaded"});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hermeslogisticsus.com/insights/technology/i-am-vision/");
  await expect(page.getByRole("heading",{level:1})).toContainText("I am enters development");
  await expect(page.locator("main.iam-note")).toContainText("14-month");
  await expect(page.locator("main.iam-note")).toContainText("not a public offering of securities");
  await expect(page.getByRole("link",{name:"Official Italian Customs (ADM) OTELLO overview"})).toHaveAttribute("href", /adm\.gov\.it/);
  await expect(page.locator('a[href="/businesses/italy/"]').first()).toBeVisible();
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const jsonSchemas = schemas.flatMap(s => { try { const data=JSON.parse(s); return Array.isArray(data) ? data : [data]; } catch { return []; } });
  expect(jsonSchemas.some(x => x["@type"]==="NewsArticle" && x.mainEntityOfPage==="https://hermeslogisticsus.com/insights/technology/i-am-vision/")).toBeTruthy();
  expect(jsonSchemas.some(x => x["@type"]==="Organization" && x.name==="I am")).toBeFalsy();
});

test("I am investor concept and product note fit a 390px viewport", async ({page}) => {
  for (const path of [concept, note]) {
    await page.goto(path, {waitUntil:"domcontentloaded"});
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(horizontalOverflow, path).toBeLessThanOrEqual(2);
    await expect(page.locator("main h1")).toBeVisible();
  }
});


test("I am country-only wording does not incorrectly turn car rental into Tax Free", async ({page}) => {
  await page.goto(concept, {waitUntil: "domcontentloaded"});
  await page.getByRole("textbox", {name:"What would you like to do?"}).fill("I will visit Italy and need to rent a car");
  await page.getByRole("button", {name:"Create an example plan"}).click();
  await expect(page.locator("#iam-result [data-intent-module='travel']")).toHaveCount(1);
  await expect(page.locator("#iam-result [data-intent-module='tax-free']")).toHaveCount(0);
});

test("I am dynamically builds multiple example modules and temporary menu resets on reload", async ({page}) => {
  await page.goto(concept, {waitUntil: "domcontentloaded"});
  await page.getByRole("textbox", {name:"What would you like to do?"}).fill("I need Tax Free help after shopping and also want to rent a car");
  await page.getByRole("button", {name:"Create an example plan"}).click();
  const taxFree = page.locator("#iam-result [data-intent-module='tax-free']");
  const travel = page.locator("#iam-result [data-intent-module='travel']");
  await expect(taxFree).toBeVisible();
  await expect(travel).toBeVisible();
  await taxFree.getByRole("button",{name:"Pin this example"}).click();
  await travel.getByRole("button",{name:"Pin this example"}).click();
  await expect(page.locator("#iam-pinned [role='listitem']")).toHaveCount(2);
  await expect(page.locator("#iam-workspace")).toContainText("disappear on reload");
  await page.getByRole("button",{name:"Remove Travel & mobility journey"}).click();
  await expect(page.locator("#iam-pinned [role='listitem']")).toHaveCount(1);
  await page.reload({waitUntil:"domcontentloaded"});
  await expect(page.locator("#iam-workspace")).toBeHidden();
  await expect(page.locator("#iam-pinned [role='listitem']")).toHaveCount(0);
});

test("I am unknown intents display a truthful research gate, not a fabricated workflow", async ({page}) => {
  await page.goto(concept, {waitUntil: "domcontentloaded"});
  await page.getByRole("textbox", {name:"What would you like to do?"}).fill("I need a novel procedure for quantum licenses on the moon");
  await page.getByRole("button", {name:"Create an example plan"}).click();
  await expect(page.locator("#iam-result")).toContainText("No verified service category found");
  await expect(page.locator("#iam-result")).toContainText("does not invent a service");
  await expect(page.locator("#iam-result button[data-pin-module]")).toHaveCount(0);
});

test("Hermes Insights Technology includes I am as a standalone first-party development announcement", async ({page}) => {
  await page.goto("/insights/", {waitUntil:"domcontentloaded"});
  const section=page.locator("#technology");
  await expect(section.getByRole("heading",{name:/I am enters development/})).toBeVisible();
  await expect(section.locator('a[href="/insights/technology/i-am-vision/"]').first()).toBeVisible();
  const rss=await page.request.get("/insights/rss.xml");
  expect(rss.ok()).toBeTruthy();
  expect(await rss.text()).toContain("https://hermeslogisticsus.com/insights/technology/i-am-vision/");
  const sitemap=await page.request.get("/sitemap-insights.xml");
  expect(await sitemap.text()).toContain("https://hermeslogisticsus.com/insights/technology/i-am-vision/");
  const sitemapIndex=await page.request.get("/sitemapindex.xml");
  expect(await sitemapIndex.text()).toMatch(/sitemap-insights\\.xml<\\/loc>\\s*<lastmod>2026-10-08<\\/lastmod>/);
});
