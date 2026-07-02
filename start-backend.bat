@echo off
setlocal

cd /d "%~dp0backend"
echo Starting backend on http://127.0.0.1:5000
set "OPENBLAS_NUM_THREADS=1"
set "OMP_NUM_THREADS=1"
set "MKL_NUM_THREADS=1"
"%~dp0.venv\Scripts\python.exe" app.py

endlocal
