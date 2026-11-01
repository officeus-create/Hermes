import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";
import {
  ensureHaeProcessSchema,
  haeProcessTemplate,
  publicHaeProcess,
} from "../src/lib/hae-process-control.mjs";
import { socialAcquisitionOwnerControl } from "../workers/automation-engine/src/social-hourly-runtime.mjs";

class Statement{
  constructor(statement,args=[]){this.statement=statement;this.args=args}
  bind(...args){return new Statement(this.statement,args)}
  async run(){const info=this.statement.run(...this.args);return{meta:{changes:Number(info.changes??0)}}}
  async first(){return this.statement.get(...this.args)??null}
  async all(){return{results:this.statement.all(...this.args)}}
}
const sqlite=new DatabaseSync(":memory:");
const DB={
  prepare:sql=>new Statement(sqlite.prepare(sql)),
  batch:async statements=>{
    sqlite.exec("BEGIN");
    try{
      const results=[];
      for(const statement of statements)results.push(await statement.run());
      sqlite.exec("COMMIT");
      return results;
    }catch(error){
      sqlite.exec("ROLLBACK");
      throw error;
    }
  },
};
await ensureHaeProcessSchema(DB);

const template=haeProcessTemplate("social.acquisition.control");
assert.equal(template?.control_only,true);
assert.equal(template?.role_id,"hermes-marketing-growth");
assert.deepEqual([...template.allowed_cadence_hours],[1]);

let control=await socialAcquisitionOwnerControl(DB);
assert.equal(control.configured,false);
assert.equal(control.status,"inherited_active");
assert.equal(control.allowed,true);

const now="2026-11-01T08:00:00.000Z";
sqlite.prepare(`INSERT INTO hermes_automation_processes
(process_id,organization_scope,name,job_type,business_lane,workstream,role_id,cadence_hours,timezone,status,max_cost_usd_cents,next_run_at,created_by,created_at,updated_at)
VALUES (?,?,?,?,?,?,?,?,?,'paused',0,NULL,?,?,?)`).run(
  "haep_social","hermes_internal","Social Acquisition","social.acquisition.control","marketing","marketing",
  "hermes-marketing-growth",1,"UTC","owner",now,now,
);
control=await socialAcquisitionOwnerControl(DB);
assert.equal(control.configured,true);
assert.equal(control.process_id,"haep_social");
assert.equal(control.status,"paused");
assert.equal(control.allowed,false);
let publicProcess=publicHaeProcess(sqlite.prepare("SELECT * FROM hermes_automation_processes WHERE process_id='haep_social'").get());
assert.equal(publicProcess.control_only,true);
assert.equal(publicProcess.next_run_at,null);

sqlite.prepare("UPDATE hermes_automation_processes SET status='active',next_run_at=NULL WHERE process_id='haep_social'").run();
control=await socialAcquisitionOwnerControl(DB);
assert.equal(control.allowed,true);
assert.equal(control.status,"active");

const processApi=await readFile(new URL("../functions/api/internal-command-center/processes/[id].ts",import.meta.url),"utf8");
const ownerRuntime=await readFile(new URL("../workers/automation-engine/src/owner-process-runtime.mjs",import.meta.url),"utf8");
const socialRuntime=await readFile(new URL("../workers/automation-engine/src/social-hourly-runtime.mjs",import.meta.url),"utf8");
const worker=await readFile(new URL("../workers/automation-engine/src/index.mjs",import.meta.url),"utf8");
const component=await readFile(new URL("../src/components/HermesSocialAcquisition.astro",import.meta.url),"utf8");

assert.match(processApi,/controlOnly/);
assert.match(processApi,/process_control_only/);
assert.match(processApi,/SET status='active',next_run_at=NULL/);
assert.match(processApi,/SET status='paused',next_run_at=NULL/);
assert.match(ownerRuntime,/template\?\.control_only\) continue/);
assert.match(socialRuntime,/socialAcquisitionOwnerControl/);
assert.match(socialRuntime,/if\(!control\.allowed\)return \{queued:0,drafts:\[\],control\}/);
assert.match(socialRuntime,/social_owner_paused/);
assert.match(worker,/cron\.social_v2_owner_paused/);
assert.match(component,/data-social-control/);
assert.match(component,/social\.acquisition\.control/);
assert.match(component,/api\/internal-command-center\/processes/);
assert.doesNotMatch(component,/setInterval\(/);

sqlite.close();
console.log("Social Acquisition owner control: existing HAE process table -> no second scheduler -> pause/resume PASS");
