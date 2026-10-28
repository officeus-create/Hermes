import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { onRequestGet as listWorkItems, onRequestPost as createWorkItem } from "../functions/api/internal-command-center/work-items.ts";
import { onRequestPatch as mutateWorkItem } from "../functions/api/internal-command-center/work-items/[id].ts";
import { onRequestGet as listAccess, onRequestPost as mutateAccess } from "../functions/api/internal-command-center/access.ts";
import { onRequestGet as aiStatus } from "../functions/api/internal-ai/status.ts";
import { ensureInternalAiSchema } from "../functions/api/_lib/internal-ai.mjs";
import { ensureCommandCenterSchema } from "../functions/api/_lib/internal-command-center.mjs";

class Statement {
  constructor(statement,args=[]){this.statement=statement;this.args=args}
  bind(...args){return new Statement(this.statement,args)}
  async run(){const info=this.statement.run(...this.args);return{success:true,meta:{changes:Number(info.changes??0)}}}
  async first(){return this.statement.get(...this.args)??null}
  async all(){return{results:this.statement.all(...this.args)}}
}
const sqlite=new DatabaseSync(":memory:");
const db={prepare:sql=>new Statement(sqlite.prepare(sql)),batch:async statements=>{
  sqlite.exec("BEGIN IMMEDIATE");try{const results=[];for(const stmt of statements)results.push(await stmt.run());sqlite.exec("COMMIT");return results}
  catch(error){sqlite.exec("ROLLBACK");throw error}
}};
sqlite.exec("CREATE TABLE sessions (token TEXT, specialist_id TEXT, expires_at TEXT); CREATE TABLE specialists (id TEXT, email TEXT, name TEXT, role TEXT, location TEXT, bio TEXT);");
for(const [id,email,name] of [["owner","owner@example.invalid","Synthetic Owner"],["delegate","delegate@example.invalid","Synthetic Delegate"]]){
  sqlite.prepare("INSERT INTO specialists VALUES (?,?,?,?,?,?)").run(id,email,name,"Owner","","");
  sqlite.prepare("INSERT INTO sessions VALUES (?,?,?)").run("session-"+id,id,new Date(Date.now()+3600000).toISOString());
}
await ensureInternalAiSchema(db);
await ensureCommandCenterSchema(db);
const now=new Date().toISOString();
sqlite.prepare("INSERT INTO hermes_internal_owner_access (specialist_id,active,capability,created_at,updated_at) VALUES (?,?,?,?,?)").run("owner",1,"HERMES_INTERNAL_OWNER",now,now);

const request=(path,{method="GET",body,owner="owner"}={})=>new Request("https://example.invalid"+path,{
  method,headers:{Cookie:"hermes_session=session-"+owner,Origin:"https://example.invalid","Sec-Fetch-Site":"same-origin",...(body?{"Content-Type":"application/json"}:{})},
  ...(body?{body:JSON.stringify(body)}:{}),
});
async function create(title,workstream="marketing"){
  const response=await createWorkItem({request:request("/api/internal-command-center/work-items",{method:"POST",body:{workstream,priority:"p1",title,details:"Synthetic acceptance task: "+title,source:"text"}}),env:{DB:db}});
  assert.equal(response.status,201); const payload=await response.json(); assert.equal(payload.work_item.status,"planned"); return payload.work_item;
}
async function patch(id,action){
  const response=await mutateWorkItem({request:request("/api/internal-command-center/work-items/"+id,{method:"PATCH",body:{action}}),env:{DB:db},params:{id}});
  return {response,payload:await response.json()};
}

const first=await create("First cloud task","technology");
const second=await create("Second cloud task","marketing");
assert.notEqual(first.id,second.id);
let listResponse=await listWorkItems({request:request("/api/internal-command-center/work-items"),env:{DB:db}});
assert.equal(listResponse.status,200);
assert.match(listResponse.headers.get("Cache-Control")||"",/no-store/);
let listPayload=await listResponse.json();
assert.equal(listPayload.work_items.length,2);
assert(listPayload.work_items.every(item=>item.status==="planned"));

const dispatched=await patch(first.id,"dispatch");
assert.equal(dispatched.response.status,200);
assert.equal(dispatched.payload.state,"dispatched");
assert.equal(dispatched.payload.work_item.status,"in_progress");
assert.equal(dispatched.payload.task.status,"queued");
assert(dispatched.payload.work_item.linked_task_id);

const blockedSecond=await patch(second.id,"dispatch");
assert.equal(blockedSecond.response.status,409);
assert.equal(blockedSecond.payload.error,"active_task_exists");

const activeTaskId=dispatched.payload.task.id;
sqlite.prepare("UPDATE hermes_internal_ai_tasks SET status='completed',completed_at=?,updated_at=?,output_summary='Synthetic completion evidence' WHERE id=?").run(now,now,activeTaskId);
listResponse=await listWorkItems({request:request("/api/internal-command-center/work-items"),env:{DB:db}});
listPayload=await listResponse.json();
const firstAfter=listPayload.work_items.find(item=>item.id===first.id);
const secondAfter=listPayload.work_items.find(item=>item.id===second.id);
assert.equal(firstAfter.status,"awaiting_acceptance");
assert.equal(firstAfter.linked_task_status,"completed");
assert.equal(firstAfter.linked_task_output_summary,"Synthetic completion evidence");
assert.equal(firstAfter.completed_at,null);
assert.equal(firstAfter.accepted_at,null);
assert.equal(secondAfter.status,"planned");

const accepted=await patch(first.id,"accept");
assert.equal(accepted.response.status,200);
assert.equal(accepted.payload.work_item.status,"done");
assert.equal(accepted.payload.work_item.accepted_by,"owner");
assert.ok(accepted.payload.work_item.accepted_at);
assert.ok(accepted.payload.work_item.completed_at);

const secondDispatched=await patch(second.id,"dispatch");
assert.equal(secondDispatched.response.status,200);
assert.equal(secondDispatched.payload.work_item.status,"in_progress");
assert.notEqual(secondDispatched.payload.task.id,activeTaskId);

const failedTaskId=secondDispatched.payload.task.id;
sqlite.prepare("UPDATE hermes_internal_ai_tasks SET status='failed',updated_at=? WHERE id=?").run(now,failedTaskId);
listResponse=await listWorkItems({request:request("/api/internal-command-center/work-items"),env:{DB:db}});
listPayload=await listResponse.json();
const secondBlocked=listPayload.work_items.find(item=>item.id===second.id);
assert.equal(secondBlocked.status,"blocked");
assert.equal(secondBlocked.linked_task_id,failedTaskId);
assert.equal(secondBlocked.linked_task_status,"failed");

const retriedSecond=await patch(second.id,"dispatch");
assert.equal(retriedSecond.response.status,200,
  "blocked work item with a terminal failed task must be retryable");
assert.equal(retriedSecond.payload.work_item.status,"in_progress");
assert.notEqual(retriedSecond.payload.task.id,failedTaskId);
assert.equal(retriedSecond.payload.work_item.linked_task_id,retriedSecond.payload.task.id);

sqlite.prepare("INSERT INTO hermes_internal_ai_runner_state (id,organization_scope,last_seen_at,repo_sha,runtime_version,telemetry_json) VALUES (?,?,?,?,?,?)").run(
  "internal-ai-mac-runner","hermes_internal",new Date().toISOString(),"synthetic-sha","synthetic-runtime",
  JSON.stringify({status:"RUNNING",phase:"AUTONOMOUS_OPERATIONS_AND_LEARNING",cycle:563,current_task:"Synthetic safe work",next_action:"Owner-only next action",model:"qwen3.5:4b",last_training_phase:"DOCUMENTARY_REVIEW",autonomy:{external_actions:0,provider_writes:0}})
);

let viewerStatus=await aiStatus({request:request("/api/internal-ai/status",{owner:"delegate"}),env:{DB:db}});
assert.equal(viewerStatus.status,403,"generic Hermes account must not inherit Team View");

const teamGrant=await mutateAccess({request:request("/api/internal-command-center/access",{method:"POST",body:{action:"grant",email:"delegate@example.invalid",capability:"team_view"}}),env:{DB:db}});
assert.equal(teamGrant.status,200);
const teamGrantPayload=await teamGrant.json();
assert.equal(teamGrantPayload.capability,"team_view");
const teamRow=sqlite.prepare("SELECT active FROM hermes_internal_team_view_access WHERE specialist_id='delegate'").get();
assert.equal(teamRow.active,1);
const teamAudit=sqlite.prepare("SELECT action,actor_specialist_id,target_specialist_id FROM hermes_internal_team_view_access_audit ORDER BY id DESC LIMIT 1").get();
assert.equal(teamAudit.action,"grant");
assert.equal(teamAudit.actor_specialist_id,"owner");
assert.equal(teamAudit.target_specialist_id,"delegate");

viewerStatus=await aiStatus({request:request("/api/internal-ai/status",{owner:"delegate"}),env:{DB:db}});
assert.equal(viewerStatus.status,200);
const teamStatusPayload=await viewerStatus.json();
assert.equal(teamStatusPayload.access_level,"team");
assert.equal(teamStatusPayload.runtime.primary_executor,"mac");
assert.equal(teamStatusPayload.runtime.operations.status,"RUNNING");
assert.equal(teamStatusPayload.runtime.operations.phase,"AUTONOMOUS_OPERATIONS_AND_LEARNING");
assert.equal(teamStatusPayload.runtime.operations.cycle,563);
assert.equal(teamStatusPayload.runtime.operations.current_task,"Synthetic safe work");
assert.equal(teamStatusPayload.runtime.operations.model,"qwen3.5:4b");
assert.equal("repo_sha" in teamStatusPayload.runtime,false,"Team View must hide repo metadata");
assert.equal("runtime_version" in teamStatusPayload.runtime,false,"Team View must hide runtime metadata");
assert.equal("remote_browser_to_codex" in teamStatusPayload.runtime,false,"Team View must hide owner runtime flags");
assert.equal("next_action" in teamStatusPayload.runtime.operations,false,"Team View must hide owner next action");
assert.equal("last_training_phase" in teamStatusPayload.runtime.operations,false,"Team View must hide training detail");
assert.equal("autonomy" in teamStatusPayload.runtime.operations,false,"Team View must hide owner autonomy counters");
assert.equal("active_task" in teamStatusPayload,false,"Team View must hide owner AI task queue");
assert.equal("latest_task" in teamStatusPayload,false,"Team View must hide latest owner AI task");

const ownerStatus=await aiStatus({request:request("/api/internal-ai/status"),env:{DB:db}});
assert.equal(ownerStatus.status,200);
const ownerStatusPayload=await ownerStatus.json();
assert.equal(ownerStatusPayload.access_level,"owner");
assert.equal(ownerStatusPayload.runtime.repo_sha,"synthetic-sha");
assert.equal(ownerStatusPayload.runtime.operations.next_action,"Owner-only next action");

const teamRevoke=await mutateAccess({request:request("/api/internal-command-center/access",{method:"POST",body:{action:"revoke",email:"delegate@example.invalid",capability:"team_view"}}),env:{DB:db}});
assert.equal(teamRevoke.status,200);
viewerStatus=await aiStatus({request:request("/api/internal-ai/status",{owner:"delegate"}),env:{DB:db}});
assert.equal(viewerStatus.status,403,"revoked Team View must fail closed");

const grant=await mutateAccess({request:request("/api/internal-command-center/access",{method:"POST",body:{action:"grant",email:"delegate@example.invalid"}}),env:{DB:db}});
assert.equal(grant.status,200);
assert.equal((await grant.json()).target.specialist_id,"delegate");
const delegateAccess=sqlite.prepare("SELECT active,capability FROM hermes_internal_owner_access WHERE specialist_id='delegate'").get();
assert.equal(delegateAccess.active,1);
assert.equal(delegateAccess.capability,"HERMES_INTERNAL_OWNER");
const audit=sqlite.prepare("SELECT action,actor_specialist_id,target_specialist_id FROM hermes_internal_owner_access_audit ORDER BY id DESC LIMIT 1").get();
assert.equal(audit.action,"grant");
assert.equal(audit.actor_specialist_id,"owner");
assert.equal(audit.target_specialist_id,"delegate");

const selfRevoke=await mutateAccess({request:request("/api/internal-command-center/access",{method:"POST",body:{action:"revoke",email:"owner@example.invalid"}}),env:{DB:db}});
assert.equal(selfRevoke.status,409);
assert.equal((await selfRevoke.json()).error,"cannot_revoke_current_owner");

const accessList=await listAccess({request:request("/api/internal-command-center/access"),env:{DB:db}});
assert.equal(accessList.status,200);
const accessPayload=await accessList.json();
assert.equal(accessPayload.current_specialist_id,"owner");
assert.equal(accessPayload.access.filter(row=>row.active).length,2);
assert.equal(accessPayload.team_access.filter(row=>row.active).length,0,"revoked Team View remains inactive in owner access readback");

const anonymous=await listWorkItems({request:new Request("https://example.invalid/api/internal-command-center/work-items"),env:{DB:db}});
assert.equal(anonymous.status,401);
sqlite.close();
console.log("Hermes Business Command Center runtime: D1 backlog -> single dispatch -> reconcile + audited access PASS");
