# Enables reverse-proxy modules and includes site vhost in XAMPP Apache (run as Administrator).
$ErrorActionPreference = 'Stop'

$principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Re-launching as Administrator...' -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass',
        '-File', $PSCommandPath
    )
    exit
}

$httpd = 'C:\xampp\apache\conf\httpd.conf'
$includeLine = 'Include "C:/xampp/htdocs/amalgated_propertiesV2/deploy/apache-theamalgatedproperties.conf"'

if (-not (Test-Path $httpd)) {
    Write-Error "Apache config not found: $httpd"
}

$text = Get-Content $httpd -Raw
$changed = $false

if ($text -notmatch [regex]::Escape($includeLine)) {
    $text = $text.TrimEnd() + "`r`n`r`n# Amalgated Properties local domain`r`n$includeLine`r`n"
    $changed = $true
    Write-Host 'Added Apache Include for theamalgatedproperties.com' -ForegroundColor Green
}

$replacements = @{
    '#LoadModule proxy_http_module'   = 'LoadModule proxy_http_module'
    '#LoadModule proxy_wstunnel_module' = 'LoadModule proxy_wstunnel_module'
}
foreach ($pair in $replacements.GetEnumerator()) {
    if ($text -match [regex]::Escape($pair.Key)) {
        $text = $text.Replace($pair.Key, $pair.Value)
        $changed = $true
        Write-Host "Enabled $($pair.Value)" -ForegroundColor Green
    }
}

if ($changed) {
    Set-Content -Path $httpd -Value $text -NoNewline
}

Write-Host ''
Write-Host 'Restart Apache from XAMPP Control Panel (Stop Apache, then Start).' -ForegroundColor Cyan
