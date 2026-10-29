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

  const required=["threads_basic","threads_content_publish","threads_read_replies","threads_manage_replies"];
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
