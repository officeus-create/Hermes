import { expect, test } from "@playwright/test";

const news = "/insights/technology/i-am-vision/";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", route => {
    const url = new URL(route.request().url());
    return url.hostname === "127.0.0.1" ? route.continue() : route.abort();
  });
});

test("I am development is the official Technology news item, not a shadow Catalog profile", async ({page}) => {
  await page.goto("/insights/",{waitUntil:"domcontentloaded"});
  const tech=page.locator("#technology");
  await expect(tech.getByRole("heading",{name:/I am enters development/})).toBeVisible();
  await expect(tech.locator('a[href="/insights/technology/i-am-vision/"]')).toBeVisible();
  const featured=page.locator(".iam-news");
  await expect(featured).toBeVisible();
  await expect(featured.locator('svg[role="img"]')).toHaveCount(1);
  await expect(featured.locator('a[href="/businesses/"]')).toBeVisible();
  await expect(featured.locator('a[href="/services/hermes-connect/"]')).toBeVisible();
});

test("I am editorial is one indexable first-party NewsArticle and links only active stage owners",async({page}, testInfo)=>{
  await page.setViewportSize(testInfo.project.name === "desktop" ? {width:1440,height:1000} : {width:390,height:844});
  await page.goto(news,{waitUntil:"domcontentloaded"});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index,follow,max-image-preview:large");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/insights/technology/i-am-vision/");
  await expect(page.locator('head > title')).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading",{level:1})).toContainText("I am enters development");
  await expect(page.locator("main")).toContainText("Our 14-month development plan");
  await expect(page.locator("main")).toContainText("not a public offering of securities");
  await expect(page.locator('main a[href="/businesses/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/services/hermes-connect/"]').first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText("instant Tax Free refunds");
  await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="mailto:officeus@hermeslogisticsus.com"]')).toHaveCount(1);
  await expect(page.locator("main")).not.toContainText("Hermes is exploring conversations with technology partners");
  await expect(page.locator("main")).toContainText("conditional research topics");
  await expect(page.locator("main")).toContainText("This article does not open a partnership or investor inquiry process.");
  await expect(page.locator("main")).toContainText("This editorial announcement documents the proposed development journey and its current boundaries.");
  await expect(page.locator("main")).not.toContainText("start an exploratory email conversation");
  const structuredData=await page.locator('script[type="application/ld+json"]').allTextContents();
  const schemas=structuredData.flatMap(text=>{try{const s=JSON.parse(text);return Array.isArray(s)?s:[s]}catch{return []}});
  expect(schemas.some(obj=>obj["@type"]==="NewsArticle"&&obj.mainEntityOfPage==="https://hermeslogisticsus.com/insights/technology/i-am-vision/")).toBe(true);
  expect(schemas.some(obj=>obj["@type"]==="BreadcrumbList"&&obj.itemListElement?.some((item: {position?: number; item?: string})=>item.position===3&&item.item==="https://hermeslogisticsus.com/insights/technology/i-am-vision/"))).toBe(true);
  await page.screenshot({path:testInfo.outputPath("editorial-full-page.png"),fullPage:true});
  await page.locator("main section").last().scrollIntoViewIfNeeded();
  await page.screenshot({path:testInfo.outputPath("editorial-closing-footer.png")});
});

test("News enters RSS and one Insights sitemap owner, no listing as licensed service",async({page})=>{
 const rss=await page.request.get("/insights/rss.xml");
 expect(rss.ok()).toBe(true);
 expect(await rss.text()).toContain("https://hermeslogisticsus.com/insights/technology/i-am-vision/");
 const sitemap=await page.request.get("/sitemap-insights.xml");
 expect(sitemap.ok()).toBe(true);
 const xml=await sitemap.text();
 expect((xml.match(/https:\/\/hermeslogisticsus\.com\/insights\/technology\/i-am-vision\//g)||[]).length).toBe(1);
 const index=await page.request.get("/sitemapindex.xml");
 expect(index.ok()).toBe(true);
 const parent=(await index.text()).match(/<sitemap>[\s\S]*?<\/sitemap>/g)?.find(x=>x.includes("https://hermeslogisticsus.com/sitemap-insights.xml"));
 expect(parent).toContain("<lastmod>2026-10-08</lastmod>");
});

test("I am technology news and visual remain usable on mobile",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const path of ["/insights/",news]){
  await page.goto(path,{waitUntil:"domcontentloaded"});
  await expect(page.locator("main h1")).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow,path).toBeLessThanOrEqual(2);
 }
});
