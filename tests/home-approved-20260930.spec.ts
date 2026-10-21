import { expect, test, type Locator, type Page } from "@playwright/test";

const homeFlows = {
 logistics: ["Request", "Route fit", "Human review", "Handoff"],
 marketing: ["Content + news", "Search + social", "Website action", "CRM evidence"],
 technology: ["Hermes Connect", "Website Factory", "Social connectors", "QA readback"],
 academy: ["Task", "Practice", "Feedback", "Next level"],
} as const;

// CI Chromium can stop rAF after history restoration while the focused document,
// DOM layout and native input remain available. Preserve pointer/actionability
// coverage with explicit checks rather than a forced click or an rAF-based wait.
async function clickHistoryTarget(page: Page, target: Locator) {
 await expect(target).toBeVisible();
 await expect(target).toBeEnabled();
 const first=await target.boundingBox();
 expect(first).not.toBeNull();
 await page.waitForTimeout(100);
 expect(await target.boundingBox()).toEqual(first);
 const x=first!.x+first!.width/2,y=first!.y+first!.height/2;
 const viewport=page.viewportSize()!;
 expect(x).toBeGreaterThanOrEqual(0);expect(x).toBeLessThan(viewport.width);
 expect(y).toBeGreaterThanOrEqual(0);expect(y).toBeLessThan(viewport.height);
 // Browser history may restore stable boxes before hit testing is ready.
 // Poll the real pointer receiver; never force a click or relax the assertion.
 await expect.poll(async()=>{
  const hitState=await target.evaluate((node,{x,y})=>{
   const hit=document.elementFromPoint(x,y);
   return {receivesPointer:hit===node||node.contains(hit),target:node.outerHTML.slice(0,500),
    hit:hit?.outerHTML.slice(0,500),x,y,scrollX,scrollY,innerWidth,innerHeight};
  },{x,y});
  if(!hitState.receivesPointer) console.log("HOME_HISTORY_HIT_TARGET",JSON.stringify(hitState));
  return hitState.receivesPointer;
 },{timeout:5000,intervals:[100,250,500],message:"History-restored control must receive pointer input"}).toBe(true);
 await page.mouse.click(x,y);
}

for (const width of [390, 430, 768, 1024, 1440]) {
 test(`approved Home has readable native portals and navigation at ${width}px`, async ({page}) => {
  await page.setViewportSize({width,height:1000});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Four directions.'})).toBeVisible();
  const routes=page.locator('[data-home-route]');
  await expect(routes).toHaveCount(4);
  for(const route of await routes.all()) {
   await expect(route).toBeVisible();
   expect(await route.evaluate(n=>{
    const title=n.querySelector('strong')!.getBoundingClientRect();const arrow=n.querySelector('.home-master-route-arrow')!.getBoundingClientRect();
    return title.left<arrow.right&&title.right>arrow.left&&title.top<arrow.bottom&&title.bottom>arrow.top;
   })).toBe(false);
   const routeId=await route.getAttribute('data-route-id');
   // Logistics owns one coherent local scene. The Golden Scene source-lock
   // test owns cinematic/fallback provenance and prevents split truck layers.
   const image=routeId==='logistics'
    ? route.locator('[data-home-logistics-scene-image]')
    : route.locator('.home-portal-art img');
   if(routeId==='marketing') {
    // Living Marketing replaces the hidden legacy CSS cards with a real local documentary clip.
    await expect(image).toHaveCount(1);
    await expect(image).toBeVisible();
    await expect(route.locator('[data-home-marketing-cinematic]')).toHaveCount(1);
    await expect(route.locator('[data-home-marketing-video]')).toHaveCount(1);
    await expect(route.locator('[data-home-marketing-journey]')).toBeHidden();
    await expect(image).toHaveAttribute('src','/media/home/marketing-team-poster.jpg');
    await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    continue;
   }
   await expect(image).toHaveCount(1);
   await expect(image).toBeVisible();
   await image.evaluate(node=>(node as HTMLImageElement).decode());
   await expect.poll(()=>image.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
   expect(await image.evaluate(node=>(node as HTMLImageElement).currentSrc)).toMatch(/(?:\/images\/logistics-living\/[a-z-]+-(?:512|887)\.webp|\/media\/home\/(?:technology|academy)-claude-v3-poster\.jpg)$/);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  if(width<1181){
   await page.getByRole('button',{name:'Open navigation'}).click();
   await expect(page.locator('#mobile-menu')).toBeVisible();
   await expect(page.locator('#mobile-menu [data-hermes-sign-in]')).toHaveAttribute('href','/services/hermes-connect/access/');
   await page.keyboard.press('Escape');
   await expect(page.getByRole('button',{name:'Open navigation'})).toBeFocused();
  } else {
   const cta=page.locator('.header-cta');
   const box=await cta.boundingBox();
   expect(box!.height).toBeGreaterThanOrEqual(44);
   expect(box!.width).toBeLessThanOrEqual(125);
   await expect(page.locator('.header-actions .hc-account-menu')).toHaveCount(1);
  }
  const nav=width<1181?page.locator('#mobile-menu'):page.locator('.desktop-nav');
  const products=nav.locator('[data-hermes-products]');
  await expect(products).toHaveCount(1);
  await expect(products.locator('a[data-product]')).toHaveCount(4);
  await expect(products.locator('a[data-product="connect"]')).toHaveAttribute('href','/services/hermes-connect/');
  await expect(products.locator('a[data-product="catalog"]')).toHaveAttribute('href','/businesses/');
  await expect(products.locator('a[data-product="insights"]')).toHaveAttribute('href','/insights/');
  await expect(products.locator('a[data-product="opportunities"]')).toHaveAttribute('href','/opportunities/');
 });
}

test('approved portal keyboard routing, back and forward preserve Home',async({page})=>{
 await page.goto('/');
 const route=page.locator('[data-route-id="academy"]');
 await route.focus();
 expect(await route.evaluate(n=>getComputedStyle(n).outlineStyle)).toBe('solid');
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/paths\/academy\//);
 await page.goBack();
 await expect(page.getByRole('heading',{name:'Four directions.'})).toBeVisible();
 await page.goForward();
 await expect(page).toHaveURL(/\/paths\/academy\//);
});

test('approved portals stay usable without JavaScript and honor reduced motion',async({browser},testInfo)=>{
 const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce',baseURL:testInfo.project.use.baseURL});
 const page=await context.newPage();
 await page.goto('/');
 await expect(page.getByRole('navigation',{name:'Hermes operating directions'})).toBeVisible();
 const explainers=page.locator('[data-home-explainer]');
 await expect(explainers).toHaveCount(4);
 for (const [direction, labels] of Object.entries(homeFlows)) {
  const explainer=page.locator(`[data-home-explainer="${direction}"]`);
  for (const label of labels) await expect(explainer).toContainText(label);
  if(direction==='marketing') {
   await expect(page.locator('[data-home-marketing-journey]')).toBeHidden();
   await expect(page.locator('[data-home-marketing-cinematic] img')).toBeVisible();
   await expect(page.locator('[data-home-marketing-video] source')).not.toHaveAttribute('src',/.+/);
   await expect(explainer).toHaveCSS('display','none'); // pure scene, no overlaid workflow
  } else if(direction==='logistics') {
   await expect(page.locator('[data-home-logistics-scene-image]')).toBeVisible();
   await expect(explainer).toHaveCSS('display','none'); // cinematic field stays free of HUD
  } else {
   await expect(explainer).toHaveCSS('opacity','1');
  }
 }
 expect(await page.locator('.home-portal-art img').first().evaluate(n=>getComputedStyle(n).transitionDuration)).toBe('0s');
 await page.locator('[data-route-id="marketing"]').click();
 await expect(page).toHaveURL(/\/paths\/marketing\//);
 await context.close();
});

test('Home opens the existing Connect and sign-in flows, then returns with browser history',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('#mobile-menu [data-hermes-products] > summary').click();
 await page.locator('#mobile-menu a[data-product="connect"]').click();
 await expect(page).toHaveURL(/\/services\/hermes-connect\/$/);
 await expect(page.locator('#hc-title')).toBeVisible();
 await page.waitForLoadState('load');
 await page.goBack();
 await page.bringToFront();
 await page.waitForLoadState('load');
 await expect(page.getByRole('heading',{name:'Four directions.'})).toBeVisible();
 const historyState = await page.evaluate(async()=>{
  const button=document.querySelector('[data-menu-button]')!;
  const first=button.getBoundingClientRect().toJSON();
  const frame=await Promise.race([new Promise<boolean>(resolve=>requestAnimationFrame(()=>resolve(true))),new Promise<boolean>(resolve=>setTimeout(()=>resolve(false),1000))]);
  return {visibility:document.visibilityState,focused:document.hasFocus(),frame,first,last:button.getBoundingClientRect().toJSON(),animations:button.getAnimations().length};
 });
 console.log('HOME_HISTORY_RENDER_STATE',JSON.stringify(historyState));
 await clickHistoryTarget(page,page.getByRole('button',{name:'Open navigation'}));
 await expect(page.getByRole('button',{name:'Close navigation'})).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#mobile-menu')).toBeVisible();
 await clickHistoryTarget(page,page.locator('#mobile-menu [data-hermes-sign-in]'));
 await expect(page).toHaveURL(/\/services\/hermes-connect\/access\/$/);
 await page.waitForLoadState('load');
 await page.goBack();
 await page.bringToFront();
 await page.waitForLoadState('load');
 await expect(page.getByRole('heading',{name:'Four directions.'})).toBeVisible();
});

test('compact Home CTA reaches native contact actions and approved artwork loads once',async({page})=>{
 const artwork:string[]=[];
 page.on('request',r=>{if(/\/media\/home\/(?:technology|academy)-claude-v3-poster\.jpg/.test(r.url()))artwork.push(r.url())});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await page.locator('.header-cta').click();
 await expect(page).toHaveURL(/\/#contact$/);
 await expect(page.getByRole('heading',{name:'Not sure which direction fits?'})).toBeInViewport();
 await expect(page.getByRole('navigation',{name:'Contact Hermes by direction'})).toBeVisible();
 await expect(page.locator('[data-home-primary-contact]')).toHaveAttribute('href','/contacts/');
 await expect(page.locator('[data-home-contact-fallback]')).toHaveAttribute('href','mailto:officeus@hermeslogisticsus.com');
 await page.getByRole('link',{name:'Explore Hermes Connect',exact:true}).click();
 await expect(page).toHaveURL(/\/services\/hermes-connect\/$/);
 // Only the two new local film posters are requested, without redundant image sources.
 expect(artwork.length).toBeGreaterThanOrEqual(2);
 expect(artwork.every(url=>/claude-v3-poster\.jpg/.test(url))).toBe(true);
 expect(new Set(artwork).size).toBe(artwork.length);
});

test('Home Logistics displays one integrated truck scene without a duplicate floating subject',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 const route=page.locator('[data-route-id="logistics"]');
 await expect(route.locator('[data-home-logistics-scene-image]')).toBeVisible();
 await expect(route.locator('[data-home-motion="truck"]')).toHaveCount(0);
 await expect(route.locator('.home-moving-truck')).toHaveCount(0);
 await expect(route.locator('img[src="/images/home-20261001/truck.webp"]')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(route.locator('[data-home-logistics-scene-image]')).toBeVisible();
});

test('all four Home directions keep accessible workflows behind quiet visual portals on touch',async({browser,page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 const hoverCapable=await page.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches);
 for (const [direction, labels] of Object.entries(homeFlows)) {
  const route=page.locator(`[data-route-id="${direction}"]`);
  const explainer=route.locator(`[data-home-explainer="${direction}"]`);
  if(hoverCapable) {
   await expect(explainer).toHaveCSS('opacity','0');
   await route.hover();
  }
  if(direction==='marketing') {
   await expect(explainer).toHaveCSS('display','none');
   await expect(route.locator('[data-home-marketing-cinematic]')).toBeVisible();
   await expect(route.locator('[data-home-marketing-journey]')).toBeHidden();
  } else if(direction==='logistics') {
   await expect(explainer).toHaveCSS('display','none');
   await expect(route.locator('[data-home-logistics-scene-image]')).toBeVisible();
   await expect(route.locator('.home-road-flow')).toHaveCount(0);
  } else {
   // Claude Home v3 uses real art, not tiny demo dashboards over the portal.
   await expect(explainer).toHaveCSS('display','none');
   await expect(route.locator('.home-portal-art img')).toBeVisible();
   await expect(route.locator('[data-home-pillar-proof]')).toBeHidden();
  }
  const accessibleName=(await route.getAttribute('aria-label')||'').toLowerCase();
  expect(accessibleName).toContain('example flow:');
  for(const label of labels) expect(accessibleName).toContain(label.toLowerCase());
 }

 const touch=await browser.newContext({baseURL:testInfo.project.use.baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
 const mobile=await touch.newPage();
 await mobile.goto('/');
 for (const [direction, labels] of Object.entries(homeFlows)) {
  const mobileExplainer=mobile.locator(`[data-home-explainer="${direction}"]`);
  if(direction==='marketing') {
   await expect(mobileExplainer).toHaveCSS('display','none');
   await expect(mobile.locator('[data-home-marketing-cinematic]')).toBeVisible();
   await expect(mobile.locator('[data-home-marketing-journey]')).toBeHidden();
  } else if(direction==='logistics') {
   await expect(mobileExplainer).toHaveCSS('display','none');
   await expect(mobile.locator('[data-home-logistics-scene-image]')).toBeVisible();
  } else {
   await expect(mobileExplainer).toHaveCSS('display','none');
   const route=mobile.locator(`[data-route-id="${direction}"]`);
   await expect(route.locator('.home-portal-art img')).toBeVisible();
   await expect(route.locator('[data-home-pillar-proof]')).toBeHidden();
   await expect(route.locator('.home-master-route-copy strong')).toBeVisible();
  }
  for (const label of labels) await expect(mobileExplainer).toContainText(label);
 }
 const visibleTitleSizes=await mobile.locator('.home-master-route-copy strong').evaluateAll(nodes=>nodes.map(node=>parseFloat(getComputedStyle(node).fontSize)));
 expect(Math.min(...visibleTitleSizes)).toBeGreaterThanOrEqual(20);
 expect(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await touch.close();
});


test('Home Logistics keeps a camera-locked mobile environment across weather states',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const route=page.locator('[data-route-id="logistics"]');
 const scene=page.locator('[data-home-logistics-scene-image]');
 const echo=page.locator('[data-home-logistics-echo]');
 await route.scrollIntoViewIfNeeded();
 await expect(scene).toHaveCSS('animation-name','none');
 await expect(scene).toHaveCSS('transform','none');
 await expect(echo).toHaveAttribute('data-logistics-echo-motion','running');
 await expect(route.locator('[data-home-motion="truck"]')).toHaveCount(0);
 // Sample the weather style synchronously: the 5.2s scene timer can otherwise
 // switch equipment during a multi-second Playwright style poll.
 const rainStyle=await echo.evaluate(node=>{
   node.setAttribute('data-logistics-weather-state','rain');
   const weather=node.querySelector('.home-logistics-weather')!;
   return {animation:getComputedStyle(weather).animationName,transform:getComputedStyle(weather).transform};
 });
 expect(rainStyle.animation).toBe('home-logistics-rain');
 expect(rainStyle.transform).toBe('none');
 await echo.evaluate(node=>node.setAttribute('data-logistics-weather-state','sun'));
 await page.evaluate(()=>document.fonts.ready);
 const before=await route.boundingBox();
 expect(before).not.toBeNull();
 await expect(scene).toHaveAttribute('data-logistics-scene-ready','car-hauler');
 const after=await route.boundingBox();
 expect(after).not.toBeNull();
 expect(Math.abs(after!.width-before!.width)).toBeLessThanOrEqual(1);
 expect(Math.abs(after!.height-before!.height)).toBeLessThanOrEqual(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});

test('Home Logistics carries six owned equipment and weather states without changing the route',async({browser,page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 const echo=page.locator('[data-home-logistics-echo]');
 const scene=page.locator('[data-home-logistics-scene-image]');
 await expect(echo).toHaveCount(1);
 await expect(echo).toHaveAttribute('data-logistics-echo-count','6');
 await expect(echo).toHaveAttribute('data-logistics-echo-scenes','car-hauler,dry-van,reefer,flatbed,step-deck,hotshot');
 await expect(scene).toHaveAttribute('src','/images/logistics-living/car-hauler-512.webp');
 await expect(scene).toHaveAttribute('srcset',/car-hauler-887\.webp 887w/);
 await expect(scene).toHaveAttribute('data-logistics-scene-ready','car-hauler');
 const decoded=await page.evaluate(async()=>{
  const names=['car-hauler','dry-van','reefer','flatbed','step-deck','hotshot'];
  return Promise.all(names.map(async(name)=>{
   const image=new Image();
   image.srcset=`/images/logistics-living/${name}-512.webp 512w, /images/logistics-living/${name}-887.webp 887w`;
   image.src=`/images/logistics-living/${name}-512.webp`;
   await image.decode();
   return image.naturalWidth>0&&image.naturalHeight>0;
  }));
 });
 expect(decoded.every(Boolean)).toBe(true);
 await expect(page.locator('[data-route-id="logistics"]')).toHaveAttribute('href','/paths/logistics/');
 await page.locator('#paths').scrollIntoViewIfNeeded();
 await expect(echo).toHaveAttribute('data-logistics-echo-motion','running');
 await expect(echo).toHaveAttribute('data-logistics-equipment-cycle-ms','15600');
 await expect(echo).toHaveAttribute('data-logistics-weather-cycle-ms','5200');
 const settledScene=await scene.getAttribute('data-logistics-scene-ready');
 expect(['car-hauler','dry-van','reefer','flatbed','step-deck','hotshot']).toContain(settledScene);
 expect(settledScene).toBe(await echo.getAttribute('data-logistics-echo-scene'));
 expect(await scene.evaluate(node=>{const image=node as HTMLImageElement;return image.complete&&image.naturalWidth>0&&getComputedStyle(image).visibility!=='hidden';})).toBe(true);

 const reduced=await browser.newContext({baseURL:testInfo.project.use.baseURL,viewport:{width:390,height:844},reducedMotion:'reduce'});
 const mobile=await reduced.newPage();
 await mobile.goto('/');
 const reducedEcho=mobile.locator('[data-home-logistics-echo]');
 await expect(reducedEcho).toHaveAttribute('data-logistics-echo-scene','car-hauler');
 await expect(reducedEcho).toHaveAttribute('data-logistics-echo-motion','reduced');
 expect(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await reduced.close();
});

test('Home uses a quiet corporate shell and purposeful direction scenes',async({browser,page},testInfo)=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await expect(page.locator('.home-master')).toHaveCSS('background-color','rgb(247, 246, 243)');
 await expect(page.locator('[data-home-pillar-proof="attention"]')).toHaveCount(1);
 await expect(page.locator('[data-home-explainer="marketing"]')).toContainText('Content + news');
 await expect(page.locator('[data-home-explainer="marketing"]')).toContainText('Search + social');
 await expect(page.locator('[data-home-explainer="marketing"]')).toContainText('CRM evidence');
 await expect(page.locator('.home-marketing-channels')).toContainText('Threads');
 await expect(page.locator('.home-marketing-channels')).toContainText('IG');
 await expect(page.locator('.home-marketing-channels')).toContainText('FB');
 await expect(page.locator('.home-marketing-channels')).toContainText('TG');
 const technologyProof=page.locator('[data-home-pillar-proof="systems"]');
 await expect(technologyProof).toHaveCount(1);
 await expect(technologyProof).toContainText('REAL PRODUCT UI');
 await expect(technologyProof).toContainText('HERMES CONNECT');
 await expect(technologyProof).toContainText('SHOP OWNER WORKSPACE');
 await expect(technologyProof).toContainText('WEBSITE DELIVERY');
 await expect(technologyProof).toContainText('SEMANTIC BUILD');
 await expect(technologyProof).toContainText('SOCIAL STUDIO');
 await expect(technologyProof).toContainText('OWNER AUTHORIZATION');
 await expect(technologyProof).toContainText('QA + READBACK');
 await expect(technologyProof).toContainText('RELEASE EVIDENCE');
 await expect(page.locator('[data-home-explainer="technology"]')).toContainText('QA readback');
 const academyProof=page.locator('[data-home-pillar-proof="progress"]');
 await expect(academyProof).toContainText('TASK');
 await expect(academyProof).toContainText('PRACTICE');
 await expect(academyProof).toContainText('FEEDBACK');
 await expect(academyProof).toContainText('NEXT STEP');
 await expect(page.locator('.home-academy-book-page')).toHaveCount(0);
 await expect(page.locator('.home-academy-leaf-shadow')).toHaveCount(1);
 await expect(page.locator('.home-academy-sunlight')).toHaveCount(1);
 await expect(technologyProof).toHaveAttribute('data-home-living-motion','');
 await expect(academyProof).toHaveAttribute('data-home-living-motion','');

 const mobileContext=await browser.newContext({baseURL:testInfo.project.use.baseURL,viewport:{width:390,height:844},reducedMotion:'reduce'});
 const mobile=await mobileContext.newPage();
 await mobile.goto('/');
 const columns=await mobile.locator('.home-master-stage').evaluate(node=>getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length);
 expect(columns).toBe(1);
 const boxes=await mobile.locator('[data-home-route]').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().toJSON()));
 expect(boxes).toHaveLength(4);
 for(let index=1;index<boxes.length;index++) expect(boxes[index].top).toBeGreaterThan(boxes[index-1].bottom);
 expect(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await mobileContext.close();
});

// Owner-led Marketing transition from decorative cards to one actual working-team movie.
test('Marketing documentary scene plays only in viewport and stays still when scrolled away',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 const scene=page.locator('[data-home-marketing-cinematic]');
 const video=scene.locator('video');
 await scene.scrollIntoViewIfNeeded();
 await expect.poll(()=>scene.getAttribute('data-media-state')).toBe('ready');
 await page.locator('footer').scrollIntoViewIfNeeded();
 await expect.poll(()=>scene.getAttribute('data-media-state')).toBe('poster');
 expect(await video.evaluate(n=>(n as HTMLVideoElement).paused)).toBe(true);
 await scene.scrollIntoViewIfNeeded();
 await expect.poll(()=>scene.getAttribute('data-media-state')).toBe('ready');
});

test('Marketing documentary scene honors live reduced-motion changes and never fakes motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const scene=page.locator('[data-home-marketing-cinematic]');
 const video=scene.locator('video');
 await scene.scrollIntoViewIfNeeded();
 await expect(scene.locator('source')).not.toHaveAttribute('src',/.+/);
 await expect(scene.locator('img')).toBeVisible();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect.poll(()=>scene.getAttribute('data-media-state')).toBe('ready');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>scene.getAttribute('data-media-state')).toBe('poster');
 await expect(video).toBeHidden();
 expect(await video.evaluate(n=>(n as HTMLVideoElement).paused)).toBe(true);
});
