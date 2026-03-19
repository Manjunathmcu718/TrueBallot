@echo off
setlocal

echo Opening backend and frontend in separate windows...
start "Voter Auth Backend" cmd /k "%~dp0start-backend.bat"
start "Voter Auth Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:3000
echo.
echo Keep both terminal windows open while using the app.

endlocal
