import { expect, test } from "@playwright/test";

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
   expect(await route.evaluate(n=>getComputedStyle(n.querySelector('.home-portal-art')!,'::before').backgroundImage)).toContain('home-approved-20260930.webp');
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
 expect(await page.locator('.home-portal-art').first().evaluate(n=>getComputedStyle(n,'::before').transitionDuration)).toBe('0s');
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
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('#mobile-menu [data-hermes-sign-in]').click();
 await expect(page).toHaveURL(/\/services\/hermes-connect\/access\/$/);
 await page.waitForLoadState('load');
 await page.goBack();
 await page.bringToFront();
 await page.waitForLoadState('load');
 await expect(page.getByRole('heading',{name:'Four directions.'})).toBeVisible();
});

test('compact Home CTA reaches native contact actions and approved artwork loads once',async({page})=>{
 const artwork:string[]=[];
 page.on('request',r=>{if(r.url().includes('/images/home-approved-20260930.webp'))artwork.push(r.url())});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await page.locator('.header-cta').click();
 await expect(page).toHaveURL(/\/#contact$/);
 await expect(page.getByRole('heading',{name:'Let’s build your next step.'})).toBeInViewport();
 await expect(page.locator('[data-home-primary-contact]')).toHaveAttribute('href','/contacts/');
 await expect(page.locator('[data-home-contact-fallback]')).toHaveAttribute('href','mailto:officeus@hermeslogisticsus.com');
 await page.getByRole('link',{name:'Explore Hermes Connect',exact:true}).click();
 await expect(page).toHaveURL(/\/services\/hermes-connect\/$/);
 expect(artwork).toHaveLength(1);
});
