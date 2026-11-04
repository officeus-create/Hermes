import { createMetaThreadsTransport } from "../../../shared/social/meta-threads-provider.mjs";

// Server-side credential bridge for existing Hermes social identities.
// Never return decrypted credentials from public/private HAE status endpoints.
// The bridge exists so provider tokens are resolved inside HAE, not copied into
// Queue payloads, Command Center responses, GitHub or chat.

const encoder=new TextEncoder();
const decoder=new TextDecoder();

const clean=(value,max=8192)=>String(value??"").trim().slice(0,max);
const numericId=(value)=>{
  const id=clean(value,160);
  return /^[0-9]{6,40}$/.test(id)?id:null;
};
const username=(value)=>clean(value,160).replace(/^@/,"").toLowerCase();
const scopeSet=(value)=>new Set(clean(value,2000).split(/[\s,]+/).map(x=>x.trim()).filter(Boolean));

function base64ToBytes(value){
  try{
    const raw=atob(String(value||""));
    const out=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
    return out;
  }catch{return null;}
}

async function importBridgeKey(raw){
  const bytes=base64ToBytes(clean(raw,4096));
  if(!bytes||bytes.byteLength!==32)return null;
  try{
    return await crypto.subtle.importKey("raw",bytes,{name:"AES-GCM"},false,["decrypt"]);
  }catch{return null;}
}

async function decryptPayload(rawKey,ciphertext){
  const key=await importBridgeKey(rawKey);
  if(!key)return {ok:false,error_class:"social_credential_bridge_key_invalid"};
  const parts=String(ciphertext||"").split(".");
  if(parts.length!==3||parts[0]!=="v1")return {ok:false,error_class:"social_credential_payload_invalid"};
  const iv=base64ToBytes(parts[1]);
  const bytes=base64ToBytes(parts[2]);
  if(!iv||iv.byteLength!==12||!bytes)return {ok:false,error_class:"social_credential_payload_invalid"};
  try{
    const plaintext=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,bytes);
    const payload=JSON.parse(decoder.decode(plaintext));
    if(!payload||typeof payload!=="object")throw new Error("invalid");
    return {ok:true,payload};
  }catch{
    return {ok:false,error_class:"social_credential_decrypt_failed"};
  }
}

async function tableExists(db,name){
  try{
    const row=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1").bind(name).first();
    return String(row?.name||"")===name;
  }catch{return false;}
}

export async function resolveProgressoproThreadsCredential(env,{nowMs=Date.now()}={}){
  if(!env?.DB)return {ok:false,error_class:"database_not_configured"};
  if(!clean(env?.THREADS_BRAND_TOKEN_KEY,4096))return {ok:false,error_class:"progressopro_hae_token_key_bridge_missing"};
  if(!await tableExists(env.DB,"hermes_social_threads_connections")){
    return {ok:false,error_class:"progressopro_threads_connection_table_missing"};
  }

  let row;
  try{
    row=await env.DB.prepare(`SELECT brand_key,state,threads_user_id,username,token_ciphertext,token_expires_at,
      granted_scope,identity_verified,last_error_class,updated_at
      FROM hermes_social_threads_connections WHERE brand_key='progressopro' LIMIT 1`).first();
  }catch{
    return {ok:false,error_class:"progressopro_connection_read_failed"};
  }
  if(!row)return {ok:false,error_class:"progressopro_threads_connection_missing"};

  const accountId=numericId(row.threads_user_id);
  const observedUsername=username(row.username);
  if(Number(row.identity_verified||0)!==1||observedUsername!=="progressopro"||!accountId){
    return {ok:false,error_class:"progressopro_identity_not_verified"};
  }

  const required=["threads_basic","threads_content_publish"];
  const granted=scopeSet(row.granted_scope);
  const missingScopes=required.filter(scope=>!granted.has(scope));
  if(missingScopes.length){
    return {ok:false,error_class:"progressopro_required_scopes_missing",missing_scopes:missingScopes};
  }

  const expiresAt=clean(row.token_expires_at,100);
  const expiresMs=Date.parse(expiresAt);
  if(expiresAt&&(!Number.isFinite(expiresMs)||expiresMs<=nowMs)){
    return {ok:false,error_class:"progressopro_token_expired"};
  }

  const decrypted=await decryptPayload(env.THREADS_BRAND_TOKEN_KEY,row.token_ciphertext);
  if(!decrypted.ok)return decrypted;
  const accessToken=clean(decrypted.payload?.access_token,4096);
  if(accessToken.length<20||accessToken.length>4096){
    return {ok:false,error_class:"progressopro_access_token_invalid"};
  }

  const payloadUserId=numericId(decrypted.payload?.user_id);
  if(payloadUserId&&payloadUserId!==accountId){
    return {ok:false,error_class:"progressopro_token_identity_mismatch"};
  }

  return {
    ok:true,
    source:"hermes_social_threads_connections",
    accessToken,
    accountId,
    username:observedUsername,
    grantedScopes:[...granted].sort(),
    expiresAt:expiresAt||null,
    connectionUpdatedAt:clean(row.updated_at,100)||null,
  };
}


export async function resolveBusinessSocialThreadsCredential(env,{
  accountId,
  expectedUsername,
  nowMs=Date.now(),
}={}){
  if(!env?.DB)return {ok:false,error_class:"database_not_configured"};
  const exactAccount=numericId(accountId);
  const exactUsername=username(expectedUsername);
  const rawKey=clean(env?.HERMES_SOCIAL_TOKEN_KEY||env?.THREADS_BRAND_TOKEN_KEY,4096);
  if(!exactAccount||!exactUsername)return {ok:false,error_class:"business_social_identity_required"};
  if(!rawKey)return {ok:false,error_class:"business_social_token_key_missing"};
  if(!await tableExists(env.DB,"hermes_business_social_credentials")){
    return {ok:false,error_class:"business_social_credentials_table_missing"};
  }
  let rows;
  try{
    rows=await env.DB.prepare(
      "SELECT business_key,owner_specialist_id,state,username,external_account_ref,token_ciphertext,token_expires_at,granted_scope,updated_at "+
      "FROM hermes_business_social_credentials WHERE provider='threads' AND state='connected_write' AND external_account_ref=?"
    ).bind(exactAccount).all();
  }catch{
    return {ok:false,error_class:"business_social_connection_read_failed"};
  }
  const matches=(rows?.results||[]).filter(row=>username(row?.username)===exactUsername);
  if(matches.length===0)return {ok:false,error_class:"business_social_threads_connection_missing"};
  if(matches.length!==1)return {ok:false,error_class:"business_social_threads_connection_ambiguous"};
  const row=matches[0];
  const granted=scopeSet(row.granted_scope);
  for(const scope of ["threads_basic","threads_content_publish"]){
    if(!granted.has(scope))return {ok:false,error_class:"business_social_required_scopes_missing",missing_scopes:[scope]};
  }
  const expiresAt=clean(row.token_expires_at,100);
  const expiresMs=Date.parse(expiresAt);
  if(expiresAt&&(!Number.isFinite(expiresMs)||expiresMs<=nowMs)){
    return {ok:false,error_class:"business_social_token_expired"};
  }
  const decrypted=await decryptPayload(rawKey,row.token_ciphertext);
  if(!decrypted.ok)return decrypted;
  const accessToken=clean(decrypted.payload?.access_token,4096);
  if(accessToken.length<20||accessToken.length>4096)return {ok:false,error_class:"business_social_access_token_invalid"};
  const payloadUserId=numericId(decrypted.payload?.threads_user_id||decrypted.payload?.user_id);
  if(payloadUserId&&payloadUserId!==exactAccount)return {ok:false,error_class:"business_social_token_identity_mismatch"};
  return {
    ok:true,
    source:"hermes_business_social_credentials",
    accessToken,
    accountId:exactAccount,
    username:exactUsername,
    grantedScopes:[...granted].sort(),
    expiresAt:expiresAt||null,
    connectionUpdatedAt:clean(row.updated_at,100)||null,
  };
}

export function redactResolvedSocialCredential(result){
  if(!result?.ok)return result;
  return {
    ok:true,
    source:result.source,
    account_id:result.accountId,
    username:result.username,
    granted_scopes:Array.isArray(result.grantedScopes)?result.grantedScopes:[],
    expires_at:result.expiresAt||null,
    connection_updated_at:result.connectionUpdatedAt||null,
    access_token_returned:false,
  };
}


export async function resolveThreadsTransportForLane(env,businessLane,{nowMs=Date.now(),fetchImpl=fetch}={}){
  const lane=clean(businessLane,64).toUpperCase();
  if(lane==="HERMES_LOGISTICS"){
    const configuredAccount=numericId(env?.HERMES_THREADS_META_ACCOUNT_ID);
    const configuredToken=clean(env?.HERMES_THREADS_ACCESS_TOKEN,4096);
    let credential=null;
    if(configuredAccount==="28419597014385166"&&configuredToken.length>=20&&configuredToken.length<=4096){
      const configuredScopes=[...scopeSet(env?.HERMES_THREADS_GRANTED_SCOPES||"")].sort();
      credential={
        ok:true,source:"hae_worker_secret",accessToken:configuredToken,
        accountId:configuredAccount,username:"hermes.logistics",
        grantedScopes:configuredScopes.length?configuredScopes:null,
      };
    }else{
      credential=await resolveBusinessSocialThreadsCredential(env,{
        accountId:"28419597014385166",
        expectedUsername:"hermes.logistics",
        nowMs,
      });
    }
    if(!credential?.ok)return {ok:false,error_class:credential?.error_class||"hermes_logistics_meta_credentials_not_ready"};
    const transport=createMetaThreadsTransport({
      accessToken:credential.accessToken,
      accountId:credential.accountId,
      expectedUsername:credential.username,
      fetchImpl,
    });
    if(!transport)return {ok:false,error_class:"hermes_logistics_meta_transport_invalid"};
    return {
      ok:true,
      business_lane:"HERMES_LOGISTICS",
      accountKey:"hermes_logistics",
      accountId:credential.accountId,
      username:credential.username,
      source:credential.source,
      grantedScopes:Array.isArray(credential.grantedScopes)?credential.grantedScopes:null,
      transport,
    };
  }
  if(lane==="PROGRESSOPRO"){
    let credential=await resolveProgressoproThreadsCredential(env,{nowMs});
    if(!credential.ok){
      credential=await resolveBusinessSocialThreadsCredential(env,{
        accountId:env?.THREADS_PROGRESSOPRO_ACCOUNT_ID||"39909484478649830",
        expectedUsername:"progressopro",
        nowMs,
      });
    }
    if(!credential.ok)return credential;
    const transport=createMetaThreadsTransport({
      accessToken:credential.accessToken,
      accountId:credential.accountId,
      expectedUsername:credential.username,
      fetchImpl,
    });
    if(!transport)return {ok:false,error_class:"progressopro_meta_transport_invalid"};
    return {
      ok:true,
      business_lane:"PROGRESSOPRO",
      accountKey:"progressopro",
      accountId:credential.accountId,
      username:credential.username,
      source:credential.source,
      grantedScopes:Array.isArray(credential.grantedScopes)?credential.grantedScopes:null,
      transport,
    };
  }
  return {ok:false,error_class:"social_business_lane_invalid"};
}
