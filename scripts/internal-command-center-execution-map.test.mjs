import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  currentStageForWorkItem,
  developmentCatalog,
  eligibleCapabilitiesForWorkstream,
  executionProjection,
  pluginRouteConsistency,
  linkHumanWorkDevelopments,
  nextActionForWorkItem,
  stageChainForWorkItem,
} from "../functions/api/_lib/command-center-execution-map.mjs";
import { clickupAuthorization, normalizeClickUpTask, readClickUpHumanTasks } from "../functions/api/_lib/command-center-clickup.mjs";
import { normalizeGithubPull, observedGithubCheckState, parseAgentWorkPassport, projectGithubReviews, readGithubDevelopments } from "../functions/api/_lib/command-center-github.mjs";
import { buildDepartmentKpis, readDepartmentKpiSources } from "../functions/api/_lib/command-center-department-kpis.mjs";
import { buildProviderHealth } from "../functions/api/_lib/command-center-provider-health.mjs";

const readModelEndpointSource=readFileSync(new URL("../functions/api/internal-command-center/execution-map.ts",import.meta.url),"utf8");
const executionMapUiSource=readFileSync(new URL("../src/components/HermesExecutionMap.astro",import.meta.url),"utf8");
assert.doesNotMatch(readModelEndpointSource,/\breconcileWorkItems\s*\(/,"Evidence read must not mutate canonical owner work statuses as an incidental side effect");
assert.match(readModelEndpointSource,/readDepartmentKpiSources\(env\.DB, checkedAt\)/,"Department KPIs must be read from canonical sources through the owner read model");
assert.match(readModelEndpointSource,/department_kpis/,"Owner read model must expose department KPI projection");
assert.match(readModelEndpointSource,/provider_health/,"Owner read model must expose provider health without a provider mirror");
assert.match(readModelEndpointSource,/plugin_registry:\s*registrySnapshot\.entries\.map/,"Owner read model must expose only minimized plugin registry metadata");
assert.match(readModelEndpointSource,/role_id, plugin_version, observed_at/,"Plugin registry projection must remain role/version/time only");
assert.match(executionMapUiSource,/independent_review_state/,"Execution Map UI must surface independent review evidence separately");
assert.match(executionMapUiSource,/github\.enrichment_state/,"Execution Map UI must expose GitHub enrichment scope/state");

const registry=[
  {role_id:"hermes-agent-coordinator",plugin_version:"0.1.71",observed_at:"2026-10-27"},
  {role_id:"hermes-technology-developer",plugin_version:"0.1.56",observed_at:"2026-10-27"},
  {role_id:"hermes-automatic-engineer",plugin_version:"0.1.26",observed_at:"2026-10-27"},
  {role_id:"hermes-qa-evidence-auditor",plugin_version:"0.1.8",observed_at:"2026-10-27"},
  {role_id:"hermes-knowledge-curator",plugin_version:"0.1.81",observed_at:"2026-10-27"},
];

assert.deepEqual(eligibleCapabilitiesForWorkstream("sales",registry).map(x=>x.role_id),["hermes-agent-coordinator"]);
assert.equal(currentStageForWorkItem({status:"in_progress",linked_task_status:"running",linked_task_id:"t1"}),"STARTED");
assert.equal(currentStageForWorkItem({status:"in_progress",linked_task_status:"completed",linked_task_id:"t1"}),"EXECUTED");
assert.equal(currentStageForWorkItem({status:"done",acceptance_status:"accepted",linked_task_status:"completed",linked_task_id:"t1"}),"ACCEPTED");

const chain=stageChainForWorkItem({status:"done",acceptance_status:"accepted",linked_task_status:"completed",linked_task_id:"t1",linked_task_started_at:"2026-10-29T00:00:00Z"});
assert.equal(chain.find(x=>x.stage==="ACCEPTED")?.state,"done");
assert.equal(chain.find(x=>x.stage==="QA_PASS")?.state,"unknown");
assert.equal(chain.find(x=>x.stage==="LIVE")?.state,"unknown");
assert.equal(chain.find(x=>x.stage==="BUSINESS_RESULT")?.state,"unknown");

const projection=executionProjection({
  id:"w1",title:"Ship Command Center",workstream:"technology",priority:"p0",status:"in_progress",acceptance_status:"awaiting",
  linked_task_id:"t1",linked_task_status:"completed",linked_task_agent_role:"software_engineer",
  linked_task_pr_url:"https://github.com/officeus-create/Hermes/pull/2159",
},registry);
assert.equal(projection.work_id,"t1");
assert.equal(projection.executor.plugin_role_id,null);
assert.equal(projection.plugin_route,null);
assert.equal(projection.executor.assignment_truth,"LEGACY_INTERNAL_AI_ROLE");
assert.equal(projection.live_state,"UNKNOWN");
assert.equal(projection.business_result_state,"UNKNOWN");
assert.match(nextActionForWorkItem({status:"in_progress",linked_task_status:"completed"}),/Review the execution evidence/);


const selectedProjection=executionProjection({
  id:"w-selected",title:"SEO audit",workstream:"marketing",priority:"p1",status:"planned",
  plugin_route_json:JSON.stringify({policy_version:"command-center-route-v1",state:"PLUGIN_SELECTED_NOT_EXECUTED",owner:{role_id:"hermes-search-growth",plugin_version:"0.1.13"},helpers:[]}),
},registry);
assert.equal(selectedProjection.plugin_route?.owner.role_id,"hermes-search-growth");
assert.equal(selectedProjection.plugin_route?.state,"PLUGIN_SELECTED_NOT_EXECUTED");
assert.equal(selectedProjection.executor.plugin_role_id,null,"selected route is not evidence of plugin execution");


const matchingRoute={state:"PLUGIN_SELECTED_NOT_EXECUTED",owner:{role_id:"hermes-search-growth",plugin_version:"0.1.13"},helpers:[{role_id:"hermes-agent-coordinator",plugin_version:"0.1.71"}]};
const matchingRegistry=[{role_id:"hermes-search-growth",plugin_version:"0.1.13"},{role_id:"hermes-agent-coordinator",plugin_version:"0.1.71"}];
assert.equal(pluginRouteConsistency(matchingRoute,matchingRegistry,{fresh:true}).state,"SNAPSHOT_VERSION_MATCHED_NOT_EXECUTED");
assert.equal(pluginRouteConsistency(matchingRoute,matchingRegistry,{fresh:false}).state,"REGISTRY_SNAPSHOT_UNVERIFIED");
assert.deepEqual(pluginRouteConsistency(matchingRoute,[{role_id:"hermes-search-growth",plugin_version:"0.1.14"},{role_id:"hermes-agent-coordinator",plugin_version:"0.1.71"}],{fresh:true}),{state:"PLUGIN_ROUTE_VERSION_DRIFT",mismatched_roles:["hermes-search-growth"]});
assert.equal(pluginRouteConsistency(null,matchingRegistry,{fresh:true}).state,"NO_PLUGIN_SELECTED");
const mismatchProjection=executionProjection({id:"route-old",title:"Marketing SEO",workstream:"marketing",status:"ready",plugin_route_json:JSON.stringify({policy_version:"command-center-route-v1",...matchingRoute})},[{role_id:"hermes-search-growth",plugin_version:"0.1.14"},{role_id:"hermes-agent-coordinator",plugin_version:"0.1.71"}],{fresh:true});
assert.equal(mismatchProjection.plugin_route_consistency.state,"PLUGIN_ROUTE_VERSION_DRIFT","Map should reveal dispatch-time version drift without changing the source task or inventing execution");
assert.equal(mismatchProjection.executor.plugin_role_id,null);

const catalog=developmentCatalog({
  registrySnapshot:{source_class:"PRIVATE_PLUGIN_CREATOR_READBACK",entries:registry},
  registryEvidence:{fresh:false},
  processes:[{id:"p1",name:"Search health",role_id:"hermes-search-growth",job_type:"search.snapshot.evaluate",status:"active",next_run_at:null,last_run_at:null,last_job_state:null,last_error_class:null}],
  runner:{online:true,last_seen_at:"2026-10-29T00:00:00Z",operations:{model:"qwen3.5:4b"}},
});
assert.equal(catalog.plugins[0].evidence_state,"STALE_SNAPSHOT");
assert.equal(catalog.automation[0].max_cost_usd,0);
assert.equal(catalog.systems[0].id,"viktor-windows");
assert.equal(catalog.systems[0].status,"RUNTIME_UNVERIFIED","primary Windows status requires actual canonical HAE lease evidence");
assert.equal(catalog.systems[1].id,"viktor-mac");
assert.equal(catalog.systems[1].status,"HEARTBEAT_FRESH","Mac heartbeat must not be displayed as task execution");
const staleRunnerCatalog=developmentCatalog({
  runner:{online:false,last_seen_at:"2026-10-20T00:00:00Z",operations:{status:"RUNNING",phase:"Executing",model:"stale-local-model",current_task:"stale-owner-work",next_action:"stale-action"}},
});
assert.equal(staleRunnerCatalog.systems[1].status,"OFFLINE_OR_UNKNOWN");
for(const field of ["phase","model","current_task","next_action"]){
  assert.equal(staleRunnerCatalog.systems[1][field],null,`Stale heartbeat must not leak stale ${field} as live telemetry`);
}


assert.equal(clickupAuthorization("pk_test_readonly"),"pk_test_readonly");
assert.equal(clickupAuthorization("oauth_test_readonly"),"Bearer oauth_test_readonly");
assert.equal(clickupAuthorization("Bearer already"),"Bearer already");

const normalizedClickUp=normalizeClickUpTask({
  id:"86abc",name:"Canonical human task",status:{status:"to do"},priority:{priority:"urgent"},
  assignees:[{id:42,username:"Operator",email:"secret@example.com"}],
  due_date:"1793000000000",date_updated:"1792000000000",
  url:"https://app.clickup.com/t/86abc",list:{id:"901526433657",name:"Hermes Completion Architect 2 — CURRENT"},
});
assert.equal(normalizedClickUp.status,"to do");
assert.equal(normalizedClickUp.priority,"urgent");
assert.equal(normalizedClickUp.url,"https://app.clickup.com/t/86abc");
assert.deepEqual(normalizedClickUp.assignees,[{id:"42",username:"Operator"}]);
assert.equal("email" in normalizedClickUp.assignees[0],false);
assert.equal(normalizeClickUpTask({due_date:null}).due_date,null,"missing ClickUp due date must not become epoch zero");

let missingFetchCalled=false;
const missing=await readClickUpHumanTasks({},async()=>{missingFetchCalled=true;throw new Error("must_not_call")});
assert.equal(missing.source_state,"NOT_CONFIGURED");
assert.equal(missingFetchCalled,false);

let requestSnapshot=null;
const connected=await readClickUpHumanTasks(
  {CLICKUP_API_TOKEN:"pk_test_readonly",HERMES_CLICKUP_COMPLETION_LIST_ID:"901526433657"},
  async(url,options)=>{
    requestSnapshot={url,options};
    return {ok:true,status:200,json:async()=>({tasks:[{
      id:"86abc",name:"Canonical human task",status:{status:"to do"},priority:{priority:"urgent"},
      assignees:[{id:42,username:"Operator"}],url:"https://app.clickup.com/t/86abc",
      list:{id:"901526433657",name:"Hermes Completion Architect 2 — CURRENT"},
    }]})};
  },
);
assert.equal(connected.source_state,"CONNECTED");
assert.equal(connected.tasks.length,1);
assert.match(requestSnapshot.url,/\/api\/v2\/list\/901526433657\/task/);
assert.match(requestSnapshot.url,/include_closed=false/);
assert.match(requestSnapshot.url,/reverse=false/);
assert.equal(requestSnapshot.options.method,"GET");
assert.equal(requestSnapshot.options.headers.Authorization,"pk_test_readonly");

const authFailed=await readClickUpHumanTasks(
  {CLICKUP_API_TOKEN:"pk_test_readonly"},
  async()=>({ok:false,status:401,json:async()=>({})}),
);
assert.equal(authFailed.source_state,"AUTH_FAILED");
assert.deepEqual(authFailed.tasks,[]);

const passport=parseAgentWorkPassport(`## Agent Work Passport
- **Agent / environment:** ChatGPT (connected GitHub)
- **Work ID:** #2106 execution-map continuation
- **Scope:** owner-only read model
- **Owner approval required:** YES for merge/deploy`);
assert.equal(passport.agent_family,"CHATGPT");
assert.equal(passport.work_id,"#2106 execution-map continuation");
assert.equal(passport.scope,"owner-only read model");
const alternatePassport=parseAgentWorkPassport("**Agent / environment**: ChatGPT\n**Work ID**: JOB-2");
assert.equal(alternatePassport.agent_family,"CHATGPT");
assert.equal(alternatePassport.work_id,"JOB-2");

const normalizedPull=normalizeGithubPull({
  number:2170,title:"Execution map",state:"open",draft:true,html_url:"https://github.com/officeus-create/Hermes/pull/2170",
  user:{login:"officeus-create"},head:{ref:"chatgpt/test",sha:"a".repeat(40)},base:{ref:"main"},
  updated_at:"2026-10-29T00:00:00Z",body:"**Agent / environment:** Codex\\n**Work ID:** TEST-1",
});
assert.equal(normalizedPull.passport.agent_family,"CODEX");
assert.equal(normalizedPull.review_state,"DRAFT");
assert.equal(normalizedPull.ci_state,"UNKNOWN");
assert.equal(normalizedPull.head_sha,"a".repeat(40));

assert.equal(observedGithubCheckState([]),"NO_CHECKS_OBSERVED");
assert.equal(observedGithubCheckState([{status:"in_progress",conclusion:null}]),"CHECKS_RUNNING");
assert.equal(observedGithubCheckState([{status:"completed",conclusion:"failure"}]),"CHECKS_FAILED_OR_CANCELLED");
assert.equal(observedGithubCheckState([
  {status:"completed",conclusion:"success"},
  {status:"completed",conclusion:"success"},
]),"OBSERVED_CHECKS_ALL_SUCCESS");
assert.equal(observedGithubCheckState([
  {status:"completed",conclusion:"success"},
  {status:"completed",conclusion:"skipped"},
]),"OBSERVED_CHECKS_COMPLETED_MIXED","Skipped/neutral observations must not be promoted to all-success");

const approvedProjection=projectGithubReviews([
  {id:1,user:{login:"progressopro"},state:"COMMENTED",submitted_at:"2026-11-01T10:00:00Z"},
  {id:2,user:{login:"progressopro"},state:"APPROVED",submitted_at:"2026-11-01T11:00:00Z"},
], "officeus-create", false);
assert.equal(approvedProjection.review_state,"APPROVED_OBSERVED");
assert.equal(approvedProjection.independent_review_state,"APPROVED_BY_DIFFERENT_LOGIN");
assert.deepEqual(approvedProjection.approving_reviewers,["progressopro"]);

const changedProjection=projectGithubReviews([
  {id:1,user:{login:"progressopro"},state:"APPROVED",submitted_at:"2026-11-01T10:00:00Z"},
  {id:2,user:{login:"progressopro"},state:"CHANGES_REQUESTED",submitted_at:"2026-11-01T12:00:00Z"},
], "officeus-create", false);
assert.equal(changedProjection.review_state,"CHANGES_REQUESTED");
assert.equal(changedProjection.independent_review_state,"CHANGES_REQUESTED_BY_DIFFERENT_LOGIN");

let githubRequest=null;
const github=await readGithubDevelopments({},async(url,options)=>{
  githubRequest={url,options};
  return {
    ok:true,status:200,
    headers:{get:(name)=>name.toLowerCase()==="x-ratelimit-remaining"?"59":null},
    json:async()=>[{
      number:2170,title:"Execution map",state:"open",draft:true,html_url:"https://github.com/officeus-create/Hermes/pull/2170",
      user:{login:"officeus-create"},head:{ref:"chatgpt/test",sha:"b".repeat(40)},base:{ref:"main"},
      updated_at:"2026-10-29T00:00:00Z",body:"**Agent / environment:** ChatGPT",
    }],
  };
});
assert.equal(github.source_state,"CONNECTED_PUBLIC");
assert.equal(github.pulls.length,1);
assert.equal(github.rate_limit_remaining,59);
assert.match(githubRequest.url,/\/repos\/officeus-create\/Hermes\/pulls/);
assert.equal("Authorization" in githubRequest.options.headers,false);
assert.equal(github.pulls[0].passport.agent_family,"CHATGPT");

assert.equal(github.enrichment_state,"AUTH_REQUIRED");
assert.equal(github.pulls[0].enrichment_state,"AUTH_REQUIRED");

const enrichedCalls=[];
const enrichedGithub=await readGithubDevelopments(
  {HERMES_GITHUB_READ_TOKEN:"read-token"},
  async(url,options)=>{
    enrichedCalls.push({url,method:options.method,authorization:options.headers.Authorization});
    const headers={get:(name)=>name.toLowerCase()==="x-ratelimit-remaining"?"4990":null};
    if(url.includes("/commits/")&&url.includes("/check-runs")){
      return {ok:true,status:200,headers,json:async()=>({check_runs:[
        {status:"completed",conclusion:"success"},
        {status:"completed",conclusion:"success"},
      ]})};
    }
    if(url.includes("/pulls/2170/reviews")){
      return {ok:true,status:200,headers,json:async()=>[
        {id:1,user:{login:"progressopro"},state:"APPROVED",submitted_at:"2026-11-01T12:00:00Z"},
      ]};
    }
    return {ok:true,status:200,headers,json:async()=>[{
      number:2170,title:"Execution map",state:"open",draft:false,html_url:"https://github.com/officeus-create/Hermes/pull/2170",
      user:{login:"officeus-create"},requested_reviewers:[],
      head:{ref:"chatgpt/test",sha:"c".repeat(40)},base:{ref:"main"},
      updated_at:"2026-11-01T11:00:00Z",body:"**Agent / environment:** ChatGPT",
    }]};
  },
);
assert.equal(enrichedGithub.enrichment_state,"ENRICHED");
assert.equal(enrichedGithub.enriched_pull_count,1);
assert.equal(enrichedGithub.pulls[0].ci_state,"OBSERVED_CHECKS_ALL_SUCCESS");
assert.equal(enrichedGithub.pulls[0].check_count,2);
assert.equal(enrichedGithub.pulls[0].review_state,"APPROVED_OBSERVED");
assert.equal(enrichedGithub.pulls[0].independent_review_state,"APPROVED_BY_DIFFERENT_LOGIN");
assert.ok(enrichedCalls.every((call)=>call.method==="GET"),"GitHub development enrichment must remain read-only GET");
assert.ok(enrichedCalls.every((call)=>call.authorization==="Bearer read-token"),"Authenticated enrichment must reuse the read token only");

let githubAuthHeader=null;
const githubPrivate=await readGithubDevelopments({HERMES_GITHUB_READ_TOKEN:"read-token"},async(_url,options)=>{
  githubAuthHeader=options.headers.Authorization;
  return {ok:false,status:404,headers:{get:()=>null},json:async()=>({})};
});
assert.equal(githubAuthHeader,"Bearer read-token");
assert.equal(githubPrivate.source_state,"REPOSITORY_NOT_FOUND");
assert.deepEqual(githubPrivate.pulls,[]);

const linkedHuman=linkHumanWorkDevelopments(
  {source_state:"CONNECTED",tasks:[{id:"86cbhdh43",custom_id:null,name:"SEO owner"},{id:"86nope",name:"Unlinked"}]},
  {pulls:[
    {number:2200,title:"SEO fix",url:"https://github.com/officeus-create/Hermes/pull/2200",head_sha:"c".repeat(40),ci_state:"OBSERVED_CHECKS_ALL_SUCCESS",check_count:6,review_state:"APPROVED_OBSERVED",independent_review_state:"APPROVED_BY_DIFFERENT_LOGIN",passport:{work_id:"ClickUp 86cbhdh43",agent_family:"CHATGPT"}},
    {number:2201,title:"False prefix",url:"https://github.com/officeus-create/Hermes/pull/2201",passport:{work_id:"86cbhdh430",agent_family:"CODEX"}},
  ]},
);
assert.equal(linkedHuman.tasks[0].developments.length,1);
assert.equal(linkedHuman.tasks[0].developments[0].number,2200);
assert.equal(linkedHuman.tasks[0].developments[0].ci_state,"OBSERVED_CHECKS_ALL_SUCCESS");
assert.equal(linkedHuman.tasks[0].developments[0].independent_review_state,"APPROVED_BY_DIFFERENT_LOGIN");
assert.equal(linkedHuman.tasks[1].developments.length,0);


const missingDepartmentSources=await readDepartmentKpiSources(null,"2026-11-01T18:00:00.000Z");
assert.equal(missingDepartmentSources.logistics.source_state,"NOT_CONFIGURED");
assert.equal(missingDepartmentSources.academy.source_state,"NOT_CONFIGURED");
assert.equal(missingDepartmentSources.finance.source_state,"NOT_CONFIGURED");

const departmentKpis=buildDepartmentKpis({
  checkedAt:"2026-11-01T18:00:00.000Z",
  sources:{
    marketing:{source_state:"PARTIAL_SCOPE",scope:"ACADEMY_BUSINESS_MEASUREMENT_ONLY",evidence:{ok:true,row:{evidence_rows:3}}},
    logistics:{
      source_state:"CONNECTED",scope:"LOAD_BOARD_AND_VERIFIED_CARRIER_ACCESS",
      load_board:{ok:true,row:{active_sources:2,active_loads:11,quarantine_pending:1}},
      carriers:{ok:true,row:{active_carrier_entitlements:4}},
    },
    sales:{
      source_state:"PARTIAL_SCOPE",scope:"VERTICAL_CRM_PARTIAL_NO_GLOBAL_SALES_ROLLUP",
      home_services:{ok:true,row:{total_leads:9,progressed_leads:3}},
      dealer:{ok:false,state:"SOURCE_UNAVAILABLE",row:null},
    },
    academy:{
      source_state:"CONNECTED",scope:"ACADEMY_BUSINESS_CRM",
      evidence:{ok:true,row:{active_leads:7,active_programs:2,active_participants:5,evidenced_completions:1}},
    },
    finance:{
      source_state:"PARTIAL_SCOPE",scope:"EVIDENCED_ACADEMY_REVENUE_NOT_RECEIVED_CASH",
      academy_revenue:{ok:true,rows:[{currency:"USD",cents:125000,evidence_rows:2}]},
    },
  },
  githubDevelopments:{source_state:"CONNECTED",pulls:[
    {state:"open",review_state:"APPROVED"},
    {state:"open",review_state:"CHANGES_REQUESTED"},
    {state:"closed",review_state:"APPROVED"},
  ]},
  processes:[{status:"active"},{status:"paused"}],
  runner:{online:false},
  tasks:[
    {workstream:"technology",current_stage:"STARTED",work_id:"t1"},
    {workstream:"operations",current_stage:"BLOCKED",work_id:null},
    {workstream:"operations",current_stage:"OWNER_GATE",work_id:"t2"},
  ],
});
const byDepartment=new Map(departmentKpis.map((item)=>[item.id,item]));
assert.equal(byDepartment.get("logistics").metrics.find((metric)=>metric.key==="active_loads").value,11);
assert.equal(byDepartment.get("sales").metrics.find((metric)=>metric.key==="dealer_customers").state,"UNKNOWN");
assert.equal(byDepartment.get("marketing").metrics.find((metric)=>metric.key==="global_verified_marketing_kpis").value,null,"Unknown KPI must stay null, never zero");
assert.equal(byDepartment.get("finance").metrics.find((metric)=>metric.key==="received_cash").state,"UNKNOWN","Evidenced revenue must never be relabeled as received cash");
assert.equal(byDepartment.get("finance").metrics.find((metric)=>metric.key==="academy_evidenced_revenue_usd").value,125000);
assert.equal(byDepartment.get("technology").metrics.find((metric)=>metric.key==="approved_open_prs").value,1);
assert.equal(byDepartment.get("agents").metrics.find((metric)=>metric.key==="runner_state").value,"OFFLINE_OR_UNKNOWN");
assert.equal(byDepartment.get("operations").metrics.find((metric)=>metric.key==="operations_blocked_work").value,1);


const providerHealth=buildProviderHealth({
  checkedAt:"2026-11-01T19:30:00.000Z",
  clickup:{source_state:"CONNECTED",checked_at:"2026-11-01T19:29:00.000Z",list_id:"901526433657",tasks:[{id:"a"}],truncated:false},
  github:{source_state:"AUTH_OR_RATE_LIMIT_FAILED",checked_at:"2026-11-01T19:29:30.000Z",repository:"officeus-create/Hermes",authenticated:true,http_status:403,pulls:[]},
});
const clickupHealth=providerHealth.find((item)=>item.id==="clickup");
const githubHealth=providerHealth.find((item)=>item.id==="github");
assert.equal(clickupHealth.health,"HEALTHY");
assert.equal(clickupHealth.item_count,1);
assert.equal(clickupHealth.credential_configured,true);
assert.equal(clickupHealth.authentication_state,"SUCCEEDED");
assert.equal(clickupHealth.credential_exposed,false);
assert.equal(clickupHealth.writable,false);
assert.equal(githubHealth.health,"UNAVAILABLE");
assert.equal(githubHealth.http_status,403);
assert.equal(githubHealth.credential_configured,true);
assert.equal(githubHealth.authentication_state,"FAILED_OR_RATE_LIMITED");
assert.equal("authenticated" in githubHealth,false);
assert.equal("token" in githubHealth,false);

const publicGithubHealth=buildProviderHealth({
  checkedAt:"2026-11-01T19:30:00.000Z",
  github:{source_state:"CONNECTED_PUBLIC",checked_at:"2026-11-01T19:29:30.000Z",repository:"officeus-create/Hermes",authenticated:false,pulls:[]},
}).find((item)=>item.id==="github");
assert.equal(publicGithubHealth.credential_configured,false);
assert.equal(publicGithubHealth.authentication_state,"PUBLIC_NO_CREDENTIAL");

console.log("INTERNAL_COMMAND_CENTER_EXECUTION_MAP_PASS");
