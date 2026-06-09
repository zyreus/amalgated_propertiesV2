# Run PM2 for this project (Windows pipe fix + isolated PM2_HOME)
$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$env:PM2_HOME = Join-Path $ProjectRoot '.pm2'
$env:Path = 'C:\Program Files\nodejs;' + $env:Path

$pm2 = Join-Path $ProjectRoot 'node_modules\pm2\bin\pm2'
if (-not (Test-Path $pm2)) {
  Write-Error 'PM2 not installed. Run: npm install'
}

# "pm2 start all" → start frontend + api from ecosystem.config.cjs
if ($args.Count -ge 2 -and $args[0] -eq 'start' -and $args[1] -eq 'all') {
  $args = @('start', 'ecosystem.config.cjs')
}

$ecosystem = Join-Path $ProjectRoot 'ecosystem.config.cjs'

# restart/reload after free-ports kills PIDs -> use start (avoids "Process 0 not found")
if ($args.Count -ge 1 -and ($args[0] -eq 'restart' -or $args[0] -eq 'reload')) {
  $targetAll = $args.Count -eq 1 -or ($args.Count -ge 2 -and $args[1] -eq 'all')
  if ($targetAll) {
    & (Join-Path $ProjectRoot 'scripts\free-ports.ps1')
    & node $pm2 delete all 2>$null
    & node $pm2 start $ecosystem --update-env
    exit $LASTEXITCODE
  }
}

$needsPortCleanup = @('start')
if ($args.Count -gt 0 -and ($needsPortCleanup -contains $args[0])) {
  & (Join-Path $ProjectRoot 'scripts\free-ports.ps1')
}

& node $pm2 @args
