# Kill orphan listeners on project ports (API 8020, Vite 6175)
$ports = @(8020, 6175)
foreach ($port in $ports) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $conns) {
    $procId = $conn.OwningProcess
    if (-not $procId) { continue }
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $procId" -ErrorAction SilentlyContinue
    if ($proc -and $proc.CommandLine -like '*amalgated_propertiesV2*') {
      Write-Host "Stopping orphan on port ${port}: PID $procId"
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
  }
}
Start-Sleep -Seconds 1
