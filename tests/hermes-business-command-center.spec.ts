import { expect, test } from "@playwright/test";

const json=(body:unknown,status=200)=>({status,contentType:"application/json",body:JSON.stringify(body)});
const statusPayload={success:true,runtime:{online:false,last_seen_at:"2026-10-26T12:00:00.000Z",repo_sha:"abc123",runtime_version:"owner-runner-v1"},active_task:null,latest_task:null};
const backlog={success:true,work_items:[{id:"hcwi_demo",workstream:"marketing",priority:"p1",title:"Threads website demand",details:"Review buyer-intent posts and prepare a bounded outreach plan.",source:"voice",status:"planned",created_at:"2026-10-26T12:01:00.000Z",updated_at:"2026-10-26T12:01:00.000Z",linked_task_id:null,linked_task_status:null}]};
const processPayload={id:"haep_demo",name:"AI gateway readiness",job_type:"ai.gateway.readiness.audit",business_lane:"automation",workstream:"technology",role_id:"hermes-automatic-engineer",cadence_hours:6,status:"paused",next_run_at:null,last_run_at:null,last_job_id:null,last_job_state:null,last_error_class:null,template_label:"AI gateway readiness",template_label_ru:"Готовность AI gateway"};
const owners={success:true,current_specialist_id:"owner-1",access:[{specialist_id:"owner-1",active:true,email:"owner@example.invalid",name:"Owner",role:"Owner"}]};
const projectRegistry={success:true,source_class:"BOUNDED_CANONICAL_SNAPSHOT",checked_at:"2026-10-28T15:30:00+02:00",projects:[{id:"hermes-command-center",title:"Hermes Business Command Center",department:"technology",purpose:"One owner workspace for projects, CRM work, HAE processes, AI execution and evidence.",owner_role:"hermes-technology-developer",agent_role:"Hermes Technology Developer",plugin_roles:["hermes-agent-coordinator"],dependency_ids:[],related_ids:["hae-runtime"],status:"blocked",evidence_level:"EXACT_HEAD_CI_GREEN",progress:{completed:6,total:9,percent:67},work_items_summary:{total:1,open:1,done:0,blocked:0},eta:null,eta_label:"UNKNOWN",eta_basis:"No deterministic completion history is available yet.",blockers:["Independent review remains."],milestones:[{id:"owner-backlog",label:"Owner backlog and D1 capture",state:"done"},{id:"production",label:"Authenticated production owner readback",state:"planned"}],links:[{label:"PR #2107",href:"https://github.com/officeus-create/Hermes/pull/2107"}]}]};

async function openOwnerView(page:any,key:string){
  const direct=page.locator(`.hcc-nav [data-cc-nav="${key}"]:visible`);
  if(await direct.count()){await direct.first().click();return}
  const drawer=page.locator("details.hcc-private-nav-drawer");
  await expect(drawer).toBeVisible();
  if(!(await drawer.getAttribute("open"))) await drawer.locator("summary").click();
  await drawer.locator(`[data-cc-nav="${key}"]`).click();
}

async function mockOwner(page:any){
  await page.route("**/api/internal-ai/status",(route:any)=>route.fulfill(json(statusPayload)));
  await page.route("**/api/internal-ai/tasks",(route:any)=>route.fulfill(json({success:true,tasks:[]})));
  await page.route("**/api/internal-command-center/work-items",async (route:any)=>{
    if(route.request().method()==="POST") return route.fulfill(json({success:true,work_item:{...backlog.work_items[0],id:"hcwi_created"}},201));
    return route.fulfill(json(backlog));
  });
  await page.route("**/api/internal-command-center/access",(route:any)=>route.fulfill(json(owners)));
  await page.route("**/api/internal-command-center/processes",(route:any)=>route.fulfill(json({success:true,runtime_owner:"hermes-automation-engine",tick_interval:"hourly",normal_loop_requires_chat:false,automatic_paid_ai_cost_usd:0,processes:[]})));
  await page.route("**/api/internal-command-center/projects*",(route:any)=>route.fulfill(json(projectRegistry)));
  await page.route("**/api/hermes-connect/account",(route:any)=>route.fulfill(json({success:true,identity:{id:"owner-1",name:"Owner",email:"owner@example.invalid",role:"Owner"},owned_businesses:[],workspaces:[{key:"internal_ai",kind:"capability_workspace",href:"/services/hermes-connect/internal/ai-connect/",available:true,state:{capability:"HERMES_INTERNAL_OWNER"}}],capabilities:{internal_ai:true}})));
  await page.route("**/api/internal-command-center/reports",(route:any)=>route.fulfill(json({success:true,schedules:[],reports:[]})));
  await page.route("**/api/internal-command-center/owner-intelligence",(route:any)=>route.fulfill(json({success:true,knowledge:{state:"REVIEW_GATED",sources:[],automatic_promotion:false},investor:{state:"EVENT_TRIGGER_ONLY"},self_learning_project:null})));
  await page.route("**/api/internal-command-center/execution-map",(route:any)=>route.fulfill(json({
    success:true,checked_at:"2026-11-01T20:00:00.000Z",tasks:[],developments:{systems:[],plugins:[],automation:[]},
    human_work:{source_state:"NOT_CONFIGURED",tasks:[]},github_developments:{source_state:"NOT_CONFIGURED",pulls:[]},
    department_kpis:[],provider_health:[],
    plugin_registry:[{role_id:"hermes-agent-coordinator",plugin_version:"0.1.86",observed_at:"2026-11-01T19:48:39.016Z"}],
    registry_evidence:{fresh:true,reason:"FRESH_EVIDENCE"}
  })));
  await page.route("**/api/internal-command-center/social-acquisition",(route:any)=>route.fulfill(json({
    success:true,checked_at:"2026-11-01T20:00:00.000Z",
    content_queue:{source_state:"CONNECTED",items:[{content_id:"c1",account_key:"progressopro",platform:"threads",slot_key:"slot-1",state:"ready",updated_at:"2026-11-01T19:59:00.000Z"}]},
    publication_receipts:{source_state:"CONNECTED",items:[]},
    carrier_leads:{source_state:"UNKNOWN",count:null,reason:"NO_CANONICAL_CROSS_SOURCE_CARRIER_LEAD_AGGREGATE"}
  })));
  await page.route("**/api/internal/social/threads/connections",(route:any)=>route.fulfill(json({
    success:true,runtime_configured:true,connections:[{brand:"progressopro",label:"ProgressoPro",state:"connected_verified",identity_verified:true,publish_enabled:false,granted_scopes:["threads_basic"],token_expires_at:"2026-12-01T00:00:00.000Z",token_expired:false}]
  })));
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
    await expect(page.getByRole("heading",{name:"Business Command Center",exact:true})).toBeVisible();
    await expect(page.locator("[data-runner-state]")).toHaveText("Offline");
    await expect(page.locator("[data-backlog-count]")).toHaveText("1");
    await expect(page.locator("[data-today-list]").getByText("Threads website demand",{exact:true})).toBeVisible();
    await expect(page.locator("[data-runner-copy]")).toHaveText("Internal AI runner heartbeat unavailable; cloud backlog preserved");
    await expect(page.getByText("Cloudflare + D1")).toBeVisible();
    await openOwnerView(page,"access");
    await expect(page.locator("[data-account-workspaces]").getByRole("link",{name:/internal ai/i})).toBeVisible();
  });

  test("keeps the owner work queue readable when the project registry is unavailable",async({page})=>{
    await mockOwner(page);
    await page.unroute("**/api/internal-command-center/projects*");
    await page.route("**/api/internal-command-center/projects*",(route:any)=>route.fulfill(json({success:false,error:"temporary_unavailable"},503)));
    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page.locator("[data-backlog-count]")).toHaveText("1");
    await expect(page.locator("[data-today-list]").getByText("Threads website demand",{exact:true})).toBeVisible();
    await openOwnerView(page,"tasks");
    await expect(page.locator("[data-work-list]").getByText("Threads website demand")).toBeVisible();
  });

  test("creates and edits a cloud project without changing canonical project cards",async({page})=>{
    await mockOwner(page);
    await page.unroute("**/api/internal-command-center/projects*");
    let created:any=null;
    const stamp="2026-10-29T10:00:00.000Z";
    await page.route(/\/api\/internal-command-center\/projects(?:\/[^/?]+)?(?:\?.*)?$/,async(route:any)=>{
      const req=route.request();
      if(req.method()==="POST"){
        const payload=req.postDataJSON();
        created={id:"hcpr_11111111-1111-4111-8111-111111111111",title:payload.title,department:payload.department,purpose:payload.purpose,status:"planned",editable:true,progress:{completed:0,total:0,percent:null},evidence_level:"OWNER_MANAGED_UNVERIFIED",owner_role:"Hermes owner",agent_role:"Not assigned",plugin_roles:[],dependency_ids:[],milestones:[],links:[],eta_label:"UNKNOWN",eta_basis:"Owner maintained",updated_at:stamp};
        return route.fulfill(json({success:true,project:created},201));
      }
      if(req.method()==="PATCH"){
        const payload=req.postDataJSON();
        created={...created,title:payload.title,department:payload.department,purpose:payload.purpose,status:payload.status,updated_at:"2026-10-29T10:01:00.000Z"};
        return route.fulfill(json({success:true,project:created}));
      }
      return route.fulfill(json({...projectRegistry,projects:[...projectRegistry.projects,...(created?[created]:[])],next_offset:null}));
    });
    await page.goto("/services/hermes-connect/internal/command-center/");
    await openOwnerView(page,"projects");
    await page.locator('input[name="new_project_title"]').fill("Land and Tenders CRM");
    await page.locator('textarea[name="new_project_purpose"]').fill("Track land sales and official tenders.");
    await page.getByRole("button",{name:"Save new project to D1"}).click();
    await expect(page.getByRole("heading",{name:"Land and Tenders CRM"})).toBeVisible();
    await expect(page.getByText("Progress UNKNOWN · owner-created project")).toBeVisible();
    const card=page.locator('[data-project-id="hcpr_11111111-1111-4111-8111-111111111111"]');
    await card.getByRole("button",{name:"Edit project"}).click();
    await page.locator('input[name="edit_project_title"]').fill("Land CRM — verified leads");
    await page.locator('select[name="edit_project_status"]').selectOption("in_progress");
    await page.getByRole("button",{name:"Save to cloud"}).click();
    await expect(page.getByRole("heading",{name:"Land CRM — verified leads"})).toBeVisible();
    await expect(page.getByRole("heading",{name:"Hermes Business Command Center",exact:true})).toBeVisible();
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
    await page.getByRole("button",{name:/New task/}).first().click();
    await page.locator('select[name="project_id"]').selectOption("hermes-command-center");
    await page.locator('input[name="title"]').fill("Website offer packaging");
    await page.locator('textarea[name="details"]').fill("Create a phased six-month offer based on measurable revenue checkpoints.");
    await page.getByRole("button",{name:"Save to backlog"}).click();
    await expect.poll(()=>created?.workstream).toBe("marketing");
    expect(created?.project_id).toBe("hermes-command-center");
    expect(created?.details).toContain("six-month offer");
    await expect(page.locator("[data-owner-toast]")).toHaveText("Saved to cloud backlog.");
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
    await expect(page.locator("[data-work-list]").getByText("Threads website demand",{exact:true})).toBeVisible();
    await openOwnerView(page,"projects");
    await page.locator('article[data-module="logistics"] button[data-focus-workstream="logistics"]').click();
    await expect(page.locator("[data-backlog-title]")).toHaveText("Work queue · Logistics");
    await expect(page).toHaveURL(/direction=logistics/);
  });

  test("keeps completed AI execution in owner acceptance review",async({page})=>{
    await mockOwner(page);
    const reviewItem={...backlog.work_items[0],id:"hcwi_review",status:"awaiting_acceptance",linked_task_id:"hit_review",linked_task_status:"completed",linked_task_output_summary:"PR and test evidence are ready for review."};
    await page.unroute("**/api/internal-command-center/work-items");
    await page.route("**/api/internal-command-center/work-items",(route:any)=>route.fulfill(json({success:true,work_items:[reviewItem]})));
    let accepted=false;
    await page.route("**/api/internal-command-center/work-items/hcwi_review",async(route:any)=>{
      accepted=route.request().postDataJSON()?.action==="accept";
      return route.fulfill(json({success:true,work_item:{...reviewItem,status:"done",accepted_by:"owner-1",accepted_at:"2026-10-27T12:00:00.000Z"}}));
    });
    await page.goto("/services/hermes-connect/internal/command-center/");
    await page.getByRole("button",{name:"Tasks",exact:true}).click();
    await expect(page.getByText("Execution finished. Review the evidence before accepting the business result.")).toBeVisible();
    await expect(page.locator("[data-work-list] .output-summary")).toContainText("PR and test evidence are ready for review.");
    await page.getByRole("button",{name:"Accept result"}).click();
    await expect.poll(()=>accepted).toBe(true);
  });

  test("configures and activates one zero-cost HAE process without a chat runtime",async({page})=>{
    await mockOwner(page);
    let created:any=null,activated=false;
    await page.unroute("**/api/internal-command-center/processes");
    await page.route("**/api/internal-command-center/processes",async(route:any)=>{
      if(route.request().method()==="POST"){
        created=route.request().postDataJSON();
        return route.fulfill(json({success:true,process:{...processPayload,name:created.name||processPayload.name,job_type:created.job_type,cadence_hours:created.cadence_hours}},201));
      }
      return route.fulfill(json({success:true,processes:[processPayload]}));
    });
    await page.route("**/api/internal-command-center/processes/haep_demo",async(route:any)=>{
      activated=route.request().postDataJSON()?.action==="activate";
      return route.fulfill(json({success:true,process:{...processPayload,status:"active",next_run_at:"2026-10-28T12:00:00.000Z"}}));
    });
    await page.goto("/services/hermes-connect/internal/command-center/");
    await openOwnerView(page,"automations");
    await expect(page.getByRole("heading",{name:"HAE 24/7 processes"})).toBeVisible();
    await expect(page.locator("[data-process-list]").getByText("AI gateway readiness",{exact:true})).toBeVisible();
    await page.getByRole("button",{name:"Activate"}).click();
    await expect.poll(()=>activated).toBe(true);
    const form=page.locator("[data-process-form]");
    await form.locator('select[name="job_type"]').selectOption("academy.english.practice.build");
    await form.locator('input[name="name"]').fill("Daily English practice");
    await form.getByRole("button",{name:"Create paused"}).click();
    await expect.poll(()=>created?.cadence_hours).toBe(24);
    expect(created?.job_type).toBe("academy.english.practice.build");
  });

  test("shows Live Operations and opens HAE, Social, Plugins and Executions without creating another runtime",async({page})=>{
    await mockOwner(page);
    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page.locator("[data-live-threads-state]")).toHaveText("Connected");
    await expect(page.locator("[data-live-hae-state]")).toHaveText("Configured");
    await expect(page.locator("[data-live-automation-state]")).toHaveText("UNKNOWN");
    await expect(page.locator("[data-live-ai-state]")).toHaveText("Offline");
    await openOwnerView(page,"hae");
    await expect(page.locator('[data-cc-view="hae"]')).toBeVisible();
    await expect(page.locator("[data-hae-owner]")).toHaveText("hermes-automation-engine");
    await expect(page.locator("[data-hae-loop]")).toHaveText("hourly");
    await expect(page.locator("[data-hae-cost]")).toHaveText("$0");
    await openOwnerView(page,"social");
    await expect(page.locator('[data-cc-view="social"]')).toBeVisible();
    await expect(page.locator("[data-social-content-count]")).toHaveText("1");
    await expect(page.locator("[data-social-connections]")).toContainText("ProgressoPro");
    await expect(page.locator('[data-cc-view="social"]')).toContainText(/DRAFT_ONLY/);
    await expect(page.locator('[data-cc-view="social"]')).toContainText(/Carrier Leads/);
    await expect(page.locator('[data-cc-view="social"]')).toContainText(/UNKNOWN/);

    await openOwnerView(page,"plugins");
    await expect(page.locator('[data-cc-view="plugins"]')).toBeVisible();
    await expect(page.locator('[data-cc-view="plugins"] [data-plugin-registry]')).toContainText("hermes-agent-coordinator");
    await expect(page.locator('[data-cc-view="plugins"] [data-plugin-registry]')).toContainText("@0.1.86");
    await expect(page.locator('[data-cc-view="plugins"]')).toContainText(/separate HAE receipt/);

    await openOwnerView(page,"executions");
    await expect(page.locator('[data-cc-view="executions"]')).toBeVisible();
    await expect(page.locator("[data-execution-map]")).toBeVisible();
  });

  test("offers the local AI Agents UI with a cloud fallback",async({page})=>{
    await mockOwner(page);
    await page.goto("/services/hermes-connect/internal/command-center/");
    await openOwnerView(page,"agents");
    const local=page.locator("[data-local-agents-open]");
    await expect(local).toHaveAttribute("href","http://127.0.0.1:8765/ai-agents/?utm_source=chatgpt.com");
    await expect(local).toHaveAttribute("target","_blank");
    await expect(page.locator("[data-local-agents-fallback]")).toHaveAttribute("href","/services/hermes-connect/internal/ai-connect/");
  });

  test("shows the owner project map with evidence-derived progress and unknown ETA",async({page})=>{
    await mockOwner(page);
    await page.goto("/services/hermes-connect/internal/command-center/");
    await openOwnerView(page,"projects");
    const project=page.locator('[data-project-id="hermes-command-center"]');
    await expect(page.getByRole("heading",{name:"Every Hermes initiative in one structure"})).toBeVisible();
    await expect(project.getByRole("heading",{name:"Hermes Business Command Center"})).toBeVisible();
    await expect(project.getByRole("progressbar",{name:"Project progress"})).toHaveAttribute("aria-valuenow","67");
    await expect(project).toContainText("D1 tasks: 1 · 1 unfinished · 0 done · 0 blocked");
    await expect(project).toContainText("UNKNOWN");
    await expect(project.getByRole("link",{name:/PR #2107/})).toHaveAttribute("href","https://github.com/officeus-create/Hermes/pull/2107");
  });

  test("keeps the canonical public Command Center synthetic, useful and private-data free",async({page})=>{
    await page.goto("/services/hermes-connect/command-center/");
    const demo=page.locator("[data-public-command-center-preview]");
    await expect(page.getByRole("heading",{name:"Hermes Business Command Center",exact:true})).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/index,follow/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href","https://hermeslogisticsus.com/services/hermes-connect/command-center/");
    await expect(page.locator("html")).toHaveAttribute("lang","en");
    await expect(demo.getByText(/SAMPLE DATA/)).toBeVisible();
    await expect(demo.getByRole("heading",{name:"How one operating layer comes together"})).toBeVisible();
    await demo.getByRole("tab",{name:"Evidence"}).click();
    await expect(demo.getByText(/Exact-SHA deployment/)).toBeVisible();
    await expect(page.getByRole("link",{name:"Request a Command Center"}).first()).toHaveAttribute("href","/contacts/?path=technology&utm_source=business_command_center");
    await expect(page.locator("body")).not.toContainText("HERMES_INTERNAL_OWNER");
    await expect(page.locator("body")).not.toContainText("#2107");
  });

  test("localizes the canonical public Command Center in Russian without changing the public data boundary",async({page})=>{
    await page.goto("/services/hermes-connect/command-center/?lang=ru");
    await expect(page.locator("html")).toHaveAttribute("lang","ru");
    await expect(page.getByRole("heading",{name:"Не ещё один dashboard. Слой принятия решений."})).toBeVisible();
    await expect(page.locator("[data-public-command-center-preview] p.hcc-sample")).toContainText("SAMPLE DATA");
    await expect(page.getByText("Без внутренних данных Hermes")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/index,follow/);
  });

  test("routes the authorized Hermes owner directly to Command Center after normal sign-in",async({page})=>{
    // Synthetic routing test: identity and granted capability are mocked, never a real login.
    await page.route("**/api/auth/me",(route:any)=>route.fulfill(json({success:false,error:"not_authenticated"},401)));
    await page.route("**/api/auth/login",(route:any)=>route.fulfill(json({success:true})));
    await page.route("**/api/hermes-connect/account",(route:any)=>route.fulfill(json({
      success:true,capabilities:{internal_ai:true},
      owned_businesses:[{href:"/services/hermes-connect/repair-shops/dashboard/"}],
    })));
    await page.goto("/services/hermes-connect/access/?lang=ru");
    await expect(page.locator("[data-access-form]")).toBeVisible();
    await page.locator('[data-access-form] input[name="email"]').fill("owner@example.invalid");
    await page.locator('[data-access-form] input[name="password"]').fill("synthetic-test-only");
    await page.locator("[data-access-form] button[type=submit]").click();
    await expect(page).toHaveURL(/\/services\/hermes-connect\/internal\/command-center\/\?lang=ru$/);
  });

  test("keeps the owner page usable at 390px",async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await mockOwner(page);
    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page.getByRole("heading",{name:"Business Command Center",exact:true})).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x","scroll");
    const drawer=page.locator("details.hcc-private-nav-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer).not.toHaveAttribute("open","");
    await drawer.locator("summary").click();
    await expect(page.getByRole("button",{name:"Overview",exact:true})).toHaveClass(/is-active/);
    await page.getByRole("button",{name:"Evidence / QA",exact:true}).click();
    await expect(page.locator('[data-cc-view="evidence"]')).toBeVisible();
    await drawer.locator("summary").click();
    await page.getByRole("button",{name:"Overview",exact:true}).click();
    await page.getByRole("button",{name:/New task/}).first().click();
    await expect(page.locator("[data-work-form]")).toBeVisible();
  });
});
