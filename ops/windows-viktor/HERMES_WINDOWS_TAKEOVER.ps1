param(
  [string]$Root="C:\Hermes"
)
$ErrorActionPreference="Stop"
New-Item -ItemType Directory -Force -Path $Root,(Join-Path $Root "Logs") | Out-Null
$log=Join-Path $Root "Logs\windows-takeover.log"
function L([string]$m){$x="$(Get-Date -Format o) $m";Add-Content -LiteralPath $log -Value $x -Encoding UTF8;Write-Host $x}

L "BEGIN Windows takeover bootstrap; no reboot/network reset/NIC/AnyDesk/TeamViewer changes"

# 1) Ensure Node.js/npx for Desktop Commander Remote Agent.
$npx=Get-Command npx.cmd -ErrorAction SilentlyContinue
if(!$npx){
  $winget=Get-Command winget.exe -ErrorAction SilentlyContinue
  if(!$winget){throw "npx missing and winget unavailable"}
  L "Installing Node.js LTS for Desktop Commander"
  & $winget.Source install --id OpenJS.NodeJS.LTS -e --scope user --accept-package-agreements --accept-source-agreements --silent
  Start-Sleep 5
  $env:Path="$env:LOCALAPPDATA\Programs\nodejs;$env:ProgramFiles\nodejs;$env:Path"
  $npx=Get-Command npx.cmd -ErrorAction SilentlyContinue
}
if(!$npx){throw "npx unavailable after install attempt"}
L ("NPX="+$npx.Source)

# 2) Start Desktop Commander Remote Agent if it is not already running.
$dc=@(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -and $_.CommandLine -match 'desktop-commander.*remote'
})
if($dc.Count -eq 0){
  $dcOut=Join-Path $Root "Logs\desktop-commander-remote.stdout.log"
  $dcErr=Join-Path $Root "Logs\desktop-commander-remote.stderr.log"
  L "Starting Desktop Commander Remote Agent. First-time browser/account pairing may appear."
  Start-Process -FilePath "cmd.exe" -ArgumentList @("/c","npx -y @wonderwhy-er/desktop-commander@latest remote") -WindowStyle Normal -RedirectStandardOutput $dcOut -RedirectStandardError $dcErr
  Start-Sleep 4
}else{
  L ("Desktop Commander Remote Agent already running count="+$dc.Count)
}

# Add current-user logon fallback only. No admin rights, no service replacement.
$startup=[Environment]::GetFolderPath("Startup")
$dcCmd=Join-Path $startup "HermesDesktopCommanderRemote.cmd"
('@echo off'+"\r\n"+'start "" /min cmd.exe /c "npx -y @wonderwhy-er/desktop-commander@latest remote >> C:\Hermes\Logs\desktop-commander-remote.stdout.log 2>> C:\Hermes\Logs\desktop-commander-remote.stderr.log"'+"\r\n") | Set-Content -LiteralPath $dcCmd -Encoding ASCII
L ("Desktop Commander Startup fallback="+$dcCmd)

# 3) Continue the exact verified Viktor bootstrap from GitHub.
$installer=Join-Path $Root "viktor-install.ps1"
$url='https://raw.githubusercontent.com/officeus-create/Hermes/windows-viktor-bootstrap-20261028/ops/windows-viktor/HERMES_VIKTOR_WINDOWS_INSTALL.ps1'
L "Downloading Viktor installer from isolated GitHub branch"
Invoke-WebRequest -UseBasicParsing $url -OutFile $installer
L ("Downloaded "+$installer)

# Read-only verify file exists and is non-empty before execution.
$i=Get-Item $installer
if($i.Length -lt 5000){throw "Viktor installer unexpectedly small"}
L ("Viktor installer bytes="+$i.Length)

# Run installer. It independently verifies migration ZIP SHA before extraction.
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installer
$exit=$LASTEXITCODE
L ("Viktor installer exit="+$exit)

# 4) Local evidence snapshot.
$receipt=Join-Path $Root "Viktor\viktor_live\windows_runtime_receipt.json"
if(Test-Path $receipt){
  Copy-Item $receipt (Join-Path $Root "Logs\windows-runtime-receipt-latest.json") -Force
  L "Runtime receipt captured"
}else{
  L "Runtime receipt not yet present"
}

L "TAKEOVER_BOOTSTRAP_FINISHED"
Write-Host ""
Write-Host "Desktop Commander Remote Agent has been started."
Write-Host "If a one-time sign-in/pairing page is visible, complete it with the corporate account."
Write-Host "Viktor evidence: C:\Hermes\Logs\windows-runtime-receipt-latest.json"
