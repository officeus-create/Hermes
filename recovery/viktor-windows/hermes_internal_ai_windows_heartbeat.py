#!/usr/bin/env python3
"""Heartbeat-only bridge from local Windows VIKTOR to Hermes Internal AI.

Fail-closed by default. It never claims work, never sends secrets to stdout,
and must not be scheduled until the reviewed server contract is deployed.

Required Windows-only secret:
  HERMES_INTERNAL_AI_WINDOWS_RUNNER_TOKEN=<scoped secret stored locally only>

The Mac runner token is intentionally NOT accepted for this identity.
"""
import json, os, pathlib, urllib.request, urllib.error

ROOT=pathlib.Path(__file__).resolve().parent
STATUS=ROOT/"viktor_live"/"status.json"
API=os.environ.get("HERMES_INTERNAL_AI_API","").rstrip("/")
TOKEN=os.environ.get("HERMES_INTERNAL_AI_WINDOWS_RUNNER_TOKEN","")
ENABLED=os.environ.get("HERMES_INTERNAL_AI_WINDOWS_HEARTBEAT_ENABLED","")=="1"
RUNNER_ID="internal-ai-windows-viktor"

def out(status, **extra):
    print(json.dumps({"status":status, **extra}, ensure_ascii=False))

if not ENABLED:
    out("DISABLED_FAIL_CLOSED", reason="Enable only after reviewed server contract deployment and a dedicated Windows runner secret.")
    raise SystemExit(2)
if not API.startswith("https://") or not TOKEN:
    out("CONFIG_MISSING", api_configured=API.startswith("https://"), windows_token_configured=bool(TOKEN))
    raise SystemExit(2)

try:
    state=json.loads(STATUS.read_text(encoding="utf-8")) if STATUS.exists() else {}
except Exception:
    state={}

payload={
    "runner_id":RUNNER_ID,
    "accept_tasks":False,
    "runtime_version":"viktor-windows-local/2026-11-03",
    "executor_type":"windows",
    "display_name":"Hermes AI / VIKTOR Windows",
    "current_task":str(state.get("current_task") or "")[:500],
    "phase":str(state.get("phase") or "")[:120],
    "last_result":str(state.get("last_result") or "")[:500],
    "blocker":"HAE task-claim adapter remains gated; heartbeat-only visibility.",
}
req=urllib.request.Request(
    API+"/api/internal-ai/runner/claim",
    data=json.dumps(payload).encode("utf-8"),
    method="POST",
    headers={
        "Authorization":"Bearer "+TOKEN,
        "Content-Type":"application/json",
        "Accept":"application/json",
        "User-Agent":"HermesViktorWindowsHeartbeat/1.1",
    },
)
try:
    with urllib.request.urlopen(req,timeout=20) as response:
        body=json.loads(response.read().decode("utf-8") or "{}")
except urllib.error.HTTPError as exc:
    out("SERVER_REJECTED", http_status=exc.code)
    raise SystemExit(3)
except Exception as exc:
    out("NETWORK_ERROR", error_class=type(exc).__name__)
    raise SystemExit(4)

if body.get("success") is not True or body.get("heartbeat_only") is not True or body.get("runner_id")!=RUNNER_ID or body.get("task") is not None:
    out("CONTRACT_MISMATCH", heartbeat_only=body.get("heartbeat_only"), runner_id=body.get("runner_id"))
    raise SystemExit(5)
out("HEARTBEAT_ACCEPTED", runner_id=RUNNER_ID, task_claimed=False)
