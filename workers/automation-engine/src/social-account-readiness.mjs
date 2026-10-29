const HERMES_LOGISTICS_ACCOUNT_ID = "28419597014385166";
const HERMES_LOGISTICS_USERNAME = "hermes.logistics";
const PROGRESSOPRO_USERNAME = "progressopro";

const clean=(value,max=4096)=>String(value??"").trim().slice(0,max);
const scopes=(value)=>[...new Set(clean(value,2000).split(/[\s,]+/).map(x=>x.trim()).filter(Boolean))].sort();

async function tableExists(db,name){
  try{
    const row=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1").bind(name).first();
    return String(row?.name||"")===name;
  }catch{return false;}
}

function tokenExpiryState(value,nowMs){
  const raw=clean(value,100);
  if(!raw) return "UNKNOWN";
  const ms=Date.parse(raw);
  if(!Number.isFinite(ms)) return "INVALID";
  if(ms<=nowMs) return "EXPIRED";
  if(ms-nowMs<=7*24*60*60*1000) return "EXPIRING_SOON";
  return "VALID_WINDOW";
}

export async function socialAccountReadinessSnapshot(env,{nowMs=Date.now()}={}){
  const logisticsToken=clean(env?.HERMES_THREADS_ACCESS_TOKEN);
  const logisticsAccount=clean(env?.HERMES_THREADS_META_ACCOUNT_ID,160);
  const logisticsProvider=clean(env?.HERMES_THREADS_PROVIDER,40);
  const logistics={
    business_lane:"HERMES_LOGISTICS",
    platform:"threads",
    credential_source:"hae_worker_secret",
    provider_transport:"shared_meta_threads_provider",
    expected_account_id:HERMES_LOGISTICS_ACCOUNT_ID,
    expected_username:HERMES_LOGISTICS_USERNAME,
    account_identity_configured:logisticsAccount===HERMES_LOGISTICS_ACCOUNT_ID,
    credential_present:logisticsToken.length>=20&&logisticsToken.length<=4096,
    provider_selected:logisticsProvider==="meta_direct",
    external_write_enabled:false,
  };
  logistics.ready_for_provider_preflight=Boolean(
    logistics.account_identity_configured&&logistics.credential_present&&logistics.provider_selected
  );

  let progressopro={
    business_lane:"PROGRESSOPRO",
    platform:"threads",
    credential_source:"hermes_social_threads_connections",
    provider_transport:"legacy_connector_not_yet_shared",
    expected_username:PROGRESSOPRO_USERNAME,
    connection_present:false,
    identity_verified:false,
    observed_account_id:null,
    observed_username:null,
    granted_scopes:[],
    token_ciphertext_present:false,
    token_expiry_state:"UNKNOWN",
    hae_token_key_present:Boolean(clean(env?.THREADS_BRAND_TOKEN_KEY,4096)),
    external_write_enabled:false,
  };

  if(env?.DB&&await tableExists(env.DB,"hermes_social_threads_connections")){
    try{
      const row=await env.DB.prepare(`SELECT brand_key,state,threads_user_id,username,token_ciphertext,token_expires_at,
        granted_scope,identity_verified,last_error_class,updated_at
        FROM hermes_social_threads_connections WHERE brand_key='progressopro' LIMIT 1`).first();
      if(row){
        const observedUsername=clean(row.username,160).replace(/^@/,"").toLowerCase();
        progressopro={
          ...progressopro,
          connection_present:true,
          identity_verified:Number(row.identity_verified||0)===1&&observedUsername===PROGRESSOPRO_USERNAME,
          observed_account_id:clean(row.threads_user_id,160)||null,
          observed_username:observedUsername||null,
          granted_scopes:scopes(row.granted_scope),
          token_ciphertext_present:Boolean(clean(row.token_ciphertext,8192)),
          token_expiry_state:tokenExpiryState(row.token_expires_at,nowMs),
          connection_state:clean(row.state,80)||null,
          last_error_class:clean(row.last_error_class,160)||null,
          updated_at:clean(row.updated_at,100)||null,
        };
      }
    }catch{
      progressopro={...progressopro,read_error:"progressopro_connection_read_failed"};
    }
  }

  const requiredProgressoproScopes=["threads_basic","threads_content_publish","threads_read_replies","threads_manage_replies"];
  const progressoproScopes=new Set(progressopro.granted_scopes);
  progressopro.required_write_scopes_present=requiredProgressoproScopes.every(scope=>progressoproScopes.has(scope));
  progressopro.ready_for_hae_write_bridge=Boolean(
    progressopro.connection_present
    &&progressopro.identity_verified
    &&progressopro.token_ciphertext_present
    &&progressopro.hae_token_key_present
    &&progressopro.required_write_scopes_present
    &&progressopro.token_expiry_state!=="EXPIRED"
    &&progressopro.token_expiry_state!=="INVALID"
  );

  const blockers=[];
  if(!logistics.ready_for_provider_preflight) blockers.push("hermes_logistics_meta_credentials_not_ready");
  if(!progressopro.connection_present) blockers.push("progressopro_threads_connection_missing");
  else{
    if(!progressopro.identity_verified) blockers.push("progressopro_identity_not_verified");
    if(!progressopro.required_write_scopes_present) blockers.push("progressopro_required_scopes_missing");
    if(!progressopro.token_ciphertext_present) blockers.push("progressopro_encrypted_token_missing");
    if(!progressopro.hae_token_key_present) blockers.push("progressopro_hae_token_key_bridge_missing");
    if(["EXPIRED","INVALID"].includes(progressopro.token_expiry_state)) blockers.push("progressopro_token_not_usable");
  }
  if(progressopro.provider_transport!=="shared_meta_threads_provider") blockers.push("progressopro_provider_transport_not_converged");

  return {
    success:true,
    observed_at:new Date(nowMs).toISOString(),
    social_business_lanes:["HERMES_LOGISTICS","PROGRESSOPRO"],
    provider_contract:"shared/social/meta-threads-provider.mjs",
    tokens_returned:false,
    external_write_performed:false,
    hermes_logistics:logistics,
    progressopro,
    write_convergence_ready:blockers.length===0,
    blockers,
  };
}
