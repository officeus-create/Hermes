import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { ensureInternalAiSchema } from "../functions/api/_lib/internal-ai.mjs";
import { ensureCommandCenterSchema } from "../functions/api/_lib/internal-command-center.mjs";
import { onRequestPost as createWork, onRequestGet as listWork } from "../functions/api/internal-command-center/work-items.ts";
import { onRequestPatch as mutateWork } from "../functions/api/internal-command-center/work-items/[id].ts";
import { onRequestGet as listAccess, onRequestPost as mutateAccess } from "../functions/api/internal-command-center/access.ts";

class D1Statement {
  constructor(statement,args=[]){this.statement=statement;this.args=args}
  bind(...args){return new D1Statement(this.statement,args)}
  async run(){const result=this.statement.run(...this.args);return{meta:{changes:Number(result.changes||0)}}}
  async first(){return this.statement.get(...this.args)||null}
  async all(){return{results:this.statement.all(...this.args)}}
}
const sqlite=new DatabaseSync(":memory:");
const DB={prepare:(sql)=>new D1Statement(sqlite.prepare(sql))};
sqlite.exec(`CREATE TABLE sessions (token TEXT, specialist_id TEXT, expires_at TEXT);
CREATE TABLE specialists (id TEXT, email TEXT, name TEXT, role TEXT, location TEXT, bio TEXT);
CREATE TABLE hermes_owner_work_items (
  id TEXT PRIMARY KEY,
  organization_scope TEXT NOT NULL CHECK (organization_scope = 'hermes_internal'),
  workstream TEXT NOT NULL CHECK (workstream IN ('marketing','logistics','sales','technology','academy','finance','operations')),
  priority TEXT NOT NULL DEFAULT 'p2' CHECK (priority IN ('p0','p1','p2','p3')),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'text' CHECK (source IN ('text','voice','imported')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','ready','in_progress','blocked','done','cancelled')),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  linked_task_id TEXT,
  completed_at TEXT,
  blocked_reason TEXT
);`);
const future=new Date(Date.now()+3600000).toISOString();
for(const [id,email,name] of [["owner-1","owner1@example.invalid","Owner One"],["owner-2","owner2@example.invalid","Owner Two"],["ordinary","ordinary@example.invalid","Ordinary"]]){
  sqlite.prepare("INSERT INTO specialists VALUES (?,?,?,?,?,?)").run(id,email,name,"Owner","","");
  sqlite.prepare("INSERT INTO sessions VALUES (?,?,?)").run("session-"+id,id,future);
}
await ensureInternalAiSchema(DB);
await ensureCommandCenterSchema(DB);
const migratedColumns=new Set(sqlite.prepare("PRAGMA table_info(hermes_owner_work_items)").all().map(column=>column.name));
assert(migratedColumns.has("acceptance_status"),"existing owner backlog must gain acceptance state without replacement");
assert(migratedColumns.has("accepted_by"),"existing owner backlog must gain acceptance actor receipt");
assert(migratedColumns.has("accepted_at"),"existing owner backlog must gain acceptance time receipt");
const now="2026-10-26T16:00:00.000Z";
await DB.prepare("INSERT INTO hermes_internal_owner_access (specialist_id,active,capability,created_at,updated_at) VALUES ('owner-1',1,'HERMES_INTERNAL_OWNER',?,?)").bind(now,now).run();

const req=(path,method="GET",body=null,owner="owner-1")=>new Request("https://example.test"+path,{
  method,
  headers:{
    Cookie:"hermes_session=session-"+owner,
    Origin:"https://example.test",
    "Sec-Fetch-Site":"same-origin",
    ...(body?{"Content-Type":"application/json"}:{})
  },
  ...(body?{body:JSON.stringify(body)}:{})
});
const json=async(response)=>({status:response.status,body:await response.json()});

let r=await json(await createWork({request:req("/api/internal-command-center/work-items","POST",{workstream:"marketing",priority:"p1",title:"Marketing task",details:"Improve one bounded marketing workflow.",source:"voice"}),env:{DB}}));
assert.equal(r.status,201);
const firstId=r.body.work_item.id;
assert.equal(r.body.work_item.status,"planned");
assert.equal(r.body.work_item.source,"voice");

r=await json(await createWork({request:req("/api/internal-command-center/work-items","POST",{workstream:"logistics",priority:"p2",title:"Logistics task",details:"Inspect one logistics workflow.",source:"text"}),env:{DB}}));
assert.equal(r.status,201);
const secondId=r.body.work_item.id;
assert.notEqual(secondId,firstId);

r=await json(await mutateWork({request:req("/api/internal-command-center/work-items/"+firstId,"PATCH",{action:"dispatch"}),env:{DB},params:{id:firstId}}));
assert.equal(r.status,200);
assert.equal(r.body.state,"dispatched");
assert.equal(r.body.work_item.status,"in_progress");
assert.equal(r.body.task.status,"queued");
const firstTaskId=r.body.task.id;

r=await json(await mutateWork({request:req("/api/internal-command-center/work-items/"+secondId,"PATCH",{action:"dispatch"}),env:{DB},params:{id:secondId}}));
assert.equal(r.status,409);
assert.equal(r.body.error,"active_task_exists");
assert.equal(r.body.work_item.status,"planned","second backlog item must remain safe while another AI task is active");

const taskCount=(await DB.prepare("SELECT COUNT(*) AS c FROM hermes_internal_ai_tasks WHERE organization_scope='hermes_internal' AND status IN ('queued','running','needs_approval')").first()).c;
assert.equal(taskCount,1,"atomic dispatch must never create two active AI tasks");

await DB.prepare("UPDATE hermes_internal_ai_tasks SET status='completed',completed_at=?,updated_at=? WHERE id=?").bind(now,now,firstTaskId).run();
r=await json(await listWork({request:req("/api/internal-command-center/work-items"),env:{DB}}));
assert.equal(r.status,200);
const first=r.body.work_items.find(x=>x.id===firstId);
const second=r.body.work_items.find(x=>x.id===secondId);
assert.equal(first.status,"awaiting_acceptance","completed linked AI task must wait for explicit owner acceptance");
assert.equal(first.completed_at,null,"execution completion must not be recorded as owner acceptance");
assert.equal(first.accepted_at,null,"acceptance receipt must remain empty before owner review");
assert.equal(second.status,"planned");

r=await json(await mutateWork({request:req("/api/internal-command-center/work-items/"+firstId,"PATCH",{action:"block",reason:"Evidence does not yet prove the requested business outcome."}),env:{DB},params:{id:firstId}}));
assert.equal(r.status,200);
assert.equal(r.body.work_item.status,"blocked");
assert.match(r.body.work_item.blocked_reason,/does not yet prove/);

r=await json(await mutateWork({request:req("/api/internal-command-center/work-items/"+firstId,"PATCH",{action:"dispatch"}),env:{DB},params:{id:firstId}}));
assert.equal(r.status,200,"owner-requested rework must be dispatchable after a completed execution");
assert.equal(r.body.work_item.status,"in_progress");
assert.notEqual(r.body.task.id,firstTaskId);
const replacementTaskId=r.body.task.id;
await DB.prepare("UPDATE hermes_internal_ai_tasks SET status='completed',completed_at=?,updated_at=? WHERE id=?").bind(now,now,replacementTaskId).run();
r=await json(await listWork({request:req("/api/internal-command-center/work-items"),env:{DB}}));
assert.equal(r.body.work_items.find(x=>x.id===firstId).status,"awaiting_acceptance");

r=await json(await mutateWork({request:req("/api/internal-command-center/work-items/"+firstId,"PATCH",{action:"accept"}),env:{DB},params:{id:firstId}}));
assert.equal(r.status,200);
assert.equal(r.body.work_item.status,"done");
assert.equal(r.body.work_item.accepted_by,"owner-1");
assert.ok(r.body.work_item.accepted_at);
assert.ok(r.body.work_item.completed_at);

r=await json(await mutateWork({request:req("/api/internal-command-center/work-items/"+secondId,"PATCH",{action:"accept"}),env:{DB},params:{id:secondId}}));
assert.equal(r.status,409);
assert.equal(r.body.error,"work_item_not_awaiting_acceptance");

r=await json(await mutateWork({request:req("/api/internal-command-center/work-items/"+secondId,"PATCH",{action:"dispatch"}),env:{DB},params:{id:secondId}}));
assert.equal(r.status,200);
assert.equal(r.body.work_item.status,"in_progress","next work item may dispatch after the first task is terminal");

r=await json(await mutateAccess({request:req("/api/internal-command-center/access","POST",{action:"grant",email:"owner2@example.invalid"}),env:{DB}}));
assert.equal(r.status,200);
assert.equal(r.body.action,"grant");
assert.equal(r.body.target.specialist_id,"owner-2");
let access=(await json(await listAccess({request:req("/api/internal-command-center/access"),env:{DB}}))).body.access;
assert.equal(access.filter(x=>x.active).length,2);

r=await json(await mutateAccess({request:req("/api/internal-command-center/access","POST",{action:"grant",email:"missing@example.invalid"}),env:{DB}}));
assert.equal(r.status,404);
assert.equal(r.body.error,"specialist_not_found");

r=await json(await mutateAccess({request:req("/api/internal-command-center/access","POST",{action:"revoke",email:"owner1@example.invalid"}),env:{DB}}));
assert.equal(r.status,409);
assert.equal(r.body.error,"cannot_revoke_current_owner");

r=await json(await mutateAccess({request:req("/api/internal-command-center/access","POST",{action:"revoke",email:"owner2@example.invalid"}),env:{DB}}));
assert.equal(r.status,200);
assert.equal(r.body.action,"revoke");
r=await json(await mutateAccess({request:req("/api/internal-command-center/access","POST",{action:"revoke",email:"owner2@example.invalid"}),env:{DB}}));
assert.equal(r.status,409);
assert.equal(r.body.error,"cannot_remove_last_owner_or_inactive_owner","repeated/inactive revoke must fail closed and never create another audit event");
const audit=await DB.prepare("SELECT action,target_specialist_id FROM hermes_internal_owner_access_audit ORDER BY id").all();
assert.deepEqual(audit.results.map(x=>[x.action,x.target_specialist_id]),[["grant","owner-2"],["revoke","owner-2"]]);

r=await json(await createWork({request:req("/api/internal-command-center/work-items","POST",{workstream:"marketing",priority:"p1",title:"Cross site",details:"Should fail."}),env:{DB}}));
assert.equal(r.status,201);
const cross=new Request("https://example.test/api/internal-command-center/work-items",{method:"POST",headers:{Cookie:"hermes_session=session-owner-1",Origin:"https://evil.example","Sec-Fetch-Site":"cross-site","Content-Type":"application/json"},body:JSON.stringify({workstream:"marketing",priority:"p1",title:"Bad",details:"Cross-site mutation"})});
r=await json(await createWork({request:cross,env:{DB}}));
assert.equal(r.status,403);
assert.equal(r.body.error,"csrf_origin_mismatch");

sqlite.close();
console.log("Hermes Business Command Center SQLite integration: PASS");
