import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const directory='artifacts/route-screenshots/home-motion';
await mkdir(directory,{recursive:true});
const browser=await chromium.launch();
const results=[];
try {
  for(const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:width===1440?1200:844},reducedMotion:'no-preference',deviceScaleFactor:width===1440?2:1});
    const page=await context.newPage();
    await page.goto('http://127.0.0.1:4321/',{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    await page.getByRole('button',{name:'Continue without analytics',exact:true}).click();
    const images=await page.evaluate(async()=>{
      const posters=[...document.querySelectorAll('.home-portal-art img')];
      for(const image of posters) image.loading='eager';
      await Promise.all([...document.querySelectorAll('.home-master-stage img')].map(image=>image.decode()));
      return posters.map(image=>({src:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight}));
    });
    await page.waitForFunction(()=>[...document.querySelectorAll('[data-home-motion]')].every(node=>node.dataset.motionState==='running'));
    await page.evaluate(()=>{
      for(const layer of document.querySelectorAll('[data-home-motion]')) {
        const animation=layer.getAnimations()[0];
        animation.pause();
        animation.currentTime=3600;
        layer.dataset.motionState='paused';
      }
    });
    await page.screenshot({path:`${directory}/home-${width}-motion-midpoint.png`,fullPage:false});
    await page.evaluate(()=>document.querySelectorAll('[data-home-motion]').forEach(node=>node.getAnimations().forEach(animation=>animation.finish())));
    await page.waitForFunction(()=>[...document.querySelectorAll('[data-home-motion]')].every(node=>node.dataset.motionState==='finished'));
    await page.screenshot({path:`${directory}/home-${width}-settled.png`,fullPage:false});
    if(width===390) await page.screenshot({path:`${directory}/home-390-full-settled.png`,fullPage:true});
    if(width===1440) {
      for(const direction of ['logistics','marketing','technology','academy']) {
        await page.locator(`[data-route-id="${direction}"]`).hover();
        await page.waitForTimeout(900);
        await page.locator(`[data-route-id="${direction}"]`).screenshot({path:`${directory}/home-1440-${direction}-hover.png`,animations:'allow'});
        await page.mouse.move(0,0);
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.screenshot({path:`${directory}/home-${width}-reduced.png`,fullPage:false});
    const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,layers:[...document.querySelectorAll('[data-home-motion]')].map(node=>({kind:node.dataset.homeMotion,state:node.dataset.motionState,display:getComputedStyle(node).display,animations:node.getAnimations().length}))}));
    if(geometry.scrollWidth>width||geometry.layers.some(layer=>layer.display!=='block'||layer.animations!==0)) throw new Error(`Home motion geometry/reduced-motion failed at ${width}`);
    results.push({...geometry,images});
    await context.close();
  }
  await writeFile(`${directory}/evidence.json`,JSON.stringify({sha:process.env.GITHUB_SHA,results},null,2)+'\n');
} finally { await browser.close(); }
