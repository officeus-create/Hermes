import {test,expect} from "@playwright/test";
const json=(body:unknown,status=200)=>({status,contentType:"application/json",body:JSON.stringify(body)});

test.describe("Hermes AI employee Team View",()=>{
  test("anonymous or revoked visitor cannot see operational data",async({page})=>{
    await page.route("**/api/internal-ai/status",route=>route.fulfill(json({success:false,error:"not_authenticated"},401)));
    await page.goto("/services/hermes-connect/internal/team-view/?lang=ru");
    await expect(page.locator("[data-team-content]")).toBeHidden();
    await expect(page.locator("[data-team-gate]")).toContainText("Войдите в Hermes");
    await expect(page.locator("body")).not.toContainText("Jane Doe");
  });

  test("explicit team viewer gets only safe counts and masked current work",async({page})=>{
    let unsafeMutationCalls=0;
    page.on("request",request=>{if(request.method()!=="GET"&&request.url().includes("/api/internal-"))unsafeMutationCalls++});
    await page.route("**/api/internal-ai/status",route=>route.fulfill(json({
      success:true,access_level:"team",
      runtime:{online:true,operations:{status:"RUNNING",cycle:7,current_task:"Task active — details private",model:null,phase:null}},
      task_summary:{queued:2,running:1,completed:12,needs_approval:1}
    })));
    await page.goto("/services/hermes-connect/internal/team-view/");
    await expect(page.locator("[data-team-content]")).toBeVisible();
    await expect(page.locator("[data-team-status]")).toHaveText("RUNNING");
    await expect(page.locator('[data-count="queued"]')).toHaveText("2");
    await expect(page.locator("[data-team-current]")).toHaveText("Task active · details private");
    await expect(page.locator("[data-team-content]")).not.toContainText("Owner-only");
    await expect(page.getByRole("button")).toHaveCount(0);
    expect(unsafeMutationCalls).toBe(0);
  });

  test("UI masks raw owner task and rejects unknown runner status even on an owner response",async({page})=>{
    await page.route("**/api/internal-ai/status",route=>route.fulfill(json({
      success:true,access_level:"owner",
      runtime:{online:true,operations:{status:"Client Jane Doe private task",cycle:17,current_task:"Jane Doe jane@example.invalid private contract"}}
    })));
    await page.goto("/services/hermes-connect/internal/team-view/");
    await expect(page.locator("[data-team-current]")).toHaveText("Task active · details private");
    await expect(page.locator("[data-team-status]")).toHaveText("—");
    await expect(page.locator("[data-team-content]")).not.toContainText("Jane Doe");
    await expect(page.locator('[data-count="queued"]')).toHaveText("—");
  });
});
