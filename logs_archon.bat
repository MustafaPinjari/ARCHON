@echo off
REM ARCHON 2.0 — Live Log Streamer Launcher
setlocal
set SCRIPT_DIR=%~dp0
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%logs_archon.ps1"
endlocal
