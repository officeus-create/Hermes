#!/usr/bin/env python3
"""Supervised outbound-only HAE polling loop for Windows VIKTOR."""
import json, os, pathlib, sys, time
from hermes_hae_windows_node import run_once

ROOT=pathlib.Path(__file__).resolve().parent
RUN=ROOT/"viktor_live"
RECEIPT=RUN/"hae_node_runtime_receipt.json"
HISTORY=RUN/"hae_node_history.jsonl"
HISTORY_ROTATED=RUN/"hae_node_history.jsonl.1"
HISTORY_BYTES_LIMIT=1024*1024
HISTORY_SAFE_FIELDS=("at","status","job_id","work_id","node_id","cost_usd",
                     "external_write","http_status","error_class","error_stage",
                     "server_error_code","output_sha256","remaining_seconds")
RUN.mkdir(parents=True,exist_ok=True)
last_history_identity=None

def save(row):
    global last_history_identity
    tmp=RECEIPT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(row,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    tmp.replace(RECEIPT)
    # Evidence is scoped to known machine metadata, never user/model prompts or
    # raw HAE requests. D1 remains the canonical authoritative job receipt.
    try:
        identity=(str(row.get("status") or ""),str(row.get("job_id") or ""))
        if identity==last_history_identity and identity[0] in ("NO_ELIGIBLE_WORK","LEASE_REPLAY_TTL_LOW"):
            return
        event={key:row[key] for key in HISTORY_SAFE_FIELDS if key in row and row[key] is not None}
        if HISTORY.exists() and HISTORY.stat().st_size>=HISTORY_BYTES_LIMIT:
            HISTORY.replace(HISTORY_ROTATED)
        with HISTORY.open("a",encoding="utf-8") as out:
            out.write(json.dumps(event,ensure_ascii=False,separators=(",",":"))+"\n")
        last_history_identity=identity
    except OSError as error:
        # A local optional history failure must not fabricate HAE success.
        print(json.dumps({"status":"NODE_LOCAL_HISTORY_WRITE_FAILED",
                          "error_class":type(error).__name__}),file=sys.stderr,flush=True)

def main():
    while True:
        if os.environ.get("HERMES_HAE_WINDOWS_NODE_ENABLED","")!="1":
            save({"at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"status":"DISABLED_FAIL_CLOSED","external_write":False})
            return 0
        try:
            row=run_once()
        except Exception as exc:
            row={"at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"status":"NODE_LOOP_ERROR","error_class":type(exc).__name__,"external_write":False}
        save(row)
        status=str(row.get("status") or "")
        if status in {"HAE_UNAVAILABLE","HAE_REJECTED","HAE_CONTRACT_ERROR","NODE_IDENTITY_NOT_CONFIGURED","API_NOT_CONFIGURED"}:
            time.sleep(30)
        elif status=="NO_ELIGIBLE_WORK":
            time.sleep(15)
        elif status=="LEASE_REPLAY_TTL_LOW":
            time.sleep(30)
        else:
            time.sleep(5)

if __name__=="__main__":
    raise SystemExit(main())
