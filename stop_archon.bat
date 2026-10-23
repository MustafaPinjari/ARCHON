@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start_archon.ps1" -Stop
set "EXIT_CODE=%ERRORLEVEL%"

exit /b %EXIT_CODE%
