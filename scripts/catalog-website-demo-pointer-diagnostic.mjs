import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser = await chromium.launch();
const receipts = [];
for (const viewport of [{width:1280,height:720},{width:390,height:844}]) {
  const page = await browser.newPage({viewport});
  const errors=[],failedResources=[],posts=[];
  page.on('response',r=>{if(r.status()>=400)failedResources.push({url:r.url(),status:r.status()})});
  page.on('request',r=>{if(r.method()==='POST')posts.push(r.url())});
  page.on('pageerror', e=>errors.push(String(e)));
  page.on('console', e=>{if(e.type()==='error')errors.push(e.text())});
  await page.addInitScript(()=>localStorage.setItem('hermes-analytics-consent','denied'));
  await page.route(/^https:\/\//,route=>route.abort());
  await page.goto('http://127.0.0.1:4321/businesses/concepts/kittles-garage/');
  await page.getByRole('button',{name:'Explore payment ↗',exact:true}).click();
  await page.getByRole('link',{name:/Open a short/}).click();
  await page.waitForLoadState('load');
  const button=page.getByRole('button',{name:'Preview development brief'});
  const before=await page.evaluate(()=>({dialogs:document.querySelectorAll('dialog[open]').length,inert:Array.from(document.querySelectorAll('[inert]')).map(e=>e.tagName),focus:document.activeElement?.tagName,visible:document.visibilityState,hasFocus:document.hasFocus(),ready:document.readyState}));
  let locatorClick;
  try {await button.click({timeout:2000});locatorClick='passed'}catch(e){locatorClick=String(e).split('Call log:')[0]}
  const raf=await page.evaluate(()=>Promise.race([new Promise(resolve=>requestAnimationFrame(()=>resolve('frame received'))),new Promise(resolve=>setTimeout(()=>resolve('no animation frame within 500ms'),500))]));
  // Inspect real scroll, bounds, and hit target; use a native mouse event with
  // browser coordinates, not JS click/submit or Playwright force.
  await button.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));
  const sample=async()=>button.evaluate(e=>{const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return{rect:r.toJSON(),x,y,hit:document.elementFromPoint(x,y)?.outerHTML.slice(0,200),inertAncestors:Array.from(e.parentElement?.closest('[inert]')?[e.parentElement.closest('[inert]')]:[]).map(n=>n.tagName),pointerEvents:getComputedStyle(e).pointerEvents,disabled:e.disabled,animations:document.getAnimations().length}});
  const a=await sample();await page.waitForTimeout(150);const b=await sample();
  await page.mouse.click(b.x,b.y);
  const actualPointerResult=await page.evaluate(()=>({active:document.activeElement?.getAttribute('name'),nameValid:document.querySelector('input[name=name]').validity.valid}));
  await page.locator('input[name=name]').fill('Synthetic QA');await page.locator('input[name=email]').fill('qa@example.invalid');await page.locator('input[name=whatsapp]').fill('+1 501 555 0100');await page.getByRole('checkbox').focus();await page.keyboard.press('Space');await button.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));const validBounds=await sample();await page.mouse.click(validBounds.x,validBounds.y);const actualValidPointerResult=await page.locator('[data-request-status]').textContent();receipts.push({viewport,before,locatorClick,raf,samples:[a,b],actualPointerResult,actualValidPointerResult,posts,consoleErrors:errors,failedResources});
  await page.close();
}
await browser.close();
fs.writeFileSync('../evidence/pointer-diagnostic.json',JSON.stringify(receipts,null,2));
console.log(JSON.stringify(receipts,null,2));
