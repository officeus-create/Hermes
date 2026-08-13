import { expect, test } from "@playwright/test";
const consentModule = "/demos/hermes-connect/connect-analytics-consent.mjs";
test("Connect drops events before consent and translates only approved future dataLayer events", async ({ page }) => {
  const googleRequests: string[] = [];
  await page.route("https://www.googletagmanager.com/**", async (route) => { googleRequests.push(route.request().url()); await route.fulfill({ status: 200, contentType: "application/javascript", body: "" }); });
  await page.goto("/demos/hermes-connect/load-analyzer/"); await page.addScriptTag({ type: "module", url: consentModule }); await expect(page.getByRole("button", { name: "Privacy" })).toBeVisible();
  await page.evaluate(() => { const layer=(window.dataLayer??=[]); layer.push({event:"load_analyzer_start",page_group:"hermes_connect_load_analyzer",page_path:window.location.pathname,module_id:"load_analyzer"}); });
  expect(await page.evaluate(()=>window.dataLayer?.length??-1)).toBe(0); expect(googleRequests).toHaveLength(0);
  await page.getByRole("button",{name:"Privacy"}).click(); await page.getByRole("button",{name:"Allow analytics"}).click(); await expect.poll(()=>googleRequests.length).toBeGreaterThan(0);
  await page.evaluate(()=>{const layer=(window.dataLayer??=[]);layer.push({event:"load_analyzer_complete",page_group:"hermes_connect_load_analyzer",page_path:window.location.pathname,module_id:"load_analyzer",route:"private-route-value"});layer.push({event:"load_analyzer_complete",page_group:"hermes_connect_load_analyzer",page_path:window.location.pathname,module_id:"load_analyzer"});});
  const commands=await page.evaluate(()=> (window.dataLayer??[]).map(item=>item&&typeof item==="object"&&"length" in item?Array.from(item as unknown as ArrayLike<unknown>):[item]));
  const completed=commands.filter(item=>item[0]==="event"&&item[1]==="load_analyzer_complete"); expect(completed).toHaveLength(1); expect(JSON.stringify(completed)).not.toContain("private-route-value"); expect(JSON.stringify(completed)).toContain('"module_id":"load_analyzer"');
});
test("Connect asks for a choice when consent is unknown and never loads GA4 before that choice", async ({ page }) => {
  const googleRequests:string[]=[]; await page.route("https://www.googletagmanager.com/**",async route=>{googleRequests.push(route.request().url());await route.abort();});
  await page.goto("/demos/hermes-connect/search-opportunity-radar/"); await page.evaluate(()=>localStorage.removeItem("hermes-analytics-consent")); await page.addScriptTag({type:"module",url:consentModule});
  await expect(page.getByRole("dialog",{name:"Hermes Connect analytics choices"})).toBeVisible(); expect(googleRequests).toHaveLength(0);
  await page.evaluate(()=>{const layer=(window.dataLayer??=[]);layer.push({event:"search_radar_view",page_group:"hermes_connect_search_radar",page_path:window.location.pathname,module_id:"search_opportunity_radar"});}); expect(await page.evaluate(()=>window.dataLayer?.length??-1)).toBe(0); expect(googleRequests).toHaveLength(0);
  await page.getByRole("button",{name:"Decline"}).click(); expect(await page.evaluate(()=>localStorage.getItem("hermes-analytics-consent"))).toBe("denied"); expect(googleRequests).toHaveLength(0);
});
