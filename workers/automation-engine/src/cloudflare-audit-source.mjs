function invalid(code){const error=new Error(code);error.code=code;throw error;}
function validIso(value){return typeof value==="string"&&Number.isFinite(Date.parse(value));}
function finding(id,category,severity){return {finding_id:id,category,severity,status:"OPEN"};}
function ageMinutes(value,nowMs){
  if(!validIso(value))return null;
  return Math.max(0,(nowMs-Date.parse(value))/60000);
}

export function buildCloudflareInternalAuditSnapshot(health,{observedAt,backlogAgeMinutes=15,heartbeatAgeMinutes=130}={}){
  if(!health||typeof health!=="object"||!validIso(observedAt))invalid("cloudflare_audit_input_invalid");
  const nowMs=Date.parse(observedAt);
  const findings=[];

  if(health.database!=="ok")findings.push(finding("cloudflare-hae-database","RUNTIME_DATABASE_UNAVAILABLE","P0"));
  if(typeof health.source_sha!=="string"||!/^[a-f0-9]{40}$/.test(health.source_sha))
    findings.push(finding("cloudflare-hae-source-sha","DEPLOYED_SOURCE_SHA_MISSING","P0"));
  if(health.automation_mode!=="dry_run")
    findings.push(finding("cloudflare-hae-automation-mode","UNEXPECTED_AUTOMATION_MODE","P0"));
  if(health.publication_config!=="disabled"||health.publication_enabled!==false)
    findings.push(finding("cloudflare-hae-publication-mode","UNEXPECTED_PUBLICATION_ENABLED","P0"));

  for(const [key,label] of [["queue","automation-queue"],["dlq","automation-dlq"]]){
    const state=health?.[key]||{};
    if(state.status!=="ok"){
      findings.push(finding("cloudflare-"+label+"-metrics","QUEUE_METRICS_UNAVAILABLE","P1"));
      continue;
    }
    const backlog=Number(state.backlog_count);
    const age=ageMinutes(state.oldest_message_at,nowMs);
    if(Number.isFinite(backlog)&&backlog>0&&age!==null&&age>backlogAgeMinutes)
      findings.push(finding("cloudflare-"+label+"-stale-backlog","QUEUE_STALE_BACKLOG","P1"));
  }

  const heartbeat=health.last_cron_wake||null;
  const heartbeatAt=heartbeat?.observed_at||heartbeat?.scheduled_at||null;
  const heartbeatAge=ageMinutes(heartbeatAt,nowMs);
  if(heartbeatAge===null||heartbeatAge>heartbeatAgeMinutes)
    findings.push(finding("cloudflare-hae-cron-heartbeat","CRON_HEARTBEAT_STALE","P1"));

  return {
    observed_at:new Date(nowMs).toISOString(),
    // Internal Worker/Queue evidence is trustworthy but does not cover Pages,
    // provider deployment metadata, CPU exceptions or provider Logs/Traces.
    coverage_complete:false,
    source_authenticated:false,
    source_trusted:true,
    findings,
  };
}
