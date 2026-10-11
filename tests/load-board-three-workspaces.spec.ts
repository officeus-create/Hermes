import {test,expect} from "@playwright/test";

const base="/services/hermes-connect/load-board/";
for(const [slug,heading] of [
 ["carrier","Your loads. Your dispatcher."],
 ["dispatcher","Carrier requests, one work queue."],
 ["partners","Transport requests, in one place."],
 ["operations","Carrier access and dispatcher assignments"],
] as const){
 test(`Private Load Board ${slug} renders at 390px and desktop without fabricated inventory`,async({page})=>{
   await page.goto(base+slug+"/");
   await expect(page.getByRole("heading",{name:heading})).toBeVisible();
   await expect(page.locator("meta[name='robots']")).toHaveAttribute("content",/noindex/);
   await expect(page.locator("body")).not.toContainText("Booking confirmed");
   await expect(page.locator("body")).not.toContainText("22,000 available loads");
   const documentWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
   const viewport=page.viewportSize();
   expect(documentWidth).toBeLessThanOrEqual((viewport?.width||1200)+5);
 });
}
test("Carrier off-hours view never provides direct shipper booking",async({page})=>{
 await page.goto(base+"carrier/");
 await expect(page.getByText("No shipper contacts or self-booking.")).toBeVisible();
 await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});
test("Dealer and Shipper form requires explicit posting rights",async({page})=>{
 await page.goto(base+"partners/");
 const form=page.locator("#partner-post");
 await expect(form.locator('input[name="rights_attested"]')).toHaveAttribute("required","");
 await expect(form.getByRole("button",{name:/Submit permitted transport request/})).toHaveCount(1);
});
