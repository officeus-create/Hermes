// Independent WebKit-engine smoke test for the 701–820px touch-width repair.
// Emulation, not proof from a physical iPhone or iPad running Safari.
import { webkit } from "@playwright/test";
import fs from "node:fs/promises";

const root = process.env.HERMES_PREVIEW_URL ?? "http://127.0.0.1:4321";
const output = "artifacts/home-webkit-touch";
await fs.mkdir(output,{recursive:true});
const browser = await webkit.launch({headless:true});
try {
  for (const width of [390,701,710,760,768,820]) {
    const context=await browser.newContext({
      viewport:{width,height:900},deviceScaleFactor:2,
      isMobile:true,hasTouch:true,reducedMotion:"reduce",
    });
    try{
      const page=await context.newPage();
      const jsErrors=[];
      page.on("pageerror",err=>jsErrors.push(err.message));
      const response=await page.goto(root+"/",{waitUntil:"domcontentloaded"});
      if(response?.status()!==200)throw Error("WebKit "+width+": HTTP "+response?.status());
      await page.locator(".home-master-route").first().waitFor({state:"visible"});
      const r=await page.evaluate(()=>{
        const stage=document.querySelector(".home-master-stage");
        const shell=document.querySelector(".home-master-shell");
        const cards=[...document.querySelectorAll(".home-master-route")];
        const cols=getComputedStyle(stage).gridTemplateColumns.trim().split(/\s+/).length;
        const stageWidth=stage.getBoundingClientRect().width;
        const cardWidths=cards.map(x=>x.getBoundingClientRect().width);
        const links=cards.map(x=>x.getAttribute("href"));
        const cssTouch=matchMedia("(hover:none) and (pointer:coarse)").matches;
        const within=cards.every(x=>x.getBoundingClientRect().right<=innerWidth+1 && x.getBoundingClientRect().left>=-1);
        return {cols,stageWidth,cardWidths,links,cssTouch,within,
          overflow:document.documentElement.scrollWidth>innerWidth,
          shellRight:shell.getBoundingClientRect().right,innerWidth};
      });
      console.log("WEBKIT_TOUCH",width,JSON.stringify(r));
      if(r.cols!==1||r.cardWidths.length!==4||!r.cardWidths.every(w=>w>=r.stageWidth*.95)||r.overflow||!r.within) {
        throw Error("WebKit touch layout defect at "+width+"px: "+JSON.stringify(r));
      }
      if(r.links.join("|")!==["/paths/logistics/","/paths/technology/","/paths/academy/","/paths/marketing/"].join("|"))throw Error("Route regression at "+width);
      if(jsErrors.length)throw Error("WebKit JavaScript exceptions at "+width+": "+jsErrors.join("|"));
      if(width===390||width===768||width===820)await page.screenshot({path:output+"/touch-"+width+".png",fullPage:true});
    }finally{await context.close();}
  }
  // Genuine mouse pointer at 760 retains the intentionally different 2-column tablet layout.
  const desktop=await browser.newContext({viewport:{width:760,height:900},isMobile:false,hasTouch:false,reducedMotion:"reduce"});
  try{
    const p=await desktop.newPage();await p.goto(root+"/",{waitUntil:"domcontentloaded"});
    const cols=await p.locator(".home-master-stage").evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
    if(cols!==2)throw Error("WebKit non-touch 760 must be two columns, got "+cols);
    await p.screenshot({path:output+"/mouse-760.png",fullPage:true});
    console.log("WEBKIT_MOUSE_760_OK");
  }finally{await desktop.close();}
  console.log("WebKit touch/mobile layout QA passed: 390, 701, 710, 760, 768, 820, mouse 760.");
} finally {await browser.close();}
