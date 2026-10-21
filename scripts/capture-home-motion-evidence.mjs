// Marketing cinematic evidence: real locally hosted documentary video, never the retired mock-card CSS animation.
// Capture genuine progression (video currentTime advances), then the actual reduced-motion static poster.
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
    const consent=page.getByRole('button',{name:'Continue without analytics',exact:true});
    if(await consent.count()) await consent.click();
    const images=await page.evaluate(async()=>{
      const posters=[...document.querySelectorAll('.home-portal-art img')];
      for(const image of posters) image.loading='eager';
      await Promise.all([...document.querySelectorAll('.home-master-stage img')]
        .filter(image=>image.currentSrc || image.getAttribute('src'))
        .map(image=>image.decode()));
      return posters.map(image=>({src:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight}));
    });
    const scene=page.locator('[data-home-marketing-cinematic]');
    await scene.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{
      const stage=document.querySelector('[data-home-marketing-cinematic]');
      const video=stage?.querySelector('video');
      return stage?.getAttribute('data-media-state')==='ready' &&
             video && video.readyState>=2 && !video.paused &&
             video.currentTime>=0;
    },null,{timeout:15000});
    // Verify real frame progression; setting a CSS animation currentTime would be false proof here.
    const midpoint=await page.evaluate(async()=>{
      const stage=document.querySelector('[data-home-marketing-cinematic]');
      const video=stage.querySelector('video');
      const start=video.currentTime;
      await new Promise(resolve=>setTimeout(resolve,850));
      const end=video.currentTime;
      if(end-start<.15) throw new Error('Marketing video did not advance real frames');
      return {source:video.currentSrc,videoTimeStart:start,videoTimeEnd:end,playing:!video.paused};
    });
    await page.screenshot({path:`${directory}/home-${width}-motion-midpoint.png`,fullPage:false,animations:'allow'});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>{
      const stage=document.querySelector('[data-home-marketing-cinematic]');
      const video=stage?.querySelector('video');
      const poster=stage?.querySelector('img');
      return stage?.getAttribute('data-media-state')==='poster' &&
             video?.paused && video && getComputedStyle(video).display==='none' &&
             poster?.complete && poster.naturalWidth>0;
    },null,{timeout:10000});
    await page.screenshot({path:`${directory}/home-${width}-settled.png`,fullPage:false});
    if(width===390) await page.screenshot({path:`${directory}/home-390-full-settled.png`,fullPage:true});
    await page.screenshot({path:`${directory}/home-${width}-reduced.png`,fullPage:false});
    const geometry=await page.evaluate(()=>{
      const stage=document.querySelector('[data-home-marketing-cinematic]');
      const video=stage.querySelector('video');
      return {
        width:innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        marketingMotion:stage.dataset.mediaState,
        videoPaused:video.paused,
        videoDisplay:getComputedStyle(video).display,
        posterWidth:stage.querySelector('img').naturalWidth
      };
    });
    if(geometry.scrollWidth>width||geometry.marketingMotion!=='poster'||
       !geometry.videoPaused||geometry.videoDisplay!=='none'||!geometry.posterWidth) {
      throw new Error(`Home Marketing geometry/reduced-motion failed at ${width}: ${JSON.stringify(geometry)}`);
    }
    if(width===1440) {
      await page.emulateMedia({reducedMotion:'no-preference'});
      for(const direction of ['logistics','marketing','technology','academy']) {
        await page.locator(`[data-route-id="${direction}"]`).hover();
        await page.waitForTimeout(500);
        await page.locator(`[data-route-id="${direction}"]`).screenshot({
          path:`${directory}/home-1440-${direction}-hover.png`,animations:'allow'
        });
        await page.mouse.move(0,0);
      }
    }
    results.push({...geometry,midpoint,images});
    await context.close();
  }
  // Owner-review captures must not be hidden behind the analytics consent overlay.
  // We choose only "Continue without analytics"; live consent behavior is untouched.
  const cleanReview=[];
  for(const width of [390,430,768,1024,1440]) {
    const context=await browser.newContext({
      viewport:{width,height:width>=1024?1000:width>=768?1024:844},
      reducedMotion:'reduce', colorScheme:'light', locale:'en-US', deviceScaleFactor:1
    });
    try {
      const page=await context.newPage();
      await page.goto('http://127.0.0.1:4321/',{waitUntil:'load'});
      await page.evaluate(()=>document.fonts.ready);
      const decline=page.getByRole('button',{name:'Continue without analytics',exact:true});
      if(await decline.isVisible().catch(()=>false)) await decline.click();
      if(await decline.isVisible().catch(()=>false)) {
        throw new Error(`Owner-review capture at ${width}px still has the consent overlay`);
      }
      await page.evaluate(async()=>{
        const photos=[...document.querySelectorAll('.home-master-stage img')];
        for(const photo of photos) photo.loading='eager';
        await Promise.all(photos.filter(photo=>photo.currentSrc || photo.getAttribute('src'))
          .map(photo=>photo.decode()));
        if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.scrollTo({top:0,behavior:'instant'});
      });
      // The actual Home contact/footer use content-visibility:auto to reduce work.
      // Scroll through their REAL rendered states first, then force-paint offscreen
      // content ONLY in this screenshot context to avoid blank fullPage artifacts.
      await page.locator('#contact').scrollIntoViewIfNeeded();
      await page.locator('.home-final-contact h2').scrollIntoViewIfNeeded();
      await page.locator('footer').scrollIntoViewIfNeeded();
      const contentReady=await page.evaluate(()=>{
        const contact=document.querySelector('.home-final-contact h2');
        const footer=document.querySelector('#contact footer');
        return Boolean(contact?.textContent?.includes('Not sure which direction fits?') &&
                       footer?.textContent?.includes('Hermes'));
      });
      if(!contentReady) throw new Error(`Home contact/footer failed real scroll rendering at ${width}px`);
      await page.addStyleTag({content:'#contact.home-contact-shell{content-visibility:visible!important;contain-intrinsic-size:auto!important}'});
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await page.waitForTimeout(120);
      const geometry=await page.evaluate(()=>{
        const stage=document.querySelector('.home-master-stage');
        const marketing=document.querySelector('[data-home-marketing-cinematic]');
        const css=getComputedStyle(stage);
        return {
          width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
          columns:css.gridTemplateColumns.trim().split(/\s+/).length,
          marketingVisible:getComputedStyle(marketing).display!=='none',
          marketingStages:marketing.querySelectorAll('video').length,
          marketingPosters:marketing.querySelectorAll('img').length,
          marketingMotion:marketing.dataset.mediaState
        };
      });
      const expectedColumns=width<=700?1:width<=1000?2:4;
      if(geometry.scrollWidth>width || geometry.columns!==expectedColumns ||
         !geometry.marketingVisible || geometry.marketingStages!==1 || geometry.marketingPosters!==1 || geometry.marketingMotion!=='poster') {
        throw new Error(`Owner-review capture geometry failed at ${width}: ${JSON.stringify(geometry)}`);
      }
      await page.screenshot({path:`${directory}/home-${width}-review-no-analytics.png`,fullPage:true,animations:'disabled'});
      await page.locator('[data-route-id="marketing"]').screenshot({
        path:`${directory}/home-${width}-marketing-review.png`,animations:'disabled'
      });
      cleanReview.push({...geometry,consent:'declined',captured:'full-page and marketing pillar',contactPaintedForCapture:true,productionEvidence:false});
    } finally {await context.close();}
  }
  const touchContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference',deviceScaleFactor:1});
  const touchPage=await touchContext.newPage();
  await touchPage.goto('http://127.0.0.1:4321/',{waitUntil:'load'});
  await touchPage.evaluate(()=>document.fonts.ready);
  const touchConsent=touchPage.getByRole('button',{name:'Continue without analytics',exact:true});
  if(await touchConsent.count()) await touchConsent.click();
  for(const direction of ['logistics','marketing','technology','academy']) {
    // Technology and Academy now show clean image portals. Their old workflow
    // overlay elements intentionally remain hidden, so capture the actual route.
    const selector=direction==='marketing'
      ? '[data-home-marketing-cinematic]'
      : `[data-route-id="${direction}"]`;
    const target=touchPage.locator(selector);
    if(!(await target.isVisible())) throw new Error(`Home touch scene is not visible: ${direction}`);
    await target.screenshot({path:`${directory}/home-390-touch-${direction}-visual-owner.png`,animations:'allow'});
  }
  if(await touchPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) {
    throw new Error('Home touch geometry failed at 390');
  }
  await touchContext.close();
  await writeFile(`${directory}/evidence.json`,JSON.stringify({
    sha:process.env.GITHUB_SHA,
    source:'Home visual-owner evidence with Logistics Golden Scene and reduced-mode checkpoints',
    proof:'preview-only; not production',
    results,
    cleanReview
  },null,2)+'\n');
} finally {await browser.close();}
