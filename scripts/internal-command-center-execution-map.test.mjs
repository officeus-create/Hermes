import assert from "node:assert/strict";
import {
  currentStageForWorkItem,
  developmentCatalog,
  eligibleCapabilitiesForWorkstream,
  executionProjection,
  linkHumanWorkDevelopments,
  nextActionForWorkItem,
  stageChainForWorkItem,
} from "../functions/api/_lib/command-center-execution-map.mjs";
import { clickupAuthorization, normalizeClickUpTask, readClickUpHumanTasks } from "../functions/api/_lib/command-center-clickup.mjs";
import { normalizeGithubPull, parseAgentWorkPassport, readGithubDevelopments } from "../functions/api/_lib/command-center-github.mjs";

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
assert.equal(projection.executor.assignment_truth,"LEGACY_INTERNAL_AI_ROLE");
assert.equal(projection.live_state,"UNKNOWN");
assert.equal(projection.business_result_state,"UNKNOWN");
assert.match(nextActionForWorkItem({status:"in_progress",linked_task_status:"completed"}),/Review the execution evidence/);

const catalog=developmentCatalog({
  registrySnapshot:{source_class:"PRIVATE_PLUGIN_CREATOR_READBACK",entries:registry},
  registryEvidence:{fresh:false},
  processes:[{id:"p1",name:"Search health",role_id:"hermes-search-growth",job_type:"search.snapshot.evaluate",status:"active",next_run_at:null,last_run_at:null,last_job_state:null,last_error_class:null}],
  runner:{online:true,last_seen_at:"2026-10-29T00:00:00Z",operations:{model:"qwen3.5:4b"}},
});
assert.equal(catalog.plugins[0].evidence_state,"STALE_SNAPSHOT");
assert.equal(catalog.automation[0].max_cost_usd,0);
assert.equal(catalog.systems[0].status,"RUNNING");

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

const normalizedPull=normalizeGithubPull({
  number:2170,title:"Execution map",state:"open",draft:true,html_url:"https://github.com/officeus-create/Hermes/pull/2170",
  user:{login:"officeus-create"},head:{ref:"chatgpt/test",sha:"a".repeat(40)},base:{ref:"main"},
  updated_at:"2026-10-29T00:00:00Z",body:"**Agent / environment:** Codex\\n**Work ID:** TEST-1",
});
assert.equal(normalizedPull.passport.agent_family,"CODEX");
assert.equal(normalizedPull.review_state,"DRAFT");
assert.equal(normalizedPull.ci_state,"UNKNOWN");
assert.equal(normalizedPull.head_sha,"a".repeat(40));

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
    {number:2200,title:"SEO fix",url:"https://github.com/officeus-create/Hermes/pull/2200",head_sha:"c".repeat(40),ci_state:"UNKNOWN",review_state:"DRAFT",passport:{work_id:"ClickUp 86cbhdh43",agent_family:"CHATGPT"}},
    {number:2201,title:"False prefix",url:"https://github.com/officeus-create/Hermes/pull/2201",passport:{work_id:"86cbhdh430",agent_family:"CODEX"}},
  ]},
);
assert.equal(linkedHuman.tasks[0].developments.length,1);
assert.equal(linkedHuman.tasks[0].developments[0].number,2200);
assert.equal(linkedHuman.tasks[1].developments.length,0);

console.log("INTERNAL_COMMAND_CENTER_EXECUTION_MAP_PASS");
