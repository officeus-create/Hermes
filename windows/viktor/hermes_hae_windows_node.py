#!/usr/bin/env python3
"""Outbound-only HAE node client for Windows VIKTOR. Disabled by default."""
import hashlib, json, os, re, secrets, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone

API=os.environ.get("HERMES_HAE_API","https://hae-node.hermeslogisticsus.com").rstrip("/")
TOKEN=os.environ.get("HERMES_HAE_WINDOWS_NODE_TOKEN","")
ENABLED=os.environ.get("HERMES_HAE_WINDOWS_NODE_ENABLED","")=="1"
MODEL=os.environ.get("HERMES_VIKTOR_MODEL","qwen2.5:1.5b-instruct")
OLLAMA=os.environ.get("OLLAMA_HOST","http://127.0.0.1:11434").rstrip("/")
# Ollama's server uses bare host:port; normalize only exact loopback aliases.
# Every non-loopback/proxy/remote host remains blocked by config_error().
if OLLAMA in ("127.0.0.1:11434","localhost:11434"):
    OLLAMA="http://"+OLLAMA
NODE_ID="VIKTOR-WINDOWS"
CONTRACT_VERSION="windows-node-v1"
KEY_ID="viktor-windows-20261104"
# Fixed allowlist of HAE machine error codes. Anything else — including provider
# or Ollama error bodies — is never recorded, so customer content cannot leak
# into the local advisory history.
HAE_ERROR_CODES=frozenset({
    "windows_node_lease_expired",
    "windows_node_stale_fence",
    "windows_node_lease_not_active",
    "windows_node_lease_owner_mismatch",
    "windows_node_lease_missing",
    "windows_node_completion_conflict",
    "windows_node_role_contract_drift",
    "windows_node_output_sha_mismatch",
    "windows_node_output_replay_mismatch",
    "windows_node_semantic_result_required",
    "windows_node_usage_chars_required",
    "windows_node_model_required",
    "windows_node_paid_inference_forbidden",
    "windows_node_job_not_running",
    "windows_node_lease_identity_invalid",
    "windows_node_job_payload_invalid",
    "windows_node_frozen_contract_invalid",
    "windows_node_node_id_invalid",
    "windows_node_contract_version_invalid",
    "database_not_configured",
    "runtime_not_configured",
})
# A rejected completion must not be retried against the same lease. The
# server may re-lease the same job with a new fence after expiry, so the
# suppression key binds job_id AND fence: a genuinely new lease is allowed,
# a repeated attempt on the same one is not.
REJECTED_COMPLETIONS=set()
MAX_COMPLETION_ATTEMPTS=2
SIGNER=os.environ.get("HERMES_HAE_WINDOWS_NODE_SIGNER",r"C:\Hermes\Viktor\hae_node_signer.mjs")
PRIVATE_KEY=os.environ.get("HERMES_HAE_WINDOWS_NODE_PRIVATE_KEY",r"C:\Hermes\Secrets\viktor_hae_ed25519_private.pem")

def emit(status, **extra):
    row={"at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"status":status,**extra}
    print(json.dumps(row,ensure_ascii=False))
    return row

def signed_headers(url, method, data):
    timestamp=str(int(time.time()))
    nonce=secrets.token_urlsafe(24)
    path=urllib.parse.urlsplit(url).path
    body_sha=hashlib.sha256(data or b"").hexdigest()
    message="\n".join(["HERMES-HAE-NODE-V1",method.upper(),path,timestamp,nonce,body_sha])
    proc=subprocess.run(
        ["node",SIGNER],
        input=message.encode("utf-8"),
        capture_output=True,
        timeout=10,
        env={**os.environ,"HERMES_HAE_WINDOWS_NODE_PRIVATE_KEY":PRIVATE_KEY},
    )
    signature=proc.stdout.decode("ascii","strict").strip() if proc.stdout else ""
    if proc.returncode!=0 or not signature:
        raise RuntimeError("windows_node_signing_failed")
    return {
        "X-Hermes-Node-Id":NODE_ID,
        "X-Hermes-Node-Key-Id":KEY_ID,
        "X-Hermes-Node-Timestamp":timestamp,
        "X-Hermes-Node-Nonce":nonce,
        "X-Hermes-Node-Signature":signature,
    }

def http_json(url, method="GET", payload=None, token=None, timeout=30):
    data=None if payload is None else json.dumps(payload,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    headers={"Accept":"application/json","User-Agent":"HermesViktorWindowsHAE/1.1"}
    if data is not None: headers["Content-Type"]="application/json"
    if token:
        headers["Authorization"]="Bearer "+token
    elif url.startswith(API+"/"):
        headers.update(signed_headers(url,method,data))
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
    value=re.sub(r"^```(?:json)?\s*","",value,flags=re.I)
    value=re.sub(r"\s*```$","",value)
    try: parsed=json.loads(value)
    except Exception:
        a=value.find("{"); b=value.rfind("}")
        if a<0 or b<=a: raise ValueError("semantic_result_json_missing")
        parsed=json.loads(value[a:b+1])
    if not isinstance(parsed,dict): raise ValueError("semantic_result_not_object")
    return parsed

def ollama(request,job_type=None):
    system=str(request.get("system_prompt") or "").strip()
    user=str(request.get("user_prompt") or "").strip()
    max_tokens=max(64,min(1200,int(request.get("max_output_tokens") or 600)))
    if not system or not user: raise ValueError("semantic_prompt_missing")
    payload={"model":MODEL,"stream":False,"format":"json","messages":[{"role":"system","content":system},{"role":"user","content":user}],"options":{"temperature":0,"num_predict":max_tokens}}
    _,body=http_json(OLLAMA+"/api/chat","POST",payload,TOKEN if OLLAMA.startswith("https://") else None,120)
    raw_content=((body.get("message") or {}).get("content") or "")
    try:
        result=extract_json(raw_content)
    except ValueError as exc:
        # Only the owner planning contract has an existing explicit fail-closed
        # disposition; never turn invalid output into success for other jobs.
        parsing_failure=isinstance(exc,json.JSONDecodeError) or str(exc) in (
            "semantic_result_json_missing","semantic_result_not_object")
        if job_type!="work.item.plan" or not parsing_failure:
            raise
        result={}  # existing normalize_semantic_result -> NEEDS_CAPABILITY
    usage={"input_tokens":body.get("prompt_eval_count"),"output_tokens":body.get("eval_count"),"input_chars":len(system)+len(user),"output_chars":len(json.dumps(result,ensure_ascii=False,separators=(",",":")))}
    return result,usage

OWNER_PLAN_DISPOSITIONS={"EXECUTE_EXISTING_CAPABILITY","NEEDS_CAPABILITY","NEEDS_OWNER_GATE","BLOCKED_EVIDENCE"}

def normalize_semantic_result(job_type, request, result):
    if job_type!="work.item.plan":
        return result
    try:
        owner_input=json.loads(str((request or {}).get("user_prompt") or "{}"))
    except Exception:
        owner_input={}
    available={str(x) for x in (owner_input.get("available_execution_job_types") or []) if isinstance(x,str) and x}
    if not isinstance(result,dict):
        result={}
    disposition=str(result.get("disposition") or "").strip()
    recommended=result.get("recommended_job_type")
    recommended=str(recommended).strip() if isinstance(recommended,str) and recommended.strip() else None
    rationale=str(result.get("rationale") or "").strip()
    next_action=str(result.get("next_action") or "").strip()
    if disposition=="EXECUTE_EXISTING_CAPABILITY" and recommended in available and rationale and next_action:
        return {"disposition":disposition,"recommended_job_type":recommended,"rationale":rationale,"next_action":next_action}
    if disposition in (OWNER_PLAN_DISPOSITIONS-{"EXECUTE_EXISTING_CAPABILITY"}) and rationale and next_action:
        return {"disposition":disposition,"recommended_job_type":None,"rationale":rationale,"next_action":next_action}
    return {
        "disposition":"NEEDS_CAPABILITY",
        "recommended_job_type":None,
        "rationale":"Local DeepSeek output did not safely select an allowlisted HAE capability; VIKTOR downgraded the plan fail-closed.",
        "next_action":next_action or "Define or verify a bounded HAE READ_ONLY capability before execution.",
    }

def replay_lease_seconds_left(lease):
    try:
        deadline=datetime.fromisoformat(str(lease.get("lease_until") or "").replace("Z","+00:00"))
        return (deadline-datetime.now(timezone.utc)).total_seconds()
    except (TypeError,ValueError,OverflowError):
        return None

def node(status="IDLE",job=None):
    return {"node_id":NODE_ID,"contract_version":CONTRACT_VERSION,"model":MODEL,"status":status,"current_job_id":job}

def config_error():
    if not ENABLED: return "DISABLED_FAIL_CLOSED"
    if not API.startswith("https://"): return "API_NOT_CONFIGURED"
    if len(TOKEN)<32 and not (os.path.isfile(PRIVATE_KEY) and os.path.isfile(SIGNER)): return "NODE_IDENTITY_NOT_CONFIGURED"
    if OLLAMA not in ("http://127.0.0.1:11434","http://localhost:11434"): return "OLLAMA_NOT_LOCALHOST"
    return None

def preflight():
    if not API.startswith("https://"):
        return emit("HAE_SIGNED_PREFLIGHT_HOLD",reason="API_NOT_CONFIGURED",node_id=NODE_ID,external_write=False)
    if not (os.path.isfile(PRIVATE_KEY) and os.path.isfile(SIGNER)):
        return emit("HAE_SIGNED_PREFLIGHT_HOLD",reason="NODE_IDENTITY_NOT_CONFIGURED",node_id=NODE_ID,external_write=False)
    try:
        status,body=http_json(API+"/v1/nodes/windows/status","GET",None,None,15)
    except urllib.error.HTTPError as exc:
        return emit("HAE_SIGNED_PREFLIGHT_HOLD",http_status=exc.code,node_id=NODE_ID,external_write=False)
    except Exception as exc:
        return emit("HAE_SIGNED_PREFLIGHT_UNAVAILABLE",error_class=type(exc).__name__,node_id=NODE_ID,external_write=False)
    ok=(
        status==200 and body.get("success") is True and body.get("configured") is True
        and body.get("node_id")==NODE_ID and body.get("production_write_authorized") is False
    )
    return emit(
        "HAE_SIGNED_PREFLIGHT_PASS" if ok else "HAE_SIGNED_PREFLIGHT_HOLD",
        http_status=status,node_id=NODE_ID,server_online=body.get("online"),
        server_status=body.get("status"),external_write=False,
    )

def run_once():
    problem=config_error()
    if problem: return emit(problem,node_id=NODE_ID,cost_usd=0,external_write=False)
    auth_token=TOKEN if len(TOKEN)>=32 else None
    try:
        http_json(API+"/v1/nodes/windows/heartbeat","POST",node(),auth_token)
        _,claim=http_json(API+"/v1/nodes/windows/claim","POST",node(),auth_token)
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
    fence=str(lease.get("fence") or "")
    attempt_key=(job_id,fence)
    if attempt_key in REJECTED_COMPLETIONS:
        # This exact lease already produced a rejected completion. Do not spend
        # another local model call on it; wait for a new fence from the server.
        return emit("COMPLETION_REJECTED_SUPPRESSED",job_id=job_id,work_id=work_id,
                    node_id=NODE_ID,cost_usd=0,external_write=False)
    if claim.get("status")=="LEASE_REPLAY":
        # A replay cannot extend the original five-minute lease.
        # Avoid spending local DeepSeek tokens when completion would be too late.
        remaining=replay_lease_seconds_left(lease)
        if remaining is None or remaining<180:
            return emit("LEASE_REPLAY_TTL_LOW",job_id=job_id,work_id=work_id,node_id=NODE_ID,
                        remaining_seconds=max(0,int(remaining or 0)),cost_usd=0,external_write=False)
    error_stage="heartbeat_busy"
    try:
        http_json(API+"/v1/nodes/windows/heartbeat","POST",node("BUSY",job_id),auth_token)
        semantic_request=lease.get("semantic_request") or {}
        error_stage="ollama_model"
        result,usage=ollama(semantic_request,str(lease.get("job_type") or ""))
        error_stage="result_validation"
        result=normalize_semantic_result(str(lease.get("job_type") or ""),semantic_request,result)
        completion={"node_id":NODE_ID,"contract_version":CONTRACT_VERSION,"job_id":job_id,"lease_id":lease.get("lease_id"),"fence":lease.get("fence"),"model":MODEL,"cost_usd":0,"semantic_result":result,"output_sha256":digest(result),"usage":usage}
        error_stage="hae_completion"
        _,done=http_json(API+"/v1/nodes/windows/complete","POST",completion,auth_token,30)
        return emit(str(done.get("status") or "COMPLETION_CONTRACT_ERROR"),job_id=job_id,work_id=work_id,node_id=NODE_ID,output_sha256=completion["output_sha256"],cost_usd=0,external_write=False)
    except urllib.error.HTTPError as exc:
        # Only an HAE completion rejection may surface a machine error code, and
        # only from the fixed HAE allowlist. Provider/Ollama error bodies are
        # never parsed, so customer content cannot reach local history.
        if error_stage!="hae_completion":
            return emit("PROVIDER_HTTP_ERROR",job_id=job_id,work_id=work_id,http_status=exc.code,
                        error_stage=error_stage,node_id=NODE_ID,cost_usd=0,external_write=False)
        server_error_code=None
        try:
            response=json.loads(exc.read().decode("utf-8","replace"))
            candidate=str(response.get("error") or "")
            if candidate in HAE_ERROR_CODES:
                server_error_code=candidate
        except (ValueError,TypeError,AttributeError):
            pass
        REJECTED_COMPLETIONS.add(attempt_key)
        return emit("COMPLETION_REJECTED",job_id=job_id,work_id=work_id,http_status=exc.code,
                    error_stage=error_stage,server_error_code=server_error_code,node_id=NODE_ID)
    except Exception as exc:
        return emit("LOCAL_EXECUTION_ERROR",job_id=job_id,work_id=work_id,error_class=type(exc).__name__,error_stage=error_stage,node_id=NODE_ID)

if __name__=="__main__":
    if "--preflight" in sys.argv:
        preflight()
    else:
        run_once()
