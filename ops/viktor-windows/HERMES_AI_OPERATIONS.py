#!/usr/bin/env python3
"""Hermes AI: read-only work proposals for existing HAE; no second scheduler."""
import argparse, datetime, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parent
RUN=ROOT/"viktor_live"
FILE=ROOT/"HERMES_AI_OPERATIONS_MANIFEST.json"
REPORT=RUN/"hermes_ai_operations_report.json"
RECEIPTS=RUN/"operations"/"task_receipts.jsonl"
ALLOWED={"READ_ONLY_GITHUB_REVIEW","REVIEW_EXISTING_PR","READ_ONLY_PR_AND_TESTS","WRITE_TEST_CASES_PROPOSAL","OFFLINE_HISTORICAL_REPLAY","VERIFY_DNS_AND_REQUIRED_ACCESS_CONFIG","READ_ONLY_LIVE_WORKFLOW_REVIEW","READ_ONLY_SEARCH_EVIDENCE","READ_ONLY_PIPELINE_AUDIT","READ_ONLY_LEARNER_FUNNEL_AUDIT","READ_ONLY_CAPABILITY_REGISTRY","EVENT_TRIGGER_ONLY"}
def load():return json.loads(FILE.read_text(encoding="utf-8"))
def validate(x):
 assert x["product_name"]=="Hermes AI"
 assert x["operating_constraints"]["paid_model_usd"]==0
 for k,v in x["operating_constraints"].items():
  if k.startswith("can_"):assert v is False,(k,v)
 ids=set()
 for item in x["tasks"]:
  assert item["id"] not in ids and item["can_write"] is False
  assert item["safe_next"] in ALLOWED
  ids.add(item["id"])
 assert all(set(t["dependency"])<=ids for t in x["tasks"])
def latest_readbacks():
 out={}
 try:
  lines=RECEIPTS.read_text(encoding="utf-8").splitlines()
 except OSError:
  return out
 for line in lines:
  try: row=json.loads(line)
  except ValueError: continue
  task_id=row.get("task_id")
  result=row.get("result") or {}
  if not task_id or not isinstance(result,dict): continue
  out[task_id]={
   "at":row.get("at"),
   "status":result.get("status"),
   "issue":row.get("issue"),
   "external_actions":row.get("external_actions",0),
   "provider_writes":row.get("provider_writes",0),
   "production_mutations":row.get("production_mutations",0),
   "one_brain_writes":row.get("one_brain_writes",0),
  }
 return out

def quality():
 from hermes_ai_self_learning import summarize_training_receipts, safe_records
 rows=safe_records(RUN/"training_receipts.jsonl")
 s=summarize_training_receipts(rows)
 return {
  "all_attempts":len(rows),
  "blind_tests":s["blind_cases_tested"],
  "blind_pass":s["blind_cases_passed"],
  "coached_tests":s["coached_cases_tested"],
  "coached_pass":s["coached_cases_passed"],
  "mislabeled_blind_replays_excluded":s["mislabeled_blind_replays_excluded"],
  "legacy_untyped_first_count":s["legacy_untyped_first_count"],
  "unique_training_cases":s["training_unique_case_count"],
  "independent_model_accuracy_proven":False,
 }

def plan(x,now=None):
 now=now or datetime.datetime.now(datetime.timezone.utc)
 stamp=datetime.datetime.fromisoformat(x["updated_at"]).astimezone(datetime.timezone.utc)
 stale=now-stamp>datetime.timedelta(hours=6)
 rows=[]
 readbacks=latest_readbacks()
 for t in x["tasks"]:
  rb=readbacks.get(t["id"])
  reason="SNAPSHOT_STALE" if stale else ("DEPENDENCIES_NOT_VERIFIED" if t["dependency"] else ("SOURCE_CHECKED_READ_ONLY" if rb else "READ_ONLY_OWNER_GATE"))
  row={"id":t["id"],"issue":t["issue"],"priority":t["priority"],"direction":t["direction"],"role":t["role"],"owner":t["owner"],"artifact":t["artifact"],"phase":t["phase"],"gate":t["gate"],"depends_on":t["dependency"],"reason":reason,"safe_next":t["safe_next"],"required_proof":t["required"],"source":t["evidence"],"last_readback_at":rb.get("at") if rb else None,"last_readback_status":rb.get("status") if rb else None,"execution_allowed":False,"canonical_new_issue_needed":False}
  if "canonical_program" in t:row["canonical_program"]=t["canonical_program"]
  rows.append(row)
 rows.sort(key=lambda t:(t["priority"],len(t["depends_on"]),t["id"]))
 return {"name":"Hermes AI","authority":"SOURCE_ONLY","canonical_scheduler":"existing HAE","reviewed_at":x["updated_at"],"stale":stale,"task_count":len(rows),"tasks":rows,"completed_evidence":x.get("completed_evidence",[]),"quality":quality(),"provider_changes":0}
def selftest(x):
 from copy import deepcopy
 validate(x)
 p=plan(x,datetime.datetime.fromisoformat(x["updated_at"]))
 assert len(p["tasks"])==len(x["tasks"]) and not p["stale"]
 assert len(set(t["id"] for t in p["tasks"]))==len(x["tasks"])
 assert all(not t["execution_allowed"] for t in p["tasks"])
 assert all("last_readback_at" in t and "last_readback_status" in t for t in p["tasks"])
 assert all((t["last_readback_status"] is None) or isinstance(t["last_readback_status"],str) for t in p["tasks"])
 t=plan(x,datetime.datetime.fromisoformat(x["updated_at"])+datetime.timedelta(days=1))
 assert t["stale"] and all(r["reason"]=="SNAPSHOT_STALE" for r in t["tasks"])
 bad=deepcopy(x);bad["tasks"][0]["can_write"]=True
 try:validate(bad);raise RuntimeError("unsafe plan accepted")
 except AssertionError:pass
 bad=deepcopy(x);bad["tasks"][0]["safe_next"]="SEND"
 try:validate(bad);raise RuntimeError("unsafe tool accepted")
 except AssertionError:pass
 assert quality()["independent_model_accuracy_proven"] is False
 print("HERMES_AI_ROUTING_REGRESSION_PASS 7/7; proposals_only; cost=0")
def main():
 parser=argparse.ArgumentParser();parser.add_argument("--self-test",action="store_true");parser.add_argument("--report",action="store_true");a=parser.parse_args()
 x=load();validate(x)
 if a.self_test:selftest(x)
 if a.report:
  data=plan(x);RUN.mkdir(exist_ok=True);tmp=REPORT.with_suffix(".tmp")
  tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8");tmp.replace(REPORT)
  print("HERMES_AI_PLAN_SAVED",len(data["tasks"]),"tasks","0 external actions")
if __name__=="__main__":main()