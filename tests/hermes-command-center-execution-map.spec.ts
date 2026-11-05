import { expect, test } from "@playwright/test";

const json = (payload: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(payload),
});

test.describe("Command Center capability execution map", () => {
  test("does not request the execution map for a user without owner access", async ({ page }) => {
    let mapRequests = 0;
    await page.route("**/api/internal-ai/status", route => route.fulfill(json({ success: false, error: "not_authenticated" }, 401)));
    await page.route("**/api/internal-command-center/execution-map", route => {
      mapRequests += 1;
      return route.fulfill(json({ success: false, error: "not_authenticated" }, 401));
    });

    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page.getByText("Sign in required")).toBeVisible();
    await expect(page.locator("[data-private]")).toBeHidden();
    expect(mapRequests).toBe(0);
  });

  test("keeps selected plugin, HAE execution and Windows verification distinct", async ({ page }) => {
    let mapRequests = 0;
    await page.route("**/api/internal-ai/status", route => route.fulfill(json({
      success: true, runtime: { online: false, last_seen_at: null, primary_executor: "windows", primary_executor_verified: false },
      active_task: null, latest_task: null,
    })));
    await page.route("**/api/internal-ai/tasks", route => route.fulfill(json({ success: true, tasks: [] })));
    await page.route("**/api/internal-command-center/work-items", route => route.fulfill(json({ success: true, work_items: [] })));
    await page.route("**/api/internal-command-center/access", route => route.fulfill(json({ success: true, current_specialist_id: "owner-1", access: [], team_access: [] })));
    await page.route("**/api/internal-command-center/processes", route => route.fulfill(json({ success: true, processes: [] })));
    await page.route("**/api/internal-command-center/projects*", route => route.fulfill(json({ success: true, projects: [] })));
    await page.route("**/api/hermes-connect/account", route => route.fulfill(json({ success: true, identity: { id: "owner-1", role: "Owner" }, owned_businesses: [], workspaces: [] })));
    await page.route("**/api/internal-command-center/reports", route => route.fulfill(json({ success:true, schedules:[], reports:[] })));
    await page.route("**/api/internal-command-center/owner-intelligence", route => route.fulfill(json({ success:true, knowledge:{state:"REVIEW_GATED",sources:[],automatic_promotion:false}, investor:{state:"EVENT_TRIGGER_ONLY"} })));
    await page.route("**/api/internal-command-center/social-acquisition", route => route.fulfill(json({ success:true, checked_at:"2026-11-01T12:00:00.000Z", content_queue:{source_state:"CONNECTED",items:[]}, publication_receipts:{source_state:"CONNECTED",items:[]}, carrier_leads:{source_state:"UNKNOWN",count:null} })));
    await page.route("**/api/internal/social/threads/connections", route => route.fulfill(json({ success:true, runtime_configured:false, connections:[] })));
    await page.route("**/api/internal-command-center/execution-map", route => {
      mapRequests += 1;
      return route.fulfill(json({
        success: true, checked_at: "2026-11-01T12:00:00.000Z",
        tasks: [{
          id: "w-route", title: "Verify safe plugin routing", workstream: "technology", priority: "p0",
          owner_status: "planned", current_stage: "PLANNED", next_action: "Review before dispatch",
          stage_chain: [{ stage: "ASSIGNED", state: "pending" }, { stage: "EXECUTED", state: "unknown" }],
          executor: { surface: "UNASSIGNED", plugin_role_id: null },
          plugin_route_consistency: { state: "SNAPSHOT_VERSION_MATCHED_NOT_EXECUTED", mismatched_roles: [] },
          plugin_route: {
            state: "PLUGIN_SELECTED_NOT_EXECUTED", policy_version: "command-center-route-v1",
            owner: { role_id: "hermes-technology-developer", plugin_version: "0.1.60" }, helpers: [],
          },
          live_state: "UNKNOWN", business_result_state: "UNKNOWN", eligible_capabilities: [], evidence: {},
        }],
        human_work: { source_state: "NOT_CONFIGURED", tasks: [] },
        github_developments: { source_state: "PRIVATE_OR_NOT_FOUND", pulls: [] },
        plugin_registry: [{ role_id:"hermes-technology-developer", plugin_version:"0.1.61", observed_at:"2026-11-01T12:00:00.000Z" }],
        registry_evidence: { fresh: false, reason:"STALE_EVIDENCE" },
        developments: {
          systems: [{ kind: "EXECUTOR", id: "viktor-windows", label: "Hermes AI · VIKTOR · Windows (assigned primary)", status: "RUNTIME_UNVERIFIED" }],
          plugins: [], automation: [],
        },
      }));
    });

    await page.goto("/services/hermes-connect/internal/command-center/");
    await expect(page.locator("[data-private]")).toBeVisible();
    const direct = page.locator('.hcc-nav [data-cc-nav="executions"]:visible');
    if (await direct.count()) await direct.first().click();
    else {
      const more = page.locator("details.hcc-private-nav-drawer");
      await expect(more).toBeVisible();
      await more.locator("summary").click();
      await more.locator('[data-cc-nav="executions"]').click();
    }
    await expect(page.locator("[data-execution-list]")).toContainText("Verify safe plugin routing");
    await expect(page.locator("[data-execution-list]")).toContainText("PLUGIN_SELECTED_NOT_EXECUTED");
    await expect(page.locator("[data-execution-list]")).toContainText("SNAPSHOT_VERSION_MATCHED_NOT_EXECUTED");
    await expect(page.locator("[data-execution-list]")).toContainText("UNASSIGNED");
    await expect(page.locator("[data-development-list]")).toContainText("RUNTIME_UNVERIFIED");
    const pluginDirect=page.locator('.hcc-nav [data-cc-nav="plugins"]:visible');
    if(await pluginDirect.count()) await pluginDirect.first().click(); else { const more=page.locator("details.hcc-private-nav-drawer"); if(!(await more.getAttribute("open"))) await more.locator("summary").click(); await more.locator('[data-cc-nav="plugins"]').click(); }
    await expect(page.locator('[data-cc-view="plugins"] [data-plugin-registry]')).toContainText("hermes-technology-developer");
    await expect(page.locator('[data-cc-view="plugins"] [data-plugin-registry]')).toContainText("@0.1.61");
    await expect(page.locator('[data-cc-view="plugins"] [data-plugin-registry]')).toContainText(/canonical HAE receipt is required/i);
    expect(mapRequests).toBe(1);
  });
});
