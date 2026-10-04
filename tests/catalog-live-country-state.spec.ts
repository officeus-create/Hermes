import { expect, test } from "@playwright/test";

test("live U.S. repair profiles keep an unbuilt state tile passive and exclude other countries", async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop") await page.setViewportSize({width:1440,height:1000});
  const { readFileSync } = await import('node:fs');
  const liveScript = readFileSync(new URL('../public/catalog-connect-live.v2.js', import.meta.url), 'utf8');
  await page.route('**/catalog-connect-live.v2.js*', route => route.fulfill({contentType:'text/javascript',body:liveScript}));
  let releaseProfiles: () => void = () => { throw new Error("fixture release not initialized"); };
  const profilesReady = new Promise<void>(resolve => { releaseProfiles = resolve; });
  await page.route('**/api/catalog/companies', async route => { await profilesReady; return route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,companies:[
    {id:'qa-us-nv',companyType:'repair_shop',countryCode:'US',state:'NV',city:'Fixture',companyName:'Synthetic NV',profileUrl:'/businesses/connect/repair-shop/qa-us-nv/',services:[]},
    {id:'qa-us-tx',companyType:'repair_shop',countryCode:'US',state:'TX',city:'Fixture',companyName:'Synthetic TX',profileUrl:'/businesses/connect/repair-shop/qa-us-tx/',services:[]},
    {id:'qa-ca-nv',companyType:'repair_shop',countryCode:'CA',state:'NV',city:'Fixture',companyName:'Synthetic CA',profileUrl:'/businesses/connect/repair-shop/qa-ca-nv/',services:[]},
    {id:'qa-unknown-nv',companyType:'repair_shop',state:'NV',city:'Fixture',companyName:'Synthetic Unknown',profileUrl:'/businesses/connect/repair-shop/qa-unknown-nv/',services:[]},
  ]})}); });
  await page.goto('/businesses/');
  const pending=page.locator('.tile-map .state-tile').filter({has:page.locator('strong',{hasText:/^NV$/})});
  await expect(pending).toHaveClass(/pending/);
  await expect(pending).not.toHaveAttribute('href');
  releaseProfiles();
  const grid=page.locator('[data-catalog-grid]');
  await expect(grid.locator('[data-catalog-entity-id="qa-us-nv"]')).toHaveCount(1);
  await expect(grid.locator('[data-catalog-entity-id="qa-ca-nv"]')).toHaveCount(0);
  await expect(grid.locator('[data-catalog-entity-id="qa-unknown-nv"]')).toHaveCount(0);
  const tile=page.locator('.tile-map .state-tile').filter({has:page.locator('strong',{hasText:/^NV$/})});
  await expect(tile).toHaveAttribute('aria-label',/Nevada: 1 business profile.*state directory page unavailable/);
  await expect(tile).not.toHaveClass(/active/);
  await expect(tile).not.toHaveAttribute('href');
  await expect(tile).not.toHaveAttribute('role','link');
  const navigable=page.locator('.tile-map .state-tile').filter({has:page.locator('strong',{hasText:/^TX$/})});
  await expect(navigable).toHaveClass(/active/);
  await expect(navigable).toHaveAttribute('href','/businesses/texas/');
  expect((await page.request.get('/businesses/texas/')).status()).toBe(200);
  await page.locator('.coverage').screenshot({path:testInfo.outputPath('catalog-state-passive.png')});
});
