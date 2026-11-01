import assert from "node:assert/strict";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { mondayHrTechKyivSlot, buildHrTechRadar, runHrTechRadar } from "../workers/automation-engine/src/hr-tech-radar.mjs";
import { onRequestGet } from "../functions/api/internal-command-center/hr-tech-radar.ts";

class Statement{
  constructor(statement,args=[]){this.statement=statement;this.args=args;}
  bind(...args){return new Statement(this.statement,args);}
  async run(){const r=this.statement.run(...this.args);return {meta:{changes:Number(r.changes||0)}};}
  async first(){return this.statement.get(...this.args)||null;}
  async all(){return {results:this.statement.all(...this.args)};}
}
function makeDb(){
  const sqlite=new DatabaseSync(":memory:");
  const DB={prepare:(sql)=>new Statement(sqlite.prepare(sql))};
  return {sqlite,DB};
}
const mondayWinter=new Date("2026-11-02T08:00:00.000Z");
const mondaySummer=new Date("2027-06-07T07:00:00.000Z");
assert.equal(mondayHrTechKyivSlot(mondayWinter),"2026-11-02");
assert.equal(mondayHrTechKyivSlot(mondaySummer),"2027-06-07");
assert.equal(mondayHrTechKyivSlot(new Date("2027-06-07T08:00:00.000Z")),null,"11:00 Kyiv summer must not run");
assert.equal(mondayHrTechKyivSlot(new Date("2026-11-03T08:00:00.000Z")),null,"Tuesday must not run");

const rss=`<?xml version="1.0"?><rss><channel>
<item><title>JobPosting indexing requirement updated</title><link>https://developers.google.com/search/updates</link><pubDate>Fri, 30 Oct 2026 12:00:00 GMT</pubDate><description>Updated job posting and Search indexing guidance for site owners.</description></item>
<item><title>Old recruiting item</title><link>https://developers.google.com/search/updates</link><pubDate>Thu, 01 Oct 2026 12:00:00 GMT</pubDate><description>Old candidate source note.</description></item>
</channel></rss>`;
const fakeFetch=async(url)=>{
  const value=String(url);
  assert.doesNotMatch(value,/openai|anthropic|gemini|workers\.ai|chatgpt/i,"runtime must never contact model endpoints");
  if(value==="https://developers.google.com/search/updates/search_docs_updates.rss")return new Response(rss,{status:200,headers:{"Content-Type":"application/rss+xml"}});
  if(value==="https://developers.facebook.com/docs/threads/")return new Response("<html><body>Threads API docs baseline</body></html>",{status:200,headers:{etag:'"threads-v1"'}});
  if(value==="https://developers.facebook.com/docs/instagram-platform/")return new Response("<html><body>Instagram Platform docs baseline</body></html>",{status:200,headers:{etag:'"instagram-v1"'}});
  throw new Error("unexpected source "+value);
};

{
  const {DB}=makeDb();
  const report=await buildHrTechRadar({DB,HERMES_AUTOMATION_SOURCE_SHA:"sha-hr"},mondayWinter,fakeFetch);
  assert.equal(report.llm_calls,0);
  assert.equal(report.ai_input_tokens,0);
  assert.equal(report.ai_output_tokens,0);
  assert.equal(report.paid_ai_cost_usd,0);
  assert.equal(report.destination,"private_command_center");
  assert.equal(report.items.length,1,"only the dated in-window official RSS item should be emitted on first run");
  assert.equal(report.items[0].confidence,"VERIFIED");
  assert.equal(report.items[0].topic,"candidate_sourcing");
  assert.deepEqual(report.items[0].funnel_stages,["SOURCE","CANDIDATE"]);
  assert.equal(report.sources.find(x=>x.id==="meta-threads-docs").state,"BASELINE_ONLY");
  assert.equal(report.topic_coverage.find(x=>x.topic==="ai_interviews").state,"SOURCE_UNAVAILABLE");
  assert.equal(report.topic_coverage.find(x=>x.topic==="candidate_routing").state,"SOURCE_UNAVAILABLE");
}

{
  const {DB}=makeDb();
  const env={DB,HERMES_AUTOMATION_SOURCE_SHA:"sha-hr"};
  const first=await runHrTechRadar(env,mondayWinter,fakeFetch);
  const replay=await runHrTechRadar(env,mondayWinter,fakeFetch);
  assert.equal(first.status,"READY");
  assert.equal(replay.status,"ALREADY_CLAIMED_OR_READY","same Monday must be idempotent");
  const row=await DB.prepare("SELECT state,report_json FROM hermes_hr_tech_radar_reports WHERE report_key=?").bind("hr-tech-radar:2026-11-02").first();
  assert.equal(row.state,"ready");
  const saved=JSON.parse(row.report_json);
  assert.equal(saved.llm_calls,0);
  assert.equal(saved.ai_input_tokens,0);
  assert.equal(saved.ai_output_tokens,0);
}

{
  const {sqlite,DB}=makeDb();
  sqlite.exec(`
    CREATE TABLE specialists (id TEXT PRIMARY KEY,email TEXT,name TEXT,role TEXT,location TEXT,bio TEXT);
    CREATE TABLE sessions (token TEXT PRIMARY KEY,specialist_id TEXT NOT NULL,expires_at TEXT NOT NULL);
  `);
  const unauth=await onRequestGet({request:new Request("https://hermeslogisticsus.com/api/internal-command-center/hr-tech-radar"),env:{DB}});
  assert.equal(unauth.status,401,"owner report API must reject an unauthenticated reader");
}

const source=fs.readFileSync("workers/automation-engine/src/hr-tech-radar.mjs","utf8");
const endpoint=fs.readFileSync("functions/api/internal-command-center/hr-tech-radar.ts","utf8");
const worker=fs.readFileSync("workers/automation-engine/src/index.mjs","utf8");
const wrangler=fs.readFileSync("workers/automation-engine/wrangler.jsonc.example","utf8");
assert.doesNotMatch(source,/OpenAI|Anthropic|Gemini|WorkersAI|runFreeSemanticJson|freeAiProvider|AI\.run/i,"HR radar module must not import or invoke AI inference");
assert.match(source,/llm_calls:0,ai_input_tokens:0,ai_output_tokens:0,paid_ai_cost_usd:0/);
assert.match(source,/SOURCE_UNAVAILABLE/);
assert.match(source,/HUMAN_REVIEW_REQUIRED|human review/i);
assert.match(endpoint,/requireInternalOwner/);
assert.match(worker,/runHrTechRadar/);
assert.match(worker,/\["0 7 \* \* 1", "0 8 \* \* 1"\]/);
assert.match(wrangler,/0 7 \* \* 1/);
assert.match(wrangler,/0 8 \* \* 1/);

console.log("HAE_HR_TECH_RADAR_PASS");
