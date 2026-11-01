import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { buildCommandCenterSocialSnapshot } from "../functions/api/_lib/internal-command-center-social.mjs";
import { readFile } from "node:fs/promises";

class Statement{
  constructor(statement,args=[]){this.statement=statement;this.args=args}
  bind(...args){return new Statement(this.statement,args)}
  async run(){const info=this.statement.run(...this.args);return{success:true,meta:{changes:Number(info.changes??0)}}}
  async first(){return this.statement.get(...this.args)??null}
  async all(){return{results:this.statement.all(...this.args)}}
}
const sqlite=new DatabaseSync(":memory:");
const db={prepare:sql=>new Statement(sqlite.prepare(sql))};
sqlite.exec(`
CREATE TABLE hermes_automation_content (
 content_id TEXT PRIMARY KEY,account_key TEXT,platform TEXT,slot_key TEXT,template_id TEXT,variant_key TEXT,
 destination_url TEXT,body TEXT,state TEXT,provider_post_id TEXT,permalink TEXT,last_error_class TEXT,created_at TEXT,updated_at TEXT
);
CREATE TABLE hermes_automation_runs (
 id TEXT PRIMARY KEY,trigger_type TEXT,account_key TEXT,platform TEXT,slot_key TEXT,status TEXT,last_error_class TEXT,created_at TEXT,updated_at TEXT
);
CREATE TABLE hermes_automation_publications (
 idempotency_key TEXT PRIMARY KEY,content_id TEXT UNIQUE,account_key TEXT,platform TEXT,status TEXT,attempt_count INTEGER,readback_attempt INTEGER,
 next_readback_at TEXT,provider_post_id TEXT,permalink TEXT,last_error_class TEXT,created_at TEXT,updated_at TEXT
);
CREATE TABLE hermes_automation_runtime_events (
 event_id TEXT PRIMARY KEY,event_type TEXT,queue_name TEXT,queue_message_id TEXT,message_sent_at TEXT,message_type TEXT,job_id TEXT,
 content_id TEXT,slot_key TEXT,attempt_count INTEGER,error_class TEXT,created_at TEXT
);
`);
const now="2026-11-01T08:00:00.000Z";
sqlite.prepare("INSERT INTO hermes_automation_content VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(
 "hermes_logistics:threads:2026-11-01T01","hermes_logistics","threads","2026-11-01T01","deadhead","deadhead:threads",
 "https://hermeslogisticsus.com/logistics/car-hauling-dispatch/?utm_source=threads&utm_medium=organic_social&utm_campaign=car_hauler_carrier_growth",
 "Synthetic safe test body","published_verified","18100000000000001","https://www.threads.net/@hermes.logistics/post/TEST",null,now,now
);
sqlite.prepare("INSERT INTO hermes_automation_content VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(
 "progressopro:facebook:2026-11-01T01","progressopro","facebook","2026-11-01T01","website-conversion","website-conversion:facebook",
 "https://hermeslogisticsus.com/paths/marketing/?utm_source=facebook&utm_medium=organic_social&utm_campaign=progressopro_growth",
 "Synthetic ProgressoPro test body","draft_ready",null,null,null,now,now
);
sqlite.prepare("INSERT INTO hermes_automation_runs VALUES (?,?,?,?,?,?,?,?,?)").run(
 "run:hermes_logistics:threads:2026-11-01T01","cron_v2","hermes_logistics","threads","2026-11-01T01","published_verified",null,now,now
);
sqlite.prepare("INSERT INTO hermes_automation_publications VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").run(
 "hae:hermes_logistics:threads:2026-11-01T01","hermes_logistics:threads:2026-11-01T01","hermes_logistics","threads","published_verified",1,1,null,
 "18100000000000001","https://www.threads.net/@hermes.logistics/post/TEST",null,now,now
);
sqlite.prepare("INSERT INTO hermes_automation_runtime_events VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(
 "social-plugin-policy:hermes_logistics:2026-11-01T01","social.plugin_policy_bound",null,null,null,
 "plugin_policy:hermes-agent-coordinator@0.1.85|hermes-marketing-growth@0.1.16",null,
 "hermes_logistics:threads:2026-11-01T01","2026-11-01T01",null,null,now
);

const snapshot=await buildCommandCenterSocialSnapshot({DB:db,HERMES_AUTOMATION_MODE:"dry_run",HERMES_AUTOMATION_PUBLISH:"disabled"},{nowMs:Date.parse(now)});
assert.equal(snapshot.success,true);
assert.equal(snapshot.runtime.scheduler_owner,"HAE");
assert.equal(snapshot.runtime.external_write_enabled,false);
assert.deepEqual(snapshot.schedule.quiet_hours,[2,3,4,5]);
assert.equal(snapshot.lanes.length,2);
const logistics=snapshot.lanes.find(x=>x.lane==="HERMES_LOGISTICS");
const progresso=snapshot.lanes.find(x=>x.lane==="PROGRESSOPRO");
assert.equal(logistics.platform_states.threads.state,"published_verified");
assert.equal(logistics.latest_verified_publication.provider_post_id,"18100000000000001");
assert.equal(logistics.unresolved_publications,0);
assert.match(logistics.plugin_policy_receipt.policy,/hermes-agent-coordinator@0\.1\.85/);
assert.equal(progresso.platform_states.facebook.state,"draft_ready");
assert.equal(progresso.unresolved_publications,0);
assert.equal(snapshot.inbound.threads_replies_mentions,"NOT_LIVE");
assert.equal(snapshot.funnel.counts,"NOT_JOINED_IN_THIS_READ_MODEL");
const serialized=JSON.stringify(snapshot);
for(const forbidden of ["token_ciphertext","access_token","HERMES_THREADS_ACCESS_TOKEN","THREADS_BRAND_TOKEN_KEY"]){
  assert.equal(serialized.includes(forbidden),false,"Command Center social read model must not expose secret fields: "+forbidden);
}

const endpoint=await readFile(new URL("../functions/api/internal-command-center/social.ts",import.meta.url),"utf8");
const component=await readFile(new URL("../src/components/HermesSocialAcquisition.astro",import.meta.url),"utf8");
assert.match(endpoint,/requireInternalOwner/);
assert.match(endpoint,/private, no-store/);
assert.doesNotMatch(endpoint,/onRequestPost/);
assert.match(component,/Social Acquisition/);
assert.match(component,/Content queue/);
assert.match(component,/data-social-content/);
assert.match(component,/api\/internal-command-center\/social/);
assert.match(component,/Source/);
assert.match(component,/Readback/);
assert.match(component,/CRM/);
assert.doesNotMatch(component,/Publish selected/);
assert.doesNotMatch(component,/setInterval\(/);

sqlite.close();
console.log("Command Center Social Acquisition read model: PASS");
