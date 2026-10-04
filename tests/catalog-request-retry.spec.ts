import {expect,test} from '@playwright/test';
const path='/businesses/request/?type=catalog-business-request&business=Example%20Garage&business_id=repair-shop-crm%3Aexample-shop&profile=%2Fbusinesses%2Fconnect%2Frepair-shop%2Fexample-garage%2F&city=Example&state=AR&country=US';
async function fill(page:any){
 await page.goto(path);await page.locator('input[name="name"]').fill('Example Customer');
 await page.locator('input[name="email"]').fill('customer@example.com');await page.locator('input[name="phone"]').fill('+1 555 123 4567');
 await page.locator('input[name="preferred_contact_time"]').fill('Morning');await page.locator('input[name="consent"]').check();
}
test.beforeEach(async({page})=>{await page.route(/^https:\/\//,route=>route.abort());});
test('Catalog partial failure retries the exact same browser payload',async({page})=>{
 const payloads:any[]=[];
 await page.route('**/api/business-lead',async route=>{const p=route.request().postDataJSON();payloads.push(p);await route.fulfill({status:payloads.length===1?503:200,json:payloads.length===1?{success:false,request_id:p.request_id,crm_saved:true,retryable:true}:{success:true,request_id:p.request_id}});});
 await fill(page);await page.getByRole('button',{name:'Send request',exact:true}).click();
 await expect(page.locator('[data-request-status]')).toContainText('Your request was saved');
 await expect(page.locator('form')).toBeVisible();await page.getByRole('button',{name:'Send request',exact:true}).click();
 await expect(page.locator('[data-request-success]')).toBeVisible();expect(payloads).toHaveLength(2);expect(payloads[1]).toEqual(payloads[0]);
});
test('Catalog malformed success stays visible and blocks a new submission',async({page})=>{
 let calls=0;await page.route('**/api/business-lead',async route=>{calls++;await route.fulfill({status:200,json:{success:true,request_id:'wrong_request_12345'}});});
 await fill(page);await page.getByRole('button',{name:'Send request',exact:true}).click();await expect(page.locator('[data-request-status]')).toContainText('delivery review');
 await expect(page.locator('[data-request-success]')).toBeHidden();await expect(page.getByRole('button',{name:'Send request',exact:true})).toBeDisabled();expect(calls).toBe(1);
});
test('Catalog unresolved request cannot silently become an edited new inquiry',async({page})=>{
 let calls=0;await page.route('**/api/business-lead',async route=>{calls++;const p=route.request().postDataJSON();await route.fulfill({status:503,json:{success:false,request_id:p.request_id,crm_saved:true,retryable:true}});});
 await fill(page);await page.getByRole('button',{name:'Send request',exact:true}).click();await expect(page.locator('[data-request-status]')).toContainText('saved');
 await page.locator('textarea[name="message"]').fill('Materially changed request while the previous one is unresolved.');await page.getByRole('button',{name:'Send request',exact:true}).click();await expect(page.locator('[data-request-status]')).toContainText('original details');expect(calls).toBe(1);
});
test('Catalog active attempt then known failure allows manual same-ID retry',async({page})=>{
 const payloads:any[]=[];await page.route('**/api/business-lead',async route=>{
  const p=route.request().postDataJSON();payloads.push(p);const n=payloads.length;
  await route.fulfill({status:n===3?200:503,json:n===3?{success:true,request_id:p.request_id}:{success:false,request_id:p.request_id,crm_saved:true,retryable:n===2,error:n===1?'delivery_in_progress':'delivery_failed'}});
 });
 await fill(page);const button=page.getByRole('button',{name:'Send request',exact:true});
 await button.click();await expect(page.locator('[data-request-status]')).toContainText('still being sent');await expect(button).toBeEnabled();expect(payloads).toHaveLength(1);
 await button.click();await expect(page.locator('[data-request-status]')).toContainText('Email handoff is incomplete');expect(payloads).toHaveLength(2);
 await button.click();await expect(page.locator('[data-request-success]')).toBeVisible();expect(payloads).toHaveLength(3);expect(payloads[1]).toEqual(payloads[0]);expect(payloads[2]).toEqual(payloads[0]);
});
test('Catalog uncertain outcome remains blocked',async({page})=>{
 let calls=0;await page.route('**/api/business-lead',async route=>{calls++;const p=route.request().postDataJSON();await route.fulfill({status:503,json:{success:false,request_id:p.request_id,crm_saved:true,retryable:false,error:'delivery_review_required'}});});
 await fill(page);const button=page.getByRole('button',{name:'Send request',exact:true});await button.click();await expect(page.locator('[data-request-status]')).toContainText('delivery review');await expect(button).toBeDisabled();await expect(page.locator('[data-request-success]')).toBeHidden();expect(calls).toBe(1);
});
test('Catalog explicit unpersisted rejection allows corrected name submission',async({page})=>{
 const payloads:any[]=[];await page.route('**/api/business-lead',async route=>{const p=route.request().postDataJSON();payloads.push(p);await route.fulfill({status:payloads.length===1?400:200,json:payloads.length===1?{success:false,request_id:p.request_id,error:'invalid_lead',delivery_status:'rejected',crm_saved:false,correction_allowed:true,retryable:false}:{success:true,request_id:p.request_id}});});
 await fill(page);await page.locator('input[name="name"]').fill(' A ');const button=page.getByRole('button',{name:'Send request',exact:true});await button.click();await expect(page.locator('[data-request-status]')).toContainText('not accepted or saved');await expect(button).toBeEnabled();expect(payloads).toHaveLength(1);
 await page.locator('input[name="name"]').fill('Corrected Customer');await button.click();await expect(page.locator('[data-request-success]')).toBeVisible();expect(payloads).toHaveLength(2);expect(payloads[1].name).toBe('Corrected Customer');expect(payloads[1].request_id).not.toBe(payloads[0].request_id);
});
