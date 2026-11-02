#!/usr/bin/env python3
"""Hermes AI read-only HAE GitHub release readiness gate. Public API only.
NO merge, reviews, notifications, branch pushes, deploys, secrets or HAE jobs.
"""
import datetime,hashlib,json,os,pathlib,re,urllib.error,urllib.request
from zoneinfo import ZoneInfo
ROOT=pathlib.Path(__file__).resolve().parent
RUN=ROOT/"viktor_live"/"operations"
API="https://api.github.com/repos/officeus-create/Hermes"
MANIFEST=ROOT/"HERMES_AI_OPERATIONS_MANIFEST.json"
KYIV=ZoneInfo("Europe/Kyiv")
def active_pr_ids():
 try:
  manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
 except (OSError,ValueError):
  return ()
 out=[]
 for task in manifest.get("tasks",[]):
  if task.get("direction")!="HAE" or task.get("can_write") is not False:
   continue
  if task.get("safe_next") not in {"READ_ONLY_GITHUB_REVIEW","REVIEW_EXISTING_PR","READ_ONLY_PR_AND_TESTS"}:
   continue
  m=re.search(r"/pull/(\d+)",str(task.get("evidence","")))
  if not m:
   continue
  n=int(m.group(1))
  if n not in out:
   out.append(n)
 return tuple(out)

def get(path):
 req=urllib.request.Request(API+path,headers={"User-Agent":"HermesAI-ReleaseReadiness/0.1",
  "Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"})
 try:
  with urllib.request.urlopen(req,timeout=12) as r:
   data=json.load(r);remaining=int(r.headers.get("X-RateLimit-Remaining","60"))
   return {"status":"OK","data":data,"remaining":remaining}
 except urllib.error.HTTPError as e:
  return {"status":"ACCESS_GAP","http":e.code}
 except Exception as e:return {"status":"ACCESS_GAP","error":type(e).__name__}
def classify(pr,checks,comparison,reviews):
 if any(x.get("status")!="OK" for x in (checks,comparison,reviews)):
  return ["HOLD_EVIDENCE_ACCESS_GAP"]
 d=pr["data"]
 reasons=[]
 if d.get("state")!="open":return ["CLOSED_NOT_ACTIVE"]
 if d.get("draft"):reasons.append("HOLD_DRAFT")
 if comparison["data"].get("behind_by",0)>0:reasons.append("HOLD_BEHIND_MAIN")
 c=checks["data"].get("check_runs",[])
 if not c:reasons.append("HOLD_NO_CHECK_EVIDENCE")
 if any(x.get("conclusion")!="success" for x in c):reasons.append("HOLD_INCOMPLETE_OR_FAILED_CHECKS")
 approved=[r for r in reviews["data"] if r.get("state")=="APPROVED"]
 if not approved:reasons.append("HOLD_NO_INDEPENDENT_APPROVAL_IN_PUBLIC_REVIEWS")
 # Even zero reasons does not establish security, exact deploy, owner release authorization.
 if not reasons:reasons.append("HOLD_OWNER_RELEASE_GATE")
 return reasons
def inspect(fetch=get,pr_ids=None):
 result=[]
 pr_ids=active_pr_ids() if pr_ids is None else tuple(pr_ids)
 main=fetch("/branches/main")
 if main.get("status")!="OK":return [{"status":"HOLD_MAIN_ACCESS_GAP"}]
 main_sha=main["data"].get("commit",{}).get("sha")
 for number in pr_ids:
  pr=fetch("/pulls/"+str(number))
  if pr.get("status")!="OK":
   result.append({"pr":number,"reasons":["HOLD_PR_ACCESS_GAP"]});continue
  d=pr["data"];head=d.get("head",{}).get("sha","")
  if not head or len(head)!=40:
   result.append({"pr":number,"reasons":["HOLD_MISSING_HEAD_SHA"]});continue
  checks=fetch("/commits/"+head+"/check-runs?per_page=100")
  cmp=fetch("/compare/main..."+head)
  reviews=fetch("/pulls/"+str(number)+"/reviews?per_page=100")
  reasons=classify(pr,checks,cmp,reviews)
  rows=checks.get("data",{}).get("check_runs",[])
  result.append({"pr":number,"head":head,"base_main_sha":main_sha,
    "draft":d.get("draft"),"state":d.get("state"),
    "behind_by":cmp.get("data",{}).get("behind_by") if cmp.get("status")=="OK" else None,
    "ahead_by":cmp.get("data",{}).get("ahead_by") if cmp.get("status")=="OK" else None,
    "checks_seen":len(rows),"checks_pass":sum(x.get("conclusion")=="success" for x in rows),
    "checks_incomplete":sum(x.get("conclusion")!="success" for x in rows),
    "public_review_approvals":sum(x.get("state")=="APPROVED" for x in reviews.get("data",[]) if isinstance(x,dict)),
    "reasons":reasons,"provider_actions":0,
    "next_action":"Read exact-head check evidence, resolve behind/main conflict in existing PR and obtain independent protected-path review. Never auto-merge/deploy."})
 return result
def run_once(force=False):
 now=datetime.datetime.now(KYIV)
 slot="MORNING" if 7<=now.hour<12 else "MIDDAY" if 12<=now.hour<18 else "EVENING" if 18<=now.hour<22 else "MANUAL"
 RUN.mkdir(parents=True,exist_ok=True)
 out=RUN/"last_hae_ci_watch.json"
 if out.exists() and not force:
  try:
   old=json.loads(out.read_text(encoding="utf8"))
   if old["slot"]==slot and datetime.datetime.fromisoformat(old["at"]).date()==now.date():
    return {"status":"SKIPPED_ALREADY_CHECKED_THIS_SLOT","slot":slot}
  except (ValueError,KeyError):pass
 rows=inspect()
 report={"kind":"HERMES_AI_HAE_CI_RELEASE_GATE_SOURCE_ONLY","at":now.isoformat(),"slot":slot,
   "owner":"HAE #2033","pr_evidence":rows,"external_writes":0,
   "release_authorized":False,"one_brain_auto_promotion":False}
 tmp=RUN/"hae_ci_watch.tmp";tmp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8");os.replace(tmp,out)
 return {"status":"READONLY_CHECK_COMPLETED","pr_count":len(rows),
   "holds":sum(len(r.get("reasons",[])) for r in rows),"report":str(out)}
if __name__=="__main__":print(json.dumps(run_once(force=True),ensure_ascii=False))