$ErrorActionPreference = "SilentlyContinue"
$existing = @(Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -and (
    $_.CommandLine -match '@wonderwhy-er/desktop-commander@0\.3\.1\s+remote' -or
    $_.CommandLine -match 'desktop-commander\s+remote'
  )
})
if ($existing.Count -gt 0) {
  Add-Content -LiteralPath "C:\Hermes\Logs\desktop-commander-autostart.log" -Value ("{0} ALREADY_RUNNING count={1}" -f (Get-Date -Format o), $existing.Count)
  exit 0
}
$cmd = "C:\Program Files\nodejs\npx.cmd"
if (!(Test-Path -LiteralPath $cmd)) {
  Add-Content -LiteralPath "C:\Hermes\Logs\desktop-commander-autostart.log" -Value ("{0} NPX_MISSING" -f (Get-Date -Format o))
  exit 20
}
Start-Process -FilePath $cmd -ArgumentList @("--yes","@wonderwhy-er/desktop-commander@0.3.1","remote") -WindowStyle Minimized
Add-Content -LiteralPath "C:\Hermes\Logs\desktop-commander-autostart.log" -Value ("{0} START_REQUESTED version=0.3.1" -f (Get-Date -Format o))