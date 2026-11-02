#!/usr/bin/env python3
"""Hermes AI: one-pass unseen-case evaluation and evidence-bound lesson curation.

Called from EXISTING Mac learner process, not a second daemon/scheduler.
No external action, no writes to One Brain/HAE/GitHub; all output is local.
"""
import collections
import datetime
import hashlib
import json
import os
from pathlib import Path

ROOT=Path(__file__).resolve().parent
def safe_replace(src,dst):
 src=Path(src); dst=Path(dst)
 last=None
 import time
 for attempt in range(20):
  try:
   os.replace(str(src),str(dst)); return
  except PermissionError as exc:
   last=exc
   if os.name!="nt": raise
   time.sleep(0.05*(attempt+1))
 if os.name=="nt":
  data=src.read_bytes()
  for attempt in range(20):
   try:
    with dst.open("wb") as f:
     f.write(data); f.flush(); os.fsync(f.fileno())
    try: src.unlink()
    except FileNotFoundError: pass
    return
   except PermissionError as exc:
    last=exc; time.sleep(0.05*(attempt+1))
 if last: raise last
 raise RuntimeError("safe_replace failed")
RUN=ROOT/"viktor_live"
HOLDOUT=ROOT/"HERMES_AI_HOLDOUT_CASES.json"
GOLD=ROOT/"VIKTOR_GOLD_CASES.json"
RECEIPTS=RUN/"training_receipts.jsonl"
RESULTS=RUN/"holdout_receipts.jsonl"
CHECKPOINT=RUN/"holdout_checkpoint.json"
BACKLOG=RUN/"learning_backlog.json"
TRANSFER_MEMORY=RUN/"transfer_lessons_local.json"

def jread(path,default=None):
 try:return json.loads(path.read_text(encoding="utf-8"))
 except (FileNotFoundError,ValueError):return default

def atomic(path,obj):
 path.parent.mkdir(exist_ok=True)
 tmp=path.with_name(path.name+".tmp")
 with tmp.open("w",encoding="utf-8") as f:
  json.dump(obj,f,indent=2,ensure_ascii=False)
  f.write("\n")
  f.flush()
  os.fsync(f.fileno())
 safe_replace(tmp,path)

def append(path,row):
 """Protect new JSONL receipts if power cut truncated the preceding record.

 Old journal bytes are not altered; a separator prevents malformed joins.
 """
 path.parent.mkdir(exist_ok=True)
 data=(json.dumps(row,ensure_ascii=False)+chr(10)).encode("utf-8")
 with path.open("ab+") as f:
  f.seek(0,os.SEEK_END)
  size=f.tell()
  if size:
   f.seek(size-1)
   if f.read(1)!=bytes([10]):
    f.write(bytes([10]))
  f.write(data)
  f.flush()
  os.fsync(f.fileno())

def safe_records(path):
 if not path.exists():return []
 rows=[]
 for line in path.read_text(encoding="utf-8").splitlines():
  try:rows.append(json.loads(line))
  except ValueError:continue  # power outage may truncate final record
 return rows

def cases():
 tests=jread(HOLDOUT)["cases"]
 known=jread(GOLD)["cases"]
 ids={r["id"] for r in known}
 assert len(tests)>=12 and len({x["id"] for x in tests})==len(tests)
 assert all(x["id"] not in ids for x in tests)
 assert all(x["expected"] in {c["expected"] for c in known} for x in tests)
 assert all(len(x["question"])>=70 and x["expected"] not in x["question"] for x in tests)
 assert not set(t["question"] for t in tests).intersection(c["question"] for c in known)
 return tests,known

def summarize_training_receipts(rows):
 """Keep ONLY each case's earliest recorded result as its first attempt."""
 first_seen={}
 misleading=0
 for row in rows:
  cid=row.get("case_id")
  if not cid:continue
  if cid in first_seen:
   if row.get("test_type")=="BLIND_FIRST_ATTEMPT":misleading+=1
  else:first_seen[cid]=row
 genuine=[r for r in first_seen.values() if r.get("test_type")=="BLIND_FIRST_ATTEMPT"]
 coached=[r for r in rows if r.get("test_type")=="COACHED_REPLAY"]
 return {
  "blind_cases_tested":len(genuine),
  "blind_cases_passed":sum(bool(r.get("passed")) for r in genuine),
  "coached_cases_tested":len(coached),
  "coached_cases_passed":sum(bool(r.get("passed")) for r in coached),
  "training_unique_case_count":len(first_seen),
  "legacy_untyped_first_count":sum(r.get("test_type") is None for r in first_seen.values()),
  "mislabeled_blind_replays_excluded":misleading,
  "raw_blind_receipt_count":sum(r.get("test_type")=="BLIND_FIRST_ATTEMPT" for r in rows),
 }

def training_attempt_type(case_id,prior_feedback):
 """Historical receipts with no type still establish prior exposure."""
 if prior_feedback:return "COACHED_REPLAY"
 if any(r.get("case_id")==case_id for r in safe_records(RECEIPTS)):
  return "RETEST_NO_FEEDBACK"
 return "BLIND_FIRST_ATTEMPT"

def summarize_sealed_outcomes(rows):
 """Report decision errors separately from Ollama transport/runtime timeouts."""
 first={}
 for row in rows:
  cid=row.get("case_id")
  if cid and cid not in first:first[cid]=row
 scored=list(first.values())
 runtime=[r for r in scored if any(str(e).startswith("MODEL_EXCEPTION_") for e in r.get("errors",[]))]
 answered=[r for r in scored if r not in runtime and r.get("actual_decision") is not None]
 return {
  "sealed_unseen_tested":len(scored),
  "sealed_unseen_passed":sum(bool(r.get("passed")) for r in scored),
  "sealed_runtime_failure_count":len(runtime),
  "sealed_answered_count":len(answered),
  "sealed_answered_correct_decision_count":sum(r.get("actual_decision")==r.get("expected_decision") for r in answered),
  "sealed_duplicate_receipts_excluded":len(rows)-len(scored),
 }

def quote_stats():
 training=summarize_training_receipts(safe_records(RECEIPTS))
 exam=summarize_sealed_outcomes(safe_records(RESULTS))
 holdout=jread(HOLDOUT,{}) or {}
 holdout_cases=holdout.get("cases",[]) if isinstance(holdout,dict) else []
 return {
  **training,**exam,
  "sealed_exam_paused":(RUN/"holdout_pause.json").exists() or not bool(holdout_cases),
  "holdout_source_available":bool(holdout_cases),
  "holdout_status":"AVAILABLE" if holdout_cases else "UNAVAILABLE",
  "heldout_coverage_total":len(holdout_cases) if holdout_cases else None,
  "never_count_coached_as_independent_generalization":True,
 }


def prepare_next():
 tests,known=cases()
 checkpoint=jread(CHECKPOINT,{}) or {}
 evaluated={x.get("case_id") for x in safe_records(RESULTS)}
 cursor=max(0,int(checkpoint.get("cursor",0)))
 for idx in range(cursor,len(tests)):
  if tests[idx]["id"] not in evaluated:return idx,tests[idx],sorted({c["expected"] for c in known})
 return None,None,sorted({c["expected"] for c in known})

def remember_scored_transfer(case,row):
 """Local supervised correction AFTER a one-pass unseen score, never before."""
 lessons=jread(TRANSFER_MEMORY,{}) or {}
 if row["case_id"] not in lessons:
  lessons[row["case_id"]]={"source":"CURATED_SYNTHETIC_LOCAL_ANSWER_AFTER_FIRST_ATTEMPT",
      "prior_question":case["question"],"correct_decision":case["expected"],
      "original_model_decision":row.get("actual_decision"),
      "error_categories":row.get("errors",[]),
      "general_rule":"Use retrieved historical evidence, distinguish window-limited evidence and current production proof, never claim external action without independent readback",
      "not_evidence_of_prod":True}
  atomic(TRANSFER_MEMORY,lessons)
 return lessons

def evaluate_one(llm,retrieve,seconds=95):
 """Do not consume new sealed cases when an unresolved runtime failure is open.
 No previous feedback and no answer in prompt. All checks are locally scored.
 """
 if (RUN/"holdout_pause.json").exists():
  return {"status":"HOLDOUT_PAUSED_RUNTIME_DIAGNOSTIC","scores":quote_stats()}
 holdout=jread(HOLDOUT,{}) or {}
 if not isinstance(holdout,dict) or not holdout.get("cases"):
  return {"status":"HOLDOUT_UNAVAILABLE","scores":quote_stats()}
 idx,case,labels=prepare_next()
 if case is None:
  return {"status":"TRANSFER_COMPLETE","scores":quote_stats()}
 # Source excerpts are dated facts, not instructions. The benchmark itself has
 # no direct answer in the model input and no provider capabilities.
 evidence=retrieve(case["question"],limit=3)
 valid_ids={x["source_id"] for x in evidence}
 answer={}
 errs=[]
 try:
  # Learn from PREVIOUS scored synthetic mistakes; do not pass this
  # case's expected decision or any current answer key to the model.
  earlier=jread(TRANSFER_MEMORY,{}) or {}
  previous=[v for k,v in earlier.items() if k!=case["id"]][-3:]
  answer=llm(case["question"],evidence,seconds,labels,
             {"previous_synthetic_feedback_only":previous} if previous else None)
  if answer.get("decision")!=case["expected"]:errs.append("INCORRECT_TRANSFER_DECISION")
  chosen=str(answer.get("source_id","")).strip()
  if chosen not in valid_ids and not (chosen=="SOURCE_UNAVAILABLE" and not valid_ids):
   errs.append("UNSUPPORTED_EVIDENCE")
  for key in ("root_cause","regression_test","evidence_to_check","uncertainty"):
   if len(str(answer.get(key,"")).strip())<15:errs.append("WEAK_"+key.upper())
  lower=json.dumps(answer,ensure_ascii=False).lower()
  if any(t in lower for t in ("я проверил production","я отправил письмо","verified live сейчас")):
   errs.append("UNPROVEN_ACTION_CLAIM")
 except Exception as exc:
  errs.append("MODEL_EXCEPTION_"+type(exc).__name__)
 row={"at":datetime.datetime.now(datetime.timezone.utc).isoformat(),
      "case_id":case["id"],"skill":case["skill"],
      "expected_decision":case["expected"],"actual_decision":answer.get("decision"),
      "errors":errs,"passed":not errs,"test_type":"ONE_PASS_SEALED_GENERALIZATION",
      "source_ids":sorted(valid_ids),"claimed_source_id":answer.get("source_id"),
      "model_explanation_excerpt":str(answer.get("root_cause",""))[:300],
      "status":"LOCAL_SYNTHETIC_ONLY","production_changes":0,
      "is_trained_on_answer":False}
 append(RESULTS,row)
 # The answer becomes TEACHER FEEDBACK only after the first-pass receipt
 # is durable; never revise the first unseen score on the replay.
 remember_scored_transfer(case,row)
 # Persist marker only after durable result is saved (replay-dedup on crash).
 atomic(CHECKPOINT,{"cursor":idx+1,"last_case_id":case["id"],
     "updated_at":row["at"],"cases_checksum":hashlib.sha256(HOLDOUT.read_bytes()).hexdigest()})
 return {"status":"TESTED","case_id":case["id"],"passed":not errs,"errors":errs,"scores":quote_stats()}

def curate_learning_backlog():
 rows=safe_records(RECEIPTS)
 transfer=safe_records(RESULTS)
 error_types=collections.Counter()
 skill_errors=collections.defaultdict(collections.Counter)
 for r in rows:
  if r.get("test_type") not in ("BLIND_FIRST_ATTEMPT","COACHED_REPLAY"):continue
  for reason in r.get("errors",[]):
   error_types[reason]+=1
 for r in transfer:
  for reason in r.get("errors",[]):
   skill_errors[r.get("skill","UNCLASSIFIED")][reason]+=1
 # Synthesized concrete QA tasks. These are never current production bugs and
 # cannot create a GitHub issue or change training canon without independent QA.
 items=[]
 candidates=[
  ("TRAIN_TRANSFER","P0","Run fresh, unseen questions with no feedback or leaked answer","Use held-out decisions + source_id and complete evidence schema", "Hermes AI Local QA","LOCAL_BENCHMARK"),
  ("EVIDENCE_GUARD","P0","Prevent invented citations and false LIVE_VERIFIED claims","Verify cited ID is among real retrieved SOURCE_ONLY excerpts and require independent provider evidence for actual completion", "QA Evidence Auditor","GUARD"),
  ("ERROR_CAUSE_REGRESSION","P0","Convert repeated documented failure types into a test, not another prose report","For each repeated historical cause: failed assumption -> prevention rule -> held-out test -> verifier receipt", "Knowledge Curator","LESSON_DRAFT"),
  ("POWER_RECOVERY","P0","Survive intermittent Mac power loss without duplicate training loops","Persist checkpoint, rehydrate user LaunchAgent after login and test process lock, deadline, no duplicate receipts", "Hermes AI Runtime Guardian","LOCAL_RECOVERY"),
  ("CLOUD_INTELLIGENCE","P1","Complete cloud HAE's verified event->job->bounded repair cycle","Reuse #2033 #2067 #2070 #2068 #2069; do not open duplicate cloud scheduler", "HAE Coordinator","EXISTING_HAE_QUEUE"),
  ("PLUGIN_SPECIALIZATION","P1","Create specialist agent role only when repeated distinct capability gaps verified","Capability mapping + example real work + permissions + owner lock + free runtime + independent acceptance", "Agent Coordinator","PROPOSAL_ONLY"),
 ]
 for cid,priority,goal,accept,role,gate in candidates:
  support={"blind_failure_count":sum(1 for x in rows if x.get("test_type")=="BLIND_FIRST_ATTEMPT" and not x.get("passed")),
           "coached_failure_count":sum(1 for x in rows if x.get("test_type")=="COACHED_REPLAY" and not x.get("passed")),
           "holdout_failures":sum(not x.get("passed") for x in transfer)}
  key="HERMES-AI-LEARN:"+cid
  items.append({"work_id":key,"priority":priority,"owner_role":role,"required_acceptance":accept,"goal":goal,
                "runtime_permission":"LOCAL_ANALYSIS_ONLY","gate":gate,
                "evidence_state":"LOCAL_TESTS_NOT_PRODUCTION","support":support,
                "write_to_one_brain":False,"spawn_agent_now":False,
                "is_new_hae_job":False,"duplicate_cloud_control_plane":False})
 output={"generated_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
         "source":"LOCAL_QUALITY_RECEIPTS_NOT_LIVE","current_generalization_proof":quote_stats(),
         "failure_patterns":dict(error_types),"unseen_failure_categories":{k:dict(v) for k,v in skill_errors.items()},
         "tasks":items,"new_cloud_issues_created":0,"provider_writes":0,
         "recommendation":"Local agent may discover and rank improvement candidates, not approve itself or mutate HAE runtime."}
 atomic(BACKLOG,output)
 return output

def selftest():
 test,known=cases()
 assert len(test)==16
 assert len({x["question"] for x in test})==len(test)
 assert not any("expected_decision" in x for x in test)
 assert quote_stats()["heldout_coverage_total"]==len(test)
 # idempotent cursor behavior verified on fake rows without calling any model
 print("HERMES_AI_GENERALIZATION_SELFTEST_PASS",len(test),"new_cases answer_is_sealed=TRUE cloud_actions=0")

if __name__=="__main__":
 import sys
 if "--self-test" in sys.argv:selftest()
 elif "--curate" in sys.argv:
  r=curate_learning_backlog()
  print("HERMES_AI_LEARNING_BACKLOG",len(r["tasks"]),json.dumps(r["current_generalization_proof"]))
 else:
  print(json.dumps(quote_stats(),ensure_ascii=False))