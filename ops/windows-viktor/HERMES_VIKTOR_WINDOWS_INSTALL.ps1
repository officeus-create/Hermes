param(
  [switch]$Watchdog,
  [string]$ZipPath="C:\Hermes\Incoming\HERMES_AI_WINDOWS_MIGRATION_2026-10-28.zip",
  [string]$Root="C:\Hermes",
  [string]$Model="qwen2.5:1.5b-instruct"
)
$ErrorActionPreference="Stop"
$Target=Join-Path $Root "Viktor"
$Run=Join-Path $Target "viktor_live"
$Logs=Join-Path $Root "Logs"
$Log=Join-Path $Logs "viktor-windows-bootstrap.log"
$ExpectedSha="7fb52b1c03c1e8e4a677504a4334f9c349d2e510bf90fa8f7e696f21284e7dd5"
$ExpectedLength=342575
New-Item -ItemType Directory -Force -Path $Root,$Logs | Out-Null
function L([string]$m){$x="$(Get-Date -Format o) $m";Add-Content -LiteralPath $Log -Value $x -Encoding UTF8;Write-Host $x}
function PyPath {
  $p=Join-Path $Target ".venv\Scripts\python.exe"; if(Test-Path $p){return $p}
  $g=Get-Command py.exe -ErrorAction SilentlyContinue
  if($g){try{$q=& $g.Source -3 -c "import sys;print(sys.executable)" 2>$null|Select-Object -First 1;if($q -and (Test-Path $q)){return $q.Trim()}}catch{}}
  $g=Get-Command python.exe -ErrorAction SilentlyContinue;if($g){return $g.Source}
  return $null
}
function OllamaPath {
  $g=Get-Command ollama.exe -ErrorAction SilentlyContinue;if($g){return $g.Source}
  foreach($p in @("$env:LOCALAPPDATA\Programs\Ollama\ollama.exe","$env:ProgramFiles\Ollama\ollama.exe")){if(Test-Path $p){return $p}}
  return $null
}
function Procs([string]$needle){@(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue|Where-Object{$_.CommandLine -and $_.CommandLine.IndexOf($needle,[StringComparison]::OrdinalIgnoreCase)-ge 0})}
function StartPy([string]$py,[string]$script,[string]$name){
  $o=Join-Path $Run ($name+".stdout.log");$e=Join-Path $Run ($name+".stderr.log")
  $env:VIKTOR_MODEL=$Model;$env:VIKTOR_CHAT_MODEL=$Model;$env:HERMES_AI_MODE="OPERATIONS";$env:PYTHONUNBUFFERED="1"
  Start-Process -FilePath $py -ArgumentList @((Join-Path $Target $script)) -WorkingDirectory $Target -WindowStyle Hidden -RedirectStandardOutput $o -RedirectStandardError $e
  L("START "+$name)
}
function RuntimeCheck {
  New-Item -ItemType Directory -Force -Path $Run | Out-Null
  $py=PyPath
  if(!$py){L "WAITING_PYTHON";return}
  $oll=OllamaPath
  $ollReady=$false;$modelReady=$false
  try{$tags=Invoke-RestMethod "http://127.0.0.1:11434/api/tags" -TimeoutSec 3;$ollReady=$true}catch{}
  if(!$ollReady -and $oll){
    $env:OLLAMA_HOST="127.0.0.1:11434"
    if((Procs "ollama.exe serve").Count -eq 0){Start-Process -FilePath $oll -ArgumentList @("serve") -WindowStyle Hidden -RedirectStandardOutput (Join-Path $Run "ollama.stdout.log") -RedirectStandardError (Join-Path $Run "ollama.stderr.log")}
    Start-Sleep 2
    try{$tags=Invoke-RestMethod "http://127.0.0.1:11434/api/tags" -TimeoutSec 3;$ollReady=$true}catch{}
  }
  if($ollReady){
    $names=@($tags.models|ForEach-Object{$_.name})
    $modelReady=$names -contains $Model
    if(!$modelReady -and $oll -and (Procs ("ollama.exe pull "+$Model)).Count -eq 0){
      L("MODEL_MISSING starting background pull "+$Model)
      Start-Process -FilePath $oll -ArgumentList @("pull",$Model) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $Run "model-pull.stdout.log") -RedirectStandardError (Join-Path $Run "model-pull.stderr.log")
    }
  }
  if((Procs "viktor_server.py").Count -eq 0){StartPy $py "viktor_server.py" "viktor_server";Start-Sleep 1}
  if($modelReady -and (Procs "viktor_worker.py").Count -eq 0){StartPy $py "viktor_worker.py" "viktor_worker"}
  $http=0;try{$r=Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:8765/ai-agents/" -TimeoutSec 4;$http=[int]$r.StatusCode}catch{}
  $st=$null;if(Test-Path (Join-Path $Run "status.json")){try{$st=Get-Content (Join-Path $Run "status.json") -Raw|ConvertFrom-Json}catch{}}
  [ordered]@{
    at=(Get-Date).ToString("o");dashboard_http=$http;ollama_ready=$ollReady;model=$Model;model_ready=$modelReady;
    server_processes=(Procs "viktor_server.py").Count;worker_processes=(Procs "viktor_worker.py").Count;
    status=if($st){$st.status}else{"STARTING"};phase=if($st){$st.phase}else{"STARTING"};
    loopback_only=$true;production_write_authorized=$false;canonical_runtime="HAE #2033"
  }|ConvertTo-Json -Depth 4|Set-Content (Join-Path $Run "windows_runtime_receipt.json") -Encoding UTF8
  L("HEALTH http=$http ollama=$ollReady model=$modelReady worker=$((Procs 'viktor_worker.py').Count)")
}
if($Watchdog){RuntimeCheck;exit 0}

L "BEGIN full Windows Viktor bootstrap; no reboot/network/NIC/AnyDesk/TeamViewer changes"
foreach($f in @((Join-Path $Root "CURRENT_STATUS.md"),(Join-Path $Root "NEXT_ACTION.md"),(Join-Path $Logs "codex-actions.log"))){if(Test-Path $f){L("FOUND "+$f)}}
if(!(Test-Path $ZipPath)){throw "Migration ZIP missing: $ZipPath"}
$i=Get-Item $ZipPath;$sha=(Get-FileHash $ZipPath -Algorithm SHA256).Hash.ToLowerInvariant()
L("ZIP len=$($i.Length) sha=$sha")
if($i.Length -ne $ExpectedLength -or $sha -ne $ExpectedSha){throw "Migration ZIP verification failed"}

$Stage=Join-Path $Root "ai_local_migration"
if(Test-Path $Stage){Move-Item $Stage ($Stage+".pre_"+(Get-Date -Format "yyyyMMdd_HHmmss"))}
New-Item -ItemType Directory -Force -Path $Stage|Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[IO.Compression.ZipFile]::OpenRead($ZipPath)
try{foreach($e in $z.Entries){if($e.FullName -match '(^[\\/])|(^[A-Za-z]:)|(^|[\\/])\.\.([\\/]|$)'){throw "Unsafe ZIP path"}}}finally{$z.Dispose()}
Expand-Archive $ZipPath $Stage -Force
if(!(Test-Path (Join-Path $Stage "source\viktor_server.py"))){throw "viktor_server.py missing"}
if(!(Test-Path (Join-Path $Stage "source\viktor_worker.py"))){throw "viktor_worker.py missing"}

if(Test-Path $Target){Move-Item $Target ($Target+".pre_"+(Get-Date -Format "yyyyMMdd_HHmmss"))}
New-Item -ItemType Directory -Force -Path $Target,$Run|Out-Null
Copy-Item (Join-Path $Stage "source\*") $Target -Recurse -Force
foreach($d in @("learning_reference","docs")){
  $s=Join-Path $Stage $d;if(Test-Path $s){Copy-Item (Join-Path $s "*") $Target -Recurse -Force}
}
$f=@'
import os
if os.name!="nt": raise ImportError("windows shim only")
import msvcrt
LOCK_EX=2;LOCK_NB=4;LOCK_UN=8
def flock(f,o):
    f.flush();f.seek(0,2)
    if f.tell()==0:f.write("\0");f.flush()
    f.seek(0)
    if o & LOCK_UN:
        try:msvcrt.locking(f.fileno(),msvcrt.LK_UNLCK,1)
        except OSError:pass
        return
    try:msvcrt.locking(f.fileno(),msvcrt.LK_NBLCK if o & LOCK_NB else msvcrt.LK_LOCK,1)
    except OSError as e:raise BlockingIOError(str(e))
'@
Set-Content (Join-Path $Target "fcntl.py") $f -Encoding UTF8
$ex=Join-Path $Target "hermes_ai_task_executor.py"
if(Test-Path $ex){
  $t=Get-Content $ex -Raw
  if($t -notmatch 'import sys'){$t=$t -replace 'import subprocess\r?\n',"import subprocess`r`nimport sys`r`n"}
  $t=$t -replace 'ROOT/"\.venv_access"/"bin"/"python"','ROOT/".venv_access"/"Scripts"/"python.exe"'
  $t=$t -replace '\["python3",str\(ROOT/"VIKTOR_REPLAY_LAB\.py"\)','[sys.executable,str(ROOT/"VIKTOR_REPLAY_LAB.py")'
  Set-Content $ex $t -Encoding UTF8
}
L "FILES installed and Windows compatibility applied"

$basePy=PyPath
if(!$basePy){
  $w=Get-Command winget.exe -ErrorAction SilentlyContinue
  if($w){L "INSTALL Python 3.12";& $w.Source install --id Python.Python.3.12 -e --scope user --accept-package-agreements --accept-source-agreements --silent;Start-Sleep 4;$basePy=PyPath}
}
if(!$basePy){throw "Python unavailable"}
& $basePy -m venv (Join-Path $Target ".venv")
$py=Join-Path $Target ".venv\Scripts\python.exe"
& $py -m pip install --disable-pip-version-check -q --upgrade pip
& $py -m pip install --disable-pip-version-check -q tzdata requests PyJWT
& $py -m py_compile (Join-Path $Target "viktor_server.py") (Join-Path $Target "viktor_worker.py") (Join-Path $Target "hermes_ai_task_executor.py")
& $py -c "from zoneinfo import ZoneInfo; assert ZoneInfo('Europe/Kyiv'); import fcntl; print('WINDOWS_IMPORT_SMOKE_PASS')"
if($LASTEXITCODE -ne 0){throw "Python smoke test failed"}
L "PYTHON smoke PASS"

$oll=OllamaPath
if(!$oll){
  $w=Get-Command winget.exe -ErrorAction SilentlyContinue
  if($w){L "INSTALL Ollama";& $w.Source install --id Ollama.Ollama -e --scope user --accept-package-agreements --accept-source-agreements --silent;Start-Sleep 4;$oll=OllamaPath}
}
if($oll){L("OLLAMA "+$oll)}else{L "OLLAMA unavailable; dashboard starts, worker fail-closed until runtime exists"}

$script=$MyInvocation.MyCommand.Path
$task='powershell.exe -NoProfile -ExecutionPolicy Bypass -File "'+$script+'" -Watchdog -Root "'+$Root+'" -Model "'+$Model+'"'
try{schtasks.exe /Create /SC MINUTE /MO 1 /TN "HermesViktorWatchdog" /TR $task /F|Out-Null;L "TASK watchdog every minute registered"}catch{L("TASK register failed "+$_.Exception.Message)}
$startup=[Environment]::GetFolderPath("Startup");$cmd=Join-Path $startup "HermesViktorWatchdog.cmd"
('@echo off'+"`r`n"+$task+"`r`n")|Set-Content $cmd -Encoding ASCII
L "STARTUP fallback registered"

RuntimeCheck
Start-Sleep 3
RuntimeCheck
$receipt=Join-Path $Run "windows_runtime_receipt.json"
if(Test-Path $receipt){Copy-Item $receipt (Join-Path $Logs "viktor-health-first-run.json") -Force}
$checkpoint=@"

## Hermes Viktor Windows bootstrap — $(Get-Date -Format "yyyy-MM-dd HH:mm:ss K")
- Migration ZIP verified: $ExpectedLength bytes; SHA256 $ExpectedSha.
- Installed: $Target
- Local cockpit: http://127.0.0.1:8765/ai-agents/ (loopback only).
- Watchdog: Windows Task Scheduler every minute + Startup fallback.
- Model target: $Model; no paid fallback.
- No reboot, NIC/Network Reset, AnyDesk/TeamViewer changes, production writes, or second HAE.
- HAE #2033 remains canonical runtime/backlog.
- PROBABLE PHYSICAL ETHERNET FAULT remains unresolved hardware risk.
- Evidence: C:\Hermes\Logs\viktor-health-first-run.json and C:\Hermes\Viktor\viktor_live\windows_runtime_receipt.json
"@
Add-Content (Join-Path $Root "CURRENT_STATUS.md") $checkpoint -Encoding UTF8
Add-Content (Join-Path $Logs "codex-actions.log") $checkpoint -Encoding UTF8
L "BOOTSTRAP COMPLETE"
