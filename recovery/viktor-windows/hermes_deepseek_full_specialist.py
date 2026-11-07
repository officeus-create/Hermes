#!/usr/bin/env python3
"""Daily full DeepSeek Windows audit, called only by existing Viktor worker."""
from __future__ import annotations
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import sys

BASE = Path(__file__).resolve().parent
AUDITOR = BASE / "hermes_deepseek_full_audit.py"
STATUS = BASE / "viktor_live" / "deepseek_full_audit" / "status.json"
INTERVAL_HOURS = 24

def _load():
    try:
        x=json.loads(STATUS.read_text(encoding="utf-8-sig"))
        return x if isinstance(x,dict) else {}
    except (OSError,ValueError):
        return {}

def _age(x):
    try:
        raw=x.get("finished_at") or x.get("started_at")
        t=dt.datetime.fromisoformat(str(raw).replace("Z","+00:00"))
        if t.tzinfo is None:return None
        return max(0,(dt.datetime.now(dt.timezone.utc)-t).total_seconds())
    except (TypeError,ValueError):
        return None

def _receipt(x,state):
    return {
        "status":state,
        "model":str(x.get("model") or "unknown"),
        "files_scanned":int(x.get("files_scanned") or 0),
        "programs":int(x.get("programs") or 0),
        "viktor_tests":x.get("viktor_tests"),
        "model_output_valid":x.get("model_output_valid"),
        "model_output_status":str(x.get("model_output_status") or "UNKNOWN"),
        "report_available":bool(x.get("report") and Path(x["report"]).is_file()),
        "production_writes":0,"github_writes":0,
        "credential_contents_read":False,
        "evidence_class":"LOCAL_WINDOWS_FULL_AUDIT",
    }

def run_once():
    x=_load(); age=_age(x)
    if x.get("state")=="done" and age is not None and age<INTERVAL_HOURS*3600:
        if x.get("model_output_valid") is False:
            return _receipt(x,"MODEL_OUTPUT_REJECTED")
        return _receipt(x,"SKIPPED_RECENT_FULL_AUDIT")
    if x.get("state")=="running" and age is not None and age<900:
        return _receipt(x,"SKIPPED_FULL_AUDIT_RUNNING")
    if os.environ.get("HERMES_DEEPSEEK_FULL_AUDIT_DISABLED","0")=="1":
        return _receipt(x,"PAUSED_BY_POLICY")
    if not AUDITOR.is_file():
        return _receipt(x,"HOLD_FULL_AUDITOR_MISSING")
    env=dict(os.environ)
    env.setdefault("HERMES_DEEPSEEK_AUDIT_MODEL","deepseek-r1:1.5b")
    try:
        cp=subprocess.run([sys.executable,str(AUDITOR)],cwd=str(BASE),env=env,
                          capture_output=True,text=True,timeout=1200,check=False)
    except subprocess.TimeoutExpired:
        return _receipt(_load(),"FULL_AUDIT_TIMEOUT")
    except OSError:
        return _receipt(_load(),"FULL_AUDIT_LAUNCH_ERROR")
    x=_load()
    if cp.returncode or x.get("state")!="done":
        return _receipt(x,"FULL_AUDIT_ERROR")
    if x.get("model_output_valid") is False:
        return _receipt(x,"MODEL_OUTPUT_REJECTED")
    return _receipt(x,"FULL_AUDIT_COMPLETED")
