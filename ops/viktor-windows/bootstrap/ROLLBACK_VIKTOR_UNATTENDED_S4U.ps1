$ErrorActionPreference='Stop'
$taskName='HermesViktorWatchdogS4U'
$legacyTask='HermesViktorWatchdog'
$principalNow=New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if(-not $principalNow.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){
  [pscustomobject]@{status='ADMIN_ELEVATION_REQUIRED';changed=$false} | ConvertTo-Json -Compress
  exit 740
}
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
if(Get-ScheduledTask -TaskName $legacyTask -ErrorAction SilentlyContinue){
  Enable-ScheduledTask -TaskName $legacyTask | Out-Null
  Start-ScheduledTask -TaskName $legacyTask
}
[pscustomobject]@{status='ROLLBACK_COMPLETE';s4u_removed=$true;legacy_enabled=$true} | ConvertTo-Json -Compress