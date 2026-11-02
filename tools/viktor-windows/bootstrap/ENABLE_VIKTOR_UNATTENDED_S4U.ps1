param(
  [string]$Target='C:\Hermes\Viktor',
  [string]$Model='qwen2.5:1.5b-instruct'
)
$ErrorActionPreference='Stop'
$taskName='HermesViktorWatchdogS4U'
$legacyTask='HermesViktorWatchdog'
$backupDir='C:\Hermes\Recovery'
$receipt=Join-Path $Target 'viktor_live\windows_runtime_receipt.json'
$principalNow=New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if(-not $principalNow.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){
  [pscustomobject]@{status='ADMIN_ELEVATION_REQUIRED';task=$taskName;changed=$false} | ConvertTo-Json -Compress
  exit 740
}
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
if(Get-ScheduledTask -TaskName $legacyTask -ErrorAction SilentlyContinue){
  schtasks.exe /Query /TN $legacyTask /XML | Set-Content -LiteralPath (Join-Path $backupDir 'HermesViktorWatchdog.interactive-backup.xml') -Encoding Unicode
}
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
$action=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -ExecutionPolicy Bypass -File "'+(Join-Path $Target 'windows_watchdog.ps1')+'" -Target "'+$Target+'" -Model "'+$Model+'"')
$boot=New-ScheduledTaskTrigger -AtStartup
$repeat=New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
$userId=[Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal=New-ScheduledTaskPrincipal -UserId $userId -LogonType S4U -RunLevel Highest
$settings=New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$settings.DisallowStartIfOnBatteries=$false
$settings.StopIfGoingOnBatteries=$false
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($boot,$repeat) -Principal $principal -Settings $settings | Out-Null
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 5
$t=Get-ScheduledTask -TaskName $taskName
$info=Get-ScheduledTaskInfo -TaskName $taskName
$fresh=$false
if(Test-Path $receipt){
  try{
    $r=Get-Content -LiteralPath $receipt -Raw -Encoding UTF8 | ConvertFrom-Json
    if($r.at){$fresh=([DateTimeOffset]::Now-[DateTimeOffset]::Parse([string]$r.at)).TotalSeconds -lt 120}
  }catch{}
}
$verified=([string]$t.Principal.LogonType -eq 'S4U' -and $info.LastTaskResult -eq 0 -and $fresh)
if($verified -and (Get-ScheduledTask -TaskName $legacyTask -ErrorAction SilentlyContinue)){
  Disable-ScheduledTask -TaskName $legacyTask | Out-Null
}
[pscustomobject]@{
  status=if($verified){'S4U_CONFIGURED_LOCAL_CANARY_PASS'}else{'S4U_CONFIGURED_CANARY_INCOMPLETE'}
  task=$taskName
  logon_type=[string]$t.Principal.LogonType
  run_level=[string]$t.Principal.RunLevel
  last_result=$info.LastTaskResult
  runtime_receipt_fresh=$fresh
  legacy_disabled=if(Get-ScheduledTask -TaskName $legacyTask -ErrorAction SilentlyContinue){(Get-ScheduledTask -TaskName $legacyTask).State -eq 'Disabled'}else{$false}
  reboot_proved=$false
  plaintext_password_stored=$false
} | ConvertTo-Json -Compress