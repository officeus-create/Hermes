param(
  [string]$Target = "C:\Hermes\Viktor",
  [string]$Model = "qwen2.5:1.5b-instruct"
)
$ErrorActionPreference = "SilentlyContinue"
$Run = Join-Path $Target "viktor_live"
$Logs = "C:\Hermes\Logs"
New-Item -ItemType Directory -Force -Path $Run,$Logs | Out-Null
$Log = Join-Path $Logs "viktor-watchdog.log"
function L([string]$m) { Add-Content -LiteralPath $Log -Value ("{0} {1}" -f (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"),$m) -Encoding UTF8 }
$Py = Join-Path $Target ".venv\Scripts\python.exe"
if (!(Test-Path $Py)) { L "WAITING_PYTHON_ENV"; exit 20 }

function Proc([string]$needle) {
  @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and $_.CommandLine.IndexOf($needle,[StringComparison]::OrdinalIgnoreCase) -ge 0
  })
}
function StartPy([string]$script,[string]$name) {
  $out = Join-Path $Run ($name + ".stdout.log")
  $err = Join-Path $Run ($name + ".stderr.log")
  $env:VIKTOR_MODEL = $Model
  $env:VIKTOR_CHAT_MODEL = $Model
  $env:HERMES_AI_MODE = "OPERATIONS"
  Start-Process -FilePath $Py -ArgumentList @((Join-Path $Target $script)) -WorkingDirectory $Target -WindowStyle Hidden -RedirectStandardOutput $out -RedirectStandardError $err
  L ("STARTED " + $name)
}

# Find/start Ollama, but never expose it beyond loopback.
$ollama = (Get-Command ollama.exe -ErrorAction SilentlyContinue).Source
if (!$ollama) {
  foreach ($p in @("$env:LOCALAPPDATA\Programs\Ollama\ollama.exe","$env:ProgramFiles\Ollama\ollama.exe")) {
    if (Test-Path $p) { $ollama=$p; break }
  }
}
$ollamaReady=$false
try {
  $tags=Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3
  $ollamaReady=$true
} catch {}
if (!$ollamaReady -and $ollama) {
  $env:OLLAMA_HOST="127.0.0.1:11434"
  Start-Process -FilePath $ollama -ArgumentList @("serve") -WindowStyle Hidden -RedirectStandardOutput (Join-Path $Run "ollama.stdout.log") -RedirectStandardError (Join-Path $Run "ollama.stderr.log")
  Start-Sleep -Seconds 3
  try { $tags=Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 3; $ollamaReady=$true } catch {}
}
if (!$ollamaReady) { L "WAITING_OLLAMA_RUNTIME" }

$modelReady=$false
if ($ollamaReady) {
  $names=@($tags.models | ForEach-Object { $_.name })
  if ($names -contains $Model) { $modelReady=$true } else { L ("WAITING_MODEL " + $Model) }
}

# Dashboard is useful even while model is pending.
if ((Proc "viktor_server.py").Count -eq 0) { StartPy "viktor_server.py" "viktor_server" }
Start-Sleep -Milliseconds 700

# Worker starts only with a verified local model; no paid fallback.
if ($modelReady -and (Proc "viktor_worker.py").Count -eq 0) { StartPy "viktor_worker.py" "viktor_worker" }

$http=0
try {
  $r=Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:8765/ai-agents/" -TimeoutSec 4
  $http=[int]$r.StatusCode
} catch {}
$statusFile=Join-Path $Run "status.json"
$state="STARTING"
$phase="STARTING"
$workerHeartbeatAge=$null
$workerStaleRestart=$false
if (Test-Path $statusFile) {
  try {
    $s=Get-Content -LiteralPath $statusFile -Raw | ConvertFrom-Json
    $state=[string]$s.status
    $phase=[string]$s.phase
    if ($s.updated_at) {
      $updated=[DateTimeOffset]::Parse([string]$s.updated_at)
      $workerHeartbeatAge=[int][Math]::Max(0,([DateTimeOffset]::Now-$updated).TotalSeconds)
    }
  } catch {}
}
# A live PID is not enough: recover a worker that stopped advancing its status.
# Normal local model/provider calls are bounded well below this 20-minute threshold.
if ($modelReady -and $workerHeartbeatAge -ne $null -and $workerHeartbeatAge -gt 1200 -and (Proc "viktor_worker.py").Count -gt 0) {
  $stale=@(Proc "viktor_worker.py")
  foreach ($p in $stale) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Milliseconds 500
  StartPy "viktor_worker.py" "viktor_worker"
  $workerStaleRestart=$true
  L ("RECOVERED_STALE_WORKER heartbeat_age_seconds=" + $workerHeartbeatAge)
  Start-Sleep -Milliseconds 700
}
$serverRaw=(Proc "viktor_server.py").Count
$workerRaw=(Proc "viktor_worker.py").Count
$haeClientPresent=Test-Path (Join-Path $Target "hermes_hae_windows_node.py")
$haeEnabled=([Environment]::GetEnvironmentVariable("HERMES_HAE_WINDOWS_NODE_ENABLED","Process") -eq "1") -or ([Environment]::GetEnvironmentVariable("HERMES_HAE_WINDOWS_NODE_ENABLED","User") -eq "1") -or ([Environment]::GetEnvironmentVariable("HERMES_HAE_WINDOWS_NODE_ENABLED","Machine") -eq "1")
$haeApiConfigured=[bool]([Environment]::GetEnvironmentVariable("HERMES_HAE_API","Process") -or [Environment]::GetEnvironmentVariable("HERMES_HAE_API","User") -or [Environment]::GetEnvironmentVariable("HERMES_HAE_API","Machine"))
$haeTokenConfigured=[bool]([Environment]::GetEnvironmentVariable("HERMES_HAE_WINDOWS_NODE_TOKEN","Process") -or [Environment]::GetEnvironmentVariable("HERMES_HAE_WINDOWS_NODE_TOKEN","User") -or [Environment]::GetEnvironmentVariable("HERMES_HAE_WINDOWS_NODE_TOKEN","Machine"))

# Local handoff files are advisory only. Reject them as CURRENT when their file evidence is stale.
function LocalSourceAgeHours([string]$path) {
  if (!(Test-Path -LiteralPath $path)) { return $null }
  try {
    $item=Get-Item -LiteralPath $path -ErrorAction Stop
    return [Math]::Round(([DateTime]::UtcNow-$item.LastWriteTimeUtc).TotalHours,2)
  } catch { return $null }
}
$currentStatusPath="C:\Hermes\CURRENT_STATUS.md"
$nextActionPath="C:\Hermes\NEXT_ACTION.md"
$currentStatusAgeHours=LocalSourceAgeHours $currentStatusPath
$nextActionAgeHours=LocalSourceAgeHours $nextActionPath
$currentStatusStale=($currentStatusAgeHours -eq $null) -or ($currentStatusAgeHours -gt 24)
$nextActionStale=($nextActionAgeHours -eq $null) -or ($nextActionAgeHours -gt 24)
if ($currentStatusStale -or $nextActionStale) {
  L ("STALE_LOCAL_SOURCE current_status_age_hours={0} next_action_age_hours={1} policy=SOURCE_ONLY_REJECT_IF_STALE" -f $currentStatusAgeHours,$nextActionAgeHours)
}
$pluginProviderSnapshotPath="C:\Hermes\Viktor\HERMES_PRIVATE_PLUGIN_INVENTORY_CURRENT.json"
$pluginProviderSnapshotAgeHours=$null
$pluginProviderSnapshotFresh=$false
try {
  $pluginSnapshot=Get-Content -LiteralPath $pluginProviderSnapshotPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if($pluginSnapshot.observed_at){
    $observed=[DateTimeOffset]::Parse([string]$pluginSnapshot.observed_at)
    $pluginProviderSnapshotAgeHours=[Math]::Round(([DateTimeOffset]::Now-$observed).TotalHours,2)
    $pluginProviderSnapshotFresh=($pluginProviderSnapshotAgeHours -ge 0 -and $pluginProviderSnapshotAgeHours -le 24 -and [string]$pluginSnapshot.source_class -eq "PRIVATE_PLUGIN_CREATOR_READBACK")
  }
}catch{}
if(-not $pluginProviderSnapshotFresh){
  L ("PLUGIN_PROVIDER_TRUTH_HOLD age_hours={0} policy=AUTHENTICATED_READBACK_MAX_24H" -f $pluginProviderSnapshotAgeHours)
}
$watchdogTask=Get-ScheduledTask -TaskName "HermesViktorWatchdog" -ErrorAction SilentlyContinue
$watchdogTaskLogonType=if($watchdogTask){[string]$watchdogTask.Principal.LogonType}else{"MISSING"}
$watchdogUnattendedReady=$watchdogTaskLogonType -in @("S4U","ServiceAccount","Password")
if(-not $watchdogUnattendedReady){
  L ("UNATTENDED_RUNTIME_HOLD watchdog_task_logon_type={0}" -f $watchdogTaskLogonType)
}
$remoteAgentStartupPath="C:\Users\user\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\HermesRemoteAgent.cmd"
$remoteAgentStartupConfigured=Test-Path -LiteralPath $remoteAgentStartupPath
$remoteAgentRaw=@(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -and ($_.CommandLine -match 'desktop-commander\s+remote' -or $_.CommandLine -match '@wonderwhy-er/desktop-commander@0\.3\.1\s+remote')
}).Count
$receipt=[ordered]@{
  at=(Get-Date).ToString("o")
  dashboard_http=$http
  ollama_ready=$ollamaReady
  model=$Model
  model_ready=$modelReady
  server_processes=($(if ($serverRaw -gt 0) {1} else {0}))
  server_processes_raw=$serverRaw
  worker_processes=($(if ($workerRaw -gt 0) {1} else {0}))
  worker_processes_raw=$workerRaw
  worker_heartbeat_age_seconds=$workerHeartbeatAge
  worker_stale_restart=$workerStaleRestart
  viktor_status=$state
  viktor_phase=$phase
  hae_node_client_present=$haeClientPresent
  hae_node_enabled=$haeEnabled
  hae_node_api_configured=$haeApiConfigured
  hae_node_token_configured=$haeTokenConfigured
  local_source_policy="SOURCE_ONLY_REJECT_IF_STALE"
  current_status_age_hours=$currentStatusAgeHours
  current_status_stale=$currentStatusStale
  next_action_age_hours=$nextActionAgeHours
  next_action_stale=$nextActionStale
  plugin_provider_snapshot_age_hours=$pluginProviderSnapshotAgeHours
  plugin_provider_snapshot_fresh=$pluginProviderSnapshotFresh
  watchdog_task_logon_type=$watchdogTaskLogonType
  watchdog_unattended_ready=$watchdogUnattendedReady
  remote_agent_startup_configured=$remoteAgentStartupConfigured
  remote_agent_processes_raw=$remoteAgentRaw
  remote_agent_pinned_version="0.3.1"
  external_bind="127.0.0.1 only"
  production_write_authorized=$false
}
$receipt | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $Run "windows_runtime_receipt.json") -Encoding UTF8
L ("HEALTH dashboard_http={0} ollama={1} model={2} worker_logical={3} worker_raw={4} state={5}/{6}" -f $http,$ollamaReady,$modelReady,$receipt.worker_processes,$receipt.worker_processes_raw,$state,$phase)