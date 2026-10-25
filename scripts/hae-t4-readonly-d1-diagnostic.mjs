// HAE T4 immutable, owner-gated, read-only incident forensics.
// No Queue writes, Email writes, D1 mutations, or Worker deployments in this module.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const REPO = "officeus-create/Hermes";
const API = "https://api.cloudflare.com/client/v4";
const SHA = /^[a-f0-9]{40}$/;
const UUID = /^[a-f0-9-]{32,36}$/;
const ITEM = /^dlq:[a-f0-9]{32}$/;
const CANARY = /^hae\.t4\.canary\.[1-9][0-9]{0,17}\.1$/;
const EMAIL_RECEIPT = /^cloudflare-email:\/\/(accepted|message)\//;

function block(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}
export function parseT4ReadbackCommand(value) {
  if (typeof value !== "string") block("t4_readback_command_invalid");
  const matched = /^HAE_T4_READBACK ([a-f0-9]{40}) (dlq:[a-f0-9]{32})$/.exec(value.trim());
  if (!matched) block("t4_readback_command_invalid");
  return {target_sha:matched[1],dlq_item_id:matched[2]};
}
export function classifyT4DlqReceipt(response, expectedId) {
  if (!ITEM.test(expectedId)) block("t4_readback_item_id_invalid");
  if (response?.success !== true ||
      !Array.isArray(response?.result) ||
      response.result.length !== 1 ||
      response.result[0]?.success !== true ||
      !Array.isArray(response.result[0]?.results)) {
    block("t4_readback_d1_result_invalid");
  }
  const rows = response.result[0].results;
  if (rows.length !== 1) block("t4_readback_item_missing_or_ambiguous");
  const r=rows[0];
  if (r?.dlq_item_id !== expectedId || !CANARY.test(r?.message_type || "")) {
    block("t4_readback_source_identity_mismatch");
  }
  const receipt=String(r?.alert_receipt_ref || "");
  const receiptPrefix=EMAIL_RECEIPT.exec(receipt)?.[1] || "non_email_or_missing";
  return {
    schema:"hae_t4_d1_receipt_diagnostic_v1",
    dlq_item_id:expectedId,
    message_type:r.message_type,
    disposition:String(r.disposition || "UNKNOWN").slice(0,40),
    reason:String(r.reason || "UNKNOWN").slice(0,80),
    action_status:String(r.action_status || "UNKNOWN").slice(0,60),
    alert_status:String(r.alert_status || "UNKNOWN").slice(0,60),
    alert_attempt_count:Number(r.alert_attempt_count),
    alert_channel:String(r.alert_channel || "NONE").slice(0,40),
    redrive_count:Number(r.redrive_count),
    alert_provider_message_id_present:Boolean(r.alert_provider_message_id),
    receipt_prefix:receiptPrefix,
    receipt_length:receipt.length,
    receipt_sha256:"sha256:"+crypto.createHash("sha256").update(receipt).digest("hex"),
    receipt_safe_char_class:/^[a-zA-Z0-9:/._@+<>-]*$/.test(receipt),
    receipt_matches_existing_verifier:/^cloudflare-email:\/\/(?:accepted|message)\/[a-zA-Z0-9:_-]+$/.test(receipt),
    upstream_transport_proof_only:true,
    independent_inbox_verified:false,
  };
}
async function fetchJson(url,token,fetchImpl,body=null) {
  let response;
  const options={
    method:body===null?"GET":"POST",
    headers:{Authorization:"Bearer "+token,Accept:"application/json",...(body===null?{}:{"Content-Type":"application/json"})},
    signal:AbortSignal.timeout(12000),
    ...(body===null?{}:{body:JSON.stringify(body)}),
  };
  try {response=await fetchImpl(url,options);} catch {block("t4_readback_transport_failed");}
  if(!response?.ok)block("t4_readback_remote_rejected");
  let json;
  try{json=await response.json();}catch{block("t4_readback_json_invalid");}
  return json;
}
export async function runT4Readback({
  ownerComment,
  githubToken,
  cloudflareToken,
  accountId,
  manifest,
  repository=REPO,
  fetchImpl=fetch,
  tempfile,
  githubOutput,
}={}){
  const {target_sha,dlq_item_id}=parseT4ReadbackCommand(ownerComment);
  if(repository!==REPO || !githubToken || !cloudflareToken || !UUID.test(accountId || "") ||
    manifest?.baseline_status!=="VERIFIED" ||
    manifest?.canonical_database!=="hermes-connect-prototype") {
    block("t4_readback_preflight_invalid");
  }
  const upstream=await fetchJson("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(upstream?.commit?.sha!==target_sha)block("t4_readback_stale_main");
  const pages=await fetchJson(API+"/accounts/"+accountId+"/pages/projects/hermes",cloudflareToken,fetchImpl);
  if(pages?.success!==true)block("t4_readback_pages_denied");
  const binding=pages.result?.deployment_configs?.production?.d1_databases?.DB;
  const dbId=binding?.id;
  if(!UUID.test(dbId || ""))block("t4_readback_db_id_missing");
  let name=binding?.database_name||binding?.name;
  if(!name){
    const meta=await fetchJson(API+"/accounts/"+accountId+"/d1/database/"+dbId,cloudflareToken,fetchImpl);
    if(meta?.success!==true || (meta.result?.uuid && meta.result.uuid!==dbId))block("t4_readback_db_metadata_mismatch");
    name=meta.result?.name||meta.result?.database_name;
  }
  if(name!=="hermes-connect-prototype")block("t4_readback_db_name_mismatch");
  // Read-only SQL SELECT with exactly one bound DLQ item ID; no raw message body.
  const sql="SELECT dlq_item_id,message_type,disposition,reason,action_status,alert_status,alert_attempt_count,alert_channel,alert_receipt_ref,alert_provider_message_id,redrive_count FROM hermes_automation_dlq_items WHERE dlq_item_id=? LIMIT 2";
  const result=await fetchJson(API+"/accounts/"+accountId+"/d1/database/"+dbId+"/query",cloudflareToken,fetchImpl,{sql,params:[dlq_item_id]});
  const output=classifyT4DlqReceipt(result,dlq_item_id);
  const artifact={...output,main_sha:target_sha,baseline_source_sha:manifest.baseline_source_sha};
  if(tempfile && githubOutput){
    fs.writeFileSync(path.join(tempfile,"hae-t4-readonly-d1-diagnostic.json"),JSON.stringify(artifact,null,2)+"\n");
    fs.appendFileSync(githubOutput,"dlq_item_id="+dlq_item_id+"\n");
  }
  return artifact;
}
if(process.argv[1] && import.meta.url==="file://"+path.resolve(process.argv[1])){
  let manifest={};
  let accountId="";
  try{
    manifest=JSON.parse(fs.readFileSync("workers/automation-engine/migrations/manifest.json","utf8"));
    accountId=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8")).account_id;
  }catch{console.error("t4_readback_local_config_unavailable");process.exit(1);}
  runT4Readback({
    ownerComment:process.env.T4_READBACK_COMMENT,
    githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
    accountId,manifest,
    tempfile:process.env.RUNNER_TEMP,
    githubOutput:process.env.GITHUB_OUTPUT,
  }).then((artifact)=>{
    console.log(JSON.stringify(artifact));
    console.log("T4 diagnostic is READ_ONLY; independent Gmail readback remains separate");
  }).catch(e=>{console.error(e.code||"t4_readback_failed");process.exitCode=1;});
}
