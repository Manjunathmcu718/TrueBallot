@echo off
setlocal

cd /d "%~dp0backend"
echo Starting backend on http://127.0.0.1:5000
"%~dp0.venv\Scripts\python.exe" app.py

endlocal
