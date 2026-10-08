import {expect,test} from "@playwright/test";

const catalog="/businesses/italy/";
const preview="/demos/hermes-connect/i-am-shopping/";
const news="/insights/";
const article="/insights/technology/i-am-vision/";
const key="iam-italy-shortlist-v1";

test("Insights feed renders first-party I am Italy visual feature with honest status",async ({page})=>{
  await page.goto(news,{waitUntil:"domcontentloaded"});
  const feature=page.locator(".iam-news");
  await expect(feature.getByRole("heading",{name:/I am: plan your Italy shopping before landing/})).toBeVisible();
  await expect(feature.locator('svg[role="img"]')).toHaveCount(1);
  await expect(feature.locator('a[href="/businesses/italy/"]')).toBeVisible();
  await expect(feature.locator('a[href="/demos/hermes-connect/i-am-shopping/"]')).toBeVisible();
  await expect(feature).toContainText("no affiliate codes");
  await expect(feature).toContainText("not a licensed operator");
});

test("Italy Catalog shows research candidates, not clients or active affiliate referrals",async ({page})=>{
  await page.goto(catalog,{waitUntil:"domcontentloaded"});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/businesses/italy/");
  await expect(page.getByRole("heading",{level:1})).toContainText("Shop Italy before you land");
  await expect(page.locator(".merchant[data-merchant-id]")).toHaveCount(4);
  await expect(page.locator("main")).toContainText("Public concept, not a claimed company");
  await expect(page.locator("main")).toContainText("No monetized links yet");
  await expect(page.locator('.merchant a[href="https://www.farfetch.com/it/"]')).toBeVisible();
  await expect(page.locator('.merchant a[href="https://www.yoox.com/it/affiliation/program"]')).toBeVisible();
  await expect(page.locator('a[href="/businesses/concepts/i-am/"]').first()).toBeVisible();
  await expect(page.locator("main")).toContainText("Airport pickup when departing");
});

test("I am shopping demo never places an order and offers official external links",async ({page})=>{
  await page.goto(preview,{waitUntil:"domcontentloaded"});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/demos/hermes-connect/i-am-shopping/");
  await expect(page.locator(".store-card[data-merchant-id]")).toHaveCount(4);
  await expect(page.locator(".store-card[data-merchant-id='yoox'] a[href='https://www.yoox.com/it/']")).toHaveCount(1);
  await expect(page.locator("main")).toContainText("no server order");
  await expect(page.locator("main")).toContainText("not a reservation");
  await expect(page.getByRole("heading",{name:/My Italy shortlist/})).toBeVisible();
  await expect(page.locator("#my-merchant-list .empty-state")).toBeVisible();
});

test("Shortlist stays temporary by default; optional device persistence and clear work",async ({page})=>{
  await page.goto(preview,{waitUntil:"domcontentloaded"});
  const farfetch=page.locator('.store-card[data-merchant-id="farfetch"]');
  await farfetch.getByRole("button",{name:/Add FARFETCH to shortlist/}).click();
  await expect(page.locator("#saved-count")).toHaveText("1");
  await expect(page.locator("#my-merchant-list")).toContainText("FARFETCH");
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(null);
  await page.reload({waitUntil:"domcontentloaded"});
  await expect(page.locator("#saved-count")).toHaveText("0");
  await page.locator('.store-card[data-merchant-id="farfetch"] [data-save-store]').click();
  await page.locator("#save-on-device").check();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)??"null"),key)).toEqual(["farfetch"]);
  await page.reload({waitUntil:"domcontentloaded"});
  await expect(page.locator("#save-on-device")).toBeChecked();
  await expect(page.locator("#my-merchant-list")).toContainText("FARFETCH");
  await page.getByRole("button",{name:/Clear shortlist and saved data/}).click();
  await expect(page.locator("#saved-count")).toHaveText("0");
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(null);
});

test("Airport departure filter never promises pickup on arrival",async ({page})=>{
  await page.goto(preview,{waitUntil:"domcontentloaded"});
  await page.getByRole("radio",{name:"Airport departure"}).check();
  await expect(page.locator('.store-card[data-merchant-id]:visible')).toHaveCount(1);
  await expect(page.locator('.store-card[data-merchant-id="milan-airports-boutique"]')).toBeVisible();
  await expect(page.locator("main")).toContainText("separate from shopping after arrival");
  await page.getByRole("radio",{name:"After arrival"}).check();
  await expect(page.locator('.store-card[data-merchant-id="milan-airports-boutique"]')).toBeHidden();
  await expect(page.locator('.store-card[data-merchant-id]:visible')).toHaveCount(3);
});

test("Italy preview and Insights visual fit responsive 390px browser",async ({page})=>{
  for(const route of [catalog,preview,news,article]){
    await page.setViewportSize({width:390,height:844});
    await page.goto(route,{waitUntil:"domcontentloaded"});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    expect(overflow,route).toBeLessThanOrEqual(2);
    await expect(page.locator("main h1")).toBeVisible();
  }
});


test("Hermes Catalog shows Italy incubated startup as distinct from verified business profiles",async ({page})=>{
  await page.goto("/businesses/",{waitUntil:"domcontentloaded"});
  const nav=page.getByRole("navigation",{name:"Incubation concepts by market"});
  const italy=nav.getByRole("link",{name:/Italy · I am travel startup concept/});
  await expect(italy).toHaveAttribute("href","/businesses/italy/");
  await expect(italy).toHaveAttribute("rel","nofollow");
  await italy.click();
  await expect(page).toHaveURL(/\/businesses\/italy\/$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex,nofollow");
});
