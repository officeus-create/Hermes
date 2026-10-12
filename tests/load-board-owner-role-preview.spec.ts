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
      actor:{name:"Owner QA",email:"owner-qa@example.invalid"},ownerAccess:true,sourceRegistryRestricted:false,
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

test("Approved shared reviewer can comment, but cannot inspect owner-only source registry",async({page})=>{
  const created:Array<Record<string,unknown>>=[];
  await page.route(api,async route=>route.fulfill({
    status:200,contentType:"application/json",body:JSON.stringify({
      success:true,mode:"REVIEWER_READ_ONLY_ROLE_PREVIEW",ownerAccess:false,sourceRegistryRestricted:true,
      actor:{name:"Dispatch 107 reviewer",email:"shared-qa@example.invalid"},
      roleSwitchGrantsPermissions:false,realCustomerRecordsIncluded:false,
      messagesSent:false,bookingsCreated:false,sources:[],
    })
  }));
  await page.route("**/api/load-board/role-review?*",async route=>route.fulfill({
    status:200,contentType:"application/json",body:JSON.stringify({
      success:true,feedback:created.map((item,i)=>({
        id:String(i),kind:item.kind,authorLabel:item.authorLabel,note:item.note,
        accountEmail:null,createdAt:"2026-10-12T10:00:00Z",
      }))
    })
  }));
  await page.route("**/api/load-board/role-review",async route=>{
    const body=route.request().postDataJSON();
    created.push(body);
    await route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({success:true})});
  });
  await page.goto(route);
  await expect(page.getByRole("heading",{name:"Carrier workspace"})).toBeVisible();
  await expect(page.getByRole("button",{name:"External sources"})).toBeHidden();
  await expect(page.locator("#role-reviewer-admin")).toBeHidden();
  await page.locator("#role-review-author").fill("Staff Reviewer");
  await page.locator("#role-review-form textarea[name='note']").fill("Carrier route filter does not include preferred metro areas");
  await page.getByRole("button",{name:"Save internal feedback"}).click();
  await expect(page.getByText("Carrier route filter does not include preferred metro areas")).toBeVisible();
  await expect(page.getByText("Staff Reviewer", { exact: true })).toBeVisible();
  await expect(page.getByText("Staff Reviewer · null")).toHaveCount(0);
  expect(created).toHaveLength(1);
  expect(created[0].role).toBe("carrier");
  await page.getByRole("button",{name:"Dispatcher",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Dispatcher workspace"})).toBeVisible();
  await expect(page.getByRole("button",{name:"External sources"})).toBeHidden();
});
