import { expect, test } from "@playwright/test";

const json=(body:unknown,status=200)=>({status,contentType:"application/json",body:JSON.stringify(body)});
const statusPayload={success:true,runtime:{online:false,last_seen_at:"2026-10-26T12:00:00.000Z",repo_sha:"abc123",runtime_version:"owner-runner-v1"},active_task:null,latest_task:null};
const backlog={success:true,work_items:[{id:"hcwi_demo",workstream:"marketing",priority:"p1",title:"Threads website demand",details:"Review buyer-intent posts and prepare a bounded outreach plan.",source:"voice",status:"planned",created_at:"2026-10-26T12:01:00.000Z",updated_at:"2026-10-26T12:01:00.000Z",linked_task_id:null,linked_task_status:null}]};
const owners={success:true,current_specialist_id:"owner-1",access:[{specialist_id:"owner-1",active:true,email:"owner@example.invalid",name:"Owner",role:"Owner"}]};

async function mockOwner(page:any){
  await page.route("**/api/internal-ai/status",(route:any)=>route.fulfill(json(statusPayload)));
  await page.route("**/api/internal-ai/tasks",(route:any)=>route.fulfill(json({success:true,tasks:[]})));
  await page.route("**/api/internal-command-center/work-items",async (route:any)=>{
    if(route.request().method()==="POST") return route.fulfill(json({success:true,work_item:{...backlog.work_items[0],id:"hcwi_created"}},201));
    return route.fulfill(json(backlog));
  });
  await page.route("**/api/internal-command-center/access",(route:any)=>route.fulfill(json(owners)));
  await page.route("**/api/hermes-connect/account",(route:any)=>route.fulfill(json({success:true,identity:{id:"owner-1",name:"Owner",email:"owner@example.invalid",role:"Owner"},owned_businesses:[],workspaces:[{key:"internal_ai",kind:"capability_workspace",href:"/services/hermes-connect/internal/ai-connect/",available:true,state:{capability:"HERMES_INTERNAL_OWNER"}}],capabilities:{internal_ai:true}})));
}

test.describe("Hermes Business Command Center",()=>{
  test("fails closed for an anonymous session",async({page})=>{
    await page.route("**/api/internal-ai/status",(route:any)=>route.fulfill(json({success:false,error:"not_authenticated"},401)));
    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page).toHaveTitle(/Business Command Center/);
    await expect(page.getByText("Sign in required")).toBeVisible();
    await expect(page.locator("[data-private]")).toBeHidden();
  });

  test("shows cloud backlog and offline runner without losing the owner workspace",async({page})=>{
    await mockOwner(page);
    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page.getByRole("heading",{name:"Business Command Center"})).toBeVisible();
    await expect(page.locator("[data-runner-state]")).toHaveText("Offline");
    await expect(page.locator("[data-backlog-count]")).toHaveText("1");
    await expect(page.getByText("Threads website demand")).toBeVisible();
    await expect(page.getByText(/Cloud backlog remains safe/)).toBeVisible();
    await expect(page.getByText("Cloudflare + D1")).toBeVisible();
    await expect(page.locator("[data-account-workspaces]").getByRole("link",{name:/internal ai/i})).toBeVisible();
  });

  test("captures work into D1 before any agent dispatch",async({page})=>{
    await mockOwner(page);
    let created:any=null;
    await page.unroute("**/api/internal-command-center/work-items");
    await page.route("**/api/internal-command-center/work-items",async (route:any)=>{
      if(route.request().method()==="POST"){created=route.request().postDataJSON();return route.fulfill(json({success:true,work_item:{...backlog.work_items[0],id:"hcwi_created",title:created.title,details:created.details}},201))}
      return route.fulfill(json(backlog));
    });
    await page.goto("/services/hermes-connect/internal/command-center/");
    await page.locator('input[name="title"]').fill("Website offer packaging");
    await page.locator('textarea[name="details"]').fill("Create a phased six-month offer based on measurable revenue checkpoints.");
    await page.getByRole("button",{name:"Save to backlog"}).click();
    await expect.poll(()=>created?.workstream).toBe("marketing");
    expect(created?.details).toContain("six-month offer");
    await expect(page.getByText("Saved to cloud backlog.")).toBeVisible();
  });

  test("exposes Command Center from canonical Connect shell only after owner verification",async({page})=>{
    await page.route("**/api/internal-ai/status",(route:any)=>route.fulfill(json(statusPayload)));
    await page.goto("/services/hermes-connect/");
    await expect(page.locator("[data-hc-owner-command-link]")).toHaveText("Command Center");
    await expect(page.locator("[data-hc-owner-command-link]")).toHaveAttribute("href","/services/hermes-connect/internal/command-center/");
  });

  test("opens one business direction without creating a second dashboard",async({page})=>{
    await mockOwner(page);
    await page.goto("/services/hermes-connect/internal/command-center/?direction=marketing");
    await expect(page.locator("[data-backlog-title]")).toHaveText("Work queue · Marketing");
    await expect(page.getByText("Threads website demand")).toBeVisible();
    await page.getByRole("button",{name:"Show direction work"}).filter({has:page.locator("xpath=ancestor::article[@data-module='logistics']")}).click().catch(()=>{});
  });

  test("keeps the owner page usable at 390px",async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await mockOwner(page);
    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page.getByRole("heading",{name:"Business Command Center"})).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x","scroll");
    await expect(page.locator("[data-work-form]")).toBeVisible();
  });
});
