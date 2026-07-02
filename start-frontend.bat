@echo off
setlocal

cd /d "%~dp0frontend"
echo Starting frontend on http://localhost:3000
set "BROWSER=none"
set "GENERATE_SOURCEMAP=false"
set "DISABLE_ESLINT_PLUGIN=true"
set "FAST_REFRESH=false"
set "NODE_OPTIONS=--max-old-space-size=4096"
call npm start

endlocal
