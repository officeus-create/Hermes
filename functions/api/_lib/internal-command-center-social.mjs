import { socialAccountReadinessSnapshot } from "../../../workers/automation-engine/src/social-account-readiness.mjs";
import { socialAcquisitionOwnerControl } from "../../../workers/automation-engine/src/social-hourly-runtime.mjs";

const LANE_ACCOUNT=Object.freeze({
  HERMES_LOGISTICS:"hermes_logistics",
  PROGRESSOPRO:"progressopro",
});
const PLATFORMS=Object.freeze(["threads","instagram","facebook","x"]);
const UNRESOLVED_PUBLICATION_STATES=Object.freeze([
  "publishing",
  "provider_accepted_readback_pending",
  "unknown_outcome_readback_pending",
  "unknown_outcome_unresolved",
  "readback_unverified",
]);
const BLOCKED_RUN_STATES=Object.freeze([
  "preflight_blocked",
  "failed",
  "plan_enqueue_failed",
  "readback_unverified",
  "unknown_outcome_unresolved",
]);

const clean=(value,max=800)=>String(value??"").replace(/[<>\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max);
const countOrNull=(value)=>{
  const number=Number(value);
  return Number.isSafeInteger(number)&&number>=0?number:null;
};
async function tableExists(db,name){
  if(!db)return false;
  try{
    const row=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1").bind(name).first();
    return String(row?.name||"")===name;
  }catch{return false;}
}
function publicContent(row){
  if(!row)return null;
  return {
    content_id:clean(row.content_id,240),
    account_key:clean(row.account_key,80),
    platform:clean(row.platform,40),
    slot_key:clean(row.slot_key,40),
    topic:clean(row.template_id,120),
    destination_url:clean(row.destination_url,1200),
    body:clean(row.body,1800),
    state:clean(row.state,120)||"UNKNOWN",
    provider_post_id:clean(row.provider_post_id,240)||null,
    permalink:clean(row.permalink,1200)||null,
    last_error_class:clean(row.last_error_class,200)||null,
    updated_at:clean(row.updated_at,100)||null,
  };
}
function publicPublication(row){
  if(!row)return null;
  return {
    content_id:clean(row.content_id,240),
    account_key:clean(row.account_key,80),
    platform:clean(row.platform,40),
    status:clean(row.status,120)||"UNKNOWN",
    attempt_count:countOrNull(row.attempt_count),
    readback_attempt:countOrNull(row.readback_attempt),
    provider_post_id:clean(row.provider_post_id,240)||null,
    permalink:clean(row.permalink,1200)||null,
    last_error_class:clean(row.last_error_class,200)||null,
    updated_at:clean(row.updated_at,100)||null,
  };
}
async function laneSnapshot(db,lane,tables){
  const accountKey=LANE_ACCOUNT[lane];
  const platformStates=Object.fromEntries(PLATFORMS.map(platform=>[platform,{state:"UNKNOWN",latest_at:null,count:null}]));
  let recentContent=[];
  let latestRun=null;
  let unresolvedPublications=null;
  let latestVerifiedPublication=null;
  let policyReceipt=null;

  if(tables.content){
    const rows=await db.prepare(`SELECT platform,state,COUNT(*) AS count,MAX(updated_at) AS latest_at
      FROM hermes_automation_content WHERE account_key=? GROUP BY platform,state ORDER BY latest_at DESC`).bind(accountKey).all();
    const grouped=new Map();
    for(const row of rows?.results||[]){
      const platform=clean(row.platform,40);
      if(!PLATFORMS.includes(platform))continue;
      const current=grouped.get(platform);
      if(!current||String(row.latest_at||"")>String(current.latest_at||""))grouped.set(platform,row);
    }
    for(const [platform,row] of grouped){
      platformStates[platform]={
        state:clean(row.state,120)||"UNKNOWN",
        latest_at:clean(row.latest_at,100)||null,
        count:countOrNull(row.count),
      };
    }
    const recent=await db.prepare(`SELECT content_id,account_key,platform,slot_key,template_id,destination_url,body,state,
      provider_post_id,permalink,last_error_class,updated_at
      FROM hermes_automation_content WHERE account_key=? ORDER BY updated_at DESC LIMIT 12`).bind(accountKey).all();
    recentContent=(recent?.results||[]).map(publicContent);
  }

  if(tables.runs){
    const row=await db.prepare(`SELECT platform,slot_key,status,last_error_class,updated_at
      FROM hermes_automation_runs WHERE account_key=? ORDER BY updated_at DESC LIMIT 1`).bind(accountKey).first();
    latestRun=row?{
      platform:clean(row.platform,40),
      slot_key:clean(row.slot_key,40),
      status:clean(row.status,120)||"UNKNOWN",
      last_error_class:clean(row.last_error_class,200)||null,
      updated_at:clean(row.updated_at,100)||null,
    }:null;
  }

  if(tables.publications){
    const placeholders=UNRESOLVED_PUBLICATION_STATES.map(()=>"?").join(",");
    const unresolved=await db.prepare(`SELECT COUNT(*) AS count FROM hermes_automation_publications
      WHERE account_key=? AND status IN (${placeholders})`).bind(accountKey,...UNRESOLVED_PUBLICATION_STATES).first();
    unresolvedPublications=countOrNull(unresolved?.count);
    const verified=await db.prepare(`SELECT content_id,account_key,platform,status,attempt_count,readback_attempt,
      provider_post_id,permalink,last_error_class,updated_at
      FROM hermes_automation_publications
      WHERE account_key=? AND status='published_verified'
      ORDER BY updated_at DESC LIMIT 1`).bind(accountKey).first();
    latestVerifiedPublication=publicPublication(verified);
  }

  if(tables.runtimeEvents){
    const row=await db.prepare(`SELECT event_id,message_type,content_id,slot_key,created_at
      FROM hermes_automation_runtime_events
      WHERE event_type='social.plugin_policy_bound' AND content_id LIKE ?
      ORDER BY created_at DESC LIMIT 1`).bind(accountKey+":threads:%").first();
    policyReceipt=row?{
      event_id:clean(row.event_id,240),
      policy:clean(row.message_type,1000),
      content_id:clean(row.content_id,240),
      slot_key:clean(row.slot_key,40),
      created_at:clean(row.created_at,100),
    }:null;
  }

  return {
    lane,
    account_key:accountKey,
    platform_states:platformStates,
    latest_run:latestRun,
    unresolved_publications:unresolvedPublications,
    latest_verified_publication:latestVerifiedPublication,
    plugin_policy_receipt:policyReceipt,
    recent_content:recentContent,
  };
}

function publicReadiness(raw){
  if(!raw||raw.success!==true){
    return{success:false,error_class:clean(raw?.error_class,160)||"social_readiness_access_gap",blockers:[],tokens_returned:false,external_write_performed:false};
  }
  const logistics=raw.hermes_logistics||{};
  const progresso=raw.progressopro||{};
  return{
    success:true,
    observed_at:clean(raw.observed_at,100)||null,
    write_convergence_ready:Boolean(raw.write_convergence_ready),
    hae_write_bridge_ready:Boolean(raw.hae_write_bridge_ready),
    manual_social_studio_provider_converged:Boolean(raw.manual_social_studio_provider_converged),
    hermes_logistics:{
      business_lane:"HERMES_LOGISTICS",
      platform:"threads",
      expected_account_id:clean(logistics.expected_account_id,160)||null,
      expected_username:clean(logistics.expected_username,160)||null,
      account_identity_configured:Boolean(logistics.account_identity_configured),
      provider_selected:Boolean(logistics.provider_selected),
      provider_transport:clean(logistics.provider_transport,120)||"UNKNOWN",
      credential_ready:Boolean(logistics.credential_bridge_resolves&&logistics.ready_for_provider_preflight),
      ready_for_provider_preflight:Boolean(logistics.ready_for_provider_preflight),
      scope_evidence_known:Boolean(logistics.scope_evidence_known),
      inbound_scopes:{
        replies:Boolean(logistics.inbound_scopes?.replies),
        mentions:Boolean(logistics.inbound_scopes?.mentions),
        search:Boolean(logistics.inbound_scopes?.search),
      },
      error_class:clean(logistics.credential_bridge_error,200)||null,
    },
    progressopro:{
      business_lane:"PROGRESSOPRO",
      platform:"threads",
      expected_username:clean(progresso.expected_username,160)||"progressopro",
      observed_account_id:clean(progresso.observed_account_id,160)||null,
      observed_username:clean(progresso.observed_username,160)||null,
      connection_present:Boolean(progresso.connection_present),
      identity_verified:Boolean(progresso.identity_verified),
      required_write_scopes_present:Boolean(progresso.required_write_scopes_present),
      reply_scopes_present:Boolean(progresso.reply_scopes_present),
      provider_transport:clean(progresso.provider_transport,120)||"UNKNOWN",
      credential_ready:Boolean(progresso.credential_bridge_resolves&&progresso.ready_for_hae_write_bridge),
      ready_for_hae_write_bridge:Boolean(progresso.ready_for_hae_write_bridge),
      scope_evidence_known:Boolean(progresso.scope_evidence_known),
      inbound_scopes:{
        replies:Boolean(progresso.inbound_scopes?.replies),
        mentions:Boolean(progresso.inbound_scopes?.mentions),
        search:Boolean(progresso.inbound_scopes?.search),
      },
      error_class:clean(progresso.credential_bridge_error,200)||null,
    },
    platform_gates:{
      threads:clean(raw.platform_gates?.threads,160)||"UNKNOWN",
      instagram:clean(raw.platform_gates?.instagram,160)||"UNKNOWN",
      facebook:clean(raw.platform_gates?.facebook,160)||"UNKNOWN",
      x:clean(raw.platform_gates?.x,160)||"UNKNOWN",
    },
    blockers:Array.isArray(raw.blockers)?raw.blockers.map(x=>clean(x,200)).filter(Boolean):[],
    tokens_returned:false,
    external_write_performed:false,
  };
}

async function operationalWindowSnapshot(db,tables,nowMs,hours){
  const since=new Date(nowMs-hours*60*60*1000).toISOString();
  let content_rows=null;
  let threads_runs=null;
  let verified_publications=null;
  let unresolved_publications=null;
  let blocked_or_failed_runs=null;

  if(tables.content){
    const row=await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_content WHERE account_key IN ('hermes_logistics','progressopro') AND updated_at>=?").bind(since).first();
    content_rows=countOrNull(row?.count);
  }
  if(tables.runs){
    const row=await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_runs WHERE account_key IN ('hermes_logistics','progressopro') AND updated_at>=?").bind(since).first();
    threads_runs=countOrNull(row?.count);
    const placeholders=BLOCKED_RUN_STATES.map(()=>"?").join(",");
    const blocked=await db.prepare(`SELECT COUNT(*) AS count FROM hermes_automation_runs
      WHERE account_key IN ('hermes_logistics','progressopro') AND updated_at>=? AND status IN (${placeholders})`)
      .bind(since,...BLOCKED_RUN_STATES).first();
    blocked_or_failed_runs=countOrNull(blocked?.count);
  }
  if(tables.publications){
    const verified=await db.prepare("SELECT COUNT(*) AS count FROM hermes_automation_publications WHERE account_key IN ('hermes_logistics','progressopro') AND updated_at>=? AND status='published_verified'").bind(since).first();
    verified_publications=countOrNull(verified?.count);
    const placeholders=UNRESOLVED_PUBLICATION_STATES.map(()=>"?").join(",");
    const unresolved=await db.prepare(`SELECT COUNT(*) AS count FROM hermes_automation_publications
      WHERE account_key IN ('hermes_logistics','progressopro') AND updated_at>=? AND status IN (${placeholders})`)
      .bind(since,...UNRESOLVED_PUBLICATION_STATES).first();
    unresolved_publications=countOrNull(unresolved?.count);
  }

  return {hours,since,content_rows,threads_runs,verified_publications,unresolved_publications,blocked_or_failed_runs};
}

export async function buildCommandCenterSocialSnapshot(env,{nowMs=Date.now()}={}){
  const db=env?.DB;
  const tableNames={
    content:"hermes_automation_content",
    runs:"hermes_automation_runs",
    publications:"hermes_automation_publications",
    runtimeEvents:"hermes_automation_runtime_events",
    heartbeats:"hermes_automation_heartbeats",
  };
  const tables={};
  for(const [key,name] of Object.entries(tableNames))tables[key]=await tableExists(db,name);

  let readiness;
  try{
    readiness=publicReadiness(await socialAccountReadinessSnapshot(env,{nowMs}));
  }catch{
    readiness=publicReadiness({success:false,error_class:"social_readiness_access_gap"});
  }

  const lanes=[];
  for(const lane of Object.keys(LANE_ACCOUNT))lanes.push(await laneSnapshot(db,lane,tables));

  let ownerControl;
  try{ownerControl=await socialAcquisitionOwnerControl(db)}
  catch{ownerControl={configured:false,process_id:null,status:"UNKNOWN",allowed:false,updated_at:null,last_error_class:"social_owner_control_unavailable"}}

  let latestHeartbeat=null;
  if(tables.heartbeats){
    const row=await db.prepare(`SELECT trigger_type,cron_expression,scheduled_at,observed_at,execution_lag_ms,chicago_slot_key,
      eligible,source_sha,automation_mode,publication_config,publication_enabled
      FROM hermes_automation_heartbeats ORDER BY scheduled_at DESC LIMIT 1`).first();
    latestHeartbeat=row?{
      trigger_type:clean(row.trigger_type,80)||null,
      cron_expression:clean(row.cron_expression,120)||null,
      scheduled_at:clean(row.scheduled_at,100)||null,
      observed_at:clean(row.observed_at,100)||null,
      execution_lag_ms:countOrNull(row.execution_lag_ms),
      chicago_slot_key:clean(row.chicago_slot_key,40)||null,
      eligible:Number(row.eligible)===1,
      source_sha:clean(row.source_sha,80)||null,
      automation_mode:clean(row.automation_mode,40)||null,
      publication_config:clean(row.publication_config,40)||null,
      publication_enabled:Number(row.publication_enabled)===1,
    }:null;
  }

  let recentPublications=[];
  if(tables.publications){
    const rows=await db.prepare(`SELECT content_id,account_key,platform,status,attempt_count,readback_attempt,
      provider_post_id,permalink,last_error_class,updated_at
      FROM hermes_automation_publications
      WHERE account_key IN ('hermes_logistics','progressopro')
      ORDER BY updated_at DESC LIMIT 20`).all();
    recentPublications=(rows?.results||[]).map(publicPublication);
  }

  const analyticsWindows={};
  for(const [key,hours] of [["24h",24],["72h",72],["7d",168]]){
    analyticsWindows[key]=await operationalWindowSnapshot(db,tables,nowMs,hours);
  }

  const socialV2=String(env?.HERMES_SOCIAL_ACQUISITION_V2||"").trim().toLowerCase()==="enabled";
  const automationMode=clean(env?.HERMES_AUTOMATION_MODE,40)||"UNKNOWN";
  const publicationConfig=clean(env?.HERMES_AUTOMATION_PUBLISH,40)||"UNKNOWN";
  const externalWriteEnabled=Boolean(
    socialV2&&automationMode==="live"&&publicationConfig==="enabled"&&ownerControl?.external_write_allowed===true
  );

  return {
    success:true,
    observed_at:new Date(nowMs).toISOString(),
    runtime:{
      social_v2:socialV2?"enabled":"disabled",
      automation_mode:automationMode,
      publication_config:publicationConfig,
      external_write_enabled:externalWriteEnabled,
      scheduler_owner:"HAE",
      queue_owner:"HAE",
      datastore_owner:"existing Hermes Connect D1",
      owner_control:ownerControl,
    },
    schedule:{
      timezone:"America/Chicago",
      eligible_hours:[0,1,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
      quiet_hours:[2,3,4,5],
      rule:"hourly_evaluation_not_forced_publication",
    },
    readiness,
    channel_roadmap:[
      {channel:"threads",owner:"hermes-marketing-growth",runtime:"HAE",state:readiness?.platform_gates?.threads||"UNKNOWN",next_gate:"exact_runtime_canary_provider_readback"},
      {channel:"instagram",owner:"hermes-marketing-growth + hermes-design-hub",runtime:"HAE",state:readiness?.platform_gates?.instagram||"UNKNOWN",next_gate:"shared_media_transport_exact_account_rights_cleared_creative"},
      {channel:"facebook",owner:"hermes-marketing-growth",runtime:"HAE",state:readiness?.platform_gates?.facebook||"UNKNOWN",next_gate:"page_oauth_shared_transport_provider_readback"},
      {channel:"x",owner:"hermes-marketing-growth",runtime:"HAE",state:readiness?.platform_gates?.x||"UNKNOWN",next_gate:"write_entitlement_and_economics_approval"},
      {channel:"linkedin",owner:"hermes-marketing-growth",runtime:"HAE",state:"ACCOUNT_SELECTION_REQUIRED",next_gate:"exact_company_account_and_authorized_write_adapter"},
      {channel:"tiktok",owner:"hermes-marketing-growth",runtime:"HAE",state:"PROVIDER_PATH_UNVERIFIED",next_gate:"verified_official_write_path_and_account_scope"},
      {channel:"telegram",owner:"hermes-telegram-growth-manager",runtime:"HAE_WHEN_AUTHORIZED",state:"SEPARATE_DOMAIN_OWNER",next_gate:"authorized_telegram_transport_and_attribution_contract"},
    ],
    lanes,
    health:{
      last_heartbeat:latestHeartbeat,
      queue_depth:"UNKNOWN",
      dlq_depth:"UNKNOWN",
      provider_health:readiness?.write_convergence_ready===true?"PREFLIGHT_READY":"HOLD_OR_UNKNOWN",
      last_inbound_event:"NOT_LIVE",
    },
    recent_publications:recentPublications,
    analytics:{
      windows:analyticsWindows,
      provider_engagement:"NOT_CONNECTED_TO_SOCIAL_V2_READ_MODEL",
      qualified_outcomes:"NOT_JOINED_IN_THIS_READ_MODEL",
      rule:"UNKNOWN_is_not_zero",
    },
    experiments:{
      winner_share_target:0.70,
      exploration_share_target:0.30,
      selection_state:"HOLD_UNTIL_SAME_ACCOUNT_PROVIDER_METRICS_AND_QUALIFIED_OUTCOME",
      evaluation_windows:["24h","72h","7d"],
      rule:"70_30_is_a_bounded_experiment_policy_not_an_algorithm_guarantee",
    },
    inbound:{
      threads_replies_mentions:"OWNER_READ_ONLY_SCOPE_GATED",
      instagram_comments_messages:"NOT_LIVE",
      facebook_comments_messages:"NOT_LIVE",
      unified_inbox:"NOT_PERSISTED_TO_UNIFIED_INBOX",
      policy:"threads_read_only_research_then_PRE_VIKTOR; draft_or_human_review_until_provider_and_policy_gates_are_verified",
    },
    funnel:{
      stages:["content","discovery","owned_visit","qualified_action","crm_evidence","opportunity","contract","verified_revenue"],
      counts:"NOT_JOINED_IN_THIS_READ_MODEL",
      rule:"attention_metrics_are_diagnostic_only",
    },
    tables:{
      content:tables.content?"AVAILABLE":"UNKNOWN",
      runs:tables.runs?"AVAILABLE":"UNKNOWN",
      publications:tables.publications?"AVAILABLE":"UNKNOWN",
      runtime_events:tables.runtimeEvents?"AVAILABLE":"UNKNOWN",
      heartbeats:tables.heartbeats?"AVAILABLE":"UNKNOWN",
    },
  };
}
