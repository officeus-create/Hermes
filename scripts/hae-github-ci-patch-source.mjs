// Authenticated GitHub Actions source adapter for one bounded HAE patch proposal.
// It never writes git, deploys, publishes, emails, or calls a model directly.
// It may enqueue exactly one internal patch-proposal message after a persisted HOLD_REPAIR.
import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {githubCIWorkflowIdentityVerified} from "../workers/automation-engine/src/github-ci-workflow-identity.mjs";

const REPO="officeus-create/Hermes";
const API="https://api.cloudflare.com/client/v4";
const UUID=/^[a-f0-9-]{32,36}$/;
const SHA=/^[a-f0-9]{40}$/;
const PATCHABLE_TEST_PATH=/^scripts\/(?:automation-engine|hae)-[a-z0-9][a-z0-9._-]*\.test\.mjs$/;
const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
function fail(code){const error=new Error(code);error.code=code;throw error;}
function clean(value,max=800){
  return typeof value==="string"
    ? value.replace(/[\u0000-\u001f\u007f]+/g," ").replace(/\s+/g," ").trim().slice(0,max)
    : "";
}
async function jsonFetch(url,token,fetchImpl,postBody){
  const options={
    method:postBody===undefined?"GET":"POST",
    headers:{Authorization:"Bearer "+token,Accept:"application/json",...(postBody===undefined?{}:{"Content-Type":"application/json"})},
    ...(postBody===undefined?{}:{body:JSON.stringify(postBody)}),
    signal:AbortSignal.timeout(12000),
  };
  let response;
  try{response=await fetchImpl(url,options);}catch{fail("github_ci_patch_source_transport_ambiguous_no_retry");}
  if(!response?.ok)fail("github_ci_patch_source_http_rejected");
  try{return await response.json();}catch{fail("github_ci_patch_source_json_invalid");}
}
function d1Rows(payload){
  if(payload?.success!==true||!Array.isArray(payload.result)||payload.result.length!==1||
     payload.result[0]?.success===false||!Array.isArray(payload.result[0]?.results))
    fail("github_ci_patch_d1_response_invalid");
  return payload.result[0].results;
}
function safeResult(value){
  if(value==null||value==="")return null;
  try{return JSON.parse(String(value));}catch{fail("github_ci_patch_d1_result_json_invalid");}
}
async function canonicalD1(accountId,token,fetchImpl){
  const pages=await jsonFetch(API+"/accounts/"+accountId+"/pages/projects/hermes",token,fetchImpl);
  if(pages?.success!==true)fail("github_ci_patch_pages_lookup_invalid");
  const binding=pages.result?.deployment_configs?.production?.d1_databases?.DB;
  if(!UUID.test(binding?.id||""))fail("github_ci_patch_d1_id_missing");
  const dbId=binding.id;
  let dbName=binding.database_name||binding.name;
  if(!dbName){
    const detail=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId,token,fetchImpl);
    if(detail?.success!==true||!detail?.result)fail("github_ci_patch_d1_metadata_invalid");
    if(detail.result.uuid&&detail.result.uuid!==dbId)fail("github_ci_patch_d1_metadata_id_mismatch");
    dbName=detail.result.name||detail.result.database_name;
  }
  if(dbName!=="hermes-connect-prototype")fail("github_ci_patch_d1_name_mismatch");
  return dbId;
}
async function d1Query(accountId,dbId,token,fetchImpl,sql,params=[]){
  const payload=await jsonFetch(API+"/accounts/"+accountId+"/d1/database/"+dbId+"/query",token,fetchImpl,{sql,params});
  return d1Rows(payload);
}
function sourceSafe(text){
  return text && Buffer.byteLength(text,"utf8")<=6000 &&
    !/[\0\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text) &&
    !/(?:sk-proj-|ghp_[A-Za-z0-9]{12,}|BEGIN [A-Z ]*PRIVATE KEY|Authorization:\s*Bearer\s+[A-Za-z0-9._-]{12,})/i.test(text);
}
function failureSummary(jobs,workflowName,headSha,artifactKey){
  const parts=[];
  for(const job of Array.isArray(jobs)?jobs:[]){
    if(job?.conclusion!=="failure"&&job?.conclusion!=="timed_out")continue;
    const jobName=clean(job?.name,120);
    const failedSteps=(Array.isArray(job?.steps)?job.steps:[])
      .filter(step=>step?.conclusion==="failure"||step?.conclusion==="timed_out")
      .map(step=>clean(step?.name,120)).filter(Boolean).slice(0,4);
    if(jobName)parts.push(jobName+(failedSteps.length?" -> "+failedSteps.join(", "):""));
    if(parts.length>=4)break;
  }
  const detail=parts.length?parts.join(" | "):"workflow failure metadata has no failed-step detail";
  return clean(
    "Verified "+workflowName+" failure at "+headSha.slice(0,12)+
    " with one patchable test file "+artifactKey+". Failed jobs/steps: "+detail,
    800
  );
}
function decodeGithubFile(payload){
  if(payload?.type!=="file"||payload?.encoding!=="base64"||typeof payload?.content!=="string")
    fail("github_ci_patch_source_file_invalid");
  let bytes;
  try{bytes=Buffer.from(payload.content.replace(/\s+/g,""),"base64");}catch{fail("github_ci_patch_source_file_invalid");}
  if(bytes.length<1||bytes.length>6000) return null;
  const text=bytes.toString("utf8");
  if(Buffer.from(text,"utf8").compare(bytes)!==0||!sourceSafe(text))return null;
  return text;
}

export async function dispatchGithubCIPatchProposal({
  runId,runAttempt,repo=REPO,githubToken,cloudflareToken,accountId,expectedMainSha,
  fetchImpl=fetch,sleepImpl=wait,maxReadbackAttempts=30,
}={}){
  if(repo!==REPO||!Number.isSafeInteger(runId)||runId<=0||
     !Number.isSafeInteger(runAttempt)||runAttempt<=0||
     !githubToken||!cloudflareToken||!UUID.test(accountId||"")||!SHA.test(expectedMainSha||"")||
     !Number.isSafeInteger(maxReadbackAttempts)||maxReadbackAttempts<1||maxReadbackAttempts>60)
    fail("github_ci_patch_source_preflight_invalid");

  const main=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
  if(main?.commit?.sha!==expectedMainSha)fail("github_ci_patch_source_main_moved");

  const run=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId,githubToken,fetchImpl);
  if(run?.id!==runId||run?.run_attempt!==runAttempt||
     run?.repository?.full_name!==REPO||run?.head_repository?.full_name!==REPO||
     !githubCIWorkflowIdentityVerified(run)||run?.status!=="completed"||
     !["failure","timed_out"].includes(run?.conclusion)||!SHA.test(run?.head_sha||"")||
     run?.html_url!=="https://github.com/"+REPO+"/actions/runs/"+runId)
    fail("github_ci_patch_source_run_invalid");

  const settings=await jsonFetch(API+"/accounts/"+accountId+"/workers/scripts/hermes-automation-engine/settings",cloudflareToken,fetchImpl);
  if(settings?.success!==true||!Array.isArray(settings?.result?.bindings))fail("github_ci_patch_worker_settings_invalid");
  const value=(name)=>{
    const binding=settings.result.bindings.find(item=>item?.name===name);
    return binding?.text??binding?.value??null;
  };
  if(value("HERMES_AUTOMATION_SOURCE_SHA")!==expectedMainSha||
     value("HERMES_AUTOMATION_MODE")!=="dry_run"||
     value("HERMES_AUTOMATION_PUBLISH")!=="disabled")
    fail("github_ci_patch_worker_not_exact_dry_run_main");

  const commit=await jsonFetch("https://api.github.com/repos/"+REPO+"/commits/"+run.head_sha,githubToken,fetchImpl);
  if(commit?.sha!==run.head_sha||!Array.isArray(commit.files)||commit.files.length!==1)
    return {status:"SKIPPED_UNPATCHABLE",queue_sent:false,reason:"changed_path_count_not_one",run_id:runId,run_attempt:runAttempt};
  const artifactKey=commit.files[0]?.filename;
  if(typeof artifactKey!=="string"||!PATCHABLE_TEST_PATH.test(artifactKey)||artifactKey.includes(".."))
    return {status:"SKIPPED_UNPATCHABLE",queue_sent:false,reason:"changed_path_not_allowlisted_test",run_id:runId,run_attempt:runAttempt};

  const contentPath=artifactKey.split("/").map(encodeURIComponent).join("/");
  const file=await jsonFetch("https://api.github.com/repos/"+REPO+"/contents/"+contentPath+"?ref="+run.head_sha,githubToken,fetchImpl);
  const sourceExcerpt=decodeGithubFile(file);
  if(!sourceExcerpt)
    return {status:"SKIPPED_SOURCE_UNSAFE_OR_TOO_LARGE",queue_sent:false,reason:"source_excerpt_unavailable",run_id:runId,run_attempt:runAttempt,artifact_key:artifactKey};
  const sourceDigest="sha256:"+createHash("sha256").update(sourceExcerpt,"utf8").digest("hex");

  const jobs=await jsonFetch("https://api.github.com/repos/"+REPO+"/actions/runs/"+runId+"/jobs?per_page=100",githubToken,fetchImpl);
  const summary=failureSummary(jobs?.jobs,run.name,run.head_sha,artifactKey);
  if(summary.length<8)fail("github_ci_patch_failure_summary_missing");

  const findingId="ci-"+runId+"-"+runAttempt+"-"+run.head_sha.slice(0,12);
  const workId="HAE-SELF:"+findingId;
  const dbId=await canonicalD1(accountId,cloudflareToken,fetchImpl);
  const repairKey="hae:followup:self.repair:"+workId;
  const repairSql="SELECT job_id,state,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 2";
  const repairs=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,repairSql,[repairKey]);
  if(repairs.length>1)fail("github_ci_patch_duplicate_repair_jobs");
  const repair=repairs[0]||null;
  if(!repair)fail("github_ci_patch_repair_missing");
  if(repair.state==="FAILED")fail("github_ci_patch_repair_failed");
  if(repair.state!=="SUCCEEDED")fail("github_ci_patch_repair_not_ready");
  const repairPayload=safeResult(repair.payload_json);
  const repairResult=safeResult(repair.result_json);
  if(repairPayload?.work_id!==workId||repairPayload?.finding_id!==findingId||
     repairPayload?.artifact_key!==artifactKey||
     repairResult?.result?.repair_state!=="HOLD_REPAIR"||
     repairResult?.result?.artifact_key!==artifactKey)
    fail("github_ci_patch_repair_contract_mismatch");

  const proposalKey="hae:followup:self.patch.propose:"+workId;
  const proposalSql="SELECT job_id,state,payload_json,result_json,last_error_class FROM hermes_automation_jobs WHERE idempotency_key=? LIMIT 2";
  let proposals=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,proposalSql,[proposalKey]);
  if(proposals.length>1)fail("github_ci_patch_duplicate_proposal_jobs");

  let queueSent=false;
  if(proposals.length===0){
    const mainAgain=await jsonFetch("https://api.github.com/repos/"+REPO+"/branches/main",githubToken,fetchImpl);
    if(mainAgain?.commit?.sha!==expectedMainSha)fail("github_ci_patch_source_main_moved");
    const queues=await jsonFetch(API+"/accounts/"+accountId+"/queues",cloudflareToken,fetchImpl);
    if(queues?.success!==true||!Array.isArray(queues.result))fail("github_ci_patch_queue_inventory_invalid");
    const matches=queues.result.filter(queue=>queue.queue_name==="hermes-automation"&&UUID.test(queue.queue_id||""));
    if(matches.length!==1)fail("github_ci_patch_canonical_queue_missing_or_ambiguous");
    const packet={body:{
      type:"github.ci.patch.propose",
      run_id:runId,
      run_attempt:runAttempt,
      producer_main_sha:expectedMainSha,
      repository:REPO,
      workflow_name:run.name,
      workflow_path:run.path,
      workflow_id:run.workflow_id,
      head_sha:run.head_sha,
      repair_job_id:String(repair.job_id||""),
      work_id:workId,
      finding_id:findingId,
      artifact_key:artifactKey,
      source_excerpt:sourceExcerpt,
      source_excerpt_sha256:sourceDigest,
      failure_summary:summary,
    }};
    const accepted=await jsonFetch(API+"/accounts/"+accountId+"/queues/"+matches[0].queue_id+"/messages",cloudflareToken,fetchImpl,packet);
    if(accepted?.success!==true)fail("github_ci_patch_enqueue_unconfirmed_no_retry");
    queueSent=true;
  }

  for(let attempt=0;attempt<maxReadbackAttempts;attempt+=1){
    proposals=await d1Query(accountId,dbId,cloudflareToken,fetchImpl,proposalSql,[proposalKey]);
    if(proposals.length>1)fail("github_ci_patch_duplicate_proposal_jobs");
    const proposal=proposals[0]||null;
    if(proposal?.state==="FAILED")fail("github_ci_patch_proposal_failed");
    if(proposal?.state==="WAITING_FREE_AI"){
      return {
        status:"WAITING_FREE_AI",queue_sent:queueSent,run_id:runId,run_attempt:runAttempt,
        work_id:workId,repair_job_id:String(repair.job_id||""),proposal_job_id:String(proposal.job_id||""),
        artifact_key:artifactKey,source_excerpt_sha256:sourceDigest,model_cost_usd:0,
        patch_candidate_ready:false,
        automatic_git_write:false,automatic_merge:false,automatic_deploy:false,
      };
    }
    if(proposal?.state==="SUCCEEDED"){
      const proposalPayload=safeResult(proposal.payload_json);
      const parsed=safeResult(proposal.result_json);
      if(parsed?.external_write!==false||
         parsed?.semantic_execution?.cost_usd!==0||
         parsed?.result?.proposal_status!=="HOLD_BOUNDED_REPAIR_PREFLIGHT"||
         parsed?.result?.work_id!==workId||
         parsed?.result?.finding_id!==findingId||
         parsed?.result?.repair_job_id!==String(repair.job_id||"")||
         parsed?.result?.artifact_key!==artifactKey||
         parsed?.result?.base_sha!==run.head_sha||
         parsed?.result?.defect_evidence_ref!==proposalPayload?.defect_evidence_ref||
         parsed?.result?.automatic_git_write!==false||
         parsed?.result?.automatic_merge!==false||
         parsed?.result?.automatic_deploy!==false||
         proposalPayload?.work_id!==workId||
         proposalPayload?.finding_id!==findingId||
         proposalPayload?.repair_job_id!==String(repair.job_id||"")||
         proposalPayload?.artifact_key!==artifactKey||
         proposalPayload?.base_sha!==run.head_sha||
         proposalPayload?.observed_base_sha!==run.head_sha||
         proposalPayload?.source_status!=="HOLD_REPAIR"||
         proposalPayload?.source_coverage_complete!==true||
         proposalPayload?.finding_verified!==true||
         proposalPayload?.writer_state_verified!==true||
         proposalPayload?.writer_active!==false)
        fail("github_ci_patch_proposal_contract_mismatch");
      const executorInput={
        job_type:"hae.self.repair.packet",
        work_id:workId,
        finding_id:findingId,
        source_status:"HOLD_REPAIR",
        source_coverage_complete:true,
        finding_verified:true,
        writer_state_verified:true,
        writer_active:false,
        base_sha:run.head_sha,
        observed_base_sha:run.head_sha,
        artifact_key:artifactKey,
        allowed_paths:[artifactKey],
        diff:parsed.result.diff,
        writer_role:"hermes-automatic-engineer",
        independent_verifier_role:"hermes-qa-evidence-auditor",
        defect_evidence_ref:proposalPayload.defect_evidence_ref,
      };
      if(process.env.RUNNER_TEMP){
        fs.writeFileSync(
          path.join(process.env.RUNNER_TEMP,"hae-ci-patch-candidate.json"),
          JSON.stringify({run_id:runId,run_attempt:runAttempt,proposal_job_id:String(proposal.job_id||""),input:executorInput})+"\n",
          {mode:0o600}
        );
      }
      return {
        status:"HOLD_BOUNDED_REPAIR_PREFLIGHT",queue_sent:queueSent,
        run_id:runId,run_attempt:runAttempt,work_id:workId,
        repair_job_id:String(repair.job_id||""),proposal_job_id:String(proposal.job_id||""),
        artifact_key:artifactKey,source_excerpt_sha256:sourceDigest,
        usage_id:parsed.semantic_execution.usage_id||null,
        model_cost_usd:0,patch_candidate_ready:true,
        automatic_git_write:false,automatic_merge:false,automatic_deploy:false,
      };
    }
    if(attempt+1<maxReadbackAttempts)await sleepImpl(2000);
  }
  fail("github_ci_patch_d1_readback_timeout_no_resend");
}

export async function main(){
  let cfg;
  try{cfg=JSON.parse(fs.readFileSync("workers/lead-email/wrangler.production.jsonc","utf8"));}catch{fail("github_ci_patch_account_config_invalid");}
  if(process.env.RUNNER_TEMP){
    try{fs.rmSync(path.join(process.env.RUNNER_TEMP,"hae-ci-patch-candidate.json"),{force:true});}catch{}
  }
  const result=await dispatchGithubCIPatchProposal({
    runId:Number(process.env.HAE_CI_RUN_ID),
    runAttempt:Number(process.env.HAE_CI_RUN_ATTEMPT),
    accountId:cfg.account_id,
    expectedMainSha:process.env.HAE_CI_EXPECTED_MAIN_SHA,
    githubToken:process.env.GH_TOKEN,
    cloudflareToken:process.env.CLOUDFLARE_HAE_RELEASE_TOKEN,
  });
  const out=JSON.stringify(result,null,2)+"\n";
  if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"hae-ci-patch-source-receipt.json"),out);
  if(process.env.GITHUB_OUTPUT){
    fs.appendFileSync(process.env.GITHUB_OUTPUT,"patch_candidate_ready="+(result.patch_candidate_ready===true?"true":"false")+"\n");
  }
  process.stdout.write(out);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error?.code||"github_ci_patch_source_failed");process.exitCode=1;});
}
