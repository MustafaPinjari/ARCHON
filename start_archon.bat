@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
"%SCRIPT_DIR%.venv\Scripts\python.exe" "%SCRIPT_DIR%dev.py" %*
set "EXIT_CODE=%ERRORLEVEL%"

exit /b %EXIT_CODE%
