import datetime,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from deepseek_output_guard import call_json

BASE=Path(r"C:\Hermes\Viktor\viktor_live")
evidence=json.loads((BASE/"dual_audit_compact_evidence.json").read_text(encoding="utf-8-sig"))
prompt="""Ты независимый аудитор Hermes. Используй ТОЛЬКО EVIDENCE JSON. Ничего не выполняй и не выдумывай.
Проверь WINDOWS performance/reliability/connectivity; GOOGLE DRIVE structure/duplicates/stale drafts/missed tasks; GMAIL actionable threads/tasks ready but not launched.
Верни ТОЛЬКО JSON с ключами verdict, windows, drive, email, missed_tasks, do_not_touch.
Каждый пункт должен иметь priority, finding/task, evidence и safe_next/safe_improvement. Email также message_ids и external_action_required.
Максимум 8 пунктов на раздел. Не предлагай удаление/перемещение Drive, отправку email, merge/deploy или отключение security. Такие действия только proposal.
EVIDENCE="""+json.dumps(evidence,ensure_ascii=False,separators=(",",":"))[:22000]

SCHEMA={
 "type":"object",
 "properties":{
  "verdict":{"type":"string"},"windows":{"type":"array"},"drive":{"type":"array"},
  "email":{"type":"array"},"missed_tasks":{"type":"array"},"do_not_touch":{"type":"array"}
 },
 "required":["verdict","windows","drive","email","missed_tasks","do_not_touch"]
}

def run(label,models):
    guarded=call_json(prompt,models,SCHEMA,timeout=420,num_predict=1200)
    out={
      "at":datetime.datetime.now(datetime.timezone.utc).isoformat(),
      "model":guarded.get("model"),
      "valid_json":bool(guarded.get("ok")),
      "result":guarded.get("data") if guarded.get("ok") else None,
      "model_output_status":guarded.get("status"),
      "attempts":guarded.get("attempts") or [],
      "production_writes":0,"github_writes":0,"email_sends":0,"drive_mutations":0
    }
    (BASE/f"{label}_ecosystem_audit.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
    print(label,"valid_json",out["valid_json"],out["model_output_status"],flush=True)

run("deepseek",["deepseek-r1:1.5b","deepseek-r1:7b"])
run("viktor",["qwen2.5:1.5b-instruct"])
