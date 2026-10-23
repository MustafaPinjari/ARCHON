# ==============================================================================
# ARCHON 2.0 - Windows Platform Startup Script (PowerShell)
# Starts Django REST Backend (:8000) and Next.js App Router (:3000)
# ==============================================================================

[CmdletBinding()]
param (
    [switch]$NoBrowser,
    [switch]$Stop,
    [switch]$Detach,
    [int]$TimeoutSeconds = 40
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogsDir = Join-Path $ScriptDir "logs"
$DjangoPidFile = Join-Path $LogsDir "django.pid"
$NextPidFile = Join-Path $LogsDir "nextjs.pid"

function Write-Info([string]$msg) {
    Write-Host "[INFO] $msg" -ForegroundColor Cyan
}

function Write-Success([string]$msg) {
    Write-Host "[SUCCESS] $msg" -ForegroundColor Green
}

function Write-WarningMsg([string]$msg) {
    Write-Host "[WARN] $msg" -ForegroundColor Yellow
}

function Write-ErrorMsg([string]$msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
}

function Stop-ArchonServices {
    Write-Info "Stopping ARCHON services..."
    
    if (Test-Path $DjangoPidFile) {
        $pidVal = Get-Content $DjangoPidFile -ErrorAction SilentlyContinue
        if ($pidVal) {
            $p = Get-Process -Id $pidVal -ErrorAction SilentlyContinue
            if ($p) {
                Write-Info "Stopping Django process (PID: $pidVal)..."
                Stop-Process -Id $pidVal -Force -ErrorAction SilentlyContinue
            }
        }
        Remove-Item $DjangoPidFile -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path $NextPidFile) {
        $pidVal = Get-Content $NextPidFile -ErrorAction SilentlyContinue
        if ($pidVal) {
            $p = Get-Process -Id $pidVal -ErrorAction SilentlyContinue
            if ($p) {
                Write-Info "Stopping Next.js process (PID: $pidVal)..."
                Stop-Process -Id $pidVal -Force -ErrorAction SilentlyContinue
            }
        }
        Remove-Item $NextPidFile -Force -ErrorAction SilentlyContinue
    }

    Write-Success "All ARCHON services stopped."
}

if ($Stop) {
    Stop-ArchonServices
    exit 0
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "          ARCHON 2.0 - Engineering Memory Engine          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Resolve Paths & Prerequisites
$PythonExe = Join-Path $ScriptDir ".venv\Scripts\python.exe"
$ManagePy = Join-Path $ScriptDir "manage.py"
$WebDir = Join-Path $ScriptDir "web"
$WebPackageJson = Join-Path $WebDir "package.json"
$WebNodeModules = Join-Path $WebDir "node_modules"

if (-not (Test-Path $PythonExe)) {
    Write-ErrorMsg "Python virtual environment not found at: $PythonExe"
    Write-ErrorMsg "Please create a virtualenv with Python 3.12+ and install requirements.txt."
    exit 1
}

if (-not (Test-Path $ManagePy)) {
    Write-ErrorMsg "Django manage.py not found in root: $ManagePy"
    exit 1
}

if (-not (Test-Path $WebPackageJson)) {
    Write-ErrorMsg "Next.js package.json not found in: $WebDir"
    exit 1
}

if (-not (Test-Path $WebNodeModules)) {
    Write-ErrorMsg "Node modules not found in: $WebDir. Please run npm install in the web directory."
    exit 1
}

# Resolve npm executable
$NpmCmd = "npm.cmd"
if (-not (Get-Command $NpmCmd -ErrorAction SilentlyContinue)) {
    $NpmCmd = "npm"
    if (-not (Get-Command $NpmCmd -ErrorAction SilentlyContinue)) {
        Write-ErrorMsg "Neither npm.cmd nor npm was found in PATH."
        exit 1
    }
}

# 2. Check Port Availability (8000 and 3000)
Write-Info "Checking port availability..."

function Test-PortInUse([int]$Port) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
        return @{ InUse = $false; Port = $Port; Pid = $null }
    } catch {
        $owningPid = $null
        try {
            $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
            if ($conns) { $owningPid = ($conns | Select-Object -First 1).OwningProcess }
        } catch {}
        return @{ InUse = $true; Port = $Port; Pid = $owningPid }
    }
}

$port8000 = Test-PortInUse 8000
if ($port8000.InUse) {
    if ($port8000.Pid) {
        Write-Info "Port 8000 is occupied by PID $($port8000.Pid). Automatically stopping stale process..."
        Stop-Process -Id $port8000.Pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 600
    }
}

$port3000 = Test-PortInUse 3000
if ($port3000.InUse) {
    if ($port3000.Pid) {
        Write-Info "Port 3000 is occupied by PID $($port3000.Pid). Automatically stopping stale process..."
        Stop-Process -Id $port3000.Pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 600
    }
}

# Ensure log directory
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

$DjangoOutLog = Join-Path $LogsDir "django_out.log"
$DjangoErrLog = Join-Path $LogsDir "django_err.log"
$NextOutLog = Join-Path $LogsDir "nextjs_out.log"
$NextErrLog = Join-Path $LogsDir "nextjs_err.log"

# Clean old logs
Remove-Item $DjangoOutLog, $DjangoErrLog, $NextOutLog, $NextErrLog -Force -ErrorAction SilentlyContinue

# 3. Start Django REST Backend (:8000)
Write-Info "Starting Django REST backend on port 8000..."
$djangoProc = Start-Process -FilePath $PythonExe `
    -ArgumentList "manage.py runserver 127.0.0.1:8000 --noreload" `
    -WorkingDirectory $ScriptDir `
    -RedirectStandardOutput $DjangoOutLog `
    -RedirectStandardError $DjangoErrLog `
    -PassThru

$djangoProc.Id | Out-File -FilePath $DjangoPidFile -Force
Write-Info "Django started with PID: $($djangoProc.Id)"

# 4. Start Next.js Frontend (:3000)
Write-Info "Starting Next.js frontend on port 3000..."
$nextProc = Start-Process -FilePath $NpmCmd `
    -ArgumentList "run dev" `
    -WorkingDirectory $WebDir `
    -RedirectStandardOutput $NextOutLog `
    -RedirectStandardError $NextErrLog `
    -PassThru

$nextProc.Id | Out-File -FilePath $NextPidFile -Force
Write-Info "Next.js started with PID: $($nextProc.Id)"

# 5. Bounded Health Checks
Write-Info "Waiting for services to become healthy (bounded retry max ${TimeoutSeconds}s)..."

$DjangoHealthUrl = "http://127.0.0.1:8000/api/v1/health/"
$NextHealthUrl = "http://localhost:3000"

$djangoHealthy = $false
$nextHealthy = $false

$elapsed = 0
while ($elapsed -lt $TimeoutSeconds) {
    Start-Sleep -Seconds 1
    $elapsed++

    # Check Django health
    if (-not $djangoHealthy) {
        try {
            $resp = Invoke-RestMethod -Uri $DjangoHealthUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            if ($resp.status -eq "healthy") {
                $djangoHealthy = $true
                Write-Success "Django REST API is healthy at $DjangoHealthUrl (in ${elapsed}s)"
            }
        } catch {
            # Still booting
        }
    }

    # Check Next.js health
    if (-not $nextHealthy) {
        try {
            $resp = Invoke-WebRequest -Uri $NextHealthUrl -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $nextHealthy = $true
                Write-Success "Next.js frontend is accessible at $NextHealthUrl (in ${elapsed}s)"
            }
        } catch {
            # Still booting
        }
    }

    if ($djangoHealthy -and $nextHealthy) {
        break
    }

    # Detect unexpected early exit
    if ($djangoProc.HasExited) {
        Write-ErrorMsg "Django process terminated unexpectedly with exit code $($djangoProc.ExitCode)."
        if (Test-Path $DjangoErrLog) {
            Get-Content $DjangoErrLog -Tail 15 | ForEach-Object { Write-ErrorMsg "  $_" }
        }
        Stop-ArchonServices
        exit 1
    }

    if ($nextProc.HasExited) {
        Write-ErrorMsg "Next.js process terminated unexpectedly with exit code $($nextProc.ExitCode)."
        if (Test-Path $NextErrLog) {
            Get-Content $NextErrLog -Tail 15 | ForEach-Object { Write-ErrorMsg "  $_" }
        }
        Stop-ArchonServices
        exit 1
    }
}

if (-not $djangoHealthy -or -not $nextHealthy) {
    Write-ErrorMsg "Startup health checks timed out after ${TimeoutSeconds}s."
    if (-not $djangoHealthy) { Write-ErrorMsg "Django API failed to respond at $DjangoHealthUrl" }
    if (-not $nextHealthy) { Write-ErrorMsg "Next.js frontend failed to respond at $NextHealthUrl" }
    Write-Info "Inspect logs in: $LogsDir"
    Stop-ArchonServices
    exit 1
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         ARCHON 2.0 IS LIVE AND FULLY HEALTHY!           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Dashboard:       http://localhost:3000" -ForegroundColor White
Write-Host "  REST API:        http://127.0.0.1:8000/api/v1/health/" -ForegroundColor White
Write-Host "  Django PID:      $($djangoProc.Id)" -ForegroundColor DarkGray
Write-Host "  Next.js PID:     $($nextProc.Id)" -ForegroundColor DarkGray
Write-Host ""

if ($Detach) {
    Write-Host "  Running in detached background mode." -ForegroundColor DarkGray
    Write-Host "  To stop services, execute: .\stop_archon.bat" -ForegroundColor Yellow
    exit 0
}

Write-Host "  Streaming unified logs below in this terminal." -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop both backend and frontend." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

$dLast = 0
$nLast = 0

try {
    while ($true) {
        if ($djangoProc.HasExited) {
            Write-ErrorMsg "Django backend exited (code $($djangoProc.ExitCode))."
            break
        }
        if ($nextProc.HasExited) {
            Write-ErrorMsg "Next.js frontend exited (code $($nextProc.ExitCode))."
            break
        }

        # Stream backend logs
        if (Test-Path $DjangoErrLog) {
            $dContent = Get-Content $DjangoErrLog -ErrorAction SilentlyContinue
            if ($dContent -and $dContent.Count -gt $dLast) {
                for ($i = $dLast; $i -lt $dContent.Count; $i++) {
                    Write-Host "[backend]  $($dContent[$i])" -ForegroundColor Green
                }
                $dLast = $dContent.Count
            }
        }

        # Stream frontend logs
        if (Test-Path $NextOutLog) {
            $nContent = Get-Content $NextOutLog -ErrorAction SilentlyContinue
            if ($nContent -and $nContent.Count -gt $nLast) {
                for ($i = $nLast; $i -lt $nContent.Count; $i++) {
                    Write-Host "[frontend] $($nContent[$i])" -ForegroundColor Cyan
                }
                $nLast = $nContent.Count
            }
        }

        Start-Sleep -Milliseconds 400
    }
}
finally {
    Stop-ArchonServices
}
