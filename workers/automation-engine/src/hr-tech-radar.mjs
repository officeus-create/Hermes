// Deterministic zero-LLM weekly HR-tech radar for the existing Hermes Automation Engine.
// Official sources only. No ChatGPT/Codex/model endpoint, no candidate PII, no consequential hiring decision.
const ORG="hermes_internal";
const DAY=86400000;
const GOOGLE_SEARCH_UPDATES="https://developers.google.com/search/updates/search_docs_updates.rss";
const DEFAULT_SOURCES=Object.freeze([
  Object.freeze({id:"google-search-updates",topic:"candidate_sourcing",url:GOOGLE_SEARCH_UPDATES,kind:"rss",official:true}),
  // Meta pages are snapshot-only because they do not expose a stable public change feed here.
  // A page change becomes NEEDS_CHECK; it is never narrated as a verified product change.
  Object.freeze({id:"meta-threads-docs",topic:"threads_instagram",url:"https://developers.facebook.com/docs/threads/",kind:"snapshot",official:true}),
  Object.freeze({id:"meta-instagram-platform-docs",topic:"threads_instagram",url:"https://developers.facebook.com/docs/instagram-platform/",kind:"snapshot",official:true}),
]);

function local(date){
  return Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",weekday:"short",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(date)).map(p=>[p.type,p.value]));
}
export function mondayHrTechKyivSlot(date){
  const p=local(date);
  return p.weekday==="Mon"&&p.hour==="10" ? p.year+"-"+p.month+"-"+p.day : null;
}
const clean=(value,max=500)=>String(value??"").replace(/[<>\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
const strip=(value)=>clean(String(value||"").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/<[^>]+>/g," "),1400);
const safeUrl=(value)=>{
  try{
    const u=new URL(String(value||""));
    if(u.protocol!=="https:")return null;
    if(!["developers.google.com","developers.facebook.com"].includes(u.hostname))return null;
    return u.href;
  }catch{return null;}
};
function xmlValue(block,name){
  const m=String(block||"").match(new RegExp("<"+name+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+name+">","i"));
  return m?strip(m[1]):"";
}
function xmlLink(block){
  const simple=String(block||"").match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
  if(simple)return strip(simple[1]);
  const attr=String(block||"").match(/<link\b[^>]*href=["']([^"']+)["']/i);
  return attr?strip(attr[1]):"";
}
function parseDate(value){
  const n=Date.parse(String(value||""));
  return Number.isFinite(n)?new Date(n).toISOString():null;
}
function classify(text,defaultTopic){
  const s=String(text||"").toLowerCase();
  if(/threads|instagram|meta api|messaging|webhook|oauth|publish/.test(s))return "threads_instagram";
  if(/interview|assessment|automated employment|artificial intelligence|bias|consent|privacy/.test(s))return "ai_interviews";
  if(/routing|workflow|candidate routing|assignment|skill routing/.test(s))return "candidate_routing";
  if(/jobposting|job posting|jobs?\b|recruit|hiring|candidate|ats|search/.test(s))return "candidate_sourcing";
  return defaultTopic||"other";
}
function impact(topic){
  if(topic==="candidate_sourcing")return {stages:["SOURCE","CANDIDATE"],next_step:"Review sourcing/indexing impact and update only the affected Hermes HR source contract.",owner:"hermes-hr"};
  if(topic==="threads_instagram")return {stages:["SOURCE","CANDIDATE"],next_step:"Verify account/API impact before changing recruiting distribution or attribution.",owner:"hermes-marketing-growth"};
  if(topic==="ai_interviews")return {stages:["INTERVIEW","HUMAN_ROUTING"],next_step:"Human-review consent, privacy, bias and reliability impact before changing interview workflow.",owner:"hermes-hr"};
  if(topic==="candidate_routing")return {stages:["HUMAN_ROUTING","ACADEMY/DIRECT_REVIEW"],next_step:"Review explainable routing rule; do not auto-reject, hire or infer protected traits.",owner:"hermes-hr"};
  return {stages:["SOURCE"],next_step:"Human review required before any Hermes funnel change.",owner:"hermes-hr"};
}
function priority(text){
  const s=String(text||"").toLowerCase();
  if(/deprecat|security|policy|required|breaking|remove|deadline/.test(s))return "P0";
  if(/api|index|jobposting|oauth|privacy|consent|interview|messag/.test(s))return "P1";
  return "P2";
}
function stableHash(text){
  let h=2166136261;
  for(const ch of String(text||"").slice(0,250000)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
  return h.toString(16).padStart(8,"0");
}
async function grab(fetcher,url,accept){
  try{
    const res=await fetcher(url,{headers:{Accept:accept,"User-Agent":"Hermes-HAE-HR-Tech-Radar"},signal:AbortSignal.timeout(7500)});
    const body=(await res.text()).slice(0,250000);
    if(!res.ok)return {state:"SOURCE_UNAVAILABLE",http_status:res.status,url,body:""};
    return {state:"MEASURED",http_status:res.status,url,body,etag:res.headers.get("etag"),last_modified:res.headers.get("last-modified")};
  }catch{return {state:"SOURCE_UNAVAILABLE",http_status:null,url,body:""};}
}
function rssEvents(source,body,when){
  const start=new Date(new Date(when).getTime()-7*DAY).getTime();
  const blocks=[...String(body||"").matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(x=>x[2]).slice(0,80);
  const out=[];
  for(const block of blocks){
    const title=xmlValue(block,"title");
    const description=xmlValue(block,"description")||xmlValue(block,"summary")||xmlValue(block,"content");
    const published=parseDate(xmlValue(block,"pubDate")||xmlValue(block,"published")||xmlValue(block,"updated")||xmlValue(block,"date"));
    const link=safeUrl(xmlLink(block));
    if(!published||Date.parse(published)<start||Date.parse(published)>new Date(when).getTime()+DAY)continue;
    const topic=classify(title+" "+description,source.topic);
    if(!["candidate_sourcing","threads_instagram","ai_interviews","candidate_routing"].includes(topic))continue;
    const mapped=impact(topic);
    out.push({
      source_id:source.id,source_name:source.id,source_url:link||source.url,published_at:published,observed_at:new Date().toISOString(),
      topic,title:clean(title,240)||"Official source update",what_changed:clean(description,900)||clean(title,500),
      funnel_stages:mapped.stages,next_step:mapped.next_step,owner:mapped.owner,priority:priority(title+" "+description),
      confidence:"VERIFIED",evidence_state:"OFFICIAL_DATED_SOURCE"
    });
  }
  return out.slice(0,20);
}
export async function ensureHrTechRadarSchema(db){
  await db.prepare("CREATE TABLE IF NOT EXISTS hermes_hr_tech_radar_reports (report_key TEXT PRIMARY KEY, organization_scope TEXT NOT NULL, monday_date TEXT NOT NULL, state TEXT NOT NULL, report_json TEXT, checked_at TEXT, source_sha TEXT, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS hermes_hr_tech_radar_source_state (source_id TEXT PRIMARY KEY, source_url TEXT NOT NULL, fingerprint TEXT, etag TEXT, last_modified TEXT, observed_at TEXT NOT NULL)").run();
}
async function sourceSnapshot(db,source,result,when){
  const fingerprint=stableHash(result.body);
  const previous=await db.prepare("SELECT fingerprint,etag,last_modified,observed_at FROM hermes_hr_tech_radar_source_state WHERE source_id=? LIMIT 1").bind(source.id).first();
  await db.prepare("INSERT INTO hermes_hr_tech_radar_source_state (source_id,source_url,fingerprint,etag,last_modified,observed_at) VALUES (?,?,?,?,?,?) ON CONFLICT(source_id) DO UPDATE SET source_url=excluded.source_url,fingerprint=excluded.fingerprint,etag=excluded.etag,last_modified=excluded.last_modified,observed_at=excluded.observed_at")
    .bind(source.id,source.url,fingerprint,result.etag||null,result.last_modified||null,new Date().toISOString()).run();
  if(!previous)return {state:"BASELINE_ONLY",event:null};
  const changed=String(previous.fingerprint||"")!==fingerprint || (!!result.etag&&String(previous.etag||"")!==String(result.etag));
  if(!changed)return {state:"NO_CHANGE",event:null};
  const mapped=impact(source.topic);
  return {state:"CHANGED_NEEDS_CHECK",event:{
    source_id:source.id,source_name:source.id,source_url:source.url,published_at:null,observed_at:new Date().toISOString(),topic:source.topic,
    title:source.id+" official documentation changed",what_changed:"Official documentation fingerprint changed; exact semantic delta requires human review.",
    funnel_stages:mapped.stages,next_step:mapped.next_step,owner:mapped.owner,priority:"P1",confidence:"NEEDS_CHECK",evidence_state:"OFFICIAL_PAGE_DIFF_UNDATED"
  }};
}
export function hrTechRadarDefaultSources(){return DEFAULT_SOURCES.map(x=>({...x}));}
export async function buildHrTechRadar(env,when=new Date(),fetcher=fetch){
  if(!env?.DB)throw new Error("database_not_configured");
  await ensureHrTechRadarSchema(env.DB);
  const checkedAt=new Date().toISOString();
  const events=[],sources=[];
  for(const source of DEFAULT_SOURCES){
    const result=await grab(fetcher,source.url,source.kind==="rss"?"application/rss+xml,application/xml,text/xml":"text/html");
    if(result.state!=="MEASURED"){
      sources.push({id:source.id,topic:source.topic,url:source.url,state:"SOURCE_UNAVAILABLE",http_status:result.http_status});
      continue;
    }
    if(source.kind==="rss"){
      const sourceEvents=rssEvents(source,result.body,when);
      events.push(...sourceEvents);
      sources.push({id:source.id,topic:source.topic,url:source.url,state:"MEASURED",http_status:result.http_status,events:sourceEvents.length});
    }else{
      const diff=await sourceSnapshot(env.DB,source,result,when);
      if(diff.event)events.push(diff.event);
      sources.push({id:source.id,topic:source.topic,url:source.url,state:diff.state,http_status:result.http_status});
    }
  }
  const topicCoverage=["candidate_sourcing","threads_instagram","ai_interviews","candidate_routing"].map(topic=>({
    topic,
    state:sources.some(s=>s.topic===topic&&["MEASURED","NO_CHANGE","BASELINE_ONLY","CHANGED_NEEDS_CHECK"].includes(s.state))?"SOURCE_CONFIGURED":"SOURCE_UNAVAILABLE"
  }));
  const verified=events.filter(e=>e.confidence==="VERIFIED");
  const needsCheck=events.filter(e=>e.confidence==="NEEDS_CHECK");
  const state=events.length?"READY":"NO_MATERIAL_CHANGES";
  return {
    type:"hr_tech_radar_v1",state,monday_date:mondayHrTechKyivSlot(when),checked_at:checkedAt,
    window_start:new Date(new Date(when).getTime()-7*DAY).toISOString(),window_end:new Date(when).toISOString(),
    source_sha:String(env.HERMES_AUTOMATION_SOURCE_SHA||"UNKNOWN"),destination:"private_command_center",
    llm_calls:0,ai_input_tokens:0,ai_output_tokens:0,paid_ai_cost_usd:0,
    sources,topic_coverage:topicCoverage,items:[...verified,...needsCheck].slice(0,30),
    limitations:[
      "Official-source coverage is explicit; missing topics stay SOURCE_UNAVAILABLE.",
      "Undated page diffs are NEEDS_CHECK and never narrated as verified product changes.",
      "No candidate PII, protected-trait scoring, automated rejection or hiring decision.",
      "Zero AI counters are enforced by this deterministic module; no model SDK or endpoint is used."
    ]
  };
}
export async function runHrTechRadar(env,when=new Date(),fetcher=fetch){
  const monday=mondayHrTechKyivSlot(when);
  if(!monday||!env?.DB)return {status:"NOT_DUE"};
  await ensureHrTechRadarSchema(env.DB);
  const key="hr-tech-radar:"+monday,now=new Date().toISOString();
  await env.DB.prepare("INSERT OR IGNORE INTO hermes_hr_tech_radar_reports (report_key,organization_scope,monday_date,state,updated_at) VALUES (?,?,?,'pending',?)").bind(key,ORG,monday,now).run();
  const lease=new Date(Date.now()+600000).toISOString();
  const claimed=await env.DB.prepare("UPDATE hermes_hr_tech_radar_reports SET state='running',lease_until=?,attempts=attempts+1,updated_at=? WHERE report_key=? AND organization_scope=? AND state!='ready' AND (lease_until IS NULL OR lease_until<=?)")
    .bind(lease,now,key,ORG,now).run();
  if(Number(claimed?.meta?.changes||0)!==1)return {status:"ALREADY_CLAIMED_OR_READY",key};
  try{
    const report=await buildHrTechRadar(env,when,fetcher);
    const saved=await env.DB.prepare("UPDATE hermes_hr_tech_radar_reports SET state='ready',report_json=?,checked_at=?,source_sha=?,lease_until=NULL,updated_at=? WHERE report_key=? AND organization_scope=? AND lease_until=?")
      .bind(JSON.stringify(report),report.checked_at,report.source_sha,new Date().toISOString(),key,ORG,lease).run();
    return {status:Number(saved?.meta?.changes||0)===1?"READY":"LEASE_LOST",key,report_state:report.state};
  }catch{
    await env.DB.prepare("UPDATE hermes_hr_tech_radar_reports SET state='pending',lease_until=NULL,updated_at=? WHERE report_key=? AND organization_scope=? AND lease_until=?")
      .bind(new Date().toISOString(),key,ORG,lease).run();
    return {status:"RETRYABLE_FAILURE",key};
  }
}
