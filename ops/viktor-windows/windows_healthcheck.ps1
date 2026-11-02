$Target="C:\Hermes\Viktor"
$Run=Join-Path $Target "viktor_live"
$r=[ordered]@{at=(Get-Date).ToString("o")}
try { $x=Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:8765/ai-agents/" -TimeoutSec 4; $r.dashboard_http=[int]$x.StatusCode } catch { $r.dashboard_http=0 }
try { $tags=Invoke-RestMethod "http://127.0.0.1:11434/api/tags" -TimeoutSec 4; $r.ollama=$true; $r.models=@($tags.models|% name) } catch { $r.ollama=$false; $r.models=@() }
$r.server=@(Get-CimInstance Win32_Process | ? {$_.CommandLine -like "*viktor_server.py*"}).Count
$r.worker=@(Get-CimInstance Win32_Process | ? {$_.CommandLine -like "*viktor_worker.py*"}).Count
if(Test-Path (Join-Path $Run "status.json")){try{$r.status=Get-Content (Join-Path $Run "status.json") -Raw|ConvertFrom-Json}catch{}}
$r | ConvertTo-Json -Depth 6