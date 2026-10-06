import { expect, test, type Page, type Locator } from '@playwright/test';

const routes = [
  { path: 'access/', title: 'One sign-in. A CRM matched to your business.' },
  { path: 'academy/auth/', title: 'Use one Hermes account across the ecosystem.' },
  { path: 'academy/business/auth/', title: 'A CRM adapted to an academy, courses, or a business club.' },
];
// Reuse the current Home regression pattern for proven CI rAF starvation.
// Retain visible/enabled, stable geometry, in-viewport and hit-target checks.
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
 const hitState=await target.evaluate((node,{x,y})=>{
  const hit=document.elementFromPoint(x,y);
  return { matches:hit===node||node.contains(hit), target:node.outerHTML, hit:hit?.outerHTML.slice(0,1500),
   stack:document.elementsFromPoint(x,y).slice(0,5).map(element=>({tag:element.tagName,id:element.id,class:element.className,position:getComputedStyle(element).position,zIndex:getComputedStyle(element).zIndex})),
   point:{x,y},scroll:{x:scrollX,y:scrollY},viewport:visualViewport?{x:visualViewport.offsetLeft,y:visualViewport.offsetTop,width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale}:null };
 },{x,y});
 expect(hitState.matches,JSON.stringify(hitState)).toBe(true);
 await page.mouse.click(x,y);
}

async function chooseLanguage(page: Page, isMobile: boolean, language: string) {
  // Language navigation preserves #main-content; return to the header as a user would.
  // Mobile emulation does not implement desktop Home-key scrolling.
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.waitForLoadState('load');
  await expect(page.locator('html')).toBeVisible();
  if (isMobile) {
    await clickHistoryTarget(page, page.locator('[data-menu-button]'));
    await clickHistoryTarget(page, page.locator(`.mobile-language-switcher a[lang="${language}"]`));
  } else {
    await clickHistoryTarget(page, page.locator('[data-language-menu] summary'));
    await clickHistoryTarget(page, page.locator(`[data-language-menu] a[lang="${language}"]`));
  }
}

test.beforeEach(async ({ page }) => {
  // Keep this language regression entirely local: no account creation or external calls.
  await page.route('**/api/**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"success":false,"error":"not_authenticated"}' }));
});
for (const { path, title } of routes) {
  test(`${path} keeps default English through reload and uses one language control`, async ({ page, isMobile }) => {
    await page.goto(`/services/hermes-connect/${path}?mode=register#main-content`);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page.locator('.desktop-nav [data-nav-tone="logistics"]')).toHaveText('Logistics');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main button[data-lang]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('main h1')).toHaveText(title);
    await chooseLanguage(page, isMobile, 'uk');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.locator('main h1')).not.toHaveText(title);
    await expect(page.locator('[data-hc-english-only]')).toHaveCount(0);
    await chooseLanguage(page, isMobile, 'en');
    await expect(page.locator('main h1')).toHaveText(title);
    expect(new URL(page.url()).searchParams.get('mode')).toBe('register');
    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });
  test(`${path} respects saved Ukrainian and explicit English overrides it`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('hermes-connect-language', 'uk'));
    await page.goto(`/services/hermes-connect/${path}`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.locator('main h1')).not.toHaveText(title);
    await page.goto(`/services/hermes-connect/${path}?lang=en`);
    await expect(page.locator('main h1')).toHaveText(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
}
