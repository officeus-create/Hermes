import { SOCIAL_LANES, buildHourlySocialPackage, accountKeyForLane } from "./social-content-factory.mjs";
import { resolveThreadsTransportForLane } from "./social-credential-bridge.mjs";
import { normalizeThreadsText, safeThreadsPermalink } from "../../../shared/social/meta-threads-provider.mjs";
import { pluginRuntimeVersion } from "./plugin-runtime-registry.mjs";

const PLATFORM = "threads";
const COOLDOWN_MS = (3 * 60 + 15) * 60_000;

function clean(value,max=2000){
  return String(value??"").replace(/[<>\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
}
function addSecondsIso(iso,seconds){
  const base=Number.isFinite(Date.parse(String(iso||"")))?Date.parse(String(iso)):Date.now();
  return new Date(base+seconds*1000).toISOString();
}
function runId(accountKey,slotKey){return "run:"+accountKey+":"+PLATFORM+":"+slotKey;}
function idempotencyKey(accountKey,slotKey){return "hae:"+accountKey+":"+PLATFORM+":"+slotKey;}

export function socialAcquisitionV2Enabled(env){
  return String(env?.HERMES_SOCIAL_ACQUISITION_V2||"").trim().toLowerCase()==="enabled";
}
export function socialAcquisitionWritesEnabled(env){
  return socialAcquisitionV2Enabled(env)
    && String(env?.HERMES_AUTOMATION_MODE||"dry_run")==="live"
    && String(env?.HERMES_AUTOMATION_PUBLISH||"disabled")==="enabled";
}

export async function verifySocialSourcePage(candidate,{fetchImpl=fetch}={}){
  let url;
  try{url=new URL(String(candidate?.destination_url||""));}
  catch{return {ok:false,error_class:"social_source_url_invalid"};}
  if(url.protocol!=="https:"||url.hostname!=="hermeslogisticsus.com"){
    return {ok:false,error_class:"social_source_not_canonical"};
  }
  if(!String(candidate?.body||"").includes(url.toString())){
    return {ok:false,error_class:"social_source_link_mismatch"};
  }
  let response;
  try{
    response=await fetchImpl(url.toString(),{
      method:"GET",
      redirect:"manual",
      headers:{
        Accept:"text/html,application/xhtml+xml",
        "User-Agent":"HermesAutomationEngine/1.0 social-source-readonly",
      },
    });
  }catch{
    return {ok:false,error_class:"social_source_readback_unavailable"};
  }
  if(!response?.ok){
    return {ok:false,error_class:"social_source_http_status",status:Number(response?.status||0)||null};
  }
  const contentType=String(response.headers?.get?.("content-type")||"").toLowerCase();
  if(!contentType.includes("text/html")){
    return {ok:false,error_class:"social_source_not_html"};
  }
  let html="";
  try{html=await response.text();}catch{return {ok:false,error_class:"social_source_readback_unavailable"};}
  if(html.length<200||!/(?:<!doctype\s+html|<html\b)/i.test(html)){
    return {ok:false,error_class:"social_source_invalid_html"};
  }
  return {ok:true,source_url:url.toString(),status:response.status};
}

export async function persistHourlySocialPackages(db,slotKey){
  const now=new Date().toISOString();
  const results=[];
  for(const lane of SOCIAL_LANES){
    const pack=buildHourlySocialPackage(lane,slotKey);
    const accountKey=accountKeyForLane(lane);
    for(const [platform,variant] of Object.entries(pack.variants)){
      const contentId=accountKey+":"+platform+":"+slotKey;
      const templateId=pack.canonical.topic;
      const variantKey=pack.canonical.topic+":"+platform;
      const state=platform==="threads"?"ready":platform==="instagram"?"draft_requires_media":platform==="x"?"hold_paid_provider":"draft_ready";
      const sql="INSERT OR IGNORE INTO hermes_automation_content (content_id,account_key,platform,slot_key,template_id,variant_key,destination_url,body,state,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
      const inserted=await db.prepare(sql).bind(contentId,accountKey,platform,slotKey,templateId,variantKey,variant.destination_url,variant.body,state,now,now).run();
      results.push({lane,account_key:accountKey,platform,content_id:contentId,state,inserted:Number(inserted?.meta?.changes||0)===1});
    }
    const coordinatorVersion=pluginRuntimeVersion("hermes-agent-coordinator");
    const marketingVersion=pluginRuntimeVersion("hermes-marketing-growth");
    if(!coordinatorVersion||!marketingVersion)throw new Error("social_plugin_policy_version_missing");
    const receipt="plugin_policy:hermes-agent-coordinator@"+coordinatorVersion+"|hermes-marketing-growth@"+marketingVersion;
    await db.prepare("INSERT OR IGNORE INTO hermes_automation_runtime_events (event_id,event_type,message_type,content_id,slot_key,created_at) VALUES (?, 'social.plugin_policy_bound', ?, ?, ?, ?)")
      .bind("social-plugin-policy:"+accountKey+":"+slotKey,receipt,accountKey+":threads:"+slotKey,slotKey,now).run();
  }
  return results;
}

async function reserveThreadRun(db,lane,slotKey){
  const accountKey=accountKeyForLane(lane);
  if(!accountKey)throw new Error("social_business_lane_invalid");
  const now=new Date().toISOString();
  const sql="INSERT OR IGNORE INTO hermes_automation_runs (id,trigger_type,account_key,platform,slot_key,status,created_at,updated_at) VALUES (?,?,?,?,?,'queued',?,?)";
  const result=await db.prepare(sql).bind(runId(accountKey,slotKey),"cron_v2",accountKey,PLATFORM,slotKey,now,now).run();
  return Number(result?.meta?.changes||0)===1;
}

export async function enqueueHourlySocialPlans(env,slotKey){
  if(!env?.DB||!env?.AUTOMATION_QUEUE)throw new Error("runtime_not_configured");
  const drafts=await persistHourlySocialPackages(env.DB,slotKey);
  let queued=0;
  for(const lane of SOCIAL_LANES){
    const accountKey=accountKeyForLane(lane);
    const inserted=await reserveThreadRun(env.DB,lane,slotKey);
    if(!inserted)continue;
    try{
      await env.AUTOMATION_QUEUE.send({type:"social.threads.plan",business_lane:lane,account_key:accountKey,platform:PLATFORM,slot_key:slotKey});
      await env.DB.prepare("UPDATE hermes_automation_runs SET status='plan_enqueued',updated_at=? WHERE id=?").bind(new Date().toISOString(),runId(accountKey,slotKey)).run();
      queued+=1;
    }catch{
      await env.DB.prepare("UPDATE hermes_automation_runs SET status='plan_enqueue_failed',last_error_class='plan_enqueue_failed',updated_at=? WHERE id=?").bind(new Date().toISOString(),runId(accountKey,slotKey)).run();
    }
  }
  return {queued,drafts};
}

async function candidateForLane(db,lane,slotKey){
  const accountKey=accountKeyForLane(lane);
  const sql="SELECT content_id,account_key,platform,slot_key,template_id,variant_key,destination_url,body,state FROM hermes_automation_content WHERE account_key=? AND platform='threads' AND slot_key=? LIMIT 1";
  const row=await db.prepare(sql).bind(accountKey,slotKey).first();
  if(!row)return null;
  return {
    content_id:String(row.content_id),account_key:String(row.account_key),platform:String(row.platform),
    slot_key:String(row.slot_key),template_id:String(row.template_id),variant_key:String(row.variant_key),
    destination_url:String(row.destination_url),body:String(row.body),
    idempotency_key:idempotencyKey(accountKey,slotKey),
  };
}

async function preflightLaneThreads(env,lane,candidate,nowMs=Date.now()){
  const resolved=await resolveThreadsTransportForLane(env,lane,{nowMs});
  if(!resolved.ok)return resolved;
  const identity=await resolved.transport.verifyIdentity();
  if(!identity.ok)return identity;
  const history=await resolved.transport.listRecentAuthored({limit:50,maxPages:5});
  if(!history.ok)return history;
  if(history.complete!==true)return {ok:false,error_class:"meta_threads_history_incomplete"};
  const normalized=normalizeThreadsText(candidate.body);
  if(history.rows.some(row=>normalizeThreadsText(row.text||"")===normalized))return {ok:false,error_class:"meta_threads_duplicate_existing_post"};
  for(const row of history.rows){
    const timestamp=Date.parse(String(row.timestamp||""));
    if(!Number.isFinite(timestamp))return {ok:false,error_class:"meta_threads_invalid_feed"};
    const age=nowMs-timestamp;
    if(age<0)return {ok:false,error_class:"meta_threads_future_provider_timestamp"};
    if(age<COOLDOWN_MS)return {ok:false,error_class:"meta_threads_recent_authored_cooldown"};
  }
  return {ok:true,resolved,history_count:history.rows.length,history_complete:true};
}

async function claimPublication(db,candidate,lane){
  const now=new Date().toISOString();
  const insertSql="INSERT OR IGNORE INTO hermes_automation_publications (idempotency_key,content_id,account_key,platform,status,attempt_count,created_at,updated_at) VALUES (?,?,?,?, 'reserved',0,?,?)";
  await db.prepare(insertSql).bind(candidate.idempotency_key,candidate.content_id,candidate.account_key,candidate.platform,now,now).run();
  const claimSql="UPDATE hermes_automation_publications SET status='publishing',attempt_count=attempt_count+1,updated_at=? WHERE idempotency_key=? AND account_key=? AND platform='threads' AND status='reserved'";
  const claimed=await db.prepare(claimSql).bind(now,candidate.idempotency_key,candidate.account_key).run();
  if(Number(claimed?.meta?.changes||0)!==1)return false;
  const provenanceSql="INSERT INTO hermes_automation_runtime_events (event_id,event_type,message_type,content_id,slot_key,created_at) VALUES (?, 'publication.provider_claimed', ?, ?, ?, ?)";
  const provenance=await db.prepare(provenanceSql).bind("social-provider-claim:"+candidate.idempotency_key,"meta_threads_graph_direct:"+lane,candidate.content_id,candidate.slot_key,now).run();
  if(Number(provenance?.meta?.changes||0)!==1)throw new Error("provider_provenance_persist_failed");
  return true;
}

async function markPlanTerminal(db,candidate,status,errorClass=null){
  const now=new Date().toISOString();
  await db.batch([
    db.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?").bind(status,errorClass,now,candidate.content_id),
    db.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?").bind(status,errorClass,now,runId(candidate.account_key,candidate.slot_key)),
  ]);
}

export async function processSocialThreadsPlan(env,message,{nowMs=Date.now()}={}){
  if(!env?.DB||!env?.AUTOMATION_QUEUE)throw new Error("runtime_not_configured");
  const lane=clean(message?.business_lane,64).toUpperCase();
  if(!SOCIAL_LANES.includes(lane))throw new Error("social_business_lane_invalid");
  const accountKey=accountKeyForLane(lane);
  if(clean(message?.account_key,80)!==accountKey)throw new Error("social_account_lane_mismatch");
  const slotKey=clean(message?.slot_key,32);
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(slotKey))throw new Error("slot_key_invalid");
  const candidate=await candidateForLane(env.DB,lane,slotKey);
  if(!candidate)throw new Error("social_candidate_missing");

  if(!socialAcquisitionWritesEnabled(env)){
    await markPlanTerminal(env.DB,candidate,"social_dry_run_ready");
    return {status:"social_dry_run_ready",lane,candidate};
  }

  const unresolvedSql="SELECT COUNT(*) AS n FROM hermes_automation_publications WHERE account_key=? AND platform='threads' AND status IN ('publishing','provider_accepted_readback_pending','unknown_outcome_readback_pending','unknown_outcome_unresolved','readback_unverified')";
  const unresolved=await env.DB.prepare(unresolvedSql).bind(accountKey).first();
  if(!Number.isSafeInteger(unresolved?.n)||unresolved.n!==0){
    await markPlanTerminal(env.DB,candidate,"preflight_blocked","unresolved_previous_publication");
    return {status:"preflight_blocked",error_class:"unresolved_previous_publication"};
  }

  const sourceReadback=await verifySocialSourcePage(candidate);
  if(!sourceReadback.ok){
    await markPlanTerminal(env.DB,candidate,"preflight_blocked",sourceReadback.error_class||"social_source_readback_failed");
    return {status:"preflight_blocked",error_class:sourceReadback.error_class||"social_source_readback_failed"};
  }

  const preflight=await preflightLaneThreads(env,lane,candidate,nowMs);
  if(!preflight.ok){
    await markPlanTerminal(env.DB,candidate,"preflight_blocked",preflight.error_class||"social_preflight_failed");
    return {status:"preflight_blocked",error_class:preflight.error_class||"social_preflight_failed"};
  }

  const claimed=await claimPublication(env.DB,candidate,lane);
  if(!claimed)return {status:"duplicate_suppressed",lane,candidate};

  const published=await preflight.resolved.transport.publishText(candidate.body);
  const now=new Date().toISOString();
  if(!published.ok){
    const unknown=published.error_class==="provider_outcome_unknown";
    const status=unknown?"unknown_outcome_readback_pending":"failed";
    await env.DB.batch([
      env.DB.prepare("UPDATE hermes_automation_publications SET status=?,last_error_class=?,next_readback_at=?,updated_at=? WHERE content_id=?").bind(status,published.error_class,unknown?addSecondsIso(now,120):null,now,candidate.content_id),
      env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class=?,updated_at=? WHERE content_id=?").bind(status,published.error_class,now,candidate.content_id),
      env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class=?,updated_at=? WHERE id=?").bind(status,published.error_class,now,runId(candidate.account_key,candidate.slot_key)),
    ]);
    if(unknown){
      try{
        await env.AUTOMATION_QUEUE.send({type:"social.threads.readback",business_lane:lane,content_id:candidate.content_id},{delaySeconds:120});
      }catch{
        await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,last_error_class='social_readback_enqueue_failed',updated_at=? WHERE content_id=?").bind(addSecondsIso(now,300),now,candidate.content_id).run();
      }
    }
    return {status,error_class:published.error_class};
  }

  const providerPostId=clean(published.provider_object_id,240);
  const pendingAt=addSecondsIso(now,60);
  await env.DB.batch([
    env.DB.prepare("UPDATE hermes_automation_publications SET status='provider_accepted_readback_pending',provider_post_id=?,readback_attempt=0,next_readback_at=?,updated_at=? WHERE content_id=?").bind(providerPostId,pendingAt,now,candidate.content_id),
    env.DB.prepare("UPDATE hermes_automation_content SET state='provider_accepted_readback_pending',provider_post_id=?,updated_at=? WHERE content_id=?").bind(providerPostId,now,candidate.content_id),
    env.DB.prepare("UPDATE hermes_automation_runs SET status='provider_accepted_readback_pending',updated_at=? WHERE id=?").bind(now,runId(candidate.account_key,candidate.slot_key)),
  ]);
  try{
    await env.AUTOMATION_QUEUE.send({type:"social.threads.readback",business_lane:lane,content_id:candidate.content_id},{delaySeconds:60});
  }catch{
    await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,last_error_class='social_readback_enqueue_failed',updated_at=? WHERE content_id=?").bind(addSecondsIso(now,300),now,candidate.content_id).run();
  }
  return {status:"provider_accepted_readback_pending",provider_post_id:providerPostId};
}

export async function processSocialThreadsReadback(env,message,{nowMs=Date.now()}={}){
  if(!env?.DB)throw new Error("database_not_configured");
  const lane=clean(message?.business_lane,64).toUpperCase();
  if(!SOCIAL_LANES.includes(lane))throw new Error("social_business_lane_invalid");
  const contentId=clean(message?.content_id,240);
  if(!contentId)throw new Error("content_id_invalid");
  const publication=await env.DB.prepare("SELECT status,provider_post_id,readback_attempt FROM hermes_automation_publications WHERE content_id=? LIMIT 1").bind(contentId).first();
  const content=await env.DB.prepare("SELECT content_id,account_key,platform,slot_key,body FROM hermes_automation_content WHERE content_id=? LIMIT 1").bind(contentId).first();
  if(!publication||!content)return {status:"readback_missing_record"};
  if(String(publication.status)==="published_verified")return {status:"published_verified",duplicate:true};

  const resolved=await resolveThreadsTransportForLane(env,lane,{nowMs});
  if(!resolved.ok)return {status:"readback_unverified",error_class:resolved.error_class};
  let media=null;
  const providerPostId=clean(publication.provider_post_id,240);
  if(providerPostId){
    const direct=await resolved.transport.readMedia(providerPostId);
    if(direct.ok)media=direct.media;
  }else{
    const history=await resolved.transport.listRecentAuthored({limit:50,maxPages:5});
    if(history.ok&&history.complete===true){
      const normalized=normalizeThreadsText(content.body);
      media=history.rows.find(row=>normalizeThreadsText(row.text||"")===normalized)||null;
    }
  }

  const now=new Date().toISOString();
  const attempt=Math.max(1,Math.min(4,Number(publication.readback_attempt||0)+1));
  const expectedText=normalizeThreadsText(content.body);
  const observedText=normalizeThreadsText(media?.text||"");
  const permalink=safeThreadsPermalink(media?.permalink);
  const observedUsername=clean(media?.username,160).replace(/^@/,"").toLowerCase();
  const exact=Boolean(media?.id&&permalink&&observedText===expectedText&&observedUsername===resolved.username);

  if(exact){
    await env.DB.batch([
      env.DB.prepare("UPDATE hermes_automation_publications SET status='published_verified',provider_post_id=?,permalink=?,readback_attempt=?,next_readback_at=NULL,last_error_class=NULL,updated_at=? WHERE content_id=?").bind(String(media.id),permalink,attempt,now,contentId),
      env.DB.prepare("UPDATE hermes_automation_content SET state='published_verified',provider_post_id=?,permalink=?,last_error_class=NULL,updated_at=? WHERE content_id=?").bind(String(media.id),permalink,now,contentId),
      env.DB.prepare("UPDATE hermes_automation_runs SET status='published_verified',last_error_class=NULL,updated_at=? WHERE id=?").bind(now,runId(String(content.account_key),String(content.slot_key))),
    ]);
    return {status:"published_verified",provider_post_id:String(media.id),permalink};
  }

  if(attempt<4){
    const retryAt=addSecondsIso(now,attempt*120);
    await env.DB.prepare("UPDATE hermes_automation_publications SET readback_attempt=?,next_readback_at=?,last_error_class='provider_readback_not_verified',updated_at=? WHERE content_id=?").bind(attempt,retryAt,now,contentId).run();
    return {status:"provider_accepted_readback_pending",retry_at:retryAt};
  }
  const terminal=String(publication.status)==="unknown_outcome_readback_pending"?"unknown_outcome_unresolved":"readback_unverified";
  await env.DB.batch([
    env.DB.prepare("UPDATE hermes_automation_publications SET status=?,readback_attempt=?,next_readback_at=NULL,last_error_class='provider_readback_not_verified',updated_at=? WHERE content_id=?").bind(terminal,attempt,now,contentId),
    env.DB.prepare("UPDATE hermes_automation_content SET state=?,last_error_class='provider_readback_not_verified',updated_at=? WHERE content_id=?").bind(terminal,now,contentId),
    env.DB.prepare("UPDATE hermes_automation_runs SET status=?,last_error_class='provider_readback_not_verified',updated_at=? WHERE id=?").bind(terminal,now,runId(String(content.account_key),String(content.slot_key))),
  ]);
  return {status:terminal,error_class:"provider_readback_not_verified"};
}

export async function enqueueDueSocialReadbacks(env,limit=20){
  if(!env?.DB||!env?.AUTOMATION_QUEUE)return 0;
  const now=new Date().toISOString();
  const sql="SELECT p.content_id,c.account_key FROM hermes_automation_publications p JOIN hermes_automation_content c ON c.content_id=p.content_id WHERE c.platform='threads' AND c.account_key IN ('hermes_logistics','progressopro') AND p.status IN ('provider_accepted_readback_pending','unknown_outcome_readback_pending') AND p.next_readback_at IS NOT NULL AND p.next_readback_at<=? ORDER BY p.next_readback_at ASC LIMIT ?";
  const rows=await env.DB.prepare(sql).bind(now,Math.max(1,Math.min(50,Number(limit)||20))).all();
  let queued=0;
  for(const row of rows?.results||[]){
    const lane=String(row.account_key)==="progressopro"?"PROGRESSOPRO":"HERMES_LOGISTICS";
    const leaseUntil=addSecondsIso(now,900);
    const leased=await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,updated_at=? WHERE content_id=? AND next_readback_at<=?").bind(leaseUntil,now,row.content_id,now).run();
    if(Number(leased?.meta?.changes||0)!==1)continue;
    try{
      await env.AUTOMATION_QUEUE.send({type:"social.threads.readback",business_lane:lane,content_id:String(row.content_id)});
      queued+=1;
    }catch{
      await env.DB.prepare("UPDATE hermes_automation_publications SET next_readback_at=?,last_error_class='social_readback_enqueue_failed',updated_at=? WHERE content_id=?").bind(addSecondsIso(now,300),now,row.content_id).run();
    }
  }
  return queued;
}
