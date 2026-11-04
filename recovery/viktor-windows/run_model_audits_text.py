import datetime,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from deepseek_output_guard import call_text

B=Path(r"C:\Hermes\Viktor\viktor_live")
e=json.loads((B/"dual_audit_compact_evidence.json").read_text(encoding="utf-8-sig"))
w=e.get("windows",{});d=e.get("drive",{});g=e.get("gmail",{})
digest={
 "windows":w,
 "drive_duplicates":(d.get("duplicate_title_groups") or [])[:6],
 "drive_markers":(d.get("marker_files") or [])[:16],
 "email_candidates":(g.get("action_candidates") or [])[:18],
 "email_repeated":(g.get("repeated_subjects") or [])[:8]
}
prompt=("Ты технический аудитор Hermes. Только факты JSON. Дай по-русски максимум 12 коротких пунктов: "
"WINDOWS, DRIVE, EMAIL, MISSED TASKS. Каждый пункт: [P0/P1/P2] факт -> безопасный следующий шаг. "
"Не выдумывай, не отправляй письма, не удаляй/перемещай Drive, не делай merge/deploy. "
"Если данных мало — так и напиши. JSON="+json.dumps(digest,ensure_ascii=False,separators=(",",":")))

def run(label,models):
    guarded=call_text(prompt,models,timeout=300,num_predict=900,min_chars=20)
    txt=str(guarded.get("text") or "")
    out={
      "at":datetime.datetime.now(datetime.timezone.utc).isoformat(),
      "model":guarded.get("model"),"text":txt,
      "accepted_candidate":bool(guarded.get("ok")),
      "model_output_status":guarded.get("status"),
      "attempts":guarded.get("attempts") or [],
      "writes":0
    }
    (B/f"{label}_ecosystem_audit_text.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
    print(label,"chars",len(txt),out["model_output_status"],flush=True)

run("deepseek",["deepseek-r1:1.5b","deepseek-r1:7b"])
run("viktor",["qwen2.5:1.5b-instruct"])
