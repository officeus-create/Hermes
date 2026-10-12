import {expect,test} from "@playwright/test";

test("approved carrier can rank permitted freight by saved lane without booking",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const loads=[
    {id:"qa-unrelated",origin:"Phoenix, AZ",destination:"Miami, FL",
      equipment:"hotshot",vehicleCount:9,pickupWindow:"TBD",rate:{amount:1800,currency:"USD"}},
    {id:"qa-matching",origin:"Chicago, IL",destination:"Dallas, TX",
      equipment:"car_hauler",vehicleCount:2,pickupWindow:"TBD",rate:{amount:1200,currency:"USD"}},
  ];
  let prefs:Record<string,unknown>={originState:"IL",destinationState:"TX",
    equipment:"car_hauler",availableSlots:7,updatedAt:"2026-10-12T10:00:00Z"};
  let wrote=false;
  await page.route("**/api/load-board/carrier-workspace",route=>route.fulfill({
    status:200,contentType:"application/json",body:JSON.stringify({
      success:true,company:{name:"QA Carrier",type:"carrier"},dispatcher:null,
      loads,interests:[],savedLoadIds:[],bookingAvailable:false,publicSourceContactsExposed:false,
    }),
  }));
  await page.route("**/api/load-board/carrier-lane-preferences",async route=>{
    if(route.request().method()==="POST"){
      prefs=route.request().postDataJSON();wrote=true;
      await route.fulfill({status:200,contentType:"application/json",
        body:JSON.stringify({success:true,preferences:prefs,bookingCreated:false,alertsSent:false})});
      return;
    }
    await route.fulfill({status:200,contentType:"application/json",
      body:JSON.stringify({success:true,preferences:prefs,bookingCreated:false,alertsSent:false})});
  });
  await page.goto("/services/hermes-connect/load-board/carrier/");
  await expect(page.locator("#carrier-loads .wsp-load")).toHaveCount(2);
  await expect(page.locator("#carrier-loads .wsp-load").first()).toContainText("Chicago, IL");
  await expect(page.locator("#carrier-loads .wsp-load").first()).toContainText("4 preference match(es)");
  await expect(page.getByText("No shipper contacts or self-booking.")).toBeVisible();
  await page.locator('[name="originState"]').fill("AZ");
  await page.locator('[name="destinationState"]').fill("FL");
  await page.locator('[name="equipment"]').selectOption("hotshot");
  await page.locator('[name="availableSlots"]').fill("9");
  await page.getByRole("button",{name:"Save route preferences"}).click();
  await expect(page.locator("#carrier-loads .wsp-load").first()).toContainText("Phoenix, AZ");
  await expect(page.locator("#carrier-lane-feedback")).toContainText("Saved.");
  expect(wrote).toBe(true);
  expect(prefs).toMatchObject({originState:"AZ",destinationState:"FL",equipment:"hotshot",availableSlots:9});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+5)).toBe(true);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});
