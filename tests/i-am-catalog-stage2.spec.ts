import {expect,test} from "@playwright/test";

const concept="/businesses/concepts/i-am/";
const italy="/businesses/italy/";

test("Catalog exposes I am Italy as an incubation website, not a verified company card",async({page})=>{
  await page.goto("/businesses/",{waitUntil:"domcontentloaded"});
  const nav=page.getByRole("navigation",{name:"Startup incubation concepts by market"});
  const link=nav.getByRole("link",{name:/Italy · I am startup website/});
  await expect(link).toHaveAttribute("href",italy);
  await expect(link).not.toHaveAttribute("rel","nofollow");
  await link.click();
  await expect(page).toHaveURL(/\/businesses\/italy\/$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex,nofollow");
  await expect(page.locator("main")).toContainText("Public concept, not a claimed company");
});

test("I am Italy site has real source links and no fake affiliate or app claims",async({page})=>{
  await page.goto(italy,{waitUntil:"domcontentloaded"});
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/businesses/italy/");
  await expect(page.getByRole("heading",{level:1})).toContainText("Your personal interface to Italy");
  await expect(page.locator(".merchant[data-merchant-id]")).toHaveCount(6);
  await expect(page.locator("main")).toContainText("No monetized links yet");
  await expect(page.locator("main")).toContainText("From one useful Italy journey to a global interface");
  await expect(page.locator("main")).toContainText("Revenue hypotheses · not current revenue");
  await expect(page.locator("main")).toContainText("An AI-native product can design the workflow before legacy complexity arrives");
  await expect(page.locator("main")).toContainText("What strategic capital would accelerate");
  await expect(page.locator("main")).toContainText("No financing amount, valuation, allocation percentage or return");
  await expect(page.locator("main")).toContainText("This presentation does not open a partnership or investor inquiry process.");
  await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="mailto:officeus@hermeslogisticsus.com"]')).toHaveCount(1);
  await expect(page.locator("main")).toContainText("Development has public provenance");
  await expect(page.locator('a[href="/insights/technology/i-am-vision/"]').first()).toBeVisible();
  await expect(page.locator("main")).toContainText("NOT PARTNERED");
  await expect(page.locator('a[href="https://www.farfetch.com/it/"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://www.yoox.com/it/affiliation/program"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://www.mytheresa.com/au/en/affiliates"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://www.rinascente.it/en/"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://www.adm.gov.it/portale/en/progetti-aida-otello"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://vatrefund.adm.gov.it/howto"]').first()).toBeVisible();
  await expect(page.locator('a[href="/insights/technology/i-am-vision/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/services/hermes-connect/"]:visible').first()).toBeVisible();
  await expect(page.locator('a[href="/demos/hermes-connect/i-am-shopping/"]')).toBeVisible();
});

test("Founder concept remains noindex and points to the official Insights announcement",async({page})=>{
  await page.goto(concept,{waitUntil:"domcontentloaded"});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/businesses/concepts/i-am/");
  await expect(page.locator("main")).toContainText("I am is not yet an incorporated or licensed service");
  await expect(page.locator('a[href="/insights/technology/i-am-vision/"]').first()).toBeVisible();
  await expect(page.locator('a[href="/demos/hermes-connect/i-am-shopping/"]')).toHaveCount(0);
});

test("I am Catalog Stage 2 fits a 390px viewport",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const path of ["/businesses/",concept,italy]){
    await page.goto(path,{waitUntil:"domcontentloaded"});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    expect(overflow,path).toBeLessThanOrEqual(2);
    await expect(page.locator("main h1").first()).toBeVisible();
  }
});


test("I am keeps one indexed owner in Insights while Catalog remains supporting noindex-nofollow",async({page})=>{
  await page.goto("/insights/technology/i-am-vision/",{waitUntil:"domcontentloaded"});
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","index,follow,max-image-preview:large");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/insights/technology/i-am-vision/");
  for(const path of [concept,italy]){
    await page.goto(path,{waitUntil:"domcontentloaded"});
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content","noindex,nofollow");
  }
});


test("live Insights visual links directly to the Stage 2 I am Italy website",async({page})=>{
  await page.goto("/insights/",{waitUntil:"domcontentloaded"});
  const feature=page.locator(".iam-news");
  await expect(feature.locator('a[href="/businesses/italy/"]')).toBeVisible();
  await page.goto("/insights/technology/i-am-vision/",{waitUntil:"domcontentloaded"});
  await expect(page.locator('main a[href="/businesses/italy/"]').first()).toBeVisible();
});


test("built Stage 2 readback is editorial, mobile-safe and sends or stores no visitor data",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const outboundData: string[] = [];
  const headerAccountGets: string[] = [];
  await page.route("**/*",route=>{
    const request=route.request();
    const url=new URL(request.url());
    // Existing SiteHeader session lookup is distinct from I am traffic.
    if(url.hostname==="127.0.0.1" && url.pathname==="/api/hermes-connect/account" && url.search==="" && request.method()==="GET"){
      headerAccountGets.push(url.pathname);
      return route.continue();
    }
    if(request.method()!=="GET" || request.resourceType()==="xhr" || request.resourceType()==="fetch" || /\/api\//.test(url.pathname)) {
      outboundData.push(request.method()+" "+url.pathname);
      return route.abort();
    }
    return url.hostname==="127.0.0.1" ? route.continue() : route.abort();
  });
  await page.addInitScript(()=>{
    const evidence={storageWrites:0,submits:0};
    Object.defineProperty(window,"__iamReadback",{value:evidence});
    const setItem=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){evidence.storageWrites++;return setItem.call(this,key,value);};
    document.addEventListener("submit",()=>{evidence.submits++;},true);
  });
  for(const path of [concept,italy,"/insights/technology/i-am-vision/"]){
    await page.goto(path,{waitUntil:"networkidle"});
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",path.startsWith("/businesses/")?"noindex,nofollow":"index,follow,max-image-preview:large");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com"+path);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator('footer a[href="mailto:officeus@hermeslogisticsus.com"]')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),path).toBeLessThanOrEqual(2);
    expect(await page.evaluate(()=>(window as unknown as {__iamReadback:{storageWrites:number;submits:number}}).__iamReadback)).toEqual({storageWrites:0,submits:0});
  }
  expect(outboundData).toEqual([]);
  expect(headerAccountGets.length).toBeLessThanOrEqual(3);
});

test("built Italy and Insights hero copy and visible CTAs stay inside their hero on desktop and 390px",async({page},testInfo)=>{
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:844});
    for(const [path,selector] of [[italy,".iam-italy-hero"],["/insights/technology/i-am-vision/",".iam-insights-hero"]]){
      await page.goto(path,{waitUntil:"networkidle"});
      const hero=page.locator(selector);
      await expect(hero).toBeVisible();
      const frame=await hero.boundingBox();
      expect(frame,path).not.toBeNull();
      expect(frame!.x,path).toBeGreaterThanOrEqual(0);
      expect(frame!.x+frame!.width,path).toBeLessThanOrEqual(width);
      const content=hero.locator("h1,.eyebrow,.lead,.dek,.truth,.status,.secondary-cta,a:visible");
      expect(await content.count()).toBeGreaterThanOrEqual(4);
      for(const element of await content.all()){
        await expect(element).toBeVisible();
        const box=await element.boundingBox();
        expect(box,path).not.toBeNull();
        expect(box!.x,path).toBeGreaterThanOrEqual(frame!.x-1);
        expect(box!.x+box!.width,path).toBeLessThanOrEqual(frame!.x+frame!.width+1);
        expect(box!.y,path).toBeGreaterThanOrEqual(frame!.y-1);
        expect(box!.y+box!.height,path).toBeLessThanOrEqual(frame!.y+frame!.height+1);
      }
      await page.screenshot({path:testInfo.outputPath("hero-"+width+"-"+(path===italy?"italy":"insights")+".png"),fullPage:true});
    }
  }
});


test("I am surfaces share one development path and forward-horizon framing",async({page})=>{
  for(const [path,activeLabel] of [
    ["/insights/technology/i-am-vision/","Vision"],
    [italy,"Italy"],
    [concept,"Founder concept"],
  ] as const){
    await page.goto(path,{waitUntil:"domcontentloaded"});
    const nav=page.getByRole("navigation",{name:"I am development path"});
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link",{name:"Vision"})).toHaveAttribute("href","/insights/technology/i-am-vision/");
    await expect(nav.getByRole("link",{name:"Italy"})).toHaveAttribute("href","/businesses/italy/");
    await expect(nav.getByRole("link",{name:"Founder concept"})).toHaveAttribute("href","/businesses/concepts/i-am/");
    await expect(nav.getByRole("link",{name:"Build foundation"})).toHaveAttribute("href","/services/hermes-connect/");
    await expect(nav.getByRole("link",{name:activeLabel})).toHaveAttribute("aria-current","page");
  }
  await page.goto("/insights/technology/i-am-vision/",{waitUntil:"domcontentloaded"});
  await expect(page.locator("main")).toContainText("Our 14-month forward design horizon");
  await page.goto("/insights/",{waitUntil:"domcontentloaded"});
  await expect(page.locator(".iam-news")).toContainText("14-month forward design horizon");
});
