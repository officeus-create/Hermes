import datetime,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from deepseek_output_guard import call_text

BASE=Path(r"C:\Hermes\Viktor\viktor_live")
def load(n): return json.loads((BASE/n).read_text(encoding="utf-8-sig"))
W=load("agent_windows_evidence.json");D=load("agent_drive_evidence.json");G=load("agent_gmail_evidence.json")
sysinfo=W.get("system") or {}
services=[]
for s in sysinfo.get("services") or []:
    name=((s.get("Name") or "")+" "+(s.get("DisplayName") or "")).lower()
    if any(k in name for k in ("hermes","ollama","remote","anydesk","teamviewer","norton","defender")): services.append(s)
WC={"status":W.get("status"),"last_operation":W.get("last_operation"),"runtime":W.get("runtime"),"full_audit":W.get("full_audit"),
    "system":{"os":sysinfo.get("os"),"computer":sysinfo.get("computer"),"disks":sysinfo.get("disks"),"logical_disks":sysinfo.get("logical_disks"),"defender":sysinfo.get("defender"),"pending_reboot":sysinfo.get("pending_reboot"),"startup":(sysinfo.get("startup") or [])[:25],"selected_services":services[:25],"event_error_providers":sysinfo.get("event_error_providers")}}
DC={"indexed_items":D["indexed_items"],"candidates":D["status_task_candidates"][:22],"duplicates":D["duplicate_title_groups"][:7]}
GC={"candidate_messages_total":G["candidate_messages_total"],"messages":G["action_candidates"][:24],"threads":G["repeated_threads"][:8]}
tasks={
"windows":("Ты DeepSeek, независимый read-only аудитор. ТОЛЬКО Windows/Hermes runtime. Максимум 8 строк: [P0/P1/P2] finding | EVIDENCE exact field/value | SAFE_NEXT | VERIFY. Performance/reliability/connectivity, Viktor, Ollama, Remote Desktop, watchdog, heartbeat, process topology. Не выдумывай. Никаких writes. EVIDENCE=",WC),
"drive":("Ты DeepSeek, read-only аудитор Google Drive. Полный metadata-index="+str(D["indexed_items"])+" объектов. Максимум 8 строк: [P0/P1/P2] finding/task | EVIDENCE exact IDs+titles | SAFE_NEXT | OWNER=VIKTOR/HAE/HUMAN. Не удалять/не перемещать. EVIDENCE=",DC),
"gmail":("Ты DeepSeek, read-only аудитор Gmail. Pool="+str(G["candidate_messages_total"])+" сообщений. Максимум 8 строк: [P0/P1/P2] task | EVIDENCE message IDs+subject | SAFE_NEXT read/verify/draft/propose | OWNER=VIKTOR/HAE/HUMAN | EXTERNAL_ACTION=yes/no. Не отправлять/не архивировать. EVIDENCE=",GC)}
for domain,(pre,obj) in tasks.items():
    prompt=pre+json.dumps(obj,ensure_ascii=False,separators=(",",":"))
    guarded=call_text(prompt,["deepseek-r1:7b","deepseek-r1:1.5b"],timeout=360,num_predict=500,min_chars=20)
    out=str(guarded.get("text") or "")
    (BASE/f"deepseek7b_{domain}_audit.txt").write_text(out,encoding="utf-8")
    meta={
      "at":datetime.datetime.now(datetime.timezone.utc).isoformat(),
      "model":guarded.get("model"),"domain":domain,"chars":len(out),
      "accepted_candidate":bool(guarded.get("ok")),
      "model_output_status":guarded.get("status"),"attempts":guarded.get("attempts") or [],
      "scope":D["indexed_items"] if domain=="drive" else (G["candidate_messages_total"] if domain=="gmail" else "windows_verified_receipts"),
      "production_writes":0,"github_writes":0,"email_sends":0,"drive_mutations":0
    }
    (BASE/f"deepseek7b_{domain}_audit_meta.json").write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding="utf-8")
    print("deepseek",domain,"chars",len(out),meta["model_output_status"],flush=True)

[executed on device: YuraValentyuk (b8401eca-2ffc-4516-9a60-2474a57035b8)]
