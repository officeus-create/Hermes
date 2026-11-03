#!/usr/bin/env python3
"""Bounded read-only executor for the existing Hermes AI worker."""
import argparse
import datetime
import json
import pathlib
import re
import subprocess
import sys
import urllib.parse
import urllib.request
import urllib.error

ROOT=pathlib.Path(__file__).resolve().parent
RUN=ROOT/"viktor_live"
OPS=RUN/"operations"
MANIFEST=ROOT/"HERMES_AI_OPERATIONS_MANIFEST.json"
PLUGIN_INVENTORY_CURRENT=ROOT/"HERMES_PRIVATE_PLUGIN_INVENTORY_CURRENT.json"
STATE=OPS/"task_executor_state.json"
RECEIPTS=OPS/"task_receipts.jsonl"
GITHUB_CACHE=OPS/"github_read_cache.json"
HTTP_META={}
SAFE_ACTIONS={
 "READ_ONLY_GITHUB_REVIEW","REVIEW_EXISTING_PR","READ_ONLY_PR_AND_TESTS",
 "WRITE_TEST_CASES_PROPOSAL","OFFLINE_HISTORICAL_REPLAY",
 "VERIFY_DNS_AND_REQUIRED_ACCESS_CONFIG","READ_ONLY_LIVE_WORKFLOW_REVIEW",
 "READ_ONLY_SEARCH_EVIDENCE","READ_ONLY_PIPELINE_AUDIT",
 "READ_ONLY_LEARNER_FUNNEL_AUDIT","READ_ONLY_CAPABILITY_REGISTRY",
 "EVENT_TRIGGER_ONLY","LOCAL_WORK_CONTRACT_SELFTEST","LOCAL_DASHBOARD_AUDIT"
}
DEPENDENCY_OBSERVE_ACTIONS={
 "READ_ONLY_GITHUB_REVIEW","REVIEW_EXISTING_PR","READ_ONLY_PR_AND_TESTS"
}
REPO="officeus-create/Hermes"

def stamp():
 return datetime.datetime.now(datetime.timezone.utc).isoformat()

def load_json(path,default):
 try:return json.loads(path.read_text(encoding="utf-8-sig"))
 except (OSError,ValueError):return default

def save_json(path,data):
 path.parent.mkdir(parents=True,exist_ok=True)
 tmp=path.with_suffix(path.suffix+".tmp")
 tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 tmp.replace(path)

def append_jsonl(path,row):
 path.parent.mkdir(parents=True,exist_ok=True)
 with path.open("a",encoding="utf-8") as f:f.write(json.dumps(row,ensure_ascii=False)+"\n")

def _cache_age_seconds(fetched_at):
 try:
  dt=datetime.datetime.fromisoformat(str(fetched_at).replace("Z","+00:00"))
  if dt.tzinfo is None:dt=dt.replace(tzinfo=datetime.timezone.utc)
  return max(0,int((datetime.datetime.now(datetime.timezone.utc)-dt).total_seconds()))
 except (TypeError,ValueError):
  return None

def _github_cache():
 data=load_json(GITHUB_CACHE,{"entries":{}})
 if not isinstance(data,dict):data={"entries":{}}
 if not isinstance(data.get("entries"),dict):data["entries"]={}
 return data

def _save_github_cache(data):
 entries=data.get("entries") or {}
 ranked=sorted(entries.items(),key=lambda item:str((item[1] or {}).get("fetched_at") or ""),reverse=True)[:100]
 save_json(GITHUB_CACHE,{"version":1,"entries":dict(ranked),"updated_at":stamp()})

def http_json(url,ttl_seconds=600):
 cache=_github_cache();entry=(cache.get("entries") or {}).get(url) or {}
 age=_cache_age_seconds(entry.get("fetched_at"))
 if entry.get("payload") is not None and age is not None and age<=ttl_seconds:
  HTTP_META[url]={"state":"FRESH_CACHE","age_seconds":age}
  return entry["payload"]
 req=urllib.request.Request(url,headers={"Accept":"application/vnd.github+json","User-Agent":"HermesAI-ReadOnly-Executor"})
 try:
  with urllib.request.urlopen(req,timeout=12) as r:
   payload=json.load(r)
  cache["entries"][url]={"fetched_at":stamp(),"payload":payload}
  _save_github_cache(cache)
  HTTP_META[url]={"state":"LIVE_READBACK","age_seconds":0}
  return payload
 except urllib.error.HTTPError as exc:
  is_rate_limit=exc.code==403
  if is_rate_limit and entry.get("payload") is not None:
   HTTP_META[url]={"state":"STALE_RATE_LIMIT_FALLBACK","age_seconds":age}
   return entry["payload"]
  HTTP_META[url]={"state":"RATE_LIMITED" if is_rate_limit else "HTTP_ERROR","http_status":exc.code,"age_seconds":age}
  return {"_error":"HTTPError","_message":("rate limit exceeded" if is_rate_limit else str(exc)[:240]),"_rate_limited":is_rate_limit}
 except Exception as exc:
  if entry.get("payload") is not None:
   HTTP_META[url]={"state":"STALE_TRANSPORT_FALLBACK","age_seconds":age,"error":type(exc).__name__}
   return entry["payload"]
  HTTP_META[url]={"state":"TRANSPORT_ERROR","error":type(exc).__name__}
  return {"_error":type(exc).__name__,"_message":str(exc)[:240]}

def cache_truth(urls):
 states=[HTTP_META.get(url) or {} for url in urls]
 stale=[s for s in states if str(s.get("state","")).startswith("STALE_")]
 limited=[s for s in states if s.get("state")=="RATE_LIMITED"]
 ages=[int(s["age_seconds"]) for s in states if isinstance(s.get("age_seconds"),int)]
 return {"states":states,"stale":bool(stale),"rate_limited":bool(limited),"max_age_seconds":max(ages) if ages else 0}

def pr_number(task):
 m=re.search(r"/pull/(\d+)",str(task.get("evidence","")))
 return int(m.group(1)) if m else None

def issue_number(task):
 n=task.get("issue")
 return int(n) if isinstance(n,int) or (isinstance(n,str) and n.isdigit()) else None

def plugin_use_receipt(task):
 inventory=load_json(ROOT/"HERMES_PRIVATE_PLUGIN_INVENTORY_20261028.json",{})
 registry=load_json(ROOT/"skill_registry_v4.json",{})
 by_name={str(p.get("name")):p for p in inventory.get("plugins",[]) if isinstance(p,dict)}
 skill_ids={str(x.get("id")) for x in registry.get("skills",[]) if isinstance(x,dict)}
 routes=list(task.get("plugin_route") or [])
 if not routes:
  return {"status":"NO_PLUGIN_ROUTE_DECLARED","plugin_execution_claimed":False}
 selected=[]; version_drift=False; projected=0; projection_missing=False
 for route in routes:
  name=str(route.get("plugin") or "")
  declared=str(route.get("version") or "")
  current=by_name.get(name) or {}
  current_version=str(current.get("version") or "")
  projection=str(route.get("local_skill_projection") or "")
  projection_present=bool(projection and projection in skill_ids)
  if declared!=current_version or not current_version:version_drift=True
  if projection:
   projected+=1
   if not projection_present:projection_missing=True
  selected.append({"plugin":name,"declared_version":declared,"current_version":current_version,
                   "release_id":current.get("current_release_id"),"version_match":declared==current_version and bool(current_version),
                   "local_skill_projection":projection or None,"projection_present":projection_present})
 if version_drift:status="PLUGIN_VERSION_DRIFT"
 elif projection_missing:status="PLUGIN_PROJECTION_MISSING"
 elif projected==len(routes):status="SKILL_APPLIED_LOCAL_PROJECTION"
 elif projected>0:status="PLUGIN_ROUTE_WITH_PARTIAL_LOCAL_PROJECTION"
 else:status="PLUGIN_ROUTE_SELECTED"
 return {"status":status,"inventory_observed_at":inventory.get("observed_at"),"registry_version":registry.get("version"),
         "selected":selected,"plugin_execution_claimed":False,
         "meaning":"Local VIKTOR applied versioned plugin knowledge projections; this is not a ChatGPT plugin runtime execution receipt."}

def github_pr_audit(task):
 n=pr_number(task)
 if not n:return {"status":"NO_PR_REFERENCE"}
 used_urls=[]
 def get(url,ttl=600):
  used_urls.append(url)
  return http_json(url,ttl)
 pr=get(f"https://api.github.com/repos/{REPO}/pulls/{n}",300)
 if pr.get("_error"):
  truth=cache_truth(used_urls)
  return {"status":"SOURCE_RATE_LIMITED" if truth["rate_limited"] else "SOURCE_ERROR","source":"github_pr","detail":pr,
          "release_allowed":False,"source_cache_state":truth}
 initial_truth=cache_truth(used_urls)
 if initial_truth["stale"]:
  return {"status":"SOURCE_RATE_LIMITED_STALE_CACHE","source":"github_pr","pr":n,"release_allowed":False,
          "canonical_next":"WAIT_SOURCE_REFRESH_OR_AUTHENTICATED_READBACK","source_cache_state":initial_truth}
 head=((pr.get("head") or {}).get("sha") or "")
 state=pr.get("state")
 # Terminal PR state is source evidence only; old green CI must never make a closed PR look active.
 if state=="closed":
  merged=bool(pr.get("merged_at"))
  return {"status":"CLOSED_MERGED_SOURCE_ONLY" if merged else "CLOSED_UNMERGED_SOURCE_ONLY",
          "pr":n,"state":"closed","head_sha":head or None,"release_allowed":False,
          "canonical_next":"READ_ONLY_CANONICAL_ISSUE_RECONCILIATION",
          "provider_writes":0,"autonomous_reopen":False}
 if state!="open" or not head:
  return {"status":"PR_STATE_UNVERIFIED","pr":n,"state":state,"head_sha":head or None,
          "release_allowed":False,"canonical_next":"READ_ONLY_SOURCE_RECHECK"}
 q=urllib.parse.urlencode({"head_sha":head,"event":"pull_request","per_page":100})
 runs=get(f"https://api.github.com/repos/{REPO}/actions/runs?{q}",300)
 workflows=[]
 for x in runs.get("workflow_runs",[]) if isinstance(runs,dict) else []:
  if x.get("head_sha")!=head:continue
  workflows.append({"id":x.get("id"),"name":x.get("name"),"status":x.get("status"),"conclusion":x.get("conclusion")})
 pending=[x for x in workflows if x["status"]!="completed"]
 failed=[x for x in workflows if x["status"]=="completed" and x["conclusion"] not in ("success","skipped","neutral")]
 base_ref=str((pr.get("base") or {}).get("ref") or "main")
 base_branch=get(f"https://api.github.com/repos/{REPO}/branches/{urllib.parse.quote(base_ref,safe='')}",300)
 current_base_sha=str((((base_branch or {}).get("commit") or {}).get("sha") or ""))
 compare={}
 if current_base_sha:
  compare=get(f"https://api.github.com/repos/{REPO}/compare/{head}...{current_base_sha}",300)
 compare_status=str(compare.get("status") or "") if isinstance(compare,dict) else ""
 main_ahead_by=int(compare.get("ahead_by") or 0) if isinstance(compare,dict) and not compare.get("_error") else None
 main_behind_by=int(compare.get("behind_by") or 0) if isinstance(compare,dict) and not compare.get("_error") else None
 base_sync_required=bool(current_base_sha and main_ahead_by and main_ahead_by>0)
 merge_base_sha=str((((compare or {}).get("merge_base_commit") or {}).get("sha") or ""))
 pr_paths=[];main_delta_paths=[];overlap_paths=[];path_overlap_verified=False
 if base_sync_required and merge_base_sha:
  pr_files=get(f"https://api.github.com/repos/{REPO}/pulls/{n}/files?per_page=100",900)
  main_delta=get(f"https://api.github.com/repos/{REPO}/compare/{merge_base_sha}...{current_base_sha}",900)
  if isinstance(pr_files,list) and isinstance(main_delta,dict) and not main_delta.get("_error"):
   pr_paths=sorted({str(x.get("filename")) for x in pr_files if (x or {}).get("filename")})
   main_delta_paths=sorted({str(x.get("filename")) for x in (main_delta.get("files") or []) if (x or {}).get("filename")})
   overlap_paths=sorted(set(pr_paths)&set(main_delta_paths))
   path_overlap_verified=True
 reviews=get(f"https://api.github.com/repos/{REPO}/pulls/{n}/reviews",300)
 requested=[str((x or {}).get("login") or "") for x in (pr.get("requested_reviewers") or []) if (x or {}).get("login")]
 author=str(((pr.get("user") or {}).get("login") or ""))
 latest={}
 if isinstance(reviews,list):
  for row in reviews:
   login=str((((row or {}).get("user") or {}).get("login") or ""))
   state=str((row or {}).get("state") or "").upper()
   if login and login!=author and state in {"APPROVED","CHANGES_REQUESTED","DISMISSED"}: latest[login]=state
 approved=sorted(login for login,state in latest.items() if state=="APPROVED")
 changes=sorted(login for login,state in latest.items() if state=="CHANGES_REQUESTED")
 if failed:status="CI_FAILED_EXACT_HEAD"
 elif pending:status="CI_PENDING_EXACT_HEAD"
 elif workflows and base_sync_required and not path_overlap_verified:status="CI_GREEN_RECONCILE_UNVERIFIED"
 elif workflows and base_sync_required and overlap_paths:status="CI_GREEN_RECONCILE_REQUIRED"
 elif workflows and base_sync_required:status="CI_GREEN_SAFE_REPLAY_CANDIDATE"
 elif workflows and changes:status="CI_GREEN_CHANGES_REQUESTED"
 elif workflows and approved:status="CI_GREEN_REVIEW_APPROVED"
 elif workflows:status="CI_GREEN_REVIEW_PENDING"
 else:status="NO_PULL_REQUEST_WORKFLOWS"
 truth=cache_truth(used_urls)
 if truth["stale"]:
  status="SOURCE_RATE_LIMITED_STALE_CACHE"
 return {"status":status,"pr":n,"state":pr.get("state"),"draft":pr.get("draft"),"mergeable":pr.get("mergeable"),"mergeable_state":pr.get("mergeable_state"),
         "head_sha":head,"base_ref":base_ref,"current_base_sha":current_base_sha or None,"merge_base_sha":merge_base_sha or None,
         "base_compare_status":compare_status or None,"main_ahead_of_pr_by":main_ahead_by,"main_behind_pr_by":main_behind_by,
         "base_sync_required":base_sync_required,"path_overlap_verified":path_overlap_verified,
         "pr_file_count":len(pr_paths),"main_delta_file_count":len(main_delta_paths),"overlap_paths":overlap_paths,
         "stale_delta_class":("OVERLAP_RECONCILE" if overlap_paths else "NON_OVERLAP_REPLAY" if base_sync_required and path_overlap_verified else "UNVERIFIED" if base_sync_required else "CURRENT_BASE"),
         "workflow_count":len(workflows),"workflows":workflows,"requested_reviewers":requested,
         "independent_review_approved":bool(approved) if not truth["stale"] else False,
         "approved_by":approved if not truth["stale"] else [],"changes_requested_by":changes,
         "release_allowed":False if truth["stale"] else None,
         "source_cache_state":truth,
         "canonical_next":"WAIT_SOURCE_REFRESH_OR_AUTHENTICATED_READBACK" if truth["stale"] else None}

def github_issue_audit(task):
 n=issue_number(task)
 if not n:return {"status":"NO_ISSUE_REFERENCE"}
 url=f"https://api.github.com/repos/{REPO}/issues/{n}"
 d=http_json(url,600)
 truth=cache_truth([url])
 if d.get("_error"):
  return {"status":"SOURCE_RATE_LIMITED" if truth["rate_limited"] else "SOURCE_ERROR","source":"github_issue","detail":d,
          "source_cache_state":truth}
 if truth["stale"]:
  return {"status":"SOURCE_RATE_LIMITED_STALE_CACHE","issue":n,"state":d.get("state"),"title":d.get("title"),
          "updated_at":d.get("updated_at"),"release_allowed":False,
          "canonical_next":"WAIT_SOURCE_REFRESH_OR_AUTHENTICATED_READBACK","source_cache_state":truth}
 return {"status":"READ_ONLY_SOURCE_REVIEWED","issue":n,"state":d.get("state"),"title":d.get("title"),"updated_at":d.get("updated_at"),
         "source_cache_state":truth}

def local_dashboard_audit():
 path=ROOT/"viktor_dashboard.html"
 if not path.is_file():return {"status":"LOCAL_UI_MISSING","external_actions":0}
 html=path.read_text(encoding="utf-8",errors="replace")
 findings=[]
 if "viewport" not in html:findings.append("MISSING_RESPONSIVE_VIEWPORT")
 for endpoint in ("/api/status","/api/operations","/api/chat"):
  if endpoint not in html:findings.append("MISSING_BINDING_"+endpoint.replace("/","_").upper())
 quick=html.count("data-prompt=")
 if quick<5:findings.append("TOO_FEW_QUICK_ACTIONS")
 stale=[]
 for phrase in ("только к Ollama на Mac","только этот Mac","HAE: текущие CI и отставание PR #2090/#2085"):
  if phrase in html:stale.append(phrase)
 if stale:findings.append("STALE_MAC_OR_HISTORICAL_COPY")
 nav_divs=html.count('<div class="nav')
 interactive_nav=html.count('<button class="nav')+html.count('data-nav=')
 if nav_divs>1 and interactive_nav==0:findings.append("NAV_ITEMS_NONINTERACTIVE")
 http=0
 try:
  with urllib.request.urlopen("http://127.0.0.1:8765/ai-agents/",timeout=4) as response:http=int(response.status)
 except Exception:http=0
 return {"status":"PASS" if not findings and http==200 else "REVIEW_REQUIRED",
         "dashboard_http":http,"quick_actions":quick,"findings":findings,
         "stale_copy":stale,"external_actions":0,"provider_writes":0,
         "next_action":"Fix local-only UI defects, then rerun audit; no production write."}

def execute(task,dependency_pending=False):
 action=task.get("safe_next")
 if action not in SAFE_ACTIONS:return {"status":"DENY_UNKNOWN_ACTION","action":action}
 if task.get("can_write") is not False:return {"status":"DENY_WRITE_CAPABILITY","action":action}
 if dependency_pending and action not in DEPENDENCY_OBSERVE_ACTIONS:
  return {"status":"DEPENDENCY_GATE_WAIT","action":action,"depends_on":list(task.get("dependency") or []),"external_actions":0}
 if action=="LOCAL_DASHBOARD_AUDIT":
  return local_dashboard_audit()
 if action in {"READ_ONLY_GITHUB_REVIEW","REVIEW_EXISTING_PR","READ_ONLY_PR_AND_TESTS"}:
  return github_pr_audit(task)
 if action=="VERIFY_DNS_AND_REQUIRED_ACCESS_CONFIG":
  access_python=ROOT/".venv_access"/"Scripts"/"python.exe"
  if not access_python.is_file():
   return {"status":"ACCESS_PREFLIGHT_ENV_MISSING","release_allowed":False}
  p=subprocess.run([str(access_python),str(ROOT/"hermes_ai_access_preflight.py")],cwd=str(ROOT),capture_output=True,text=True,timeout=20)
  if p.returncode!=0:
   return {"status":"ACCESS_PREFLIGHT_FAILED","release_allowed":False,"stderr":p.stderr[-500:]}
  try:d=json.loads(p.stdout)
  except ValueError:return {"status":"ACCESS_PREFLIGHT_INVALID_JSON","release_allowed":False}
  return {"status":"ACCESS_PREFLIGHT_COMPLETE","release_allowed":bool(d.get("release_allowed")),"evidence":d}
 if action=="OFFLINE_HISTORICAL_REPLAY":
  p=subprocess.run([sys.executable,str(ROOT/"VIKTOR_REPLAY_LAB.py"),"--offline-only"],cwd=str(ROOT),capture_output=True,text=True,timeout=60)
  return {"status":"OFFLINE_REPLAY_COMPLETE" if p.returncode==0 else "OFFLINE_REPLAY_FAILED","returncode":p.returncode,"stdout":p.stdout[-1200:],"stderr":p.stderr[-600:]}
 if action=="EVENT_TRIGGER_ONLY":
  return {"status":"EVENT_OR_OWNER_GATE_WAIT","polled_external_sources":False,"release_allowed":False,"next_trigger":"G1-G5 or material buyer/customer/provider/product-stage/revenue/cash event"}
 if action=="READ_ONLY_CAPABILITY_REGISTRY":
  reg=load_json(ROOT/"skill_registry_v4.json",{})
  inventory=load_json(PLUGIN_INVENTORY_CURRENT,{})
  manifest=load_json(MANIFEST,{})
  expected={
   "hermes-agent-coordinator":"0.1.90",
   "hermes-automatic-engineer":"0.1.36",
   "hermes-qa-evidence-auditor":"0.1.24",
   "hermes-knowledge-curator":"0.1.95",
  }
  expected_release_ids={
   "hermes-agent-coordinator":"pluginrel_6ae910b51a34819186eae0b1a3162820",
   "hermes-automatic-engineer":"pluginrel_6ae8e56a4f1c8191ba099d7880587162",
   "hermes-qa-evidence-auditor":"pluginrel_6ae8e572d6008191977a1d6031983ba2",
   "hermes-knowledge-curator":"pluginrel_6ae9113678b48191ae320d295e09f0eb",
  }
  plugin_versions={str(p.get("name")):str(p.get("version")) for p in inventory.get("plugins",[]) if isinstance(p,dict)}
  plugin_release_ids={str(p.get("name")):str(p.get("current_release_id")) for p in inventory.get("plugins",[]) if isinstance(p,dict)}
  skill_ids=[str(x.get("id")) for x in reg.get("skills",[]) if isinstance(x,dict)]
  training=(manifest.get("plugin_training") or {})
  trained=training.get("trained_core_plugins") or {}
  manifest_versions={name:str((trained.get(name) or {}).get("version")) for name in expected}
  manifest_release_ids={name:str((trained.get(name) or {}).get("release_id")) for name in expected_release_ids}
  exact_versions=all(plugin_versions.get(name)==version and manifest_versions.get(name)==version for name,version in expected.items())
  exact_release_ids=all(plugin_release_ids.get(name)==release_id and manifest_release_ids.get(name)==release_id for name,release_id in expected_release_ids.items())
  inventory_observed_at=str(inventory.get("observed_at") or "")
  provider_snapshot_age_hours=None
  try:
   observed=datetime.datetime.fromisoformat(inventory_observed_at.replace("Z","+00:00"))
   if observed.tzinfo is None: observed=observed.replace(tzinfo=datetime.timezone.utc)
   provider_snapshot_age_hours=round((datetime.datetime.now(datetime.timezone.utc)-observed).total_seconds()/3600,2)
  except (TypeError,ValueError):
   provider_snapshot_age_hours=None
  provider_snapshot_fresh=(
   provider_snapshot_age_hours is not None and 0<=provider_snapshot_age_hours<=24
   and inventory.get("source_class")=="PRIVATE_PLUGIN_CREATOR_READBACK"
   and inventory.get("snapshot_scope")=="FULL_CURRENT_OWNED_PERSONAL_PLUGIN_INVENTORY"
  )
  skill_ok="WINDOWS_RUNTIME_TRUTH" in skill_ids and training.get("shared_skill")=="windows-runtime-unattended-truth-20261102"
  verified=exact_versions and exact_release_ids and skill_ok and provider_snapshot_fresh
  return {"status":"RUNTIME_CONSUMPTION_VERIFIED_LOCAL" if verified else "CAPABILITY_REGISTRY_DRIFT",
          "registry_version":reg.get("version"),"skill_id":"windows-runtime-unattended-truth-20261102",
          "skill_projection_present":skill_ok,"core_plugin_versions":{name:plugin_versions.get(name) for name in expected},
          "core_plugin_release_ids":{name:plugin_release_ids.get(name) for name in expected_release_ids},
          "manifest_plugin_versions":manifest_versions,"manifest_plugin_release_ids":manifest_release_ids,
          "exact_versions":exact_versions,"exact_release_ids":exact_release_ids,
          "provider_snapshot_fresh":provider_snapshot_fresh,"provider_snapshot_age_hours":provider_snapshot_age_hours,
          "inventory_observed_at":inventory_observed_at,
          "inventory_source_class":inventory.get("source_class"),
          "inventory_snapshot_scope":inventory.get("snapshot_scope"),
          "new_agent_created":False,
          "hae_runtime_consumption_proven":False,"external_actions":0,"provider_writes":0}
 if action=="LOCAL_WORK_CONTRACT_SELFTEST":
  from hae_windows_node_contract import selftest as work_contract_selftest
  return work_contract_selftest(RUN/"qa"/"work_contract_executor_selftest.jsonl")
 if action=="READ_ONLY_SEARCH_EVIDENCE":
  from hermes_ai_operational_qa import run_once
  return {"status":"SEARCH_EVIDENCE_REVIEWED","result":run_once(force=False)}
 if action in {"READ_ONLY_LIVE_WORKFLOW_REVIEW","READ_ONLY_PIPELINE_AUDIT","READ_ONLY_LEARNER_FUNNEL_AUDIT"}:
  return github_issue_audit(task)
 if action=="WRITE_TEST_CASES_PROPOSAL":
  return {"status":"TEST_CASE_PROPOSAL_LOCAL_ONLY","proposal":{"work_id":"LOCAL:"+task.get("id","UNKNOWN"),"required_proof":task.get("required"),"invariants":["allowlisted bounded patch","exact-SHA CI","separate verifier","rollback plan","HOLD_RELEASE"],"external_actions":0}}
 return {"status":"NOOP_SAFE_ACTION","action":action}

def run_cycle(max_tasks=3):
 manifest=load_json(MANIFEST,{})
 raw_tasks=list(manifest.get("tasks") or [])
 by_id={str(t.get("id")):t for t in raw_tasks if t.get("id")}
 sequence=[]
 for stage in (manifest.get("execution_sequence") or {}).get("order",[]):
  for task_id in stage.get("tasks",[]):
   if task_id in by_id and task_id not in sequence:sequence.append(task_id)
 tasks=[by_id[x] for x in sequence]+[t for t in raw_tasks if str(t.get("id")) not in sequence]
 if not tasks:return {"status":"NO_TASKS","tasks":[]}
 st=load_json(STATE,{"cursor":0})
 start=int(st.get("cursor",0))%len(tasks)
 out=[]
 for offset in range(min(max(1,int(max_tasks)),len(tasks))):
  idx=(start+offset)%len(tasks)
  task=tasks[idx]
  try:result=execute(task,dependency_pending=bool(task.get("dependency")))
  except Exception as exc:result={"status":"EXECUTOR_ERROR","error":type(exc).__name__,"detail":str(exc)[:300]}
  plugin_receipt=plugin_use_receipt(task)
  row={"at":stamp(),"task_id":task.get("id"),"issue":task.get("issue"),"safe_next":task.get("safe_next"),
       "plugin_use_receipt":plugin_receipt,"result":result,
       "external_actions":0,"provider_writes":0,"production_mutations":0,"one_brain_writes":0}
  append_jsonl(RECEIPTS,row);out.append(row)
 st["cursor"]=(start+len(out))%len(tasks);st["updated_at"]=stamp();save_json(STATE,st)
 return {"status":"READ_ONLY_TASKS_EXECUTED","count":len(out),"tasks":out,"next_cursor":st["cursor"]}

def selftest():
 m=load_json(MANIFEST,{})
 tasks=m.get("tasks") or []
 assert tasks and all(t.get("can_write") is False for t in tasks)
 assert all(t.get("safe_next") in SAFE_ACTIONS for t in tasks)
 assert all(t.get("plugin_route") for t in tasks)
 plugin_receipts=[plugin_use_receipt(t) for t in tasks]
 assert all(r.get("status") not in {"PLUGIN_VERSION_DRIFT","PLUGIN_PROJECTION_MISSING","NO_PLUGIN_ROUTE_DECLARED"} for r in plugin_receipts)
 assert not (SAFE_ACTIONS & {"SEND","DEPLOY","MERGE","PUBLISH","PROVIDER_WRITE"})
 blocked=execute({"id":"TEST_DEP","safe_next":"OFFLINE_HISTORICAL_REPLAY","can_write":False,"dependency":["UPSTREAM"]},dependency_pending=True)
 assert blocked["status"]=="DEPENDENCY_GATE_WAIT"
 observed=execute({"id":"TEST_DEP_OBSERVE","safe_next":"READ_ONLY_PR_AND_TESTS","can_write":False,"dependency":["UPSTREAM"],"evidence":""},dependency_pending=True)
 assert observed["status"]=="NO_PR_REFERENCE"
 print("HERMES_AI_TASK_EXECUTOR_PASS; existing_worker_only; read_only; dependency_fail_closed; external_actions=0")

def main():
 if hasattr(sys.stdout,"reconfigure"):sys.stdout.reconfigure(encoding="utf-8",errors="replace")
 if hasattr(sys.stderr,"reconfigure"):sys.stderr.reconfigure(encoding="utf-8",errors="replace")
 p=argparse.ArgumentParser();p.add_argument("--all",action="store_true");p.add_argument("--limit",type=int,default=3);p.add_argument("--self-test",action="store_true");a=p.parse_args()
 if a.self_test:return selftest()
 manifest=load_json(MANIFEST,{})
 limit=len(manifest.get("tasks") or []) if a.all else a.limit
 print(json.dumps(run_cycle(limit),ensure_ascii=False,indent=2))
if __name__=="__main__":main()
