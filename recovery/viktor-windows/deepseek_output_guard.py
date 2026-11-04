#!/usr/bin/env python3
"""Fail-closed local Ollama output guard for DeepSeek/VIKTOR specialist work.

Never accepts reasoning/thinking as final output. Invalid outputs are quarantined
as metadata only; raw reasoning is never persisted.
"""
from __future__ import annotations
import datetime as dt
import hashlib
import json
from pathlib import Path
import urllib.request

OLLAMA_CHAT="http://127.0.0.1:11434/api/chat"
DEFAULT_QUARANTINE=Path(r"C:\Hermes\Viktor\viktor_live\deepseek_output_quarantine.jsonl")

def _stamp():
    return dt.datetime.now(dt.timezone.utc).isoformat()

def _final_text(payload):
    message=payload.get("message") if isinstance(payload,dict) else {}
    message=message if isinstance(message,dict) else {}
    raw=str(message.get("content") or payload.get("response") or "").strip()
    thinking=bool(message.get("thinking") or payload.get("thinking") or "<think>" in raw or "</think>" in raw)
    if "</think>" in raw:
        raw=raw.split("</think>",1)[-1].strip()
    elif raw.lstrip().startswith("<think>"):
        raw=""
    return raw,thinking

def _quarantine(path,model,reason,payload,text):
    path=Path(path or DEFAULT_QUARANTINE)
    path.parent.mkdir(parents=True,exist_ok=True)
    row={
        "at":_stamp(),"model":model,"reason":reason,
        "done":bool(payload.get("done")) if isinstance(payload,dict) else False,
        "done_reason":str(payload.get("done_reason") or "")[:80] if isinstance(payload,dict) else "",
        "final_chars":len(text or ""),
        "final_sha256":hashlib.sha256((text or "").encode("utf-8")).hexdigest(),
        "thinking_present":bool(
            (payload.get("thinking") if isinstance(payload,dict) else None) or
            ((payload.get("message") or {}).get("thinking") if isinstance(payload,dict) and isinstance(payload.get("message"),dict) else None)
        ),
        "raw_reasoning_persisted":False,
        "production_writes":0,"github_writes":0,
    }
    with path.open("a",encoding="utf-8") as f:
        f.write(json.dumps(row,ensure_ascii=False)+"\n")

def _request(model,prompt,timeout,num_predict,format_value=None):
    body={
        "model":model,
        "messages":[{"role":"user","content":prompt}],
        "stream":False,
        "think":False,
        "options":{"temperature":0,"num_ctx":4096,"num_predict":num_predict},
    }
    if format_value is not None:
        body["format"]=format_value
    req=urllib.request.Request(
        OLLAMA_CHAT,
        data=json.dumps(body,ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type":"application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req,timeout=timeout) as resp:
        return json.load(resp)

def call_text(prompt,models,timeout=240,num_predict=700,min_chars=12,quarantine_path=None):
    attempts=[]
    for model in models:
        try:
            payload=_request(model,prompt,timeout,num_predict)
            text,thinking=_final_text(payload)
            if len(text)>=min_chars:
                return {"ok":True,"status":"MODEL_OUTPUT_ACCEPTED","model":model,"text":text,
                        "thinking_present":thinking,"attempts":attempts+[{"model":model,"status":"ACCEPTED"}]}
            reason="EMPTY_FINAL_CONTENT" if not text else "FINAL_CONTENT_TOO_SHORT"
            _quarantine(quarantine_path,model,reason,payload,text)
            attempts.append({"model":model,"status":"REJECTED","reason":reason})
        except Exception as exc:
            attempts.append({"model":model,"status":"ERROR","error_class":type(exc).__name__})
    return {"ok":False,"status":"MODEL_OUTPUT_REJECTED","model":None,"text":"",
            "thinking_present":False,"attempts":attempts}

def call_json(prompt,models,schema,timeout=240,num_predict=900,quarantine_path=None):
    required=list((schema or {}).get("required") or [])
    attempts=[]
    for model in models:
        try:
            payload=_request(model,prompt,timeout,num_predict,schema)
            text,thinking=_final_text(payload)
            parsed=json.loads(text) if text else None
            ok=isinstance(parsed,dict) and all(k in parsed for k in required)
            if ok:
                return {"ok":True,"status":"MODEL_OUTPUT_ACCEPTED","model":model,"data":parsed,
                        "thinking_present":thinking,"attempts":attempts+[{"model":model,"status":"ACCEPTED"}]}
            reason="EMPTY_FINAL_CONTENT" if not text else "INVALID_SCHEMA_OUTPUT"
            _quarantine(quarantine_path,model,reason,payload,text)
            attempts.append({"model":model,"status":"REJECTED","reason":reason})
        except Exception as exc:
            attempts.append({"model":model,"status":"ERROR","error_class":type(exc).__name__})
    return {"ok":False,"status":"MODEL_OUTPUT_REJECTED","model":None,"data":None,
            "thinking_present":False,"attempts":attempts}
