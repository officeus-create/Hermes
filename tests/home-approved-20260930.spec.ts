import { expect, test, type Locator, type Page } from "@playwright/test";

const homeFlows = {
 logistics: ["Request", "Route fit", "Human review", "Handoff"],
 marketing: ["Content", "Search + social", "Site action", "Inquiry"],
 technology: ["Request", "CRM context", "Automation", "Receipt"],
 academy: ["Lesson", "Practice", "Review", "Progression"],
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
 expect(await target.evaluate((node,{x,y})=>{
  const hit=document.elementFromPoint(x,y);return hit===node||node.contains(hit);
 },{x,y})).toBe(true);
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
   const image=route.locator('.home-portal-art img');
   await expect(image).toBeVisible();
   await image.evaluate(node=>(node as HTMLImageElement).decode());
   await expect.poll(()=>image.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
   expect(await image.evaluate(node=>(node as HTMLImageElement).currentSrc)).toMatch(/\/images\/(?:home-20261001\/\w+-(512|887)\.(avif|webp)|logistics-living\/[a-z-]+-(512|887)\.webp)$/);
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
  expect(await nav.locator('a').evaluateAll(nodes=>nodes.findIndex(n=>n.textContent?.trim()==='Connect')<nodes.findIndex(n=>n.textContent?.trim()==='Catalog'))).toBe(true);
  await expect(nav.getByRole('link',{name:'Connect',exact:true,includeHidden:true})).toHaveAttribute('href','/services/hermes-connect/');
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
  await expect(explainer).toHaveCSS('opacity','1');
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
 await page.locator('#mobile-menu').getByRole('link',{name:'Connect',exact:true}).click();
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
 page.on('request',r=>{if(r.url().includes('/images/home-20261001/'))artwork.push(r.url())});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await page.locator('.header-cta').click();
 await expect(page).toHaveURL(/\/#contact$/);
 await expect(page.getByRole('heading',{name:'Let’s build your next step.'})).toBeInViewport();
 await expect(page.getByRole('group',{name:'Hermes contact options'})).toBeVisible();
 await expect(page.locator('[data-home-primary-contact]')).toHaveAttribute('href','/contacts/');
 await expect(page.locator('[data-home-contact-fallback]')).toHaveAttribute('href','mailto:officeus@hermeslogisticsus.com');
 await page.getByRole('link',{name:'Explore Hermes Connect',exact:true}).click();
 await expect(page).toHaveURL(/\/services\/hermes-connect\/$/);
 expect(artwork.length).toBeGreaterThanOrEqual(5);
 expect(new Set(artwork).size).toBe(artwork.length);
});

test('all four Home directions explain a causal workflow and remain static on touch',async({browser,page},testInfo)=>{
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
  await expect(explainer).toHaveCSS('opacity','1');
  for(const id of ['event','system','human','outcome']) {
   await expect(explainer.locator(`[data-live-step="${id}"]`)).toHaveCSS('opacity','1');
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
  await expect(mobileExplainer).toHaveCSS('opacity','1');
  for (const label of labels) await expect(mobileExplainer).toContainText(label);
  const labelSizes=await mobileExplainer.locator('[data-live-step] em').evaluateAll(nodes=>nodes.map(node=>parseFloat(getComputedStyle(node).fontSize)));
  expect(Math.min(...labelSizes)).toBeGreaterThanOrEqual(10);
 }
 const academyTrackSizes=await mobile.locator('[data-home-pillar-proof="progress"] .home-academy-track i').evaluateAll(nodes=>nodes.map(node=>parseFloat(getComputedStyle(node).fontSize)));
 expect(Math.min(...academyTrackSizes)).toBeGreaterThanOrEqual(9.5);
 expect(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await touch.close();
});

test('Home Logistics carries six owned equipment and weather states without changing the route',async({browser,page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 const echo=page.locator('[data-home-logistics-echo]');
 const scenes=page.locator('[data-home-logistics-scene-image]');
 const weatherLayers=page.locator('[data-home-logistics-weather-layer]');
 const activeScene=page.locator('[data-home-logistics-scene-image][data-logistics-layer-state="active"]');
 await expect(echo).toHaveCount(1);
 await expect(scenes).toHaveCount(2);
 await expect(weatherLayers).toHaveCount(2);
 await expect(echo).toHaveAttribute('data-logistics-echo-count','6');
 await expect(echo).toHaveAttribute('data-logistics-echo-scenes','car-hauler,dry-van,reefer,flatbed,step-deck,hotshot');
 await expect(activeScene).toHaveCount(1);
 await expect(activeScene).toHaveAttribute('src','/images/logistics-living/car-hauler-512.webp');
 await expect(activeScene).toHaveAttribute('srcset',/car-hauler-887\.webp 887w/);
 await expect(activeScene).toHaveAttribute('data-logistics-scene-ready','car-hauler');
 const transitionMs=await scenes.first().evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration)*1000);
 expect(transitionMs).toBeGreaterThanOrEqual(700);
 expect(transitionMs).toBeLessThanOrEqual(800);
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
 const geometryBefore=await scenes.first().boundingBox();
 expect(geometryBefore).not.toBeNull();
 await expect(echo).toHaveAttribute('data-logistics-echo-motion','running');
 await expect.poll(async()=>activeScene.getAttribute('data-logistics-scene-ready'),{timeout:7000,intervals:[50]}).not.toBe('car-hauler');
 await page.waitForTimeout(80);
 const transitioning=await scenes.evaluateAll(nodes=>nodes.map(node=>parseFloat(getComputedStyle(node).opacity)));
 const weatherTransitioning=await weatherLayers.evaluateAll(nodes=>nodes.map(node=>parseFloat(getComputedStyle(node).opacity)));
 expect(transitioning.every(value=>value>0&&value<1)).toBe(true);
 expect(transitioning.reduce((sum,value)=>sum+value,0)).toBeGreaterThan(0.9);
 expect(weatherTransitioning.every(value=>value>0&&value<1)).toBe(true);
 expect(weatherTransitioning.reduce((sum,value)=>sum+value,0)).toBeGreaterThan(0.9);
 await page.waitForTimeout(800);
 const geometryAfter=await scenes.first().boundingBox();
 expect(geometryAfter).not.toBeNull();
 expect(geometryAfter!.width).toBeCloseTo(geometryBefore!.width,1);
 expect(geometryAfter!.height).toBeCloseTo(geometryBefore!.height,1);
 const settledScene=await activeScene.getAttribute('data-logistics-scene-ready');
 const settledWeather=await page.locator('[data-home-logistics-weather-layer][data-logistics-layer-state="active"]').getAttribute('data-logistics-echo-scene');
 const echoedScene=await echo.getAttribute('data-logistics-echo-scene');
 expect(settledScene).toBe(echoedScene);
 expect(settledWeather).toBe(echoedScene);
 await expect(activeScene).toHaveCSS('opacity','1');
 await expect(page.locator('[data-home-logistics-scene-image][data-logistics-layer-state="idle"]')).toHaveCSS('opacity','0');
 expect(await activeScene.evaluate(node=>{const image=node as HTMLImageElement;return image.complete&&image.naturalWidth>0&&getComputedStyle(image).visibility!=='hidden';})).toBe(true);

 const reduced=await browser.newContext({baseURL:testInfo.project.use.baseURL,viewport:{width:390,height:844},reducedMotion:'reduce'});
 const mobile=await reduced.newPage();
 await mobile.goto('/');
 const reducedEcho=mobile.locator('[data-home-logistics-echo]');
 const reducedActive=mobile.locator('[data-home-logistics-scene-image][data-logistics-layer-state="active"]');
 await expect(reducedEcho).toHaveAttribute('data-logistics-echo-scene','car-hauler');
 await expect(reducedEcho).toHaveAttribute('data-logistics-echo-motion','reduced');
 await expect(reducedActive).toHaveAttribute('data-logistics-scene-ready','car-hauler');
 await expect(reducedActive).toHaveCSS('transition-duration','0s');
 expect(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await reduced.close();
});

test('Home dusk Logistics polish keeps Hotshot readable without flattening the scene',async({page})=>{
 await page.goto('/');
 const activeWeather=page.locator('[data-home-logistics-weather-layer][data-logistics-layer-state="active"]');
 const activeScene=page.locator('[data-home-logistics-scene-image][data-logistics-layer-state="active"]');
 await activeWeather.evaluate(node=>node.setAttribute('data-logistics-echo-scene','hotshot'));
 await activeScene.evaluate(node=>node.setAttribute('data-logistics-scene-ready','hotshot'));
 await expect(activeWeather.locator('.home-logistics-weather')).toHaveCSS('opacity','0.58');
 expect(await activeWeather.evaluate(node=>getComputedStyle(node,'::before').opacity)).toBe('0.68');
 await expect(activeScene).toHaveCSS('filter','brightness(1.04)');
});

test('Home uses a quiet corporate shell and purposeful direction scenes',async({browser,page},testInfo)=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await expect(page.locator('.home-master')).toHaveCSS('background-color','rgb(247, 246, 243)');
 await expect(page.locator('[data-home-pillar-proof="attention"]')).toHaveCount(1);
 await expect(page.locator('[data-home-explainer="marketing"]')).toContainText('Content');
 await expect(page.locator('[data-home-explainer="marketing"]')).toContainText('Search + social');
 await expect(page.locator('[data-home-explainer="marketing"]')).toContainText('Inquiry');
 await expect(page.locator('[data-home-pillar-proof="systems"]')).toHaveCount(1);
 await expect(page.locator('[data-home-explainer="technology"]')).toContainText('Request');
 await expect(page.locator('[data-home-explainer="technology"]')).toContainText('CRM context');
 await expect(page.locator('[data-home-explainer="technology"]')).toContainText('Automation');
 await expect(page.locator('[data-home-explainer="technology"]')).toContainText('Receipt');
 for(const label of ['Logistics','Sales','Marketing','Operations']) {
  await expect(page.locator('[data-home-pillar-proof="progress"]')).toContainText(label);
 }

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

test('Home subjects use finite cycles, pause offscreen and settle to still artwork',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1200});
 await page.goto('/');
 const layers=page.locator('[data-home-motion]');
 await expect(layers).toHaveCount(1);
 await page.locator('#paths').scrollIntoViewIfNeeded();
 await expect(layers.first()).toHaveAttribute('data-motion-state','running');
 const timing=await layers.first().evaluate(node=>node.getAnimations()[0].effect!.getTiming());
 expect(timing.duration).toBe(12000);
 expect(timing.iterations).toBe(3);
 await page.locator('footer').scrollIntoViewIfNeeded();
 await expect(layers.first()).toHaveAttribute('data-motion-state','paused');
 const time=await layers.first().evaluate(node=>node.getAnimations()[0].currentTime);
 await page.waitForTimeout(180);
 expect(await layers.first().evaluate(node=>node.getAnimations()[0].currentTime)).toBe(time);
 await page.locator('#paths').scrollIntoViewIfNeeded();
 await layers.evaluateAll(nodes=>nodes.forEach(node=>node.getAnimations().forEach(animation=>animation.finish())));
 await expect(layers.first()).toHaveAttribute('data-motion-state','finished');
 await expect(layers.first()).toHaveCSS('opacity','1');
 await page.locator('footer').scrollIntoViewIfNeeded();
 await page.locator('#paths').scrollIntoViewIfNeeded();
 await expect(layers.first()).toHaveAttribute('data-motion-state','finished');
 await page.locator('[data-route-id="marketing"]').hover();
 await expect(layers.first()).toHaveAttribute('data-motion-state','running');
});

test('Home motion responds to reduced-motion changes and stays decorative',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const layers=page.locator('[data-home-motion]');
 await expect(layers.first()).toHaveAttribute('data-motion-state','reduced');
 for(const layer of await layers.all()) {
  await expect(layer).toHaveAttribute('aria-hidden','true');
  await expect(layer).toHaveCSS('display','block');
  expect(await layer.evaluate(node=>node.getAnimations().length)).toBe(0);
 }
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('#paths').scrollIntoViewIfNeeded();
 await expect(layers.first()).toHaveAttribute('data-motion-state','running');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(layers.first()).toHaveAttribute('data-motion-state','reduced');
 expect(await layers.first().evaluate(node=>node.getAnimations().length)).toBe(0);
});
