const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const OPENID_SCOPE = "openid";
const EMAIL_SCOPE = "email";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";
const DRIVE_FILES_BASE = "https://www.googleapis.com/drive/v3/files/";
const STATE_TTL_MS = 10 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const clean=(value,max=240)=>String(value??"").trim().slice(0,max);
const enabled=(value)=>/^(1|true|yes|on)$/i.test(String(value||"").trim());

function bytesToBase64(bytes){
  let binary="";
  const chunk=0x8000;
  for(let offset=0;offset<bytes.length;offset+=chunk){
    const slice=bytes.subarray(offset,Math.min(offset+chunk,bytes.length));
    for(const byte of slice)binary+=String.fromCharCode(byte);
  }
  return btoa(binary);
}
function base64ToBytes(value){
  const binary=atob(value);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i+=1)bytes[i]=binary.charCodeAt(i);
  return bytes;
}

export function googleSocialDriveRuntimeConfig(env){
  const clientId=clean(env?.GOOGLE_SOCIAL_DRIVE_CLIENT_ID,512);
  const clientSecret=clean(env?.GOOGLE_SOCIAL_DRIVE_CLIENT_SECRET,512);
  const redirectUri=clean(env?.GOOGLE_SOCIAL_DRIVE_REDIRECT_URI,1024);
  const tokenKey=clean(env?.GOOGLE_SOCIAL_DRIVE_TOKEN_KEY,1024);
  if(!clientId||!clientSecret||!redirectUri||!tokenKey)return null;
  try{
    if(base64ToBytes(tokenKey).byteLength!==32)return null;
    const url=new URL(redirectUri);if(url.protocol!=="https:")return null;
  }catch{return null;}
  return{clientId,clientSecret,redirectUri,tokenKey};
}

async function importTokenKey(raw){
  let bytes;try{bytes=base64ToBytes(raw);}catch{return null;}
  if(bytes.byteLength!==32)return null;
  return crypto.subtle.importKey("raw",bytes,{name:"AES-GCM"},false,["encrypt","decrypt"]);
}
async function encryptPayload(env,payload){
  const config=googleSocialDriveRuntimeConfig(env);if(!config)throw new Error("google_social_drive_runtime_not_configured");
  const key=await importTokenKey(config.tokenKey);if(!key)throw new Error("google_social_drive_token_key_invalid");
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,encoder.encode(JSON.stringify(payload)));
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}
async function decryptPayload(env,value){
  const config=googleSocialDriveRuntimeConfig(env);if(!config)throw new Error("google_social_drive_runtime_not_configured");
  const key=await importTokenKey(config.tokenKey);if(!key)throw new Error("google_social_drive_token_key_invalid");
  const parts=String(value||"").split(".");if(parts.length!==3||parts[0]!=="v1")throw new Error("google_social_drive_token_payload_invalid");
  const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:base64ToBytes(parts[1])},key,base64ToBytes(parts[2]));
  return JSON.parse(decoder.decode(plain));
}
async function hashState(raw){
  const digest=await crypto.subtle.digest("SHA-256",encoder.encode(String(raw||"")));
  return bytesToBase64(new Uint8Array(digest));
}

export async function ensureBusinessSocialDriveSchema(db){
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_business_social_drive_connections (
    business_key TEXT PRIMARY KEY,
    owner_specialist_id TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'connected',
    account_email TEXT,
    token_ciphertext TEXT NOT NULL,
    granted_scope TEXT,
    token_expires_at TEXT,
    connected_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_error_class TEXT
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS hermes_business_social_drive_oauth_states (
    state_hash TEXT PRIMARY KEY,
    business_key TEXT NOT NULL,
    owner_specialist_id TEXT NOT NULL,
    vertical_key TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
}

export async function createBusinessSocialDriveOAuthState(db,{business,ownerId}){
  await ensureBusinessSocialDriveSchema(db);
  const raw=`${crypto.randomUUID()}.${crypto.randomUUID()}`;
  const stateHash=await hashState(raw);
  const now=new Date();
  const expiresAt=new Date(now.getTime()+STATE_TTL_MS).toISOString();
  await db.prepare("DELETE FROM hermes_business_social_drive_oauth_states WHERE expires_at<=? OR (business_key=? AND owner_specialist_id=?)")
    .bind(now.toISOString(),business.business_key,String(ownerId)).run();
  await db.prepare(`INSERT INTO hermes_business_social_drive_oauth_states
    (state_hash,business_key,owner_specialist_id,vertical_key,expires_at,created_at) VALUES (?,?,?,?,?,?)`)
    .bind(stateHash,business.business_key,String(ownerId),business.vertical_key,expiresAt,now.toISOString()).run();
  return raw;
}
export async function consumeBusinessSocialDriveOAuthState(db,raw){
  await ensureBusinessSocialDriveSchema(db);
  const stateHash=await hashState(raw);
  const row=await db.prepare("SELECT * FROM hermes_business_social_drive_oauth_states WHERE state_hash=? LIMIT 1").bind(stateHash).first();
  await db.prepare("DELETE FROM hermes_business_social_drive_oauth_states WHERE state_hash=?").bind(stateHash).run();
  if(!row)return null;
  if(!Number.isFinite(Date.parse(String(row.expires_at)))||Date.parse(String(row.expires_at))<=Date.now())return null;
  return row;
}

export function businessSocialDriveAuthorizationUrl(env,state){
  const config=googleSocialDriveRuntimeConfig(env);if(!config)return null;
  const url=new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id",config.clientId);
  url.searchParams.set("redirect_uri",config.redirectUri);
  url.searchParams.set("response_type","code");
  url.searchParams.set("scope",[OPENID_SCOPE,EMAIL_SCOPE,DRIVE_SCOPE].join(" "));
  url.searchParams.set("access_type","offline");
  url.searchParams.set("prompt","consent");
  url.searchParams.set("include_granted_scopes","true");
  url.searchParams.set("state",state);
  return url.toString();
}

async function exchangeCode(env,code){
  const config=googleSocialDriveRuntimeConfig(env);if(!config)return{ok:false,error_class:"runtime_not_configured"};
  try{
    const response=await fetch(TOKEN_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({
      code,client_id:config.clientId,client_secret:config.clientSecret,redirect_uri:config.redirectUri,grant_type:"authorization_code"
    })});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data?.access_token)return{ok:false,error_class:"authorization_exchange_failed"};
    const expiresAt=new Date(Date.now()+Math.max(60,Number(data.expires_in||3600))*1000).toISOString();
    return{ok:true,payload:{access_token:String(data.access_token),refresh_token:data.refresh_token?String(data.refresh_token):null,expires_at:expiresAt},scope:clean(data.scope||"",1200),expires_at:expiresAt};
  }catch{return{ok:false,error_class:"authorization_exchange_unavailable"};}
}
async function refreshToken(env,payload){
  const config=googleSocialDriveRuntimeConfig(env);if(!config)return{ok:false,error_class:"runtime_not_configured"};
  const refresh=clean(payload?.refresh_token,4096);if(!refresh)return{ok:false,error_class:"authorization_required"};
  try{
    const response=await fetch(TOKEN_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({
      refresh_token:refresh,client_id:config.clientId,client_secret:config.clientSecret,grant_type:"refresh_token"
    })});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data?.access_token)return{ok:false,error_class:data?.error==="invalid_grant"?"authorization_required":"token_refresh_failed"};
    const expiresAt=new Date(Date.now()+Math.max(60,Number(data.expires_in||3600))*1000).toISOString();
    return{ok:true,payload:{access_token:String(data.access_token),refresh_token:refresh,expires_at:expiresAt},expires_at:expiresAt};
  }catch{return{ok:false,error_class:"token_refresh_unavailable"};}
}
async function accountEmail(accessToken){
  try{
    const response=await fetch(USERINFO_ENDPOINT,{headers:{Authorization:`Bearer ${accessToken}`,Accept:"application/json"}});
    const data=await response.json().catch(()=>({}));
    return response.ok?clean(data?.email,320):null;
  }catch{return null;}
}

export async function saveBusinessSocialDriveConnection(db,env,{business,ownerId,exchange}){
  await ensureBusinessSocialDriveSchema(db);
  const encrypted=await encryptPayload(env,exchange.payload);
  const email=await accountEmail(exchange.payload.access_token);
  const now=new Date().toISOString();
  await db.prepare(`INSERT INTO hermes_business_social_drive_connections
    (business_key,owner_specialist_id,state,account_email,token_ciphertext,granted_scope,token_expires_at,connected_at,updated_at,last_error_class)
    VALUES (?,?,?,?,?,?,?,?,?,NULL)
    ON CONFLICT(business_key) DO UPDATE SET
      owner_specialist_id=excluded.owner_specialist_id,state='connected',account_email=excluded.account_email,
      token_ciphertext=excluded.token_ciphertext,granted_scope=excluded.granted_scope,token_expires_at=excluded.token_expires_at,
      updated_at=excluded.updated_at,last_error_class=NULL`)
    .bind(business.business_key,String(ownerId),"connected",email,encrypted,exchange.scope||"",exchange.expires_at,now,now).run();
}

export async function exchangeBusinessSocialDriveCode(env,code){return exchangeCode(env,code);}

export async function readBusinessSocialDriveConnection(db,env,business,ownerId){
  await ensureBusinessSocialDriveSchema(db);
  const row=await db.prepare(`SELECT business_key,state,account_email,granted_scope,token_expires_at,connected_at,updated_at,last_error_class
    FROM hermes_business_social_drive_connections WHERE business_key=? AND owner_specialist_id=? LIMIT 1`)
    .bind(business.business_key,String(ownerId)).first();
  if(!row)return{connected:false,configured:Boolean(googleSocialDriveRuntimeConfig(env)),state:googleSocialDriveRuntimeConfig(env)?"not_connected":"configuration_required"};
  return{connected:String(row.state)==="connected",configured:Boolean(googleSocialDriveRuntimeConfig(env)),state:String(row.state||"connected"),account_email:row.account_email?String(row.account_email):null,granted_scope:String(row.granted_scope||""),token_expires_at:row.token_expires_at||null,updated_at:row.updated_at||null,last_error_class:row.last_error_class||null};
}

async function usableAccessToken(db,env,business,ownerId){
  await ensureBusinessSocialDriveSchema(db);
  const row=await db.prepare("SELECT * FROM hermes_business_social_drive_connections WHERE business_key=? AND owner_specialist_id=? LIMIT 1")
    .bind(business.business_key,String(ownerId)).first();
  if(!row)return{ok:false,error_class:"drive_authorization_required"};
  let payload;try{payload=await decryptPayload(env,row.token_ciphertext);}catch{return{ok:false,error_class:"drive_token_decrypt_failed"};}
  const expires=Date.parse(String(payload?.expires_at||row.token_expires_at||""));
  if(payload?.access_token&&Number.isFinite(expires)&&expires>Date.now()+60_000)return{ok:true,access_token:String(payload.access_token)};
  const refreshed=await refreshToken(env,payload);
  if(!refreshed.ok){
    await db.prepare("UPDATE hermes_business_social_drive_connections SET state='needs_authorization',last_error_class=?,updated_at=? WHERE business_key=?")
      .bind(refreshed.error_class,new Date().toISOString(),business.business_key).run();
    return{ok:false,error_class:refreshed.error_class};
  }
  const encrypted=await encryptPayload(env,refreshed.payload);
  await db.prepare("UPDATE hermes_business_social_drive_connections SET state='connected',token_ciphertext=?,token_expires_at=?,last_error_class=NULL,updated_at=? WHERE business_key=?")
    .bind(encrypted,refreshed.expires_at,new Date().toISOString(),business.business_key).run();
  return{ok:true,access_token:String(refreshed.payload.access_token)};
}

export function parseGoogleDriveResourceUrl(value){
  try{
    const url=new URL(String(value||"").trim());
    const host=url.hostname.toLowerCase();
    if(url.protocol!=="https:"||(host!=="drive.google.com"&&host!=="docs.google.com"))return null;
    const folder=url.pathname.match(/\/folders\/([A-Za-z0-9_-]+)/);
    if(folder)return{id:folder[1],kind:"folder"};
    const file=url.pathname.match(/\/d\/([A-Za-z0-9_-]+)/);
    if(file)return{id:file[1],kind:"file"};
    const query=url.searchParams.get("id");
    if(query&&/^[A-Za-z0-9_-]+$/.test(query))return{id:query,kind:"unknown"};
    return null;
  }catch{return null;}
}
async function driveJson(url,token){
  try{
    const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`,Accept:"application/json"}});
    const data=await response.json().catch(()=>({}));
    return{ok:response.ok,status:response.status,data};
  }catch{return{ok:false,status:0,data:null};}
}
async function driveFileMeta(id,token){
  const url=new URL(id,DRIVE_FILES_BASE);
  url.searchParams.set("fields","id,name,mimeType,modifiedTime,size,webViewLink,thumbnailLink");
  const result=await driveJson(url.toString(),token);
  return result.ok?result.data:null;
}
async function driveFolderChildren(id,token){
  const url=new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q",`'${id}' in parents and trashed=false`);
  url.searchParams.set("fields","files(id,name,mimeType,modifiedTime,size,webViewLink,thumbnailLink)");
  url.searchParams.set("pageSize","30");
  url.searchParams.set("orderBy","modifiedTime desc");
  const result=await driveJson(url.toString(),token);
  return result.ok&&Array.isArray(result.data?.files)?result.data.files:[];
}
async function driveDownload(id,token,exportMime=null){
  const url=exportMime
    ?new URL(`${id}/export`,DRIVE_FILES_BASE)
    :new URL(id,DRIVE_FILES_BASE);
  if(exportMime)url.searchParams.set("mimeType",exportMime);
  else url.searchParams.set("alt","media");
  try{
    const response=await fetch(url.toString(),{headers:{Authorization:`Bearer ${token}`}});
    if(!response.ok)return null;
    return{bytes:new Uint8Array(await response.arrayBuffer()),contentType:response.headers.get("content-type")||""};
  }catch{return null;}
}
async function materializeAsset(file,token){
  const mime=String(file?.mimeType||"");
  let downloaded=null;
  let exportMime=null;
  if(mime==="application/vnd.google-apps.document"||mime==="application/vnd.google-apps.presentation")exportMime="text/plain";
  else if(mime==="application/vnd.google-apps.spreadsheet")exportMime="text/csv";
  if(exportMime)downloaded=await driveDownload(file.id,token,exportMime);
  else if(mime.startsWith("text/")||["application/json","application/csv","text/csv"].includes(mime))downloaded=await driveDownload(file.id,token);
  else if(["image/jpeg","image/png","image/webp","image/gif"].includes(mime))downloaded=await driveDownload(file.id,token);

  if(downloaded&&exportMime||downloaded&&(mime.startsWith("text/")||["application/json","application/csv"].includes(mime))){
    const text=decoder.decode(downloaded.bytes).slice(0,20000);
    return{kind:"text",id:String(file.id),name:clean(file.name,300),mime_type:mime,text,modified_time:file.modifiedTime||null};
  }
  if(downloaded&&["image/jpeg","image/png","image/webp","image/gif"].includes(mime)&&downloaded.bytes.byteLength<=5*1024*1024){
    return{kind:"image",id:String(file.id),name:clean(file.name,300),mime_type:mime,data_url:`data:${mime};base64,${bytesToBase64(downloaded.bytes)}`,modified_time:file.modifiedTime||null};
  }
  return{kind:"metadata",id:String(file.id),name:clean(file.name,300),mime_type:mime,modified_time:file.modifiedTime||null};
}

export async function readBusinessSocialDriveSource(db,env,business,ownerId,sourceUrl){
  const parsed=parseGoogleDriveResourceUrl(sourceUrl);if(!parsed)return{ok:false,error_class:"google_drive_source_url_invalid"};
  const token=await usableAccessToken(db,env,business,ownerId);if(!token.ok)return token;
  const meta=await driveFileMeta(parsed.id,token.access_token);if(!meta)return{ok:false,error_class:"drive_source_unavailable"};
  const files=String(meta.mimeType)==="application/vnd.google-apps.folder"
    ?await driveFolderChildren(parsed.id,token.access_token)
    :[meta];
  const selected=files.filter((file)=>String(file.mimeType)!=="application/vnd.google-apps.folder").slice(0,12);
  const assets=[];
  for(const file of selected)assets.push(await materializeAsset(file,token.access_token));
  return{ok:true,source:{id:String(meta.id),name:clean(meta.name,300),mime_type:String(meta.mimeType||""),url:String(sourceUrl)},assets};
}

export async function disconnectBusinessSocialDrive(db,env,business,ownerId){
  await ensureBusinessSocialDriveSchema(db);
  const row=await db.prepare("SELECT token_ciphertext FROM hermes_business_social_drive_connections WHERE business_key=? AND owner_specialist_id=? LIMIT 1")
    .bind(business.business_key,String(ownerId)).first();
  if(row){
    try{
      const payload=await decryptPayload(env,row.token_ciphertext);
      const token=clean(payload?.refresh_token||payload?.access_token,4096);
      if(token)await fetch("https://oauth2.googleapis.com/revoke",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({token})});
    }catch{}
  }
  await db.prepare("DELETE FROM hermes_business_social_drive_connections WHERE business_key=? AND owner_specialist_id=?")
    .bind(business.business_key,String(ownerId)).run();
}

export const GOOGLE_SOCIAL_DRIVE_SCOPE=DRIVE_SCOPE;
