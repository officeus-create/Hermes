import { expect, test } from '@playwright/test';
import { catalogTrafficPeriod, publicCatalogTrafficSummary, catalogCountryCode } from '../functions/api/_lib/catalog-traffic-summary.mjs';
import { onRequestGet, onRequestPost } from '../functions/api/catalog-business-event';
import { repairShopDirectory } from '../src/data/repair-shop-directory';

test('Catalog traffic keeps unknowns, UTC periods and small country groups private', () => {
  const period = catalogTrafficPeriod(new Date('2026-10-08T12:00:00Z'));
  expect(period).toEqual({ start: '2026-09-11', start7: '2026-10-02', end: '2026-10-08' });
  expect(catalogCountryCode('us')).toBe('US');
  expect(catalogCountryCode('XX')).toBeNull();
  expect(catalogCountryCode('US<script>')).toBeNull();
  expect(publicCatalogTrafficSummary([], null, period).views28d).toBeNull();
  const result = publicCatalogTrafficSummary([{day:'2026-10-08',event_count:12},{day:'2026-10-01',event_count:3}], [{country:'US',views:7},{country:'UA',views:4},{country:'GB',views:1}], period);
  expect(result.views28d).toBe(15); expect(result.views7d).toBe(12);
  expect(result.countries).toEqual([{country:'US',views:7}]);
  expect(result.countriesState).toBe('partial');
});

test('Catalog public read binds one business and never writes or leaks identifiers', async () => {
  const business = repairShopDirectory[0];
  const path = `/businesses/${business.stateSlug}/${business.citySlug}/${business.slug}/`;
  const ids: unknown[] = [];
  const DB = { prepare(sql: string) { return { bind(...args: unknown[]) { ids.push(args[0]); return { async all() { return { results: sql.includes('country_views') ? [] : [{day:new Date().toISOString().slice(0,10),event_count:3}] }; }, async run() { throw new Error('Public GET must not write'); } }; } }; } };
  const response = await onRequestGet({request:new Request(`https://hermeslogisticsus.com/api/catalog-business-event?path=${encodeURIComponent(path)}`),env:{DB}});
  expect(response.status).toBe(200);
  const payload = await response.json();
  expect(payload.profiles[0].views28d).toBe(3);
  expect(ids.every(id => id === `repair-shop:${business.stateSlug}/${business.citySlug}/${business.slug}`)).toBe(true);
  expect(JSON.stringify(payload)).not.toMatch(/catalog_business_id|owner_specialist_id|client_email|client_phone/);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  const invalid = await onRequestGet({request:new Request('https://hermeslogisticsus.com/api/catalog-business-event?path=/internal/secret/'),env:{DB}});
  expect(invalid.status).toBe(400);
});

test('Catalog card badges and expandable profile details use profile-specific counts', async ({ page }) => {
  await page.route('**/api/catalog-business-event?*', async route => {
    const paths = new URL(route.request().url()).searchParams.getAll('path');
    await route.fulfill({json:{success:true,profiles:paths.map(path=>({path,state:'measured',views28d:12,views7d:6,viewsToday:2,countries:[{country:'US',views:7}],countriesState:'partial'}))}});
  });
  await page.goto('/businesses/');
  const first = page.locator('.business-card').first();
  await expect(first.locator('[data-catalog-traffic="badge"]')).toHaveText('Views · 12 / 28d');
  await expect(page.locator('[data-public-traffic-counter]')).toHaveCount(0);
  const href = await first.locator('.business-card__actions a').first().getAttribute('href');
  await page.goto(href!);
  const detail = page.locator('[data-catalog-traffic="detail"]');
  await expect(detail.locator('summary')).toContainText('12 in 28 days');
  await detail.locator('summary').click();
  await expect(detail).toContainText('United States: 7');
  await expect(detail).toContainText('not unique people');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('Catalog unavailable statistics do not fabricate zero', async ({ page }) => {
  await page.route('**/api/catalog-business-event?*', route=>route.fulfill({status:503,json:{success:false}}));
  await page.goto('/businesses/');
  const badge = page.locator('[data-catalog-traffic="badge"]').first();
  await expect(badge).toHaveText('Views · — / 28d');
  await expect(page.locator('[data-public-traffic-counter]')).toHaveCount(0);
});

test('Catalog country collection uses only trusted edge country after consent', async () => {
  const business = repairShopDirectory[0];
  const businessId = `repair-shop:${business.stateSlug}/${business.citySlug}/${business.slug}`;
  const writes: {sql:string,args:unknown[]}[] = [];
  const DB = { prepare(sql:string) { return { async run() {}, bind(...args:unknown[]) { return { async run() { writes.push({sql,args}); } }; } }; } };
  const request = new Request('https://hermeslogisticsus.com/api/catalog-business-event', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({catalog_business_id:businessId,event_type:'profile_view',analytics_consent:true,country:'UA'})});
  Object.defineProperty(request,'cf',{value:{country:'US'}});
  expect((await onRequestPost({request,env:{DB}})).status).toBe(202);
  const country = writes.find(row=>row.sql.includes('INSERT INTO catalog_business_country_views_daily'));
  expect(country?.args[2]).toBe('US');
  expect(writes.filter(row=>row.sql.includes('INSERT INTO catalog_business_events_daily'))).toHaveLength(1);
  const rejected = new Request('https://hermeslogisticsus.com/api/catalog-business-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({catalog_business_id:businessId,event_type:'profile_view',analytics_consent:false})});
  const count = writes.length;
  expect((await onRequestPost({request:rejected,env:{DB}})).status).toBe(400);
  expect(writes).toHaveLength(count);
});
