import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { fridayKyivSlot, runCatalogWeeklyOwnerReport } from "../workers/automation-engine/src/catalog-owner-weekly.mjs";
import { onRequestGet } from "../functions/api/internal-command-center/catalog-weekly-report.ts";

class Statement{
  constructor(statement,args=[]){this.statement=statement;this.args=args;}
  bind(...args){return new Statement(this.statement,args);}
  async run(){const r=this.statement.run(...this.args);return {meta:{changes:Number(r.changes||0)}};}
  async first(){return this.statement.get(...this.args)||null;}
  async all(){return {results:this.statement.all(...this.args)};}
}
const sqlite=new DatabaseSync(":memory:");
const DB={prepare:(sql)=>new Statement(sqlite.prepare(sql))};
sqlite.exec("CREATE TABLE hermes_company_profiles (id TEXT PRIMARY KEY,catalog_opt_in INTEGER,catalog_status TEXT,created_at TEXT);");
sqlite.prepare("INSERT INTO hermes_company_profiles VALUES(?,?,?,?)").run("one",1,"verified_public","2026-11-04T10:00:00.000Z");
const stableFetch=async url=>{
  if(url.includes("/businesses/")) return new Response('<html><link rel="canonical" href="https://hermeslogisticsus.com/businesses/"></html>',{status:200});
  if(url.includes("sitemap-connect-catalog")) return new Response("<urlset><loc>https://hermeslogisticsus.com/businesses/foo/</loc></urlset>",{status:200});
  if(url.includes("api.github.com"))return new Response(JSON.stringify({items:[{number:2209,title:"Friday owner audit",state:"open",html_url:"https://github.com/officeus-create/Hermes/issues/2209"}]}),{status:200,headers:{"Content-Type":"application/json"}});
  throw Error("unexpected URL "+url);
};
assert.equal(fridayKyivSlot("2026-11-06T10:00:00Z"),"2026-11-06","winter noon must be UTC 10");
assert.equal(fridayKyivSlot("2026-07-03T09:00:00Z"),"2026-07-03","summer noon must be UTC 09");
assert.equal(fridayKyivSlot("2026-11-06T09:00:00Z"),null,"wrong UTC tick in winter must not duplicate");
assert.equal(fridayKyivSlot("2026-07-03T10:00:00Z"),null,"wrong UTC tick in summer must not duplicate");
assert.equal(fridayKyivSlot("2026-11-05T10:00:00Z"),null,"non-Friday must not run");
const env={DB,HERMES_AUTOMATION_SOURCE_SHA:"2ad698b3191264889d4d5ac22c7d86aff9276492"};
let x=await runCatalogWeeklyOwnerReport(env,new Date("2026-11-06T10:00:00Z"),stableFetch);
assert.equal(x.status,"READY");
x=await runCatalogWeeklyOwnerReport(env,new Date("2026-11-06T10:17:00Z"),stableFetch);
assert.equal(x.status,"ALREADY_CLAIMED_OR_READY","retries cannot create duplicate reports");
const row=sqlite.prepare("SELECT state,attempts,report_json FROM hermes_catalog_owner_weekly_reports").get();
assert.equal(row.state,"ready");
assert.equal(row.attempts,1);
const report=JSON.parse(row.report_json);
assert.equal(report.llm_calls,0);
assert.equal(report.paid_ai_cost_usd,0);
assert.equal(report.destination,"private_command_center");
assert.equal(report.profiles.opted_in,1);
assert.equal(report.profiles.verified_public,1);
assert.equal(report.profiles.new_7d,1);
assert.equal(report.profiles.free_tier_count,null,"opt-in must not invent a free-tier count");
assert.equal(report.sitemap.semantic_overlap,"NOT_VERIFIED");
assert.equal(typeof report.next_action.task,"string");
assert.equal(typeof report.next_action.done,"string");
assert.equal(report.realized.public_businesses_live,true);
const nonOwner=await onRequestGet({request:new Request("https://example.test/api/internal-command-center/catalog-weekly-report"),env});
assert.equal(nonOwner.status,401,"unauthenticated must not read private weekly report");
sqlite.close();
console.log("HAE Catalog weekly Friday Kyiv/DST, D1 idempotency, zero LLM, truth boundaries, owner gate PASS");
