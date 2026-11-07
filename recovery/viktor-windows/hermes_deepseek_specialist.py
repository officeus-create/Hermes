#!/usr/bin/env python3
"""Read-only DeepSeek specialist, invoked by Viktor's existing worker loop.

No second scheduler, no credentials, no production writes, no generated-code execution.
"""
from __future__ import annotations
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import sys

LAB = Path.home() / "Hermes-AI-Lab"
AUDITOR = LAB / "hermes_deepseek_auditor.py"
REPORTS = LAB / "reports"
STATUS = REPORTS / "status.json"
INTERVAL_HOURS = 6


def _status():
    try:
        d = json.loads(STATUS.read_text(encoding="utf-8-sig"))
        return d if isinstance(d, dict) else {}
    except (ValueError, OSError):
        return {}


def _age_seconds(record, now):
    try:
        raw = record.get("finished_at") or record.get("started_at")
        t = dt.datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        if t.tzinfo is None:
            return None
        return max(0, (now - t).total_seconds())
    except (TypeError, ValueError):
        return None


def _receipt(info, state):
    return {
        "status": state, "model": str(info.get("model") or "unknown"),
        "snapshot_sha": str(info.get("snapshot_sha") or "UNKNOWN")[:64],
        "files_scanned": int(info.get("files_scanned") or 0),
        "model_evaluated": bool(info.get("model_evaluated")),
        "model_output_valid": info.get("model_output_valid"),
        "model_output_status": str(info.get("model_output_status") or "UNKNOWN"),
        "report_available": bool(info.get("report_path") and
                                 Path(info["report_path"]).is_file()),
        "production_writes": 0, "github_writes": 0,
        "hae_d1_written": False, "evidence_class": "LOCAL_PUBLIC_SOURCE_ONLY",
    }


def run_once():
    """Each existing Viktor worker cycle may call this. Executes <= once/6h."""
    info = _status()
    now = dt.datetime.now(dt.timezone.utc)
    age = _age_seconds(info, now)
    if info.get("state") == "done" and age is not None and age < INTERVAL_HOURS * 3600:
        if info.get("model_output_valid") is False:
            return _receipt(info, "MODEL_OUTPUT_REJECTED")
        return _receipt(info, "SKIPPED_RECENT_RESULT")
    if info.get("state") == "running" and age is not None and age < 420:
        return _receipt(info, "SKIPPED_ALREADY_RUNNING")
    if not AUDITOR.is_file():
        return _receipt(info, "HOLD_AUDITOR_MISSING")
    if os.environ.get("HERMES_DEEPSEEK_LOCAL_DISABLED", "0") == "1":
        return _receipt(info, "PAUSED_BY_POLICY")
    try:
        cp = subprocess.run([sys.executable, str(AUDITOR)], cwd=str(LAB),
                            capture_output=True, text=True, timeout=420,
                            check=False)
    except subprocess.TimeoutExpired:
        return _receipt(_status(), "MODEL_TIMEOUT")
    except (OSError, ValueError):
        return _receipt(_status(), "LAUNCH_ERROR")
    info = _status()
    if cp.returncode or info.get("state") != "done":
        return _receipt(info, "AUDIT_ERROR")
    if info.get("model_output_valid") is False:
        return _receipt(info, "MODEL_OUTPUT_REJECTED")
    return _receipt(info, "LOCAL_AUDIT_COMPLETED")
