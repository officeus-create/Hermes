import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { fridayKyivSlot, mondayKyivSlot, runCatalogWeeklyOwnerReport, runCatalogMondayOwnerNotice } from "../workers/automation-engine/src/catalog-owner-weekly.mjs";
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
  if(url.includes("api.github.com"))return new Response(JSON.stringify({items:[{number:2209,title:"Friday owner audit",body:"Blocked by #2106",state:"open",html_url:"https://github.com/officeus-create/Hermes/issues/2209"}]}),{status:200,headers:{"Content-Type":"application/json"}});
  throw Error("unexpected URL "+url);
};
assert.equal(fridayKyivSlot("2026-11-06T10:00:00Z"),"2026-11-06","winter noon must be UTC 10");
assert.equal(fridayKyivSlot("2026-07-03T09:00:00Z"),"2026-07-03","summer noon must be UTC 09");
assert.equal(fridayKyivSlot("2026-11-06T09:00:00Z"),null,"wrong UTC tick in winter must not duplicate");
assert.equal(fridayKyivSlot("2026-07-03T10:00:00Z"),null,"wrong UTC tick in summer must not duplicate");
assert.equal(fridayKyivSlot("2026-11-05T10:00:00Z"),null,"non-Friday must not run");
assert.equal(mondayKyivSlot("2026-11-09T10:00:00Z"),"2026-11-09","winter Monday noon must be UTC 10");
assert.equal(mondayKyivSlot("2026-07-06T09:00:00Z"),"2026-07-06","summer Monday noon must be UTC 09");
assert.equal(mondayKyivSlot("2026-11-09T09:00:00Z"),null,"winter 11:00 Kyiv must not notify");
assert.equal(mondayKyivSlot("2026-07-06T10:00:00Z"),null,"summer 13:00 Kyiv must not notify");
assert.equal(mondayKyivSlot("2026-11-06T10:00:00Z"),null,"Friday cannot notify on Monday lane");
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
assert.deepEqual(report.work.open_issues[0].declared_dependency_ids,[2106]);
assert.equal(report.work.dependency_status,"DECLARED_ONLY_NOT_LIVE_VERIFIED");
assert.equal(typeof report.next_action.task,"string");
assert.equal(typeof report.next_action.done,"string");
assert.equal(report.realized.public_businesses_live,true);
// Monday links the immediately preceding Friday; repeated ticks never issue another notice.
let n=await runCatalogMondayOwnerNotice(env,new Date("2026-11-09T10:00:00Z"));
assert.equal(n.status,"READY");
assert.equal(n.source_status,"FRIDAY_REPORT_READY");
n=await runCatalogMondayOwnerNotice(env,new Date("2026-11-09T10:17:00Z"));
assert.equal(n.status,"ALREADY_EXISTS");
assert.equal((await DB.prepare("SELECT COUNT(*) AS count FROM hermes_catalog_owner_monday_notices").first()).count,1);
const monday=JSON.parse((await DB.prepare("SELECT notice_json FROM hermes_catalog_owner_monday_notices WHERE monday_date='2026-11-09'").first()).notice_json);
assert.equal(monday.friday_date,"2026-11-06");
assert.equal(monday.friday_report_key,"catalog-owner:2026-11-06");
assert.deepEqual(monday.blockers,report.blockers);
assert.deepEqual(monday.next_action,report.next_action);
assert.equal(monday.llm_calls,0);
assert.equal(monday.paid_ai_cost_usd,0);
assert.equal(monday.destination,"private_command_center");
// First Monday predates first Friday run: be explicit, do not silently use an older week.
n=await runCatalogMondayOwnerNotice(env,new Date("2026-11-02T10:00:00Z"));
assert.equal(n.status,"READY");
assert.equal(n.source_status,"FRIDAY_REPORT_MISSING");
const missing=JSON.parse((await DB.prepare("SELECT notice_json FROM hermes_catalog_owner_monday_notices WHERE monday_date='2026-11-02'").first()).notice_json);
assert.equal(missing.friday_report_key,null);
assert.deepEqual(missing.blockers,["friday_report_not_ready"]);
assert.equal((await runCatalogMondayOwnerNotice(env,new Date("2026-11-06T10:00:00Z"))).status,"NOT_DUE");
const nonOwner=await onRequestGet({request:new Request("https://example.test/api/internal-command-center/catalog-weekly-report"),env});
assert.equal(nonOwner.status,401,"unauthenticated must not read private weekly report");
sqlite.close();
console.log("HAE Catalog Friday report + Monday notice, Kyiv/DST, D1 idempotency, zero LLM, missing-evidence guard, owner gate PASS");
