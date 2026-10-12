import { expect, test } from "@playwright/test";

const route="/services/hermes-connect/load-board/role-preview/";
const api="**/api/load-board/owner-role-preview";

test("Owner Load Board review denies anonymous role data", async ({page}) => {
  await page.route(api, async request => {
    await request.fulfill({status:401,contentType:"application/json",body:JSON.stringify({success:false,error:"authentication_required"})});
  });
  await page.goto(route);
  await expect(page.getByText("Sign in required to view owner role previews.")).toBeVisible();
  await expect(page.locator("#owner-role-content")).toBeHidden();
  await expect(page.getByRole("link",{name:"Sign in to Hermes Connect"})).toBeVisible();
});

test("Owner reviews four roles and source registry without changing records",async({page})=>{
  const calls:string[]=[];
  await page.route(api,async request=>{
    calls.push(request.request().method());
    await request.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
      success:true,mode:"OWNER_READ_ONLY_ROLE_PREVIEW",
      actor:{name:"Owner QA",email:"owner-qa@example.invalid"},
      roleSwitchGrantsPermissions:false,realCustomerRecordsIncluded:false,
      messagesSent:false,bookingsCreated:false,
      sources:[{id:"test-source",provider:"ExampleProvider",label:"QA source",type:"manual",
        sourceStatus:"pending",readEnabled:false,ingestEnabled:false,
        redistributionPermission:"internal_only",lastSuccessfulSync:null}]
    })});
  });
  await page.goto(route);
  await expect(page.getByRole("heading",{name:"Carrier workspace"})).toBeVisible();
  await expect(page.getByText("Request through dispatcher")).toBeDisabled();
  await page.getByRole("button",{name:"Dispatcher",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Dispatcher workspace"})).toBeVisible();
  await page.getByRole("button",{name:"Dealer / Shipper",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Dealer / Shipper workspace"})).toBeVisible();
  await page.getByRole("button",{name:"Broker",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Broker view — design preview only"})).toBeVisible();
  await page.getByRole("button",{name:"External sources"}).click();
  await expect(page.getByText("QA source")).toBeVisible();
  await expect(page.getByText("Last recorded successful sync: not recorded",{exact:false})).toBeVisible();
  expect(calls).toEqual(["GET"]);
  const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+5);
  expect(noOverflow).toBeTruthy();
});
