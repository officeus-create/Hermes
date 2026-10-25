// GitHub Actions source-only sensor producer for #2067.
// This script never processes untrusted PR code or logs and never calls HAE models.
// It performs exactly one authenticated Cloudflare Queue POST after read-only
// GitHub verification, with no blind resend if the result is ambiguous.
import fs from "node:fs";

const REPO="officeus-create/Hermes",API="https://api.cloudflare.com/client/v4";
const ALLOWED=new Set(["Hermes Automation Engine Contract","Website checks"]);
const UUID=/^[a-f0-9-]{32,36}$/;
function fail(code){const e=new Error(code);e.code=code;throw e;}
async function jsonFetch(url,token,fetchImpl,postBody){
  const opts={
    method:postBody===undefined?"GET":"POST",
    headers:{Authorization:"Bearer "+token,Accept:"application/json",...(postBody===undefined?{}:{"Content-Type":"application/json"})},
    ...(postBody===undefined?{}:{body:JSON.stringify(postBody)}),
    signal:AbortSignal.timeout(12000),
  };
  let resp;
  try{resp=await fetchImpl(url,opts);}catch{fail("github_ci_source_transport_ambiguous_no_retry");}
  if(!resp?.ok)fail("github_ci_source_http_rejected");
  try{return await resp.json();}catch{fail("github_ci_source_json_invalid");}
}
export async function dispatchGithubCIEvent({
  runId,runAttempt,repo=REPO,githubToken,cloudflareToken,accountId,
  fetchImpl=fetch,
}={}){
  if(repo!==REPO||!Number.isSafeInteger(runId)||runId<=0||
     !Number.isSafeInteger(runAttempt)||runAttempt<=0 ||
     !githubToken||!cloudflareToken||!UUID.test(accountId||""))fail("github_ci_source_preflight_invalid");
  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||run?.run_attempt!==runAttempt ||
    run?.repository?.full_name!==REPO ||
    !ALLOWED.has(run?.name) ||
    run?.status!=="completed"||!["failure","timed_out"].includes(run?.conclusion)||
    run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+runId) {
    fail("github_ci_source_run_verification_failed");
  }
  const queues=await jsonFetch(API+"/accounts/"+accountId+"/queues",cloudflareToken,fetchImpl);
  if(queues?.success!==true||!Array.isArray(queues.result))fail("github_ci_cloudflare_queue_inventory_invalid");
  const matches=queues.result.filter(q=>q.queue_name==="hermes-automation"&&UUID.test(q.queue_id||""));
  if(matches.length!==1)fail("github_ci_canonical_queue_missing_or_ambiguous");
  const packet={body:{type:"github.ci.audit",run_id:runId,run_attempt:runAttempt}};
  const accepted=await jsonFetch(API+"/accounts/"+accountId+"/queues/"+matches[0].queue_id+"/messages",cloudflareToken,fetchImpl,packet);
  if(accepted?.success!==true)fail("github_ci_enqueue_unconfirmed_no_retry");
  return {source_ref:"github://"+REPO+"/actions/runs/"+runId,
    run_id:runId,run_attempt:runAttempt,
    queue_receipt:"CLOUDFLARE_ACCEPTED_NOT_YET_D1_VERIFIED",
    model_cost_usd:0,automatic_repair_allowed:false};
}
if(process.argv[1]&&import.meta.url==="file://"+new URL("file://"+process.argv[1]).pathname){
  const runId=Number(process.env.HAE_CI_RUN_ID),runAttempt=Number(process.env.HAE_CI_RUN_ATTEMPT);
  let accountId="";
  try{accountId=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8")).account_id;}
  catch{console.error("github_ci_account_config_unavailable");process.exit(1);}
  dispatchGithubCIEvent({runId,runAttempt,accountId,
    githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN})
  .then(result=>console.log(JSON.stringify(result)))
  .catch(error=>{console.error(error.code||"github_ci_source_failed");process.exitCode=1;});
}
