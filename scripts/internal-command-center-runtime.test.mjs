import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { onRequestGet as listWorkItems, onRequestPost as createWorkItem } from "../functions/api/internal-command-center/work-items.ts";
import { onRequestPatch as mutateWorkItem } from "../functions/api/internal-command-center/work-items/[id].ts";
import { onRequestGet as listAccess, onRequestPost as mutateAccess } from "../functions/api/internal-command-center/access.ts";
import { onRequestGet as aiStatus } from "../functions/api/internal-ai/status.ts";
import { onRequestGet as listAiTasks } from "../functions/api/internal-ai/tasks.ts";
import { onRequestGet as listProjects, onRequestPost as createProject } from "../functions/api/internal-command-center/projects.ts";
import { onRequestPatch as editProject } from "../functions/api/internal-command-center/projects/[id].ts";
import { ensureInternalAiSchema } from "../functions/api/_lib/internal-ai.mjs";
import { ensureCommandCenterSchema } from "../functions/api/_lib/internal-command-center.mjs";

class Statement {
  constructor(statement,args=[]){this.statement=statement;this.args=args}
  bind(...args){return new Statement(this.statement,args)}
  async run(){const info=this.statement.run(...this.args);return{success:true,meta:{changes:Number(info.changes??0)}}}
  async first(){return this.statement.get(...this.args)??null}
  async all(){return{results:this.statement.all(...this.args)}}
}
// Backwards-compatible migration: real older D1 rows may have no project column.
const legacySqlite=new DatabaseSync(":memory:");
legacySqlite.exec("CREATE TABLE hermes_owner_work_items (id TEXT PRIMARY KEY,organization_scope TEXT,status TEXT,priority TEXT,created_at TEXT); INSERT INTO hermes_owner_work_items VALUES ('legacy','hermes_internal','planned','p2','2026-10-01');");
const legacyDB={prepare:sql=>new Statement(legacySqlite.prepare(sql))};
await ensureCommandCenterSchema(legacyDB);
assert(legacySqlite.prepare("PRAGMA table_info(hermes_owner_work_items)").all().some(x=>x.name==="project_id"),"migration must add nullable project_id");
assert.equal(legacySqlite.prepare("SELECT project_id FROM hermes_owner_work_items WHERE id='legacy'").get().project_id,null,"older task remains unassigned");
await ensureCommandCenterSchema(legacyDB);
legacySqlite.close();

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
async function create(title,workstream="marketing",projectId=null){
  const response=await createWorkItem({request:request("/api/internal-command-center/work-items",{method:"POST",body:{workstream,priority:"p1",title,details:"Synthetic acceptance task: "+title,source:"text",project_id:projectId}}),env:{DB:db}});
  assert.equal(response.status,201); const payload=await response.json(); assert.equal(payload.work_item.status,"planned"); return payload.work_item;
}
async function patch(id,action){
  const response=await mutateWorkItem({request:request("/api/internal-command-center/work-items/"+id,{method:"PATCH",body:{action}}),env:{DB:db},params:{id}});
  return {response,payload:await response.json()};
}

// Owner-built projects share the canonical D1 and cannot overwrite the static project snapshot.
const createProjectResponse=await createProject({request:request("/api/internal-command-center/projects",{method:"POST",body:{title:"  Land    CRM  ",department:"technology",purpose:"Track verified land opportunities."}}),env:{DB:db}});
assert.equal(createProjectResponse.status,201,"owner project creation must persist");
const createdProject=(await createProjectResponse.json()).project;
assert.match(createdProject.id,/^hcpr_/);
assert.equal(createdProject.title,"Land CRM");
assert.equal(createdProject.progress.percent,null,"owner-declared project does not invent milestones");
assert.equal(createdProject.eta_label,"UNKNOWN");
assert.equal(createdProject.evidence_level,"OWNER_MANAGED_UNVERIFIED");
const projectList=await listProjects({request:request("/api/internal-command-center/projects"),env:{DB:db}});
assert.equal(projectList.status,200);
const projectListBody=await projectList.json();
assert(projectListBody.projects.some(item=>item.id===createdProject.id),"D1 project is merged into registry");
assert(projectListBody.projects.some(item=>item.id==="hermes-command-center"),"canonical project remains visible");
assert.equal(projectListBody.next_offset,null);
const projectEditRequest=(body,id=createdProject.id)=>editProject({request:request("/api/internal-command-center/projects/"+id,{method:"PATCH",body}),env:{DB:db},params:{id}});
const editProjectResponse=await projectEditRequest({title:"Land CRM V2",department:"operations",purpose:"Track documented land objects and tenders.",status:"in_progress",updated_at:createdProject.updated_at});
assert.equal(editProjectResponse.status,200,"owner may edit own D1 project");
const projectAfterEdit=(await editProjectResponse.json()).project;
assert.equal(projectAfterEdit.title,"Land CRM V2");
assert.equal(projectAfterEdit.status,"in_progress");
assert.equal(projectAfterEdit.department,"operations");
assert.equal((await projectEditRequest({title:"Stale overwrite",department:"operations",purpose:"Disallowed",status:"done",updated_at:"2000-01-01T00:00:00.000Z"})).status,409,"stale project edits must fail");
assert.equal((await projectEditRequest({title:"Unsafe canonical edit",department:"operations",purpose:"Disallowed",status:"done",updated_at:createdProject.updated_at},"hermes-command-center")).status,404,"canonical snapshot project may not be modified");
assert.equal((await createProject({request:request("/api/internal-command-center/projects",{method:"POST",owner:"delegate",body:{title:"Unsafe",department:"sales",purpose:"No access"}}),env:{DB:db}})).status,403,"delegate cannot create projects");
assert.equal((await listProjects({request:request("/api/internal-command-center/projects",{owner:"delegate"}),env:{DB:db}})).status,403,"delegate cannot read owner project registry");
assert.equal((await createProject({request:request("/api/internal-command-center/projects",{method:"POST",body:{title:"Bad category",department:"secret",purpose:"No access"}}),env:{DB:db}})).status,400,"invalid departments rejected");
assert.equal((await listProjects({request:request("/api/internal-command-center/projects?offset=bad"),env:{DB:db}})).status,400,"invalid paging rejected");

const missingProject=await createWorkItem({request:request("/api/internal-command-center/work-items",{method:"POST",body:{workstream:"technology",priority:"p1",title:"Unknown project",details:"Reject foreign linkage",project_id:"hcpr_00000000-0000-4000-8000-000000000000"}}),env:{DB:db}});
assert.equal(missingProject.status,400,"unknown D1 project must never be linked");
assert.equal((await missingProject.json()).error,"invalid_project_id");
assert.equal((await createWorkItem({request:request("/api/internal-command-center/work-items",{method:"POST",owner:"delegate",body:{workstream:"technology",priority:"p1",title:"Delegate task",details:"Unauthorized",project_id:createdProject.id}}),env:{DB:db}})).status,403,"only owner can assign project links");
const first=await create("First cloud task","technology",createdProject.id);
assert.equal(first.project_id,createdProject.id,"owner-managed project is linked in create response");
const withOneTask=(await (await listProjects({request:request("/api/internal-command-center/projects"),env:{DB:db}})).json()).projects;
const ownerCount=withOneTask.find(project=>project.id===createdProject.id)?.work_items_summary;
assert.deepEqual(ownerCount,{total:1,open:1,done:0,blocked:0},"one D1 task appears on owner project without inventing milestone progress");
assert.equal(withOneTask.find(project=>project.id==="hermes-command-center")?.work_items_summary.total,0);
const second=await create("Second cloud task","marketing");
assert.notEqual(first.id,second.id);
assert.equal(second.project_id,null,"older and unassigned tasks retain NULL project");
// Owner can revise an unclaimed D1 task; the update must not create an AI execution.
const editedResponse=await mutateWorkItem({
  request:request("/api/internal-command-center/work-items/"+first.id,{
    method:"PATCH",body:{action:"edit",updated_at:first.updated_at,
      title:"Revised cloud task",details:"Revised instructions for owner review",
      workstream:"technology",priority:"p0",project_id:"hermes-command-center"}
  }),env:{DB:db},params:{id:first.id}
});
assert.equal(editedResponse.status,200,"owner task editor must persist a valid revision");
const editedPayload=await editedResponse.json();
assert.equal(editedPayload.work_item.title,"Revised cloud task");
assert.equal(editedPayload.work_item.priority,"p0");
assert.equal(editedPayload.work_item.details,"Revised instructions for owner review");
assert.equal(editedPayload.work_item.project_id,"hermes-command-center","owner may reassign to an immutable canonical project");
const afterReassign=(await (await listProjects({request:request("/api/internal-command-center/projects"),env:{DB:db}})).json()).projects;
assert.equal(afterReassign.find(project=>project.id===createdProject.id)?.work_items_summary.total,0,"old project stops counting reassigned work");
assert.equal(afterReassign.find(project=>project.id==="hermes-command-center")?.work_items_summary.open,1,"canonical project counts reassigned open work");
const badEdit=await mutateWorkItem({request:request("/api/internal-command-center/work-items/"+first.id,{method:"PATCH",body:{action:"edit",updated_at:editedPayload.work_item.updated_at,title:"Do not overwrite",details:"Do not overwrite",workstream:"technology",priority:"p0",project_id:"nonexistent"}}),env:{DB:db},params:{id:first.id}});
assert.equal(badEdit.status,400,"unknown project on edit must be rejected without modifying task");
const staleEditResponse=await mutateWorkItem({
  request:request("/api/internal-command-center/work-items/"+first.id,{
    method:"PATCH",body:{action:"edit",updated_at:"2000-01-01T00:00:00.000Z",
      title:"Unsafe overwrite",details:"Should not overwrite",workstream:"technology",priority:"p0"}
  }),env:{DB:db},params:{id:first.id}
});
assert.equal(staleEditResponse.status,409,"optimistic timestamp check must block stale writes");
assert.equal((await staleEditResponse.json()).error,"work_item_changed_reload_first");

let listResponse=await listWorkItems({request:request("/api/internal-command-center/work-items"),env:{DB:db}});
assert.equal(listResponse.status,200);
assert.match(listResponse.headers.get("Cache-Control")||"",/no-store/);
let listPayload=await listResponse.json();
assert.equal(listPayload.work_items.length,2);
assert.equal(listPayload.next_offset,null,"short cloud backlog must have no next page");
const offsetPage=await listWorkItems({request:request("/api/internal-command-center/work-items?offset=1"),env:{DB:db}});
assert.equal(offsetPage.status,200,"owner paged tasks must be accepted");
assert.equal((await offsetPage.json()).work_items.length,1,"offset must return remaining D1 tasks");
const rejectedOffset=await listWorkItems({request:request("/api/internal-command-center/work-items?offset=nope"),env:{DB:db}});
assert.equal(rejectedOffset.status,400,"invalid pagination offset must fail closed");
assert(listPayload.work_items.every(item=>item.status==="planned"));
assert.equal(listPayload.work_items.find(item=>item.id===first.id).project_id,"hermes-command-center","D1 list must include the selected project");

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
const projectsAfterAiCompletion=(await (await listProjects({request:request("/api/internal-command-center/projects"),env:{DB:db}})).json()).projects;
assert.deepEqual(
  projectsAfterAiCompletion.find(project=>project.id==="hermes-command-center")?.work_items_summary,
  {total:1,open:1,done:0,blocked:0},
  "Projects GET must reconcile linked AI completion but keep work unfinished until explicit owner acceptance",
);
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
const projectsAfterAccept=(await (await listProjects({request:request("/api/internal-command-center/projects"),env:{DB:db}})).json()).projects;
assert.deepEqual(
  projectsAfterAccept.find(project=>project.id==="hermes-command-center")?.work_items_summary,
  {total:1,open:0,done:1,blocked:0},
  "project done count advances only after explicit owner acceptance",
);

const secondAssignedResponse=await mutateWorkItem({
  request:request("/api/internal-command-center/work-items/"+second.id,{
    method:"PATCH",body:{action:"edit",updated_at:second.updated_at,title:second.title,details:second.details,
      workstream:second.workstream,priority:second.priority,project_id:"hermes-command-center"}
  }),env:{DB:db},params:{id:second.id}
});
assert.equal(secondAssignedResponse.status,200,"previously unassigned work can be attached to a project before dispatch");
assert.equal((await secondAssignedResponse.json()).work_item.project_id,"hermes-command-center");
const secondDispatched=await patch(second.id,"dispatch");
assert.equal(secondDispatched.response.status,200);
assert.equal(secondDispatched.payload.work_item.status,"in_progress");
assert.notEqual(secondDispatched.payload.task.id,activeTaskId);

const failedTaskId=secondDispatched.payload.task.id;
sqlite.prepare("UPDATE hermes_internal_ai_tasks SET status='failed',updated_at=? WHERE id=?").run(now,failedTaskId);
const projectsAfterAiFailure=(await (await listProjects({request:request("/api/internal-command-center/projects"),env:{DB:db}})).json()).projects;
assert.deepEqual(
  projectsAfterAiFailure.find(project=>project.id==="hermes-command-center")?.work_items_summary,
  {total:2,open:1,done:1,blocked:1},
  "Projects GET alone must reconcile a failed linked AI task into the blocked counter",
);
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
sqlite.prepare("INSERT INTO hermes_internal_ai_events (organization_scope,task_id,event_type,message,created_at) VALUES (?,?,?,?,?)").run("hermes_internal",retriedSecond.payload.task.id,"output","Synthetic latest log event",now);
const taskHistoryResponse=await listAiTasks({request:request("/api/internal-ai/tasks"),env:{DB:db}});
assert.equal(taskHistoryResponse.status,200);
const taskHistory=await taskHistoryResponse.json();
assert.equal(taskHistory.timing_policy,"timestamps_only");
const currentExecution=taskHistory.tasks.find(task=>task.id===retriedSecond.payload.task.id);
assert.equal(currentExecution.last_event.type,"output");
assert.equal(currentExecution.progress_percent,null);
assert.equal(currentExecution.eta_label,"UNKNOWN");

let viewerStatus=await aiStatus({request:request("/api/internal-ai/status",{owner:"delegate"}),env:{DB:db}});
assert.equal(viewerStatus.status,403,"generic Hermes account must not inherit Team View");
const teamGrant=await mutateAccess({request:request("/api/internal-command-center/access",{method:"POST",body:{action:"grant",email:"delegate@example.invalid",capability:"team_view"}}),env:{DB:db}});
assert.equal(teamGrant.status,200);
viewerStatus=await aiStatus({request:request("/api/internal-ai/status",{owner:"delegate"}),env:{DB:db}});
assert.equal(viewerStatus.status,200);
const teamStatus=await viewerStatus.json();
assert.equal(teamStatus.access_level,"team");
assert.equal(teamStatus.runtime.operations.model,"qwen3.5:4b");
assert.equal("repo_sha" in teamStatus.runtime,false,"Team View must hide repo metadata");
assert.equal("active_task" in teamStatus,false,"Team View must hide owner task details");
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

const anonymous=await listWorkItems({request:new Request("https://example.invalid/api/internal-command-center/work-items"),env:{DB:db}});
assert.equal(anonymous.status,401);
const anonymousProjects=await listProjects({request:new Request("https://example.invalid/api/internal-command-center/projects"),env:{DB:db}});
assert.equal(anonymousProjects.status,401,"project counters remain owner-only after reconciliation change");
sqlite.close();
console.log("Hermes Business Command Center runtime: D1 backlog -> single dispatch -> reconcile + audited access PASS");
