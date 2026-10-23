# ARCHON 2.0 — Live Terminal Log Streamer
[CmdletBinding()]
param(
    [ValidateSet("all", "django", "nextjs")]
    [string]$Service = "all",
    [int]$Lines = 25
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$LogsDir = Join-Path $ScriptDir "logs"

if (-not (Test-Path $LogsDir)) {
    Write-Host "[ERROR] Logs directory not found at $LogsDir. Has ARCHON been started?" -ForegroundColor Red
    exit 1
}

$DjangoOut = Join-Path $LogsDir "django_out.log"
$DjangoErr = Join-Path $LogsDir "django_err.log"
$NextOut = Join-Path $LogsDir "nextjs_out.log"
$NextErr = Join-Path $LogsDir "nextjs_err.log"

$targets = @()

if ($Service -eq "all" -or $Service -eq "django") {
    if (Test-Path $DjangoOut) { $targets += $DjangoOut }
    if (Test-Path $DjangoErr) { $targets += $DjangoErr }
}

if ($Service -eq "all" -or $Service -eq "nextjs") {
    if (Test-Path $NextOut) { $targets += $NextOut }
    if (Test-Path $NextErr) { $targets += $NextErr }
}

if ($targets.Count -eq 0) {
    Write-Host "[WARN] No active log files found yet in $LogsDir." -ForegroundColor Yellow
    exit 0
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         ARCHON 2.0 LIVE LOG STREAMER                     " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Streaming live logs (Press Ctrl+C to stop viewing):" -ForegroundColor White
$targets | ForEach-Object { Write-Host "  • $_" -ForegroundColor DarkGray }
Write-Host ""

Get-Content -Path $targets -Wait -Tail $Lines
