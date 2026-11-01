// Existing Hermes Automation Engine Cron owns this deterministic, zero-LLM owner report.
// This is NOT the pre-existing customer-facing Catalog weekly email.
const SITE="https://hermeslogisticsus.com";
const ORG="hermes_internal";
function local(date){
  return Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Kyiv",weekday:"short",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hourCycle:"h23"}).formatToParts(date).map(p=>[p.type,p.value]));
}
export function fridayKyivSlot(date){
  const p=local(new Date(date));
  return p.weekday==="Fri"&&p.hour==="12" ? p.year+"-"+p.month+"-"+p.day : null;
}
export async function ensureCatalogWeeklyOwnerSchema(db){
  await db.prepare("CREATE TABLE IF NOT EXISTS hermes_catalog_owner_weekly_reports (report_key TEXT PRIMARY KEY, organization_scope TEXT NOT NULL, week_date TEXT NOT NULL, state TEXT NOT NULL, report_json TEXT, checked_at TEXT, source_sha TEXT, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)").run();
}
async function exists(db,name){
  return !!(await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1").bind(name).first());
}
async function profiles(db,from,to){
  if(!await exists(db,"hermes_company_profiles")) return {status:"UNKNOWN",reason:"company_profile_table_missing"};
  try{
    const row=await db.prepare("SELECT COUNT(*) total, SUM(CASE WHEN catalog_opt_in=1 THEN 1 ELSE 0 END) opted_in, SUM(CASE WHEN catalog_opt_in=1 AND catalog_status='verified_public' THEN 1 ELSE 0 END) verified_public, SUM(CASE WHEN catalog_opt_in=1 AND catalog_status='self_submitted' THEN 1 ELSE 0 END) self_submitted, SUM(CASE WHEN catalog_opt_in=1 AND created_at>=? AND created_at<? THEN 1 ELSE 0 END) new_7d FROM hermes_company_profiles").bind(from,to).first();
    const out={status:"MEASURED",source:"D1:hermes_company_profiles",total:Number(row.total||0),opted_in:Number(row.opted_in||0),verified_public:Number(row.verified_public||0),self_submitted:Number(row.self_submitted||0),new_7d:Number(row.new_7d||0),free_tier_count:null,claimed_count:null};
    if(await exists(db,"repair_shops")){
      try{
        const shop=await db.prepare("SELECT COUNT(*) total, SUM(CASE WHEN catalog_opt_in=1 THEN 1 ELSE 0 END) opted_in FROM repair_shops").first();
        out.repair_shops={status:"MEASURED",source:"D1:repair_shops",total:Number(shop.total||0),opted_in:Number(shop.opted_in||0)};
      }catch{out.repair_shops={status:"UNKNOWN",reason:"repair_shop_schema_unverified"};}
    }
    return out;
  }catch{return {status:"UNKNOWN",reason:"profile_query_failed"};}
}
async function grab(fetcher,url,json=false){
  try{
    const res=await fetcher(url,{headers:{Accept:json?"application/vnd.github+json":"text/html,application/xml","User-Agent":"Hermes-HAE-Owner-Audit"},signal:AbortSignal.timeout(7500)});
    if(json){if(!res.ok)throw Error("http_failed");return {status:"MEASURED",body:await res.json(),url};}
    return {status:"MEASURED",code:res.status,body:(await res.text()).slice(0,250000),url};
  }catch{return {status:"UNKNOWN",reason:"source_unavailable",url};}
}
async function publicPage(fetcher){
  const s=await grab(fetcher,SITE+"/businesses/");
  if(s.status!=="MEASURED")return s;
  const m=s.body.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)||s.body.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical/i);
  const canonical=m?m[1]:null;
  const noindex=/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(s.body);
  return {status:"MEASURED",source:s.url,http_status:s.code,canonical,indexable:!noindex&&s.code===200,live_verified:s.code===200&&!noindex&&!!canonical&&canonical.replace(/\/?$/,"/")===SITE+"/businesses/"};
}
async function seo(fetcher){
  const s=await grab(fetcher,SITE+"/sitemap-connect-catalog.xml");
  if(s.status!=="MEASURED"||s.code!==200)return {status:"UNKNOWN",source:s.url,reason:s.reason||"catalog_sitemap_unavailable",semantic_overlap:"NOT_VERIFIED"};
  const urls=[...s.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(x=>x[1].trim());
  const seen=new Set(),dupes=[];
  for(const u of urls){if(seen.has(u))dupes.push(u);else seen.add(u);}
  return {status:"MEASURED",source:s.url,urls_checked:urls.length,duplicate_urls:[...new Set(dupes)].slice(0,10),semantic_overlap:"NOT_VERIFIED"};
}
async function github(fetcher){
  const base="https://api.github.com/search/issues?q=";
  const requests=[
    "repo:officeus-create/Hermes catalog in:title is:issue is:open",
    "repo:officeus-create/Hermes catalog in:title is:pr is:open",
    "repo:officeus-create/Hermes catalog in:title is:pr is:merged"
  ];
  const [issues,openPrs,mergedPrs]=await Promise.all(requests.map(q=>grab(fetcher,base+encodeURIComponent(q)+"&per_page=30&sort=updated",true)));
  const map=(result,state)=>(result.body?.items||[]).slice(0,8).map(v=>({
    title:String(v.title||"").slice(0,160),url:v.html_url,number:v.number,state
  }));
  return {
    status:[issues,openPrs,mergedPrs].every(x=>x.status==="MEASURED")?"MEASURED":"PARTIAL_OR_UNKNOWN",
    source:"https://github.com/officeus-create/Hermes",
    open_issues:issues.status==="MEASURED"?map(issues,"PLANNED_OR_OPEN"):null,
    open_prs:openPrs.status==="MEASURED"?map(openPrs,"OPEN_PR"):null,
    prs:mergedPrs.status==="MEASURED"?map(mergedPrs,"SOURCE_MERGED_NOT_LIVE"):null,
    coverage:"bounded title search (30 per type), not exhaustive; merge does not establish production release"
  };
}
export async function buildCatalogWeeklyOwnerReport(env,when,fetcher=fetch){
  const end=new Date(when).toISOString(),start=new Date(new Date(when).getTime()-7*86400000).toISOString();
  const [businesses,counts,sitemap,work]=await Promise.all([publicPage(fetcher),profiles(env.DB,start,end),seo(fetcher),github(fetcher)]);
  const blockers=[];
  if(!businesses.live_verified)blockers.push("businesses_live_launch_not_verified");
  if(counts.status!=="MEASURED")blockers.push("profile_metrics_unverified");
  if(sitemap.status!=="MEASURED")blockers.push("catalog_sitemap_unverified");
  if(sitemap.duplicate_urls?.length)blockers.push("duplicate_sitemap_urls");
  if(work.status!=="MEASURED")blockers.push("github_task_source_partial");
  blockers.push("catalog_connect_end_to_end_unverified");
  const next=!businesses.live_verified?{task:"Repair and live-verify /businesses/.",done:"Production 200, indexable self-canonical and dated readback."}:
    counts.status!=="MEASURED"?{task:"Restore the canonical D1 profile metrics.",done:"D1 returns real opt-in/new/verified counts with checked_at."}:
    sitemap.duplicate_urls?.length?{task:"Eliminate duplicate Catalog sitemap URLs.",done:"Each public URL appears once in live sitemap, with canonical/SEO owner checked."}:
    {task:"Verify real Catalog → Hermes Connect handoff.",done:"One owner-approved public profile (200,self-canonical) leads to a real Connect inquiry/booking record with matching evidence and no competing city/service canonical."};
  return {type:"catalog_owner_development_weekly_v1",checked_at:new Date().toISOString(),window_start:start,window_end:end,source_sha:String(env.HERMES_AUTOMATION_SOURCE_SHA||"UNKNOWN"),paid_ai_cost_usd:0,llm_calls:0,destination:"private_command_center",
    businesses,profiles:counts,sitemap,work,realized:{public_businesses_live:!!businesses.live_verified,verified_profiles:counts.verified_public??null,source_only:(work.prs||[]).filter(x=>x.state==="SOURCE_MERGED_NOT_LIVE")},planned:work.open_issues===null||work.open_prs===null?null:[...work.open_issues,...work.open_prs],blockers,next_action:next,
    limitations:["Opt-in is not proof of a free tier, claimed status, or verification.","Merged source is not deployed/live proof.","Sitemap duplicate detection cannot rule out semantic SEO competition.","GitHub title search is bounded."]};
}
export async function runCatalogWeeklyOwnerReport(env,when=new Date(),fetcher=fetch){
  const week=fridayKyivSlot(when);
  if(!week||!env?.DB)return {status:"NOT_DUE"};
  await ensureCatalogWeeklyOwnerSchema(env.DB);
  const key="catalog-owner:"+week,now=new Date().toISOString();
  await env.DB.prepare("INSERT OR IGNORE INTO hermes_catalog_owner_weekly_reports (report_key,organization_scope,week_date,state,updated_at) VALUES (?,?,?,'pending',?)").bind(key,ORG,week,now).run();
  const lease=new Date(Date.now()+600000).toISOString();
  const claimed=await env.DB.prepare("UPDATE hermes_catalog_owner_weekly_reports SET state='running',lease_until=?,attempts=attempts+1,updated_at=? WHERE report_key=? AND organization_scope=? AND state!='ready' AND (lease_until IS NULL OR lease_until<=?)").bind(lease,now,key,ORG,now).run();
  if(Number(claimed?.meta?.changes||0)!==1)return {status:"ALREADY_CLAIMED_OR_READY",key};
  try{
    const r=await buildCatalogWeeklyOwnerReport(env,when,fetcher);
    const saved=await env.DB.prepare("UPDATE hermes_catalog_owner_weekly_reports SET state='ready',report_json=?,checked_at=?,source_sha=?,lease_until=NULL,updated_at=? WHERE report_key=? AND organization_scope=? AND lease_until=?").bind(JSON.stringify(r),r.checked_at,r.source_sha,new Date().toISOString(),key,ORG,lease).run();
    return {status:Number(saved?.meta?.changes||0)===1?"READY":"LEASE_LOST",key};
  }catch{
    await env.DB.prepare("UPDATE hermes_catalog_owner_weekly_reports SET state='pending',lease_until=NULL,updated_at=? WHERE report_key=? AND organization_scope=? AND lease_until=?").bind(new Date().toISOString(),key,ORG,lease).run();
    return {status:"RETRYABLE_FAILURE",key};
  }
}
