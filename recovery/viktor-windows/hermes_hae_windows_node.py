#!/usr/bin/env python3
"""Outbound-only HAE node client for Windows VIKTOR. Disabled by default."""
import hashlib, json, os, re, sys, time, urllib.error, urllib.request

API=os.environ.get("HERMES_HAE_API","").rstrip("/")
TOKEN=os.environ.get("HERMES_HAE_WINDOWS_NODE_TOKEN","")
ENABLED=os.environ.get("HERMES_HAE_WINDOWS_NODE_ENABLED","")=="1"
MODEL=os.environ.get("HERMES_VIKTOR_MODEL","qwen2.5:1.5b-instruct")
OLLAMA=os.environ.get("OLLAMA_HOST","http://127.0.0.1:11434").rstrip("/")
NODE_ID="VIKTOR-WINDOWS"
CONTRACT_VERSION="windows-node-v1"

def emit(status, **extra):
    row={"at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"status":status,**extra}
    print(json.dumps(row,ensure_ascii=False))
    return row

def http_json(url, method="GET", payload=None, token=None, timeout=30):
    data=None if payload is None else json.dumps(payload,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    headers={"Accept":"application/json","User-Agent":"HermesViktorWindowsHAE/1.0"}
    if data is not None: headers["Content-Type"]="application/json"
    if token: headers["Authorization"]="Bearer "+token
    req=urllib.request.Request(url,data=data,method=method,headers=headers)
    with urllib.request.urlopen(req,timeout=timeout) as response:
        return response.status,json.loads(response.read().decode("utf-8") or "{}")

def canonical(value):
    if isinstance(value,dict): return {k:canonical(value[k]) for k in sorted(value)}
    if isinstance(value,list): return [canonical(x) for x in value]
    return value

def digest(value):
    raw=json.dumps(canonical(value),ensure_ascii=False,separators=(",",":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()

def extract_json(text):
    value=str(text or "").strip()
    value=re.sub(r"^```(?:json)?\\s*","",value,flags=re.I)
    value=re.sub(r"\\s*```$","",value)
    try: parsed=json.loads(value)
    except Exception:
        a=value.find("{"); b=value.rfind("}")
        if a<0 or b<=a: raise ValueError("semantic_result_json_missing")
        parsed=json.loads(value[a:b+1])
    if not isinstance(parsed,dict): raise ValueError("semantic_result_not_object")
    return parsed

def ollama(request):
    system=str(request.get("system_prompt") or "").strip()
    user=str(request.get("user_prompt") or "").strip()
    max_tokens=max(64,min(1200,int(request.get("max_output_tokens") or 600)))
    if not system or not user: raise ValueError("semantic_prompt_missing")
    payload={"model":MODEL,"stream":False,"format":"json","messages":[{"role":"system","content":system},{"role":"user","content":user}],"options":{"temperature":0,"num_predict":max_tokens}}
    _,body=http_json(OLLAMA+"/api/chat","POST",payload,None,120)
    result=extract_json(((body.get("message") or {}).get("content") or ""))
    usage={"input_tokens":body.get("prompt_eval_count"),"output_tokens":body.get("eval_count"),"input_chars":len(system)+len(user),"output_chars":len(json.dumps(result,ensure_ascii=False,separators=(",",":")))}
    return result,usage

def node(status="IDLE",job=None):
    return {"node_id":NODE_ID,"contract_version":CONTRACT_VERSION,"model":MODEL,"status":status,"current_job_id":job}

def config_error():
    if not ENABLED: return "DISABLED_FAIL_CLOSED"
    if not API.startswith("https://"): return "API_NOT_CONFIGURED"
    if len(TOKEN)<32: return "TOKEN_NOT_CONFIGURED"
    if OLLAMA not in ("http://127.0.0.1:11434","http://localhost:11434"): return "OLLAMA_NOT_LOCALHOST"
    return None

def run_once():
    problem=config_error()
    if problem: return emit(problem,node_id=NODE_ID,cost_usd=0,external_write=False)
    try:
        http_json(API+"/v1/nodes/windows/heartbeat","POST",node(),TOKEN)
        _,claim=http_json(API+"/v1/nodes/windows/claim","POST",node(),TOKEN)
    except urllib.error.HTTPError as exc:
        return emit("HAE_REJECTED",http_status=exc.code,node_id=NODE_ID)
    except Exception as exc:
        return emit("HAE_UNAVAILABLE",error_class=type(exc).__name__,node_id=NODE_ID)
    if claim.get("success") is not True: return emit("HAE_CONTRACT_ERROR",node_id=NODE_ID)
    lease=claim.get("lease")
    if claim.get("status")=="NO_ELIGIBLE_WORK" or not lease: return emit("NO_ELIGIBLE_WORK",node_id=NODE_ID)
    if claim.get("status") not in ("LEASE_ACCEPTED","LEASE_REPLAY"): return emit("UNEXPECTED_CLAIM_STATE",claim_state=claim.get("status"),node_id=NODE_ID)
    job_id=str(lease.get("job_id") or ""); work_id=str(lease.get("work_id") or "")
    role=lease.get("role_contract") or {}
    if lease.get("node_id")!=NODE_ID or lease.get("node_contract_version")!=CONTRACT_VERSION: return emit("LEASE_IDENTITY_MISMATCH",job_id=job_id)
    if role.get("permission_class")!="READ_ONLY" or role.get("semantic_required") is not True or float(role.get("max_cost_usd",1))!=0: return emit("LEASE_CAPABILITY_DENIED",job_id=job_id)
    try:
        http_json(API+"/v1/nodes/windows/heartbeat","POST",node("BUSY",job_id),TOKEN)
        result,usage=ollama(lease.get("semantic_request") or {})
        completion={"node_id":NODE_ID,"contract_version":CONTRACT_VERSION,"job_id":job_id,"lease_id":lease.get("lease_id"),"fence":lease.get("fence"),"model":MODEL,"cost_usd":0,"semantic_result":result,"output_sha256":digest(result),"usage":usage}
        _,done=http_json(API+"/v1/nodes/windows/complete","POST",completion,TOKEN,30)
        return emit(str(done.get("status") or "COMPLETION_CONTRACT_ERROR"),job_id=job_id,work_id=work_id,node_id=NODE_ID,output_sha256=completion["output_sha256"],cost_usd=0,external_write=False)
    except urllib.error.HTTPError as exc:
        return emit("COMPLETION_REJECTED",job_id=job_id,work_id=work_id,http_status=exc.code,node_id=NODE_ID)
    except Exception as exc:
        return emit("LOCAL_EXECUTION_ERROR",job_id=job_id,work_id=work_id,error_class=type(exc).__name__,node_id=NODE_ID)

if __name__=="__main__":
    run_once()