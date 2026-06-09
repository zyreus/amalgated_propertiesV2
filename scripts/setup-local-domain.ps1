# Maps theamalgatedproperties.com to this machine on the LAN (run as Administrator).
$ErrorActionPreference = 'Stop'

$ip = '192.168.0.222'
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$marker = '# amalgated-properties-local'
$entry = "$ip theamalgatedproperties.com www.theamalgatedproperties.com $marker"

$principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Re-launching as Administrator...' -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass',
        '-File', $PSCommandPath
    )
    exit
}

$content = Get-Content $hostsPath -Raw
if ($content -match [regex]::Escape($marker)) {
    $lines = Get-Content $hostsPath | Where-Object { $_ -notmatch [regex]::Escape($marker) }
    $lines += $entry
    Set-Content -Path $hostsPath -Value $lines -Encoding ascii
    Write-Host "Updated hosts entry -> $ip theamalgatedproperties.com" -ForegroundColor Green
} elseif ($content -match 'theamalgatedproperties\.com') {
    Write-Host 'theamalgatedproperties.com already exists in hosts (not managed by this script).' -ForegroundColor Yellow
} else {
    Add-Content -Path $hostsPath -Value "`n$entry"
    Write-Host "Added hosts entry -> $ip theamalgatedproperties.com" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Next: enable Apache proxy modules and restart Apache (XAMPP).' -ForegroundColor Cyan
Write-Host '  npm run domain:apache' -ForegroundColor Cyan
Write-Host '  npm run pm2:start' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Then open: https://theamalgatedproperties.com/' -ForegroundColor Cyan
Write-Host '(Browser will warn about XAMPP self-signed SSL — proceed for local testing.)' -ForegroundColor DarkGray
