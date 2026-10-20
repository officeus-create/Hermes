import { expect, test } from "@playwright/test";

const sources = [
  {id:"marketing", original:"marketing-team-v1.mp4", sharp:"marketing-team-720.mp4", poster:"marketing-team-poster"},
  {id:"technology", original:"technology-claude-v3.mp4", sharp:"technology-claude-v3-720.mp4", poster:"technology-claude-v3-poster"},
  {id:"academy", original:"academy-claude-v3.mp4", sharp:"academy-claude-v3-720.mp4", poster:"academy-claude-v3-poster"},
] as const;

test("Home Retina touch portals choose 720p only after becoming visible", async ({browser}, testInfo) => {
  const context = await browser.newContext({
    baseURL:testInfo.project.use.baseURL,
    viewport:{width:390,height:844},
    deviceScaleFactor:3,
    isMobile:true,hasTouch:true,reducedMotion:"no-preference",
  });
  try {
    const page=await context.newPage();
    const requested:string[]=[];
    page.on("request", req => {if(req.url().endsWith("-720.mp4")) requested.push(req.url());});
    await page.goto("/");
    for (const film of sources) {
      const scene=page.locator(`[data-route-id="${film.id}"] [data-home-progressive-cinematic]`);
      const source=scene.locator("source");
      await expect(scene.locator("img")).toHaveAttribute("srcset",new RegExp(`/${film.poster}-400\\.webp 400w, /${film.poster}-720\\.webp 720w`));
      await expect(source).not.toHaveAttribute("src", /.+/);
      await scene.scrollIntoViewIfNeeded();
      await expect(source).toHaveAttribute("src",`/media/home/${film.sharp}`);
      await expect(scene).toHaveAttribute("data-media-quality","sharp-720");
    }
    expect(requested.length).toBeGreaterThanOrEqual(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  } finally {await context.close();}
});

test("Home slow 2G network stays on 540p despite Retina DPR", async ({browser}, testInfo) => {
  const context=await browser.newContext({
    baseURL:testInfo.project.use.baseURL,
    viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,reducedMotion:"no-preference",
  });
  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator,"connection",{
        configurable:true,
        value:{saveData:false,effectiveType:"2g",addEventListener(){}},
      });
    });
    const page=await context.newPage();
    await page.goto("/");
    for(const film of sources){
      const scene=page.locator(`[data-route-id="${film.id}"] [data-home-progressive-cinematic]`);
      await scene.scrollIntoViewIfNeeded();
      await expect(scene.locator("source")).toHaveAttribute("src",`/media/home/${film.original}`);
      await expect(scene).toHaveAttribute("data-media-quality","lite-540");
    }
  } finally {await context.close();}
});

test("Save-Data prevents all three video downloads while WebP fallback is available",async({browser},testInfo)=>{
  const context=await browser.newContext({
    baseURL:testInfo.project.use.baseURL,
    viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,reducedMotion:"no-preference",
  });
  try {
    await context.addInitScript(()=>{
      Object.defineProperty(navigator,"connection",{
        configurable:true,
        value:{saveData:true,effectiveType:"4g",addEventListener(){}},
      });
    });
    const page=await context.newPage();
    const videoRequests:string[]=[];
    page.on("request",req=>{if(/\/media\/home\/.*\\.mp4$/.test(req.url()))videoRequests.push(req.url());});
    await page.goto("/");
    for(const film of sources){
      const scene=page.locator(`[data-route-id="${film.id}"] [data-home-progressive-cinematic]`);
      await scene.scrollIntoViewIfNeeded();
      await expect(scene.locator("source")).not.toHaveAttribute("src",/.+/);
      await expect(scene).toHaveAttribute("data-media-state","poster");
      await expect(scene.locator("img")).toBeVisible();
    }
    expect(videoRequests).toEqual([]);
  }finally{await context.close();}
});
