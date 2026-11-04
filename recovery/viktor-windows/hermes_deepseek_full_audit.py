#!/usr/bin/env python3
"""DeepSeek full local Windows audit for Hermes.

Scope: read-only system/software/file/AI inventory + local DeepSeek analysis.
No credential extraction, no file deletion, no production writes, no outbound business actions.
"""
from __future__ import annotations
import collections
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import subprocess
import sys
import time
import urllib.request
import winreg
from deepseek_output_guard import call_text

BASE = Path(r"C:\Hermes\Viktor")
LAB = Path.home() / "Hermes-AI-Lab"
OUT = BASE / "viktor_live" / "deepseek_full_audit"
OUT.mkdir(parents=True, exist_ok=True)
STATUS = OUT / "status.json"
LATEST = OUT / "latest.md"
MODEL_PRIMARY = os.environ.get("HERMES_DEEPSEEK_AUDIT_MODEL", "deepseek-r1:7b")
MODEL_FALLBACK = "deepseek-r1:1.5b"
OLLAMA = "http://127.0.0.1:11434/api/generate"
MAX_FILES = 400000
SCAN_ROOTS = [
    Path(r"C:\Hermes"),
    Path.home() / "Desktop",
    Path.home() / "Documents",
    Path.home() / "Downloads",
    Path.home() / "OneDrive",
    Path.home() / ".codex",
    Path.home() / ".claude-server-commander",
    Path.home() / ".desktop-commander-device",
    Path.home() / ".ollama",
    Path.home() / "Hermes-AI-Lab",
]
SENSITIVE_NAME_RE = re.compile(r"(?:^|[_\-.])(secret|token|credential|password|passwd|api[-_]?key|id_rsa|private[-_]?key)(?:[_\-.]|$)", re.I)
KEY_EXTS = {".pem", ".p12", ".pfx", ".key", ".kdbx"}
SCRIPT_EXTS = {".py", ".ps1", ".bat", ".cmd", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".sh"}
CACHE_DIR_NAMES = {
    "__pycache__", ".cache", "Cache", "Code Cache", "GPUCache",
    "node_modules", ".npm", ".pnpm-store", "Temp", "tmp", ".git", "AppData"
}


def stamp():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def save_status(data):
    STATUS.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def ps_json(script: str, timeout=15):
    cmd = ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command",
           "$ProgressPreference='SilentlyContinue'; " + script + " | ConvertTo-Json -Depth 5 -Compress"]
    try:
        cp = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, check=False)
    except subprocess.TimeoutExpired:
        return {"timeout": True}
    raw = (cp.stdout or "").strip()
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"parse_error": True, "preview": raw[:500]}


def installed_programs():
    rows = {}
    hives = [
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
        (winreg.HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
    ]
    for hive, root in hives:
        try:
            with winreg.OpenKey(hive, root) as key:
                for i in range(winreg.QueryInfoKey(key)[0]):
                    try:
                        sub = winreg.EnumKey(key, i)
                        with winreg.OpenKey(key, sub) as sk:
                            def q(name):
                                try:
                                    return str(winreg.QueryValueEx(sk, name)[0]).strip()
                                except OSError:
                                    return ""
                            name = q("DisplayName")
                            if not name:
                                continue
                            ident = (name.lower(), q("DisplayVersion").lower(), q("Publisher").lower())
                            rows[ident] = {
                                "name": name[:160],
                                "version": q("DisplayVersion")[:80],
                                "publisher": q("Publisher")[:120],
                            }
                    except OSError:
                        continue
        except OSError:
            continue
    return sorted(rows.values(), key=lambda x: x["name"].lower())


def scan_files():
    ext_count = collections.Counter()
    root_count = collections.Counter()
    risky_names = []
    script_samples = []
    errors = 0
    files = 0
    skipped_dirs = 0
    roots_seen = []

    def walk_fast(root: Path):
        nonlocal files, errors, skipped_dirs
        stack = [root]
        while stack and files < MAX_FILES:
            cur = stack.pop()
            try:
                with os.scandir(cur) as it:
                    for entry in it:
                        if files >= MAX_FILES:
                            break
                        try:
                            if entry.is_dir(follow_symlinks=False):
                                if entry.name in CACHE_DIR_NAMES:
                                    skipped_dirs += 1
                                    continue
                                try:
                                    attrs = getattr(entry.stat(follow_symlinks=False), "st_file_attributes", 0)
                                    if attrs & 0x400:
                                        skipped_dirs += 1
                                        continue
                                except OSError:
                                    errors += 1
                                    continue
                                stack.append(Path(entry.path))
                                continue
                            if not entry.is_file(follow_symlinks=False):
                                continue
                        except OSError:
                            errors += 1
                            continue
                        files += 1
                        p = Path(entry.path)
                        ext = p.suffix.lower() or "[no_ext]"
                        ext_count[ext] += 1
                        root_count[str(root)] += 1
                        if SENSITIVE_NAME_RE.search(entry.name) or ext in KEY_EXTS:
                            risky_names.append(str(p)[:260])
                        if ext in SCRIPT_EXTS and len(script_samples) < 150:
                            script_samples.append(str(p)[:260])
            except (OSError, PermissionError):
                errors += 1

    for root in SCAN_ROOTS:
        try:
            resolved = str(root.resolve()).lower()
        except OSError:
            resolved = str(root).lower()
        if any(resolved.startswith(existing) for existing in roots_seen):
            continue
        roots_seen.append(resolved)
        if root.exists():
            walk_fast(root)

    return {
        "files_scanned": files,
        "scan_cap_reached": files >= MAX_FILES,
        "skipped_cache_or_reparse_dirs": skipped_dirs,
        "scan_errors": errors,
        "files_by_root": dict(root_count),
        "extensions_top": ext_count.most_common(40),
        "sensitive_name_hits_count": len(risky_names),
        "sensitive_name_examples": risky_names[:20],
        "script_files_sampled": len(script_samples),
        "script_examples": script_samples[:50],
        "note": "Fast metadata/name inventory; file contents are not bulk-read and caches/reparse points are excluded."
    }


def viktor_snapshot():
    status_path = BASE / "viktor_live" / "status.json"
    receipt_path = BASE / "viktor_live" / "windows_runtime_receipt.json"
    result = {}
    for label, path in (("status", status_path), ("runtime_receipt", receipt_path)):
        try:
            data = json.loads(path.read_text(encoding="utf-8-sig"))
        except (OSError, ValueError):
            data = {}
        if label == "status":
            result[label] = {k: data.get(k) for k in (
                "status","phase","model","cycle","tested","passed","failed","updated_at",
                "operational_mode","current_task","next_action")}
            result["last_operation_keys"] = sorted((data.get("last_operation") or {}).keys())
            result["deepseek_last"] = (data.get("last_operation") or {}).get("deepseek")
        else:
            result[label] = {k: data.get(k) for k in (
                "at","dashboard_http","ollama_ready","model","model_ready",
                "server_processes","server_processes_raw","worker_processes","worker_processes_raw",
                "worker_heartbeat_age_seconds","watchdog_task_logon_type","watchdog_unattended_ready",
                "hae_node_enabled","hae_node_api_configured","hae_node_token_configured")}
    py_files = list(BASE.glob("*.py"))
    tests = list((BASE / "tests").glob("test_*.py"))
    result["python_modules"] = len(py_files)
    result["test_files"] = len(tests)
    return result


def run_viktor_tests():
    py = BASE / ".venv" / "Scripts" / "python.exe"
    if not py.exists():
        return {"status": "NO_VENV"}
    try:
        cp = subprocess.run([str(py), "-m", "unittest", "discover", "-s", "tests",
                             "-p", "test_*.py", "-v"], cwd=str(BASE),
                            capture_output=True, text=True, timeout=180, check=False)
        text = (cp.stdout or "") + "\n" + (cp.stderr or "")
        ran = re.search(r"Ran\s+(\d+)\s+tests?", text)
        failed = len(re.findall(r"\.\.\.\s+(?:FAIL|ERROR)\b", text))
        return {"status": "PASS" if cp.returncode == 0 else "FAIL",
                "returncode": cp.returncode,
                "tests_ran": int(ran.group(1)) if ran else None,
                "fail_or_error_markers": failed,
                "tail": "\n".join(text.splitlines()[-18:])[-3000:]}
    except subprocess.TimeoutExpired:
        return {"status": "TIMEOUT"}


def system_inventory():
    win = sys.getwindowsversion()
    computer = {
        "name": os.environ.get("COMPUTERNAME"),
        "user": os.environ.get("USERNAME"),
        "logical_processors": os.cpu_count(),
        "architecture": os.environ.get("PROCESSOR_ARCHITECTURE"),
    }
    osinfo = {
        "system": "Windows",
        "major": win.major, "minor": win.minor, "build": win.build,
        "service_pack": win.service_pack,
    }
    disks = ps_json("Get-PSDrive -PSProvider FileSystem | Select-Object Name,Root,@{n='UsedGB';e={[math]::Round($_.Used/1GB,1)}},@{n='FreeGB';e={[math]::Round($_.Free/1GB,1)}}", 10)
    av = ps_json("Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct -ErrorAction SilentlyContinue | Select-Object displayName,productState", 10)
    startup = ps_json("$rows=@(); foreach($p in @('HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run','HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run')){if(Test-Path $p){$x=Get-ItemProperty $p; foreach($n in $x.PSObject.Properties.Name){if($n -notmatch '^PS'){ $rows += [pscustomobject]@{Name=$n;Location=$p;Command=[string]$x.$n}}}}}; $rows", 10)
    services = ps_json("Get-Service | Select-Object Name,DisplayName,Status,StartType", 10)
    tasks = ps_json("Get-ScheduledTask | Select-Object TaskName,TaskPath,State,@{n='LogonType';e={$_.Principal.LogonType}},@{n='UserId';e={$_.Principal.UserId}}", 12)
    listeners = ps_json("Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,OwningProcess", 10)
    return {"computer": computer, "os": osinfo, "disks": disks, "antivirus": av,
            "startup": startup, "services": services, "scheduled_tasks": tasks,
            "listeners": listeners}


def summarize_inventory(raw):
    def as_list(x):
        if x is None: return []
        return x if isinstance(x, list) else [x]
    services = as_list(raw.get("services"))
    tasks = as_list(raw.get("scheduled_tasks"))
    startup = as_list(raw.get("startup"))
    listeners = as_list(raw.get("listeners"))
    auto_services = [s for s in services if str(s.get("StartType", s.get("StartMode",""))).lower() in ("automatic","auto")]
    stopped_auto = [s.get("Name") for s in auto_services if str(s.get("Status", s.get("State",""))).lower()!="running"]
    hermes_tasks = [t for t in tasks if "hermes" in str(t.get("TaskName","")).lower() or "viktor" in str(t.get("TaskName","")).lower()]
    return {
        "installed_programs_count": None,
        "services_total": len(services),
        "auto_services": len(auto_services),
        "stopped_auto_services_sample": stopped_auto[:20],
        "scheduled_tasks_total": len(tasks),
        "hermes_tasks": hermes_tasks[:20],
        "startup_entries_total": len(startup),
        "startup_entries_sample": startup[:25],
        "tcp_listeners_total": len(listeners),
        "listeners_sample": listeners[:30],
    }


def ollama_generate(model, prompt, timeout=420):
    payload = json.dumps({
        "model": model, "prompt": prompt, "stream": False,
        "think": False,
        "options": {"temperature": 0.1, "num_ctx": 4096, "num_predict": 120}
    }, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(OLLAMA, data=payload,
                                 headers={"Content-Type": "application/json"},
                                 method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.load(resp)
    answer = str(data.get("response") or "").strip()
    if "</think>" in answer:
        answer = answer.split("</think>", 1)[-1].strip()
    elif answer.startswith("<think>"):
        # DeepSeek-R1 may spend the bounded output budget on reasoning. Do not
        # expose chain-of-thought as a recommendation; preserve only completion truth.
        answer = ""
    return answer


def main():
    status = {"state": "running", "started_at": stamp(), "mode": "FULL_LOCAL_READ_ONLY"}
    save_status(status)
    try:
        raw_system = system_inventory()
        programs = installed_programs()
        files = scan_files()
        viktor = viktor_snapshot()
        tests = run_viktor_tests()
        sys_summary = summarize_inventory(raw_system)
        sys_summary["installed_programs_count"] = len(programs)

        findings = []
        wr = viktor.get("runtime_receipt") or {}
        if wr.get("worker_processes") not in (None, 1):
            findings.append("Viktor logical worker count is not exactly one.")
        if wr.get("server_processes") not in (None, 1):
            findings.append("Viktor logical server count is not exactly one.")
        if wr.get("watchdog_unattended_ready") is False:
            findings.append("HermesViktorWatchdog is not unattended-ready according to runtime receipt.")
        if tests.get("status") != "PASS":
            findings.append("Viktor regression tests are not fully passing in this audit.")
        if files["scan_cap_reached"]:
            findings.append("File inventory reached safety cap; scan is broad but not literally exhaustive.")
        if files["sensitive_name_hits_count"]:
            findings.append("Credential/key-like filenames exist; contents were intentionally NOT read.")
        if sys_summary["stopped_auto_services_sample"]:
            findings.append("Some automatic Windows services are stopped; verify whether expected before changing anything.")

        compact = {
            "computer": raw_system.get("computer"),
            "os": raw_system.get("os"),
            "disks": raw_system.get("disks"),
            "antivirus": raw_system.get("antivirus"),
            "programs_count": len(programs),
            "program_examples": programs[:80],
            "system_summary": sys_summary,
            "files": {k:v for k,v in files.items() if k not in ("sensitive_name_examples","recent_script_examples")},
            "sensitive_name_hits_count": files["sensitive_name_hits_count"],
            "viktor": viktor,
            "viktor_tests": tests,
            "deterministic_findings": findings,
        }
        prompt = (
            "Ты DeepSeek — локальный технический аудитор Windows-компьютера Hermes. "
            "Проанализируй ТОЛЬКО факты JSON ниже. Не выдумывай уязвимости. "
            "Цель: повысить надёжность, производительность, безопасность и качество Hermes/Viktor AI. "
            "Не предлагай удалять файлы или отключать security/backup/AV без доказательств. "
            "Не проси секреты. Раздели ответ на: P0, P1, P2, затем 'Что НЕ трогать'. "
            "Для каждого пункта: факт -> риск -> безопасная проверка/исправление. "
            "Максимум 4 пункта, предельно кратко. Пиши по-русски.\nJSON:\n" +
            json.dumps(compact, ensure_ascii=False)[:12000]
        )
        guarded = call_text(prompt, [MODEL_PRIMARY, MODEL_FALLBACK],
                            timeout=480, num_predict=240, min_chars=20)
        model_used = str(guarded.get("model") or "none")
        model_output_valid = bool(guarded.get("ok"))
        advice = str(guarded.get("text") or "") if model_output_valid else (
            "DeepSeek final output rejected; deterministic audit completed and remains authoritative."
        )

        now = dt.datetime.now(dt.timezone.utc)
        report = [
            "# DeepSeek full Windows audit — Hermes",
            "",
            f"UTC: {now.isoformat()}",
            f"Mode: FULL_LOCAL_READ_ONLY",
            f"DeepSeek model: {model_used}",
            f"Installed programs inventoried: {len(programs)}",
            f"Files metadata scanned: {files['files_scanned']}",
            f"File scan cap reached: {files['scan_cap_reached']}",
            f"Viktor tests: {tests.get('status')} / {tests.get('tests_ran')}",
            "",
            "## Deterministic findings",
        ]
        report.extend("- " + x for x in findings)
        if not findings:
            report.append("- No deterministic high-confidence issue found in current checks.")
        report += [
            "",
            "## DeepSeek recommendations — require verification before changes",
            "",
            advice or "DeepSeek completed the bounded local analysis but emitted no final prose; deterministic findings above remain the actionable evidence.",
            "",
            "## Privacy/safety boundary",
            "",
            "This audit inventories filenames/metadata and system configuration. It does not extract credential contents, passwords, browser cookies or private-key material. No production/cloud/GitHub writes were performed.",
        ]
        text = "\n".join(report) + "\n"
        dated = OUT / ("full-audit-" + now.strftime("%Y%m%d-%H%M%S") + ".md")
        dated.write_text(text, encoding="utf-8")
        LATEST.write_text(text, encoding="utf-8")
        (OUT / "system-summary.json").write_text(json.dumps(compact, ensure_ascii=False, indent=2), encoding="utf-8")
        (OUT / "programs.json").write_text(json.dumps(programs, ensure_ascii=False, indent=2), encoding="utf-8")
        status.update({
            "state": "done", "finished_at": stamp(), "model": model_used,
            "model_output_valid": model_output_valid,
            "model_output_status": "MODEL_OUTPUT_ACCEPTED" if model_output_valid else "MODEL_OUTPUT_REJECTED",
            "model_attempts": guarded.get("attempts") or [],
            "programs": len(programs), "files_scanned": files["files_scanned"],
            "scan_cap_reached": files["scan_cap_reached"], "viktor_tests": tests.get("status"),
            "deterministic_findings": findings, "report": str(dated),
            "production_writes": 0, "github_writes": 0, "credential_contents_read": False,
        })
        print(json.dumps(status, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:
        status.update({"state":"error","finished_at":stamp(),"error_type":type(exc).__name__,"error":str(exc)[:300]})
        print(json.dumps(status, ensure_ascii=False))
        return 1
    finally:
        save_status(status)

if __name__ == "__main__":
    sys.exit(main())
