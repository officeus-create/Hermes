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
  const oversized = new URL('https://hermeslogisticsus.com/api/catalog-business-event');
  for (let i=0;i<13;i++) oversized.searchParams.append('path', `/businesses/region/city/profile-${i}/`);
  expect((await onRequestGet({request:new Request(oversized),env:{DB}})).status).toBe(400);
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
  const example = page.locator('.business-card').filter({has:page.getByRole('heading',{name:'Business Academy Growth Strategy',exact:true})});
  await expect(example).toHaveCount(1);
  await expect(example.locator('[data-catalog-traffic="badge"]')).toHaveCount(0);
  const href = await first.locator('.business-card__actions a').first().getAttribute('href');
  await page.goto(href!);
  const detail = page.locator('[data-catalog-traffic="detail"]');
  await expect(detail.locator('summary')).toContainText('12 in 28 days');
  await expect(detail.locator('summary')).toBeVisible();
  expect(await detail.locator('summary').evaluate(element=>element.getBoundingClientRect().width)).toBeGreaterThan(150);
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

for (const path of ['/businesses/arkansas/little-rock/smart-bubble-mobile-auto-body-repair/', '/businesses/ukraine/bila-tserkva/kons-na-bis/']) {
  test(`Catalog statistics remain readable with telemetry blocked: ${path}`, async ({ page }) => {
    const writes: string[] = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('/api/catalog-business-event')) writes.push(request.url());
    });
    await page.route('**/catalog-business-telemetry.js', route => route.abort('blockedbyclient'));
    await page.route('**/api/catalog-business-event?*', route => route.fulfill({json:{success:true,profiles:[{path,state:'measured',views28d:12,views7d:6,viewsToday:2,countries:[{country:'US',views:7}],countriesState:'partial'}]}}));
    await page.goto(path);
    const detail = page.locator('[data-catalog-traffic="detail"]');
    await expect(detail.locator('summary')).toContainText('12 in 28 days');
    await detail.locator('summary').click();
    await expect(detail).toContainText('United States: 7');
    await expect(page.locator('script[src="/catalog-traffic-stats.js"]')).toHaveCount(1);
    expect(writes).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('Public home-service counters enforce publication gates and never write on GET', async () => {
  const path = '/businesses/connect/company/public-company/';
  const queries: {sql:string,args:unknown[]}[] = [];
  let published = true;
  const DB = { prepare(sql:string) { return { bind(...args:unknown[]) {
    queries.push({sql,args});
    return {
      async first() {
        expect(sql).toContain("JOIN hermes_home_service_profiles");
        expect(sql).toContain("c.company_type='home_service'");
        expect(sql).toContain("c.catalog_opt_in=1");
        expect(sql).toContain("'self_submitted','verified_public'");
        return published ? {id:'company-123',slug:'public-company',catalog_opt_in:1,catalog_status:'self_submitted',management_mode:'owner_managed',catalog_publication_basis:'owner_opt_in'} : null;
      },
      async all() { return {results:sql.includes('country_views') ? [] : [{day:new Date().toISOString().slice(0,10),event_count:4}]}; },
      async run() { throw new Error('Public GET must not write'); }
    };
  } }; } };
  const get = () => onRequestGet({request:new Request('https://hermeslogisticsus.com/api/catalog-business-event?path='+encodeURIComponent(path)),env:{DB}});
  const response = await get();
  expect(response.status).toBe(200);
  const payload = await response.json();
  expect(payload.profiles[0].views28d).toBe(4);
  expect(queries.filter(q=>q.sql.includes('catalog_business_')).every(q=>q.args[0]==='company-crm:company-123')).toBe(true);
  expect(JSON.stringify(payload)).not.toContain('company-123');
  published = false;
  queries.length = 0;
  const withdrawn = await (await get()).json();
  expect(withdrawn.profiles[0].state).toBe('unavailable');
  expect(withdrawn.profiles[0].views28d).toBeNull();
  expect(queries).toHaveLength(1);
});

test('Home-service collection rejects missing consent and unpublished companies', async () => {
  let published = false;
  const writes: string[] = [];
  let reads = 0;
  const DB = { prepare(sql:string) { return {
    async run() {},
    bind() { return {
      async first() { reads++; return published ? {id:'company-123',slug:'public-company',catalog_opt_in:1,catalog_status:'self_submitted',management_mode:'owner_managed',catalog_publication_basis:'owner_opt_in'} : null; },
      async run() { writes.push(sql); }
    }; }
  }; } };
  const post = (consent:boolean) => onRequestPost({request:new Request('https://hermeslogisticsus.com/api/catalog-business-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({catalog_business_id:'company-crm:company-123',event_type:'profile_view',analytics_consent:consent})}),env:{DB}});
  expect((await post(false)).status).toBe(400);
  expect(reads).toBe(0);
  expect((await post(true)).status).toBe(400);
  expect(writes).toHaveLength(0);
  published = true;
  expect((await post(true)).status).toBe(202);
  expect(writes.filter(sql=>sql.includes('INSERT INTO catalog_business_events_daily'))).toHaveLength(1);
});


// Synthetic in-memory Academy owners only; no production traffic or CRM records.
test('Academy raw UUID adapter shares public gates, preserves unknowns and never writes on GET', async () => {
  const id = '00000000-0000-4000-8000-000000000001';
  const path = '/businesses/connect/academy/synthetic-academy/';
  let optIn = 1;
  let status = 'self_submitted';
  let hasExtension = true;
  let website = '';
  let observed = true;
  let reads = 0;
  const summaries: unknown[] = [];
  const writes: {sql:string,args:unknown[]}[] = [];
  const DB = { prepare(sql:string) { return {
    async run() { writes.push({sql,args:[]}); },
    bind(...args:unknown[]) { return {
      async first() {
        reads++;
        expect(sql).toContain('JOIN hermes_academy_business_profiles a ON a.company_id=c.id');
        expect(sql).toContain('c.catalog_opt_in=1');
        expect(sql).toContain("c.catalog_status IN ('self_submitted','verified_public')");
        const match = sql.includes('WHERE c.slug=?') ? args[0] === 'synthetic-academy' : args[0] === id;
        return hasExtension && optIn === 1 && ['self_submitted','verified_public'].includes(status) && match
          ? {id,slug:'synthetic-academy',website} : null;
      },
      async all() {
        summaries.push(args[0]);
        return {results:sql.includes('country_views') || !observed ? [] : [{day:new Date().toISOString().slice(0,10),event_count:4}]};
      },
      async run() { writes.push({sql,args}); }
    }; }
  }; } };
  const get = (requested=path) => onRequestGet({request:new Request('https://hermeslogisticsus.com/api/catalog-business-event?path='+encodeURIComponent(requested)),env:{DB}});
  const post = (value=id,consent=true) => onRequestPost({request:new Request('https://hermeslogisticsus.com/api/catalog-business-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({catalog_business_id:value,event_type:'profile_view',analytics_consent:consent})}),env:{DB}});

  for (const publicStatus of ['self_submitted','verified_public']) {
    status = publicStatus;
    const response = await get();
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.profiles[0].views28d).toBe(4);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(JSON.stringify(payload)).not.toMatch(/00000000|catalog_business_id|owner_specialist_id|email|phone|website/);
  }
  expect(summaries.every(value=>value===id)).toBe(true);
  expect(writes).toEqual([]);
  observed = false;
  const unknown = await (await get()).json();
  expect(unknown.profiles[0].state).toBe('no_observations');
  expect(unknown.profiles[0].views28d).toBeNull();
  expect(writes).toEqual([]);

  const readsBeforeConsent = reads;
  expect((await post(id,false)).status).toBe(400);
  expect(reads).toBe(readsBeforeConsent);
  expect(writes).toEqual([]);
  expect((await post()).status).toBe(202);
  expect(writes.filter(row=>row.sql.includes('INSERT INTO catalog_business_events_daily'))).toHaveLength(1);
  expect(writes.find(row=>row.sql.includes('INSERT INTO catalog_business_events_daily'))?.args[1]).toBe(id);
  writes.length = 0;

  for (const gate of ['opt-out','unpublished','missing-extension','curated-redirect']) {
    optIn = gate === 'opt-out' ? 0 : 1;
    status = gate === 'unpublished' ? 'draft' : 'self_submitted';
    hasExtension = gate !== 'missing-extension';
    website = gate === 'curated-redirect' ? 'https://kons-na-bis.com/' : '';
    summaries.length = 0;
    const payload = await (await get()).json();
    expect(payload.profiles[0].state).toBe('unavailable');
    expect(payload.profiles[0].views28d).toBeNull();
    expect(summaries).toEqual([]);
    expect((await post()).status).toBe(400);
    expect(writes).toEqual([]);
  }
  optIn = 1; status = 'self_submitted'; hasExtension = true; website = '';
  for (const wrong of ['00000000-0000-4000-8000-000000000002','not-a-company','academy-crm:'+id]) {
    expect((await post(wrong)).status).toBe(400);
    expect(writes).toEqual([]);
  }
  summaries.length = 0;
  expect((await (await get('/businesses/connect/academy/other-owner/')).json()).profiles[0].views28d).toBeNull();
  expect(summaries).toEqual([]);
  expect(writes).toEqual([]);
});
