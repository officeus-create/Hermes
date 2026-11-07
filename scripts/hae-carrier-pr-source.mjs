// Read-only authenticated GitHub source adapter for HAE Carrier PR #1908.
// No Queue/D1 write, no commit, no release, no mail, no credential logging.
import {pathToFileURL} from "node:url";
import {buildCarrierPrPilotEvidence} from "../workers/automation-engine/src/carrier-pr-pilot-evidence.mjs";

const REPO="officeus-create/Hermes";
const ROOT="https://api.github.com/repos/"+REPO;
const SHA=/^[a-f0-9]{40}$/;
const WORKFLOWS=new Set([
  "Website checks",
  "Carrier Contract Live Activation",
  "Cloudflare deployment ownership contract",
  "Hermes Connect visual evidence",
  "Open-source web quality audit"
]);
function fail(code){const e=new Error("hae_carrier_source_"+code);e.code="hae_carrier_source_"+code;throw e;}
async function read(endpoint,token,fetchImpl){
  const url=ROOT+endpoint;
  let response;
  try {
    response=await fetchImpl(url,{
      method:"GET",
      headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},
      signal:AbortSignal.timeout(12000)
    });
  } catch { fail("transport_unverified"); }
  if(!response?.ok) fail("github_read_rejected");
  try { return await response.json(); } catch { fail("github_json_invalid"); }
}
function checkConclusion(run){
  if(run.status!=="completed")return "pending";
  return run.conclusion||"pending";
}
export async function readCarrierPrEvidence({githubToken,fetchImpl=fetch,observedAt=new Date().toISOString()}={}){
  if(typeof githubToken!=="string"||githubToken.length<10)fail("token_required");
  const [pr,branch]=await Promise.all([
    read("/pulls/1908",githubToken,fetchImpl),
    read("/branches/main",githubToken,fetchImpl)
  ]);
  const headSha=pr?.head?.sha, baseSha=pr?.base?.sha, mainSha=branch?.commit?.sha;
  if(pr?.number!==1908||pr?.html_url!=="https://github.com/"+REPO+"/pull/1908"||
     pr?.head?.repo?.full_name!==REPO||pr?.base?.repo?.full_name!==REPO||
     !SHA.test(headSha||"")||!SHA.test(baseSha||"")||!SHA.test(mainSha||""))
    fail("pr_or_main_identity_invalid");
  const [compare,workflowResults]=await Promise.all([
    read("/compare/main..."+headSha,githubToken,fetchImpl),
    read("/actions/runs?head_sha="+headSha+"&event=pull_request&per_page=100",githubToken,fetchImpl)
  ]);
  if(compare?.base_commit?.sha!==mainSha||!Array.isArray(workflowResults?.workflow_runs)||
     !Number.isSafeInteger(workflowResults.total_count)||
     workflowResults.total_count>100||
     workflowResults.total_count!==workflowResults.workflow_runs.length)
    fail("source_coverage_incomplete");
  const checksByName=new Map();
  for(const run of workflowResults.workflow_runs){
    if(run?.head_sha!==headSha||run?.repository?.full_name!==REPO)fail("workflow_identity_invalid");
    if(!WORKFLOWS.has(run.name))continue;
    if(!Number.isSafeInteger(run.id)||run.id<1)fail("workflow_identity_invalid");
    const previous=checksByName.get(run.name);
    if(!previous||run.id>previous.id)checksByName.set(run.name,{
      id:run.id,name:run.name,head_sha:headSha,conclusion:checkConclusion(run)
    });
  }
  // Require the two contract checks; unknown/missing checks are never treated as green.
  if(!checksByName.has("Website checks")||!checksByName.has("Carrier Contract Live Activation"))
    fail("critical_ci_coverage_missing");
  const final=[await read("/pulls/1908",githubToken,fetchImpl),await read("/branches/main",githubToken,fetchImpl)];
  if(final[0]?.head?.sha!==headSha||final[0]?.state!==pr.state||
     final[1]?.commit?.sha!==mainSha)
    fail("source_moved_during_read");
  const evidence=buildCarrierPrPilotEvidence({
    observed_at:observedAt,main_sha:mainSha,
    pr:{
      number:pr.number,url:pr.html_url,state:pr.state,draft:pr.draft,
      merged:pr.merged_at!==null&&pr.merged_at!==undefined,
      head_sha:headSha,base_sha:baseSha
    },
    compare:{base:"main",head:headSha,status:compare.status,
      ahead_by:compare.ahead_by,behind_by:compare.behind_by},
    checks:[...checksByName.values()].map(({name,head_sha,conclusion})=>({name,head_sha,conclusion}))
  });
  return Object.freeze({
    ...evidence,
    github_readback:"AUTHENTICATED_SOURCE_ADAPTER",
    github_read_only_requests:6,
    source_identity_rechecked:true,
    producer_credential_emitted:false,
    // This adapter is NOT the HAE production ingress or an independent QA verdict.
    runtime_admission_verified:false
  });
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const evidence=await readCarrierPrEvidence({githubToken:process.env.GITHUB_TOKEN||process.env.GH_TOKEN});
    process.stdout.write(JSON.stringify(evidence)+"\n");
  }catch(e){
    process.stderr.write(String(e?.code||"hae_carrier_source_unverified")+"\n");
    process.exitCode=1;
  }
}
